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
const settingsDebugLog = document.getElementById('settings-debug-log');
const debugTerrainToggle = document.getElementById('debug-terrain-translucent');

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

const blockSize = 0.5; // metros virtuales
const blocksPerChunk = 8;
const chunksPerSide = 16;
const chunkSize = blockSize * blocksPerChunk;
const baseplateSize = chunkSize * chunksPerSide;

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
const terrainNoiseScale = 5.2;
const maxTerrainHeight = 20;
const minVisibleHeight = 0.001;
const falloffRadius = 1.05;
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

const rockBuffer = createBuffer(new Float32Array(0));

const blockGridVertexCount = blockGridVertices.length / floatsPerVertex;
const chunkGridVertexCount = chunkGridVertices.length / floatsPerVertex;
let rockVertexCount = 0;

let terrainHeightfield = null;
let terrainMaskfield = null;

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

function generateTerrainVertices(seedString) {
  const numericSeed = stringToSeed(seedString);
  const blocksPerSide = chunksPerSide * blocksPerChunk;
  const vertexFloatCount = blocksPerSide * blocksPerSide * 6 * floatsPerVertex;
  const vertexData = new Float32Array(vertexFloatCount);
  const heights = new Array(blocksPerSide + 1);
  const islandMask = new Array(blocksPerSide + 1);
  let minHeight = Infinity;
  let maxHeight = -Infinity;

  for (let z = 0; z <= blocksPerSide; z++) {
    heights[z] = new Array(blocksPerSide + 1);
    islandMask[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      const sampleX = (x / blocksPerSide) * terrainNoiseScale;
      const sampleZ = (z / blocksPerSide) * terrainNoiseScale;
      const baseNoise = fbm(sampleX, sampleZ, numericSeed);
      const duneNoise = fbm(sampleX * 2.3, sampleZ * 2.3, numericSeed ^ 0x27d4eb2d);

      const shapedBase = clamp01(baseNoise * 1.18 - 0.18);
      const dunePeaks = Math.pow(1 - Math.abs(duneNoise * 2 - 1), 2.4);

      const nx = x / blocksPerSide;
      const nz = z / blocksPerSide;
      const centeredX = nx * 2 - 1;
      const centeredZ = nz * 2 - 1;
      const radialDistance = Math.hypot(centeredX, centeredZ);
      const normalizedDistance = Math.min(1, radialDistance / falloffRadius);
      const falloff = Math.pow(normalizedDistance, falloffExponent);
      const mask = clamp01(1 - falloff);

      const combined = clamp01((shapedBase + dunePeaks * 0.45) * mask + mask * 0.08);
      const height = clamp01(combined) * maxTerrainHeight;

      heights[z][x] = height;
      islandMask[z][x] = mask;
      if (height < minHeight) minHeight = height;
      if (height > maxHeight) maxHeight = height;
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

  return {
    vertexData,
    minHeight,
    maxHeight,
    visibleVertices,
    heightfield: heights,
    maskfield: islandMask,
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
  return sampleFieldValue(terrainHeightfield, x, z, fallback);
}

function sampleTerrainMask(x, z) {
  const fallback = 0;
  return sampleFieldValue(terrainMaskfield, x, z, fallback);
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
  const { vertexData, minHeight, maxHeight, visibleVertices, heightfield, maskfield } =
    generateTerrainVertices(seedString);
  gl.bindBuffer(gl.ARRAY_BUFFER, baseplateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  baseplateVertexCount = vertexData.length / floatsPerVertex;
  terrainInfo.seed = seedString;
  terrainInfo.minHeight = Math.max(0, minHeight);
  terrainInfo.maxHeight = Math.min(maxTerrainHeight, maxHeight);
  terrainInfo.vertexCount = baseplateVertexCount;
  terrainInfo.visibleVertices = visibleVertices;
  terrainInfo.visibleVertexRatio = baseplateVertexCount
    ? visibleVertices / baseplateVertexCount
    : 0;
  terrainHeightfield = heightfield;
  terrainMaskfield = maskfield;
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
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let i = 0; i < 4; i++) {
        sum += a[i + row * 4] * b[col + i * 4];
      }
      result[col + row * 4] = sum;
    }
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

if (debugTerrainToggle) {
  debugTerrainToggle.addEventListener('change', (event) => {
    applyTranslucentTerrainSetting(event.target.checked);
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
    yaw -= event.movementX * pointerSensitivity;
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
  }

  if (rockVertexCount > 0) {
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, 1);
    }
    bindGeometry(rockBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, rockVertexCount);
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
    }
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
  if (!debugConsole && !settingsDebugLog) {
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
    `Ciclo día/noche: ${(dayNightCycleState.normalizedTime * 24).toFixed(1)}h (luz ${(dayNightCycleState.intensity * 100).toFixed(0)}%)`,
    `Ticks totales: ${totalTicks} (cuadro: ${ticksLastFrame})`,
    `Cámara: x=${cameraPosition[0].toFixed(2)} y=${cameraPosition[1].toFixed(2)} z=${cameraPosition[2].toFixed(2)}`,
    `Orientación: yaw=${((yaw * 180) / Math.PI).toFixed(1)}° pitch=${((pitch * 180) / Math.PI).toFixed(1)}°`,
    `Terreno seed: ${terrainInfo.seed}`,
    `Altura terreno: min=${terrainInfo.minHeight.toFixed(2)}m max=${terrainInfo.maxHeight.toFixed(2)}m`,
    `Terreno visible: ${visiblePercentage.toFixed(1)}% (${terrainInfo.visibleVertices}/${terrainInfo.vertexCount})`,
    `Rocas generadas: ${terrainInfo.rockCount}`,
    `Movimiento activo: ${activeMovement || 'Ninguno'}`,
    `Depuración: terreno translúcido ${terrainRenderState.translucent ? 'activado' : 'desactivado'}`,
    `Draw calls: terreno=${baseplateVertexCount} bloques=${blockGridVertexCount} chunks=${chunkGridVertexCount}`,
    `GL error: ${lastGlError}`,
  ];

  if (pointerLockErrors > 0) {
    info.push(`Pointer lock errores: ${pointerLockErrors}`);
  }

  const output = info.join('\n');

  if (debugConsole) {
    debugConsole.textContent = output;
  }
  if (settingsDebugLog) {
    settingsDebugLog.textContent = output;
  }
}

function loop(currentTime) {
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

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
