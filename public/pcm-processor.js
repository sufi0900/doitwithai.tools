class PortfolioPCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const settings = options.processorOptions || {};
    this.inputSampleRate = settings.inputSampleRate || sampleRate;
    this.targetSampleRate = settings.targetSampleRate || 24000;
    this.carry = new Float32Array(0);
  }

  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (!input || input.length === 0) return true;

    const joined = new Float32Array(this.carry.length + input.length);
    joined.set(this.carry);
    joined.set(input, this.carry.length);
    const ratio = this.inputSampleRate / this.targetSampleRate;
    const outputLength = Math.floor(joined.length / ratio);
    if (outputLength === 0) {
      this.carry = joined;
      return true;
    }

    const pcm16 = new Int16Array(outputLength);
    for (let i = 0; i < outputLength; i += 1) {
      const sourceIndex = i * ratio;
      const low = Math.floor(sourceIndex);
      const high = Math.min(low + 1, joined.length - 1);
      const mix = sourceIndex - low;
      const sample = joined[low] * (1 - mix) + joined[high] * mix;
      pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
    }

    const consumed = Math.floor(outputLength * ratio);
    this.carry = joined.slice(consumed);
    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    return true;
  }
}

registerProcessor("portfolio-pcm-processor", PortfolioPCMProcessor);
