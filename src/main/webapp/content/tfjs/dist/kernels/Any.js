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
import { Any, backend_util, util } from '@tensorflow/tfjs-core';
import { permuteAxesAndTranspose } from './kernel_utils';
let wasmAny;
function setup(backend) {
  wasmAny = backend.wasm.cwrap(Any, null /*void*/, ['number, number, number']);
}
function any(args) {
  const { backend, inputs, attrs } = args;
  const { axis, keepDims } = attrs;
  const { x } = inputs;
  const xId = backend.dataIdMap.get(x.dataId).id;
  let inputId = xId;
  let input = x;
  const { transposed, axes, originalAxes, inputWasTransposed } = permuteAxesAndTranspose(x, axis, backend);
  if (inputWasTransposed) {
    const transposedId = backend.dataIdMap.get(transposed.dataId).id;
    input = transposed;
    inputId = transposedId;
  }
  const inputRank = input.shape.length;
  backend_util.assertAxesAreInnerMostDims('any', axes, inputRank);
  const [outShape, reduceShape] = backend_util.computeOutAndReduceShapes(input.shape, axes);
  const reduceSize = util.sizeFromShape(reduceShape);
  const out = backend.makeOutput(outShape, x.dtype);
  if (util.sizeFromShape(input.shape) !== 0) {
    const outId = backend.dataIdMap.get(out.dataId).id;
    wasmAny(inputId, reduceSize, outId);
  }
  if (inputWasTransposed) {
    // dispose of the transposed tensor.
    backend.disposeData(transposed.dataId);
  }
  if (keepDims) {
    // reshape
    const newShape = backend_util.expandShapeToKeepDim(out.shape, originalAxes);
    out.shape = newShape;
  }
  return out;
}
export const anyConfig = {
  kernelName: Any,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: any,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW55LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1iYWNrZW5kLXdhc20vc3JjL2tlcm5lbHMvQW55LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBQyxHQUFHLEVBQXVCLFlBQVksRUFBd0MsSUFBSSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFJekgsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkQsSUFBSSxPQUFpRSxDQUFDO0FBRXRFLFNBQVMsS0FBSyxDQUFDLE9BQW9CO0lBQ2pDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQsU0FBUyxHQUFHLENBQUMsSUFBZ0U7SUFFM0UsTUFBTSxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3RDLE1BQU0sRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLEdBQUcsS0FBSyxDQUFDO0lBQy9CLE1BQU0sRUFBQyxDQUFDLEVBQUMsR0FBRyxNQUFNLENBQUM7SUFDbkIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMvQyxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFDbEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBRWQsTUFBTSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixFQUFDLEdBQ3RELHVCQUF1QixDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFOUMsSUFBSSxrQkFBa0IsRUFBRTtRQUN0QixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2pFLEtBQUssR0FBRyxVQUFVLENBQUM7UUFDbkIsT0FBTyxHQUFHLFlBQVksQ0FBQztLQUN4QjtJQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3JDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQ3pCLFlBQVksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFbkQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbkQsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDckM7SUFFRCxJQUFJLGtCQUFrQixFQUFFO1FBQ3RCLG9DQUFvQztRQUNwQyxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4QztJQUVELElBQUksUUFBUSxFQUFFO1FBQ1osVUFBVTtRQUNWLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzVFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO0tBQ3RCO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFpQjtJQUNyQyxVQUFVLEVBQUUsR0FBRztJQUNmLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLFVBQVUsRUFBRSxHQUE0QjtDQUN6QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjEgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQge0FueSwgQW55QXR0cnMsIEFueUlucHV0cywgYmFja2VuZF91dGlsLCBLZXJuZWxDb25maWcsIEtlcm5lbEZ1bmMsIFRlbnNvckluZm8sIHV0aWx9IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmltcG9ydCB7cGVybXV0ZUF4ZXNBbmRUcmFuc3Bvc2V9IGZyb20gJy4va2VybmVsX3V0aWxzJztcblxubGV0IHdhc21Bbnk6ICh4SWQ6IG51bWJlciwgcmVkdWNlU2l6ZTogbnVtYmVyLCBvdXRJZDogbnVtYmVyKSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBzZXR1cChiYWNrZW5kOiBCYWNrZW5kV2FzbSk6IHZvaWQge1xuICB3YXNtQW55ID0gYmFja2VuZC53YXNtLmN3cmFwKEFueSwgbnVsbCAvKnZvaWQqLywgWydudW1iZXIsIG51bWJlciwgbnVtYmVyJ10pO1xufVxuXG5mdW5jdGlvbiBhbnkoYXJnczoge2JhY2tlbmQ6IEJhY2tlbmRXYXNtLCBpbnB1dHM6IEFueUlucHV0cywgYXR0cnM6IEFueUF0dHJzfSk6XG4gICAgVGVuc29ySW5mbyB7XG4gIGNvbnN0IHtiYWNrZW5kLCBpbnB1dHMsIGF0dHJzfSA9IGFyZ3M7XG4gIGNvbnN0IHtheGlzLCBrZWVwRGltc30gPSBhdHRycztcbiAgY29uc3Qge3h9ID0gaW5wdXRzO1xuICBjb25zdCB4SWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoeC5kYXRhSWQpLmlkO1xuICBsZXQgaW5wdXRJZCA9IHhJZDtcbiAgbGV0IGlucHV0ID0geDtcblxuICBjb25zdCB7dHJhbnNwb3NlZCwgYXhlcywgb3JpZ2luYWxBeGVzLCBpbnB1dFdhc1RyYW5zcG9zZWR9ID1cbiAgICAgIHBlcm11dGVBeGVzQW5kVHJhbnNwb3NlKHgsIGF4aXMsIGJhY2tlbmQpO1xuXG4gIGlmIChpbnB1dFdhc1RyYW5zcG9zZWQpIHtcbiAgICBjb25zdCB0cmFuc3Bvc2VkSWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQodHJhbnNwb3NlZC5kYXRhSWQpLmlkO1xuICAgIGlucHV0ID0gdHJhbnNwb3NlZDtcbiAgICBpbnB1dElkID0gdHJhbnNwb3NlZElkO1xuICB9XG5cbiAgY29uc3QgaW5wdXRSYW5rID0gaW5wdXQuc2hhcGUubGVuZ3RoO1xuICBiYWNrZW5kX3V0aWwuYXNzZXJ0QXhlc0FyZUlubmVyTW9zdERpbXMoJ2FueScsIGF4ZXMsIGlucHV0UmFuayk7XG4gIGNvbnN0IFtvdXRTaGFwZSwgcmVkdWNlU2hhcGVdID1cbiAgICAgIGJhY2tlbmRfdXRpbC5jb21wdXRlT3V0QW5kUmVkdWNlU2hhcGVzKGlucHV0LnNoYXBlLCBheGVzKTtcbiAgY29uc3QgcmVkdWNlU2l6ZSA9IHV0aWwuc2l6ZUZyb21TaGFwZShyZWR1Y2VTaGFwZSk7XG5cbiAgY29uc3Qgb3V0ID0gYmFja2VuZC5tYWtlT3V0cHV0KG91dFNoYXBlLCB4LmR0eXBlKTtcbiAgaWYgKHV0aWwuc2l6ZUZyb21TaGFwZShpbnB1dC5zaGFwZSkgIT09IDApIHtcbiAgICBjb25zdCBvdXRJZCA9IGJhY2tlbmQuZGF0YUlkTWFwLmdldChvdXQuZGF0YUlkKS5pZDtcbiAgICB3YXNtQW55KGlucHV0SWQsIHJlZHVjZVNpemUsIG91dElkKTtcbiAgfVxuXG4gIGlmIChpbnB1dFdhc1RyYW5zcG9zZWQpIHtcbiAgICAvLyBkaXNwb3NlIG9mIHRoZSB0cmFuc3Bvc2VkIHRlbnNvci5cbiAgICBiYWNrZW5kLmRpc3Bvc2VEYXRhKHRyYW5zcG9zZWQuZGF0YUlkKTtcbiAgfVxuXG4gIGlmIChrZWVwRGltcykge1xuICAgIC8vIHJlc2hhcGVcbiAgICBjb25zdCBuZXdTaGFwZSA9IGJhY2tlbmRfdXRpbC5leHBhbmRTaGFwZVRvS2VlcERpbShvdXQuc2hhcGUsIG9yaWdpbmFsQXhlcyk7XG4gICAgb3V0LnNoYXBlID0gbmV3U2hhcGU7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgYW55Q29uZmlnOiBLZXJuZWxDb25maWcgPSB7XG4gIGtlcm5lbE5hbWU6IEFueSxcbiAgYmFja2VuZE5hbWU6ICd3YXNtJyxcbiAgc2V0dXBGdW5jOiBzZXR1cCxcbiAga2VybmVsRnVuYzogYW55IGFzIHVua25vd24gYXMgS2VybmVsRnVuY1xufTtcbiJdfQ==
