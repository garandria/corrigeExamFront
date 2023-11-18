/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
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
import { LinSpace } from '@tensorflow/tfjs-core';
let wasmLinSpace;
function setup(backend) {
  wasmLinSpace = backend.wasm.cwrap(LinSpace, null, [
    'number',
    'number',
    'number',
    'number', // num
  ]);
}
export function linSpace(args) {
  const { attrs, backend } = args;
  const { start, stop, num } = attrs;
  // TFJS Cpu backend supports num as a float and returns undetermined tensor in
  // that case. However, according to TensorFlow spec, num should be a integer.
  const numInt = Math.floor(num);
  const out = backend.makeOutput([numInt], 'float32');
  wasmLinSpace(backend.dataIdMap.get(out.dataId).id, start, stop, numInt);
  return out;
}
export const linSpaceConfig = {
  kernelName: LinSpace,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: linSpace,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluU3BhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi90ZmpzLWJhY2tlbmQtd2FzbS9zcmMva2VybmVscy9MaW5TcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFFSCxPQUFPLEVBQTJCLFFBQVEsRUFBNEIsTUFBTSx1QkFBdUIsQ0FBQztBQUlwRyxJQUFJLFlBQ0ksQ0FBQztBQUVULFNBQVMsS0FBSyxDQUFDLE9BQW9CO0lBQ2pDLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFO1FBQ2hELFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVEsRUFBRyxNQUFNO0tBQ2xCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFDLElBQWtEO0lBRXpFLE1BQU0sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQzlCLE1BQU0sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQyxHQUFHLEtBQUssQ0FBQztJQUVqQyw4RUFBOEU7SUFDOUUsNkVBQTZFO0lBQzdFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFL0IsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEUsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFpQjtJQUMxQyxVQUFVLEVBQUUsUUFBUTtJQUNwQixXQUFXLEVBQUUsTUFBTTtJQUNuQixTQUFTLEVBQUUsS0FBSztJQUNoQixVQUFVLEVBQUUsUUFBaUM7Q0FDOUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIzIEdvb2dsZSBMTEMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IHtLZXJuZWxDb25maWcsIEtlcm5lbEZ1bmMsIExpblNwYWNlLCBMaW5TcGFjZUF0dHJzLCBUZW5zb3JJbmZvfSBmcm9tICdAdGVuc29yZmxvdy90ZmpzLWNvcmUnO1xuXG5pbXBvcnQge0JhY2tlbmRXYXNtfSBmcm9tICcuLi9iYWNrZW5kX3dhc20nO1xuXG5sZXQgd2FzbUxpblNwYWNlOiAob3V0SWQ6IG51bWJlciwgc3RhcnQ6IG51bWJlciwgc3RvcDogbnVtYmVyLCBudW06IG51bWJlcikgPT5cbiAgICB2b2lkO1xuXG5mdW5jdGlvbiBzZXR1cChiYWNrZW5kOiBCYWNrZW5kV2FzbSkge1xuICB3YXNtTGluU3BhY2UgPSBiYWNrZW5kLndhc20uY3dyYXAoTGluU3BhY2UsIG51bGwsIFtcbiAgICAnbnVtYmVyJywgIC8vIG91dElkXG4gICAgJ251bWJlcicsICAvLyBzdGFydFxuICAgICdudW1iZXInLCAgLy8gc3RvcFxuICAgICdudW1iZXInLCAgLy8gbnVtXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGluU3BhY2UoYXJnczoge2F0dHJzOiBMaW5TcGFjZUF0dHJzLCBiYWNrZW5kOiBCYWNrZW5kV2FzbX0pOlxuICAgIFRlbnNvckluZm8ge1xuICBjb25zdCB7YXR0cnMsIGJhY2tlbmR9ID0gYXJncztcbiAgY29uc3Qge3N0YXJ0LCBzdG9wLCBudW19ID0gYXR0cnM7XG5cbiAgLy8gVEZKUyBDcHUgYmFja2VuZCBzdXBwb3J0cyBudW0gYXMgYSBmbG9hdCBhbmQgcmV0dXJucyB1bmRldGVybWluZWQgdGVuc29yIGluXG4gIC8vIHRoYXQgY2FzZS4gSG93ZXZlciwgYWNjb3JkaW5nIHRvIFRlbnNvckZsb3cgc3BlYywgbnVtIHNob3VsZCBiZSBhIGludGVnZXIuXG4gIGNvbnN0IG51bUludCA9IE1hdGguZmxvb3IobnVtKTtcblxuICBjb25zdCBvdXQgPSBiYWNrZW5kLm1ha2VPdXRwdXQoW251bUludF0sICdmbG9hdDMyJyk7XG4gIHdhc21MaW5TcGFjZShiYWNrZW5kLmRhdGFJZE1hcC5nZXQob3V0LmRhdGFJZCkuaWQsIHN0YXJ0LCBzdG9wLCBudW1JbnQpO1xuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgbGluU3BhY2VDb25maWc6IEtlcm5lbENvbmZpZyA9IHtcbiAga2VybmVsTmFtZTogTGluU3BhY2UsXG4gIGJhY2tlbmROYW1lOiAnd2FzbScsXG4gIHNldHVwRnVuYzogc2V0dXAsXG4gIGtlcm5lbEZ1bmM6IGxpblNwYWNlIGFzIHVua25vd24gYXMgS2VybmVsRnVuYyxcbn07XG4iXX0=