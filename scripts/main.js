const canvas = document.getElementById('scene');
const overlay = document.getElementById('overlay');

const gl = canvas.getContext('webgl', { antialias: true });
if (!gl) {
  overlay.innerHTML =
    '<h1>WebGL no disponible</h1><p>Tu navegador no soporta WebGL.</p>';
  throw new Error('WebGL no soportado');
}

gl.clearColor(0.04, 0.06, 0.09, 1);
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
  uniform mat4 viewProjection;
  varying float vDepth;
  void main() {
    vec4 worldPosition = vec4(position, 1.0);
    gl_Position = viewProjection * worldPosition;
    vDepth = position.y;
  }
`;

const fragmentSource = `
  precision mediump float;
  varying float vDepth;
  void main() {
    vec3 baseColor = mix(vec3(0.18, 0.4, 0.6), vec3(0.08, 0.16, 0.24), clamp(-vDepth * 0.02, 0.0, 1.0));
    gl_FragColor = vec4(baseColor, 1.0);
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
const viewProjectionUniform = gl.getUniformLocation(program, 'viewProjection');

const gridSize = 200;
const gridDivisions = 50;

function createGridBuffer(size, divisions) {
  const half = size / 2;
  const step = size / divisions;
  const vertices = [];
  for (let i = 0; i <= divisions; i++) {
    const position = -half + i * step;
    // Línea paralela al eje Z
    vertices.push(position, 0, -half);
    vertices.push(position, 0, half);
    // Línea paralela al eje X
    vertices.push(-half, 0, position);
    vertices.push(half, 0, position);
  }
  return new Float32Array(vertices);
}

const gridVertices = createGridBuffer(gridSize, gridDivisions);
const gridBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
gl.bufferData(gl.ARRAY_BUFFER, gridVertices, gl.STATIC_DRAW);

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
let pitch = 0;
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

canvas.addEventListener('click', () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
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

function update(deltaTime) {
  const forwardDirection = [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch),
  ];

  const flatForward = normalize([Math.sin(yaw), 0, -Math.cos(yaw)]);
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

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
  gl.enableVertexAttribArray(positionAttribute);
  gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

  const vertexCount = gridVertices.length / 3;
  gl.drawArrays(gl.LINES, 0, vertexCount);
}

function loop(currentTime) {
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  update(deltaTime);
  render();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
