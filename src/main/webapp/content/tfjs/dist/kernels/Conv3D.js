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
import { backend_util, Conv3D } from '@tensorflow/tfjs-core';
let wasmConv3D;
function setup(backend) {
  wasmConv3D = backend.wasm.cwrap(Conv3D, null, [
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
    'number',
    'number',
    'number',
    'number',
    'number',
    'number', // padLeft
  ]);
}
export function conv3D(args) {
  const { inputs, backend, attrs } = args;
  const { x, filter } = inputs;
  const { strides, pad, dilations } = attrs;
  if (x.dtype !== 'float32') {
    throw new Error(`Tensor x must have dtype float32, got ${x.dtype}`);
  }
  if (filter.dtype !== 'float32') {
    throw new Error(`Tensor filter must have dtype float32, got ${filter.dtype}`);
  }
  const convInfo = backend_util.computeConv3DInfo(x.shape, filter.shape, strides, dilations, pad);
  const out = backend.makeOutput(convInfo.outShape, x.dtype);
  wasmConv3D(
    backend.dataIdMap.get(x.dataId).id,
    backend.dataIdMap.get(filter.dataId).id,
    backend.dataIdMap.get(out.dataId).id,
    convInfo.batchSize,
    convInfo.inDepth,
    convInfo.inHeight,
    convInfo.inWidth,
    convInfo.inChannels,
    convInfo.outDepth,
    convInfo.outHeight,
    convInfo.outWidth,
    convInfo.outChannels,
    convInfo.strideDepth,
    convInfo.strideHeight,
    convInfo.strideWidth,
    convInfo.dilationDepth,
    convInfo.dilationHeight,
    convInfo.dilationWidth,
    convInfo.filterDepth,
    convInfo.filterHeight,
    convInfo.filterWidth,
    convInfo.padInfo.front,
    convInfo.padInfo.top,
    convInfo.padInfo.left,
  );
  return out;
}
export const conv3DConfig = {
  kernelName: Conv3D,
  backendName: 'wasm',
  setupFunc: setup,
  kernelFunc: conv3D,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udjNELmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1iYWNrZW5kLXdhc20vc3JjL2tlcm5lbHMvQ29udjNELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsTUFBTSxFQUFrRSxNQUFNLHVCQUF1QixDQUFDO0FBSTVILElBQUksVUFPMEQsQ0FBQztBQUUvRCxTQUFTLEtBQUssQ0FBQyxPQUFvQjtJQUNqQyxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtRQUM1QyxRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVEsRUFBRyxVQUFVO0tBQ3RCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUFDLElBSXRCO0lBQ0MsTUFBTSxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3RDLE1BQU0sRUFBQyxDQUFDLEVBQUUsTUFBTSxFQUFDLEdBQUcsTUFBTSxDQUFDO0lBQzNCLE1BQU0sRUFBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBQyxHQUFHLEtBQUssQ0FBQztJQUN4QyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1FBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3JFO0lBQ0QsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtRQUM5QixNQUFNLElBQUksS0FBSyxDQUNYLDhDQUE4QyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNuRTtJQUVELE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FDM0MsQ0FBQyxDQUFDLEtBQWlELEVBQ25ELE1BQU0sQ0FBQyxLQUFpRCxFQUFFLE9BQU8sRUFDakUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXBCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0QsVUFBVSxDQUNOLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQ2xDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQ3ZDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQ3BDLFFBQVEsQ0FBQyxTQUFTLEVBQ2xCLFFBQVEsQ0FBQyxPQUFPLEVBQ2hCLFFBQVEsQ0FBQyxRQUFRLEVBQ2pCLFFBQVEsQ0FBQyxPQUFPLEVBQ2hCLFFBQVEsQ0FBQyxVQUFVLEVBQ25CLFFBQVEsQ0FBQyxRQUFRLEVBQ2pCLFFBQVEsQ0FBQyxTQUFTLEVBQ2xCLFFBQVEsQ0FBQyxRQUFRLEVBQ2pCLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFFBQVEsQ0FBQyxZQUFZLEVBQ3JCLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFFBQVEsQ0FBQyxhQUFhLEVBQ3RCLFFBQVEsQ0FBQyxjQUFjLEVBQ3ZCLFFBQVEsQ0FBQyxhQUFhLEVBQ3RCLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFFBQVEsQ0FBQyxZQUFZLEVBQ3JCLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUN0QixRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFDcEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ3hCLENBQUM7SUFDRixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQWlCO0lBQ3hDLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLFVBQVUsRUFBRSxNQUErQjtDQUM1QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjMgR29vZ2xlIExMQy5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQge2JhY2tlbmRfdXRpbCwgQ29udjNELCBDb252M0RBdHRycywgQ29udjNESW5wdXRzLCBLZXJuZWxDb25maWcsIEtlcm5lbEZ1bmMsIFRlbnNvckluZm99IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7QmFja2VuZFdhc219IGZyb20gJy4uL2JhY2tlbmRfd2FzbSc7XG5cbmxldCB3YXNtQ29udjNEOiAoXG4gICAgeElkOiBudW1iZXIsIGZpbHRlcklkOiBudW1iZXIsIG91dElkOiBudW1iZXIsIGJhdGNoU2l6ZTogbnVtYmVyLFxuICAgIGluRGVwdGg6IG51bWJlciwgaW5IZWlnaHQ6IG51bWJlciwgaW5XaWR0aDogbnVtYmVyLCBpbkNoYW5uZWxzOiBudW1iZXIsXG4gICAgb3V0RGVwdGg6IG51bWJlciwgb3V0SGVpZ2h0OiBudW1iZXIsIG91dFdpZHRoOiBudW1iZXIsIG91dENoYW5uZWxzOiBudW1iZXIsXG4gICAgc3RyaWRlRGVwdGg6IG51bWJlciwgc3RyaWRlSGVpZ2h0OiBudW1iZXIsIHN0cmlkZVdpZHRoOiBudW1iZXIsXG4gICAgZGlsYXRpb25EZXB0aDogbnVtYmVyLCBkaWxhdGlvbkhlaWdodDogbnVtYmVyLCBkaWxhdGlvbldpZHRoOiBudW1iZXIsXG4gICAgZmlsdGVyRGVwdGg6IG51bWJlciwgZmlsdGVySGVpZ2h0OiBudW1iZXIsIGZpbHRlcldpZHRoOiBudW1iZXIsXG4gICAgcGFkRnJvbnQ6IG51bWJlciwgcGFkVG9wOiBudW1iZXIsIHBhZExlZnQ6IG51bWJlcikgPT4gdm9pZDtcblxuZnVuY3Rpb24gc2V0dXAoYmFja2VuZDogQmFja2VuZFdhc20pIHtcbiAgd2FzbUNvbnYzRCA9IGJhY2tlbmQud2FzbS5jd3JhcChDb252M0QsIG51bGwsIFtcbiAgICAnbnVtYmVyJywgIC8vIHhJZFxuICAgICdudW1iZXInLCAgLy8gZmlsdGVySWRcbiAgICAnbnVtYmVyJywgIC8vIG91dElkXG4gICAgJ251bWJlcicsICAvLyBiYXRjaFNpemVcbiAgICAnbnVtYmVyJywgIC8vIGluRGVwdGhcbiAgICAnbnVtYmVyJywgIC8vIGluSGVpZ2h0XG4gICAgJ251bWJlcicsICAvLyBpbldpZHRoXG4gICAgJ251bWJlcicsICAvLyBpbkNoYW5uZWxzXG4gICAgJ251bWJlcicsICAvLyBvdXREZXB0aFxuICAgICdudW1iZXInLCAgLy8gb3V0SGVpZ2h0XG4gICAgJ251bWJlcicsICAvLyBvdXRXaWR0aFxuICAgICdudW1iZXInLCAgLy8gb3V0Q2hhbm5lbHNcbiAgICAnbnVtYmVyJywgIC8vIHN0cmlkZURlcHRoXG4gICAgJ251bWJlcicsICAvLyBzdHJpZGVIZWlnaHRcbiAgICAnbnVtYmVyJywgIC8vIHN0cmlkZVdpZHRoXG4gICAgJ251bWJlcicsICAvLyBkaWxhdGlvbkRlcHRoXG4gICAgJ251bWJlcicsICAvLyBkaWxhdGlvbkhlaWdodFxuICAgICdudW1iZXInLCAgLy8gZGlsYXRpb25XaWR0aFxuICAgICdudW1iZXInLCAgLy8gZmlsdGVyRGVwdGhcbiAgICAnbnVtYmVyJywgIC8vIGZpbHRlckhlaWdodFxuICAgICdudW1iZXInLCAgLy8gZmlsdGVyV2lkdGhcbiAgICAnbnVtYmVyJywgIC8vIHBhZEZyb250XG4gICAgJ251bWJlcicsICAvLyBwYWRUb3BcbiAgICAnbnVtYmVyJywgIC8vIHBhZExlZnRcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252M0QoYXJnczoge1xuICBpbnB1dHM6IENvbnYzRElucHV0cyxcbiAgYXR0cnM6IENvbnYzREF0dHJzLFxuICBiYWNrZW5kOiBCYWNrZW5kV2FzbSxcbn0pOiBUZW5zb3JJbmZvIHtcbiAgY29uc3Qge2lucHV0cywgYmFja2VuZCwgYXR0cnN9ID0gYXJncztcbiAgY29uc3Qge3gsIGZpbHRlcn0gPSBpbnB1dHM7XG4gIGNvbnN0IHtzdHJpZGVzLCBwYWQsIGRpbGF0aW9uc30gPSBhdHRycztcbiAgaWYgKHguZHR5cGUgIT09ICdmbG9hdDMyJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgVGVuc29yIHggbXVzdCBoYXZlIGR0eXBlIGZsb2F0MzIsIGdvdCAke3guZHR5cGV9YCk7XG4gIH1cbiAgaWYgKGZpbHRlci5kdHlwZSAhPT0gJ2Zsb2F0MzInKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGVuc29yIGZpbHRlciBtdXN0IGhhdmUgZHR5cGUgZmxvYXQzMiwgZ290ICR7ZmlsdGVyLmR0eXBlfWApO1xuICB9XG5cbiAgY29uc3QgY29udkluZm8gPSBiYWNrZW5kX3V0aWwuY29tcHV0ZUNvbnYzREluZm8oXG4gICAgICB4LnNoYXBlIGFzIFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sXG4gICAgICBmaWx0ZXIuc2hhcGUgYXMgW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSwgc3RyaWRlcyxcbiAgICAgIGRpbGF0aW9ucywgcGFkKTtcblxuICBjb25zdCBvdXQgPSBiYWNrZW5kLm1ha2VPdXRwdXQoY29udkluZm8ub3V0U2hhcGUsIHguZHR5cGUpO1xuICB3YXNtQ29udjNEKFxuICAgICAgYmFja2VuZC5kYXRhSWRNYXAuZ2V0KHguZGF0YUlkKS5pZCxcbiAgICAgIGJhY2tlbmQuZGF0YUlkTWFwLmdldChmaWx0ZXIuZGF0YUlkKS5pZCxcbiAgICAgIGJhY2tlbmQuZGF0YUlkTWFwLmdldChvdXQuZGF0YUlkKS5pZCxcbiAgICAgIGNvbnZJbmZvLmJhdGNoU2l6ZSxcbiAgICAgIGNvbnZJbmZvLmluRGVwdGgsXG4gICAgICBjb252SW5mby5pbkhlaWdodCxcbiAgICAgIGNvbnZJbmZvLmluV2lkdGgsXG4gICAgICBjb252SW5mby5pbkNoYW5uZWxzLFxuICAgICAgY29udkluZm8ub3V0RGVwdGgsXG4gICAgICBjb252SW5mby5vdXRIZWlnaHQsXG4gICAgICBjb252SW5mby5vdXRXaWR0aCxcbiAgICAgIGNvbnZJbmZvLm91dENoYW5uZWxzLFxuICAgICAgY29udkluZm8uc3RyaWRlRGVwdGgsXG4gICAgICBjb252SW5mby5zdHJpZGVIZWlnaHQsXG4gICAgICBjb252SW5mby5zdHJpZGVXaWR0aCxcbiAgICAgIGNvbnZJbmZvLmRpbGF0aW9uRGVwdGgsXG4gICAgICBjb252SW5mby5kaWxhdGlvbkhlaWdodCxcbiAgICAgIGNvbnZJbmZvLmRpbGF0aW9uV2lkdGgsXG4gICAgICBjb252SW5mby5maWx0ZXJEZXB0aCxcbiAgICAgIGNvbnZJbmZvLmZpbHRlckhlaWdodCxcbiAgICAgIGNvbnZJbmZvLmZpbHRlcldpZHRoLFxuICAgICAgY29udkluZm8ucGFkSW5mby5mcm9udCxcbiAgICAgIGNvbnZJbmZvLnBhZEluZm8udG9wLFxuICAgICAgY29udkluZm8ucGFkSW5mby5sZWZ0LFxuICApO1xuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgY29udjNEQ29uZmlnOiBLZXJuZWxDb25maWcgPSB7XG4gIGtlcm5lbE5hbWU6IENvbnYzRCxcbiAgYmFja2VuZE5hbWU6ICd3YXNtJyxcbiAgc2V0dXBGdW5jOiBzZXR1cCxcbiAga2VybmVsRnVuYzogY29udjNEIGFzIHVua25vd24gYXMgS2VybmVsRnVuY1xufTtcbiJdfQ==
