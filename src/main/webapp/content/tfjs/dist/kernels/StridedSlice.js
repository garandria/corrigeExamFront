/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
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
import { slice_util, StridedSlice, util } from '@tensorflow/tfjs-core';
import { reshape } from './Reshape';
import { slice } from './Slice';
let wasmStridedSlice;
function setup(backend) {
  wasmStridedSlice = backend.wasm.cwrap(StridedSlice, null /*void*/, [
    'number',
    'array',
    'number',
    'array',
    'array',
    'array',
    'array',
    'array',
    'number',
    'number', // outId
  ]);
}
export function stridedSlice(args) {
  const { backend, inputs, attrs } = args;
  const { x } = inputs;
  const { begin, end, strides, beginMask, endMask, ellipsisMask, newAxisMask, shrinkAxisMask } = attrs;
  const {
    finalShapeSparse,
    finalShape,
    isIdentity,
    sliceDim0,
    isSimpleSlice,
    begin: $begin,
    end: $end,
    strides: $strides,
  } = slice_util.sliceInfo(x.shape, begin, end, strides, beginMask, endMask, ellipsisMask, newAxisMask, shrinkAxisMask);
  let result;
  if (isIdentity) {
    // Optimization #1, slice is a no-op plus reshape
    result = reshape({ inputs: { x }, backend, attrs: { shape: finalShape } });
  } else if (sliceDim0 || isSimpleSlice) {
    // Optimization #2, slice is memory contiguous (only occurs in dim 0)
    util.assert(x.shape.length >= 1, () => `Input must have rank at least 1, got: ${x.shape.length}`);
    const size = slice_util.computeOutShape($begin, $end, $strides);
    // To tolerate begin[0] > end[0] (a 0-output slice), we min(begin, end).
    const sliced = slice({ inputs: { x }, backend, attrs: { begin: $begin, size } });
    result = reshape({ inputs: { x: sliced }, backend, attrs: { shape: finalShape } });
    backend.disposeData(sliced.dataId);
  } else {
    const out = backend.makeOutput(finalShapeSparse, 'float32');
    const xId = backend.dataIdMap.get(x.dataId).id;
    const xStridesBytes = new Uint8Array(new Int32Array(util.computeStrides(x.shape)).buffer);
    const beginBytes = new Uint8Array(new Int32Array($begin).buffer);
    const endBytes = new Uint8Array(new Int32Array($end).buffer);
    const stridesBytes = new Uint8Array(new Int32Array($strides).buffer);
    const outputShapeBytes = new Uint8Array(new Int32Array(finalShapeSparse).buffer);
    const outStridesBytes = new Uint8Array(new Int32Array(util.computeStrides(finalShapeSparse)).buffer);
    const outId = backend.dataIdMap.get(out.dataId).id;
    wasmStridedSlice(
      xId,
      xStridesBytes,
      x.shape.length,
      beginBytes,
      endBytes,
      stridesBytes,
      outputShapeBytes,
      outStridesBytes,
      finalShapeSparse.length,
      outId,
    );
    result = reshape({ inputs: { x: out }, backend, attrs: { shape: finalShape } });
    backend.disposeData(out.dataId);
  }
  return result;
}
export const stridedSliceConfig = {
  kernelName: StridedSlice,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: stridedSlice,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaWRlZFNsaWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1iYWNrZW5kLXdhc20vc3JjL2tlcm5lbHMvU3RyaWRlZFNsaWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBMkIsVUFBVSxFQUFFLFlBQVksRUFBcUQsSUFBSSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFHbEosT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTlCLElBQUksZ0JBSThDLENBQUM7QUFFbkQsU0FBUyxLQUFLLENBQUMsT0FBb0I7SUFDakMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDakUsUUFBUTtRQUNSLE9BQU87UUFDUCxRQUFRO1FBQ1IsT0FBTztRQUNQLE9BQU87UUFDUCxPQUFPO1FBQ1AsT0FBTztRQUNQLE9BQU87UUFDUCxRQUFRO1FBQ1IsUUFBUSxFQUFHLFFBQVE7S0FDcEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxZQUFZLENBQUMsSUFJNUI7SUFDQyxNQUFNLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsR0FBRyxJQUFJLENBQUM7SUFDdEMsTUFBTSxFQUFDLENBQUMsRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUVuQixNQUFNLEVBQ0osS0FBSyxFQUNMLEdBQUcsRUFDSCxPQUFPLEVBQ1AsU0FBUyxFQUNULE9BQU8sRUFDUCxZQUFZLEVBQ1osV0FBVyxFQUNYLGNBQWMsRUFDZixHQUFHLEtBQUssQ0FBQztJQUVWLE1BQU0sRUFDSixnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLFVBQVUsRUFDVixTQUFTLEVBQ1QsYUFBYSxFQUNi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Q0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUN0RSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZFLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBQyxNQUFNLEVBQUUsRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQUMsRUFBQyxDQUFDLENBQUM7UUFFMUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQWlCO0lBQzlDLFVBQVUsRUFBRSxZQUFZO0lBQ3hCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLFVBQVUsRUFBRSxZQUFxQztDQUNsRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjEgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQge0tlcm5lbENvbmZpZywgS2VybmVsRnVuYywgc2xpY2VfdXRpbCwgU3RyaWRlZFNsaWNlLCBTdHJpZGVkU2xpY2VBdHRycywgU3RyaWRlZFNsaWNlSW5wdXRzLCBUZW5zb3JJbmZvLCB1dGlsfSBmcm9tICdAdGVuc29yZmxvdy90ZmpzLWNvcmUnO1xuXG5pbXBvcnQge0JhY2tlbmRXYXNtfSBmcm9tICcuLi9iYWNrZW5kX3dhc20nO1xuaW1wb3J0IHtyZXNoYXBlfSBmcm9tICcuL1Jlc2hhcGUnO1xuaW1wb3J0IHtzbGljZX0gZnJvbSAnLi9TbGljZSc7XG5cbmxldCB3YXNtU3RyaWRlZFNsaWNlOiAoXG4gICAgeElkOiBudW1iZXIsIHhTdHJpZGVzQnl0ZXM6IFVpbnQ4QXJyYXksIHhSYW5rOiBudW1iZXIsXG4gICAgYmVnaW5CeXRlczogVWludDhBcnJheSwgZW5kQnl0ZXM6IFVpbnQ4QXJyYXksIHN0cmlkZXNCeXRlczogVWludDhBcnJheSxcbiAgICBvdXRTaGFwZUJ5dGVzOiBVaW50OEFycmF5LCBvdXRTdHJpZGVzQnl0ZXM6IFVpbnQ4QXJyYXksXG4gICAgb3V0U2hhcGVMZW5ndGg6IG51bWJlciwgb3V0SWQ6IG51bWJlcikgPT4gdm9pZDtcblxuZnVuY3Rpb24gc2V0dXAoYmFja2VuZDogQmFja2VuZFdhc20pOiB2b2lkIHtcbiAgd2FzbVN0cmlkZWRTbGljZSA9IGJhY2tlbmQud2FzbS5jd3JhcChTdHJpZGVkU2xpY2UsIG51bGwgLyp2b2lkKi8sIFtcbiAgICAnbnVtYmVyJywgIC8vIHhJZFxuICAgICdhcnJheScsICAgLy8geFN0cmlkZXNcbiAgICAnbnVtYmVyJywgIC8vIHhSYW5rXG4gICAgJ2FycmF5JywgICAvLyBiZWdpbkJ5dGVzXG4gICAgJ2FycmF5JywgICAvLyBlbmRCeXRlc1xuICAgICdhcnJheScsICAgLy8gc3RyaWRlc0J5dGVzXG4gICAgJ2FycmF5JywgICAvLyBvdXRTaGFwZUJ5dGVzXG4gICAgJ2FycmF5JywgICAvLyBvdXRTdHJpZGVzQnl0ZXNcbiAgICAnbnVtYmVyJywgIC8vIG91dFNoYXBlTGVuZ3RoXG4gICAgJ251bWJlcicsICAvLyBvdXRJZFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlkZWRTbGljZShhcmdzOiB7XG4gIGJhY2tlbmQ6IEJhY2tlbmRXYXNtLFxuICBpbnB1dHM6IFN0cmlkZWRTbGljZUlucHV0cyxcbiAgYXR0cnM6IFN0cmlkZWRTbGljZUF0dHJzXG59KTogVGVuc29ySW5mbyB7XG4gIGNvbnN0IHtiYWNrZW5kLCBpbnB1dHMsIGF0dHJzfSA9IGFyZ3M7XG4gIGNvbnN0IHt4fSA9IGlucHV0cztcblxuICBjb25zdCB7XG4gICAgYmVnaW4sXG4gICAgZW5kLFxuICAgIHN0cmlkZXMsXG4gICAgYmVnaW5NYXNrLFxuICAgIGVuZE1hc2ssXG4gICAgZWxsaXBzaXNNYXNrLFxuICAgIG5ld0F4aXNNYXNrLFxuICAgIHNocmlua0F4aXNNYXNrXG4gIH0gPSBhdHRycztcblxuICBjb25zdCB7XG4gICAgZmluYWxTaGFwZVNwYXJzZSxcbiAgICBmaW5hbFNoYXBlLFxuICAgIGlzSWRlbnRpdHksXG4gICAgc2xpY2VEaW0wLFxuICAgIGlzU2ltcGxlU2xpY2UsXG4gICAgYmVnaW46ICRiZWdpbixcbiAgICBlbmQ6ICRlbmQsXG4gICAgc3RyaWRlczogJHN0cmlkZXNcbiAgfSA9XG4gICAgICBzbGljZV91dGlsLnNsaWNlSW5mbyhcbiAgICAgICAgICB4LnNoYXBlLCBiZWdpbiwgZW5kLCBzdHJpZGVzLCBiZWdpbk1hc2ssIGVuZE1hc2ssIGVsbGlwc2lzTWFzayxcbiAgICAgICAgICBuZXdBeGlzTWFzaywgc2hyaW5rQXhpc01hc2spO1xuXG4gIGxldCByZXN1bHQ7XG5cbiAgaWYgKGlzSWRlbnRpdHkpIHtcbiAgICAvLyBPcHRpbWl6YXRpb24gIzEsIHNsaWNlIGlzIGEgbm8tb3AgcGx1cyByZXNoYXBlXG4gICAgcmVzdWx0ID0gcmVzaGFwZSh7aW5wdXRzOiB7eH0sIGJhY2tlbmQsIGF0dHJzOiB7c2hhcGU6IGZpbmFsU2hhcGV9fSk7XG4gIH0gZWxzZSBpZiAoc2xpY2VEaW0wIHx8IGlzU2ltcGxlU2xpY2UpIHtcbiAgICAvLyBPcHRpbWl6YXRpb24gIzIsIHNsaWNlIGlzIG1lbW9yeSBjb250aWd1b3VzIChvbmx5IG9jY3VycyBpbiBkaW0gMClcbiAgICB1dGlsLmFzc2VydChcbiAgICAgICAgeC5zaGFwZS5sZW5ndGggPj0gMSxcbiAgICAgICAgKCkgPT4gYElucHV0IG11c3QgaGF2ZSByYW5rIGF0IGxlYXN0IDEsIGdvdDogJHt4LnNoYXBlLmxlbmd0aH1gKTtcblxuICAgIGNvbnN0IHNpemUgPSBzbGljZV91dGlsLmNvbXB1dGVPdXRTaGFwZSgkYmVnaW4sICRlbmQsICRzdHJpZGVzKTtcbiAgICAvLyBUbyB0b2xlcmF0ZSBiZWdpblswXSA+IGVuZFswXSAoYSAwLW91dHB1dCBzbGljZSksIHdlIG1pbihiZWdpbiwgZW5kKS5cbiAgICBjb25zdCBzbGljZWQgPSBzbGljZSh7aW5wdXRzOiB7eH0sIGJhY2tlbmQsIGF0dHJzOiB7YmVnaW46ICRiZWdpbiwgc2l6ZX19KTtcbiAgICByZXN1bHQgPVxuICAgICAgICByZXNoYXBlKHtpbnB1dHM6IHt4OiBzbGljZWR9LCBiYWNrZW5kLCBhdHRyczoge3NoYXBlOiBmaW5hbFNoYXBlfX0pO1xuICAgIGJhY2tlbmQuZGlzcG9zZURhdGEoc2xpY2VkLmRhdGFJZCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgb3V0ID0gYmFja2VuZC5tYWtlT3V0cHV0KGZpbmFsU2hhcGVTcGFyc2UsICdmbG9hdDMyJyk7XG5cbiAgICBjb25zdCB4SWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoeC5kYXRhSWQpLmlkO1xuICAgIGNvbnN0IHhTdHJpZGVzQnl0ZXMgPVxuICAgICAgICBuZXcgVWludDhBcnJheShuZXcgSW50MzJBcnJheSh1dGlsLmNvbXB1dGVTdHJpZGVzKHguc2hhcGUpKS5idWZmZXIpO1xuICAgIGNvbnN0IGJlZ2luQnl0ZXMgPSBuZXcgVWludDhBcnJheShuZXcgSW50MzJBcnJheSgkYmVnaW4pLmJ1ZmZlcik7XG4gICAgY29uc3QgZW5kQnl0ZXMgPSBuZXcgVWludDhBcnJheShuZXcgSW50MzJBcnJheSgkZW5kKS5idWZmZXIpO1xuICAgIGNvbnN0IHN0cmlkZXNCeXRlcyA9IG5ldyBVaW50OEFycmF5KG5ldyBJbnQzMkFycmF5KCRzdHJpZGVzKS5idWZmZXIpO1xuXG4gICAgY29uc3Qgb3V0cHV0U2hhcGVCeXRlcyA9XG4gICAgICAgIG5ldyBVaW50OEFycmF5KG5ldyBJbnQzMkFycmF5KGZpbmFsU2hhcGVTcGFyc2UpLmJ1ZmZlcik7XG4gICAgY29uc3Qgb3V0U3RyaWRlc0J5dGVzID0gbmV3IFVpbnQ4QXJyYXkoXG4gICAgICAgIG5ldyBJbnQzMkFycmF5KHV0aWwuY29tcHV0ZVN0cmlkZXMoZmluYWxTaGFwZVNwYXJzZSkpLmJ1ZmZlcik7XG4gICAgY29uc3Qgb3V0SWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQob3V0LmRhdGFJZCkuaWQ7XG5cbiAgICB3YXNtU3RyaWRlZFNsaWNlKFxuICAgICAgICB4SWQsIHhTdHJpZGVzQnl0ZXMsIHguc2hhcGUubGVuZ3RoLCBiZWdpbkJ5dGVzLCBlbmRCeXRlcywgc3RyaWRlc0J5dGVzLFxuICAgICAgICBvdXRwdXRTaGFwZUJ5dGVzLCBvdXRTdHJpZGVzQnl0ZXMsIGZpbmFsU2hhcGVTcGFyc2UubGVuZ3RoLCBvdXRJZCk7XG5cbiAgICByZXN1bHQgPSByZXNoYXBlKHtpbnB1dHM6IHt4OiBvdXR9LCBiYWNrZW5kLCBhdHRyczoge3NoYXBlOiBmaW5hbFNoYXBlfX0pO1xuXG4gICAgYmFja2VuZC5kaXNwb3NlRGF0YShvdXQuZGF0YUlkKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBjb25zdCBzdHJpZGVkU2xpY2VDb25maWc6IEtlcm5lbENvbmZpZyA9IHtcbiAga2VybmVsTmFtZTogU3RyaWRlZFNsaWNlLFxuICBiYWNrZW5kTmFtZTogJ3dhc20nLFxuICBzZXR1cEZ1bmM6IHNldHVwLFxuICBrZXJuZWxGdW5jOiBzdHJpZGVkU2xpY2UgYXMgdW5rbm93biBhcyBLZXJuZWxGdW5jXG59O1xuIl19
