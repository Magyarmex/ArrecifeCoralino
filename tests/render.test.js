const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createWebGLStub() {
  const state = {
    currentProgram: null,
    boundArrayBuffer: null,
    viewport: [0, 0, 0, 0],
    draws: [],
    viewProjection: null,
    opacity: 1,
  };

  const gl = {
    DEPTH_TEST: 0x0b71,
    BLEND: 0x0be2,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    TRIANGLES: 0x0004,
    LINES: 0x0001,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    NO_ERROR: 0x0000,
    CURRENT_PROGRAM: Symbol('CURRENT_PROGRAM'),
    ARRAY_BUFFER_BINDING: Symbol('ARRAY_BUFFER_BINDING'),
    VIEWPORT: Symbol('VIEWPORT'),
    clearColor: () => {},
    enable: () => {},
    disable: () => {},
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
    uniformMatrix4fv: (location, transpose, value) => {
      if (value && typeof value.length === 'number') {
        state.viewProjection = Array.from(value);
      }
    },
    uniform1f: (location, value) => {
      if (typeof value === 'number') {
        state.opacity = value;
      }
    },
    clear: () => {},
    viewport: (x, y, width, height) => {
      state.viewport = [x, y, width, height];
    },
    drawArrays: (mode, first, count) => {
      state.draws.push({ mode, first, count });
    },
    blendFunc: () => {},
    getError: () => gl.NO_ERROR,
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
    getBoundingClientRect: () => ({ left: 0, top: 0, width: canvas.width, height: canvas.height }),
  };

  const overlay = {
    className: 'visible',
    innerHTML: '',
    addEventListener: () => {},
  };

  const startButton = {
    addEventListener: () => {},
  };

  const debugConsole = {
    textContent: '',
  };

  const settingsToggle = {
    _attributes: { 'aria-expanded': 'false' },
    addEventListener: () => {},
    setAttribute(name, value) {
      this._attributes[name] = value;
    },
    getAttribute(name) {
      return this._attributes[name];
    },
  };

  const settingsPanel = {
    hidden: true,
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  };

  const seedInput = {
    value: '',
    focus: () => {},
    select: () => {},
    getAttribute: () => null,
  };

  const randomSeedButton = {
    addEventListener: () => {},
  };

  const seeThroughToggle = {
    checked: false,
    _listeners: {},
    addEventListener(event, handler) {
      this._listeners[event] = handler;
    },
    dispatch(eventType) {
      const handler = this._listeners[eventType];
      if (handler) {
        handler({ target: this });
      }
    },
  };

  const selectionInfoPanel = {
    hidden: true,
  };

  const selectionCloseButton = {
    addEventListener: () => {},
  };

  const createField = () => ({ textContent: '—' });

  const selectionBlockField = createField();
  const selectionChunkField = createField();
  const selectionWorldField = createField();
  const selectionHeightField = createField();
  const selectionWaterField = createField();
  const selectionDepthField = createField();

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
      if (id === 'start-button') return startButton;
      if (id === 'debug-console') return debugConsole;
      if (id === 'settings-toggle') return settingsToggle;
      if (id === 'settings-panel') return settingsPanel;
      if (id === 'seed-input') return seedInput;
      if (id === 'random-seed') return randomSeedButton;
      if (id === 'see-through-toggle') return seeThroughToggle;
      if (id === 'selection-info') return selectionInfoPanel;
      if (id === 'selection-close') return selectionCloseButton;
      if (id === 'selection-info-block') return selectionBlockField;
      if (id === 'selection-info-chunk') return selectionChunkField;
      if (id === 'selection-info-world') return selectionWorldField;
      if (id === 'selection-info-height') return selectionHeightField;
      if (id === 'selection-info-water') return selectionWaterField;
      if (id === 'selection-info-depth') return selectionDepthField;
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

  function stepFrames(count = 1) {
    let processed = 0;
    while (frameCallbacks.length > 0 && processed < count) {
      const callback = frameCallbacks.shift();
      processed += 1;
      performance._now += 16;
      callback(performance._now);
    }
    return processed;
  }

  stepFrames(3);

  return {
    canvas,
    overlay,
    debugConsole,
    glState: state,
    stepFrame: stepFrames,
    seeThroughToggle,
    selectionInfoPanel,
    selectionBlockField,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTests() {
  const {
    canvas,
    overlay,
    debugConsole,
    glState,
    stepFrame,
    seeThroughToggle,
    selectionInfoPanel,
    selectionBlockField,
  } = runGameScript();

  const blocksPerChunk = 8;
  const chunksPerSide = 32;
  const blocksPerSide = blocksPerChunk * chunksPerSide;
  const expectedTerrainVertices = blocksPerSide * blocksPerSide * 6;
  const expectedBlockLineVertices = (blocksPerSide + 1) * blocksPerSide * 4;
  const expectedChunkLineVertices = (blocksPerSide / blocksPerChunk + 1) * blocksPerSide * 4;

  assert(canvas.width === window.innerWidth, 'El canvas debe igualar el ancho de la ventana');
  assert(canvas.height === window.innerHeight, 'El canvas debe igualar el alto de la ventana');

  assert(glState.viewport[2] === window.innerWidth, 'Viewport debe usar el ancho completo');
  assert(glState.viewport[3] === window.innerHeight, 'Viewport debe usar el alto completo');

  assert(Array.isArray(glState.viewProjection), 'La matriz viewProjection debe enviarse al shader');
  const viewProjectionW = glState.viewProjection[15];
  assert(
    Number.isFinite(viewProjectionW) && Math.abs(viewProjectionW) > 1e-5,
    'La matriz viewProjection debe preservar un componente w distinto de cero'
  );

  const triangleDraw = glState.draws.find(
    (draw) => draw.mode === 0x0004 && draw.count === expectedTerrainVertices
  );
  assert(triangleDraw, 'El terreno debe renderizar todos los vértices esperados');

  const blockLines = glState.draws.find((draw) => draw.mode === 0x0001 && draw.count === 1028);
  assert(blockLines, 'La grid de bloques debe contener 1028 vértices de línea');

  const chunkLines = glState.draws.find((draw) => draw.mode === 0x0001 && draw.count === 132);
  assert(chunkLines, 'La grid de chunks debe contener 132 vértices de línea');

  assert(glState.draws.length >= 3, 'Se esperan múltiples draw calls por cuadro');

  assert(
    debugConsole.textContent.includes('Draw calls'),
    'La consola de depuración debe reportar los draw calls'
  );

  assert(
    debugConsole.textContent.includes('GL error'),
    'La consola de depuración debe mostrar el estado de WebGL'
  );

  assert(
    debugConsole.textContent.includes('Terreno seed'),
    'La consola de depuración debe reflejar la semilla activa'
  );

  assert(
    debugConsole.textContent.includes('Altura terreno'),
    'La consola de depuración debe indicar el rango de alturas'
  );

  assert(
    debugConsole.textContent.includes('Terreno visible'),
    'La consola de depuración debe reportar el porcentaje de terreno visible'
  );

  assert(
    debugConsole.textContent.includes('Selección:'),
    'La consola de depuración debe reflejar el estado de selección de cuadros'
  );

  assert(!seeThroughToggle.checked, 'El modo see-through debe iniciar desactivado');

  assert(
    glState.opacity === 1,
    'La opacidad del terreno debe iniciar en 1 para un modo opaco'
  );

  assert(
    debugConsole.textContent.includes('Terreno translúcido: No'),
    'El panel de debug debe reflejar que el terreno inicia opaco'
  );

  const terrainInfo = global.window.__terrainInfo;
  assert(terrainInfo, 'La información del terreno debe exponerse en window.__terrainInfo');
  assert(
    terrainInfo.vertexCount === expectedTerrainVertices,
    'El conteo de vértices del terreno debe coincidir con la malla completa'
  );
  assert(
    terrainInfo.visibleVertices > 0,
    'Debe haber vértices visibles por encima de la altura mínima'
  );
  assert(
    terrainInfo.visibleVertexRatio > 0.05,
    'Una fracción significativa del terreno debe ser visible'
  );
  assert(terrainInfo.minHeight >= 0, 'La altura mínima del terreno no debe ser negativa');
  assert(
    terrainInfo.maxHeight <= 20.0001,
    'La altura máxima del terreno debe estar acotada por el límite de 20 metros'
  );

  seeThroughToggle.checked = true;
  seeThroughToggle.dispatch('change');
  stepFrame(3);

  assert(
    glState.opacity < 1,
    'El modo see-through debe reducir la opacidad del terreno para hacerlo translúcido'
  );

  assert(
    debugConsole.textContent.includes('Terreno translúcido: Sí'),
    'El panel de debug debe actualizar el estado translúcido tras activar la opción'
  );

  const selectBlockAt = global.window.__selectBlockAt;
  assert(typeof selectBlockAt === 'function', 'Debe existir una API para seleccionar un bloque');

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  selectBlockAt(centerX, centerY);
  stepFrame(3);

  assert(selectionInfoPanel.hidden === false, 'La ventana de selección debe mostrarse tras hacer clic');

  const selectedSquare = global.window.__selectedSquare;
  assert(selectedSquare, 'La selección debe exponer información del cuadro activo');
  assert(Number.isInteger(selectedSquare.blockX), 'La selección debe indicar el índice de bloque en X');
  assert(Number.isInteger(selectedSquare.blockZ), 'La selección debe indicar el índice de bloque en Z');
  assert(
    typeof selectedSquare.height === 'number' && selectedSquare.height >= 0,
    'La selección debe incluir la altura del terreno en el cuadro'
  );
  assert(
    typeof selectionBlockField.textContent === 'string' && selectionBlockField.textContent.includes(','),
    'El panel de selección debe mostrar las coordenadas del bloque'
  );

  const highlightDraw = glState.draws.find((draw) => draw.mode === 0x0001 && draw.count === 8);
  assert(highlightDraw, 'Seleccionar un cuadro debe renderizar un contorno destacado sobre el terreno');

  console.log('✅ Todas las pruebas pasaron');
  return { canvas, overlay, debugConsole, glState };
}

runTests();
