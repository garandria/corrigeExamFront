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
import { backend_util } from '@tensorflow/tfjs-core';
import { CppDType } from './types';
let wasmSparseSegmentReduction;
export function setup(backend) {
  wasmSparseSegmentReduction = backend.wasm.cwrap('SparseSegmentReduction', null /*void*/, [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number', // defaultValue
  ]);
}
export function sparseSegmentReduction(args, isMean) {
  const { backend, inputs } = args;
  const { data, indices, segmentIds } = inputs;
  const numIndices = indices.shape[0];
  const segmentIdsBack = backend.readSync(segmentIds.dataId, numIndices - 1, numIndices)[0];
  const lastSegmentIdPlusOne = numIndices > 0 ? segmentIdsBack + 1 : 0;
  const outputRows = lastSegmentIdPlusOne;
  if (outputRows < 0) {
    throw new Error(backend_util.getSparseSegmentReductionNegativeSegmentIdsErrorMessage());
  }
  const outputShape = data.shape.slice();
  outputShape[0] = outputRows;
  const dataId = backend.dataIdMap.get(data.dataId).id;
  const indicesId = backend.dataIdMap.get(indices.dataId).id;
  const segmentIdsId = backend.dataIdMap.get(segmentIds.dataId).id;
  const output = backend.makeOutput(outputShape, data.dtype);
  const outputId = backend.dataIdMap.get(output.dataId).id;
  const exceptionValues = backend.makeOutput([4], 'int32');
  const exceptionValuesId = backend.dataIdMap.get(exceptionValues.dataId).id;
  wasmSparseSegmentReduction(dataId, CppDType[data.dtype], data.shape[0], indicesId, segmentIdsId, outputId, exceptionValuesId, isMean, 0);
  const exceptionValuesArray = backend.readSync(exceptionValues.dataId);
  let exceptionMessage;
  switch (exceptionValuesArray[0]) {
    case 0: {
      exceptionMessage = backend_util.getSparseSegmentReductionNegativeSegmentIdsErrorMessage();
      break;
    }
    case 1: {
      exceptionMessage = backend_util.getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage();
      break;
    }
    case 2:
      exceptionMessage = backend_util.getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage(
        exceptionValuesArray[1],
        exceptionValuesArray[2],
      );
      break;
    case 3:
      exceptionMessage = backend_util.getSparseSegmentReductionIndicesOutOfRangeErrorMessage(
        exceptionValuesArray[1],
        exceptionValuesArray[2],
        exceptionValuesArray[3],
      );
      break;
    default:
      exceptionMessage = '';
  }
  backend.disposeData(exceptionValues.dataId);
  if (exceptionMessage) {
    backend.disposeData(output.dataId);
    throw new Error(exceptionMessage);
  }
  return output;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3BhcnNlU2VnbWVudFJlZHVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtYmFja2VuZC13YXNtL3NyYy9rZXJuZWxzL1NwYXJzZVNlZ21lbnRSZWR1Y3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBOEQsTUFBTSx1QkFBdUIsQ0FBQztBQUloSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRWpDLElBQUksMEJBRzhDLENBQUM7QUFFbkQsTUFBTSxVQUFVLEtBQUssQ0FBQyxPQUFvQjtJQUN4QywwQkFBMEI7UUFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUMxRCxRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVEsRUFBRyxlQUFlO1NBQzNCLENBQUMsQ0FBQztBQUNULENBQUM7QUFFRCxNQUFNLFVBQVUsc0JBQXNCLENBQ2xDLElBR0MsRUFDRCxNQUFlO0lBQ2pCLE1BQU0sRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQy9CLE1BQU0sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUUzQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLE1BQU0sY0FBYyxHQUNmLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixNQUFNLG9CQUFvQixHQUFHLFVBQVUsR0FB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TUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ25DO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIxIEdvb2dsZSBMTEMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IHtiYWNrZW5kX3V0aWwsIFNwYXJzZVNlZ21lbnRNZWFuSW5wdXRzLCBTcGFyc2VTZWdtZW50U3VtSW5wdXRzLCBUZW5zb3JJbmZvfSBmcm9tICdAdGVuc29yZmxvdy90ZmpzLWNvcmUnO1xuXG5pbXBvcnQge0JhY2tlbmRXYXNtfSBmcm9tICcuLi9iYWNrZW5kX3dhc20nO1xuXG5pbXBvcnQge0NwcERUeXBlfSBmcm9tICcuL3R5cGVzJztcblxubGV0IHdhc21TcGFyc2VTZWdtZW50UmVkdWN0aW9uOiAoXG4gICAgZGF0YUlkOiBudW1iZXIsIGR0eXBlOiBudW1iZXIsIG51bVJvdzogbnVtYmVyLCBpbmRpY2VzSWQ6IG51bWJlcixcbiAgICBzZWdtZW50SWRzSWQ6IG51bWJlciwgb3V0cHV0SWQ6IG51bWJlciwgZXhjZXB0aW9uVmFsdWVzSWQ6IG51bWJlcixcbiAgICBpc01lYW46IGJvb2xlYW4sIGRlZmF1bHRWYWx1ZTogbnVtYmVyKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoYmFja2VuZDogQmFja2VuZFdhc20pOiB2b2lkIHtcbiAgd2FzbVNwYXJzZVNlZ21lbnRSZWR1Y3Rpb24gPVxuICAgICAgYmFja2VuZC53YXNtLmN3cmFwKCdTcGFyc2VTZWdtZW50UmVkdWN0aW9uJywgbnVsbCAvKnZvaWQqLywgW1xuICAgICAgICAnbnVtYmVyJywgIC8vIGRhdGFJZFxuICAgICAgICAnbnVtYmVyJywgIC8vIGR0eXBlXG4gICAgICAgICdudW1iZXInLCAgLy8gbnVtUm93XG4gICAgICAgICdudW1iZXInLCAgLy8gaW5kaWNlc0lkXG4gICAgICAgICdudW1iZXInLCAgLy8gc2VnbWVudElkc0lkXG4gICAgICAgICdudW1iZXInLCAgLy8gb3V0cHV0SWRcbiAgICAgICAgJ251bWJlcicsICAvLyBleGNlcHRpb25WYWx1ZXNJZCxcbiAgICAgICAgJ251bWJlcicsICAvLyBpc01lYW5cbiAgICAgICAgJ251bWJlcicsICAvLyBkZWZhdWx0VmFsdWVcbiAgICAgIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BhcnNlU2VnbWVudFJlZHVjdGlvbihcbiAgICBhcmdzOiB7XG4gICAgICBiYWNrZW5kOiBCYWNrZW5kV2FzbSxcbiAgICAgIGlucHV0czogU3BhcnNlU2VnbWVudFN1bUlucHV0c3xTcGFyc2VTZWdtZW50TWVhbklucHV0cyxcbiAgICB9LFxuICAgIGlzTWVhbjogYm9vbGVhbik6IFRlbnNvckluZm8ge1xuICBjb25zdCB7YmFja2VuZCwgaW5wdXRzfSA9IGFyZ3M7XG4gIGNvbnN0IHtkYXRhLCBpbmRpY2VzLCBzZWdtZW50SWRzfSA9IGlucHV0cztcblxuICBjb25zdCBudW1JbmRpY2VzID0gaW5kaWNlcy5zaGFwZVswXTtcbiAgY29uc3Qgc2VnbWVudElkc0JhY2sgPVxuICAgICAgKGJhY2tlbmQucmVhZFN5bmMoc2VnbWVudElkcy5kYXRhSWQsIG51bUluZGljZXMgLSAxLCBudW1JbmRpY2VzKSBhc1xuICAgICAgIEludDMyQXJyYXkpWzBdO1xuICBjb25zdCBsYXN0U2VnbWVudElkUGx1c09uZSA9IG51bUluZGljZXMgPiAwID8gc2VnbWVudElkc0JhY2sgKyAxIDogMDtcbiAgY29uc3Qgb3V0cHV0Um93cyA9IGxhc3RTZWdtZW50SWRQbHVzT25lO1xuXG4gIGlmIChvdXRwdXRSb3dzIDwgMCkge1xuICAgIHRocm93IChuZXcgRXJyb3IoXG4gICAgICAgIGJhY2tlbmRfdXRpbFxuICAgICAgICAgICAgLmdldFNwYXJzZVNlZ21lbnRSZWR1Y3Rpb25OZWdhdGl2ZVNlZ21lbnRJZHNFcnJvck1lc3NhZ2UoKSkpO1xuICB9XG5cbiAgY29uc3Qgb3V0cHV0U2hhcGUgPSBkYXRhLnNoYXBlLnNsaWNlKCk7XG4gIG91dHB1dFNoYXBlWzBdID0gb3V0cHV0Um93cztcblxuICBjb25zdCBkYXRhSWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoZGF0YS5kYXRhSWQpLmlkO1xuICBjb25zdCBpbmRpY2VzSWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoaW5kaWNlcy5kYXRhSWQpLmlkO1xuICBjb25zdCBzZWdtZW50SWRzSWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoc2VnbWVudElkcy5kYXRhSWQpLmlkO1xuXG4gIGNvbnN0IG91dHB1dCA9IGJhY2tlbmQubWFrZU91dHB1dChvdXRwdXRTaGFwZSwgZGF0YS5kdHlwZSk7XG4gIGNvbnN0IG91dHB1dElkID0gYmFja2VuZC5kYXRhSWRNYXAuZ2V0KG91dHB1dC5kYXRhSWQpLmlkO1xuXG4gIGNvbnN0IGV4Y2VwdGlvblZhbHVlcyA9IGJhY2tlbmQubWFrZU91dHB1dChbNF0sICdpbnQzMicpO1xuICBjb25zdCBleGNlcHRpb25WYWx1ZXNJZCA9IGJhY2tlbmQuZGF0YUlkTWFwLmdldChleGNlcHRpb25WYWx1ZXMuZGF0YUlkKS5pZDtcblxuICB3YXNtU3BhcnNlU2VnbWVudFJlZHVjdGlvbihcbiAgICAgIGRhdGFJZCwgQ3BwRFR5cGVbZGF0YS5kdHlwZV0sIGRhdGEuc2hhcGVbMF0sIGluZGljZXNJZCwgc2VnbWVudElkc0lkLFxuICAgICAgb3V0cHV0SWQsIGV4Y2VwdGlvblZhbHVlc0lkLCBpc01lYW4sIDApO1xuXG4gIGNvbnN0IGV4Y2VwdGlvblZhbHVlc0FycmF5ID1cbiAgICAgIGJhY2tlbmQucmVhZFN5bmMoZXhjZXB0aW9uVmFsdWVzLmRhdGFJZCkgYXMgSW50MzJBcnJheTtcblxuICBsZXQgZXhjZXB0aW9uTWVzc2FnZTogc3RyaW5nO1xuICBzd2l0Y2ggKGV4Y2VwdGlvblZhbHVlc0FycmF5WzBdKSB7XG4gICAgY2FzZSAwOiB7XG4gICAgICBleGNlcHRpb25NZXNzYWdlID1cbiAgICAgICAgICBiYWNrZW5kX3V0aWxcbiAgICAgICAgICAgICAgLmdldFNwYXJzZVNlZ21lbnRSZWR1Y3Rpb25OZWdhdGl2ZVNlZ21lbnRJZHNFcnJvck1lc3NhZ2UoKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlIDE6IHtcbiAgICAgIGV4Y2VwdGlvbk1lc3NhZ2UgPVxuICAgICAgICAgIGJhY2tlbmRfdXRpbFxuICAgICAgICAgICAgICAuZ2V0U3BhcnNlU2VnbWVudFJlZHVjdGlvbk5vbkluY3JlYXNpbmdTZWdtZW50SWRzRXJyb3JNZXNzYWdlKCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAyOlxuICAgICAgZXhjZXB0aW9uTWVzc2FnZSA9XG4gICAgICAgICAgYmFja2VuZF91dGlsLmdldFNwYXJzZVNlZ21lbnRSZWR1Y3Rpb25TZWdtZW50SWRPdXRPZlJhbmdlRXJyb3JNZXNzYWdlKFxuICAgICAgICAgICAgICBleGNlcHRpb25WYWx1ZXNBcnJheVsxXSwgZXhjZXB0aW9uVmFsdWVzQXJyYXlbMl0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZXhjZXB0aW9uTWVzc2FnZSA9XG4gICAgICAgICAgYmFja2VuZF91dGlsLmdldFNwYXJzZVNlZ21lbnRSZWR1Y3Rpb25JbmRpY2VzT3V0T2ZSYW5nZUVycm9yTWVzc2FnZShcbiAgICAgICAgICAgICAgZXhjZXB0aW9uVmFsdWVzQXJyYXlbMV0sIGV4Y2VwdGlvblZhbHVlc0FycmF5WzJdLFxuICAgICAgICAgICAgICBleGNlcHRpb25WYWx1ZXNBcnJheVszXSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZXhjZXB0aW9uTWVzc2FnZSA9ICcnO1xuICB9XG5cbiAgYmFja2VuZC5kaXNwb3NlRGF0YShleGNlcHRpb25WYWx1ZXMuZGF0YUlkKTtcbiAgaWYgKGV4Y2VwdGlvbk1lc3NhZ2UpIHtcbiAgICBiYWNrZW5kLmRpc3Bvc2VEYXRhKG91dHB1dC5kYXRhSWQpO1xuICAgIHRocm93IG5ldyBFcnJvcihleGNlcHRpb25NZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4iXX0=
