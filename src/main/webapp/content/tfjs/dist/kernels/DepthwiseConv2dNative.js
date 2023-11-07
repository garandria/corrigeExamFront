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
import { backend_util, DepthwiseConv2dNative } from '@tensorflow/tfjs-core';
let wasmDepthwiseConv2d;
function setup(backend) {
  wasmDepthwiseConv2d = backend.wasm.cwrap(DepthwiseConv2dNative, null /* void */, [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number', // outId
  ]);
}
function depthwiseConv2d(args) {
  const { inputs, attrs, backend } = args;
  const { x, filter } = inputs;
  const xId = backend.dataIdMap.get(x.dataId).id;
  const filterId = backend.dataIdMap.get(filter.dataId).id;
  const { strides, dilations, pad, dimRoundingMode } = attrs;
  const $dilations = dilations == null ? [1, 1] : dilations;
  const convInfo = backend_util.computeConv2DInfo(x.shape, filter.shape, strides, $dilations, pad, dimRoundingMode, true /* depthwise */);
  const filterHeight = convInfo.filterHeight;
  const filterWidth = convInfo.filterWidth;
  const padTop = convInfo.padInfo.top;
  const padRight = convInfo.padInfo.right;
  const padBottom = convInfo.padInfo.bottom;
  const padLeft = convInfo.padInfo.left;
  const dilationHeight = convInfo.dilationHeight;
  const dilationWidth = convInfo.dilationWidth;
  const strideHeight = convInfo.strideHeight;
  const strideWidth = convInfo.strideWidth;
  const inputChannels = convInfo.inChannels;
  const outputChannels = convInfo.outChannels;
  const isSamePad = convInfo.padInfo.type === 'SAME' ? 1 : 0;
  if (convInfo.dataFormat !== 'channelsLast') {
    throw new Error(
      `wasm backend DepthwiseConv2dNative does not support dataFormat:'` + `${convInfo.dataFormat}'. Please use 'channelsLast'.`,
    );
  }
  const out = backend.makeOutput(convInfo.outShape, 'float32');
  const outId = backend.dataIdMap.get(out.dataId).id;
  wasmDepthwiseConv2d(
    xId,
    x.shape[0],
    x.shape[1],
    x.shape[2],
    filterId,
    filterHeight,
    filterWidth,
    padTop,
    padRight,
    padBottom,
    padLeft,
    isSamePad,
    dilationHeight,
    dilationWidth,
    strideHeight,
    strideWidth,
    inputChannels,
    outputChannels,
    outId,
  );
  return out;
}
export const depthwiseConv2dNativeConfig = {
  kernelName: DepthwiseConv2dNative,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: depthwiseConv2d,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwdGh3aXNlQ29udjJkTmF0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1iYWNrZW5kLXdhc20vc3JjL2tlcm5lbHMvRGVwdGh3aXNlQ29udjJkTmF0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUscUJBQXFCLEVBQThGLE1BQU0sdUJBQXVCLENBQUM7QUFJdkssSUFBSSxtQkFNc0IsQ0FBQztBQUUzQixTQUFTLEtBQUssQ0FBQyxPQUFvQjtJQUNqQyxtQkFBbUI7UUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3pELFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVEsRUFBRyxRQUFRO1NBQ3BCLENBQUMsQ0FBQztBQUNULENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxJQUl4QjtJQUNDLE1BQU0sRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxHQUFHLElBQUksQ0FBQztJQUV0QyxNQUFNLEVBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUMzQixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9DLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFekQsTUFBTSxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBQyxHQUFHLEtBQUssQ0FBQztJQUV6RCxNQUFNLFVBQVUsR0FBRyxTQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRTFELE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FDMUMsQ0FBYyxDQUFDLEtBQUssRUFBRyxNQUFtQixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQ3pELFVBQXdDLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFDL0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRTFCLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUM7SUFDM0MsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztJQUN6QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUNwQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUN4QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUMxQyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUN0QyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDO0lBQy9DLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7SUFDN0MsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztJQUMzQyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO0lBQ3pDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFDMUMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztJQUM1QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNELElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxjQUFjLEVBQUU7UUFDMUMsTUFBTSxJQUFJLEtBQUssQ0FDWCxrRUFBa0U7WUFDbEUsR0FBRyxRQUFRLENBQUMsVUFBVSwrQkFBK0IsQ0FBQyxDQUFDO0tBQzVEO0lBRUQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbkQsbUJBQW1CLENBQ2YsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQy9ELFdBQVcsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUM1RCxjQUFjLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUN2RSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0IsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQWlCO0lBQ3ZELFVBQVUsRUFBRSxxQkFBcUI7SUFDakMsV0FBVyxFQUFFLE1BQU07SUFDbkIsU0FBUyxFQUFFLEtBQUs7SUFDaEIsVUFBVSxFQUFFLGVBQXdDO0NBQ3JELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxOSBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7YmFja2VuZF91dGlsLCBEZXB0aHdpc2VDb252MmROYXRpdmUsIERlcHRod2lzZUNvbnYyZE5hdGl2ZUF0dHJzLCBEZXB0aHdpc2VDb252MmROYXRpdmVJbnB1dHMsIEtlcm5lbENvbmZpZywgS2VybmVsRnVuYywgVGVuc29yNER9IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmxldCB3YXNtRGVwdGh3aXNlQ29udjJkOiAoXG4gICAgeElkOiBudW1iZXIsIGJhdGNoU2l6ZTogbnVtYmVyLCBpbnB1dEhlaWdodDogbnVtYmVyLCBpbnB1dFdpZHRoOiBudW1iZXIsXG4gICAgZmlsdGVySWQ6IG51bWJlciwgZmlsdGVySGVpZ2h0OiBudW1iZXIsIGZpbHRlcldpZHRoOiBudW1iZXIsIHBhZFRvcDogbnVtYmVyLFxuICAgIHBhZFJpZ2h0OiBudW1iZXIsIHBhZEJvdHRvbTogbnVtYmVyLCBwYWRMZWZ0OiBudW1iZXIsIGlzU2FtZVBhZDogbnVtYmVyLFxuICAgIGRpbGF0aW9uSGVpZ2h0OiBudW1iZXIsIGRpbGF0aW9uV2lkdGg6IG51bWJlciwgc3RyaWRlSGVpZ2h0OiBudW1iZXIsXG4gICAgc3RyaWRlV2lkdGg6IG51bWJlciwgaW5wdXRDaGFubmVsczogbnVtYmVyLCBvdXRwdXRDaGFubmVsczogbnVtYmVyLFxuICAgIG91dElkOiBudW1iZXIpID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIHNldHVwKGJhY2tlbmQ6IEJhY2tlbmRXYXNtKSB7XG4gIHdhc21EZXB0aHdpc2VDb252MmQgPVxuICAgICAgYmFja2VuZC53YXNtLmN3cmFwKERlcHRod2lzZUNvbnYyZE5hdGl2ZSwgbnVsbCAvKiB2b2lkICovLCBbXG4gICAgICAgICdudW1iZXInLCAgLy8geElkXG4gICAgICAgICdudW1iZXInLCAgLy8gYmF0Y2hTaXplXG4gICAgICAgICdudW1iZXInLCAgLy8gaW5wdXRIZWlnaHRcbiAgICAgICAgJ251bWJlcicsICAvLyBpbnB1dFdpZHRoXG4gICAgICAgICdudW1iZXInLCAgLy8gZmlsdGVySWRcbiAgICAgICAgJ251bWJlcicsICAvLyBmaWx0ZXJIZWlnaHRcbiAgICAgICAgJ251bWJlcicsICAvLyBmaWx0ZXJXaWR0aFxuICAgICAgICAnbnVtYmVyJywgIC8vIHBhZFRvcFxuICAgICAgICAnbnVtYmVyJywgIC8vIHBhZFJpZ2h0XG4gICAgICAgICdudW1iZXInLCAgLy8gcGFkQm90dG9tXG4gICAgICAgICdudW1iZXInLCAgLy8gcGFkTGVmdFxuICAgICAgICAnbnVtYmVyJywgIC8vIGlzU2FtZVBhZFxuICAgICAgICAnbnVtYmVyJywgIC8vIGRpbGF0aW9uSGVpZ2h0XG4gICAgICAgICdudW1iZXInLCAgLy8gZGlsYXRpb25XaWR0aFxuICAgICAgICAnbnVtYmVyJywgIC8vIHN0cmlkZUhlaWdodFxuICAgICAgICAnbnVtYmVyJywgIC8vIHN0cmlkZVdpZHRoXG4gICAgICAgICdudW1iZXInLCAgLy8gaW5wdXRDaGFubmVsc1xuICAgICAgICAnbnVtYmVyJywgIC8vIG91dHB1dENoYW5uZWxzXG4gICAgICAgICdudW1iZXInLCAgLy8gb3V0SWRcbiAgICAgIF0pO1xufVxuXG5mdW5jdGlvbiBkZXB0aHdpc2VDb252MmQoYXJnczoge1xuICBpbnB1dHM6IERlcHRod2lzZUNvbnYyZE5hdGl2ZUlucHV0cyxcbiAgYmFja2VuZDogQmFja2VuZFdhc20sXG4gIGF0dHJzOiBEZXB0aHdpc2VDb252MmROYXRpdmVBdHRyc1xufSkge1xuICBjb25zdCB7aW5wdXRzLCBhdHRycywgYmFja2VuZH0gPSBhcmdzO1xuXG4gIGNvbnN0IHt4LCBmaWx0ZXJ9ID0gaW5wdXRzO1xuICBjb25zdCB4SWQgPSBiYWNrZW5kLmRhdGFJZE1hcC5nZXQoeC5kYXRhSWQpLmlkO1xuICBjb25zdCBmaWx0ZXJJZCA9IGJhY2tlbmQuZGF0YUlkTWFwLmdldChmaWx0ZXIuZGF0YUlkKS5pZDtcblxuICBjb25zdCB7c3RyaWRlcywgZGlsYXRpb25zLCBwYWQsIGRpbVJvdW5kaW5nTW9kZX0gPSBhdHRycztcblxuICBjb25zdCAkZGlsYXRpb25zID0gZGlsYXRpb25zID09IG51bGwgPyBbMSwgMV0gOiBkaWxhdGlvbnM7XG5cbiAgY29uc3QgY29udkluZm8gPSBiYWNrZW5kX3V0aWwuY29tcHV0ZUNvbnYyREluZm8oXG4gICAgICAoeCBhcyBUZW5zb3I0RCkuc2hhcGUsIChmaWx0ZXIgYXMgVGVuc29yNEQpLnNoYXBlLCBzdHJpZGVzLFxuICAgICAgKCRkaWxhdGlvbnMgYXMgbnVtYmVyIHwgW251bWJlciwgbnVtYmVyXSksIHBhZCwgZGltUm91bmRpbmdNb2RlLFxuICAgICAgdHJ1ZSAvKiBkZXB0aHdpc2UgKi8pO1xuXG4gIGNvbnN0IGZpbHRlckhlaWdodCA9IGNvbnZJbmZvLmZpbHRlckhlaWdodDtcbiAgY29uc3QgZmlsdGVyV2lkdGggPSBjb252SW5mby5maWx0ZXJXaWR0aDtcbiAgY29uc3QgcGFkVG9wID0gY29udkluZm8ucGFkSW5mby50b3A7XG4gIGNvbnN0IHBhZFJpZ2h0ID0gY29udkluZm8ucGFkSW5mby5yaWdodDtcbiAgY29uc3QgcGFkQm90dG9tID0gY29udkluZm8ucGFkSW5mby5ib3R0b207XG4gIGNvbnN0IHBhZExlZnQgPSBjb252SW5mby5wYWRJbmZvLmxlZnQ7XG4gIGNvbnN0IGRpbGF0aW9uSGVpZ2h0ID0gY29udkluZm8uZGlsYXRpb25IZWlnaHQ7XG4gIGNvbnN0IGRpbGF0aW9uV2lkdGggPSBjb252SW5mby5kaWxhdGlvbldpZHRoO1xuICBjb25zdCBzdHJpZGVIZWlnaHQgPSBjb252SW5mby5zdHJpZGVIZWlnaHQ7XG4gIGNvbnN0IHN0cmlkZVdpZHRoID0gY29udkluZm8uc3RyaWRlV2lkdGg7XG4gIGNvbnN0IGlucHV0Q2hhbm5lbHMgPSBjb252SW5mby5pbkNoYW5uZWxzO1xuICBjb25zdCBvdXRwdXRDaGFubmVscyA9IGNvbnZJbmZvLm91dENoYW5uZWxzO1xuICBjb25zdCBpc1NhbWVQYWQgPSBjb252SW5mby5wYWRJbmZvLnR5cGUgPT09ICdTQU1FJyA/IDEgOiAwO1xuXG4gIGlmIChjb252SW5mby5kYXRhRm9ybWF0ICE9PSAnY2hhbm5lbHNMYXN0Jykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYHdhc20gYmFja2VuZCBEZXB0aHdpc2VDb252MmROYXRpdmUgZG9lcyBub3Qgc3VwcG9ydCBkYXRhRm9ybWF0OidgICtcbiAgICAgICAgYCR7Y29udkluZm8uZGF0YUZvcm1hdH0nLiBQbGVhc2UgdXNlICdjaGFubmVsc0xhc3QnLmApO1xuICB9XG5cbiAgY29uc3Qgb3V0ID0gYmFja2VuZC5tYWtlT3V0cHV0KGNvbnZJbmZvLm91dFNoYXBlLCAnZmxvYXQzMicpO1xuICBjb25zdCBvdXRJZCA9IGJhY2tlbmQuZGF0YUlkTWFwLmdldChvdXQuZGF0YUlkKS5pZDtcbiAgd2FzbURlcHRod2lzZUNvbnYyZChcbiAgICAgIHhJZCwgeC5zaGFwZVswXSwgeC5zaGFwZVsxXSwgeC5zaGFwZVsyXSwgZmlsdGVySWQsIGZpbHRlckhlaWdodCxcbiAgICAgIGZpbHRlcldpZHRoLCBwYWRUb3AsIHBhZFJpZ2h0LCBwYWRCb3R0b20sIHBhZExlZnQsIGlzU2FtZVBhZCxcbiAgICAgIGRpbGF0aW9uSGVpZ2h0LCBkaWxhdGlvbldpZHRoLCBzdHJpZGVIZWlnaHQsIHN0cmlkZVdpZHRoLCBpbnB1dENoYW5uZWxzLFxuICAgICAgb3V0cHV0Q2hhbm5lbHMsIG91dElkKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGNvbnN0IGRlcHRod2lzZUNvbnYyZE5hdGl2ZUNvbmZpZzogS2VybmVsQ29uZmlnID0ge1xuICBrZXJuZWxOYW1lOiBEZXB0aHdpc2VDb252MmROYXRpdmUsXG4gIGJhY2tlbmROYW1lOiAnd2FzbScsXG4gIHNldHVwRnVuYzogc2V0dXAsXG4gIGtlcm5lbEZ1bmM6IGRlcHRod2lzZUNvbnYyZCBhcyB1bmtub3duIGFzIEtlcm5lbEZ1bmNcbn07XG4iXX0=
