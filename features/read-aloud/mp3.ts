/** Encode real PCM in a separate, cancellable worker. No audio leaves the browser. */
export function encodeMp3(
  wav: Uint8Array<ArrayBuffer>,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<ArrayBuffer> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const worker = new Worker("/vendor/lamejs/encode-worker.js");
    let settled = false;
    const finish = (error?: Error, bytes?: ArrayBuffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      worker.terminate();
      if (error) reject(error);
      else resolve(bytes!);
    };
    const cancel = () => finish(new Error("Audio generation cancelled."));
    const timer = setTimeout(
      () =>
        finish(
          new Error("MP3 encoding timed out. Select less text and retry."),
        ),
      180000,
    );
    signal.addEventListener("abort", cancel, { once: true });
    worker.onerror = () =>
      finish(
        new Error(
          "The MP3 encoder could not load or process the audio. Retry in a current browser.",
        ),
      );
    worker.onmessage = ({ data }) => {
      if (data?.error) finish(new Error(data.error));
      else if (data?.bytes instanceof ArrayBuffer && data.bytes.byteLength > 0)
        finish(undefined, data.bytes);
      else if (typeof data?.progress === "number") onProgress(data.progress);
      else finish(new Error("The MP3 encoder returned an invalid response."));
    };
    try {
      signal.throwIfAborted();
      worker.postMessage({ wav: wav.buffer }, [wav.buffer]);
    } catch (error) {
      finish(
        error instanceof Error ? error : new Error("MP3 encoding failed."),
      );
    }
  });
}
