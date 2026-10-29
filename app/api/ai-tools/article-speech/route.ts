import { createHash, randomBytes, randomUUID } from "node:crypto";
import * as tls from "node:tls";

export const maxDuration = 60;

let edgeBlockedUntil = 0;
let pollyBlockedUntil = 0;

type VoiceSpec = {
  edgeVoice: string;
  edgeLang: string;
  pollyVoice: string;
  googleLang: string;
  openaiVoice: "nova" | "onyx" | "shimmer" | "echo" | "fable" | "alloy";
  gender: "female" | "male";
  pitchShift: string;
};

const VOICE_MAP: Record<string, VoiceSpec> = {
  "gmw/en-US": {
    edgeVoice: "en-US-AriaNeural",
    edgeLang: "en-US",
    pollyVoice: "Joanna",
    googleLang: "en-US",
    openaiVoice: "nova",
    gender: "female",
    pitchShift: "+0Hz",
  },
  "gmw/en-US-male": {
    edgeVoice: "en-US-GuyNeural",
    edgeLang: "en-US",
    pollyVoice: "Matthew",
    googleLang: "en-US",
    openaiVoice: "onyx",
    gender: "male",
    pitchShift: "-2Hz",
  },
  "gmw/en": {
    edgeVoice: "en-GB-RyanNeural",
    edgeLang: "en-GB",
    pollyVoice: "Brian",
    googleLang: "en-GB",
    openaiVoice: "fable",
    gender: "male",
    pitchShift: "-2Hz",
  },
  "gmw/en-GB-female": {
    edgeVoice: "en-GB-SoniaNeural",
    edgeLang: "en-GB",
    pollyVoice: "Amy",
    googleLang: "en-GB",
    openaiVoice: "shimmer",
    gender: "female",
    pitchShift: "+0Hz",
  },
  "gmw/en-IN": {
    edgeVoice: "en-IN-NeerjaNeural",
    edgeLang: "en-IN",
    pollyVoice: "Raveena",
    googleLang: "en-IN",
    openaiVoice: "alloy",
    gender: "female",
    pitchShift: "+0Hz",
  },
  "gmw/en-AU": {
    edgeVoice: "en-AU-WilliamNeural",
    edgeLang: "en-AU",
    pollyVoice: "Russell",
    googleLang: "en-AU",
    openaiVoice: "echo",
    gender: "male",
    pitchShift: "-2Hz",
  },
};

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSecMsGec() {
  const ticks = Math.floor(Date.now() / 1000) + 11644473600;
  const rounded = ticks - (ticks % 300);
  const strToHash = `${rounded}00000006A5AA1D4EAFF4E9FB37E23D68491D6F4`;
  return createHash("sha256")
    .update(strToHash, "ascii")
    .digest("hex")
    .toUpperCase();
}

function encodeWsFrame(opcode: number, payload: Buffer) {
  const mask = randomBytes(4);
  const len = payload.length;
  let header: Buffer;
  if (len < 126) {
    header = Buffer.alloc(6);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | len;
    mask.copy(header, 2);
  } else if (len < 65536) {
    header = Buffer.alloc(8);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(len, 2);
    mask.copy(header, 4);
  } else {
    header = Buffer.alloc(14);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(len), 2);
    mask.copy(header, 10);
  }
  const masked = Buffer.alloc(len);
  for (let i = 0; i < len; i++) {
    masked[i] = payload[i] ^ mask[i & 3];
  }
  return Buffer.concat([header, masked]);
}

function synthesizeEdgeNeural(
  text: string,
  spec: VoiceSpec,
  rate: number,
  timeoutMs = 4200,
): Promise<Buffer> {
  if (Date.now() < edgeBlockedUntil) {
    return Promise.reject(new Error("Edge circuit open"));
  }
  return new Promise((resolve, reject) => {
    const connId = randomUUID().replace(/-/g, "");
    const reqId = randomUUID().replace(/-/g, "");
    const gec = generateSecMsGec();
    const muid = randomBytes(16).toString("hex").toUpperCase();
    const wsKey = randomBytes(16).toString("base64");
    const ratePct = rate <= 120 ? "-20%" : rate >= 200 ? "+20%" : "+0%";

    const path =
      `/consumer/speech/synthesize/readaloud/edge/v1` +
      `?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4` +
      `&Sec-MS-GEC=${gec}` +
      `&Sec-MS-GEC-Version=1-130.0.2849.68` +
      `&ConnectionId=${connId}`;

    let settled = false;
    const audioChunks: Buffer[] = [];
    let rxBuffer = Buffer.alloc(0);
    let fragmentBuffers: Buffer[] = [];
    let fragmentOpcode = 0;
    let upgraded = false;

    const socket = tls.connect({
      host: "speech.platform.bing.com",
      port: 443,
      servername: "speech.platform.bing.com",
    });

    const finish = (err?: Error, data?: Buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        socket.destroy();
      } catch {}
      if (err) {
        edgeBlockedUntil = Date.now() + 5 * 60 * 1000;
        reject(err);
      } else {
        resolve(data!);
      }
    };

    const timer = setTimeout(
      () => finish(new Error("Edge neural synthesis timed out")),
      timeoutMs,
    );

    socket.on("error", (err) => finish(err));
    socket.on("close", () => {
      if (!settled) {
        if (audioChunks.length > 0)
          finish(undefined, Buffer.concat(audioChunks));
        else finish(new Error("Socket closed before audio completed"));
      }
    });

    socket.on("secureConnect", () => {
      const handshake = [
        `GET ${path} HTTP/1.1`,
        `Host: speech.platform.bing.com`,
        `Upgrade: websocket`,
        `Connection: Upgrade`,
        `Pragma: no-cache`,
        `Cache-Control: no-cache`,
        `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0`,
        `Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold`,
        `Cookie: muid=${muid};`,
        `Sec-WebSocket-Version: 13`,
        `Sec-WebSocket-Key: ${wsKey}`,
        `\r\n`,
      ].join("\r\n");
      socket.write(handshake);
    });

    socket.on("data", (chunk: Buffer) => {
      rxBuffer = Buffer.concat([rxBuffer, chunk]);
      if (!upgraded) {
        const headerEnd = rxBuffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;
        const statusLine = rxBuffer
          .subarray(0, headerEnd)
          .toString("utf8")
          .split("\r\n")[0];
        if (!statusLine.includes("101")) {
          finish(new Error(`Unexpected handshake status: ${statusLine}`));
          return;
        }
        upgraded = true;
        rxBuffer = rxBuffer.subarray(headerEnd + 4);

        const nowStr = new Date().toUTCString();
        const configMsg =
          `X-Timestamp:${nowStr}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: {
                    sentenceBoundaryEnabled: "false",
                    wordBoundaryEnabled: "false",
                  },
                  outputFormat: "audio-24khz-48kbitrate-mono-mp3",
                },
              },
            },
          });

        const ssml =
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${spec.edgeLang}'>` +
          `<voice name='${spec.edgeVoice}'>` +
          `<prosody pitch='${spec.pitchShift}' rate='${ratePct}' volume='+0%'>` +
          `${escapeXml(text)}` +
          `</prosody></voice></speak>`;

        const ssmlMsg =
          `X-RequestId:${reqId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${nowStr}\r\n` +
          `Path:ssml\r\n\r\n` +
          ssml;

        socket.write(encodeWsFrame(1, Buffer.from(configMsg, "utf8")));
        socket.write(encodeWsFrame(1, Buffer.from(ssmlMsg, "utf8")));
      }

      while (rxBuffer.length >= 2) {
        const byte0 = rxBuffer[0];
        const byte1 = rxBuffer[1];
        const fin = (byte0 & 0x80) !== 0;
        const rawOpcode = byte0 & 0x0f;
        const isMasked = (byte1 & 0x80) !== 0;
        let payloadLen = byte1 & 0x7f;
        let offset = 2;

        if (payloadLen === 126) {
          if (rxBuffer.length < 4) return;
          payloadLen = rxBuffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (rxBuffer.length < 10) return;
          payloadLen = Number(rxBuffer.readBigUInt64BE(2));
          offset = 10;
        }

        const maskOffset = isMasked ? 4 : 0;
        if (rxBuffer.length < offset + maskOffset + payloadLen) return;

        let payload = rxBuffer.subarray(
          offset + maskOffset,
          offset + maskOffset + payloadLen,
        );
        if (isMasked) {
          const mask = rxBuffer.subarray(offset, offset + 4);
          const unmasked = Buffer.alloc(payloadLen);
          for (let i = 0; i < payloadLen; i++)
            unmasked[i] = payload[i] ^ mask[i & 3];
          payload = unmasked;
        }
        rxBuffer = rxBuffer.subarray(offset + maskOffset + payloadLen);

        if (rawOpcode === 9) {
          socket.write(encodeWsFrame(10, payload));
          continue;
        }
        if (rawOpcode === 8) {
          if (audioChunks.length > 0)
            finish(undefined, Buffer.concat(audioChunks));
          else finish(new Error("WebSocket closed by remote server"));
          return;
        }

        let messagePayload = payload;
        let opcode = rawOpcode;
        if (!fin) {
          if (rawOpcode !== 0) fragmentOpcode = rawOpcode;
          fragmentBuffers.push(Buffer.from(payload));
          continue;
        } else if (rawOpcode === 0 && fragmentBuffers.length > 0) {
          fragmentBuffers.push(Buffer.from(payload));
          messagePayload = Buffer.concat(fragmentBuffers);
          opcode = fragmentOpcode;
          fragmentBuffers = [];
        }

        if (opcode === 2 && messagePayload.length >= 2) {
          const headerLen = messagePayload.readUInt16BE(0);
          if (messagePayload.length >= 2 + headerLen) {
            const headerText = messagePayload
              .subarray(2, 2 + headerLen)
              .toString("utf8");
            if (headerText.includes("Path:audio")) {
              const audioBytes = messagePayload.subarray(2 + headerLen);
              if (audioBytes.length > 0)
                audioChunks.push(Buffer.from(audioBytes));
            }
          }
        } else if (opcode === 1) {
          const textMsg = messagePayload.toString("utf8");
          if (textMsg.includes("Path:turn.end")) {
            if (audioChunks.length > 0) {
              finish(undefined, Buffer.concat(audioChunks));
            } else {
              finish(new Error("Edge neural returned empty audio"));
            }
            return;
          }
        }
      }
    });
  });
}

function splitSentenceChunks(text: string, maxLen = 175): string[] {
  const pieces: string[] = [];
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?।;:])\s+/);
  let current = "";
  for (const s of sentences) {
    if (!s) continue;
    if ((current + " " + s).trim().length <= maxLen) {
      current = (current + " " + s).trim();
    } else {
      if (current) pieces.push(current);
      if (s.length <= maxLen) {
        current = s;
      } else {
        let rest = s;
        while (rest.length > maxLen) {
          const idx = rest.lastIndexOf(" ", maxLen);
          const cut = idx > 20 ? idx : maxLen;
          pieces.push(rest.slice(0, cut).trim());
          rest = rest.slice(cut).trim();
        }
        current = rest;
      }
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

async function synthesizeOpenAiTts(
  text: string,
  spec: VoiceSpec,
  rate: number,
  signal: AbortSignal,
): Promise<Buffer[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenAI key not configured");
  const speed = rate <= 120 ? 0.85 : rate >= 200 ? 1.2 : 1.0;
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text.slice(0, 4000),
      voice: spec.openaiVoice,
      response_format: "mp3",
      speed,
    }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
  });
  if (!res.ok) throw new Error(`OpenAI TTS HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error("OpenAI TTS returned empty buffer");
  return [buf];
}

async function synthesizePollyTts(
  text: string,
  spec: VoiceSpec,
  signal: AbortSignal,
): Promise<Buffer[]> {
  if (Date.now() < pollyBlockedUntil) {
    throw new Error("Polly circuit open");
  }
  const pieces = splitSentenceChunks(text, 260);
  const results: Buffer[] = new Array(pieces.length);
  const concurrency = 4;
  try {
    for (let i = 0; i < pieces.length; i += concurrency) {
      signal.throwIfAborted();
      const batch = pieces.slice(i, i + concurrency);
      const fetched = await Promise.all(
        batch.map(async (piece) => {
          const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(spec.pollyVoice)}&text=${encodeURIComponent(piece)}`;
          const res = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            },
            signal: AbortSignal.any([signal, AbortSignal.timeout(4500)]),
          });
          if (!res.ok) throw new Error(`Polly TTS HTTP ${res.status}`);
          const arr = Buffer.from(await res.arrayBuffer());
          if (arr.length < 100)
            throw new Error("Polly TTS returned empty buffer");
          return arr;
        }),
      );
      for (let j = 0; j < fetched.length; j++) {
        results[i + j] = fetched[j];
      }
    }
    if (!results.length) throw new Error("Empty Polly TTS output");
    return results;
  } catch (err) {
    pollyBlockedUntil = Date.now() + 5 * 60 * 1000;
    throw err;
  }
}

async function fetchSingleGoogleChunk(
  piece: string,
  lang: string,
  speed: string,
  signal: AbortSignal,
): Promise<Buffer> {
  const urls = [
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(lang)}&ttsspeed=${speed}&q=${encodeURIComponent(piece)}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&ttsspeed=${speed}&q=${encodeURIComponent(piece)}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.any([signal, AbortSignal.timeout(5500)]),
      });
      if (res.ok) {
        const arr = Buffer.from(await res.arrayBuffer());
        if (arr.length > 100) return arr;
      }
    } catch {
      signal.throwIfAborted();
    }
  }
  throw new Error("Google TTS chunk request failed");
}

async function synthesizeGoogleTts(
  text: string,
  spec: VoiceSpec,
  rate: number,
  signal: AbortSignal,
): Promise<Buffer[]> {
  const pieces = splitSentenceChunks(text, 175);
  const speed = rate <= 120 ? "0.75" : "1";
  const results: Buffer[] = new Array(pieces.length);
  const concurrency = 6;
  for (let i = 0; i < pieces.length; i += concurrency) {
    signal.throwIfAborted();
    const batch = pieces.slice(i, i + concurrency);
    const fetched = await Promise.all(
      batch.map((piece) =>
        fetchSingleGoogleChunk(piece, spec.googleLang, speed, signal),
      ),
    );
    for (let j = 0; j < fetched.length; j++) {
      results[i + j] = fetched[j];
    }
  }
  if (!results.length) throw new Error("Empty Google TTS output");
  return results;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = typeof body?.text === "string" ? body.text.trim() : "";
    const voice = typeof body?.voice === "string" ? body.voice : "gmw/en-US";
    const rate = typeof body?.rate === "number" ? body.rate : 160;
    const wantsJson =
      body?.format === "chunks" ||
      (request.headers.get("accept") || "").includes("application/json");

    if (!rawText || rawText.length > 4500) {
      return Response.json(
        {
          error: {
            message: "Supply between 1 and 4,500 characters per section.",
          },
        },
        { status: 422 },
      );
    }
    const spec = VOICE_MAP[voice] || VOICE_MAP["gmw/en-US"];

    const respond = (engine: string, chunks: Buffer[]) => {
      if (wantsJson) {
        return Response.json(
          {
            engine,
            gender: spec.gender,
            chunks: chunks.map((b) => b.toString("base64")),
          },
          {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }
      return new Response(new Uint8Array(Buffer.concat(chunks)), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
          "X-Speech-Engine": engine,
          "X-Voice-Gender": spec.gender,
        },
      });
    };

    // Tier 1: OpenAI TTS if configured (fastest & highest quality when key is set)
    try {
      const chunks = await synthesizeOpenAiTts(
        rawText,
        spec,
        rate,
        request.signal,
      );
      return respond("openai-tts", chunks);
    } catch {}

    // Tier 2: Microsoft Edge Neural TTS (with fast circuit-breaker if datacenter IP is blocked)
    try {
      const mp3 = await synthesizeEdgeNeural(rawText, spec, rate, 4200);
      return respond("edge-neural", [mp3]);
    } catch {}

    // Tier 3: StreamElements / Amazon Polly Natural Voices (with fast circuit-breaker)
    try {
      const chunks = await synthesizePollyTts(rawText, spec, request.signal);
      return respond("polly-neural", chunks);
    } catch {}

    // Tier 4: Google Translate Neural TTS (parallel sentence chunks, 6-way concurrency)
    const chunks = await synthesizeGoogleTts(
      rawText,
      spec,
      rate,
      request.signal,
    );
    return respond("google-tts", chunks);
  } catch {
    return Response.json(
      { error: { message: "Cloud speech synthesis unavailable." } },
      { status: 503 },
    );
  }
}
