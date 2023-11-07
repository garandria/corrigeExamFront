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
import { ResizeNearestNeighborGrad } from '@tensorflow/tfjs-core';
import { cast } from './Cast';
let wasmResizeNearestNeighborGrad;
function setup(backend) {
  wasmResizeNearestNeighborGrad = backend.wasm.cwrap(ResizeNearestNeighborGrad, null /*void*/, [
    'number',
    'number',
    'number',
    'array',
    'array',
    'boolean', // alignCorners
  ]);
}
function resizeNearestNeighborGrad(args) {
  const { inputs, backend, attrs } = args;
  const { images, dy } = inputs;
  const { alignCorners } = attrs;
  const dx = backend.makeOutput(images.shape, 'float32');
  let xData = backend.dataIdMap.get(images.dataId);
  let castedData;
  if (xData.dtype !== 'float32') {
    castedData = cast({
      backend,
      inputs: { x: images },
      attrs: { dtype: 'float32' },
    });
    xData = backend.dataIdMap.get(castedData.dataId);
  }
  wasmResizeNearestNeighborGrad(
    backend.dataIdMap.get(images.dataId).id,
    backend.dataIdMap.get(dy.dataId).id,
    backend.dataIdMap.get(dx.dataId).id,
    new Uint8Array(new Int32Array(images.shape).buffer),
    new Uint8Array(new Int32Array(dy.shape).buffer),
    alignCorners,
  );
  if (castedData != null) {
    backend.disposeData(castedData.dataId);
  }
  return dx;
}
export const resizeNearestNeighborGradConfig = {
  kernelName: ResizeNearestNeighborGrad,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: resizeNearestNeighborGrad,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzaXplTmVhcmVzdE5laWdoYm9yR3JhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtYmFja2VuZC13YXNtL3NyYy9rZXJuZWxzL1Jlc2l6ZU5lYXJlc3ROZWlnaGJvckdyYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUgsT0FBTyxFQUEyQix5QkFBeUIsRUFBOEUsTUFBTSx1QkFBdUIsQ0FBQztBQUl2SyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVCLElBQUksNkJBRW1ELENBQUM7QUFFeEQsU0FBUyxLQUFLLENBQUMsT0FBb0I7SUFDakMsNkJBQTZCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQzlDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQ3hDO1FBQ0UsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsT0FBTztRQUNQLE9BQU87UUFDUCxTQUFTLEVBQUcsZUFBZTtLQUM1QixDQUFDLENBQUM7QUFDVCxDQUFDO0FBRUQsU0FBUyx5QkFBeUIsQ0FBQyxJQUdsQztJQUNDLE1BQU0sRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBQyxHQUFHLElBQUksQ0FBQztJQUN0QyxNQUFNLEVBQUMsTUFBTSxFQUFFLEVBQUUsRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUM1QixNQUFNLEVBQUMsWUFBWSxFQUFDLEdBQUcsS0FBSyxDQUFDO0lBRTdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUV2RCxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQsSUFBSSxVQUFVLENBQUM7SUFDZixJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1FBQzdCLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDaEIsT0FBTztZQUNQLE1BQU0sRUFBRSxFQUFDLENBQUMsRUFBRSxNQUFNLEVBQUM7WUFDbkIsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBQztTQUMxQixDQUFDLENBQUM7UUFDSCxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2xEO0lBRUQsNkJBQTZCLENBQ3pCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQ3ZDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQ25DLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQ25DLElBQUksVUFBVSxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFDbkQsSUFBSSxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUMvQyxZQUFZLENBQ2YsQ0FBQztJQUVGLElBQUksVUFBVSxJQUFJLElBQUksRUFBRTtRQUN0QixPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4QztJQUVELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFpQjtJQUMzRCxVQUFVLEVBQUUseUJBQXlCO0lBQ3JDLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLFVBQVUsRUFBRSx5QkFBa0Q7Q0FDL0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIzIEdvb2dsZSBMTEMuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IHtLZXJuZWxDb25maWcsIEtlcm5lbEZ1bmMsIFJlc2l6ZU5lYXJlc3ROZWlnaGJvckdyYWQsIFJlc2l6ZU5lYXJlc3ROZWlnaGJvckdyYWRBdHRycywgUmVzaXplTmVhcmVzdE5laWdoYm9yR3JhZElucHV0cywgVGVuc29ySW5mb30gZnJvbSAnQHRlbnNvcmZsb3cvdGZqcy1jb3JlJztcblxuaW1wb3J0IHtCYWNrZW5kV2FzbX0gZnJvbSAnLi4vYmFja2VuZF93YXNtJztcblxuaW1wb3J0IHtjYXN0fSBmcm9tICcuL0Nhc3QnO1xuXG5sZXQgd2FzbVJlc2l6ZU5lYXJlc3ROZWlnaGJvckdyYWQ6IChcbiAgICBpbWFnZXNJZDogbnVtYmVyLCBkeUlkOiBudW1iZXIsIGR4SWQ6IG51bWJlciwgaW1hZ2VzU2hhcGU6IFVpbnQ4QXJyYXksXG4gICAgZHlTaGFwZTogVWludDhBcnJheSwgYWxpZ25Db3JuZXJzOiBib29sZWFuKSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBzZXR1cChiYWNrZW5kOiBCYWNrZW5kV2FzbSk6IHZvaWQge1xuICB3YXNtUmVzaXplTmVhcmVzdE5laWdoYm9yR3JhZCA9IGJhY2tlbmQud2FzbS5jd3JhcChcbiAgICAgIFJlc2l6ZU5lYXJlc3ROZWlnaGJvckdyYWQsIG51bGwgLyp2b2lkKi8sXG4gICAgICBbXG4gICAgICAgICdudW1iZXInLCAgIC8vIGltYWdlc0lkXG4gICAgICAgICdudW1iZXInLCAgIC8vIGR5SWRcbiAgICAgICAgJ251bWJlcicsICAgLy8gZHhJZFxuICAgICAgICAnYXJyYXknLCAgICAvLyBpbWFnZXNTaGFwZVxuICAgICAgICAnYXJyYXknLCAgICAvLyBkeVNoYXBlXG4gICAgICAgICdib29sZWFuJywgIC8vIGFsaWduQ29ybmVyc1xuICAgICAgXSk7XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZU5lYXJlc3ROZWlnaGJvckdyYWQoYXJnczoge1xuICBiYWNrZW5kOiBCYWNrZW5kV2FzbTsgaW5wdXRzOiBSZXNpemVOZWFyZXN0TmVpZ2hib3JHcmFkSW5wdXRzO1xuICBhdHRyczogUmVzaXplTmVhcmVzdE5laWdoYm9yR3JhZEF0dHJzO1xufSk6IFRlbnNvckluZm8ge1xuICBjb25zdCB7aW5wdXRzLCBiYWNrZW5kLCBhdHRyc30gPSBhcmdzO1xuICBjb25zdCB7aW1hZ2VzLCBkeX0gPSBpbnB1dHM7XG4gIGNvbnN0IHthbGlnbkNvcm5lcnN9ID0gYXR0cnM7XG5cbiAgY29uc3QgZHggPSBiYWNrZW5kLm1ha2VPdXRwdXQoaW1hZ2VzLnNoYXBlLCAnZmxvYXQzMicpO1xuXG4gIGxldCB4RGF0YSA9IGJhY2tlbmQuZGF0YUlkTWFwLmdldChpbWFnZXMuZGF0YUlkKTtcbiAgbGV0IGNhc3RlZERhdGE7XG4gIGlmICh4RGF0YS5kdHlwZSAhPT0gJ2Zsb2F0MzInKSB7XG4gICAgY2FzdGVkRGF0YSA9IGNhc3Qoe1xuICAgICAgYmFja2VuZCxcbiAgICAgIGlucHV0czoge3g6IGltYWdlc30sXG4gICAgICBhdHRyczoge2R0eXBlOiAnZmxvYXQzMid9LFxuICAgIH0pO1xuICAgIHhEYXRhID0gYmFja2VuZC5kYXRhSWRNYXAuZ2V0KGNhc3RlZERhdGEuZGF0YUlkKTtcbiAgfVxuXG4gIHdhc21SZXNpemVOZWFyZXN0TmVpZ2hib3JHcmFkKFxuICAgICAgYmFja2VuZC5kYXRhSWRNYXAuZ2V0KGltYWdlcy5kYXRhSWQpLmlkLFxuICAgICAgYmFja2VuZC5kYXRhSWRNYXAuZ2V0KGR5LmRhdGFJZCkuaWQsXG4gICAgICBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoZHguZGF0YUlkKS5pZCxcbiAgICAgIG5ldyBVaW50OEFycmF5KG5ldyBJbnQzMkFycmF5KGltYWdlcy5zaGFwZSkuYnVmZmVyKSxcbiAgICAgIG5ldyBVaW50OEFycmF5KG5ldyBJbnQzMkFycmF5KGR5LnNoYXBlKS5idWZmZXIpLFxuICAgICAgYWxpZ25Db3JuZXJzLFxuICApO1xuXG4gIGlmIChjYXN0ZWREYXRhICE9IG51bGwpIHtcbiAgICBiYWNrZW5kLmRpc3Bvc2VEYXRhKGNhc3RlZERhdGEuZGF0YUlkKTtcbiAgfVxuXG4gIHJldHVybiBkeDtcbn1cblxuZXhwb3J0IGNvbnN0IHJlc2l6ZU5lYXJlc3ROZWlnaGJvckdyYWRDb25maWc6IEtlcm5lbENvbmZpZyA9IHtcbiAga2VybmVsTmFtZTogUmVzaXplTmVhcmVzdE5laWdoYm9yR3JhZCxcbiAgYmFja2VuZE5hbWU6ICd3YXNtJyxcbiAgc2V0dXBGdW5jOiBzZXR1cCxcbiAga2VybmVsRnVuYzogcmVzaXplTmVhcmVzdE5laWdoYm9yR3JhZCBhcyB1bmtub3duIGFzIEtlcm5lbEZ1bmMsXG59O1xuIl19
