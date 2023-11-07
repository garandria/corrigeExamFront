var WasmBackendModule = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return function (WasmBackendModule) {
    WasmBackendModule = WasmBackendModule || {};

    var Module = typeof WasmBackendModule != 'undefined' ? WasmBackendModule : {};
    var readyPromiseResolve, readyPromiseReject;
    Module['ready'] = new Promise(function (resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var beforeListeners;
    if (typeof process !== 'undefined' && process.listeners) {
      beforeListeners = {
        uncaughtException: process.listeners('uncaughtException'),
        unhandledRejection: process.listeners('unhandledRejection'),
      };
    }
    var moduleOverrides = Object.assign({}, Module);
    var arguments_ = [];
    var thisProgram = './this.program';
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var ENVIRONMENT_IS_WEB = typeof window == 'object';
    var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
    var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
    var scriptDirectory = '';
    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    function logExceptionOnExit(e) {
      if (e instanceof ExitStatus) return;
      let toLog = e;
      err('exiting due to exception: ' + toLog);
    }
    if (ENVIRONMENT_IS_NODE) {
      var fs = require('fs');
      var nodePath = require('path');
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
      } else {
        scriptDirectory = __dirname + '/';
      }
      read_ = (filename, binary) => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        return fs.readFileSync(filename, binary ? undefined : 'utf8');
      };
      readBinary = filename => {
        var ret = read_(filename, true);
        if (!ret.buffer) {
          ret = new Uint8Array(ret);
        }
        return ret;
      };
      readAsync = (filename, onload, onerror) => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        fs.readFile(filename, function (err, data) {
          if (err) onerror(err);
          else onload(data.buffer);
        });
      };
      if (process['argv'].length > 1) {
        thisProgram = process['argv'][1].replace(/\\/g, '/');
      }
      arguments_ = process['argv'].slice(2);
      process['on']('uncaughtException', function (ex) {
        if (!(ex instanceof ExitStatus)) {
          throw ex;
        }
      });
      process['on']('unhandledRejection', function (reason) {
        throw reason;
      });
      quit_ = (status, toThrow) => {
        if (keepRuntimeAlive()) {
          process['exitCode'] = status;
          throw toThrow;
        }
        logExceptionOnExit(toThrow);
        process['exit'](status);
      };
      Module['inspect'] = function () {
        return '[Emscripten Module object]';
      };
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != 'undefined' && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf('blob:') !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1);
      } else {
        scriptDirectory = '';
      }
      {
        read_ = url => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = url => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.responseType = 'arraybuffer';
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = (url, onload, onerror) => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'arraybuffer';
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
      setWindowTitle = title => (document.title = title);
    } else {
    }
    var out = Module['print'] || console.log.bind(console);
    var err = Module['printErr'] || console.warn.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module['arguments']) arguments_ = Module['arguments'];
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    if (Module['quit']) quit_ = Module['quit'];
    var POINTER_SIZE = 4;
    var wasmBinary;
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    var noExitRuntime = Module['noExitRuntime'] || true;
    if (typeof WebAssembly != 'object') {
      abort('no native wasm support detected');
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
    }
    var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
    function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
      idx >>>= 0;
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode(((u0 & 31) << 6) | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      ptr >>>= 0;
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      outIdx >>>= 0;
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++ >>> 0] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++ >>> 0] = 192 | (u >> 6);
          heap[outIdx++ >>> 0] = 128 | (u & 63);
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++ >>> 0] = 224 | (u >> 12);
          heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
          heap[outIdx++ >>> 0] = 128 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++ >>> 0] = 240 | (u >> 18);
          heap[outIdx++ >>> 0] = 128 | ((u >> 12) & 63);
          heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
          heap[outIdx++ >>> 0] = 128 | (u & 63);
        }
      }
      heap[outIdx >>> 0] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module['HEAP8'] = HEAP8 = new Int8Array(buf);
      Module['HEAP16'] = HEAP16 = new Int16Array(buf);
      Module['HEAP32'] = HEAP32 = new Int32Array(buf);
      Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
      Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
      Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
      Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
      Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
    }
    var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
    var wasmTable;
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function keepRuntimeAlive() {
      return noExitRuntime;
    }
    function preRun() {
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      callRuntimeCallbacks(__ATINIT__);
    }
    function postRun() {
      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function addRunDependency(id) {
      runDependencies++;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      if (Module['onAbort']) {
        Module['onAbort'](what);
      }
      what = 'Aborted(' + what + ')';
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what += '. Build with -sASSERTIONS for more info.';
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = 'data:application/octet-stream;base64,';
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    function isFileURI(filename) {
      return filename.startsWith('file://');
    }
    var wasmBinaryFile;
    wasmBinaryFile = 'tfjs-backend-wasm.wasm';
    if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile);
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        }
        throw 'both async and sync fetching of the wasm failed';
      } catch (err) {
        abort(err);
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == 'function' && !isFileURI(wasmBinaryFile)) {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' })
            .then(function (response) {
              if (!response['ok']) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
              }
              return response['arrayBuffer']();
            })
            .catch(function () {
              return getBinary(wasmBinaryFile);
            });
        } else {
          if (readAsync) {
            return new Promise(function (resolve, reject) {
              readAsync(
                wasmBinaryFile,
                function (response) {
                  resolve(new Uint8Array(response));
                },
                reject,
              );
            });
          }
        }
      }
      return Promise.resolve().then(function () {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = { env: asmLibraryArg, wasi_snapshot_preview1: asmLibraryArg };
      function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module['asm'] = exports;
        wasmMemory = Module['asm']['memory'];
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module['asm']['__indirect_function_table'];
        addOnInit(Module['asm']['__wasm_call_ctors']);
        removeRunDependency('wasm-instantiate');
      }
      addRunDependency('wasm-instantiate');
      function receiveInstantiationResult(result) {
        receiveInstance(result['instance']);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
          .then(function (binary) {
            return WebAssembly.instantiate(binary, info);
          })
          .then(function (instance) {
            return instance;
          })
          .then(receiver, function (reason) {
            err('failed to asynchronously prepare wasm: ' + reason);
            abort(reason);
          });
      }
      function instantiateAsync() {
        if (
          !wasmBinary &&
          typeof WebAssembly.instantiateStreaming == 'function' &&
          !isDataURI(wasmBinaryFile) &&
          !isFileURI(wasmBinaryFile) &&
          !ENVIRONMENT_IS_NODE &&
          typeof fetch == 'function'
        ) {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
            var result = WebAssembly.instantiateStreaming(response, info);
            return result.then(receiveInstantiationResult, function (reason) {
              err('wasm streaming compile failed: ' + reason);
              err('falling back to ArrayBuffer instantiation');
              return instantiateArrayBuffer(receiveInstantiationResult);
            });
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult);
        }
      }
      if (Module['instantiateWasm']) {
        try {
          var exports = Module['instantiateWasm'](info, receiveInstance);
          return exports;
        } catch (e) {
          err('Module.instantiateWasm callback failed with error: ' + e);
          readyPromiseReject(e);
        }
      }
      instantiateAsync().catch(readyPromiseReject);
      return {};
    }
    var tempDouble;
    var tempI64;
    function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
    }
    function _abort() {
      abort('');
    }
    function getHeapMax() {
      return 4294901760;
    }
    function _emscripten_get_heap_max() {
      return getHeapMax();
    }
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest >>> 0, src >>> 0, (src + num) >>> 0);
    }
    function emscripten_realloc_buffer(size) {
      try {
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
      } catch (e) {}
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    }
    var SYSCALLS = {
      varargs: undefined,
      get: function () {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(SYSCALLS.varargs - 4) >>> 2];
        return ret;
      },
      getStr: function (ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
    };
    function _fd_close(fd) {
      return 52;
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      return 70;
    }
    var printCharBuffers = [null, [], []];
    function printChar(stream, curr) {
      var buffer = printCharBuffers[stream];
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >>> 2];
        var len = HEAPU32[(iov + 4) >>> 2];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[(ptr + j) >>> 0]);
        }
        num += len;
      }
      HEAPU32[pnum >>> 2] = num;
      return 0;
    }
    function getCFunc(ident) {
      var func = Module['_' + ident];
      return func;
    }
    function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer >>> 0);
    }
    function ccall(ident, returnType, argTypes, args, opts) {
      var toC = {
        string: str => {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) {
            var len = (str.length << 2) + 1;
            ret = stackAlloc(len);
            stringToUTF8(str, ret, len);
          }
          return ret;
        },
        array: arr => {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        },
      };
      function convertReturnValue(ret) {
        if (returnType === 'string') {
          return UTF8ToString(ret);
        }
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
      ret = onDone(ret);
      return ret;
    }
    function cwrap(ident, returnType, argTypes, opts) {
      argTypes = argTypes || [];
      var numericArgs = argTypes.every(type => type === 'number' || type === 'boolean');
      var numericRet = returnType !== 'string';
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
      }
      return function () {
        return ccall(ident, returnType, argTypes, arguments, opts);
      };
    }
    var asmLibraryArg = {
      abort: _abort,
      emscripten_get_heap_max: _emscripten_get_heap_max,
      emscripten_memcpy_big: _emscripten_memcpy_big,
      emscripten_resize_heap: _emscripten_resize_heap,
      fd_close: _fd_close,
      fd_seek: _fd_seek,
      fd_write: _fd_write,
    };
    var asm = createWasm();
    var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
      return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['__wasm_call_ctors']).apply(null, arguments);
    });
    var _init = (Module['_init'] = function () {
      return (_init = Module['_init'] = Module['asm']['init']).apply(null, arguments);
    });
    var _init_with_threads_count = (Module['_init_with_threads_count'] = function () {
      return (_init_with_threads_count = Module['_init_with_threads_count'] = Module['asm']['init_with_threads_count']).apply(
        null,
        arguments,
      );
    });
    var _get_threads_count = (Module['_get_threads_count'] = function () {
      return (_get_threads_count = Module['_get_threads_count'] = Module['asm']['get_threads_count']).apply(null, arguments);
    });
    var _register_tensor = (Module['_register_tensor'] = function () {
      return (_register_tensor = Module['_register_tensor'] = Module['asm']['register_tensor']).apply(null, arguments);
    });
    var _dispose_data = (Module['_dispose_data'] = function () {
      return (_dispose_data = Module['_dispose_data'] = Module['asm']['dispose_data']).apply(null, arguments);
    });
    var _dispose = (Module['_dispose'] = function () {
      return (_dispose = Module['_dispose'] = Module['asm']['dispose']).apply(null, arguments);
    });
    var _Abs = (Module['_Abs'] = function () {
      return (_Abs = Module['_Abs'] = Module['asm']['Abs']).apply(null, arguments);
    });
    var _Acos = (Module['_Acos'] = function () {
      return (_Acos = Module['_Acos'] = Module['asm']['Acos']).apply(null, arguments);
    });
    var _Acosh = (Module['_Acosh'] = function () {
      return (_Acosh = Module['_Acosh'] = Module['asm']['Acosh']).apply(null, arguments);
    });
    var _Add = (Module['_Add'] = function () {
      return (_Add = Module['_Add'] = Module['asm']['Add']).apply(null, arguments);
    });
    var _AddN = (Module['_AddN'] = function () {
      return (_AddN = Module['_AddN'] = Module['asm']['AddN']).apply(null, arguments);
    });
    var _All = (Module['_All'] = function () {
      return (_All = Module['_All'] = Module['asm']['All']).apply(null, arguments);
    });
    var _Any = (Module['_Any'] = function () {
      return (_Any = Module['_Any'] = Module['asm']['Any']).apply(null, arguments);
    });
    var _ArgMax = (Module['_ArgMax'] = function () {
      return (_ArgMax = Module['_ArgMax'] = Module['asm']['ArgMax']).apply(null, arguments);
    });
    var _ArgMin = (Module['_ArgMin'] = function () {
      return (_ArgMin = Module['_ArgMin'] = Module['asm']['ArgMin']).apply(null, arguments);
    });
    var _Asin = (Module['_Asin'] = function () {
      return (_Asin = Module['_Asin'] = Module['asm']['Asin']).apply(null, arguments);
    });
    var _Asinh = (Module['_Asinh'] = function () {
      return (_Asinh = Module['_Asinh'] = Module['asm']['Asinh']).apply(null, arguments);
    });
    var _Atan = (Module['_Atan'] = function () {
      return (_Atan = Module['_Atan'] = Module['asm']['Atan']).apply(null, arguments);
    });
    var _Atan2 = (Module['_Atan2'] = function () {
      return (_Atan2 = Module['_Atan2'] = Module['asm']['Atan2']).apply(null, arguments);
    });
    var _Atanh = (Module['_Atanh'] = function () {
      return (_Atanh = Module['_Atanh'] = Module['asm']['Atanh']).apply(null, arguments);
    });
    var _AvgPool = (Module['_AvgPool'] = function () {
      return (_AvgPool = Module['_AvgPool'] = Module['asm']['AvgPool']).apply(null, arguments);
    });
    var _AvgPool3D = (Module['_AvgPool3D'] = function () {
      return (_AvgPool3D = Module['_AvgPool3D'] = Module['asm']['AvgPool3D']).apply(null, arguments);
    });
    var _AvgPool3DGrad = (Module['_AvgPool3DGrad'] = function () {
      return (_AvgPool3DGrad = Module['_AvgPool3DGrad'] = Module['asm']['AvgPool3DGrad']).apply(null, arguments);
    });
    var _AvgPoolGrad = (Module['_AvgPoolGrad'] = function () {
      return (_AvgPoolGrad = Module['_AvgPoolGrad'] = Module['asm']['AvgPoolGrad']).apply(null, arguments);
    });
    var _BatchMatMul = (Module['_BatchMatMul'] = function () {
      return (_BatchMatMul = Module['_BatchMatMul'] = Module['asm']['BatchMatMul']).apply(null, arguments);
    });
    var _Bincount = (Module['_Bincount'] = function () {
      return (_Bincount = Module['_Bincount'] = Module['asm']['Bincount']).apply(null, arguments);
    });
    var _BitwiseAnd = (Module['_BitwiseAnd'] = function () {
      return (_BitwiseAnd = Module['_BitwiseAnd'] = Module['asm']['BitwiseAnd']).apply(null, arguments);
    });
    var _Ceil = (Module['_Ceil'] = function () {
      return (_Ceil = Module['_Ceil'] = Module['asm']['Ceil']).apply(null, arguments);
    });
    var _ClipByValue = (Module['_ClipByValue'] = function () {
      return (_ClipByValue = Module['_ClipByValue'] = Module['asm']['ClipByValue']).apply(null, arguments);
    });
    var _Conv2D = (Module['_Conv2D'] = function () {
      return (_Conv2D = Module['_Conv2D'] = Module['asm']['Conv2D']).apply(null, arguments);
    });
    var _Conv2DBackpropInput = (Module['_Conv2DBackpropInput'] = function () {
      return (_Conv2DBackpropInput = Module['_Conv2DBackpropInput'] = Module['asm']['Conv2DBackpropInput']).apply(null, arguments);
    });
    var _Conv3D = (Module['_Conv3D'] = function () {
      return (_Conv3D = Module['_Conv3D'] = Module['asm']['Conv3D']).apply(null, arguments);
    });
    var _Conv3DBackpropFilterV2 = (Module['_Conv3DBackpropFilterV2'] = function () {
      return (_Conv3DBackpropFilterV2 = Module['_Conv3DBackpropFilterV2'] = Module['asm']['Conv3DBackpropFilterV2']).apply(null, arguments);
    });
    var _Conv3DBackpropInputV2 = (Module['_Conv3DBackpropInputV2'] = function () {
      return (_Conv3DBackpropInputV2 = Module['_Conv3DBackpropInputV2'] = Module['asm']['Conv3DBackpropInputV2']).apply(null, arguments);
    });
    var _Cos = (Module['_Cos'] = function () {
      return (_Cos = Module['_Cos'] = Module['asm']['Cos']).apply(null, arguments);
    });
    var _Cosh = (Module['_Cosh'] = function () {
      return (_Cosh = Module['_Cosh'] = Module['asm']['Cosh']).apply(null, arguments);
    });
    var _CropAndResize = (Module['_CropAndResize'] = function () {
      return (_CropAndResize = Module['_CropAndResize'] = Module['asm']['CropAndResize']).apply(null, arguments);
    });
    var _Cumprod = (Module['_Cumprod'] = function () {
      return (_Cumprod = Module['_Cumprod'] = Module['asm']['Cumprod']).apply(null, arguments);
    });
    var _Cumsum = (Module['_Cumsum'] = function () {
      return (_Cumsum = Module['_Cumsum'] = Module['asm']['Cumsum']).apply(null, arguments);
    });
    var _DenseBincount = (Module['_DenseBincount'] = function () {
      return (_DenseBincount = Module['_DenseBincount'] = Module['asm']['DenseBincount']).apply(null, arguments);
    });
    var _DepthToSpace = (Module['_DepthToSpace'] = function () {
      return (_DepthToSpace = Module['_DepthToSpace'] = Module['asm']['DepthToSpace']).apply(null, arguments);
    });
    var _DepthwiseConv2dNative = (Module['_DepthwiseConv2dNative'] = function () {
      return (_DepthwiseConv2dNative = Module['_DepthwiseConv2dNative'] = Module['asm']['DepthwiseConv2dNative']).apply(null, arguments);
    });
    var _Diag = (Module['_Diag'] = function () {
      return (_Diag = Module['_Diag'] = Module['asm']['Diag']).apply(null, arguments);
    });
    var _Dilation2D = (Module['_Dilation2D'] = function () {
      return (_Dilation2D = Module['_Dilation2D'] = Module['asm']['Dilation2D']).apply(null, arguments);
    });
    var _Dilation2DBackpropFilter = (Module['_Dilation2DBackpropFilter'] = function () {
      return (_Dilation2DBackpropFilter = Module['_Dilation2DBackpropFilter'] = Module['asm']['Dilation2DBackpropFilter']).apply(
        null,
        arguments,
      );
    });
    var _Dilation2DBackpropInput = (Module['_Dilation2DBackpropInput'] = function () {
      return (_Dilation2DBackpropInput = Module['_Dilation2DBackpropInput'] = Module['asm']['Dilation2DBackpropInput']).apply(
        null,
        arguments,
      );
    });
    var _Elu = (Module['_Elu'] = function () {
      return (_Elu = Module['_Elu'] = Module['asm']['Elu']).apply(null, arguments);
    });
    var _EluGrad = (Module['_EluGrad'] = function () {
      return (_EluGrad = Module['_EluGrad'] = Module['asm']['EluGrad']).apply(null, arguments);
    });
    var _Equal = (Module['_Equal'] = function () {
      return (_Equal = Module['_Equal'] = Module['asm']['Equal']).apply(null, arguments);
    });
    var _Erf = (Module['_Erf'] = function () {
      return (_Erf = Module['_Erf'] = Module['asm']['Erf']).apply(null, arguments);
    });
    var _Exp = (Module['_Exp'] = function () {
      return (_Exp = Module['_Exp'] = Module['asm']['Exp']).apply(null, arguments);
    });
    var _Expm1 = (Module['_Expm1'] = function () {
      return (_Expm1 = Module['_Expm1'] = Module['asm']['Expm1']).apply(null, arguments);
    });
    var _FlipLeftRight = (Module['_FlipLeftRight'] = function () {
      return (_FlipLeftRight = Module['_FlipLeftRight'] = Module['asm']['FlipLeftRight']).apply(null, arguments);
    });
    var _Floor = (Module['_Floor'] = function () {
      return (_Floor = Module['_Floor'] = Module['asm']['Floor']).apply(null, arguments);
    });
    var _FloorDiv = (Module['_FloorDiv'] = function () {
      return (_FloorDiv = Module['_FloorDiv'] = Module['asm']['FloorDiv']).apply(null, arguments);
    });
    var _FusedBatchNorm = (Module['_FusedBatchNorm'] = function () {
      return (_FusedBatchNorm = Module['_FusedBatchNorm'] = Module['asm']['FusedBatchNorm']).apply(null, arguments);
    });
    var _FusedConv2D = (Module['_FusedConv2D'] = function () {
      return (_FusedConv2D = Module['_FusedConv2D'] = Module['asm']['FusedConv2D']).apply(null, arguments);
    });
    var _FusedDepthwiseConv2D = (Module['_FusedDepthwiseConv2D'] = function () {
      return (_FusedDepthwiseConv2D = Module['_FusedDepthwiseConv2D'] = Module['asm']['FusedDepthwiseConv2D']).apply(null, arguments);
    });
    var _Gather = (Module['_Gather'] = function () {
      return (_Gather = Module['_Gather'] = Module['asm']['Gather']).apply(null, arguments);
    });
    var _GatherNd = (Module['_GatherNd'] = function () {
      return (_GatherNd = Module['_GatherNd'] = Module['asm']['GatherNd']).apply(null, arguments);
    });
    var _Greater = (Module['_Greater'] = function () {
      return (_Greater = Module['_Greater'] = Module['asm']['Greater']).apply(null, arguments);
    });
    var _GreaterEqual = (Module['_GreaterEqual'] = function () {
      return (_GreaterEqual = Module['_GreaterEqual'] = Module['asm']['GreaterEqual']).apply(null, arguments);
    });
    var _IsFinite = (Module['_IsFinite'] = function () {
      return (_IsFinite = Module['_IsFinite'] = Module['asm']['IsFinite']).apply(null, arguments);
    });
    var _IsInf = (Module['_IsInf'] = function () {
      return (_IsInf = Module['_IsInf'] = Module['asm']['IsInf']).apply(null, arguments);
    });
    var _IsNan = (Module['_IsNan'] = function () {
      return (_IsNan = Module['_IsNan'] = Module['asm']['IsNan']).apply(null, arguments);
    });
    var _LRN = (Module['_LRN'] = function () {
      return (_LRN = Module['_LRN'] = Module['asm']['LRN']).apply(null, arguments);
    });
    var _LRNGrad = (Module['_LRNGrad'] = function () {
      return (_LRNGrad = Module['_LRNGrad'] = Module['asm']['LRNGrad']).apply(null, arguments);
    });
    var _LeakyRelu = (Module['_LeakyRelu'] = function () {
      return (_LeakyRelu = Module['_LeakyRelu'] = Module['asm']['LeakyRelu']).apply(null, arguments);
    });
    var _Less = (Module['_Less'] = function () {
      return (_Less = Module['_Less'] = Module['asm']['Less']).apply(null, arguments);
    });
    var _LessEqual = (Module['_LessEqual'] = function () {
      return (_LessEqual = Module['_LessEqual'] = Module['asm']['LessEqual']).apply(null, arguments);
    });
    var _LinSpace = (Module['_LinSpace'] = function () {
      return (_LinSpace = Module['_LinSpace'] = Module['asm']['LinSpace']).apply(null, arguments);
    });
    var _Log = (Module['_Log'] = function () {
      return (_Log = Module['_Log'] = Module['asm']['Log']).apply(null, arguments);
    });
    var _Log1p = (Module['_Log1p'] = function () {
      return (_Log1p = Module['_Log1p'] = Module['asm']['Log1p']).apply(null, arguments);
    });
    var _LogicalAnd = (Module['_LogicalAnd'] = function () {
      return (_LogicalAnd = Module['_LogicalAnd'] = Module['asm']['LogicalAnd']).apply(null, arguments);
    });
    var _LogicalNot = (Module['_LogicalNot'] = function () {
      return (_LogicalNot = Module['_LogicalNot'] = Module['asm']['LogicalNot']).apply(null, arguments);
    });
    var _LogicalOr = (Module['_LogicalOr'] = function () {
      return (_LogicalOr = Module['_LogicalOr'] = Module['asm']['LogicalOr']).apply(null, arguments);
    });
    var _LogicalXor = (Module['_LogicalXor'] = function () {
      return (_LogicalXor = Module['_LogicalXor'] = Module['asm']['LogicalXor']).apply(null, arguments);
    });
    var _Max = (Module['_Max'] = function () {
      return (_Max = Module['_Max'] = Module['asm']['Max']).apply(null, arguments);
    });
    var _MaxPool = (Module['_MaxPool'] = function () {
      return (_MaxPool = Module['_MaxPool'] = Module['asm']['MaxPool']).apply(null, arguments);
    });
    var _MaxPool3D = (Module['_MaxPool3D'] = function () {
      return (_MaxPool3D = Module['_MaxPool3D'] = Module['asm']['MaxPool3D']).apply(null, arguments);
    });
    var _MaxPool3DGrad = (Module['_MaxPool3DGrad'] = function () {
      return (_MaxPool3DGrad = Module['_MaxPool3DGrad'] = Module['asm']['MaxPool3DGrad']).apply(null, arguments);
    });
    var _MaxPoolGrad = (Module['_MaxPoolGrad'] = function () {
      return (_MaxPoolGrad = Module['_MaxPoolGrad'] = Module['asm']['MaxPoolGrad']).apply(null, arguments);
    });
    var _MaxPoolWithArgmax = (Module['_MaxPoolWithArgmax'] = function () {
      return (_MaxPoolWithArgmax = Module['_MaxPoolWithArgmax'] = Module['asm']['MaxPoolWithArgmax']).apply(null, arguments);
    });
    var _Maximum = (Module['_Maximum'] = function () {
      return (_Maximum = Module['_Maximum'] = Module['asm']['Maximum']).apply(null, arguments);
    });
    var _Mean = (Module['_Mean'] = function () {
      return (_Mean = Module['_Mean'] = Module['asm']['Mean']).apply(null, arguments);
    });
    var _Min = (Module['_Min'] = function () {
      return (_Min = Module['_Min'] = Module['asm']['Min']).apply(null, arguments);
    });
    var _Minimum = (Module['_Minimum'] = function () {
      return (_Minimum = Module['_Minimum'] = Module['asm']['Minimum']).apply(null, arguments);
    });
    var _MirrorPad = (Module['_MirrorPad'] = function () {
      return (_MirrorPad = Module['_MirrorPad'] = Module['asm']['MirrorPad']).apply(null, arguments);
    });
    var _Mod = (Module['_Mod'] = function () {
      return (_Mod = Module['_Mod'] = Module['asm']['Mod']).apply(null, arguments);
    });
    var _Multinomial = (Module['_Multinomial'] = function () {
      return (_Multinomial = Module['_Multinomial'] = Module['asm']['Multinomial']).apply(null, arguments);
    });
    var _Multiply = (Module['_Multiply'] = function () {
      return (_Multiply = Module['_Multiply'] = Module['asm']['Multiply']).apply(null, arguments);
    });
    var _Neg = (Module['_Neg'] = function () {
      return (_Neg = Module['_Neg'] = Module['asm']['Neg']).apply(null, arguments);
    });
    var _NonMaxSuppressionV3 = (Module['_NonMaxSuppressionV3'] = function () {
      return (_NonMaxSuppressionV3 = Module['_NonMaxSuppressionV3'] = Module['asm']['NonMaxSuppressionV3']).apply(null, arguments);
    });
    var _NonMaxSuppressionV4 = (Module['_NonMaxSuppressionV4'] = function () {
      return (_NonMaxSuppressionV4 = Module['_NonMaxSuppressionV4'] = Module['asm']['NonMaxSuppressionV4']).apply(null, arguments);
    });
    var _NonMaxSuppressionV5 = (Module['_NonMaxSuppressionV5'] = function () {
      return (_NonMaxSuppressionV5 = Module['_NonMaxSuppressionV5'] = Module['asm']['NonMaxSuppressionV5']).apply(null, arguments);
    });
    var _NotEqual = (Module['_NotEqual'] = function () {
      return (_NotEqual = Module['_NotEqual'] = Module['asm']['NotEqual']).apply(null, arguments);
    });
    var _OneHot = (Module['_OneHot'] = function () {
      return (_OneHot = Module['_OneHot'] = Module['asm']['OneHot']).apply(null, arguments);
    });
    var _PadV2 = (Module['_PadV2'] = function () {
      return (_PadV2 = Module['_PadV2'] = Module['asm']['PadV2']).apply(null, arguments);
    });
    var _Pow = (Module['_Pow'] = function () {
      return (_Pow = Module['_Pow'] = Module['asm']['Pow']).apply(null, arguments);
    });
    var _Prelu = (Module['_Prelu'] = function () {
      return (_Prelu = Module['_Prelu'] = Module['asm']['Prelu']).apply(null, arguments);
    });
    var _Prod = (Module['_Prod'] = function () {
      return (_Prod = Module['_Prod'] = Module['asm']['Prod']).apply(null, arguments);
    });
    var _RealDiv = (Module['_RealDiv'] = function () {
      return (_RealDiv = Module['_RealDiv'] = Module['asm']['RealDiv']).apply(null, arguments);
    });
    var _Reciprocal = (Module['_Reciprocal'] = function () {
      return (_Reciprocal = Module['_Reciprocal'] = Module['asm']['Reciprocal']).apply(null, arguments);
    });
    var _Relu = (Module['_Relu'] = function () {
      return (_Relu = Module['_Relu'] = Module['asm']['Relu']).apply(null, arguments);
    });
    var _Relu6 = (Module['_Relu6'] = function () {
      return (_Relu6 = Module['_Relu6'] = Module['asm']['Relu6']).apply(null, arguments);
    });
    var _ResizeBilinear = (Module['_ResizeBilinear'] = function () {
      return (_ResizeBilinear = Module['_ResizeBilinear'] = Module['asm']['ResizeBilinear']).apply(null, arguments);
    });
    var _ResizeBilinearGrad = (Module['_ResizeBilinearGrad'] = function () {
      return (_ResizeBilinearGrad = Module['_ResizeBilinearGrad'] = Module['asm']['ResizeBilinearGrad']).apply(null, arguments);
    });
    var _ResizeNearestNeighbor = (Module['_ResizeNearestNeighbor'] = function () {
      return (_ResizeNearestNeighbor = Module['_ResizeNearestNeighbor'] = Module['asm']['ResizeNearestNeighbor']).apply(null, arguments);
    });
    var _ResizeNearestNeighborGrad = (Module['_ResizeNearestNeighborGrad'] = function () {
      return (_ResizeNearestNeighborGrad = Module['_ResizeNearestNeighborGrad'] = Module['asm']['ResizeNearestNeighborGrad']).apply(
        null,
        arguments,
      );
    });
    var _Reverse = (Module['_Reverse'] = function () {
      return (_Reverse = Module['_Reverse'] = Module['asm']['Reverse']).apply(null, arguments);
    });
    var _RotateWithOffset = (Module['_RotateWithOffset'] = function () {
      return (_RotateWithOffset = Module['_RotateWithOffset'] = Module['asm']['RotateWithOffset']).apply(null, arguments);
    });
    var _Round = (Module['_Round'] = function () {
      return (_Round = Module['_Round'] = Module['asm']['Round']).apply(null, arguments);
    });
    var _Rsqrt = (Module['_Rsqrt'] = function () {
      return (_Rsqrt = Module['_Rsqrt'] = Module['asm']['Rsqrt']).apply(null, arguments);
    });
    var _ScatterNd = (Module['_ScatterNd'] = function () {
      return (_ScatterNd = Module['_ScatterNd'] = Module['asm']['ScatterNd']).apply(null, arguments);
    });
    var _SearchSorted = (Module['_SearchSorted'] = function () {
      return (_SearchSorted = Module['_SearchSorted'] = Module['asm']['SearchSorted']).apply(null, arguments);
    });
    var _SelectV2 = (Module['_SelectV2'] = function () {
      return (_SelectV2 = Module['_SelectV2'] = Module['asm']['SelectV2']).apply(null, arguments);
    });
    var _Selu = (Module['_Selu'] = function () {
      return (_Selu = Module['_Selu'] = Module['asm']['Selu']).apply(null, arguments);
    });
    var _Sigmoid = (Module['_Sigmoid'] = function () {
      return (_Sigmoid = Module['_Sigmoid'] = Module['asm']['Sigmoid']).apply(null, arguments);
    });
    var _Sign = (Module['_Sign'] = function () {
      return (_Sign = Module['_Sign'] = Module['asm']['Sign']).apply(null, arguments);
    });
    var _Sin = (Module['_Sin'] = function () {
      return (_Sin = Module['_Sin'] = Module['asm']['Sin']).apply(null, arguments);
    });
    var _Sinh = (Module['_Sinh'] = function () {
      return (_Sinh = Module['_Sinh'] = Module['asm']['Sinh']).apply(null, arguments);
    });
    var _Softmax = (Module['_Softmax'] = function () {
      return (_Softmax = Module['_Softmax'] = Module['asm']['Softmax']).apply(null, arguments);
    });
    var _Softplus = (Module['_Softplus'] = function () {
      return (_Softplus = Module['_Softplus'] = Module['asm']['Softplus']).apply(null, arguments);
    });
    var _SparseFillEmptyRows = (Module['_SparseFillEmptyRows'] = function () {
      return (_SparseFillEmptyRows = Module['_SparseFillEmptyRows'] = Module['asm']['SparseFillEmptyRows']).apply(null, arguments);
    });
    var _SparseReshape = (Module['_SparseReshape'] = function () {
      return (_SparseReshape = Module['_SparseReshape'] = Module['asm']['SparseReshape']).apply(null, arguments);
    });
    var _SparseSegmentReduction = (Module['_SparseSegmentReduction'] = function () {
      return (_SparseSegmentReduction = Module['_SparseSegmentReduction'] = Module['asm']['SparseSegmentReduction']).apply(null, arguments);
    });
    var _SparseToDense = (Module['_SparseToDense'] = function () {
      return (_SparseToDense = Module['_SparseToDense'] = Module['asm']['SparseToDense']).apply(null, arguments);
    });
    var _Sqrt = (Module['_Sqrt'] = function () {
      return (_Sqrt = Module['_Sqrt'] = Module['asm']['Sqrt']).apply(null, arguments);
    });
    var _Square = (Module['_Square'] = function () {
      return (_Square = Module['_Square'] = Module['asm']['Square']).apply(null, arguments);
    });
    var _SquaredDifference = (Module['_SquaredDifference'] = function () {
      return (_SquaredDifference = Module['_SquaredDifference'] = Module['asm']['SquaredDifference']).apply(null, arguments);
    });
    var _Step = (Module['_Step'] = function () {
      return (_Step = Module['_Step'] = Module['asm']['Step']).apply(null, arguments);
    });
    var _StridedSlice = (Module['_StridedSlice'] = function () {
      return (_StridedSlice = Module['_StridedSlice'] = Module['asm']['StridedSlice']).apply(null, arguments);
    });
    var _Sub = (Module['_Sub'] = function () {
      return (_Sub = Module['_Sub'] = Module['asm']['Sub']).apply(null, arguments);
    });
    var _Sum = (Module['_Sum'] = function () {
      return (_Sum = Module['_Sum'] = Module['asm']['Sum']).apply(null, arguments);
    });
    var _Tan = (Module['_Tan'] = function () {
      return (_Tan = Module['_Tan'] = Module['asm']['Tan']).apply(null, arguments);
    });
    var _Tanh = (Module['_Tanh'] = function () {
      return (_Tanh = Module['_Tanh'] = Module['asm']['Tanh']).apply(null, arguments);
    });
    var _TensorScatterUpdate = (Module['_TensorScatterUpdate'] = function () {
      return (_TensorScatterUpdate = Module['_TensorScatterUpdate'] = Module['asm']['TensorScatterUpdate']).apply(null, arguments);
    });
    var _Tile = (Module['_Tile'] = function () {
      return (_Tile = Module['_Tile'] = Module['asm']['Tile']).apply(null, arguments);
    });
    var _TopK = (Module['_TopK'] = function () {
      return (_TopK = Module['_TopK'] = Module['asm']['TopK']).apply(null, arguments);
    });
    var _Transform = (Module['_Transform'] = function () {
      return (_Transform = Module['_Transform'] = Module['asm']['Transform']).apply(null, arguments);
    });
    var _Transpose = (Module['_Transpose'] = function () {
      return (_Transpose = Module['_Transpose'] = Module['asm']['Transpose']).apply(null, arguments);
    });
    var __FusedMatMul = (Module['__FusedMatMul'] = function () {
      return (__FusedMatMul = Module['__FusedMatMul'] = Module['asm']['_FusedMatMul']).apply(null, arguments);
    });
    var _malloc = (Module['_malloc'] = function () {
      return (_malloc = Module['_malloc'] = Module['asm']['malloc']).apply(null, arguments);
    });
    var _free = (Module['_free'] = function () {
      return (_free = Module['_free'] = Module['asm']['free']).apply(null, arguments);
    });
    var ___errno_location = (Module['___errno_location'] = function () {
      return (___errno_location = Module['___errno_location'] = Module['asm']['__errno_location']).apply(null, arguments);
    });
    var stackSave = (Module['stackSave'] = function () {
      return (stackSave = Module['stackSave'] = Module['asm']['stackSave']).apply(null, arguments);
    });
    var stackRestore = (Module['stackRestore'] = function () {
      return (stackRestore = Module['stackRestore'] = Module['asm']['stackRestore']).apply(null, arguments);
    });
    var stackAlloc = (Module['stackAlloc'] = function () {
      return (stackAlloc = Module['stackAlloc'] = Module['asm']['stackAlloc']).apply(null, arguments);
    });
    var dynCall_iijjiiii = (Module['dynCall_iijjiiii'] = function () {
      return (dynCall_iijjiiii = Module['dynCall_iijjiiii'] = Module['asm']['dynCall_iijjiiii']).apply(null, arguments);
    });
    var dynCall_jiji = (Module['dynCall_jiji'] = function () {
      return (dynCall_jiji = Module['dynCall_jiji'] = Module['asm']['dynCall_jiji']).apply(null, arguments);
    });
    Module['cwrap'] = cwrap;
    var calledRun;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function run(args) {
      args = args || arguments_;
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module['calledRun'] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve(Module);
        if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
        postRun();
      }
      if (Module['setStatus']) {
        Module['setStatus']('Running...');
        setTimeout(function () {
          setTimeout(function () {
            Module['setStatus']('');
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
      }
    }
    run();
    var listenersAdded;
    if (beforeListeners) {
      listenersAdded = {
        uncaughtException: process.listeners('uncaughtException').filter(function (listener) {
          return !beforeListeners.uncaughtException.indexOf(listener) > -1;
        }),
        unhandledRejection: process.listeners('unhandledRejection').filter(function (listener) {
          return !beforeListeners.unhandledRejection.indexOf(listener) > -1;
        }),
      };
    }
    var actualModule;
    if (typeof WasmBackendModule !== 'undefined') {
      actualModule = WasmBackendModule;
    } else if (typeof WasmBackendModuleThreadedSimd !== 'undefined') {
      actualModule = WasmBackendModuleThreadedSimd;
    } else {
      throw new Error('Could not find wasm module in post.js');
    }
    if (listenersAdded) {
      var tmpDispose = actualModule['_dispose'];
      actualModule['_dispose'] = function () {
        tmpDispose();
        listenersAdded.uncaughtException.forEach(function (listener) {
          process.removeListener('uncaughtException', listener);
        });
        listenersAdded.unhandledRejection.forEach(function (listener) {
          process.removeListener('unhandledRejection', listener);
        });
      };
    }

    return WasmBackendModule.ready;
  };
})();
if (typeof exports === 'object' && typeof module === 'object') module.exports = WasmBackendModule;
else if (typeof define === 'function' && define['amd'])
  define([], function () {
    return WasmBackendModule;
  });
else if (typeof exports === 'object') exports['WasmBackendModule'] = WasmBackendModule;
