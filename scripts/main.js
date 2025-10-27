const canvas = document.getElementById('scene');
const overlay = document.getElementById('overlay');
const simulationHud = document.getElementById('simulation-hud');
const startButton = document.getElementById('start-button');
const debugConsole = document.getElementById('debug-console');
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

const bodyElement = document.body;

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
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
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

const blockLineColor = [0.92, 0.88, 0.78];
const chunkLineColor = [0.7, 0.64, 0.52];
const sandDarkColor = [0.73, 0.64, 0.48];
const sandLightColor = [0.97, 0.91, 0.74];
const terrainNoiseScale = 4.8;
const maxTerrainHeight = 20;
const minVisibleHeight = 0.001;
const falloffRadius = 0.9;
const falloffExponent = 3.1;
const lightDirection = (() => {
  const length = Math.hypot(0.37, 0.84, 0.4) || 1;
  return [0.37 / length, 0.84 / length, 0.4 / length];
})();

const baseplateBuffer = createBuffer(new Float32Array(0));
let baseplateVertexCount = 0;

const blockGridBuffer = createBuffer(new Float32Array(0));
const chunkGridBuffer = createBuffer(new Float32Array(0));

let blockGridVertexCount = 0;
let chunkGridVertexCount = 0;

const defaultSeed = 'coral-dunas';
let currentSeed = defaultSeed;
const terrainInfo = {
  seed: currentSeed,
  minHeight: 0,
  maxHeight: 0,
  vertexCount: 0,
  visibleVertices: 0,
  visibleVertexRatio: 0,
};

let terrainHeightField = null;

if (typeof window !== 'undefined') {
  window.__terrainInfo = terrainInfo;
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

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function mixColor(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
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

function updateGridBuffers(heightField) {
  const blockVertices = createTerrainGridVertices(heightField, 1, blockLineColor, 0.08);
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

function generateTerrainVertices(seedString) {
  const numericSeed = stringToSeed(seedString);
  const blocksPerSide = chunksPerSide * blocksPerChunk;
  const vertexFloatCount = blocksPerSide * blocksPerSide * 6 * floatsPerVertex;
  const vertexData = new Float32Array(vertexFloatCount);
  let heights = new Array(blocksPerSide + 1);
  let islandMask = new Array(blocksPerSide + 1);

  for (let z = 0; z <= blocksPerSide; z++) {
    heights[z] = new Array(blocksPerSide + 1);
    islandMask[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      const sampleX = (x / blocksPerSide) * terrainNoiseScale;
      const sampleZ = (z / blocksPerSide) * terrainNoiseScale;
      const baseNoise = fbm(sampleX, sampleZ, numericSeed);
      const duneNoise = fbm(sampleX * 1.6, sampleZ * 1.6, numericSeed ^ 0x27d4eb2d);

      const shapedBase = clamp01(baseNoise * 1.12 - 0.12);
      const dunePeaks = Math.pow(1 - Math.abs(duneNoise * 2 - 1), 1.8);

      const nx = x / blocksPerSide;
      const nz = z / blocksPerSide;
      const centeredX = nx * 2 - 1;
      const centeredZ = nz * 2 - 1;
      const squareDistance = Math.max(Math.abs(centeredX), Math.abs(centeredZ));
      const normalizedDistance = Math.min(1, squareDistance / falloffRadius);
      const falloff = Math.pow(normalizedDistance, falloffExponent);
      const mask = clamp01(1 - falloff);

      const combined = clamp01((shapedBase + dunePeaks * 0.35) * mask + mask * 0.1);
      const height = clamp(combined * maxTerrainHeight, 0, maxTerrainHeight);

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

  heights = smoothField(heights, 2, (value) => clamp(value, 0, maxTerrainHeight));
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

  return { vertexData, minHeight, maxHeight, visibleVertices, heightField: heights };
}

function regenerateTerrain(seedString) {
  const { vertexData, minHeight, maxHeight, visibleVertices, heightField } =
    generateTerrainVertices(seedString);
  gl.bindBuffer(gl.ARRAY_BUFFER, baseplateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  baseplateVertexCount = vertexData.length / floatsPerVertex;
  terrainHeightField = heightField;
  updateGridBuffers(heightField);
  terrainInfo.seed = seedString;
  terrainInfo.minHeight = Math.max(0, minHeight);
  terrainInfo.maxHeight = Math.min(maxTerrainHeight, maxHeight);
  terrainInfo.vertexCount = baseplateVertexCount;
  terrainInfo.visibleVertices = visibleVertices;
  terrainInfo.visibleVertexRatio = baseplateVertexCount
    ? visibleVertices / baseplateVertexCount
    : 0;
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
  regenerateTerrain(chosen);
}

regenerateTerrain(currentSeed);

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

function multiplyMatrices(a, b) {
  const result = new Float32Array(16);
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

  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b03 = b[3];
  const b10 = b[4];
  const b11 = b[5];
  const b12 = b[6];
  const b13 = b[7];
  const b20 = b[8];
  const b21 = b[9];
  const b22 = b[10];
  const b23 = b[11];
  const b30 = b[12];
  const b31 = b[13];
  const b32 = b[14];
  const b33 = b[15];

  result[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
  result[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
  result[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
  result[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

  result[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
  result[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
  result[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
  result[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

  result[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
  result[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
  result[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
  result[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

  result[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
  result[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
  result[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
  result[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

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
  if (event) {
    event.preventDefault();
  }
  dismissTutorialOverlay();
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
}

canvas.addEventListener('click', requestCameraControl);

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

const simulationInfo = {
  baseTickRate,
  speed: simulationSpeed,
  tickRate: targetTickRate,
  tickInterval,
  time: simulationTime,
  totalTicks,
  displayedTps,
  ticksLastFrame,
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

  gl.uniformMatrix4fv(viewProjectionUniform, false, viewProjection);
}

function bindGeometry(buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, vertexStride, 0);
  gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, vertexStride, 12);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (baseplateVertexCount > 0) {
    bindGeometry(baseplateBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, baseplateVertexCount);
  }

  if (blockGridVertexCount > 0 || chunkGridVertexCount > 0) {
    if (typeof gl.disable === 'function') {
      gl.disable(gl.DEPTH_TEST);
    }

    if (blockGridVertexCount > 0) {
      bindGeometry(blockGridBuffer);
      gl.drawArrays(gl.LINES, 0, blockGridVertexCount);
    }

    if (chunkGridVertexCount > 0) {
      bindGeometry(chunkGridBuffer);
      gl.drawArrays(gl.LINES, 0, chunkGridVertexCount);
    }

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

  const info = [
    `Estado: ${pointerLocked ? 'Explorando' : 'En espera'}`,
    `FPS: ${displayedFps ? displayedFps.toFixed(1) : '---'}`,
    `TPS: ${displayedTps ? displayedTps.toFixed(1) : '---'} (objetivo: ${targetTickRate.toFixed(1)})`,
    `Velocidad sim: ${simulationSpeed.toFixed(1)}×`,
    `Tiempo sim: ${simulationTime.toFixed(2)}s`,
    `Ticks totales: ${totalTicks} (cuadro: ${ticksLastFrame})`,
    `Cámara: x=${cameraPosition[0].toFixed(2)} y=${cameraPosition[1].toFixed(2)} z=${cameraPosition[2].toFixed(2)}`,
    `Orientación: yaw=${((yaw * 180) / Math.PI).toFixed(1)}° pitch=${((pitch * 180) / Math.PI).toFixed(1)}°`,
    `Terreno seed: ${terrainInfo.seed}`,
    `Altura terreno: min=${terrainInfo.minHeight.toFixed(2)}m max=${terrainInfo.maxHeight.toFixed(2)}m`,
    `Terreno visible: ${visiblePercentage.toFixed(1)}% (${terrainInfo.visibleVertices}/${terrainInfo.vertexCount})`,
    `Movimiento activo: ${activeMovement || 'Ninguno'}`,
    `Draw calls: terreno=${baseplateVertexCount} bloques=${blockGridVertexCount} chunks=${chunkGridVertexCount}`,
    `GL error: ${lastGlError}`,
  ];

  if (pointerLockErrors > 0) {
    info.push(`Pointer lock errores: ${pointerLockErrors}`);
  }

  debugConsole.textContent = info.join('\n');
}

function loop(currentTime) {
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  tickAccumulator += deltaTime;
  ticksLastFrame = 0;

  while (tickAccumulator >= tickInterval) {
    tickSimulation(tickInterval);
    tickAccumulator -= tickInterval;
    simulationTime += tickInterval;
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

  update(deltaTime);
  render();
  updateDebugConsole(deltaTime);
  updateSimulationHud();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
