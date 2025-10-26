const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createWebGLStub() {
  const state = {
    currentProgram: null,
    boundArrayBuffer: null,
    viewport: [0, 0, 0, 0],
    draws: [],
  };

  const gl = {
    DEPTH_TEST: 0x0b71,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    TRIANGLES: 0x0004,
    LINES: 0x0001,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    CURRENT_PROGRAM: Symbol('CURRENT_PROGRAM'),
    ARRAY_BUFFER_BINDING: Symbol('ARRAY_BUFFER_BINDING'),
    VIEWPORT: Symbol('VIEWPORT'),
    clearColor: () => {},
    enable: () => {},
    createShader: () => ({}),
    shaderSource: () => {},
    compileShader: () => {},
    getShaderParameter: () => true,
    getShaderInfoLog: () => '',
    deleteShader: () => {},
    createProgram: () => ({}),
    attachShader: () => {},
    linkProgram: () => {},
    getProgramParameter: () => true,
    getProgramInfoLog: () => '',
    useProgram: (program) => {
      state.currentProgram = program || {};
    },
    getAttribLocation: () => 0,
    getUniformLocation: () => ({}),
    createBuffer: () => ({}),
    bindBuffer: (target, buffer) => {
      if (target === gl.ARRAY_BUFFER) {
        state.boundArrayBuffer = buffer || {};
      }
    },
    bufferData: () => {},
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    uniformMatrix4fv: () => {},
    clear: () => {},
    viewport: (x, y, width, height) => {
      state.viewport = [x, y, width, height];
    },
    drawArrays: (mode, first, count) => {
      state.draws.push({ mode, first, count });
    },
    getParameter: (param) => {
      if (param === gl.CURRENT_PROGRAM) {
        return state.currentProgram;
      }
      if (param === gl.ARRAY_BUFFER_BINDING) {
        return state.boundArrayBuffer;
      }
      if (param === gl.VIEWPORT) {
        return state.viewport;
      }
      return null;
    },
  };

  return { gl, state };
}

function runGameScript() {
  const { gl, state } = createWebGLStub();
  const frameCallbacks = [];

  const canvas = {
    width: 0,
    height: 0,
    style: {},
    getContext: (type) => {
      if (type !== 'webgl') {
        throw new Error('Se esperaba contexto webgl');
      }
      return gl;
    },
    addEventListener: () => {},
    requestPointerLock: () => {
      document.pointerLockElement = canvas;
      if (document._pointerLockChange) {
        document._pointerLockChange();
      }
    },
  };

  const overlay = {
    className: 'visible',
    innerHTML: '',
  };

  const listeners = {
    document: {},
    window: {},
  };

  global.window = {
    innerWidth: 1280,
    innerHeight: 720,
    addEventListener: (event, handler) => {
      listeners.window[event] = handler;
    },
  };

  global.document = {
    pointerLockElement: null,
    _pointerLockChange: null,
    addEventListener: (event, handler) => {
      if (event === 'pointerlockchange') {
        document._pointerLockChange = handler;
      }
      listeners.document[event] = handler;
    },
    getElementById: (id) => {
      if (id === 'scene') return canvas;
      if (id === 'overlay') return overlay;
      return null;
    },
  };

  global.window.document = global.document;

  global.performance = {
    _now: 0,
    now() {
      return this._now;
    },
  };

  global.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };

  const scriptPath = path.resolve(__dirname, '..', 'scripts', 'main.js');
  const code = fs.readFileSync(scriptPath, 'utf8');
  vm.runInThisContext(code, { filename: scriptPath });

  let framesProcessed = 0;
  while (frameCallbacks.length > 0 && framesProcessed < 3) {
    const callback = frameCallbacks.shift();
    framesProcessed += 1;
    performance._now += 16;
    callback(performance._now);
  }

  return { canvas, overlay, glState: state };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTests() {
  const { canvas, overlay, glState } = runGameScript();

  assert(canvas.width === window.innerWidth, 'El canvas debe igualar el ancho de la ventana');
  assert(canvas.height === window.innerHeight, 'El canvas debe igualar el alto de la ventana');

  assert(glState.viewport[2] === window.innerWidth, 'Viewport debe usar el ancho completo');
  assert(glState.viewport[3] === window.innerHeight, 'Viewport debe usar el alto completo');

  const triangleDraw = glState.draws.find((draw) => draw.mode === 0x0004 && draw.count === 6);
  assert(triangleDraw, 'La baseplate debe dibujarse con dos triángulos');

  const blockLines = glState.draws.find((draw) => draw.mode === 0x0001 && draw.count === 516);
  assert(blockLines, 'La grid de bloques debe contener 516 vértices de línea');

  const chunkLines = glState.draws.find((draw) => draw.mode === 0x0001 && draw.count === 68);
  assert(chunkLines, 'La grid de chunks debe contener 68 vértices de línea');

  assert(glState.draws.length >= 3, 'Se esperan múltiples draw calls por cuadro');

  console.log('✅ Todas las pruebas pasaron');
  return { canvas, overlay, glState };
}

runTests();
