/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import { LRN } from '@tensorflow/tfjs-core';
let wasmLRN;
function setup(backend) {
  wasmLRN = backend.wasm.cwrap(LRN, null, [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number', // beta
  ]);
}
export function lrn(args) {
  const { inputs, backend, attrs } = args;
  const { x } = inputs;
  const { depthRadius, bias, alpha, beta } = attrs;
  if (x.dtype !== 'float32') {
    throw new Error('LRN error: x must have dtype float32');
  }
  const out = backend.makeOutput(x.shape, x.dtype);
  wasmLRN(
    backend.dataIdMap.get(x.dataId).id,
    backend.dataIdMap.get(out.dataId).id,
    /*channels=*/ x.shape[3],
    depthRadius,
    bias,
    alpha,
    beta,
  );
  return out;
}
export const lrnConfig = {
  kernelName: LRN,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: lrn,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTFJOLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1iYWNrZW5kLXdhc20vc3JjL2tlcm5lbHMvTFJOLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBMkIsR0FBRyxFQUFrQyxNQUFNLHVCQUF1QixDQUFDO0FBSXJHLElBQUksT0FFa0QsQ0FBQztBQUV2RCxTQUFTLEtBQUssQ0FBQyxPQUFvQjtJQUNqQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRLEVBQUcsT0FBTztLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUluQjtJQUNDLE1BQU0sRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBQyxHQUFHLElBQUksQ0FBQztJQUN0QyxNQUFNLEVBQUMsQ0FBQyxFQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ25CLE1BQU0sRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsR0FBRyxLQUFLLENBQUM7SUFFL0MsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtRQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7S0FDekQ7SUFFRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpELE9BQU8sQ0FDSCxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUNsQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtJQUNwQyxhQUFhLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDdkIsV0FBVyxFQUNYLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxDQUNQLENBQUM7SUFDRixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQWlCO0lBQ3JDLFVBQVUsRUFBRSxHQUFHO0lBQ2YsV0FBVyxFQUFFLE1BQU07SUFDbkIsU0FBUyxFQUFFLEtBQUs7SUFDaEIsVUFBVSxFQUFFLEdBQTRCO0NBQ3pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMyBHb29nbGUgTExDLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7S2VybmVsQ29uZmlnLCBLZXJuZWxGdW5jLCBMUk4sIExSTkF0dHJzLCBMUk5JbnB1dHMsIFRlbnNvckluZm99IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmxldCB3YXNtTFJOOiAoXG4gICAgeElkOiBudW1iZXIsIG91dElkOiBudW1iZXIsIGNoYW5uZWxzOiBudW1iZXIsIGRlcHRoUmFkaXVzOiBudW1iZXIsXG4gICAgYmlhczogbnVtYmVyLCBhbHBoYTogbnVtYmVyLCBiZXRhOiBudW1iZXIpID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIHNldHVwKGJhY2tlbmQ6IEJhY2tlbmRXYXNtKSB7XG4gIHdhc21MUk4gPSBiYWNrZW5kLndhc20uY3dyYXAoTFJOLCBudWxsLCBbXG4gICAgJ251bWJlcicsICAvLyB4SWRcbiAgICAnbnVtYmVyJywgIC8vIG91dElkXG4gICAgJ251bWJlcicsICAvLyBjaGFubmVsc1xuICAgICdudW1iZXInLCAgLy8gZGVwdGhSYWRpdXNcbiAgICAnbnVtYmVyJywgIC8vIGJpYXNcbiAgICAnbnVtYmVyJywgIC8vIGFscGhhXG4gICAgJ251bWJlcicsICAvLyBiZXRhXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbHJuKGFyZ3M6IHtcbiAgaW5wdXRzOiBMUk5JbnB1dHMsXG4gIGF0dHJzOiBMUk5BdHRycyxcbiAgYmFja2VuZDogQmFja2VuZFdhc20sXG59KTogVGVuc29ySW5mbyB7XG4gIGNvbnN0IHtpbnB1dHMsIGJhY2tlbmQsIGF0dHJzfSA9IGFyZ3M7XG4gIGNvbnN0IHt4fSA9IGlucHV0cztcbiAgY29uc3Qge2RlcHRoUmFkaXVzLCBiaWFzLCBhbHBoYSwgYmV0YX0gPSBhdHRycztcblxuICBpZiAoeC5kdHlwZSAhPT0gJ2Zsb2F0MzInKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdMUk4gZXJyb3I6IHggbXVzdCBoYXZlIGR0eXBlIGZsb2F0MzInKTtcbiAgfVxuXG4gIGNvbnN0IG91dCA9IGJhY2tlbmQubWFrZU91dHB1dCh4LnNoYXBlLCB4LmR0eXBlKTtcblxuICB3YXNtTFJOKFxuICAgICAgYmFja2VuZC5kYXRhSWRNYXAuZ2V0KHguZGF0YUlkKS5pZCxcbiAgICAgIGJhY2tlbmQuZGF0YUlkTWFwLmdldChvdXQuZGF0YUlkKS5pZCxcbiAgICAgIC8qY2hhbm5lbHM9Ki94LnNoYXBlWzNdLFxuICAgICAgZGVwdGhSYWRpdXMsXG4gICAgICBiaWFzLFxuICAgICAgYWxwaGEsXG4gICAgICBiZXRhLFxuICApO1xuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgbHJuQ29uZmlnOiBLZXJuZWxDb25maWcgPSB7XG4gIGtlcm5lbE5hbWU6IExSTixcbiAgYmFja2VuZE5hbWU6ICd3YXNtJyxcbiAgc2V0dXBGdW5jOiBzZXR1cCxcbiAga2VybmVsRnVuYzogbHJuIGFzIHVua25vd24gYXMgS2VybmVsRnVuY1xufTtcbiJdfQ==
