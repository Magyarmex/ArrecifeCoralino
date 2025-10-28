const canvas = document.getElementById('scene');
const overlay = document.getElementById('overlay');
const simulationHud = document.getElementById('simulation-hud');
const startButton = document.getElementById('start-button');
const debugConsole = document.getElementById('debug-console');
const debugPanel = document.getElementById('debug-panel');
const debugToggleButton = document.getElementById('debug-toggle');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const seedInput = document.getElementById('seed-input');
const randomSeedButton = document.getElementById('random-seed');
const simulationClock = document.getElementById('simulation-clock');
const simulationSpeedIndicator = document.getElementById('simulation-speed-indicator');
const simulationSpeedSlider = document.getElementById('simulation-speed');
const simulationSpeedDisplay = document.getElementById('simulation-speed-display');
const simulationSpeedSettingsDisplay = document.getElementById(
  'simulation-speed-display-settings',
);
const dayCycleProgressTrack = document.getElementById('day-cycle-progress-track');
const dayCycleProgressFill = document.getElementById('day-cycle-progress-fill');
const dayCyclePhaseIcons = Array.from(
  document?.querySelectorAll?.('[data-day-cycle-phase]') ?? [],
);
const dayCyclePhaseIconMap = new Map(
  dayCyclePhaseIcons
    .map((element) => [element?.getAttribute?.('data-day-cycle-phase'), element])
    .filter(([phase, element]) => phase && element),
);
const debugTerrainToggle = document.getElementById('debug-terrain-translucent');

function createFallbackInfoPanel() {
  let hiddenState = true;
  return {
    get hidden() {
      return hiddenState;
    },
    set hidden(value) {
      hiddenState = Boolean(value);
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

function createFallbackTextField() {
  return {
    textContent: '',
  };
}

function createFallbackButton() {
  return {
    addEventListener: () => {},
  };
}

const selectionInfoPanel =
  document.getElementById('selection-info') ?? createFallbackInfoPanel();
const selectionBlockField =
  document.getElementById('selection-info-block') ?? createFallbackTextField();
const selectionChunkField =
  document.getElementById('selection-info-chunk') ?? createFallbackTextField();
const selectionWorldField =
  document.getElementById('selection-info-world') ?? createFallbackTextField();
const selectionHeightField =
  document.getElementById('selection-info-height') ?? createFallbackTextField();
const selectionWaterField =
  document.getElementById('selection-info-water') ?? createFallbackTextField();
const selectionDepthField =
  document.getElementById('selection-info-depth') ?? createFallbackTextField();
const selectionCloseButton =
  document.getElementById('selection-close') ?? createFallbackButton();
const waterInfoPanel = document.getElementById('water-info') ?? createFallbackInfoPanel();
const waterInfoVolumeField =
  document.getElementById('water-info-volume') ?? createFallbackTextField();
const waterInfoCloseButton =
  document.getElementById('water-info-close') ?? createFallbackButton();

const bodyElement = document.body;

const runtimeIssues = [];
const MAX_RUNTIME_ISSUES = 8;
let fatalRuntimeError = null;
let loopHalted = false;
let activeWaterSelection = null;
let ignoreNextWaterPointerDown = false;
let waterInfoPointerHandler = null;
let waterInfoKeyHandler = null;
let debugPanelExpanded = false;
let suppressNextSelectionPointerDown = false;

const diagnosticsToast =
  bodyElement && typeof document?.createElement === 'function'
    ? createDiagnosticsToast()
    : null;

const overlayErrorMessage =
  overlay && typeof document?.createElement === 'function' && typeof overlay.appendChild === 'function'
    ? createOverlayErrorMessage(overlay)
    : null;

setDebugPanelExpanded(false);

function ensureEventDispatchSupport(element) {
  if (!element) {
    return;
  }

  if (typeof element.dispatch === 'function' && typeof element.dispatchEvent === 'function') {
    return;
  }

  if (typeof element.dispatch !== 'function' && typeof element.dispatchEvent === 'function') {
    element.dispatch = (typeOrEvent) => {
      const event =
        typeof typeOrEvent === 'string'
          ? typeof Event === 'function'
            ? new Event(typeOrEvent)
            : { type: typeOrEvent }
          : typeOrEvent;
      if (event) {
        element.dispatchEvent(event);
      }
      return true;
    };
    return;
  }

  const listenerRegistry = new Map();
  const originalAdd =
    typeof element.addEventListener === 'function' ? element.addEventListener.bind(element) : null;
  const originalRemove =
    typeof element.removeEventListener === 'function'
      ? element.removeEventListener.bind(element)
      : null;

  element.addEventListener = (type, handler, options) => {
    if (originalAdd) {
      originalAdd(type, handler, options);
    }
    if (!listenerRegistry.has(type)) {
      listenerRegistry.set(type, new Set());
    }
    listenerRegistry.get(type).add(handler);
  };

  if (originalRemove) {
    element.removeEventListener = (type, handler, options) => {
      if (listenerRegistry.has(type)) {
        listenerRegistry.get(type).delete(handler);
      }
      originalRemove(type, handler, options);
    };
  }

  const dispatchInternal = (typeOrEvent) => {
    const type = typeof typeOrEvent === 'string' ? typeOrEvent : typeOrEvent?.type;
    if (!type) {
      return false;
    }
    const listeners = listenerRegistry.get(type);
    if (!listeners || listeners.size === 0) {
      return false;
    }
    const event =
      typeof typeOrEvent === 'object' && typeOrEvent !== null
        ? typeOrEvent
        : { type, target: element, currentTarget: element };
    for (const handler of listeners) {
      try {
        handler.call(element, event);
      } catch (error) {
        setTimeout(() => {
          throw error;
        });
      }
    }
    return true;
  };

  element.dispatch = dispatchInternal;
  element.dispatchEvent = dispatchInternal;
}

ensureEventDispatchSupport(debugTerrainToggle);

function createDiagnosticsToast() {
  const element = document.createElement('div');
  element.id = 'runtime-diagnostics-toast';
  element.hidden = true;
  element.setAttribute('role', 'alert');
  Object.assign(element.style, {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    maxWidth: '360px',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(164, 115, 42, 0.92)',
    border: '1px solid rgba(255, 214, 153, 0.65)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
    fontFamily:
      '"Fira Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '0.8rem',
    lineHeight: '1.4',
    color: '#fff6e5',
    zIndex: '30',
    pointerEvents: 'none',
  });
  document.body.appendChild(element);
  return element;
}

function createOverlayErrorMessage(container) {
  if (!document?.createElement || typeof container.appendChild !== 'function') {
    return null;
  }
  const element = document.createElement('p');
  element.id = 'runtime-error-message';
  element.setAttribute('role', 'alert');
  element.style.marginTop = '14px';
  element.style.padding = '10px 12px';
  element.style.borderRadius = '10px';
  element.style.background = 'rgba(200, 64, 64, 0.2)';
  element.style.border = '1px solid rgba(255, 128, 128, 0.35)';
  element.style.color = '#ffecec';
  element.style.fontSize = '0.85rem';
  element.style.lineHeight = '1.45';
  element.style.display = 'none';
  container.appendChild(element);
  return element;
}

function describeIssue(error) {
  if (!error) {
    return 'Error desconocido';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message || error.toString();
  }
  if (typeof error.message === 'string') {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch (serializationError) {
    void serializationError;
    return String(error);
  }
}

function formatIssueMessage(entry) {
  const summary = String(entry.message ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return summary || 'Error desconocido';
}

function updateDiagnosticsToast() {
  if (!diagnosticsToast) {
    return;
  }
  if (runtimeIssues.length === 0) {
    diagnosticsToast.hidden = true;
    return;
  }
  const latest = runtimeIssues[0];
  diagnosticsToast.hidden = false;
  diagnosticsToast.textContent = `[${latest.timestamp}] ${
    latest.severity === 'fatal' ? 'Error crítico' : 'Problema'
  } en ${latest.context}: ${formatIssueMessage(latest)}`;
  diagnosticsToast.style.background =
    latest.severity === 'fatal'
      ? 'rgba(162, 44, 44, 0.92)'
      : 'rgba(164, 115, 42, 0.92)';
  diagnosticsToast.style.borderColor =
    latest.severity === 'fatal'
      ? 'rgba(255, 128, 128, 0.65)'
      : 'rgba(255, 214, 153, 0.65)';
}

function recordRuntimeIssue(severity, context, error) {
  const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
  const entry = {
    severity,
    context,
    message: describeIssue(error),
    timestamp,
    stack: error && typeof error.stack === 'string' ? error.stack : null,
  };
  runtimeIssues.unshift(entry);
  if (runtimeIssues.length > MAX_RUNTIME_ISSUES) {
    runtimeIssues.length = MAX_RUNTIME_ISSUES;
  }
  updateDiagnosticsToast();
  return entry;
}

function showOverlayIssue(entry) {
  if (!overlay) {
    return;
  }
  overlayDismissed = false;
  applyTutorialState(true);
  if (overlayErrorMessage) {
    overlayErrorMessage.style.display = 'block';
    overlayErrorMessage.textContent = `⚠️ ${
      entry.severity === 'fatal' ? 'Error crítico' : 'Problema'
    } en ${entry.context}: ${formatIssueMessage(entry)}`;
  }
}

function handleFatalRuntimeError(error, context) {
  if (fatalRuntimeError) {
    return fatalRuntimeError;
  }
  const entry = recordRuntimeIssue('fatal', context, error);
  fatalRuntimeError = entry;
  loopHalted = true;
  showOverlayIssue(entry);
  console.error(`Error crítico en ${context}`, error);
  return entry;
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (fatalRuntimeError) {
      return;
    }
    const context = event.filename
      ? `${event.filename.split('/').pop() ?? event.filename}:${event.lineno ?? ''}`
      : 'ventana';
    recordRuntimeIssue('error', context, event.error || event.message || event);
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (fatalRuntimeError) {
      return;
    }
    recordRuntimeIssue('error', 'promesa', event.reason);
  });
}

const initialTutorialActive = overlay?.classList?.contains('visible') ?? false;
let tutorialActive = initialTutorialActive;
let overlayDismissed = !initialTutorialActive;

function applyTutorialState(active) {
  tutorialActive = active;
  if (overlay) {
    if (overlay.classList) {
      overlay.classList.toggle('visible', active);
      overlay.classList.toggle('hidden', !active);
    } else {
      overlay.className = active ? 'visible' : 'hidden';
    }
    if (typeof overlay.setAttribute === 'function') {
      overlay.setAttribute('aria-hidden', String(!active));
    }
  }
  if (simulationHud && typeof simulationHud.setAttribute === 'function') {
    simulationHud.setAttribute('aria-hidden', String(active));
  }
  if (bodyElement?.classList) {
    bodyElement.classList.toggle('tutorial-active', active);
  }
}

function showTutorialOverlay() {
  if (overlayDismissed) {
    applyTutorialState(false);
    return;
  }
  applyTutorialState(true);
}

function dismissTutorialOverlay() {
  overlayDismissed = true;
  applyTutorialState(false);
}

applyTutorialState(tutorialActive);

const gl = canvas.getContext('webgl', { antialias: true });
if (!gl) {
  overlay.innerHTML =
    '<h1>WebGL no disponible</h1><p>Tu navegador no soporta WebGL.</p>';
  throw new Error('WebGL no soportado');
}

const GL_NO_ERROR = gl.NO_ERROR ?? 0;

gl.clearColor(0.05, 0.08, 0.12, 1);
gl.enable(gl.DEPTH_TEST);

function createShader(type, source) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('No se pudo crear el shader');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Error compilando shader: ' + info);
  }
  return shader;
}

const vertexSource = `
  attribute vec3 position;
  attribute vec3 color;
  uniform mat4 viewProjection;
  varying vec3 vColor;
  void main() {
    gl_Position = viewProjection * vec4(position, 1.0);
    vColor = color;
  }
`;

const fragmentSource = `
  precision mediump float;
  varying vec3 vColor;
  uniform vec3 globalLightColor;
  uniform float terrainAlpha;
  void main() {
    gl_FragColor = vec4(vColor * globalLightColor, terrainAlpha);
  }
`;

const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

const program = gl.createProgram();
if (!program) {
  throw new Error('No se pudo crear el programa de shaders');
}

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const info = gl.getProgramInfoLog(program);
  throw new Error('Error enlazando el programa: ' + info);
}

gl.useProgram(program);

const positionAttribute = gl.getAttribLocation(program, 'position');
const colorAttribute = gl.getAttribLocation(program, 'color');
const viewProjectionUniform = gl.getUniformLocation(program, 'viewProjection');
const globalLightColorUniform = gl.getUniformLocation(program, 'globalLightColor');
const terrainAlphaUniform = gl.getUniformLocation(program, 'terrainAlpha');

const blockSize = 1; // cada bloque cubre el doble de superficie para ampliar el mapa
const blocksPerChunk = 8;
const chunksPerSide = 16;
const chunkSize = blockSize * blocksPerChunk;
const baseplateSize = chunkSize * chunksPerSide;

const floatsPerVertex = 6;
const vertexStride = floatsPerVertex * Float32Array.BYTES_PER_ELEMENT;

function createBuffer(data) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('No se pudo crear el buffer');
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

const blockLineColor = [0.93, 0.9, 0.8];
const chunkLineColor = [0.74, 0.68, 0.55];
const sandDarkColor = [0.73, 0.64, 0.48];
const sandLightColor = [0.97, 0.91, 0.74];
const terrainNoiseScale = 4.8;
const terrainWarpScale = 2.6;
const terrainWarpStrength = 0.45;
const canyonScale = 0.45;
const ravinePrimaryScale = 0.75;
const ravineSecondaryScale = 2.1;
const ravineRotation = Math.PI / 5;
const terraceSteps = 7;
const maxTerrainHeight = 20;
const minVisibleHeight = 0.001;
const falloffRadius = 0.9;
const falloffExponent = 3.1;
const lightDirection = (() => {
  const length = Math.hypot(0.37, 0.84, 0.4) || 1;
  return [0.37 / length, 0.84 / length, 0.4 / length];
})();
const seaLevel = 6;
const waterSurfaceLevel = 20;
const selectionHighlightColor = [0.32, 0.78, 0.94];

const baseplateBuffer = createBuffer(new Float32Array(0));
let baseplateVertexCount = 0;

const blockGridBuffer = createBuffer(new Float32Array(0));
const chunkGridBuffer = createBuffer(new Float32Array(0));
const selectionHighlightBuffer = createBuffer(new Float32Array(0));
const rockBuffer = createBuffer(new Float32Array(0));

let blockGridVertexCount = 0;
let chunkGridVertexCount = 0;
let rockVertexCount = 0;
let selectionHighlightVertexCount = 0;

let terrainHeightField = null;
let terrainMaskField = null;

const defaultSeed = 'coral-dunas';
let currentSeed = defaultSeed;
const terrainInfo = {
  seed: currentSeed,
  minHeight: 0,
  maxHeight: 0,
  vertexCount: 0,
  visibleVertices: 0,
  visibleVertexRatio: 0,
  rockCount: 0,
  featureStats: {
    canyon: 0,
    ravine: 0,
    cliffs: 0,
  },
};
let seeThroughTerrain = false;
let selectedBlock = null;
let inverseViewProjectionMatrix = null;

const drawStats = {
  terrain: 0,
  rocks: 0,
  blockGrid: 0,
  chunkGrid: 0,
  selection: 0,
  total: 0,
};

if (typeof window !== 'undefined') {
  window.__terrainInfo = terrainInfo;
  window.__selectedSquare = null;
  window.__selectBlockAt = (x, y) => selectBlockAtScreen(x, y);
  window.__clearSelection = () => clearSelection();
  window.__runtimeIssues = runtimeIssues;
  if (debugTerrainToggle) {
    if (!('seeThroughToggle' in window)) {
      window.seeThroughToggle = debugTerrainToggle;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.seeThroughToggle = debugTerrainToggle;
    }
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.selectionInfoPanel = selectionInfoPanel;
    globalThis.selectionBlockField = selectionBlockField;
  }
}

if (seedInput) {
  seedInput.value = currentSeed;
}

function stringToSeed(value) {
  const str = String(value ?? '').trim();
  if (!str) {
    return 0x9e3779b9;
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createRandomGenerator(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInRange(random, min, max) {
  return min + random() * (max - min);
}

function randomChoice(random, options) {
  if (!options || options.length === 0) {
    return undefined;
  }
  const index = Math.min(options.length - 1, Math.floor(random() * options.length));
  return options[index];
}

function hashCoords(x, z, seed) {
  let h = Math.imul(x, 0x5bd1e995) ^ Math.imul(z, 0x27d4eb2d) ^ seed;
  h ^= h >>> 13;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function fade(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function valueNoise(x, z, seed) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const x1 = x0 + 1;
  const z1 = z0 + 1;

  const sx = fade(x - x0);
  const sz = fade(z - z0);

  const n00 = hashCoords(x0, z0, seed);
  const n10 = hashCoords(x1, z0, seed);
  const n01 = hashCoords(x0, z1, seed);
  const n11 = hashCoords(x1, z1, seed);

  const ix0 = lerp(n00, n10, sx);
  const ix1 = lerp(n01, n11, sx);
  return lerp(ix0, ix1, sz);
}

function fbm(x, z, seed) {
  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let octave = 0; octave < 4; octave++) {
    total += valueNoise(x * frequency, z * frequency, seed + octave * 1013) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / maxValue;
}

function ridgedNoise(x, z, seed, sharpness = 2) {
  const base = fbm(x, z, seed);
  const ridge = 1 - Math.abs(base * 2 - 1);
  return Math.pow(clamp01(ridge), sharpness);
}

function rotate2D(x, z, angle) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return [x * cos - z * sin, x * sin + z * cos];
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clamp(value, minValue, maxValue) {
  if (value < minValue) return minValue;
  if (value > maxValue) return maxValue;
  return value;
}

function mixColor(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

const nightSkyColor = [0.02, 0.03, 0.08];
const daySkyColor = [0.32, 0.56, 0.84];
const nightLightTint = [0.55, 0.68, 0.95];
const dayLightTint = [1, 0.97, 0.9];
const dayNightCycleDuration = 240;

const dayNightCycleState = {
  length: dayNightCycleDuration,
  normalizedTime: 0,
  daylight: 0,
  intensity: 1,
  skyColor: nightSkyColor.slice(),
  lightColor: [1, 1, 1],
  sunAngle: -Math.PI / 2,
};

const dayCyclePhaseLabels = {
  midnight: 'Medianoche',
  dawn: 'Amanecer',
  midday: 'Mediodía',
  dusk: 'Atardecer',
};

function getDayCyclePhase(normalizedTime) {
  const normalized = ((normalizedTime % 1) + 1) % 1;
  if (normalized >= 0.875 || normalized < 0.125) {
    return 'midnight';
  }
  if (normalized < 0.375) {
    return 'dawn';
  }
  if (normalized < 0.625) {
    return 'midday';
  }
  if (normalized < 0.875) {
    return 'dusk';
  }
  return 'midnight';
}

function updateDayNightCycleState(currentSimulationTime) {
  const duration = Math.max(1, dayNightCycleDuration);
  const cycleTime = ((currentSimulationTime % duration) + duration) % duration;
  const normalized = cycleTime / duration;
  const sunAngle = normalized * 2 * Math.PI - Math.PI / 2;
  const daylight = clamp01(Math.sin(sunAngle) * 0.5 + 0.5);
  const intensity = 0.25 + daylight * 0.75;
  const tint = mixColor(nightLightTint, dayLightTint, daylight);
  const skyColor = mixColor(nightSkyColor, daySkyColor, daylight);
  const lightColor = [
    clamp01(tint[0] * intensity),
    clamp01(tint[1] * intensity),
    clamp01(tint[2] * intensity),
  ];

  dayNightCycleState.normalizedTime = normalized;
  dayNightCycleState.daylight = daylight;
  dayNightCycleState.intensity = intensity;
  dayNightCycleState.skyColor = skyColor;
  dayNightCycleState.lightColor = lightColor;
  dayNightCycleState.sunAngle = sunAngle;
}

const translucentTerrainAlpha = 0.45;

const terrainRenderState = {
  translucent: false,
  alpha: 1,
};

function applyTranslucentTerrainSetting(enabled) {
  const active = Boolean(enabled);
  terrainRenderState.translucent = active;
  terrainRenderState.alpha = active ? translucentTerrainAlpha : 1;
  seeThroughTerrain = active;

  if (debugTerrainToggle && debugTerrainToggle.checked !== active) {
    debugTerrainToggle.checked = active;
  }

  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
  }

  if (typeof gl.enable === 'function' && typeof gl.disable === 'function') {
    if (active) {
      gl.enable(gl.BLEND);
      if (typeof gl.blendFunc === 'function') {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    } else {
      gl.disable(gl.BLEND);
    }
  }
}

function pushVertex(buffer, offset, x, y, z, color) {
  buffer[offset + 0] = x;
  buffer[offset + 1] = y;
  buffer[offset + 2] = z;
  buffer[offset + 3] = color[0];
  buffer[offset + 4] = color[1];
  buffer[offset + 5] = color[2];
  return offset + floatsPerVertex;
}

function createTerrainGridVertices(heightField, step, color, heightOffset) {
  if (!heightField) {
    return new Float32Array(0);
  }

  const blocksPerSide = heightField.length - 1;
  const half = baseplateSize / 2;

  const collectAxisIndices = () => {
    const indices = [];
    for (let index = 0; index <= blocksPerSide; index += step) {
      indices.push(index);
    }
    if (indices[indices.length - 1] !== blocksPerSide) {
      indices.push(blocksPerSide);
    }
    return indices;
  };

  const axisIndices = collectAxisIndices();
  const totalVertices = axisIndices.length * blocksPerSide * 4;
  const vertexData = new Float32Array(totalVertices * floatsPerVertex);
  let offset = 0;

  const sample = (x, z) => {
    const clampedX = Math.max(0, Math.min(blocksPerSide, x));
    const clampedZ = Math.max(0, Math.min(blocksPerSide, z));
    return heightField[clampedZ][clampedX];
  };

  for (const xi of axisIndices) {
    const worldX = -half + xi * blockSize;
    for (let zi = 0; zi < blocksPerSide; zi++) {
      const z0 = -half + zi * blockSize;
      const z1 = z0 + blockSize;
      const y0 = sample(xi, zi) + heightOffset;
      const y1 = sample(xi, zi + 1) + heightOffset;
      offset = pushVertex(vertexData, offset, worldX, y0, z0, color);
      offset = pushVertex(vertexData, offset, worldX, y1, z1, color);
    }
  }

  for (const zi of axisIndices) {
    const worldZ = -half + zi * blockSize;
    for (let xi = 0; xi < blocksPerSide; xi++) {
      const x0 = -half + xi * blockSize;
      const x1 = x0 + blockSize;
      const y0 = sample(xi, zi) + heightOffset;
      const y1 = sample(xi + 1, zi) + heightOffset;
      offset = pushVertex(vertexData, offset, x0, y0, worldZ, color);
      offset = pushVertex(vertexData, offset, x1, y1, worldZ, color);
    }
  }

  if (offset === vertexData.length) {
    return vertexData;
  }
  return vertexData.subarray(0, offset);
}

function createBlockGridVertices(heightField, color, heightOffset) {
  return createTerrainGridVertices(heightField, 1, color, heightOffset);
}

function updateGridBuffers(heightField) {
  const blockVertices = createBlockGridVertices(heightField, blockLineColor, 0.08);
  gl.bindBuffer(gl.ARRAY_BUFFER, blockGridBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, blockVertices, gl.STATIC_DRAW);
  blockGridVertexCount = blockVertices.length / floatsPerVertex;

  const chunkVertices = createTerrainGridVertices(
    heightField,
    blocksPerChunk,
    chunkLineColor,
    0.12
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, chunkGridBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, chunkVertices, gl.STATIC_DRAW);
  chunkGridVertexCount = chunkVertices.length / floatsPerVertex;
}

function sampleTerrain(worldX, worldZ) {
  if (!terrainHeightField) {
    return null;
  }

  const blocksPerSide = terrainHeightField.length - 1;
  const half = baseplateSize / 2;
  const localX = worldX + half;
  const localZ = worldZ + half;

  if (localX < 0 || localX > baseplateSize || localZ < 0 || localZ > baseplateSize) {
    return null;
  }

  const scaledX = clamp(localX / blockSize, 0, blocksPerSide);
  const scaledZ = clamp(localZ / blockSize, 0, blocksPerSide);

  const x0 = Math.max(0, Math.min(blocksPerSide - 1, Math.floor(scaledX)));
  const z0 = Math.max(0, Math.min(blocksPerSide - 1, Math.floor(scaledZ)));
  const x1 = Math.min(blocksPerSide, x0 + 1);
  const z1 = Math.min(blocksPerSide, z0 + 1);

  const tx = clamp(scaledX - x0, 0, 1);
  const tz = clamp(scaledZ - z0, 0, 1);

  const h00 = terrainHeightField[z0][x0];
  const h10 = terrainHeightField[z0][x1];
  const h01 = terrainHeightField[z1][x0];
  const h11 = terrainHeightField[z1][x1];

  const hx0 = lerp(h00, h10, tx);
  const hx1 = lerp(h01, h11, tx);
  const height = lerp(hx0, hx1, tz);

  const blockX = x0;
  const blockZ = z0;
  const chunkX = Math.floor(blockX / blocksPerChunk);
  const chunkZ = Math.floor(blockZ / blocksPerChunk);
  const centerX = -half + (blockX + 0.5) * blockSize;
  const centerZ = -half + (blockZ + 0.5) * blockSize;

  return {
    height,
    blockX,
    blockZ,
    chunkX,
    chunkZ,
    centerX,
    centerZ,
    cornerHeights: { h00, h10, h01, h11 },
  };
}

function updateSelectionHighlight(blockX, blockZ) {
  if (!terrainHeightField) {
    selectionHighlightVertexCount = 0;
    return;
  }

  const blocksPerSide = terrainHeightField.length - 1;
  if (blockX < 0 || blockZ < 0 || blockX >= blocksPerSide || blockZ >= blocksPerSide) {
    selectionHighlightVertexCount = 0;
    return;
  }

  const half = baseplateSize / 2;
  const x0 = -half + blockX * blockSize;
  const x1 = x0 + blockSize;
  const z0 = -half + blockZ * blockSize;
  const z1 = z0 + blockSize;

  const h00 = terrainHeightField[blockZ][blockX];
  const h10 = terrainHeightField[blockZ][blockX + 1];
  const h01 = terrainHeightField[blockZ + 1][blockX];
  const h11 = terrainHeightField[blockZ + 1][blockX + 1];

  const lift = 0.35;
  const vertexData = new Float32Array(8 * floatsPerVertex);
  let offset = 0;

  offset = pushVertex(vertexData, offset, x0, h00 + lift, z0, selectionHighlightColor);
  offset = pushVertex(vertexData, offset, x1, h10 + lift, z0, selectionHighlightColor);

  offset = pushVertex(vertexData, offset, x1, h10 + lift, z0, selectionHighlightColor);
  offset = pushVertex(vertexData, offset, x1, h11 + lift, z1, selectionHighlightColor);

  offset = pushVertex(vertexData, offset, x1, h11 + lift, z1, selectionHighlightColor);
  offset = pushVertex(vertexData, offset, x0, h01 + lift, z1, selectionHighlightColor);

  offset = pushVertex(vertexData, offset, x0, h01 + lift, z1, selectionHighlightColor);
  offset = pushVertex(vertexData, offset, x0, h00 + lift, z0, selectionHighlightColor);

  gl.bindBuffer(gl.ARRAY_BUFFER, selectionHighlightBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  selectionHighlightVertexCount = vertexData.length / floatsPerVertex;
}

function clearSelection() {
  selectedBlock = null;
  selectionHighlightVertexCount = 0;
  if (typeof window !== 'undefined') {
    window.__selectedSquare = null;
  }
  if (selectionInfoPanel) {
    selectionInfoPanel.hidden = true;
  }
  closeWaterInfo();
}

function updateSelectionPanel(selection) {
  if (!selectionInfoPanel) {
    return;
  }

  selectionInfoPanel.hidden = false;

  if (selectionBlockField) {
    selectionBlockField.textContent = `${selection.blockX}, ${selection.blockZ}`;
  }
  if (selectionChunkField) {
    selectionChunkField.textContent = `${selection.chunkX}, ${selection.chunkZ}`;
  }
  if (selectionWorldField) {
    const [x, y, z] = selection.worldPosition;
    selectionWorldField.textContent = `x=${x.toFixed(2)} y=${y.toFixed(2)} z=${z.toFixed(2)}`;
  }
  if (selectionHeightField) {
    selectionHeightField.textContent = `${selection.height.toFixed(2)} m`;
  }
  if (selectionWaterField) {
    selectionWaterField.textContent = `${selection.waterLevel.toFixed(2)} m`;
  }
  if (selectionDepthField) {
    const depth = selection.waterDepth;
    const status = depth > 0 ? `${depth.toFixed(2)} m (sumergido)` : '0.00 m (emergido)';
    selectionDepthField.textContent = status;
  }
}

function setDebugPanelExpanded(expanded) {
  debugPanelExpanded = Boolean(expanded);

  if (debugPanel && typeof debugPanel.classList?.toggle === 'function') {
    debugPanel.classList.toggle('debug-panel--expanded', debugPanelExpanded);
  }

  if (debugToggleButton) {
    debugToggleButton.setAttribute('aria-expanded', String(debugPanelExpanded));
  }

  if (debugConsole) {
    debugConsole.hidden = !debugPanelExpanded;
    if (typeof debugConsole.setAttribute === 'function') {
      debugConsole.setAttribute('aria-hidden', debugPanelExpanded ? 'false' : 'true');
    }
  }
}

function computeWaterTileVolume(selection) {
  if (!selection) {
    return 0;
  }

  const heights = selection.cornerHeights
    ? [
        selection.cornerHeights.h00,
        selection.cornerHeights.h10,
        selection.cornerHeights.h01,
        selection.cornerHeights.h11,
      ]
    : [selection.height, selection.height, selection.height, selection.height];

  let depthSum = 0;
  for (const height of heights) {
    depthSum += Math.max(0, waterSurfaceLevel - height);
  }

  const averageDepth = depthSum / heights.length;
  const area = blockSize * blockSize;
  return averageDepth * area;
}

function updateWaterInfoPanel(selection) {
  if (!waterInfoPanel) {
    return;
  }

  const volume = computeWaterTileVolume(selection);
  if (waterInfoVolumeField) {
    waterInfoVolumeField.textContent = `${volume.toFixed(2)} m³`;
  }
}

function closeWaterInfo(options = {}) {
  const { restoreCamera = false, event } = options;
  activeWaterSelection = null;
  ignoreNextWaterPointerDown = false;

  if (waterInfoPanel) {
    waterInfoPanel.hidden = true;
    if (typeof waterInfoPanel.setAttribute === 'function') {
      waterInfoPanel.setAttribute('aria-hidden', 'true');
    }
  }

  if (
    waterInfoPointerHandler &&
    typeof document !== 'undefined' &&
    typeof document.removeEventListener === 'function'
  ) {
    document.removeEventListener('pointerdown', waterInfoPointerHandler, true);
  }
  if (
    waterInfoKeyHandler &&
    typeof document !== 'undefined' &&
    typeof document.removeEventListener === 'function'
  ) {
    document.removeEventListener('keydown', waterInfoKeyHandler, true);
  }

  if (restoreCamera) {
    requestCameraControl(event);
  }
}

function openWaterInfo(selection, event) {
  if (!waterInfoPanel) {
    return;
  }

  if (!selection || !selection.underwater) {
    closeWaterInfo();
    return;
  }

  activeWaterSelection = selection;
  updateWaterInfoPanel(selection);
  waterInfoPanel.hidden = false;
  if (typeof waterInfoPanel.setAttribute === 'function') {
    waterInfoPanel.setAttribute('aria-hidden', 'false');
  }
  ignoreNextWaterPointerDown = event?.type === 'pointerdown';

  if (!waterInfoPointerHandler) {
    waterInfoPointerHandler = (pointerEvent) => {
      if (pointerEvent.button !== undefined && pointerEvent.button !== 0) {
        return;
      }
      if (ignoreNextWaterPointerDown) {
        ignoreNextWaterPointerDown = false;
        return;
      }
      suppressNextSelectionPointerDown = true;
      if (typeof setTimeout === 'function') {
        setTimeout(() => {
          suppressNextSelectionPointerDown = false;
        }, 0);
      }
      closeWaterInfo({ restoreCamera: true, event: pointerEvent });
    };
  }

  if (!waterInfoKeyHandler) {
    waterInfoKeyHandler = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape' || keyboardEvent.key === 'Esc') {
        keyboardEvent.preventDefault();
        closeWaterInfo({ restoreCamera: true, event: keyboardEvent });
      }
    };
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('pointerdown', waterInfoPointerHandler, true);
    document.addEventListener('keydown', waterInfoKeyHandler, true);
  }
}

function applySelection(selection) {
  selectedBlock = selection;
  updateSelectionHighlight(selection.blockX, selection.blockZ);
  updateSelectionPanel(selection);
  if (typeof window !== 'undefined') {
    window.__selectedSquare = selection;
  }
}

function refreshSelectionAfterTerrain() {
  if (!selectedBlock) {
    return;
  }

  const half = baseplateSize / 2;
  const centerX = -half + (selectedBlock.blockX + 0.5) * blockSize;
  const centerZ = -half + (selectedBlock.blockZ + 0.5) * blockSize;
  const sample = sampleTerrain(centerX, centerZ);
  if (!sample) {
    clearSelection();
    return;
  }

  const height = sample.height;
  const waterDepth = Math.max(0, seaLevel - height);
  applySelection({
    blockX: sample.blockX,
    blockZ: sample.blockZ,
    chunkX: sample.chunkX,
    chunkZ: sample.chunkZ,
    worldPosition: [sample.centerX, height, sample.centerZ],
    height,
    waterLevel: seaLevel,
    waterDepth,
    underwater: waterDepth > 0,
    cornerHeights: sample.cornerHeights,
  });
}

function getPointerPosition(event) {
  if (document.pointerLockElement === canvas) {
    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
  }

  const rect = canvas.getBoundingClientRect?.() ?? { left: 0, top: 0 };
  const clientX = event?.clientX ?? 0;
  const clientY = event?.clientY ?? 0;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function castTerrainRay(origin, direction) {
  if (!terrainHeightField) {
    return null;
  }

  const maxDistance = 800;
  const step = Math.max(0.5, blockSize * 0.75);
  let t = 0;
  let previousT = 0;
  let previousDiff = null;

  while (t <= maxDistance) {
    const x = origin[0] + direction[0] * t;
    const y = origin[1] + direction[1] * t;
    const z = origin[2] + direction[2] * t;
    const sample = sampleTerrain(x, z);

    if (sample) {
      const diff = y - sample.height;
      if (diff <= 0) {
        let minT = previousDiff !== null ? previousT : Math.max(0, t - step);
        let maxT = t;
        let finalSample = sample;

        for (let i = 0; i < 6; i++) {
          const midT = (minT + maxT) / 2;
          const midX = origin[0] + direction[0] * midT;
          const midY = origin[1] + direction[1] * midT;
          const midZ = origin[2] + direction[2] * midT;
          const midSample = sampleTerrain(midX, midZ);
          if (!midSample) {
            minT = midT;
            continue;
          }
          const midDiff = midY - midSample.height;
          if (midDiff > 0) {
            minT = midT;
          } else {
            maxT = midT;
            finalSample = midSample;
          }
        }

        const centerSample = sampleTerrain(finalSample.centerX, finalSample.centerZ) || finalSample;
        const height = centerSample.height;
        const waterDepth = Math.max(0, seaLevel - height);

        return {
          blockX: centerSample.blockX,
          blockZ: centerSample.blockZ,
          chunkX: centerSample.chunkX,
          chunkZ: centerSample.chunkZ,
          worldPosition: [centerSample.centerX, height, centerSample.centerZ],
          height,
          waterLevel: seaLevel,
          waterDepth,
          underwater: waterDepth > 0,
          cornerHeights: centerSample.cornerHeights,
        };
      }

      previousDiff = diff;
      previousT = t;
    } else {
      previousDiff = null;
    }

    t += step;
  }

  return null;
}

function pickSelectionAt(pointerX, pointerY) {
  if (!inverseViewProjectionMatrix) {
    return null;
  }

  const width = canvas.width || 1;
  const height = canvas.height || 1;
  const ndcX = (pointerX / width) * 2 - 1;
  const ndcY = 1 - (pointerY / height) * 2;

  const nearPoint = multiplyMatrixVector(inverseViewProjectionMatrix, [ndcX, ndcY, -1, 1]);
  const farPoint = multiplyMatrixVector(inverseViewProjectionMatrix, [ndcX, ndcY, 1, 1]);

  if (!nearPoint || !farPoint) {
    return null;
  }

  const nearW = nearPoint[3] || 1;
  const farW = farPoint[3] || 1;
  const near = [nearPoint[0] / nearW, nearPoint[1] / nearW, nearPoint[2] / nearW];
  const far = [farPoint[0] / farW, farPoint[1] / farW, farPoint[2] / farW];
  const direction = normalize(subtract(far, near));

  if (direction[0] === 0 && direction[1] === 0 && direction[2] === 0) {
    return null;
  }

  return castTerrainRay([cameraPosition[0], cameraPosition[1], cameraPosition[2]], direction);
}

function selectBlockAtScreen(pointerX, pointerY) {
  const selection = pickSelectionAt(pointerX, pointerY);
  if (selection) {
    applySelection(selection);
  } else {
    clearSelection();
  }
  return selection;
}

function generateTerrainVertices(seedString) {
  const numericSeed = stringToSeed(seedString);
  const blocksPerSide = chunksPerSide * blocksPerChunk;
  const vertexFloatCount = blocksPerSide * blocksPerSide * 6 * floatsPerVertex;
  const vertexData = new Float32Array(vertexFloatCount);
  let heights = new Array(blocksPerSide + 1);
  let islandMask = new Array(blocksPerSide + 1);
  let canyonTotal = 0;
  let ravineTotal = 0;
  let cliffTotal = 0;
  let sampleCount = 0;

  for (let z = 0; z <= blocksPerSide; z++) {
    heights[z] = new Array(blocksPerSide + 1);
    islandMask[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      sampleCount += 1;

      const baseSampleX = (x / blocksPerSide) * terrainNoiseScale;
      const baseSampleZ = (z / blocksPerSide) * terrainNoiseScale;

      const warpNoiseX = fbm(
        baseSampleX * terrainWarpScale,
        baseSampleZ * terrainWarpScale,
        numericSeed ^ 0x68bc21f3
      );
      const warpNoiseZ = fbm(
        baseSampleX * terrainWarpScale + 11.5,
        baseSampleZ * terrainWarpScale - 7.8,
        numericSeed ^ 0x2f9b9f5c
      );

      const warpedX = baseSampleX + (warpNoiseX - 0.5) * terrainWarpStrength;
      const warpedZ = baseSampleZ + (warpNoiseZ - 0.5) * terrainWarpStrength;

      const baseNoise = fbm(warpedX, warpedZ, numericSeed);
      const duneNoise = fbm(warpedX * 1.6, warpedZ * 1.6, numericSeed ^ 0x27d4eb2d);
      const ridgeNoiseValue = ridgedNoise(
        warpedX * 0.82,
        warpedZ * 0.82,
        numericSeed ^ 0x5bf03651,
        1.4
      );

      const shapedBase = clamp01(baseNoise * 1.1 - 0.1);
      const dunePeaks = Math.pow(1 - Math.abs(duneNoise * 2 - 1), 1.8);
      const cliffShelf = Math.pow(ridgeNoiseValue, 1.6);

      const terracesBase = clamp01(shapedBase * 0.6 + ridgeNoiseValue * 0.4);
      const terraced = Math.round(terracesBase * terraceSteps) / terraceSteps;
      let combined = clamp01(terraced + dunePeaks * 0.25 + cliffShelf * 0.3);

      const canyonPattern = ridgedNoise(
        warpedX * canyonScale,
        warpedZ * canyonScale,
        numericSeed ^ 0xaba1f4c9,
        2.4
      );
      const canyonMaskNoise = fbm(
        warpedX * 1.1,
        warpedZ * 1.1,
        numericSeed ^ 0x7151bd3a
      );
      const canyonMask = clamp01(1 - Math.abs(canyonMaskNoise * 2 - 1));
      const canyonCarve = canyonPattern * (0.25 + canyonMask * 0.6);
      const canyonContribution = canyonCarve * 0.6;
      combined = clamp01(combined - canyonContribution);
      canyonTotal += canyonContribution;

      const [ravineX, ravineZ] = rotate2D(warpedX, warpedZ, ravineRotation);
      const ravineRidge = ridgedNoise(
        ravineX * ravinePrimaryScale,
        ravineZ * ravineSecondaryScale,
        numericSeed ^ 0x51c9d7a3,
        2.8
      );
      const ravineMaskNoise = fbm(
        ravineX * 0.6 + 5.2,
        ravineZ * 0.6 - 3.1,
        numericSeed ^ 0x4d2d1f87
      );
      const ravineMask = clamp01(1 - Math.abs(ravineMaskNoise * 2 - 1));
      const ravineCarve = ravineRidge * (0.3 + ravineMask * 0.5);
      const ravineContribution = ravineCarve * 0.55;
      combined = clamp01(combined - ravineContribution);
      ravineTotal += ravineContribution;

      const cliffBoost = cliffShelf * 0.45;
      combined = clamp01(combined + cliffBoost);
      cliffTotal += cliffBoost;

      const nx = x / blocksPerSide;
      const nz = z / blocksPerSide;
      const centeredX = nx * 2 - 1;
      const centeredZ = nz * 2 - 1;
      const squareDistance = Math.max(Math.abs(centeredX), Math.abs(centeredZ));
      const normalizedDistance = Math.min(1, squareDistance / falloffRadius);
      const falloff = Math.pow(normalizedDistance, falloffExponent);
      const mask = clamp01(1 - falloff);

      const masked = clamp01(combined * mask + mask * 0.12);
      const height = clamp(masked * maxTerrainHeight, 0, maxTerrainHeight);

      heights[z][x] = height;
      islandMask[z][x] = mask;
    }
  }

  const smoothField = (field, passes, clampFn) => {
    let current = field;
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ];
    for (let pass = 0; pass < passes; pass++) {
      const next = new Array(blocksPerSide + 1);
      for (let z = 0; z <= blocksPerSide; z++) {
        next[z] = new Array(blocksPerSide + 1);
        for (let x = 0; x <= blocksPerSide; x++) {
          let sum = 0;
          let weightSum = 0;
          for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
              const weight = kernel[dz + 1][dx + 1];
              const sampleX = Math.max(0, Math.min(blocksPerSide, x + dx));
              const sampleZ = Math.max(0, Math.min(blocksPerSide, z + dz));
              sum += current[sampleZ][sampleX] * weight;
              weightSum += weight;
            }
          }
          const smoothed = sum / (weightSum || 1);
          next[z][x] = clampFn ? clampFn(smoothed) : smoothed;
        }
      }
      current = next;
    }
    return current;
  };

  const rawHeights = heights.map((row) => row.slice());
  const smoothedHeights = smoothField(rawHeights, 1, (value) => clamp(value, 0, maxTerrainHeight));
  const detailBlend = 0.6;
  heights = new Array(blocksPerSide + 1);
  for (let z = 0; z <= blocksPerSide; z++) {
    heights[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      const blended = lerp(smoothedHeights[z][x], rawHeights[z][x], detailBlend);
      heights[z][x] = clamp(blended, 0, maxTerrainHeight);
    }
  }
  islandMask = smoothField(islandMask, 1, clamp01);

  const finalHeights = new Array(blocksPerSide + 1);
  let minPre = Infinity;
  let maxPre = -Infinity;
  for (let z = 0; z <= blocksPerSide; z++) {
    finalHeights[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      const mask = clamp01(islandMask[z][x]);
      const normalizedHeight = maxTerrainHeight > 0 ? heights[z][x] / maxTerrainHeight : 0;
      const blended = clamp01(normalizedHeight * 0.85 + mask * 0.15);
      const height = clamp(blended * maxTerrainHeight, 0, maxTerrainHeight);
      finalHeights[z][x] = height;
      if (height < minPre) minPre = height;
      if (height > maxPre) maxPre = height;
    }
  }

  if (maxPre > minPre) {
    const scale = maxTerrainHeight / (maxPre - minPre);
    for (let z = 0; z <= blocksPerSide; z++) {
      for (let x = 0; x <= blocksPerSide; x++) {
        const shifted = finalHeights[z][x] - minPre;
        finalHeights[z][x] = clamp(shifted * scale, 0, maxTerrainHeight);
      }
    }
  }

  heights = finalHeights;

  let minHeight = Infinity;
  let maxHeight = -Infinity;
  for (let z = 0; z <= blocksPerSide; z++) {
    for (let x = 0; x <= blocksPerSide; x++) {
      const value = heights[z][x];
      if (value < minHeight) minHeight = value;
      if (value > maxHeight) maxHeight = value;
    }
  }

  const colors = new Array(blocksPerSide + 1);
  for (let z = 0; z <= blocksPerSide; z++) {
    colors[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      const height = heights[z][x];
      const normalizedHeight = maxTerrainHeight > 0 ? height / maxTerrainHeight : 0;

      const sampleHeight = (xi, zi) => {
        const clampedX = Math.max(0, Math.min(blocksPerSide, xi));
        const clampedZ = Math.max(0, Math.min(blocksPerSide, zi));
        return heights[clampedZ][clampedX];
      };

      const left = sampleHeight(x - 1, z);
      const right = sampleHeight(x + 1, z);
      const down = sampleHeight(x, z - 1);
      const up = sampleHeight(x, z + 1);

      const tangentX = [blockSize * 2, right - left, 0];
      const tangentZ = [0, up - down, blockSize * 2];
      const normal = normalize(cross(tangentZ, tangentX));
      const diffuse = clamp01(dot(normal, lightDirection));
      const ambient = 0.4;
      const shading = clamp01(ambient + diffuse * 0.6);
      const coastalBoost = clamp01(islandMask[z][x]) * 0.2;
      const colorMix = clamp01(shading * 0.7 + normalizedHeight * 0.3 + coastalBoost * 0.5);
      colors[z][x] = mixColor(sandDarkColor, sandLightColor, colorMix);
    }
  }

  let offset = 0;
  const half = baseplateSize / 2;
  let visibleVertices = 0;
  for (let z = 0; z < blocksPerSide; z++) {
    for (let x = 0; x < blocksPerSide; x++) {
      const x0 = -half + x * blockSize;
      const x1 = x0 + blockSize;
      const z0 = -half + z * blockSize;
      const z1 = z0 + blockSize;

      const h00 = heights[z][x];
      const h10 = heights[z][x + 1];
      const h01 = heights[z + 1][x];
      const h11 = heights[z + 1][x + 1];

      const c00 = colors[z][x];
      const c10 = colors[z][x + 1];
      const c01 = colors[z + 1][x];
      const c11 = colors[z + 1][x + 1];

      const addVertex = (vx, vy, vz, color) => {
        if (vy > minVisibleHeight) {
          visibleVertices += 1;
        }
        offset = pushVertex(vertexData, offset, vx, vy, vz, color);
      };

      addVertex(x0, h00, z0, c00);
      addVertex(x1, h10, z0, c10);
      addVertex(x1, h11, z1, c11);

      addVertex(x0, h00, z0, c00);
      addVertex(x1, h11, z1, c11);
      addVertex(x0, h01, z1, c01);
    }
  }

  const normalization = sampleCount > 0 ? sampleCount : 1;
  const featureStats = {
    canyon: clamp01(canyonTotal / normalization),
    ravine: clamp01(ravineTotal / normalization),
    cliffs: clamp01(cliffTotal / normalization),
  };

  return {
    vertexData,
    minHeight,
    maxHeight,
    visibleVertices,
    heightfield: heights,
    maskfield: islandMask,
    featureStats,
  };
}

const rockTypeDefinitions = [
  { name: 'simple', subdivisions: 0, roughness: 0.32, jaggedness: 0.22, smoothing: 0.08 },
  { name: 'jagged', subdivisions: 1, roughness: 0.48, jaggedness: 0.55, smoothing: 0.04 },
  { name: 'smooth', subdivisions: 1, roughness: 0.22, jaggedness: 0.12, smoothing: 0.4 },
];

const rockTopologyCache = new Map();

function createBaseIcosahedron() {
  const t = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ].map((vertex) => normalize(vertex));

  const faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  return { vertices, faces };
}

function subdivideTopology({ vertices, faces }) {
  const newVertices = vertices.map((vertex) => vertex.slice());
  const newFaces = [];
  const midpointCache = new Map();

  function getMidpoint(i0, i1) {
    const key = i0 < i1 ? `${i0}-${i1}` : `${i1}-${i0}`;
    if (midpointCache.has(key)) {
      return midpointCache.get(key);
    }
    const a = newVertices[i0];
    const b = newVertices[i1];
    const midpoint = normalize([
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
      (a[2] + b[2]) / 2,
    ]);
    const index = newVertices.length;
    newVertices.push(midpoint);
    midpointCache.set(key, index);
    return index;
  }

  for (let i = 0; i < faces.length; i++) {
    const [i0, i1, i2] = faces[i];
    const a = getMidpoint(i0, i1);
    const b = getMidpoint(i1, i2);
    const c = getMidpoint(i2, i0);
    newFaces.push([i0, a, c], [i1, b, a], [i2, c, b], [a, b, c]);
  }

  return { vertices: newVertices, faces: newFaces };
}

function getRockTopology(subdivisions) {
  if (!rockTopologyCache.has(subdivisions)) {
    let topology = createBaseIcosahedron();
    for (let i = 0; i < subdivisions; i++) {
      topology = subdivideTopology(topology);
    }
    rockTopologyCache.set(subdivisions, topology);
  }
  const cached = rockTopologyCache.get(subdivisions);
  return {
    vertices: cached.vertices.map((vertex) => vertex.slice()),
    faces: cached.faces,
  };
}

function createRockMesh(random, type) {
  const topology = getRockTopology(type.subdivisions || 0);
  const roughness = type.roughness ?? 0.3;
  const jaggedness = type.jaggedness ?? 0.2;
  const smoothing = clamp01(type.smoothing ?? 0);

  const vertices = topology.vertices.map((vertex) => {
    const radius = 1 + randomInRange(random, -roughness, roughness);
    const jitterScale = jaggedness * 0.45;
    const perturbed = [
      vertex[0] * radius + randomInRange(random, -jitterScale, jitterScale),
      vertex[1] * radius + randomInRange(random, -jitterScale, jitterScale),
      vertex[2] * radius + randomInRange(random, -jitterScale, jitterScale),
    ];
    if (!smoothing) {
      return perturbed;
    }
    return [
      perturbed[0] * (1 - smoothing) + vertex[0] * smoothing,
      perturbed[1] * (1 - smoothing) + vertex[1] * smoothing,
      perturbed[2] * (1 - smoothing) + vertex[2] * smoothing,
    ];
  });

  return { vertices, faces: topology.faces };
}

function rotateVector(vertex, rotation) {
  const [rx, ry, rz] = rotation;
  let [x, y, z] = vertex;

  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  let y1 = y * cosX - z * sinX;
  let z1 = y * sinX + z * cosX;
  y = y1;
  z = z1;

  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  let x1 = x * cosY + z * sinY;
  let z2 = -x * sinY + z * cosY;
  x = x1;
  z = z2;

  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const x2 = x * cosZ - y * sinZ;
  const y2 = x * sinZ + y * cosZ;
  const zFinal = z;

  return [x2, y2, zFinal];
}

function transformRockVertex(vertex, scale, rotation, position) {
  const scaled = [vertex[0] * scale[0], vertex[1] * scale[1], vertex[2] * scale[2]];
  const rotated = rotateVector(scaled, rotation);
  return [rotated[0] + position[0], rotated[1] + position[1], rotated[2] + position[2]];
}

function createRockGeometry(random, type, scale, rotation, position, baseColor) {
  const mesh = createRockMesh(random, type);
  const vertices = mesh.vertices;
  const faces = mesh.faces;
  const rockVertices = [];

  const tintJitter = randomInRange(random, 0.88, 1.12);

  for (let i = 0; i < faces.length; i++) {
    const [i0, i1, i2] = faces[i];
    const p0 = transformRockVertex(vertices[i0], scale, rotation, position);
    const p1 = transformRockVertex(vertices[i1], scale, rotation, position);
    const p2 = transformRockVertex(vertices[i2], scale, rotation, position);
    const normal = normalize(cross(subtract(p1, p0), subtract(p2, p0)));
    const lightContribution = clamp01(dot(normal, lightDirection) * 0.6 + 0.35);
    const upwardInfluence = clamp01(normal[1] * 0.5 + 0.5);
    const tint = clamp(
      (lightContribution * 0.65 + upwardInfluence * 0.35) * tintJitter +
        randomInRange(random, -0.05, 0.05),
      0.35,
      1.1,
    );
    const faceColor = [
      clamp(baseColor[0] * tint, 0.05, 0.98),
      clamp(baseColor[1] * tint, 0.05, 0.98),
      clamp(baseColor[2] * tint, 0.05, 0.98),
    ];

    rockVertices.push(
      p0[0],
      p0[1],
      p0[2],
      faceColor[0],
      faceColor[1],
      faceColor[2],
      p1[0],
      p1[1],
      p1[2],
      faceColor[0],
      faceColor[1],
      faceColor[2],
      p2[0],
      p2[1],
      p2[2],
      faceColor[0],
      faceColor[1],
      faceColor[2],
    );
  }

  return rockVertices;
}

function sampleFieldValue(field, x, z, fallback) {
  if (!field || field.length === 0) {
    return fallback;
  }
  const gridSize = field.length;
  const maxIndex = gridSize - 1;
  const half = baseplateSize / 2;
  const normalizedX = clamp((x + half) / baseplateSize, 0, 1) * maxIndex;
  const normalizedZ = clamp((z + half) / baseplateSize, 0, 1) * maxIndex;
  const x0 = Math.floor(normalizedX);
  const z0 = Math.floor(normalizedZ);
  const x1 = Math.min(maxIndex, x0 + 1);
  const z1 = Math.min(maxIndex, z0 + 1);
  const tx = normalizedX - x0;
  const tz = normalizedZ - z0;

  const v00 = field[z0]?.[x0] ?? fallback;
  const v10 = field[z0]?.[x1] ?? fallback;
  const v01 = field[z1]?.[x0] ?? fallback;
  const v11 = field[z1]?.[x1] ?? fallback;

  const ix0 = lerp(v00, v10, tx);
  const ix1 = lerp(v01, v11, tx);
  return lerp(ix0, ix1, tz);
}

function sampleTerrainHeight(x, z) {
  const fallback = terrainInfo.minHeight ?? 0;
  return sampleFieldValue(terrainHeightField, x, z, fallback);
}

function sampleTerrainMask(x, z) {
  const fallback = 0;
  return sampleFieldValue(terrainMaskField, x, z, fallback);
}

function sampleTerrainNormal(x, z) {
  const step = blockSize * 0.5;
  const heightPosX = sampleTerrainHeight(x + step, z);
  const heightNegX = sampleTerrainHeight(x - step, z);
  const heightPosZ = sampleTerrainHeight(x, z + step);
  const heightNegZ = sampleTerrainHeight(x, z - step);
  const tangentX = [step * 2, heightPosX - heightNegX, 0];
  const tangentZ = [0, heightPosZ - heightNegZ, step * 2];
  const normal = normalize(cross(tangentZ, tangentX));
  if (!Number.isFinite(normal[0]) || !Number.isFinite(normal[1]) || !Number.isFinite(normal[2])) {
    return [0, 1, 0];
  }
  if (normal[0] === 0 && normal[1] === 0 && normal[2] === 0) {
    return [0, 1, 0];
  }
  return normal;
}

function regenerateRocks(seedString, heightfield, maskfield) {
  if (!heightfield || !maskfield) {
    gl.bindBuffer(gl.ARRAY_BUFFER, rockBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(0), gl.STATIC_DRAW);
    rockVertexCount = 0;
    terrainInfo.rockCount = 0;
    return;
  }

  const gridSize = heightfield.length;
  if (!gridSize) {
    gl.bindBuffer(gl.ARRAY_BUFFER, rockBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(0), gl.STATIC_DRAW);
    rockVertexCount = 0;
    terrainInfo.rockCount = 0;
    return;
  }

  let maskSum = 0;
  let maskSamples = 0;
  for (let z = 0; z < maskfield.length; z++) {
    const row = maskfield[z];
    if (!row) continue;
    maskSamples += row.length;
    for (let x = 0; x < row.length; x++) {
      maskSum += row[x];
    }
  }

  const coverage = maskSamples > 0 ? clamp(maskSum / maskSamples, 0, 1) : 0;
  const numericSeed = stringToSeed(seedString) ^ 0x51ec0ffe;
  const random = createRandomGenerator(numericSeed);
  const baseCount = clamp(
    Math.round(coverage * 420 + randomInRange(random, -20, 40)),
    24,
    680,
  );
  const half = baseplateSize / 2;
  const vertices = [];
  const maxAttempts = baseCount * 6;
  let attempts = 0;
  let placed = 0;

  while (placed < baseCount && attempts < maxAttempts) {
    attempts += 1;
    const x = randomInRange(random, -half, half);
    const z = randomInRange(random, -half, half);
    const mask = sampleTerrainMask(x, z);
    if (mask < 0.25) {
      continue;
    }

    const type = randomChoice(random, rockTypeDefinitions) || rockTypeDefinitions[0];
    const maxDimension = randomInRange(random, 0.1, 2.0);
    const axisBias = [
      randomInRange(random, 0.6, 1.25),
      randomInRange(random, 0.8, 1.35),
      randomInRange(random, 0.6, 1.25),
    ];
    const maxBias = Math.max(axisBias[0], axisBias[1], axisBias[2]) || 1;
    const scaleFactor = (maxDimension / 2) / maxBias;
    const scale = axisBias.map((value) => value * scaleFactor);

    const normal = sampleTerrainNormal(x, z);
    const slopeFactor = clamp01(1 - normal[1]);
    const rotation = [
      Math.atan2(normal[2], normal[1]) * slopeFactor + randomInRange(random, -Math.PI / 8, Math.PI / 8),
      randomInRange(random, 0, Math.PI * 2),
      -Math.atan2(normal[0], normal[1]) * slopeFactor + randomInRange(random, -Math.PI / 6, Math.PI / 6),
    ];

    const baseColorValue = randomInRange(random, 0.36, 0.6);
    const colorOffset = randomInRange(random, -0.06, 0.06);
    const baseColor = [
      clamp(baseColorValue + colorOffset * 0.35, 0.1, 0.9),
      clamp(baseColorValue + colorOffset * 0.15, 0.1, 0.9),
      clamp(baseColorValue - colorOffset * 0.2, 0.1, 0.9),
    ];

    const groundHeight = sampleTerrainHeight(x, z);
    const embedFactor = randomInRange(random, -0.25, 0.12);
    const position = [x, groundHeight + scale[1] * embedFactor, z];

    const rockVertices = createRockGeometry(random, type, scale, rotation, position, baseColor);
    if (rockVertices.length === 0) {
      continue;
    }

    vertices.push(...rockVertices);
    placed += 1;
  }

  const vertexArray = new Float32Array(vertices);
  gl.bindBuffer(gl.ARRAY_BUFFER, rockBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
  rockVertexCount = vertexArray.length / floatsPerVertex;
  terrainInfo.rockCount = placed;
}

function regenerateTerrain(seedString) {
  const {
    vertexData,
    minHeight,
    maxHeight,
    visibleVertices,
    heightfield,
    maskfield,
    featureStats,
  } = generateTerrainVertices(seedString);
  gl.bindBuffer(gl.ARRAY_BUFFER, baseplateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  baseplateVertexCount = vertexData.length / floatsPerVertex;
  terrainHeightField = heightfield;
  terrainMaskField = maskfield;
  updateGridBuffers(heightfield);
  refreshSelectionAfterTerrain();
  terrainInfo.seed = seedString;
  terrainInfo.minHeight = Math.max(0, minHeight);
  terrainInfo.maxHeight = Math.min(maxTerrainHeight, maxHeight);
  terrainInfo.vertexCount = baseplateVertexCount;
  terrainInfo.visibleVertices = visibleVertices;
  terrainInfo.visibleVertexRatio = baseplateVertexCount
    ? visibleVertices / baseplateVertexCount
    : 0;
  terrainInfo.featureStats = featureStats;
  regenerateRocks(seedString, heightfield, maskfield);
}

function generateRandomSeed() {
  return `seed-${Math.random().toString(36).slice(2, 8)}`;
}

function closeSettingsPanel() {
  if (settingsToggle && settingsPanel && !settingsPanel.hidden) {
    settingsToggle.setAttribute('aria-expanded', 'false');
    settingsPanel.hidden = true;
  }
}

function setSeed(nextSeed) {
  const sanitized = String(nextSeed ?? '').trim();
  const chosen = sanitized || defaultSeed;
  currentSeed = chosen;
  if (seedInput && seedInput.value !== chosen) {
    seedInput.value = chosen;
  }
  try {
    regenerateTerrain(chosen);
  } catch (error) {
    handleFatalRuntimeError(error, 'regeneración de terreno');
  }
}

try {
  regenerateTerrain(currentSeed);
} catch (error) {
  handleFatalRuntimeError(error, 'generación inicial de terreno');
}

function isEditableElement(element) {
  if (!element) {
    return false;
  }
  const tagName = element.tagName;
  if (!tagName) {
    return Boolean(element.isContentEditable);
  }
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    element.isContentEditable === true ||
    element.getAttribute?.('contenteditable') === 'true'
  );
}

gl.enableVertexAttribArray(positionAttribute);
gl.enableVertexAttribArray(colorAttribute);

const worldUp = [0, 1, 0];
const movementState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

let yaw = 0; // Comienza mirando hacia -Z
let pitch = -0.35; // Inclina ligeramente la cámara hacia abajo para mostrar la baseplate inicial
const cameraPosition = [0, 5, 20];

const pointerSensitivity = 0.002;
const moveSpeed = 12;

function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]);
  if (length === 0) return [0, 0, 0];
  return [v[0] / length, v[1] / length, v[2] / length];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale(v, scalar) {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function createPerspectiveMatrix(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  const rangeInv = 1 / (near - far);

  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv * 2,
    0,
  ]);
}

function createLookAtMatrix(eye, target, up) {
  const zAxis = normalize(subtract(eye, target));
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);

  return new Float32Array([
    xAxis[0],
    yAxis[0],
    zAxis[0],
    0,
    xAxis[1],
    yAxis[1],
    zAxis[1],
    0,
    xAxis[2],
    yAxis[2],
    zAxis[2],
    0,
    -dot(xAxis, eye),
    -dot(yAxis, eye),
    -dot(zAxis, eye),
    1,
  ]);
}

function multiplyMatrixVector(matrix, vector) {
  return [
    matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8] * vector[2] + matrix[12] * vector[3],
    matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9] * vector[2] + matrix[13] * vector[3],
    matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14] * vector[3],
    matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15] * vector[3],
  ];
}

function invertMatrix(a) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1 / det;

  const out = new Float32Array(16);

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * det;
  out[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * det;
  out[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}

function multiplyMatrices(a, b) {
  const result = new Float32Array(16);

  for (let column = 0; column < 4; column++) {
    const b0 = b[column * 4 + 0];
    const b1 = b[column * 4 + 1];
    const b2 = b[column * 4 + 2];
    const b3 = b[column * 4 + 3];

    result[column * 4 + 0] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    result[column * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    result[column * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    result[column * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }

  return result;
}

function updateCanvasSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);

function requestCameraControl(event) {
  if (fatalRuntimeError) {
    if (event) {
      event.preventDefault();
    }
    return;
  }
  if (event?.detail >= 2) {
    return;
  }
  if (event) {
    event.preventDefault();
  }
  dismissTutorialOverlay();
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
}

canvas.addEventListener('click', (event) => {
  requestCameraControl(event);
});

canvas.addEventListener('pointerdown', (event) => {
  if (fatalRuntimeError) {
    return;
  }
  if (event.button !== 0) {
    return;
  }
  if (suppressNextSelectionPointerDown) {
    suppressNextSelectionPointerDown = false;
    return;
  }
  const pointer = getPointerPosition(event);
  const selection = selectBlockAtScreen(pointer.x, pointer.y);
  if (selection && selection.underwater) {
    openWaterInfo(selection, event);
  } else {
    closeWaterInfo();
  }
});

if (startButton) {
  startButton.addEventListener('click', requestCameraControl);
}

if (settingsToggle && settingsPanel) {
  settingsToggle.addEventListener('click', () => {
    const expanded = settingsToggle.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    settingsToggle.setAttribute('aria-expanded', String(next));
    settingsPanel.hidden = !next;
    if (next && seedInput) {
      seedInput.focus();
      seedInput.select();
    }
  });
}

if (settingsPanel) {
  settingsPanel.addEventListener('submit', (event) => {
    event.preventDefault();
    if (seedInput) {
      setSeed(seedInput.value);
    }
    closeSettingsPanel();
  });
}

if (randomSeedButton) {
  randomSeedButton.addEventListener('click', () => {
    const generated = generateRandomSeed();
    setSeed(generated);
    closeSettingsPanel();
  });
}

if (debugToggleButton) {
  debugToggleButton.addEventListener('click', () => {
    setDebugPanelExpanded(!debugPanelExpanded);
    if (debugPanelExpanded && debugConsole) {
      debugConsole.scrollTop = debugConsole.scrollHeight;
    }
  });
}

function handleSimulationSpeedChange(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return;
  }
  setSimulationSpeed(parsed);
}

if (simulationSpeedSlider) {
  simulationSpeedSlider.addEventListener('input', (event) => {
    handleSimulationSpeedChange(event.target.value);
  });
  simulationSpeedSlider.addEventListener('change', (event) => {
    handleSimulationSpeedChange(event.target.value);
  });
}

if (debugTerrainToggle) {
  debugTerrainToggle.addEventListener('change', (event) => {
    applyTranslucentTerrainSetting(event.target.checked);
  });
}

if (selectionCloseButton) {
  selectionCloseButton.addEventListener('click', () => {
    clearSelection();
  });
}

if (waterInfoCloseButton) {
  waterInfoCloseButton.addEventListener('click', (event) => {
    closeWaterInfo({ restoreCamera: true, event });
  });
}

const initialTranslucentTerrain = debugTerrainToggle
  ? Boolean(debugTerrainToggle.checked)
  : false;
applyTranslucentTerrainSetting(initialTranslucentTerrain);

let pointerLockErrors = 0;
document.addEventListener('pointerlockerror', () => {
  pointerLockErrors += 1;
  showTutorialOverlay();
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  if (locked) {
    dismissTutorialOverlay();
  } else if (!overlayDismissed) {
    showTutorialOverlay();
  } else {
    applyTutorialState(false);
  }
});

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === canvas) {
    yaw += event.movementX * pointerSensitivity;
    pitch -= event.movementY * pointerSensitivity;
    const limit = Math.PI / 2 - 0.01;
    pitch = clamp(pitch, -limit, limit);
  }
});

document.addEventListener('keydown', (event) => {
  if (isEditableElement(event.target)) {
    return;
  }
  if (event.code === 'Escape' && tutorialActive) {
    event.preventDefault();
    dismissTutorialOverlay();
    return;
  }
  switch (event.code) {
    case 'KeyW':
      movementState.forward = true;
      break;
    case 'KeyS':
      movementState.backward = true;
      break;
    case 'KeyA':
      movementState.left = true;
      break;
    case 'KeyD':
      movementState.right = true;
      break;
    case 'KeyQ':
      movementState.down = true;
      break;
    case 'KeyE':
      movementState.up = true;
      break;
    case 'Enter':
      if (document.pointerLockElement !== canvas) {
        requestCameraControl(event);
      }
      return;
    default:
      return;
  }
  event.preventDefault();
});

document.addEventListener('keyup', (event) => {
  if (isEditableElement(event.target)) {
    return;
  }
  switch (event.code) {
    case 'KeyW':
      movementState.forward = false;
      break;
    case 'KeyS':
      movementState.backward = false;
      break;
    case 'KeyA':
      movementState.left = false;
      break;
    case 'KeyD':
      movementState.right = false;
      break;
    case 'KeyQ':
      movementState.down = false;
      break;
    case 'KeyE':
      movementState.up = false;
      break;
    default:
      return;
  }
  event.preventDefault();
});

let previousTime = performance.now();
let fpsAccumulator = 0;
let fpsSamples = 0;
let displayedFps = 0;
let lastGlError = 'ninguno';

const baseTickRate = 20;
const baseSimulationStep = 1 / baseTickRate;
const MIN_SIMULATION_SPEED = 0.1;
const MAX_SIMULATION_SPEED = 3;
let simulationSpeed = 1;
let targetTickRate = baseTickRate * simulationSpeed;
let tickInterval = 1 / targetTickRate;
let tickAccumulator = 0;
let tickStatsAccumulator = 0;
let tickSamples = 0;
let displayedTps = 0;
let totalTicks = 0;
let simulationTime = 0;
let ticksLastFrame = 0;

updateDayNightCycleState(simulationTime);

const simulationInfo = {
  baseTickRate,
  speed: simulationSpeed,
  tickRate: targetTickRate,
  tickInterval,
  time: simulationTime,
  totalTicks,
  displayedTps,
  ticksLastFrame,
  dayNight: dayNightCycleState,
};

if (typeof window !== 'undefined') {
  window.__simulationInfo = simulationInfo;
}

setSimulationSpeed(simulationSpeed);

function normalizeSimulationSpeed(value) {
  if (!Number.isFinite(value)) {
    return simulationSpeed;
  }
  const clamped = Math.min(MAX_SIMULATION_SPEED, Math.max(MIN_SIMULATION_SPEED, value));
  return Math.round(clamped * 10) / 10;
}

function setSimulationSpeed(multiplier) {
  const normalized = normalizeSimulationSpeed(multiplier);
  simulationSpeed = normalized;
  targetTickRate = baseTickRate * simulationSpeed;
  tickInterval = 1 / targetTickRate;
  simulationInfo.speed = simulationSpeed;
  simulationInfo.tickRate = targetTickRate;
  simulationInfo.tickInterval = tickInterval;

  if (simulationSpeedSlider && simulationSpeedSlider.value !== String(simulationSpeed)) {
    simulationSpeedSlider.value = String(simulationSpeed);
  }

  const speedLabel = `${simulationSpeed.toFixed(1)}×`;
  if (simulationSpeedIndicator) {
    simulationSpeedIndicator.textContent = speedLabel;
  }
  if (simulationSpeedDisplay) {
    simulationSpeedDisplay.textContent = speedLabel;
  }
  if (simulationSpeedSettingsDisplay) {
    simulationSpeedSettingsDisplay.textContent = speedLabel;
  }
}

function formatSimulationTime(timeInSeconds) {
  const totalSeconds = Math.max(0, timeInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds % 1) * 10);
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}.${tenths}`;
}

function updateSimulationHud() {
  if (simulationClock) {
    simulationClock.textContent = formatSimulationTime(simulationTime);
  }
  if (simulationSpeedIndicator) {
    simulationSpeedIndicator.textContent = `${simulationSpeed.toFixed(1)}×`;
  }
  if (simulationSpeedDisplay) {
    simulationSpeedDisplay.textContent = `${simulationSpeed.toFixed(1)}×`;
  }
  if (simulationSpeedSettingsDisplay) {
    simulationSpeedSettingsDisplay.textContent = `${simulationSpeed.toFixed(1)}×`;
  }
  updateDayCycleHud();
}

function updateDayCycleHud() {
  const normalized = dayNightCycleState.normalizedTime ?? 0;
  const hours = normalized * 24;
  if (dayCycleProgressFill && dayCycleProgressFill.style) {
    dayCycleProgressFill.style.width = `${Math.min(100, Math.max(0, normalized * 100))}%`;
  }
  if (dayCycleProgressTrack && typeof dayCycleProgressTrack.setAttribute === 'function') {
    dayCycleProgressTrack.setAttribute('aria-valuenow', hours.toFixed(1));
    const phase = getDayCyclePhase(normalized);
    const label = dayCyclePhaseLabels[phase] ?? `${hours.toFixed(1)}h`;
    dayCycleProgressTrack.setAttribute('aria-valuetext', label);
  }
  if (dayCyclePhaseIconMap.size > 0) {
    const activePhase = getDayCyclePhase(normalized);
    for (const [phase, element] of dayCyclePhaseIconMap) {
      if (!element?.classList) {
        continue;
      }
      if (phase === activePhase) {
        element.classList.add('hud-daycycle__icon--active');
      } else {
        element.classList.remove('hud-daycycle__icon--active');
      }
    }
  }
}

function tickSimulation(deltaTime) {
  // Punto de extensión para futuros sistemas de simulación basados en ticks.
  void deltaTime;
}

function update(deltaTime) {
  const forwardDirection = [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch),
  ];

  const flatForward = normalize([forwardDirection[0], 0, forwardDirection[2]]);
  const rightDirection = normalize(cross(flatForward, worldUp));

  let moveVector = [0, 0, 0];

  if (movementState.forward) moveVector = add(moveVector, flatForward);
  if (movementState.backward) moveVector = subtract(moveVector, flatForward);
  if (movementState.left) moveVector = subtract(moveVector, rightDirection);
  if (movementState.right) moveVector = add(moveVector, rightDirection);

  if (moveVector[0] !== 0 || moveVector[1] !== 0 || moveVector[2] !== 0) {
    moveVector = normalize(moveVector);
    const scaled = scale(moveVector, moveSpeed * deltaTime);
    cameraPosition[0] += scaled[0];
    cameraPosition[1] += scaled[1];
    cameraPosition[2] += scaled[2];
  }

  if (movementState.up) {
    cameraPosition[1] += moveSpeed * deltaTime;
  }

  if (movementState.down) {
    cameraPosition[1] -= moveSpeed * deltaTime;
  }

  const target = add(cameraPosition, forwardDirection);
  const projection = createPerspectiveMatrix((60 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 500);
  const view = createLookAtMatrix(cameraPosition, target, worldUp);
  const viewProjection = multiplyMatrices(projection, view);
  inverseViewProjectionMatrix = invertMatrix(viewProjection);

  gl.uniformMatrix4fv(viewProjectionUniform, false, viewProjection);
}

function bindGeometry(buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, vertexStride, 0);
  gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, vertexStride, 12);
}

function render() {
  drawStats.terrain = 0;
  drawStats.rocks = 0;
  drawStats.blockGrid = 0;
  drawStats.chunkGrid = 0;
  drawStats.selection = 0;
  drawStats.total = 0;

  const skyColor = dayNightCycleState.skyColor;
  if (skyColor) {
    gl.clearColor(skyColor[0], skyColor[1], skyColor[2], 1);
  }

  if (globalLightColorUniform) {
    const lightColor = dayNightCycleState.lightColor;
    gl.uniform3f(
      globalLightColorUniform,
      lightColor[0],
      lightColor[1],
      lightColor[2],
    );
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
  }

  if (typeof gl.enable === 'function' && typeof gl.disable === 'function') {
    if (terrainRenderState.translucent) {
      gl.enable(gl.BLEND);
      if (typeof gl.blendFunc === 'function') {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    } else {
      gl.disable(gl.BLEND);
    }
  }

  if (baseplateVertexCount > 0) {
    bindGeometry(baseplateBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, baseplateVertexCount);
    drawStats.terrain += 1;
    drawStats.total += 1;
  }

  if (rockVertexCount > 0) {
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, 1);
    }
    bindGeometry(rockBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, rockVertexCount);
    drawStats.rocks += 1;
    drawStats.total += 1;
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
    }
  }

  const hasGridGeometry = blockGridVertexCount > 0 || chunkGridVertexCount > 0;
  if (hasGridGeometry) {
    if (typeof gl.enable === 'function') {
      gl.enable(gl.DEPTH_TEST);
    }

    if (typeof gl.depthMask === 'function') {
      gl.depthMask(false);
    }

    if (blockGridVertexCount > 0) {
      bindGeometry(blockGridBuffer);
      gl.drawArrays(gl.LINES, 0, blockGridVertexCount);
      drawStats.blockGrid += 1;
      drawStats.total += 1;
    }

    if (chunkGridVertexCount > 0) {
      bindGeometry(chunkGridBuffer);
      gl.drawArrays(gl.LINES, 0, chunkGridVertexCount);
      drawStats.chunkGrid += 1;
      drawStats.total += 1;
    }

    if (typeof gl.depthMask === 'function') {
      gl.depthMask(true);
    }
  }

  if (selectionHighlightVertexCount > 0) {
    if (typeof gl.disable === 'function') {
      gl.disable(gl.DEPTH_TEST);
    }
    bindGeometry(selectionHighlightBuffer);
    gl.drawArrays(gl.LINES, 0, selectionHighlightVertexCount);
    drawStats.selection += 1;
    drawStats.total += 1;
    if (typeof gl.enable === 'function') {
      gl.enable(gl.DEPTH_TEST);
    }
  }

  if (typeof gl.getError === 'function') {
    const error = gl.getError();
    lastGlError = error === GL_NO_ERROR ? 'ninguno' : `0x${error.toString(16)}`;
  }
}

function updateDebugConsole(deltaTime) {
  if (!debugConsole) {
    return;
  }

  fpsAccumulator += deltaTime;
  fpsSamples += 1;
  if (fpsAccumulator >= 0.5) {
    displayedFps = fpsSamples / fpsAccumulator;
    fpsAccumulator = 0;
    fpsSamples = 0;
  }

  const pointerLocked = document.pointerLockElement === canvas;
  const activeMovement = Object.entries(movementState)
    .filter(([, active]) => active)
    .map(([key]) => key)
    .join(', ');

  const visiblePercentage = terrainInfo.vertexCount
    ? terrainInfo.visibleVertexRatio * 100
    : 0;

  const featureStats = terrainInfo.featureStats || { canyon: 0, ravine: 0, cliffs: 0 };
  const formatFeaturePercent = (value) =>
    Number.isFinite(value) ? (Math.max(0, value) * 100).toFixed(0) : '0';

  const selectionStatus = selectedBlock
    ? `bloque ${selectedBlock.blockX},${selectedBlock.blockZ} (${selectedBlock.height.toFixed(2)}m)`
    : 'Ninguna';

  const info = [
    `Estado: ${pointerLocked ? 'Explorando' : 'En espera'}`,
    `FPS: ${displayedFps ? displayedFps.toFixed(1) : '---'}`,
    `TPS: ${displayedTps ? displayedTps.toFixed(1) : '---'} (objetivo: ${targetTickRate.toFixed(1)})`,
    `Velocidad sim: ${simulationSpeed.toFixed(1)}×`,
    `Tiempo sim: ${simulationTime.toFixed(2)}s`,
    `Ciclo día/noche: ${(dayNightCycleState.normalizedTime * 24).toFixed(1)}h (luz ${(dayNightCycleState.intensity * 100).toFixed(0)}%)`,
    `Ticks totales: ${totalTicks} (cuadro: ${ticksLastFrame})`,
    `Cámara: x=${cameraPosition[0].toFixed(2)} y=${cameraPosition[1].toFixed(2)} z=${cameraPosition[2].toFixed(2)}`,
    `Orientación: yaw=${((yaw * 180) / Math.PI).toFixed(1)}° pitch=${((pitch * 180) / Math.PI).toFixed(1)}°`,
    `Terreno seed: ${terrainInfo.seed}`,
    `Terreno translúcido: ${seeThroughTerrain ? 'Sí' : 'No'}`,
    `Altura terreno: min=${terrainInfo.minHeight.toFixed(2)}m max=${terrainInfo.maxHeight.toFixed(2)}m`,
    `Terreno visible: ${visiblePercentage.toFixed(1)}% (${terrainInfo.visibleVertices}/${terrainInfo.vertexCount})`,
    `Rocas generadas: ${terrainInfo.rockCount}`,
    `Terreno características: cañones=${formatFeaturePercent(featureStats.canyon)}% barrancos=${formatFeaturePercent(featureStats.ravine)}% acantilados=${formatFeaturePercent(featureStats.cliffs)}%`,
    `Selección: ${selectionStatus}`,
    `Movimiento activo: ${activeMovement || 'Ninguno'}`,
    `Depuración: terreno translúcido ${terrainRenderState.translucent ? 'activado' : 'desactivado'}`,
    `Draw calls: total=${drawStats.total} terreno=${drawStats.terrain} rocas=${drawStats.rocks} bloques=${drawStats.blockGrid} chunks=${drawStats.chunkGrid} selección=${drawStats.selection}`,
    `Geometría: terreno=${baseplateVertexCount} bloques=${blockGridVertexCount} chunks=${chunkGridVertexCount}`,
    `GL error: ${lastGlError}`,
  ];

  if (pointerLockErrors > 0) {
    info.push(`Pointer lock errores: ${pointerLockErrors}`);
  }

  if (runtimeIssues.length > 0) {
    info.push('', 'Problemas recientes:');
    for (const issue of runtimeIssues) {
      const marker = issue.severity === 'fatal' ? '⛔' : '⚠️';
      info.push(`${marker} [${issue.timestamp}] ${issue.context}: ${formatIssueMessage(issue)}`);
    }
  }

  const output = info.join('\n');

  debugConsole.textContent = output;
  if (typeof debugConsole.setAttribute === 'function') {
    debugConsole.setAttribute('aria-hidden', debugPanelExpanded ? 'false' : 'true');
  }
}

function loop(currentTime) {
  if (loopHalted) {
    return;
  }

  try {
    const deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    tickAccumulator += deltaTime;
    ticksLastFrame = 0;

    while (tickAccumulator >= tickInterval) {
      tickSimulation(tickInterval);
      tickAccumulator -= tickInterval;
      simulationTime += baseSimulationStep;
      updateDayNightCycleState(simulationTime);
      totalTicks += 1;
      ticksLastFrame += 1;
      tickStatsAccumulator += tickInterval;
      tickSamples += 1;
    }

    if (tickStatsAccumulator >= 0.5) {
      displayedTps = tickSamples / tickStatsAccumulator;
      tickStatsAccumulator = 0;
      tickSamples = 0;
    }

    simulationInfo.speed = simulationSpeed;
    simulationInfo.tickRate = targetTickRate;
    simulationInfo.tickInterval = tickInterval;
    simulationInfo.time = simulationTime;
    simulationInfo.totalTicks = totalTicks;
    simulationInfo.displayedTps = displayedTps;
    simulationInfo.ticksLastFrame = ticksLastFrame;
    simulationInfo.dayNight = dayNightCycleState;

    update(deltaTime);
    render();
    updateDebugConsole(deltaTime);
    updateSimulationHud();
  } catch (error) {
    handleFatalRuntimeError(error, 'bucle principal');
    return;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
