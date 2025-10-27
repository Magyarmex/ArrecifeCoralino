const canvas = document.getElementById('scene');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('start-button');
const debugConsole = document.getElementById('debug-console');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const seedInput = document.getElementById('seed-input');
const randomSeedButton = document.getElementById('random-seed');

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

const baseSandColor = [0.86, 0.79, 0.62];
const blockLineColor = [0.92, 0.88, 0.78];
const chunkLineColor = [0.7, 0.64, 0.52];
const terrainHeightScale = 2.4;
const terrainNoiseScale = 6;

const baseplateBuffer = createBuffer(new Float32Array(0));
let baseplateVertexCount = 0;

const blockGridVertices = createLineGrid(baseplateSize, blockSize, blockLineColor, 0.02);
const chunkGridVertices = createLineGrid(baseplateSize, chunkSize, chunkLineColor, 0.04);

const blockGridBuffer = createBuffer(blockGridVertices);
const chunkGridBuffer = createBuffer(chunkGridVertices);

const blockGridVertexCount = blockGridVertices.length / floatsPerVertex;
const chunkGridVertexCount = chunkGridVertices.length / floatsPerVertex;

const defaultSeed = 'coral-dunas';
let currentSeed = defaultSeed;
const terrainInfo = {
  seed: currentSeed,
  minHeight: 0,
  maxHeight: 0,
};

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

function pushVertex(buffer, offset, x, y, z, height) {
  const normalized = Math.max(-1, Math.min(1, height / terrainHeightScale));
  const brightness = normalized * 0.12;
  const color = [
    clamp01(baseSandColor[0] + brightness),
    clamp01(baseSandColor[1] + brightness * 0.9),
    clamp01(baseSandColor[2] + brightness * 0.6),
  ];

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
  const vertexCount = blocksPerSide * blocksPerSide * 6 * floatsPerVertex;
  const vertexData = new Float32Array(vertexCount);
  const heights = new Array(blocksPerSide + 1);
  let minHeight = Infinity;
  let maxHeight = -Infinity;

  for (let z = 0; z <= blocksPerSide; z++) {
    heights[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      const sampleX = (x / blocksPerSide) * terrainNoiseScale;
      const sampleZ = (z / blocksPerSide) * terrainNoiseScale;
      const noiseValue = fbm(sampleX, sampleZ, numericSeed);
      const height = (noiseValue - 0.5) * 2 * terrainHeightScale;
      heights[z][x] = height;
      if (height < minHeight) minHeight = height;
      if (height > maxHeight) maxHeight = height;
    }
  }

  let offset = 0;
  const half = baseplateSize / 2;
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

      offset = pushVertex(vertexData, offset, x0, h00, z0, h00);
      offset = pushVertex(vertexData, offset, x1, h10, z0, h10);
      offset = pushVertex(vertexData, offset, x1, h11, z1, h11);

      offset = pushVertex(vertexData, offset, x0, h00, z0, h00);
      offset = pushVertex(vertexData, offset, x1, h11, z1, h11);
      offset = pushVertex(vertexData, offset, x0, h01, z1, h01);
    }
  }

  return { vertexData, minHeight, maxHeight };
}

function regenerateTerrain(seedString) {
  const { vertexData, minHeight, maxHeight } = generateTerrainVertices(seedString);
  gl.bindBuffer(gl.ARRAY_BUFFER, baseplateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  baseplateVertexCount = vertexData.length / floatsPerVertex;
  terrainInfo.seed = seedString;
  terrainInfo.minHeight = minHeight;
  terrainInfo.maxHeight = maxHeight;
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

  const info = [
    `Estado: ${pointerLocked ? 'Explorando' : 'En espera'}`,
    `FPS: ${displayedFps ? displayedFps.toFixed(1) : '---'}`,
    `Cámara: x=${cameraPosition[0].toFixed(2)} y=${cameraPosition[1].toFixed(2)} z=${cameraPosition[2].toFixed(2)}`,
    `Orientación: yaw=${((yaw * 180) / Math.PI).toFixed(1)}° pitch=${((pitch * 180) / Math.PI).toFixed(1)}°`,
    `Terreno seed: ${terrainInfo.seed}`,
    `Altura terreno: min=${terrainInfo.minHeight.toFixed(2)} max=${terrainInfo.maxHeight.toFixed(2)}`,
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
