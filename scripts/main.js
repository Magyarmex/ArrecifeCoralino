const canvas = document.getElementById('scene');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('start-button');
const debugConsole = document.getElementById('debug-console');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const seedInput = document.getElementById('seed-input');
const randomSeedButton = document.getElementById('random-seed');
const seeThroughToggle = document.getElementById('see-through-toggle');
const selectionInfoPanel = document.getElementById('selection-info');
const selectionCloseButton = document.getElementById('selection-close');
const selectionBlockField = document.getElementById('selection-info-block');
const selectionChunkField = document.getElementById('selection-info-chunk');
const selectionWorldField = document.getElementById('selection-info-world');
const selectionHeightField = document.getElementById('selection-info-height');
const selectionWaterField = document.getElementById('selection-info-water');
const selectionDepthField = document.getElementById('selection-info-depth');

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
  uniform float opacity;
  void main() {
    gl_FragColor = vec4(vColor, opacity);
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
const opacityUniform = gl.getUniformLocation(program, 'opacity');

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
const selectionHighlightColor = [0.32, 0.78, 0.94];

const baseplateBuffer = createBuffer(new Float32Array(0));
let baseplateVertexCount = 0;

const blockGridBuffer = createBuffer(new Float32Array(0));
const chunkGridBuffer = createBuffer(new Float32Array(0));
const selectionHighlightBuffer = createBuffer(new Float32Array(0));

let blockGridVertexCount = 0;
let chunkGridVertexCount = 0;
let selectionHighlightVertexCount = 0;

const defaultSeed = 'coral-dunas';
let currentSeed = defaultSeed;
const terrainInfo = {
  seed: currentSeed,
  minHeight: 0,
  maxHeight: 0,
  vertexCount: 0,
  visibleVertices: 0,
  visibleVertexRatio: 0,
  featureStats: {
    canyon: 0,
    ravine: 0,
    cliffs: 0,
  },
};

let terrainHeightField = null;
let seeThroughTerrain = false;
let selectedBlock = null;
let inverseViewProjectionMatrix = null;

const defaultTerrainOpacity = 1;
const seeThroughTerrainOpacity = 0.45;

if (typeof window !== 'undefined') {
  window.__terrainInfo = terrainInfo;
  window.__selectedSquare = null;
  window.__selectBlockAt = (x, y) => selectBlockAtScreen(x, y);
  window.__clearSelection = () => clearSelection();
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

  terrainInfo.featureStats = {
    canyon: sampleCount ? canyonTotal / sampleCount : 0,
    ravine: sampleCount ? ravineTotal / sampleCount : 0,
    cliffs: sampleCount ? cliffTotal / sampleCount : 0,
  };

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
  refreshSelectionAfterTerrain();
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

  for (let col = 0; col < 4; col += 1) {
    const b0 = b[col * 4 + 0];
    const b1 = b[col * 4 + 1];
    const b2 = b[col * 4 + 2];
    const b3 = b[col * 4 + 3];

    result[col * 4 + 0] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    result[col * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    result[col * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    result[col * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
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
  if (event) {
    event.preventDefault();
  }
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
}

canvas.addEventListener('click', requestCameraControl);
canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) {
    return;
  }
  const pointer = getPointerPosition(event);
  selectBlockAtScreen(pointer.x, pointer.y);
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

if (seeThroughToggle) {
  seeThroughToggle.checked = seeThroughTerrain;
  seeThroughToggle.addEventListener('change', (event) => {
    seeThroughTerrain = event.target.checked;
  });
}

if (selectionCloseButton) {
  selectionCloseButton.addEventListener('click', () => {
    clearSelection();
  });
}

let pointerLockErrors = 0;
document.addEventListener('pointerlockerror', () => {
  pointerLockErrors += 1;
  overlay.className = 'visible';
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  overlay.className = locked ? 'hidden' : 'visible';
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
  if (typeof gl.enable === 'function') {
    gl.enable(gl.DEPTH_TEST);
  }

  if (opacityUniform && typeof gl.uniform1f === 'function') {
    const opacity = seeThroughTerrain ? seeThroughTerrainOpacity : defaultTerrainOpacity;
    gl.uniform1f(opacityUniform, opacity);
  }

  if (seeThroughTerrain) {
    if (typeof gl.enable === 'function') {
      gl.enable(gl.BLEND);
    }
    if (typeof gl.blendFunc === 'function') {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
  } else if (typeof gl.disable === 'function') {
    gl.disable(gl.BLEND);
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (baseplateVertexCount > 0) {
    bindGeometry(baseplateBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, baseplateVertexCount);
  }

  const forceGridVisible = seeThroughTerrain;

  if (blockGridVertexCount > 0 || chunkGridVertexCount > 0) {
    if (forceGridVisible && typeof gl.disable === 'function') {
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

    if (forceGridVisible && typeof gl.enable === 'function') {
      gl.enable(gl.DEPTH_TEST);
    }
  }

  if (selectionHighlightVertexCount > 0) {
    if (typeof gl.disable === 'function') {
      gl.disable(gl.DEPTH_TEST);
    }
    bindGeometry(selectionHighlightBuffer);
    gl.drawArrays(gl.LINES, 0, selectionHighlightVertexCount);
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
    `Cámara: x=${cameraPosition[0].toFixed(2)} y=${cameraPosition[1].toFixed(2)} z=${cameraPosition[2].toFixed(2)}`,
    `Orientación: yaw=${((yaw * 180) / Math.PI).toFixed(1)}° pitch=${((pitch * 180) / Math.PI).toFixed(1)}°`,
    `Terreno seed: ${terrainInfo.seed}`,
    `Terreno translúcido: ${seeThroughTerrain ? 'Sí' : 'No'}`,
    `Altura terreno: min=${terrainInfo.minHeight.toFixed(2)}m max=${terrainInfo.maxHeight.toFixed(2)}m`,
    `Terreno visible: ${visiblePercentage.toFixed(1)}% (${terrainInfo.visibleVertices}/${terrainInfo.vertexCount})`,
    `Formaciones: cañones=${formatFeaturePercent(featureStats.canyon)}% ravinas=${formatFeaturePercent(
      featureStats.ravine
    )}% acantilados=${formatFeaturePercent(featureStats.cliffs)}%`,
    `Selección: ${selectionStatus}`,
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

  update(deltaTime);
  render();
  updateDebugConsole(deltaTime);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
