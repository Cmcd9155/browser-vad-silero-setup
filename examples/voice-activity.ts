export const VOICE_SPEECH_THRESHOLD = 0.012;
export const VOICE_PREROLL_MS = 320;
export const VOICE_TAIL_MS = 700;
export const VOICE_DEAD_SPOT_BUFFER_MS = 60 * 1000;
export const VOICE_RECORDER_CHUNK_MS = 100;
export const VOICE_SERVER_VAD_SILENCE_PAD_MS = 1600;
export const VOICE_VAD_POSITIVE_THRESHOLD = 0.35;
export const VOICE_VAD_NEGATIVE_THRESHOLD = 0.2;
export const VOICE_BARGE_IN_THRESHOLD = 0.68;
export const VOICE_BARGE_IN_STREAK_MS = 60;

export type VoiceGateState = {
  preRoll: ArrayBuffer[];
  speaking: boolean;
  tailUntil: number;
};

export type VoiceGateDecision = {
  chunks: ArrayBuffer[];
  speechDetected: boolean;
  speaking: boolean;
};

export function createVoiceGateState(): VoiceGateState {
  return {
    preRoll: [],
    speaking: false,
    tailUntil: 0,
  };
}

export function resetVoiceGateState(state: VoiceGateState) {
  state.preRoll = [];
  state.speaking = false;
  state.tailUntil = 0;
}

export function processVoiceGateChunk(
  state: VoiceGateState,
  chunk: ArrayBuffer,
  level: number,
  nowMs: number,
  chunkMs: number,
  options: {
    threshold?: number;
    preRollMs?: number;
    tailMs?: number;
  } = {},
): VoiceGateDecision {
  const threshold = options.threshold ?? VOICE_SPEECH_THRESHOLD;
  const preRollMs = options.preRollMs ?? VOICE_PREROLL_MS;
  const tailMs = options.tailMs ?? VOICE_TAIL_MS;
  const maxPreRollChunks = Math.max(1, Math.ceil(preRollMs / Math.max(1, chunkMs)));
  const speechDetected = level >= threshold;

  if (speechDetected) {
    const chunks = state.speaking ? [chunk] : [...state.preRoll, chunk];
    state.preRoll = [];
    state.speaking = true;
    state.tailUntil = nowMs + tailMs;
    return { chunks, speechDetected: true, speaking: true };
  }

  if (state.speaking && nowMs <= state.tailUntil) {
    return { chunks: [chunk], speechDetected: false, speaking: true };
  }

  state.speaking = false;
  state.preRoll.push(chunk);
  if (state.preRoll.length > maxPreRollChunks) {
    state.preRoll.splice(0, state.preRoll.length - maxPreRollChunks);
  }

  return { chunks: [], speechDetected: false, speaking: false };
}

export function createPcm16SilenceChunks(sampleRate: number, chunkMs: number, durationMs: number) {
  const chunks: ArrayBuffer[] = [];
  const safeSampleRate = Math.max(1, Math.trunc(sampleRate));
  const safeChunkMs = Math.max(1, Math.trunc(chunkMs));
  let remainingMs = Math.max(0, Math.trunc(durationMs));

  while (remainingMs > 0) {
    const thisChunkMs = Math.min(safeChunkMs, remainingMs);
    const samples = Math.max(1, Math.round((safeSampleRate * thisChunkMs) / 1000));
    chunks.push(new ArrayBuffer(samples * 2));
    remainingMs -= thisChunkMs;
  }

  return chunks;
}
