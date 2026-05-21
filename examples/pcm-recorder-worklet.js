class PcmRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this.pending = [];
    this.pendingLength = 0;
    this.chunkSize = Math.floor(sampleRate * 0.1);
    this.frameCount = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];

    if (!input) {
      return true;
    }

    let sum = 0;
    for (let index = 0; index < input.length; index += 1) {
      sum += input[index] * input[index];
    }

    const level = Math.min(1, Math.sqrt(sum / input.length) * 8);
    this.frameCount += 1;

    const copy = new Float32Array(input);
    this.pending.push(copy);
    this.pendingLength += copy.length;

    if (this.pendingLength >= this.chunkSize) {
      const pcm = new Int16Array(this.pendingLength);
      let offset = 0;

      for (const chunk of this.pending) {
        for (let index = 0; index < chunk.length; index += 1) {
          const sample = Math.max(-1, Math.min(1, chunk[index]));
          pcm[offset] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          offset += 1;
        }
      }

      this.port.postMessage(
        {
          type: "audio",
          audio: pcm.buffer,
          level,
        },
        [pcm.buffer],
      );

      this.pending = [];
      this.pendingLength = 0;
    } else if (this.frameCount % 3 === 0) {
      this.port.postMessage({ type: "level", level });
    }

    return true;
  }
}

registerProcessor("pcm-recorder", PcmRecorder);
