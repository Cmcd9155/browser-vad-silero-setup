import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rootPath = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(rootPath, "public", "vad");

const files = [
  ["@ricky0123/vad-web/dist/silero_vad_v5.onnx", "silero_vad_v5.onnx"],
  ["@ricky0123/vad-web/dist/silero_vad_legacy.onnx", "silero_vad_legacy.onnx"],
  ["@ricky0123/vad-web/dist/vad.worklet.bundle.min.js", "vad.worklet.bundle.min.js"],
  ["onnxruntime-web/ort-wasm-simd-threaded.mjs", "ort-wasm-simd-threaded.mjs"],
  ["onnxruntime-web/ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.wasm"],
  ["onnxruntime-web/ort-wasm-simd-threaded.asyncify.mjs", "ort-wasm-simd-threaded.asyncify.mjs"],
  ["onnxruntime-web/ort-wasm-simd-threaded.asyncify.wasm", "ort-wasm-simd-threaded.asyncify.wasm"],
  ["onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs", "ort-wasm-simd-threaded.jsep.mjs"],
  ["onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm", "ort-wasm-simd-threaded.jsep.wasm"],
  ["onnxruntime-web/ort-wasm-simd-threaded.jspi.mjs", "ort-wasm-simd-threaded.jspi.mjs"],
  ["onnxruntime-web/ort-wasm-simd-threaded.jspi.wasm", "ort-wasm-simd-threaded.jspi.wasm"],
];

mkdirSync(outDir, { recursive: true });

for (const [specifier, filename] of files) {
  copyFileSync(require.resolve(specifier), join(outDir, filename));
  console.log(`copied ${filename}`);
}
