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
import { MirrorPad } from '@tensorflow/tfjs-core';
import { CppDType } from './types';
// Must match enum in MirrorPad.cc
var MirrorPaddingMode;
(function (MirrorPaddingMode) {
  MirrorPaddingMode[(MirrorPaddingMode['reflect'] = 0)] = 'reflect';
  MirrorPaddingMode[(MirrorPaddingMode['symmetric'] = 1)] = 'symmetric';
})(MirrorPaddingMode || (MirrorPaddingMode = {}));
let wasmMirrorPad;
function setup(backend) {
  wasmMirrorPad = backend.wasm.cwrap(MirrorPad, null /* void */, [
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
function mirrorPad(args) {
  const {
    inputs: { x },
    backend,
    attrs: { paddings, mode },
  } = args;
  const outShape = paddings.map((p, i) => p[0] /* beforePad */ + x.shape[i] + p[1] /* afterPad */);
  const xId = backend.dataIdMap.get(x.dataId).id;
  const out = backend.makeOutput(outShape, x.dtype);
  const outId = backend.dataIdMap.get(out.dataId).id;
  const xShapeBytes = new Uint8Array(new Int32Array(x.shape).buffer);
  const prePaddingsFlat = paddings.map(padTuple => padTuple[0]);
  const postPaddingsFlat = paddings.map(padTuple => padTuple[1]);
  const prePaddingsBytes = new Uint8Array(new Int32Array(prePaddingsFlat).buffer);
  const postPaddingsBytes = new Uint8Array(new Int32Array(postPaddingsFlat).buffer);
  wasmMirrorPad(xId, xShapeBytes, x.shape.length, CppDType[x.dtype], prePaddingsBytes, postPaddingsBytes, MirrorPaddingMode[mode], outId);
  return out;
}
export const mirrorPadConfig = {
  kernelName: MirrorPad,
  backendName: 'wasm',
  kernelFunc: mirrorPad,
  setupFunc: setup,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlycm9yUGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1iYWNrZW5kLXdhc20vc3JjL2tlcm5lbHMvTWlycm9yUGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBMkIsU0FBUyxFQUFrQyxNQUFNLHVCQUF1QixDQUFDO0FBSTNHLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFakMsa0NBQWtDO0FBQ2xDLElBQUssaUJBR0o7QUFIRCxXQUFLLGlCQUFpQjtJQUNwQiwrREFBVyxDQUFBO0lBQ1gsbUVBQWEsQ0FBQTtBQUNmLENBQUMsRUFISSxpQkFBaUIsS0FBakIsaUJBQWlCLFFBR3JCO0FBRUQsSUFBSSxhQUdzQixDQUFDO0FBRTNCLFNBQVMsS0FBSyxDQUFDLE9BQW9CO0lBQ2pDLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUM3RCxRQUFRO1FBQ1IsT0FBTztRQUNQLFFBQVE7UUFDUixRQUFRO1FBQ1IsT0FBTztRQUNQLE9BQU87UUFDUCxRQUFRO1FBQ1IsUUFBUSxFQUFHLFFBQVE7S0FDcEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLElBSWxCO0lBQ0MsTUFBTSxFQUFDLE1BQU0sRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLEVBQUMsR0FBRyxJQUFJLENBQUM7SUFFN0QsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FDekIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0MsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbkQsTUFBTSxXQUFXLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRW5FLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCxNQUFNLGdCQUFnQixHQUNsQixJQUFJLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRCxNQUFNLGlCQUFpQixHQUNuQixJQUFJLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTVELGFBQWEsQ0FDVCxHQUFHLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsZ0JBQWdCLEVBQ3JFLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBaUI7SUFDM0MsVUFBVSxFQUFFLFNBQVM7SUFDckIsV0FBVyxFQUFFLE1BQU07SUFDbkIsVUFBVSxFQUFFLFNBQWtDO0lBQzlDLFNBQVMsRUFBRSxLQUFLO0NBQ2pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMSBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7S2VybmVsQ29uZmlnLCBLZXJuZWxGdW5jLCBNaXJyb3JQYWQsIE1pcnJvclBhZEF0dHJzLCBNaXJyb3JQYWRJbnB1dHN9IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmltcG9ydCB7Q3BwRFR5cGV9IGZyb20gJy4vdHlwZXMnO1xuXG4vLyBNdXN0IG1hdGNoIGVudW0gaW4gTWlycm9yUGFkLmNjXG5lbnVtIE1pcnJvclBhZGRpbmdNb2RlIHtcbiAgcmVmbGVjdCA9IDAsXG4gIHN5bW1ldHJpYyA9IDFcbn1cblxubGV0IHdhc21NaXJyb3JQYWQ6IChcbiAgICB4SWQ6IG51bWJlciwgeFNoYXBlQnl0ZXM6IFVpbnQ4QXJyYXksIHhTaGFwZUxlbmd0aDogbnVtYmVyLCB4RHR5cGU6IG51bWJlcixcbiAgICBwcmVQYWRkaW5nc0J5dGVzOiBVaW50OEFycmF5LCBwb3N0UGFkZGluZ3NCeXRlczogVWludDhBcnJheSwgbW9kZTogbnVtYmVyLFxuICAgIG91dElkOiBudW1iZXIpID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIHNldHVwKGJhY2tlbmQ6IEJhY2tlbmRXYXNtKSB7XG4gIHdhc21NaXJyb3JQYWQgPSBiYWNrZW5kLndhc20uY3dyYXAoTWlycm9yUGFkLCBudWxsIC8qIHZvaWQgKi8sIFtcbiAgICAnbnVtYmVyJywgIC8vIHhJZFxuICAgICdhcnJheScsICAgLy8geC5zaGFwZVxuICAgICdudW1iZXInLCAgLy8geC5zaGFwZS5sZW5ndGhcbiAgICAnbnVtYmVyJywgIC8vIHguZHR5cGVcbiAgICAnYXJyYXknLCAgIC8vIHByZS1wYWRkaW5nc1xuICAgICdhcnJheScsICAgLy8gcG9zdC1wYWRkaW5nc1xuICAgICdudW1iZXInLCAgLy8gbW9kZVxuICAgICdudW1iZXInLCAgLy8gb3V0SWRcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIG1pcnJvclBhZChhcmdzOiB7XG4gIGlucHV0czogTWlycm9yUGFkSW5wdXRzLFxuICBiYWNrZW5kOiBCYWNrZW5kV2FzbSxcbiAgYXR0cnM6IE1pcnJvclBhZEF0dHJzXG59KSB7XG4gIGNvbnN0IHtpbnB1dHM6IHt4fSwgYmFja2VuZCwgYXR0cnM6IHtwYWRkaW5ncywgbW9kZX19ID0gYXJncztcblxuICBjb25zdCBvdXRTaGFwZSA9IHBhZGRpbmdzLm1hcChcbiAgICAgIChwLCBpKSA9PiBwWzBdIC8qIGJlZm9yZVBhZCAqLyArIHguc2hhcGVbaV0gKyBwWzFdIC8qIGFmdGVyUGFkICovKTtcbiAgY29uc3QgeElkID0gYmFja2VuZC5kYXRhSWRNYXAuZ2V0KHguZGF0YUlkKS5pZDtcbiAgY29uc3Qgb3V0ID0gYmFja2VuZC5tYWtlT3V0cHV0KG91dFNoYXBlLCB4LmR0eXBlKTtcbiAgY29uc3Qgb3V0SWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQob3V0LmRhdGFJZCkuaWQ7XG4gIGNvbnN0IHhTaGFwZUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobmV3IEludDMyQXJyYXkoeC5zaGFwZSkuYnVmZmVyKTtcblxuICBjb25zdCBwcmVQYWRkaW5nc0ZsYXQgPSBwYWRkaW5ncy5tYXAocGFkVHVwbGUgPT4gcGFkVHVwbGVbMF0pO1xuICBjb25zdCBwb3N0UGFkZGluZ3NGbGF0ID0gcGFkZGluZ3MubWFwKHBhZFR1cGxlID0+IHBhZFR1cGxlWzFdKTtcbiAgY29uc3QgcHJlUGFkZGluZ3NCeXRlcyA9XG4gICAgICBuZXcgVWludDhBcnJheShuZXcgSW50MzJBcnJheShwcmVQYWRkaW5nc0ZsYXQpLmJ1ZmZlcik7XG4gIGNvbnN0IHBvc3RQYWRkaW5nc0J5dGVzID1cbiAgICAgIG5ldyBVaW50OEFycmF5KG5ldyBJbnQzMkFycmF5KHBvc3RQYWRkaW5nc0ZsYXQpLmJ1ZmZlcik7XG5cbiAgd2FzbU1pcnJvclBhZChcbiAgICAgIHhJZCwgeFNoYXBlQnl0ZXMsIHguc2hhcGUubGVuZ3RoLCBDcHBEVHlwZVt4LmR0eXBlXSwgcHJlUGFkZGluZ3NCeXRlcyxcbiAgICAgIHBvc3RQYWRkaW5nc0J5dGVzLCBNaXJyb3JQYWRkaW5nTW9kZVttb2RlXSwgb3V0SWQpO1xuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgbWlycm9yUGFkQ29uZmlnOiBLZXJuZWxDb25maWcgPSB7XG4gIGtlcm5lbE5hbWU6IE1pcnJvclBhZCxcbiAgYmFja2VuZE5hbWU6ICd3YXNtJyxcbiAga2VybmVsRnVuYzogbWlycm9yUGFkIGFzIHVua25vd24gYXMgS2VybmVsRnVuYyxcbiAgc2V0dXBGdW5jOiBzZXR1cFxufTtcbiJdfQ==
