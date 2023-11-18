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
import { backend_util, BroadcastArgs } from '@tensorflow/tfjs-core';
export function broadcastArgs(args) {
  const { inputs, backend } = args;
  const { s0, s1 } = inputs;
  const s0Vals = backend.typedArrayFromHeap(s0);
  const s1Vals = backend.typedArrayFromHeap(s1);
  const broadcastShape = backend_util.assertAndGetBroadcastShape(Array.from(s0Vals), Array.from(s1Vals));
  return backend.makeOutput([broadcastShape.length], 'int32', /*memoryOffset=*/ undefined, /*values=*/ new Int32Array(broadcastShape));
}
export const broadcastArgsConfig = {
  kernelName: BroadcastArgs,
  backendName: 'wasm',
  kernelFunc: broadcastArgs,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvYWRjYXN0QXJncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtYmFja2VuZC13YXNtL3NyYy9rZXJuZWxzL0Jyb2FkY2FzdEFyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsT0FBTyxFQUFDLFlBQVksRUFBRSxhQUFhLEVBQWdELE1BQU0sdUJBQXVCLENBQUM7QUFJakgsTUFBTSxVQUFVLGFBQWEsQ0FBQyxJQUc3QjtJQUNDLE1BQU0sRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQy9CLE1BQU0sRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLEdBQUcsTUFBTSxDQUFDO0lBRXhCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFOUMsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLDBCQUEwQixDQUMxRCxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUU1QyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQ3JCLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQSxTQUFTO0lBQzVELFdBQVcsQ0FBQSxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBaUI7SUFDL0MsVUFBVSxFQUFFLGFBQWE7SUFDekIsV0FBVyxFQUFFLE1BQU07SUFDbkIsVUFBVSxFQUFFLGFBQWE7Q0FDMUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIzIEdvb2dsZSBMTEMuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbmltcG9ydCB7YmFja2VuZF91dGlsLCBCcm9hZGNhc3RBcmdzLCBCcm9hZGNhc3RBcmdzSW5wdXRzLCBLZXJuZWxDb25maWcsIFRlbnNvckluZm99IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBicm9hZGNhc3RBcmdzKGFyZ3M6IHtcbiAgaW5wdXRzOiBCcm9hZGNhc3RBcmdzSW5wdXRzLFxuICBiYWNrZW5kOiBCYWNrZW5kV2FzbSxcbn0pOiBUZW5zb3JJbmZvIHtcbiAgY29uc3Qge2lucHV0cywgYmFja2VuZH0gPSBhcmdzO1xuICBjb25zdCB7czAsIHMxfSA9IGlucHV0cztcblxuICBjb25zdCBzMFZhbHMgPSBiYWNrZW5kLnR5cGVkQXJyYXlGcm9tSGVhcChzMCk7XG4gIGNvbnN0IHMxVmFscyA9IGJhY2tlbmQudHlwZWRBcnJheUZyb21IZWFwKHMxKTtcblxuICBjb25zdCBicm9hZGNhc3RTaGFwZSA9IGJhY2tlbmRfdXRpbC5hc3NlcnRBbmRHZXRCcm9hZGNhc3RTaGFwZShcbiAgICAgIEFycmF5LmZyb20oczBWYWxzKSwgQXJyYXkuZnJvbShzMVZhbHMpKTtcblxuICByZXR1cm4gYmFja2VuZC5tYWtlT3V0cHV0KFxuICAgICAgW2Jyb2FkY2FzdFNoYXBlLmxlbmd0aF0sICdpbnQzMicsIC8qbWVtb3J5T2Zmc2V0PSovdW5kZWZpbmVkLFxuICAgICAgLyp2YWx1ZXM9Ki9uZXcgSW50MzJBcnJheShicm9hZGNhc3RTaGFwZSkpO1xufVxuXG5leHBvcnQgY29uc3QgYnJvYWRjYXN0QXJnc0NvbmZpZzogS2VybmVsQ29uZmlnID0ge1xuICBrZXJuZWxOYW1lOiBCcm9hZGNhc3RBcmdzLFxuICBiYWNrZW5kTmFtZTogJ3dhc20nLFxuICBrZXJuZWxGdW5jOiBicm9hZGNhc3RBcmdzXG59O1xuIl19