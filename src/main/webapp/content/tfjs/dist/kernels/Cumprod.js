/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
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
import { backend_util, Cumprod, util } from '@tensorflow/tfjs-core';
import { CppDType } from './types';
import { transpose } from './Transpose';
let wasmCumprod;
function setup(backend) {
  wasmCumprod = backend.wasm.cwrap(Cumprod, null /* void */, [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number', // dtype
  ]);
}
export function cumprod(args) {
  const { inputs, backend, attrs } = args;
  const { x } = inputs;
  const { axis, exclusive, reverse } = attrs;
  const xRank = x.shape.length;
  util.assert(x.dtype === 'float32' || x.dtype === 'int32', () => `cumprod does not support ${x.dtype} tensors in the WASM backend`);
  // permute required axis to inner most axis
  const permutation = backend_util.getAxesPermutation([axis], xRank);
  let permutedX = x;
  if (permutation !== null) {
    permutedX = transpose({ inputs: { x }, attrs: { perm: permutation }, backend });
  }
  const permutedAxis = backend_util.getInnerMostAxes(1, xRank)[0];
  backend_util.assertAxesAreInnerMostDims('cumprod', [permutedAxis], xRank);
  const permutedOut = backend.makeOutput(permutedX.shape, permutedX.dtype);
  const finalDim = permutedX.shape[permutedAxis];
  const permutedXId = backend.dataIdMap.get(permutedX.dataId).id;
  const permutedOutId = backend.dataIdMap.get(permutedOut.dataId).id;
  wasmCumprod(permutedXId, exclusive ? 1 : 0, reverse ? 1 : 0, finalDim, permutedOutId, CppDType[x.dtype]);
  // transpose data back if permuted
  let out = permutedOut;
  if (permutation !== null) {
    const undoPermutation = backend_util.getUndoAxesPermutation(permutation);
    out = transpose({ inputs: { x: permutedOut }, attrs: { perm: undoPermutation }, backend });
    backend.disposeData(permutedX.dataId);
    backend.disposeData(permutedOut.dataId);
  }
  return out;
}
export const cumprodConfig = {
  kernelName: Cumprod,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: cumprod,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VtcHJvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtYmFja2VuZC13YXNtL3NyYy9rZXJuZWxzL0N1bXByb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBNEIsT0FBTyxFQUEyQyxJQUFJLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUlySSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRWpDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFdEMsSUFBSSxXQUNzRSxDQUFDO0FBRTNFLFNBQVMsS0FBSyxDQUFDLE9BQW9CO0lBQ2pDLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUN6RCxRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVEsQ0FBRSxRQUFRO0tBQ25CLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLFVBQVUsT0FBTyxDQUNyQixJQUF3RTtJQUV4RSxNQUFNLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUMsR0FBRyxJQUFJLENBQUM7SUFDdEMsTUFBTSxFQUFDLENBQUMsRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUNuQixNQUFNLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUMsR0FBRyxLQUFLLENBQUM7SUFDekMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFFN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFDdEQsR0FBRyxFQUFFLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxLQUFLLDhCQUE4QixDQUFDLENBQUM7SUFDM0UsMkNBQTJDO0lBQzNDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25FLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFDeEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0tBQzNFO0lBQ0QsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRSxZQUFZLENBQUMsMEJBQTBCLENBQUMsU0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFMUUsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6RSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9DLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0QsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNuRSxXQUFXLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQ3pELGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFOUMsa0NBQWtDO0lBQ2xDLElBQUksR0FBRyxHQUFHLFdBQVcsQ0FBQztJQUN0QixJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFDeEIsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3pFLEdBQUcsR0FBRyxTQUFTLENBQ2IsRUFBQyxNQUFNLEVBQUUsRUFBQyxDQUFDLEVBQUUsV0FBVyxFQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBQyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDdkUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDekM7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQWlCO0lBQ3pDLFVBQVUsRUFBRSxPQUFPO0lBQ25CLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLFVBQVUsRUFBRSxPQUFnQztDQUM3QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjIgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQge2JhY2tlbmRfdXRpbCwgS2VybmVsQ29uZmlnLCBLZXJuZWxGdW5jLCBDdW1wcm9kLCBDdW1wcm9kQXR0cnMsIEN1bXByb2RJbnB1dHMsIFRlbnNvckluZm8sIHV0aWx9IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmltcG9ydCB7Q3BwRFR5cGV9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge3RyYW5zcG9zZX0gZnJvbSAnLi9UcmFuc3Bvc2UnO1xuXG5sZXQgd2FzbUN1bXByb2Q6ICh4SWQ6IG51bWJlciwgZXhjbHVzaXZlOiBudW1iZXIsIHJldmVyc2U6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgZmluYWxEaW06IG51bWJlciwgb3V0SWQ6IG51bWJlciwgZHR5cGU6IENwcERUeXBlKSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBzZXR1cChiYWNrZW5kOiBCYWNrZW5kV2FzbSkge1xuICB3YXNtQ3VtcHJvZCA9IGJhY2tlbmQud2FzbS5jd3JhcChDdW1wcm9kLCBudWxsIC8qIHZvaWQgKi8sIFtcbiAgICAnbnVtYmVyJywgLy8geF9pZFxuICAgICdudW1iZXInLCAvLyBleGNsdXNpdmVcbiAgICAnbnVtYmVyJywgLy8gcmV2ZXJzZVxuICAgICdudW1iZXInLCAvLyBmaW5hbF9kaW1cbiAgICAnbnVtYmVyJywgLy8gb3V0X2lkXG4gICAgJ251bWJlcicgIC8vIGR0eXBlXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3VtcHJvZChcbiAgYXJnczoge2lucHV0czogQ3VtcHJvZElucHV0cywgYmFja2VuZDogQmFja2VuZFdhc20sIGF0dHJzOiBDdW1wcm9kQXR0cnN9KTpcblRlbnNvckluZm8ge1xuICBjb25zdCB7aW5wdXRzLCBiYWNrZW5kLCBhdHRyc30gPSBhcmdzO1xuICBjb25zdCB7eH0gPSBpbnB1dHM7XG4gIGNvbnN0IHtheGlzLCBleGNsdXNpdmUsIHJldmVyc2V9ID0gYXR0cnM7XG4gIGNvbnN0IHhSYW5rID0geC5zaGFwZS5sZW5ndGg7XG5cbiAgdXRpbC5hc3NlcnQoeC5kdHlwZSA9PT0gJ2Zsb2F0MzInIHx8IHguZHR5cGUgPT09ICdpbnQzMicsXG4gICAgKCkgPT4gYGN1bXByb2QgZG9lcyBub3Qgc3VwcG9ydCAke3guZHR5cGV9IHRlbnNvcnMgaW4gdGhlIFdBU00gYmFja2VuZGApO1xuICAvLyBwZXJtdXRlIHJlcXVpcmVkIGF4aXMgdG8gaW5uZXIgbW9zdCBheGlzXG4gIGNvbnN0IHBlcm11dGF0aW9uID0gYmFja2VuZF91dGlsLmdldEF4ZXNQZXJtdXRhdGlvbihbYXhpc10sIHhSYW5rKTtcbiAgbGV0IHBlcm11dGVkWCA9IHg7XG4gIGlmIChwZXJtdXRhdGlvbiAhPT0gbnVsbCkge1xuICAgIHBlcm11dGVkWCA9IHRyYW5zcG9zZSh7aW5wdXRzOiB7eH0sIGF0dHJzOiB7cGVybTogcGVybXV0YXRpb259LCBiYWNrZW5kfSk7XG4gIH1cbiAgY29uc3QgcGVybXV0ZWRBeGlzID0gYmFja2VuZF91dGlsLmdldElubmVyTW9zdEF4ZXMoMSwgeFJhbmspWzBdO1xuICBiYWNrZW5kX3V0aWwuYXNzZXJ0QXhlc0FyZUlubmVyTW9zdERpbXMoJ2N1bXByb2QnLCBbcGVybXV0ZWRBeGlzXSwgeFJhbmspO1xuXG4gIGNvbnN0IHBlcm11dGVkT3V0ID0gYmFja2VuZC5tYWtlT3V0cHV0KHBlcm11dGVkWC5zaGFwZSwgcGVybXV0ZWRYLmR0eXBlKTtcbiAgY29uc3QgZmluYWxEaW0gPSBwZXJtdXRlZFguc2hhcGVbcGVybXV0ZWRBeGlzXTtcbiAgY29uc3QgcGVybXV0ZWRYSWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQocGVybXV0ZWRYLmRhdGFJZCkuaWQ7XG4gIGNvbnN0IHBlcm11dGVkT3V0SWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQocGVybXV0ZWRPdXQuZGF0YUlkKS5pZDtcbiAgd2FzbUN1bXByb2QocGVybXV0ZWRYSWQsIGV4Y2x1c2l2ZSA/IDEgOiAwLCByZXZlcnNlID8gMSA6IDAsIGZpbmFsRGltLFxuICAgICAgICAgICAgICBwZXJtdXRlZE91dElkLCBDcHBEVHlwZVt4LmR0eXBlXSk7XG5cbiAgLy8gdHJhbnNwb3NlIGRhdGEgYmFjayBpZiBwZXJtdXRlZFxuICBsZXQgb3V0ID0gcGVybXV0ZWRPdXQ7XG4gIGlmIChwZXJtdXRhdGlvbiAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHVuZG9QZXJtdXRhdGlvbiA9IGJhY2tlbmRfdXRpbC5nZXRVbmRvQXhlc1Blcm11dGF0aW9uKHBlcm11dGF0aW9uKTtcbiAgICBvdXQgPSB0cmFuc3Bvc2UoXG4gICAgICB7aW5wdXRzOiB7eDogcGVybXV0ZWRPdXR9LCBhdHRyczoge3Blcm06IHVuZG9QZXJtdXRhdGlvbn0sIGJhY2tlbmR9KTtcbiAgICBiYWNrZW5kLmRpc3Bvc2VEYXRhKHBlcm11dGVkWC5kYXRhSWQpO1xuICAgIGJhY2tlbmQuZGlzcG9zZURhdGEocGVybXV0ZWRPdXQuZGF0YUlkKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgY3VtcHJvZENvbmZpZzogS2VybmVsQ29uZmlnID0ge1xuICBrZXJuZWxOYW1lOiBDdW1wcm9kLFxuICBiYWNrZW5kTmFtZTogJ3dhc20nLFxuICBzZXR1cEZ1bmM6IHNldHVwLFxuICBrZXJuZWxGdW5jOiBjdW1wcm9kIGFzIHVua25vd24gYXMgS2VybmVsRnVuY1xufTtcbiJdfQ==
