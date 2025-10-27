const canvas = document.getElementById('scene');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('start-button');
const debugConsole = document.getElementById('debug-console');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const seedInput = document.getElementById('seed-input');
const randomSeedButton = document.getElementById('random-seed');
const waterInfoPanel = document.getElementById('water-panel');
const waterInfoClose = document.getElementById('water-panel-close');
const waterInfoCoordinates = document.getElementById('water-panel-coordinates');
const waterInfoVolume = document.getElementById('water-panel-volume');
const waterInfoDepth = document.getElementById('water-panel-depth');

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
const blocksPerSide = chunksPerSide * blocksPerChunk;
const baseplateHalfSize = baseplateSize / 2;

const waterCellSize = 0.1; // 10 cm x 10 cm por celda
const waterCellsPerSide = Math.round(baseplateSize / waterCellSize);
const waterCellArea = waterCellSize * waterCellSize;
const waterSurfaceLevel = 12; // altura del agua sobre el terreno

const floatsPerVertex = 6;
const vertexStride = floatsPerVertex * Float32Array.BYTES_PER_ELEMENT;

function createLineGrid(size, step, color, yOffset) {
  const half = size / 2;
  const lineCount = Math.round(size / step);
  const vertices = [];
  for (let i = 0; i <= lineCount; i++) {
    const position = -half + i * step;
    // Líneas paralelas al eje Z
    vertices.push(position, yOffset, -half, color[0], color[1], color[2]);
    vertices.push(position, yOffset, half, color[0], color[1], color[2]);
    // Líneas paralelas al eje X
    vertices.push(-half, yOffset, position, color[0], color[1], color[2]);
    vertices.push(half, yOffset, position, color[0], color[1], color[2]);
  }
  return new Float32Array(vertices);
}

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

const blockGridVertices = createLineGrid(baseplateSize, blockSize, blockLineColor, 0.02);
const chunkGridVertices = createLineGrid(baseplateSize, chunkSize, chunkLineColor, 0.04);

const blockGridBuffer = createBuffer(blockGridVertices);
const chunkGridBuffer = createBuffer(chunkGridVertices);

const blockGridVertexCount = blockGridVertices.length / floatsPerVertex;
const chunkGridVertexCount = chunkGridVertices.length / floatsPerVertex;

let terrainHeightField = null;
let waterVolumeData = null;
let suppressOverlay = false;

const defaultSeed = 'coral-dunas';
let currentSeed = defaultSeed;
const terrainInfo = {
  seed: currentSeed,
  minHeight: 0,
  maxHeight: 0,
  vertexCount: 0,
  visibleVertices: 0,
  visibleVertexRatio: 0,
  waterSurfaceLevel,
  waterCellSize,
  waterCellsPerSide,
  lastSelectedWaterCell: null,
};

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

function generateTerrainVertices(seedString) {
  const numericSeed = stringToSeed(seedString);
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
  const half = baseplateHalfSize;
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

function sampleTerrainHeight(heightField, worldX, worldZ) {
  if (!heightField) {
    return 0;
  }

  const normalizedX = clamp01((worldX + baseplateHalfSize) / baseplateSize);
  const normalizedZ = clamp01((worldZ + baseplateHalfSize) / baseplateSize);

  const gridX = normalizedX * blocksPerSide;
  const gridZ = normalizedZ * blocksPerSide;

  const x0 = Math.floor(gridX);
  const z0 = Math.floor(gridZ);
  const x1 = Math.min(blocksPerSide, x0 + 1);
  const z1 = Math.min(blocksPerSide, z0 + 1);

  const tx = gridX - x0;
  const tz = gridZ - z0;

  const h00 = heightField[z0]?.[x0] ?? 0;
  const h10 = heightField[z0]?.[x1] ?? h00;
  const h01 = heightField[z1]?.[x0] ?? h00;
  const h11 = heightField[z1]?.[x1] ?? h00;

  const hx0 = lerp(h00, h10, tx);
  const hx1 = lerp(h01, h11, tx);
  return lerp(hx0, hx1, tz);
}

function generateWaterVolumeData(heightField) {
  if (!heightField) {
    return null;
  }

  const volumes = new Float32Array(waterCellsPerSide * waterCellsPerSide);

  for (let z = 0; z < waterCellsPerSide; z++) {
    const worldZ = -baseplateHalfSize + (z + 0.5) * waterCellSize;
    for (let x = 0; x < waterCellsPerSide; x++) {
      const worldX = -baseplateHalfSize + (x + 0.5) * waterCellSize;
      const terrainHeight = sampleTerrainHeight(heightField, worldX, worldZ);
      const depth = Math.max(0, waterSurfaceLevel - terrainHeight);
      volumes[z * waterCellsPerSide + x] = depth * waterCellArea;
    }
  }

  return {
    cellSize: waterCellSize,
    cellsPerSide: waterCellsPerSide,
    surfaceLevel: waterSurfaceLevel,
    volumes,
  };
}

function worldToWaterCell(worldX, worldZ) {
  const offsetX = worldX + baseplateHalfSize;
  const offsetZ = worldZ + baseplateHalfSize;

  if (offsetX < 0 || offsetZ < 0 || offsetX >= baseplateSize || offsetZ >= baseplateSize) {
    return null;
  }

  const cellX = Math.floor(offsetX / waterCellSize);
  const cellZ = Math.floor(offsetZ / waterCellSize);
  if (
    cellX < 0 ||
    cellZ < 0 ||
    cellX >= waterCellsPerSide ||
    cellZ >= waterCellsPerSide
  ) {
    return null;
  }

  return { cellX, cellZ };
}

function updateOverlayVisibility(forceVisible = false) {
  if (!overlay) {
    return;
  }

  if (forceVisible) {
    overlay.className = 'visible';
    return;
  }

  if (suppressOverlay) {
    overlay.className = 'hidden';
    return;
  }

  const locked = document.pointerLockElement === canvas;
  overlay.className = locked ? 'hidden' : 'visible';
}

function closeWaterInfoPanel({ skipOverlayReset = false } = {}) {
  if (waterInfoPanel && !waterInfoPanel.hidden) {
    waterInfoPanel.hidden = true;
    waterInfoPanel.setAttribute('aria-hidden', 'true');
  }

  suppressOverlay = false;

  if (!skipOverlayReset) {
    updateOverlayVisibility();
  }
}

function openWaterInfoPanel(cellX, cellZ, volume) {
  const depth = waterCellArea > 0 ? volume / waterCellArea : 0;
  terrainInfo.lastSelectedWaterCell = { x: cellX, z: cellZ, volume, depth };

  if (waterInfoCoordinates) {
    waterInfoCoordinates.textContent = `Coordenadas celda: x=${cellX} · z=${cellZ}`;
  }

  if (waterInfoVolume) {
    const liters = volume * 1000;
    waterInfoVolume.textContent = `Volumen estimado: ${volume.toFixed(3)} m³ (${liters.toFixed(1)} L)`;
  }

  if (waterInfoDepth) {
    waterInfoDepth.textContent = `Profundidad estimada: ${depth.toFixed(2)} m`;
  }

  suppressOverlay = true;
  updateOverlayVisibility();

  if (waterInfoPanel) {
    waterInfoPanel.hidden = false;
    waterInfoPanel.setAttribute('aria-hidden', 'false');
  }

  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  }

  if (waterInfoClose) {
    waterInfoClose.focus({ preventScroll: true });
  }
}

function resetMovementState() {
  movementState.forward = false;
  movementState.backward = false;
  movementState.left = false;
  movementState.right = false;
  movementState.up = false;
  movementState.down = false;
}

function intersectRayWithHorizontalPlane(origin, direction, planeY) {
  const epsilon = 1e-6;
  if (Math.abs(direction[1]) < epsilon) {
    return null;
  }

  const t = (planeY - origin[1]) / direction[1];
  if (t <= 0) {
    return null;
  }

  return add(origin, scale(direction, t));
}

function handleCanvasMouseDown(event) {
  if (event.button !== 0) {
    return;
  }

  if (document.pointerLockElement !== canvas) {
    return;
  }

  if (!waterVolumeData || !waterVolumeData.volumes) {
    return;
  }

  const rayOrigin = [...cameraPosition];
  const rayDirection = normalize(getForwardDirection());

  let hitPoint = intersectRayWithHorizontalPlane(rayOrigin, rayDirection, waterSurfaceLevel);
  if (!hitPoint) {
    hitPoint = intersectRayWithHorizontalPlane(rayOrigin, rayDirection, 0);
  }

  if (!hitPoint) {
    return;
  }

  const cell = worldToWaterCell(hitPoint[0], hitPoint[2]);
  if (!cell) {
    return;
  }

  const index = cell.cellZ * waterVolumeData.cellsPerSide + cell.cellX;
  const volume = waterVolumeData.volumes[index] ?? 0;
  openWaterInfoPanel(cell.cellX, cell.cellZ, volume);
  event.preventDefault();
}

function regenerateTerrain(seedString) {
  const { vertexData, minHeight, maxHeight, visibleVertices, heightField } =
    generateTerrainVertices(seedString);
  gl.bindBuffer(gl.ARRAY_BUFFER, baseplateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  baseplateVertexCount = vertexData.length / floatsPerVertex;
  terrainHeightField = heightField;
  waterVolumeData = generateWaterVolumeData(heightField);
  terrainInfo.lastSelectedWaterCell = null;
  if (waterInfoPanel && !waterInfoPanel.hidden) {
    closeWaterInfoPanel({ skipOverlayReset: true });
  }
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

function getForwardDirection() {
  return [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch),
  ];
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
  if (waterInfoPanel && !waterInfoPanel.hidden) {
    closeWaterInfoPanel();
  }
  suppressOverlay = false;
  updateOverlayVisibility();
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
}

canvas.addEventListener('click', requestCameraControl);
canvas.addEventListener('mousedown', handleCanvasMouseDown);

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

if (waterInfoClose) {
  waterInfoClose.addEventListener('click', () => {
    closeWaterInfoPanel();
  });
}

let pointerLockErrors = 0;
document.addEventListener('pointerlockerror', () => {
  pointerLockErrors += 1;
  suppressOverlay = false;
  updateOverlayVisibility(true);
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  if (locked) {
    suppressOverlay = false;
  } else {
    resetMovementState();
  }
  updateOverlayVisibility();
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
  if (event.code === 'Escape' && waterInfoPanel && !waterInfoPanel.hidden) {
    closeWaterInfoPanel();
    event.preventDefault();
    return;
  }
  const pointerLocked = document.pointerLockElement === canvas;
  if (!pointerLocked) {
    if (event.code === 'Enter') {
      requestCameraControl(event);
    }
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
    default:
      return;
  }
  event.preventDefault();
});

document.addEventListener('keyup', (event) => {
  if (isEditableElement(event.target)) {
    return;
  }
  if (document.pointerLockElement !== canvas) {
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

function update(deltaTime) {
  const forwardDirection = getForwardDirection();

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
    `Cámara: x=${cameraPosition[0].toFixed(2)} y=${cameraPosition[1].toFixed(2)} z=${cameraPosition[2].toFixed(2)}`,
    `Orientación: yaw=${((yaw * 180) / Math.PI).toFixed(1)}° pitch=${((pitch * 180) / Math.PI).toFixed(1)}°`,
    `Terreno seed: ${terrainInfo.seed}`,
    `Altura terreno: min=${terrainInfo.minHeight.toFixed(2)}m max=${terrainInfo.maxHeight.toFixed(2)}m`,
    `Terreno visible: ${visiblePercentage.toFixed(1)}% (${terrainInfo.visibleVertices}/${terrainInfo.vertexCount})`,
    `Movimiento activo: ${activeMovement || 'Ninguno'}`,
    `Draw calls: terreno=${baseplateVertexCount} bloques=${blockGridVertexCount} chunks=${chunkGridVertexCount}`,
    `GL error: ${lastGlError}`,
  ];

  if (terrainInfo.lastSelectedWaterCell) {
    const { x, z, volume, depth } = terrainInfo.lastSelectedWaterCell;
    info.push(
      `Celda agua: x=${x} z=${z} volumen=${volume.toFixed(3)}m³ profundidad=${depth.toFixed(2)}m`
    );
  } else {
    info.push('Celda agua: ninguna seleccionada');
  }

  if (pointerLockErrors > 0) {
    info.push(`Pointer lock errores: ${pointerLockErrors}`);
  }

  debugConsole.textContent = info.join('\n');
}

function loop(currentTime) {
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  update(deltaTime);
  render();
  updateDebugConsole(deltaTime);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
