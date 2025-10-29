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
    depthMask: true,
    uniformAssignments: [],
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
    BLEND: 0x0be2,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
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
    getUniformLocation: (program, name) => ({ program, name }),
    createBuffer: () => ({}),
    bindBuffer: (target, buffer) => {
      if (target === gl.ARRAY_BUFFER) {
        state.boundArrayBuffer = buffer || {};
      }
    },
    bufferData: () => {},
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    uniformMatrix4fv: (location, transpose, matrix) => {
      void location;
      void transpose;
      state.viewProjection = Array.isArray(matrix)
        ? matrix.slice()
        : Array.from(matrix || []);
    },
    uniform3f: () => {},
    uniform1f: (location, value) => {
      void location;
      state.opacity = value;
    },
    uniform1i: (location, value) => {
      state.uniformAssignments.push({ location, value, name: location?.name ?? null });
    },
    blendFunc: () => {},
    depthMask: (flag) => {
      state.depthMask = flag;
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

  const dayCycleProgressTrack = {
    style: {},
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name];
    },
  };

  const dayCycleProgressFill = {
    style: { width: '0%' },
  };

  function createDayCycleIcon(phase) {
    const icon = {
      phase,
      active: false,
      classList: {
        add(className) {
          if (className === 'hud-daycycle__icon--active') {
            icon.active = true;
          }
        },
        remove(className) {
          if (className === 'hud-daycycle__icon--active') {
            icon.active = false;
          }
        },
      },
      getAttribute(name) {
        if (name === 'data-day-cycle-phase') {
          return phase;
        }
        return null;
      },
    };
    return icon;
  }

  const dayCycleIcons = [
    createDayCycleIcon('dawn'),
    createDayCycleIcon('midday'),
    createDayCycleIcon('dusk'),
    createDayCycleIcon('midnight'),
  ];

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

  const debugTerrainToggle = {
    checked: false,
    addEventListener: () => {},
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
    exitPointerLock: () => {
      document.pointerLockElement = null;
      if (document._pointerLockChange) {
        document._pointerLockChange();
      }
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
      if (id === 'debug-terrain-translucent') return debugTerrainToggle;
      if (id === 'day-cycle-progress-track') return dayCycleProgressTrack;
      if (id === 'day-cycle-progress-fill') return dayCycleProgressFill;
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector === '[data-day-cycle-phase]') {
        return dayCycleIcons;
      }
      return [];
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
    seeThroughToggle: globalThis.seeThroughToggle,
    selectionInfoPanel: globalThis.selectionInfoPanel,
    selectionBlockField: globalThis.selectionBlockField,
    dayCycleProgressTrack,
    dayCycleProgressFill,
    dayCycleIcons,
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
    dayCycleProgressTrack,
    dayCycleProgressFill,
    dayCycleIcons,
  } = runGameScript();

  const blocksPerChunk = 8;
  const chunksPerSide = 16;
  const blocksPerSide = blocksPerChunk * chunksPerSide;
  const expectedTerrainVertices = blocksPerSide * blocksPerSide * 6;
  const expectedBlockLineVertices = blocksPerSide * (blocksPerSide + 1) * 4;
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

  const triangleDraws = glState.draws.filter((draw) => draw.mode === 0x0004);
  assert(triangleDraws.length >= 2, 'Debe haber draw calls de triángulos para terreno y rocas');

  const terrainSurfaceDraws = triangleDraws.filter(
    (draw) => draw.count === expectedTerrainVertices,
  );
  assert(
    terrainSurfaceDraws.length >= 2,
    'Debe haber draw calls de triángulos para el terreno base y el agua',
  );

  const rockDraw = triangleDraws.find((draw) => draw.count !== expectedTerrainVertices);
  assert(rockDraw, 'Las rocas deben renderizarse en draw calls adicionales');
  assert(rockDraw.count % 3 === 0, 'La geometría de rocas debe estar compuesta por triángulos completos');

  const blockLines = glState.draws.find(
    (draw) => draw.mode === 0x0001 && draw.count === expectedBlockLineVertices,
  );
  assert(
    blockLines,
    `La grid de bloques debe seguir la topografía con ${expectedBlockLineVertices} vértices`,
  );

  const chunkLines = glState.draws.find(
    (draw) => draw.mode === 0x0001 && draw.count === expectedChunkLineVertices
  );
  assert(chunkLines, 'La grid de chunks debe trazar todos los límites sobre el terreno');

  assert(glState.draws.length >= 4, 'Se esperan múltiples draw calls por cuadro incluyendo rocas');

  const renderModeAssignments = glState.uniformAssignments.filter(
    (entry) => entry.name === 'renderMode'
  );
  assert(renderModeAssignments.length >= 2, 'El render debe actualizar el uniform renderMode durante el cuadro');
  const renderModeValues = new Set(renderModeAssignments.map((entry) => entry.value));
  assert(renderModeValues.has(0), 'El modo de render debe forzar el valor 0 para dibujar el terreno');
  assert(renderModeValues.has(1), 'El modo de render debe forzar el valor 1 para dibujar el agua');

  assert(glState.depthMask === true, 'El render debe restaurar la escritura en el depth buffer tras los grids');

  assert(
    debugConsole.textContent.includes('Draw calls'),
    'La consola de depuración debe reportar los draw calls'
  );

  assert(
    debugConsole.textContent.includes('agua='),
    'La consola de depuración debe reportar draw calls de agua'
  );

  assert(
    debugConsole.textContent.includes('Geometría:'),
    'La consola de depuración debe informar los vértices de la geometría',
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
    debugConsole.textContent.includes('Terreno características:'),
    'La consola de depuración debe mostrar las métricas de rasgos del terreno',
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
  assert(
    debugConsole.textContent.includes('Rocas generadas'),
    'La consola de depuración debe reportar el número de rocas generadas'
  );
  assert(
    terrainInfo.rockCount > 0,
    'La generación de rocas debe producir al menos una formación'
  );
  assert(
    terrainInfo.featureStats && typeof terrainInfo.featureStats.canyon === 'number',
    'Las métricas de rasgos del terreno deben almacenarse en terrainInfo.featureStats',
  );

  stepFrame(8);
  const progressNow = Number.parseFloat(dayCycleProgressTrack.attributes['aria-valuenow']);
  assert(
    Number.isFinite(progressNow),
    'El progreso del ciclo día/noche debe actualizar su valor numérico',
  );
  const progressWidth = Number.parseFloat(dayCycleProgressFill.style.width);
  assert(
    progressWidth >= 0 && progressWidth <= 100,
    'La barra del ciclo día/noche debe reflejar el avance en porcentaje',
  );
  const activeIcons = dayCycleIcons.filter((icon) => icon.active);
  assert(
    activeIcons.length === 1,
    'Debe resaltarse exactamente un icono del ciclo día/noche a la vez',
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
