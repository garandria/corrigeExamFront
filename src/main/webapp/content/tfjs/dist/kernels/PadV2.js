/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
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
import { PadV2, util } from '@tensorflow/tfjs-core';
import { fill } from './Fill';
import { CppDType } from './types';
let wasmPadV2;
function setup(backend) {
  wasmPadV2 = backend.wasm.cwrap(PadV2, null /* void */, [
    'number',
    'array',
    'number',
    'number',
    'array',
    'array',
    'number',
    'number', // outId
  ]);
}
function pad(args) {
  const {
    inputs: { x },
    backend,
    attrs: { paddings, constantValue },
  } = args;
  const outShape = paddings.map((p, i) => p[0] /* beforePad */ + x.shape[i] + p[1] /* afterPad */);
  if (util.sizeFromShape(x.shape) === 0) {
    // Short-circuit the computation, since x doesn't have value, only
    // the shape is used to compute output shape to pad.
    return fill({
      backend,
      attrs: { shape: outShape, value: constantValue, dtype: x.dtype },
    });
  }
  const xId = backend.dataIdMap.get(x.dataId).id;
  const out = backend.makeOutput(outShape, x.dtype);
  const outTensorData = backend.dataIdMap.get(out.dataId);
  const outId = outTensorData.id;
  const xShapeBytes = new Uint8Array(new Int32Array(x.shape).buffer);
  const prePaddingsFlat = paddings.map(padTuple => padTuple[0]);
  const postPaddingsFlat = paddings.map(padTuple => padTuple[1]);
  const prePaddingsBytes = new Uint8Array(new Int32Array(prePaddingsFlat).buffer);
  const postPaddingsBytes = new Uint8Array(new Int32Array(postPaddingsFlat).buffer);
  wasmPadV2(xId, xShapeBytes, x.shape.length, CppDType[x.dtype], prePaddingsBytes, postPaddingsBytes, constantValue, outId);
  return out;
}
export const padV2Config = {
  kernelName: PadV2,
  backendName: 'wasm',
  kernelFunc: pad,
  setupFunc: setup,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFkVjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi90ZmpzLWJhY2tlbmQtd2FzbS9zcmMva2VybmVscy9QYWRWMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFFSCxPQUFPLEVBQTJCLEtBQUssRUFBMkIsSUFBSSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFJckcsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUU1QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRWpDLElBQUksU0FHNkMsQ0FBQztBQUVsRCxTQUFTLEtBQUssQ0FBQyxPQUFvQjtJQUNqQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDckQsUUFBUTtRQUNSLE9BQU87UUFDUCxRQUFRO1FBQ1IsUUFBUTtRQUNSLE9BQU87UUFDUCxPQUFPO1FBQ1AsUUFBUTtRQUNSLFFBQVEsRUFBRyxRQUFRO0tBQ3BCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLEdBQUcsQ0FDUixJQUFvRTtJQUN0RSxNQUFNLEVBQUMsTUFBTSxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUMsRUFBQyxHQUFHLElBQUksQ0FBQztJQUV0RSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUN6QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFdkUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDckMsa0VBQWtFO1FBQ2xFLG9EQUFvRDtRQUNwRCxPQUFPLElBQUksQ0FBQztZQUNWLE9BQU87WUFDUCxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUM7U0FDL0QsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9DLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQztJQUUvQixNQUFNLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbkUsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELE1BQU0sZ0JBQWdCLEdBQ2xCLElBQUksVUFBVSxDQUFDLElBQUksVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNELE1BQU0saUJBQWlCLEdBQ25CLElBQUksVUFBVSxDQUFDLElBQUksVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFNUQsU0FBUyxDQUNMLEdBQUcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxnQkFBZ0IsRUFDckUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdDLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBaUI7SUFDdkMsVUFBVSxFQUFFLEtBQUs7SUFDakIsV0FBVyxFQUFFLE1BQU07SUFDbkIsVUFBVSxFQUFFLEdBQTRCO0lBQ3hDLFNBQVMsRUFBRSxLQUFLO0NBQ2pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxOSBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7S2VybmVsQ29uZmlnLCBLZXJuZWxGdW5jLCBQYWRWMiwgUGFkVjJBdHRycywgUGFkVjJJbnB1dHMsIHV0aWx9IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmltcG9ydCB7ZmlsbH0gZnJvbSAnLi9GaWxsJztcblxuaW1wb3J0IHtDcHBEVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5cbmxldCB3YXNtUGFkVjI6IChcbiAgICB4SWQ6IG51bWJlciwgeFNoYXBlQnl0ZXM6IFVpbnQ4QXJyYXksIHhTaGFwZUxlbmd0aDogbnVtYmVyLCB4RHR5cGU6IG51bWJlcixcbiAgICBwcmVQYWRkaW5nc0J5dGVzOiBVaW50OEFycmF5LCBwb3N0UGFkZGluZ3NCeXRlczogVWludDhBcnJheSxcbiAgICBjb25zdGFudFZhbHVlOiBudW1iZXIsIG91dElkOiBudW1iZXIpID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIHNldHVwKGJhY2tlbmQ6IEJhY2tlbmRXYXNtKSB7XG4gIHdhc21QYWRWMiA9IGJhY2tlbmQud2FzbS5jd3JhcChQYWRWMiwgbnVsbCAvKiB2b2lkICovLCBbXG4gICAgJ251bWJlcicsICAvLyB4SWRcbiAgICAnYXJyYXknLCAgIC8vIHguc2hhcGVcbiAgICAnbnVtYmVyJywgIC8vIHguc2hhcGUubGVuZ3RoXG4gICAgJ251bWJlcicsICAvLyB4LmR0eXBlXG4gICAgJ2FycmF5JywgICAvLyBwcmUtcGFkZGluZ3NcbiAgICAnYXJyYXknLCAgIC8vIHBvc3QtcGFkZGluZ3NcbiAgICAnbnVtYmVyJywgIC8vIGNvbnN0YW50VmFsdWVcbiAgICAnbnVtYmVyJywgIC8vIG91dElkXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBwYWQoXG4gICAgYXJnczoge2lucHV0czogUGFkVjJJbnB1dHMsIGJhY2tlbmQ6IEJhY2tlbmRXYXNtLCBhdHRyczogUGFkVjJBdHRyc30pIHtcbiAgY29uc3Qge2lucHV0czoge3h9LCBiYWNrZW5kLCBhdHRyczoge3BhZGRpbmdzLCBjb25zdGFudFZhbHVlfX0gPSBhcmdzO1xuXG4gIGNvbnN0IG91dFNoYXBlID0gcGFkZGluZ3MubWFwKFxuICAgICAgKHAsIGkpID0+IHBbMF0gLyogYmVmb3JlUGFkICovICsgeC5zaGFwZVtpXSArIHBbMV0gLyogYWZ0ZXJQYWQgKi8pO1xuXG4gIGlmICh1dGlsLnNpemVGcm9tU2hhcGUoeC5zaGFwZSkgPT09IDApIHtcbiAgICAvLyBTaG9ydC1jaXJjdWl0IHRoZSBjb21wdXRhdGlvbiwgc2luY2UgeCBkb2Vzbid0IGhhdmUgdmFsdWUsIG9ubHlcbiAgICAvLyB0aGUgc2hhcGUgaXMgdXNlZCB0byBjb21wdXRlIG91dHB1dCBzaGFwZSB0byBwYWQuXG4gICAgcmV0dXJuIGZpbGwoe1xuICAgICAgYmFja2VuZCxcbiAgICAgIGF0dHJzOiB7c2hhcGU6IG91dFNoYXBlLCB2YWx1ZTogY29uc3RhbnRWYWx1ZSwgZHR5cGU6IHguZHR5cGV9XG4gICAgfSk7XG4gIH1cblxuICBjb25zdCB4SWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoeC5kYXRhSWQpLmlkO1xuICBjb25zdCBvdXQgPSBiYWNrZW5kLm1ha2VPdXRwdXQob3V0U2hhcGUsIHguZHR5cGUpO1xuICBjb25zdCBvdXRUZW5zb3JEYXRhID0gYmFja2VuZC5kYXRhSWRNYXAuZ2V0KG91dC5kYXRhSWQpO1xuICBjb25zdCBvdXRJZCA9IG91dFRlbnNvckRhdGEuaWQ7XG5cbiAgY29uc3QgeFNoYXBlQnl0ZXMgPSBuZXcgVWludDhBcnJheShuZXcgSW50MzJBcnJheSh4LnNoYXBlKS5idWZmZXIpO1xuXG4gIGNvbnN0IHByZVBhZGRpbmdzRmxhdCA9IHBhZGRpbmdzLm1hcChwYWRUdXBsZSA9PiBwYWRUdXBsZVswXSk7XG4gIGNvbnN0IHBvc3RQYWRkaW5nc0ZsYXQgPSBwYWRkaW5ncy5tYXAocGFkVHVwbGUgPT4gcGFkVHVwbGVbMV0pO1xuICBjb25zdCBwcmVQYWRkaW5nc0J5dGVzID1cbiAgICAgIG5ldyBVaW50OEFycmF5KG5ldyBJbnQzMkFycmF5KHByZVBhZGRpbmdzRmxhdCkuYnVmZmVyKTtcbiAgY29uc3QgcG9zdFBhZGRpbmdzQnl0ZXMgPVxuICAgICAgbmV3IFVpbnQ4QXJyYXkobmV3IEludDMyQXJyYXkocG9zdFBhZGRpbmdzRmxhdCkuYnVmZmVyKTtcblxuICB3YXNtUGFkVjIoXG4gICAgICB4SWQsIHhTaGFwZUJ5dGVzLCB4LnNoYXBlLmxlbmd0aCwgQ3BwRFR5cGVbeC5kdHlwZV0sIHByZVBhZGRpbmdzQnl0ZXMsXG4gICAgICBwb3N0UGFkZGluZ3NCeXRlcywgY29uc3RhbnRWYWx1ZSwgb3V0SWQpO1xuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgcGFkVjJDb25maWc6IEtlcm5lbENvbmZpZyA9IHtcbiAga2VybmVsTmFtZTogUGFkVjIsXG4gIGJhY2tlbmROYW1lOiAnd2FzbScsXG4gIGtlcm5lbEZ1bmM6IHBhZCBhcyB1bmtub3duIGFzIEtlcm5lbEZ1bmMsXG4gIHNldHVwRnVuYzogc2V0dXBcbn07XG4iXX0=
