var ARRECIFE_BOOT_TARGET =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : {};

var ARRECIFE_MODULE_STATE =
  ARRECIFE_BOOT_TARGET.__ARRECIFE_MAIN_MODULE__ ||
  (ARRECIFE_BOOT_TARGET.__ARRECIFE_MAIN_MODULE__ = {
    attempts: 0,
    duplicates: 0,
    lastAttempt: 0,
    lastDuplicate: 0,
    lastError: null,
    active: false,
    initialized: false,
    lastSuccess: 0,
    failedAttempts: 0,
  });

ARRECIFE_MODULE_STATE.attempts =
  Math.max(0, ARRECIFE_MODULE_STATE.attempts || 0) + 1;
ARRECIFE_MODULE_STATE.lastAttempt = Date.now();

if (ARRECIFE_MODULE_STATE.initialized || ARRECIFE_MODULE_STATE.active) {
  ARRECIFE_MODULE_STATE.duplicates = Math.max(
    0,
    (ARRECIFE_MODULE_STATE.duplicates || 0) + 1,
  );
  ARRECIFE_MODULE_STATE.lastDuplicate = ARRECIFE_MODULE_STATE.lastAttempt;
  var duplicateRuntimeState = ARRECIFE_BOOT_TARGET.__ARRECIFE_RUNTIME_STATE__;
  if (duplicateRuntimeState && typeof duplicateRuntimeState === 'object') {
    var duplicateIssues = Array.isArray(duplicateRuntimeState.issues)
      ? duplicateRuntimeState.issues
      : (duplicateRuntimeState.issues = []);
    duplicateRuntimeState.bootstrapGuards = Math.max(
      0,
      (duplicateRuntimeState.bootstrapGuards || 0) + 1,
    );
    duplicateRuntimeState.lastBootstrapGuard =
      ARRECIFE_MODULE_STATE.lastDuplicate;
    var duplicateDiagnostics =
      duplicateRuntimeState.moduleDiagnostics &&
      typeof duplicateRuntimeState.moduleDiagnostics === 'object'
        ? duplicateRuntimeState.moduleDiagnostics
        : (duplicateRuntimeState.moduleDiagnostics = {});
    duplicateDiagnostics.bootstrap = {
      attempts: ARRECIFE_MODULE_STATE.attempts,
      duplicates: ARRECIFE_MODULE_STATE.duplicates,
      lastAttempt: ARRECIFE_MODULE_STATE.lastAttempt,
      lastDuplicate: ARRECIFE_MODULE_STATE.lastDuplicate,
      lastSuccess: ARRECIFE_MODULE_STATE.lastSuccess,
      failedAttempts: ARRECIFE_MODULE_STATE.failedAttempts,
      lastError: ARRECIFE_MODULE_STATE.lastError,
      active: ARRECIFE_MODULE_STATE.active,
      skipped: true,
    };
    duplicateIssues.push({
      severity: 'fatal',
      context: 'bootstrap',
      error:
        'Se detectó una carga duplicada de "scripts/main.js" y se omitió para evitar conflictos de constantes.',
      timestamp: ARRECIFE_MODULE_STATE.lastDuplicate,
      code: 'duplicate-module-bootstrap',
    });
    while (duplicateIssues.length > 8) {
      duplicateIssues.shift();
    }
  }
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('[Arrecife] scripts/main.js ignorado por carga duplicada.', {
      attempts: ARRECIFE_MODULE_STATE.attempts,
      duplicates: ARRECIFE_MODULE_STATE.duplicates,
      lastDuplicate: ARRECIFE_MODULE_STATE.lastDuplicate,
      lastSuccess: ARRECIFE_MODULE_STATE.lastSuccess,
    });
  }
} else {
  ARRECIFE_MODULE_STATE.active = true;
  try {
    ((runtimeGlobalCandidate, moduleState) => {
  const runtimeGlobal =
    runtimeGlobalCandidate && typeof runtimeGlobalCandidate === 'object'
      ? runtimeGlobalCandidate
      : {};

  const runtimeState =
    runtimeGlobal.__ARRECIFE_RUNTIME_STATE__ &&
    typeof runtimeGlobal.__ARRECIFE_RUNTIME_STATE__ === 'object'
      ? runtimeGlobal.__ARRECIFE_RUNTIME_STATE__
      : (runtimeGlobal.__ARRECIFE_RUNTIME_STATE__ = {
          bootstrapAttempts: 0,
          issues: [],
          fallbackFactories: null,
          reportedFallbacks: null,
          uiFallbackEvents: null,
        });

  runtimeState.bootstrapGuards = Math.max(0, runtimeState.bootstrapGuards ?? 0);

  moduleState = moduleState || {};
  moduleState.runtimeStateRef = runtimeState;
  moduleState.lastRuntimeSync = Date.now();
  moduleState.runtimeIssuesSnapshot = Array.isArray(runtimeState.issues)
    ? runtimeState.issues.slice(-4)
    : [];

  const moduleDiagnostics =
    runtimeState.moduleDiagnostics && typeof runtimeState.moduleDiagnostics === 'object'
      ? runtimeState.moduleDiagnostics
      : (runtimeState.moduleDiagnostics = {});

  moduleDiagnostics.bootstrap = {
    attempts: moduleState.attempts,
    duplicates: moduleState.duplicates,
    lastAttempt: moduleState.lastAttempt,
    lastDuplicate: moduleState.lastDuplicate,
    lastSuccess: moduleState.lastSuccess,
    failedAttempts: moduleState.failedAttempts,
    lastError: moduleState.lastError,
    active: moduleState.active,
    skipped: false,
  };

  if (runtimeGlobal.__ARRECIFE_MAIN_INITIALIZED__) {
    runtimeState.bootstrapGuards += 1;
    runtimeState.lastBootstrapGuard = Date.now();
    const issues = Array.isArray(runtimeState.issues)
      ? runtimeState.issues
      : (runtimeState.issues = []);
    issues.push({
      severity: 'fatal',
      context: 'bootstrap',
      error:
        'Se bloqueó una inicialización duplicada de "scripts/main.js" para evitar conflictos de constantes.',
      timestamp: runtimeState.lastBootstrapGuard,
      code: 'duplicate-bootstrap',
    });
    while (issues.length > 8) {
      issues.shift();
    }
    runtimeGlobal.__ARRECIFE_DUPLICATE_BOOTSTRAP__ = true;
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn('[Arrecife] Inicialización duplicada bloqueada.', issues[issues.length - 1]);
    }
    return;
  }

  runtimeGlobal.__ARRECIFE_MAIN_INITIALIZED__ = true;
  runtimeGlobal.__ARRECIFE_DUPLICATE_BOOTSTRAP__ = false;
  runtimeState.lastBootstrapTime = Date.now();
  moduleState.lastBootstrapTime = runtimeState.lastBootstrapTime;
  if (moduleDiagnostics.bootstrap) {
    moduleDiagnostics.bootstrap.lastBootstrapTime =
      runtimeState.lastBootstrapTime;
  }

  let canvas = document.getElementById('scene');
  const overlay = document.getElementById('overlay');
  const simulationHud = document.getElementById('simulation-hud');
  const startButton = document.getElementById('start-button');
  let debugConsole = document.getElementById('debug-console');
  let debugPanel = document.getElementById('debug-panel');
  let debugToggleButton = document.getElementById('debug-toggle');
  const cameraNearDisplay = document.getElementById('camera-near-display');
  const cameraFarDisplay = document.getElementById('camera-far-display');
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
  const musicToggle = document.getElementById('audio-music-toggle');

  let debugConsoleHeartbeatId = null;
  const DEBUG_PANEL_HEARTBEAT_MS = 1000;

function createFallbackDebugPanel() {
  const supportsDom =
    typeof document?.createElement === 'function' && typeof document?.body === 'object';

  if (!supportsDom) {
    const fallbackClassList = { toggle: () => {} };
    const panel = {
      id: 'debug-panel',
      classList: fallbackClassList,
      appendChild: () => {},
    };
    const toggle = {
      setAttribute: () => {},
      addEventListener: () => {},
      append: () => {},
    };
    const consoleElement = {
      hidden: true,
      textContent: '',
      scrollTop: 0,
      scrollHeight: 0,
      setAttribute: () => {},
    };
    return { panel, toggle, console: consoleElement };
  }

  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.className = 'debug-panel';
  if (panel.dataset) {
    panel.dataset.uiElement = panel.dataset.uiElement || 'debug-panel';
  }

  const toggle = document.createElement('button');
  toggle.id = 'debug-toggle';
  toggle.type = 'button';
  toggle.className = 'debug-toggle';
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-controls', 'debug-console');
  toggle.setAttribute('title', 'Panel de depuración');

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'debug-toggle__label';
  toggleLabel.textContent = 'Panel de depuración';

  if (typeof toggle.append === 'function') {
    toggle.append('🐞', toggleLabel);
  } else {
    toggle.appendChild(document.createTextNode('🐞'));
    toggle.appendChild(toggleLabel);
  }

  const consoleElement = document.createElement('pre');
  consoleElement.id = 'debug-console';
  consoleElement.className = 'debug-console';
  consoleElement.hidden = true;
  consoleElement.setAttribute('aria-live', 'polite');
  consoleElement.setAttribute('aria-hidden', 'true');
  if (consoleElement.dataset) {
    consoleElement.dataset.uiElement = consoleElement.dataset.uiElement || 'debug-console';
  }

  panel.appendChild(toggle);
  panel.appendChild(consoleElement);

  try {
    document.body.appendChild(panel);
  } catch (error) {
    void error;
  }

  return { panel, toggle, console: consoleElement };
}

function ensureDebugPanelHeartbeat() {
  if (debugConsoleHeartbeatId !== null) {
    return;
  }
  const scheduleInterval =
    typeof window !== 'undefined' && typeof window.setInterval === 'function'
      ? window.setInterval.bind(window)
      : typeof setInterval === 'function'
      ? setInterval
      : null;
  if (!scheduleInterval) {
    return;
  }
  debugConsoleHeartbeatId = scheduleInterval(() => {
    debugConsoleDiagnostics.lastHeartbeatTime = Date.now();
    try {
      updateDebugConsole(0);
    } catch (error) {
      debugConsoleDiagnostics.heartbeatFailures = Math.max(
        0,
        (debugConsoleDiagnostics.heartbeatFailures ?? 0) + 1,
      );
      debugConsoleDiagnostics.lastError = String(
        error && error.message ? error.message : error ?? 'Error desconocido',
      );
      console.error('Error al actualizar el panel de depuración (latido)', error);
    }
  }, DEBUG_PANEL_HEARTBEAT_MS);
}

runtimeState.bootstrapAttempts = Math.max(0, runtimeState.bootstrapAttempts ?? 0) + 1;
runtimeState.totalBootstraps = Math.max(0, runtimeState.totalBootstraps ?? 0) + 1;

const runtimeIssues = Array.isArray(runtimeState.issues)
  ? runtimeState.issues
  : (runtimeState.issues = []);
const MAX_RUNTIME_ISSUES = 8;

const debugConsoleDiagnostics =
  runtimeState.debugConsoleDiagnostics && typeof runtimeState.debugConsoleDiagnostics === 'object'
    ? runtimeState.debugConsoleDiagnostics
    : (runtimeState.debugConsoleDiagnostics = {
        updates: 0,
        lastUpdateTime: 0,
        lastDeltaTime: 0,
        lastError: null,
        heartbeatFailures: 0,
        lastHeartbeatTime: 0,
      });

runtimeGlobal.__ARRECIFE_DEBUG_CONSOLE__ = debugConsoleDiagnostics;

const cameraDisplayDiagnostics =
  runtimeState.cameraDisplayDiagnostics && typeof runtimeState.cameraDisplayDiagnostics === 'object'
    ? runtimeState.cameraDisplayDiagnostics
    : (runtimeState.cameraDisplayDiagnostics = {
        updates: 0,
        lastUpdateTime: 0,
        missingElements: 0,
        lastMissingTimestamp: null,
      });

const simulationInfoDiagnostics =
  runtimeState.simulationInfoDiagnostics && typeof runtimeState.simulationInfoDiagnostics === 'object'
    ? runtimeState.simulationInfoDiagnostics
    : (runtimeState.simulationInfoDiagnostics = {
        cameraRepairs: 0,
        clipRepairs: 0,
        clipFlagRepairs: 0,
        clipOverrideRepairs: 0,
        lastRepairTime: 0,
        reportedCameraRepair: false,
        reportedClipRepair: false,
        reportedFlagRepair: false,
        reportedOverrideRepair: false,
      });

runtimeGlobal.__ARRECIFE_CAMERA_DISPLAY__ = cameraDisplayDiagnostics;
runtimeGlobal.__ARRECIFE_SIMULATION_INFO_DIAGNOSTICS__ = simulationInfoDiagnostics;

const pendingRuntimeIssueQueue = Array.isArray(runtimeState.pendingIssues)
  ? runtimeState.pendingIssues
  : (runtimeState.pendingIssues = []);

const MAX_UI_FALLBACK_EVENTS = 12;
const modelLibrary = Array.isArray(runtimeGlobal.modelLibrary)
  ? runtimeGlobal.modelLibrary
  : [];
const reportedFallbacks =
  runtimeState.reportedFallbacks && typeof runtimeState.reportedFallbacks === 'object'
    ? runtimeState.reportedFallbacks
    : (runtimeState.reportedFallbacks = {});
const uiFallbackEvents = Array.isArray(runtimeState.uiFallbackEvents)
  ? runtimeState.uiFallbackEvents
  : (runtimeState.uiFallbackEvents = []);

let volumetricEngine = null;

const AMBIENT_MUSIC_TRACK_URL = 'aquatic-downtime-363761.mp3';

const ambientAudioState = {
  supported:
    typeof window !== 'undefined' &&
    (typeof window.AudioContext === 'function' ||
      typeof window.webkitAudioContext === 'function'),
  context: null,
  gain: null,
  mixGain: null,
  environmentFilter: null,
  sources: [],
  initialized: false,
  enabled: Boolean(musicToggle?.checked),
  defaultGain: 0.32,
  reportedInitFailure: false,
  music: {
    buffer: null,
    source: null,
    gain: null,
    colorFilter: null,
    loadPromise: null,
  },
  wind: {
    buffer: null,
    source: null,
    gain: null,
    filter: null,
  },
  diagnostics: {
    musicTrack: AMBIENT_MUSIC_TRACK_URL,
    musicStatus: 'inactivo',
    musicLoadTimeMs: null,
    underwater: false,
    filterFrequency: 0,
    windLevel: 0,
    windTarget: 0,
    lastUpdate: 0,
    issues: 0,
    lastError: null,
    transitions: 0,
    pendingGesture: false,
    lastResumeAttempt: null,
  },
  flags: {
    musicLoadFailed: false,
  },
  underwater: false,
};

const DEFAULT_CAMERA_NEAR_PLANE = 0.1;
const DEFAULT_CAMERA_FAR_PLANE = 500;

const CAMERA_BASE_NEAR_PLANE =
  Number.isFinite(runtimeGlobal.CAMERA_BASE_NEAR_PLANE) && runtimeGlobal.CAMERA_BASE_NEAR_PLANE > 0
    ? runtimeGlobal.CAMERA_BASE_NEAR_PLANE
    : DEFAULT_CAMERA_NEAR_PLANE;
const CAMERA_BASE_FAR_PLANE =
  Number.isFinite(runtimeGlobal.CAMERA_BASE_FAR_PLANE) && runtimeGlobal.CAMERA_BASE_FAR_PLANE > CAMERA_BASE_NEAR_PLANE
    ? runtimeGlobal.CAMERA_BASE_FAR_PLANE
    : DEFAULT_CAMERA_FAR_PLANE;

const CAMERA_NEAR_PLANE =
  Number.isFinite(runtimeGlobal.CAMERA_NEAR_PLANE) && runtimeGlobal.CAMERA_NEAR_PLANE > 0
    ? runtimeGlobal.CAMERA_NEAR_PLANE
    : CAMERA_BASE_NEAR_PLANE;
const CAMERA_FAR_PLANE =
  Number.isFinite(runtimeGlobal.CAMERA_FAR_PLANE) && runtimeGlobal.CAMERA_FAR_PLANE > CAMERA_NEAR_PLANE
    ? runtimeGlobal.CAMERA_FAR_PLANE
    : CAMERA_BASE_FAR_PLANE;

runtimeGlobal.CAMERA_BASE_NEAR_PLANE = CAMERA_BASE_NEAR_PLANE;
runtimeGlobal.CAMERA_BASE_FAR_PLANE = CAMERA_BASE_FAR_PLANE;
runtimeGlobal.CAMERA_NEAR_PLANE = CAMERA_NEAR_PLANE;
runtimeGlobal.CAMERA_FAR_PLANE = CAMERA_FAR_PLANE;

const MIN_CAMERA_STAR_MARGIN = 40;
const DEFAULT_CAMERA_STAR_MARGIN = 120;
const CAMERA_STAR_MARGIN =
  Number.isFinite(runtimeGlobal.CAMERA_STAR_MARGIN) &&
  runtimeGlobal.CAMERA_STAR_MARGIN >= MIN_CAMERA_STAR_MARGIN
    ? runtimeGlobal.CAMERA_STAR_MARGIN
    : DEFAULT_CAMERA_STAR_MARGIN;

runtimeGlobal.CAMERA_STAR_MARGIN = CAMERA_STAR_MARGIN;

const cameraClipPlanes =
  runtimeState.cameraClipPlanes && typeof runtimeState.cameraClipPlanes === 'object'
    ? runtimeState.cameraClipPlanes
    : (runtimeState.cameraClipPlanes = {
        near: CAMERA_NEAR_PLANE,
        far: CAMERA_FAR_PLANE,
        baseNear: CAMERA_BASE_NEAR_PLANE,
        baseFar: CAMERA_BASE_FAR_PLANE,
        lastUpdated: 0,
        deviation: 0,
      });

cameraClipPlanes.near = CAMERA_NEAR_PLANE;
cameraClipPlanes.far = CAMERA_FAR_PLANE;
cameraClipPlanes.baseNear = CAMERA_BASE_NEAR_PLANE;
cameraClipPlanes.baseFar = CAMERA_BASE_FAR_PLANE;
cameraClipPlanes.deviation = Math.max(
  Math.abs(CAMERA_NEAR_PLANE - CAMERA_BASE_NEAR_PLANE),
  Math.abs(CAMERA_FAR_PLANE - CAMERA_BASE_FAR_PLANE),
);
cameraClipPlanes.overrideActive = cameraClipPlanes.deviation > 0.0001;
cameraClipPlanes.invalidOrdering = CAMERA_FAR_PLANE <= CAMERA_NEAR_PLANE;
cameraClipPlanes.lastUpdated =
  typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
cameraClipPlanes.overrides = Math.max(0, (cameraClipPlanes.overrides ?? 0) + (cameraClipPlanes.overrideActive ? 1 : 0));
cameraClipPlanes.lastOverrideTimestamp = cameraClipPlanes.overrideActive
  ? Date.now()
  : cameraClipPlanes.lastOverrideTimestamp ?? null;

runtimeGlobal.__ARRECIFE_CAMERA_CLIP__ = cameraClipPlanes;

const cameraDiagnostics =
  runtimeState.cameraDiagnostics && typeof runtimeState.cameraDiagnostics === 'object'
    ? runtimeState.cameraDiagnostics
    : (runtimeState.cameraDiagnostics = {
        overrides: 0,
        lastOverrideTimestamp: null,
        lastDeviation: 0,
        flags: { overrideActive: false, invalidOrdering: false },
      });

cameraDiagnostics.baseNear = CAMERA_BASE_NEAR_PLANE;
cameraDiagnostics.baseFar = CAMERA_BASE_FAR_PLANE;
cameraDiagnostics.currentNear = CAMERA_NEAR_PLANE;
cameraDiagnostics.currentFar = CAMERA_FAR_PLANE;
cameraDiagnostics.near = cameraDiagnostics.near ?? CAMERA_NEAR_PLANE;
cameraDiagnostics.far = cameraDiagnostics.far ?? CAMERA_FAR_PLANE;
cameraDiagnostics.lastDeviation = cameraClipPlanes.deviation;
cameraDiagnostics.flags = {
  overrideActive: cameraClipPlanes.overrideActive,
  invalidOrdering: cameraClipPlanes.invalidOrdering,
};
cameraDiagnostics.overrides = Math.max(0, cameraClipPlanes.overrides ?? 0);
cameraDiagnostics.lastOverrideTimestamp = cameraClipPlanes.lastOverrideTimestamp ?? null;
if (!cameraDiagnostics.metrics || typeof cameraDiagnostics.metrics !== 'object') {
  cameraDiagnostics.metrics = {
    starFarthest: 0,
    starShortfall: 0,
    marginEstimate: CAMERA_STAR_MARGIN,
    lastUpdateTime: 0,
    failedUpdates: 0,
  };
} else {
  cameraDiagnostics.metrics.starFarthest = cameraDiagnostics.metrics.starFarthest ?? 0;
  cameraDiagnostics.metrics.starShortfall = cameraDiagnostics.metrics.starShortfall ?? 0;
  cameraDiagnostics.metrics.marginEstimate = cameraDiagnostics.metrics.marginEstimate ?? CAMERA_STAR_MARGIN;
  cameraDiagnostics.metrics.lastUpdateTime = cameraDiagnostics.metrics.lastUpdateTime ?? 0;
  cameraDiagnostics.metrics.failedUpdates = cameraDiagnostics.metrics.failedUpdates ?? 0;
}
cameraDiagnostics.adjustments = Number.isFinite(cameraDiagnostics.adjustments)
  ? cameraDiagnostics.adjustments
  : 0;
cameraDiagnostics.starMargin = Number.isFinite(cameraDiagnostics.starMargin)
  ? cameraDiagnostics.starMargin
  : CAMERA_STAR_MARGIN;
cameraDiagnostics.flags = {
  ...cameraDiagnostics.flags,
  frustumClipping: Boolean(cameraDiagnostics.flags?.frustumClipping),
  baseFrustumExceeded: Boolean(cameraDiagnostics.flags?.baseFrustumExceeded),
};

if (cameraDiagnostics.flags.invalidOrdering) {
  pendingRuntimeIssueQueue.push({
    severity: 'fatal',
    context: 'camera',
    error: 'Configuración inválida de planos de recorte: el plano lejano es menor o igual al plano cercano.',
    timestamp: new Date().toISOString(),
  });
}

runtimeGlobal.__ARRECIFE_CAMERA_DIAGNOSTICS__ = cameraDiagnostics;

function snapshotCameraClipDiagnostics() {
  return {
    baseNear: CAMERA_BASE_NEAR_PLANE,
    baseFar: CAMERA_BASE_FAR_PLANE,
    near: CAMERA_NEAR_PLANE,
    far: CAMERA_FAR_PLANE,
    deviation: cameraDiagnostics.lastDeviation ?? 0,
    overrideActive: Boolean(cameraDiagnostics.flags?.overrideActive),
    invalidOrdering: Boolean(cameraDiagnostics.flags?.invalidOrdering),
    overrides: Math.max(0, cameraDiagnostics.overrides ?? 0),
    lastOverrideTimestamp: cameraDiagnostics.lastOverrideTimestamp ?? null,
  };
}

function ensureAmbientAudioContext() {
  if (!ambientAudioState.supported) {
    return null;
  }

  if (ambientAudioState.context) {
    return ambientAudioState.context;
  }

  const AudioContextClass =
    typeof window !== 'undefined'
      ? window.AudioContext || window.webkitAudioContext
      : null;

  if (!AudioContextClass) {
    ambientAudioState.supported = false;
    return null;
  }

  try {
    ambientAudioState.context = new AudioContextClass();
  } catch (error) {
    if (!ambientAudioState.reportedInitFailure) {
      ambientAudioState.reportedInitFailure = true;
      const message =
        'No se pudo inicializar el audio ambiental. ' +
        String(error && error.message ? error.message : error ?? 'Error desconocido');
      pendingRuntimeIssueQueue.push({
        severity: 'warning',
        context: 'audio',
        error: message,
      });
    }
    ambientAudioState.supported = false;
    return null;
  }

  return ambientAudioState.context;
}


function ensureAmbientMusicNodes() {
  const context = ambientAudioState.context;
  if (!context) {
    return null;
  }
  if (ambientAudioState.initialized && ambientAudioState.gain) {
    ensureAmbientMusicPlayback();
    ensureWindSource();
    return ambientAudioState.gain;
  }

  function noteNameToFrequency(note) {
    if (!note) {
      return null;
    }
    const match = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(String(note));
    if (!match) {
      return null;
    }
    const [, baseLetter, accidental, octaveString] = match;
    const baseOffsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const semitone = baseOffsets[baseLetter.toUpperCase()];
    if (typeof semitone !== 'number') {
      return null;
    }
    let offset = semitone;
    if (accidental === '#') {
      offset += 1;
    } else if (accidental === 'b' || accidental === '♭') {
      offset -= 1;
    }
    const octave = Number.parseInt(octaveString, 10);
    if (!Number.isFinite(octave)) {
      return null;
    }
    const midiNumber = offset + (octave + 1) * 12;
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  }

  function buildPatternSegments(pattern) {
    const segments = [];
    let beatCursor = 0;
    for (const step of pattern) {
      if (!step) {
        continue;
      }
      const beats = typeof step.beats === 'number' && step.beats > 0 ? step.beats : 0.25;
      const startBeat = beatCursor;
      const endBeat = startBeat + beats;
      const isRest = step.note === null || step.note === undefined || step.note === 'rest';
      segments.push({
        startBeat,
        endBeat,
        beats,
        note: isRest ? null : step.note,
        frequency: isRest ? null : noteNameToFrequency(step.note),
        velocity:
          typeof step.velocity === 'number' && step.velocity >= 0
            ? step.velocity
            : 1,
        noiseTimbre: step.noiseTimbre,
        active: !isRest,
      });
      beatCursor = endBeat;
    }
    return { segments, totalBeats: beatCursor };
  }

  function findSegment(segments, beatPosition) {
    for (const segment of segments) {
      if (beatPosition >= segment.startBeat && beatPosition < segment.endBeat) {
        return segment;
      }
    }
    return segments.length ? segments[segments.length - 1] : null;
  }

  function computeEnvelopeValue(localTime, duration, envelope = {}) {
    if (duration <= 0) {
      return 0;
    }
    const attack = Math.max(0.001, Math.min(envelope.attack ?? 0.01, duration));
    const decay = Math.max(0, Math.min(envelope.decay ?? 0.06, Math.max(duration - attack, 0)));
    const sustainLevel = envelope.sustain ?? 0.8;
    const release = Math.max(0.001, Math.min(envelope.release ?? 0.08, duration));
    const sustainStart = attack + decay;
    const releaseStart = Math.max(duration - release, sustainStart);

    if (localTime <= 0) {
      return 0;
    }
    if (localTime < attack) {
      return Math.max(0, Math.min(1, localTime / attack));
    }
    if (localTime < sustainStart) {
      if (decay <= 0) {
        return sustainLevel;
      }
      const decayProgress = (localTime - attack) / decay;
      return 1 - (1 - sustainLevel) * Math.min(Math.max(decayProgress, 0), 1);
    }
    if (localTime < releaseStart) {
      return sustainLevel;
    }
    const releaseProgress = (localTime - releaseStart) / Math.max(duration - releaseStart, 0.001);
    return Math.max(0, sustainLevel * (1 - Math.min(Math.max(releaseProgress, 0), 1)));
  }

  function createNoiseGenerator() {
    let state = 1;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return (state / 4294967295) * 2 - 1;
    };
  }

  function generateWaveSample(type, frequency, time, options) {
    if (!frequency || !Number.isFinite(frequency)) {
      return 0;
    }
    const phase = (time * frequency) % 1;
    switch (type) {
      case 'triangle': {
        return 1 - 4 * Math.abs(phase - 0.5);
      }
      case 'sawtooth': {
        return 2 * phase - 1;
      }
      case 'pulse': {
        const width = Math.min(Math.max(options?.pulseWidth ?? 0.3, 0.05), 0.95);
        return phase < width ? 1 : -1;
      }
      case 'sine': {
        return Math.sin(2 * Math.PI * phase);
      }
      case 'chip-sine': {
        const value = Math.sin(2 * Math.PI * phase);
        return Math.sign(value) * Math.pow(Math.abs(value), 0.8);
      }
      case 'square':
      default: {
        return phase < 0.5 ? 1 : -1;
      }
    }
  }

  try {
    ambientAudioState.sources.length = 0;

    const masterGain = context.createGain();
    masterGain.gain.value = 0;

    const mixGain = context.createGain();
    mixGain.gain.value = 1;

    let environmentFilter = null;
    if (typeof context.createBiquadFilter === 'function') {
      environmentFilter = context.createBiquadFilter();
      environmentFilter.type = 'lowpass';
      environmentFilter.Q.value = 0.8;
      environmentFilter.frequency.value = 12000;
      mixGain.connect(environmentFilter);
      environmentFilter.connect(masterGain);
    } else {
      mixGain.connect(masterGain);
    }

    masterGain.connect(context.destination);

    ambientAudioState.gain = masterGain;
    ambientAudioState.mixGain = mixGain;
    ambientAudioState.environmentFilter = environmentFilter;

    const musicGain = context.createGain();
    musicGain.gain.value = 0.32;
    ambientAudioState.music.gain = musicGain;

    let musicColorFilter = null;
    if (typeof context.createBiquadFilter === 'function') {
      musicColorFilter = context.createBiquadFilter();
      musicColorFilter.type = 'lowpass';
      musicColorFilter.frequency.value = 8500;
      musicColorFilter.Q.value = 0.7;
      musicGain.connect(musicColorFilter);
      musicColorFilter.connect(mixGain);
    } else {
      musicGain.connect(mixGain);
    }
    ambientAudioState.music.colorFilter = musicColorFilter;

    const windGain = context.createGain();
    windGain.gain.value = 0.05;
    ambientAudioState.wind.gain = windGain;

    let windFilter = null;
    if (typeof context.createBiquadFilter === 'function') {
      windFilter = context.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 320;
      windFilter.Q.value = 1.2;
      windFilter.connect(windGain);
    }
    ambientAudioState.wind.filter = windFilter;

    windGain.connect(mixGain);

    ambientAudioState.wind.buffer =
      ambientAudioState.wind.buffer || createWindNoiseBuffer(context);
    ensureWindSource();

    ambientAudioState.diagnostics.musicStatus = ambientAudioState.music.buffer
      ? 'listo'
      : 'inactivo';
    ambientAudioState.diagnostics.windLevel = windGain.gain.value;
    ambientAudioState.diagnostics.filterFrequency =
      environmentFilter?.frequency?.value ?? ambientAudioState.diagnostics.filterFrequency;
    ambientAudioState.diagnostics.musicTrack = AMBIENT_MUSIC_TRACK_URL;
    ambientAudioState.flags.musicLoadFailed = false;
    ambientAudioState.initialized = true;

    beginMusicLoad();
    ensureAmbientMusicPlayback();
  } catch (error) {
    handleAmbientMusicError('Error al preparar la mezcla ambiental', error);
    ambientAudioState.gain = null;
    ambientAudioState.mixGain = null;
    ambientAudioState.environmentFilter = null;
    ambientAudioState.music.gain = null;
    ambientAudioState.music.colorFilter = null;
    ambientAudioState.wind.gain = null;
    ambientAudioState.wind.filter = null;
    ambientAudioState.initialized = false;
    ambientAudioState.sources.length = 0;
  }

  return ambientAudioState.gain;
}

function createWindNoiseBuffer(context) {
  try {
    const durationSeconds = 6;
    const channels = 2;
    const frameCount = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
    const buffer = context.createBuffer(channels, frameCount, context.sampleRate);
    for (let channel = 0; channel < channels; channel++) {
      const data = buffer.getChannelData(channel);
      let previous = 0;
      for (let i = 0; i < frameCount; i++) {
        const random = Math.random() * 2 - 1;
        previous = previous * 0.92 + random * 0.08;
        data[i] = previous * 0.6;
      }
    }
    return buffer;
  } catch (error) {
    handleAmbientMusicError('Error al generar el ruido de viento', error);
    return null;
  }
}

function ensureWindSource() {
  const context = ambientAudioState.context;
  const wind = ambientAudioState.wind;
  if (!context || !wind?.buffer || !wind.gain) {
    return;
  }
  if (wind.source) {
    return;
  }
  try {
    const source = context.createBufferSource();
    source.buffer = wind.buffer;
    source.loop = true;
    if (wind.filter) {
      source.connect(wind.filter);
    } else {
      source.connect(wind.gain);
    }
    source.start(0);
    source.onended = () => {
      if (ambientAudioState.wind.source === source) {
        ambientAudioState.wind.source = null;
        if (ambientAudioState.enabled) {
          ensureWindSource();
        }
      }
    };
    ambientAudioState.wind.source = source;
    ambientAudioState.sources = ambientAudioState.sources.filter(
      (entry) => entry?.label !== 'wind',
    );
    ambientAudioState.sources.push({ node: source, label: 'wind' });
  } catch (error) {
    handleAmbientMusicError('Error al iniciar el viento ambiental', error);
  }
}

function beginMusicLoad() {
  const context = ambientAudioState.context;
  const music = ambientAudioState.music;
  if (!context || !music) {
    return null;
  }
  if (music.buffer) {
    return Promise.resolve(music.buffer);
  }
  if (music.loadPromise) {
    return music.loadPromise;
  }
  if (typeof fetch !== 'function') {
    handleAmbientMusicError(
      'La API fetch no está disponible para cargar la pista ambiental',
      new Error('fetch no disponible'),
    );
    return null;
  }
  const loadStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  ambientAudioState.diagnostics.musicStatus = 'cargando';
  ambientAudioState.flags.musicLoadFailed = false;
  const loadPromise = fetch(AMBIENT_MUSIC_TRACK_URL)
    .then((response) => {
      if (!response?.ok) {
        throw new Error(`Respuesta ${response?.status ?? 'desconocida'} al cargar la pista`);
      }
      return response.arrayBuffer();
    })
    .then(
      (arrayBuffer) =>
        new Promise((resolve, reject) => {
          context.decodeAudioData(
            arrayBuffer,
            (decoded) => resolve(decoded),
            (decodeError) =>
              reject(
                decodeError ||
                  new Error('No se pudo decodificar la pista ambiental proporcionada'),
              ),
          );
        }),
    )
    .then((buffer) => {
      music.buffer = buffer;
      ambientAudioState.diagnostics.musicStatus = 'listo';
      ambientAudioState.diagnostics.musicLoadTimeMs = Math.round(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - loadStart,
      );
      ambientAudioState.diagnostics.lastError = null;
      ambientAudioState.flags.musicLoadFailed = false;
      ensureAmbientMusicPlayback();
      return buffer;
    })
    .catch((error) => {
      ambientAudioState.music.buffer = null;
      handleAmbientMusicError('Error al cargar la pista ambiental', error);
      ambientAudioState.music.loadPromise = null;
      throw error;
    });
  music.loadPromise = loadPromise;
  return loadPromise;
}

function startMusicSource(buffer) {
  const context = ambientAudioState.context;
  const music = ambientAudioState.music;
  if (!context || !music?.gain || !buffer) {
    return;
  }
  try {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(music.gain);
    source.start(0);
    source.onended = () => {
      if (ambientAudioState.music.source === source) {
        ambientAudioState.music.source = null;
        if (ambientAudioState.enabled) {
          ensureAmbientMusicPlayback();
        }
      }
    };
    ambientAudioState.music.source = source;
    ambientAudioState.sources = ambientAudioState.sources.filter(
      (entry) => entry?.label !== 'music',
    );
    ambientAudioState.sources.push({ node: source, label: 'music' });
    ambientAudioState.diagnostics.musicStatus = 'listo';
  } catch (error) {
    handleAmbientMusicError('Error al iniciar la pista ambiental', error);
  }
}

function ensureAmbientMusicPlayback() {
  const music = ambientAudioState.music;
  if (!music?.gain) {
    return;
  }
  if (music.source) {
    return;
  }
  if (music.buffer) {
    startMusicSource(music.buffer);
    return;
  }
  beginMusicLoad();
}

function handleAmbientMusicError(prefix, error) {
  const details = String(error?.message ? error.message : error ?? 'Error desconocido');
  const message = `${prefix}. ${details}`;
  ambientAudioState.diagnostics.musicStatus = 'error';
  ambientAudioState.diagnostics.lastError = message;
  ambientAudioState.diagnostics.issues = (ambientAudioState.diagnostics.issues ?? 0) + 1;
  ambientAudioState.flags.musicLoadFailed = true;
  if (!ambientAudioState.reportedInitFailure) {
    ambientAudioState.reportedInitFailure = true;
  }
  pendingRuntimeIssueQueue.push({
    severity: 'warning',
    context: 'audio',
    error: message,
  });
}


function updateAmbientAudioMix(isUnderwater) {
  if (!ambientAudioState.enabled) {
    ambientAudioState.underwater = false;
    ambientAudioState.diagnostics.underwater = false;
    ambientAudioState.diagnostics.windTarget = 0;
    const windGain = ambientAudioState.wind?.gain;
    ambientAudioState.diagnostics.windLevel = windGain?.gain?.value ?? 0;
    return;
  }

  ensureAmbientMusicNodes();
  ensureAmbientMusicPlayback();
  ensureWindSource();

  const context = ambientAudioState.context;
  if (!context) {
    return;
  }

  const now = typeof context.currentTime === 'number' ? context.currentTime : 0;
  const nextUnderwater = Boolean(isUnderwater);
  const diagnostics = ambientAudioState.diagnostics;

  if (nextUnderwater !== ambientAudioState.underwater) {
    diagnostics.transitions = (diagnostics.transitions ?? 0) + 1;
  }

  ambientAudioState.underwater = nextUnderwater;
  diagnostics.underwater = nextUnderwater;

  const environmentFilter = ambientAudioState.environmentFilter;
  const targetFilterFrequency = nextUnderwater ? 900 : 12000;
  const targetFilterQ = nextUnderwater ? 1.1 : 0.8;
  if (environmentFilter?.frequency) {
    if (typeof environmentFilter.frequency.setTargetAtTime === 'function') {
      environmentFilter.frequency.setTargetAtTime(targetFilterFrequency, now, nextUnderwater ? 0.8 : 1.2);
    } else {
      environmentFilter.frequency.value = targetFilterFrequency;
    }
    diagnostics.filterFrequency = environmentFilter.frequency.value;
  } else {
    diagnostics.filterFrequency = targetFilterFrequency;
  }
  if (environmentFilter?.Q) {
    if (typeof environmentFilter.Q.setTargetAtTime === 'function') {
      environmentFilter.Q.setTargetAtTime(targetFilterQ, now, 0.6);
    } else {
      environmentFilter.Q.value = targetFilterQ;
    }
  }

  const musicGainNode = ambientAudioState.music?.gain;
  const targetMusicGain = nextUnderwater ? 0.24 : 0.32;
  if (musicGainNode?.gain) {
    if (typeof musicGainNode.gain.setTargetAtTime === 'function') {
      musicGainNode.gain.setTargetAtTime(targetMusicGain, now, 0.9);
    } else {
      musicGainNode.gain.value = targetMusicGain;
    }
  }

  const musicColorFilter = ambientAudioState.music?.colorFilter;
  if (musicColorFilter?.frequency) {
    const targetColorFrequency = nextUnderwater ? 2600 : 8500;
    if (typeof musicColorFilter.frequency.setTargetAtTime === 'function') {
      musicColorFilter.frequency.setTargetAtTime(targetColorFrequency, now, 0.6);
    } else {
      musicColorFilter.frequency.value = targetColorFrequency;
    }
    if (musicColorFilter.Q) {
      const targetColorQ = nextUnderwater ? 1.3 : 0.7;
      if (typeof musicColorFilter.Q.setTargetAtTime === 'function') {
        musicColorFilter.Q.setTargetAtTime(targetColorQ, now, 0.6);
      } else {
        musicColorFilter.Q.value = targetColorQ;
      }
    }
  }

  const windGainNode = ambientAudioState.wind?.gain;
  if (windGainNode?.gain) {
    const baseOscillation = Math.sin(now * 0.09) * 0.5 + 0.5;
    const gustOscillation = Math.sin(now * 0.37 + 1.2) * 0.5 + 0.5;
    const targetWindGain = nextUnderwater
      ? 0.012 + baseOscillation * 0.012
      : 0.045 + baseOscillation * 0.03 + gustOscillation * 0.02;
    diagnostics.windTarget = targetWindGain;
    if (typeof windGainNode.gain.setTargetAtTime === 'function') {
      windGainNode.gain.setTargetAtTime(targetWindGain, now, 2.4);
    } else {
      windGainNode.gain.value = targetWindGain;
    }
    diagnostics.windLevel = windGainNode.gain.value;
  } else {
    diagnostics.windTarget = 0;
    diagnostics.windLevel = 0;
  }

  const windFilter = ambientAudioState.wind?.filter;
  if (windFilter?.frequency) {
    const targetWindFrequency = nextUnderwater ? 200 : 360;
    if (typeof windFilter.frequency.setTargetAtTime === 'function') {
      windFilter.frequency.setTargetAtTime(targetWindFrequency, now, 1.2);
    } else {
      windFilter.frequency.value = targetWindFrequency;
    }
  }

  diagnostics.lastUpdate = Date.now();
}

function fadeAmbientMusic(targetGain) {
  const gainNode = ambientAudioState.gain;
  const context = ambientAudioState.context;
  if (!gainNode || !context) {
    return;
  }
  const now = typeof context.currentTime === 'number' ? context.currentTime : 0;
  try {
    if (typeof gainNode.gain.cancelScheduledValues === 'function') {
      gainNode.gain.cancelScheduledValues(now);
    }
    if (typeof gainNode.gain.setTargetAtTime === 'function') {
      gainNode.gain.setTargetAtTime(targetGain, now, 0.8);
    } else {
      gainNode.gain.value = targetGain;
    }
  } catch (error) {
    void error;
    gainNode.gain.value = targetGain;
  }
}

function setAmbientMusicEnabled(isEnabled) {
  ambientAudioState.enabled = Boolean(isEnabled);
  if (!ambientAudioState.enabled) {
    fadeAmbientMusic(0);
    ambientAudioState.diagnostics.musicStatus = ambientAudioState.music?.buffer
      ? 'silenciado'
      : 'inactivo';
    ambientAudioState.diagnostics.underwater = false;
    ambientAudioState.diagnostics.windTarget = 0;
    ambientAudioState.diagnostics.pendingGesture = false;
    return;
  }

  const context = ambientAudioState.context;
  if (!context) {
    if (ambientAudioState.diagnostics.musicStatus !== 'error') {
      ambientAudioState.diagnostics.musicStatus = 'pendiente';
    }
    ambientAudioState.diagnostics.pendingGesture = true;
    return;
  }

  ambientAudioState.diagnostics.pendingGesture = false;

  ensureAmbientMusicNodes();

  if (ambientAudioState.music?.buffer && ambientAudioState.diagnostics.musicStatus !== 'error') {
    ambientAudioState.diagnostics.musicStatus = 'listo';
  }

  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    if (ambientAudioState.diagnostics.musicStatus !== 'error') {
      ambientAudioState.diagnostics.musicStatus = 'pausado';
    }
    return;
  }

  if (context.state === 'running') {
    fadeAmbientMusic(ambientAudioState.defaultGain);
  }

  if (context.state === 'suspended') {
    ambientAudioState.diagnostics.pendingGesture = true;
  }

  updateAmbientAudioMix(ambientAudioState.underwater);
}

function handleAmbientMusicUserGesture() {
  if (!ambientAudioState.supported || !ambientAudioState.enabled) {
    return;
  }

  const context = ensureAmbientAudioContext();
  if (!context) {
    return;
  }

  const activate = () => {
    if (!ambientAudioState.enabled) {
      return;
    }
    ensureAmbientMusicNodes();
    fadeAmbientMusic(ambientAudioState.defaultGain);
    updateAmbientAudioMix(ambientAudioState.underwater);
    ambientAudioState.diagnostics.pendingGesture = false;
  };

  ambientAudioState.diagnostics.lastResumeAttempt = Date.now();

  if (context.state === 'suspended' && typeof context.resume === 'function') {
    try {
      ambientAudioState.diagnostics.pendingGesture = true;
      const resumeResult = context.resume();
      if (resumeResult && typeof resumeResult.then === 'function') {
        resumeResult
          .then(() => {
            activate();
          })
          .catch((error) => {
            ambientAudioState.diagnostics.pendingGesture = true;
            if (!ambientAudioState.reportedInitFailure) {
              ambientAudioState.reportedInitFailure = true;
              const message =
                'No se pudo activar el audio ambiental. ' +
                String(error && error.message ? error.message : error ?? 'Error desconocido');
              pendingRuntimeIssueQueue.push({
                severity: 'warning',
                context: 'audio',
                error: message,
              });
            }
          });
        return;
      }
    } catch (error) {
      if (!ambientAudioState.reportedInitFailure) {
        ambientAudioState.reportedInitFailure = true;
        const message =
          'No se pudo activar el audio ambiental. ' +
          String(error && error.message ? error.message : error ?? 'Error desconocido');
        pendingRuntimeIssueQueue.push({
          severity: 'warning',
          context: 'audio',
          error: message,
        });
      }
      ambientAudioState.diagnostics.pendingGesture = true;
      return;
    }
  }

  activate();
}

if (musicToggle && typeof musicToggle.addEventListener === 'function') {
  musicToggle.addEventListener('change', (event) => {
    const shouldEnable = Boolean(event?.target?.checked);
    setAmbientMusicEnabled(shouldEnable);
    if (shouldEnable && event?.isTrusted) {
      handleAmbientMusicUserGesture();
    }
  });
}

setAmbientMusicEnabled(ambientAudioState.enabled);

if (
  ambientAudioState.supported &&
  typeof document !== 'undefined' &&
  typeof document.addEventListener === 'function'
) {
  document.addEventListener('visibilitychange', () => {
    if (!ambientAudioState.context) {
      return;
    }
    if (document.visibilityState === 'hidden') {
      fadeAmbientMusic(0);
      if (ambientAudioState.diagnostics.musicStatus !== 'error') {
        ambientAudioState.diagnostics.musicStatus = 'pausado';
      }
      if (ambientAudioState.context.state === 'running') {
        ambientAudioState.context.suspend?.().catch(() => {});
      }
      return;
    }
    if (ambientAudioState.enabled) {
      handleAmbientMusicUserGesture();
    }
  });
}

function registerUiFallback(id, message, severity = 'error') {
  if (!id) {
    return null;
  }
  const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
  const existing = reportedFallbacks[id];
  const count = existing ? (existing.count || 0) + 1 : 1;
  reportedFallbacks[id] = {
    id,
    message,
    severity,
    count,
    timestamp,
  };
  uiFallbackEvents.push({ id, message, severity, count, timestamp });
  if (uiFallbackEvents.length > MAX_UI_FALLBACK_EVENTS) {
    uiFallbackEvents.shift();
  }
  if (!existing) {
    pendingRuntimeIssueQueue.push({
      severity,
      context: 'ui',
      error: { message, preserve: true, id },
    });
  }
  return reportedFallbacks[id];
}

if (runtimeState.bootstrapAttempts > 1) {
  pendingRuntimeIssueQueue.push({
    severity: 'fatal',
    context: 'bootstrap',
    error:
      'Se detectó una segunda inicialización del script principal. Verifica que "scripts/main.js" solo se incluya una vez.',
  });
}

const fallbackFactories = ensureFallbackFactories();

canvas = ensurePrimaryCanvas(canvas);

if (!debugPanel || !debugToggleButton || !debugConsole) {
  const fallback = fallbackFactories.debugPanel();
  registerUiFallback(
    'debug-panel',
    'Se reconstruyó el panel de depuración porque faltaba en el DOM inicial.',
  );
  if (!debugPanel) {
    debugPanel = fallback.panel;
  }
  if (!debugToggleButton) {
    debugToggleButton = fallback.toggle;
  }
  if (!debugConsole) {
    debugConsole = fallback.console;
  }
}

ensureDebugPanelHeartbeat();

const selectionInfoPanel =
  document.getElementById('selection-info') ?? fallbackFactories.infoPanel();
const selectionBlockField =
  document.getElementById('selection-info-block') ?? fallbackFactories.textField();
const selectionChunkField =
  document.getElementById('selection-info-chunk') ?? fallbackFactories.textField();
const selectionWorldField =
  document.getElementById('selection-info-world') ?? fallbackFactories.textField();
const selectionHeightField =
  document.getElementById('selection-info-height') ?? fallbackFactories.textField();
const selectionWaterField =
  document.getElementById('selection-info-water') ?? fallbackFactories.textField();
const selectionDepthField =
  document.getElementById('selection-info-depth') ?? fallbackFactories.textField();
const selectionCloseButton =
  document.getElementById('selection-close') ?? fallbackFactories.button();
const waterInfoPanel = document.getElementById('water-info') ?? fallbackFactories.infoPanel();
const waterInfoVolumeField =
  document.getElementById('water-info-volume') ?? fallbackFactories.textField();
const waterInfoCloseButton =
  document.getElementById('water-info-close') ?? fallbackFactories.button();
const plantInfoPanel = document.getElementById('plant-info') ?? fallbackFactories.infoPanel();
const plantInfoSpeciesField =
  document.getElementById('plant-info-species') ?? fallbackFactories.textField();
const plantInfoAgeLoreField =
  document.getElementById('plant-info-age-lore') ?? fallbackFactories.textField();
const plantInfoAgeRealField =
  document.getElementById('plant-info-age-real') ?? fallbackFactories.textField();
const plantInfoMassField =
  document.getElementById('plant-info-mass') ?? fallbackFactories.textField();
const plantInfoNutrientsField =
  document.getElementById('plant-info-nutrients') ?? fallbackFactories.textField();
const plantInfoCloseButton =
  document.getElementById('plant-info-close') ?? fallbackFactories.button();

const rockInfoPanel = document.getElementById('rock-info') ?? fallbackFactories.infoPanel();
const rockInfoTypeField =
  document.getElementById('rock-info-type') ?? fallbackFactories.textField();
const rockInfoMatrixMassField =
  document.getElementById('rock-info-matrix-mass') ?? fallbackFactories.textField();
const rockInfoMassField =
  document.getElementById('rock-info-total-mass') ?? fallbackFactories.textField();
const rockInfoAgeField =
  document.getElementById('rock-info-age') ?? fallbackFactories.textField();
const rockInfoErosionField =
  document.getElementById('rock-info-erosion') ?? fallbackFactories.textField();
const rockInfoMineralsList =
  document.getElementById('rock-info-minerals') ?? fallbackFactories.list();
const rockInfoCloseButton =
  document.getElementById('rock-info-close') ?? fallbackFactories.button();

function ensureFallbackFactories() {
  if (runtimeState.fallbackFactories) {
    const factories = runtimeState.fallbackFactories;
    if (typeof factories.list !== 'function') {
      factories.list = () => ({
        innerHTML: '',
        textContent: '',
        appendChild: () => {},
        removeChild: () => {},
        querySelectorAll: () => [],
        firstChild: null,
        replaceChildren: () => {},
      });
    }
    return factories;
  }

  function createDebugPanelFallback() {
    return createFallbackDebugPanel();
  }

  function createInfoPanelFallback() {
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

  function createTextFieldFallback() {
    return {
      textContent: '',
    };
  }

  function createButtonFallback() {
    return {
      addEventListener: () => {},
    };
  }

  function createListFallback() {
    return {
      innerHTML: '',
      textContent: '',
      appendChild: () => {},
      removeChild: () => {},
      querySelectorAll: () => [],
      firstChild: null,
      replaceChildren: () => {},
    };
  }

  runtimeState.fallbackFactories = {
    debugPanel: createDebugPanelFallback,
    infoPanel: createInfoPanelFallback,
    textField: createTextFieldFallback,
    button: createButtonFallback,
    list: createListFallback,
  };

  return runtimeState.fallbackFactories;
}

function createCanvasFallbackElement() {
  const width =
    (typeof window !== 'undefined' && Number.isFinite(window.innerWidth) && window.innerWidth) || 1280;
  const height =
    (typeof window !== 'undefined' && Number.isFinite(window.innerHeight) && window.innerHeight) || 720;

  if (typeof document?.createElement === 'function') {
    try {
      const element = document.createElement('canvas');
      if (!element) {
        return null;
      }
      element.id = 'scene';
      if (element.dataset) {
        element.dataset.uiElement = element.dataset.uiElement || 'scene-canvas';
      } else {
        element.dataset = { uiElement: 'scene-canvas' };
      }
      element.width = element.width || width;
      element.height = element.height || height;
      if (element.style) {
        element.style.display = element.style.display || 'block';
      }
      if (document.body && typeof document.body.appendChild === 'function') {
        document.body.appendChild(element);
      }
      return element;
    } catch (error) {
      void error;
    }
  }

  return {
    id: 'scene',
    width,
    height,
    dataset: { uiElement: 'scene-canvas' },
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    setAttribute: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    requestPointerLock: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
    getContext: () => null,
  };
}

function ensurePrimaryCanvas(element) {
  if (element && typeof element.getContext === 'function') {
    return element;
  }

  const fallback = createCanvasFallbackElement();
  if (fallback && typeof fallback.getContext === 'function') {
    const originalGetContext =
      typeof fallback.getContext === 'function' ? fallback.getContext.bind(fallback) : null;
    let validationContext = null;
    if (originalGetContext) {
      try {
        validationContext = originalGetContext('webgl', { antialias: true });
      } catch (error) {
        validationContext = null;
      }
    }

    if (validationContext) {
      try {
        fallback.getContext = (type, options) => {
          if (type === 'webgl') {
            return validationContext;
          }
          return originalGetContext ? originalGetContext(type, options) : null;
        };
      } catch (error) {
        void error;
      }
      try {
        Object.defineProperty(fallback, '__arrecifeWebglContext', {
          value: validationContext,
          enumerable: false,
          configurable: true,
        });
      } catch (error) {
        void error;
      }
      registerUiFallback(
        'scene-canvas',
        'Se creó un canvas de emergencia porque faltaba el elemento principal #scene.',
      );
      return fallback;
    }
  }

  registerUiFallback(
    'scene-canvas-missing',
    'No se pudo recuperar el canvas principal (#scene). Revisa que el HTML incluya <canvas id="scene">.',
    'fatal',
  );
  throw new Error('No se pudo inicializar el canvas principal (#scene)');
}
const uiDebugHighlightToggle = document.getElementById('ui-debug-highlight');
const uiDebugTrackToggle = document.getElementById('ui-debug-track');
const uiDebugLogButton = document.getElementById('ui-debug-log');

const bodyElement = document.body;

let fatalRuntimeError = null;
let loopHalted = false;
let activeWaterSelection = null;
let ignoreNextWaterPointerDown = false;
let waterInfoPointerHandler = null;
let waterInfoKeyHandler = null;
let activePlantSelection = null;
let pendingPlantSelection = null;
let ignoreNextPlantPointerDown = false;
let plantInfoPointerHandler = null;
let plantInfoKeyHandler = null;
let debugPanelExpanded = false;
let suppressNextSelectionPointerDown = false;
let suppressNextSelectionClick = false;
let pendingSelectionForClick = null;

const diagnosticsToast =
  bodyElement && typeof document?.createElement === 'function'
    ? createDiagnosticsToast()
    : null;

const overlayErrorMessage =
  overlay && typeof document?.createElement === 'function' && typeof overlay.appendChild === 'function'
    ? createOverlayErrorMessage(overlay)
    : null;

setDebugPanelExpanded(false);

const uiDebugRegistry = [
  {
    id: 'water-info',
    name: 'waterInfo',
    label: 'Panel de información de agua',
    element: waterInfoPanel,
  },
  {
    id: 'plant-info',
    name: 'plantInfo',
    label: 'Panel de organismos vegetales',
    element: plantInfoPanel,
  },
  {
    id: 'selection-info',
    name: 'selectionInfo',
    label: 'Panel de selección',
    element: selectionInfoPanel,
  },
  {
    id: 'simulation-hud',
    name: 'simulationHud',
    label: 'HUD de simulación',
    element: simulationHud,
  },
  {
    id: 'settings-panel',
    name: 'settingsPanel',
    label: 'Panel de configuración',
    element: settingsPanel,
  },
  {
    id: 'overlay',
    name: 'tutorialOverlay',
    label: 'Superposición de tutorial',
    element: overlay,
  },
  {
    id: 'debug-panel',
    name: 'debugPanel',
    label: 'Panel de depuración',
    element: debugPanel,
  },
];

const uiDebugState = {
  highlight: false,
  track: false,
  snapshot: new Map(),
};

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
  const preserve = Boolean(error && typeof error === 'object' && error.preserve);
  const issueId =
    error && typeof error === 'object' && typeof error.id === 'string' ? error.id : null;
  const stackTrace =
    error instanceof Error
      ? error.stack
      : error && typeof error.stack === 'string'
      ? error.stack
      : null;
  const entry = {
    severity,
    context,
    message: describeIssue(error),
    timestamp,
    stack: stackTrace,
    preserve,
    id: issueId,
  };
  runtimeIssues.unshift(entry);
  if (runtimeIssues.length > MAX_RUNTIME_ISSUES) {
    let removed = false;
    for (let i = runtimeIssues.length - 1; i >= 0; i -= 1) {
      if (!runtimeIssues[i]?.preserve) {
        runtimeIssues.splice(i, 1);
        removed = true;
        break;
      }
    }
    if (!removed) {
      runtimeIssues.length = MAX_RUNTIME_ISSUES;
    }
  }
  updateDiagnosticsToast();
  return entry;
}

function reportVolumetricAnomaly(flaggedEntry, context = {}) {
  if (!flaggedEntry) {
    return;
  }
  const labels = [];
  if (context.type) {
    labels.push(context.type);
  }
  if (context.id) {
    labels.push(context.id);
  } else if (context.name) {
    labels.push(context.name);
  }
  const label = labels.length > 0 ? labels.join(' ') : 'Entidad volumétrica';
  recordRuntimeIssue('warning', 'volumetric-mass', {
    message: `${label} fuera de rango (${flaggedEntry.reason})`,
  });
}

while (pendingRuntimeIssueQueue.length > 0) {
  const pendingIssue = pendingRuntimeIssueQueue.shift();
  recordRuntimeIssue(pendingIssue.severity, pendingIssue.context, pendingIssue.error);
}

function inspectUiElement(element) {
  if (!element) {
    return { present: false };
  }

  const computed =
    typeof window !== 'undefined' && typeof window.getComputedStyle === 'function'
      ? window.getComputedStyle(element)
      : null;
  const rect =
    typeof element?.getBoundingClientRect === 'function'
      ? element.getBoundingClientRect()
      : null;

  const width = rect ? Math.round(rect.width) : 0;
  const height = rect ? Math.round(rect.height) : 0;
  const hiddenAttribute = Boolean(element.hidden);
  const display = computed ? computed.display : null;
  const visibility = computed ? computed.visibility : null;
  const opacity = computed ? Number.parseFloat(computed.opacity || '1') : 1;

  const visible =
    !hiddenAttribute &&
    display !== 'none' &&
    visibility !== 'hidden' &&
    opacity > 0.01 &&
    width > 0 &&
    height > 0;

  return {
    present: true,
    hiddenAttribute,
    display,
    visibility,
    opacity,
    width,
    height,
    top: rect ? Math.round(rect.top) : null,
    left: rect ? Math.round(rect.left) : null,
    visible,
  };
}

function refreshUiDebugSnapshot() {
  const snapshot = new Map();
  for (const entry of uiDebugRegistry) {
    snapshot.set(entry.name, inspectUiElement(entry.element));
  }
  uiDebugState.snapshot = snapshot;
  return snapshot;
}

function getUiDebugSnapshotObject(snapshot = uiDebugState.snapshot) {
  const result = {};
  if (!(snapshot instanceof Map)) {
    return result;
  }
  for (const entry of uiDebugRegistry) {
    result[entry.name] = snapshot.get(entry.name);
  }
  return result;
}

function setUiDebugHighlight(active) {
  uiDebugState.highlight = Boolean(active);
  if (bodyElement?.classList?.toggle) {
    bodyElement.classList.toggle('ui-debug-outlines', uiDebugState.highlight);
  }
  if (uiDebugHighlightToggle && uiDebugHighlightToggle.checked !== uiDebugState.highlight) {
    uiDebugHighlightToggle.checked = uiDebugState.highlight;
  }
}

function setUiDebugTracking(active) {
  uiDebugState.track = Boolean(active);
  if (uiDebugTrackToggle && uiDebugTrackToggle.checked !== uiDebugState.track) {
    uiDebugTrackToggle.checked = uiDebugState.track;
  }
  if (uiDebugState.track) {
    refreshUiDebugSnapshot();
  }
}

function verifyCriticalUiElements() {
  for (const entry of uiDebugRegistry) {
    if (!entry.element) {
      recordRuntimeIssue('error', 'ui', `No se encontró ${entry.label} (#${entry.id})`);
    }
  }
}

verifyCriticalUiElements();

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
  ensureDebugPanelHeartbeat();
  setDebugPanelExpanded(true);
  try {
    updateDebugConsole(0);
  } catch (panelError) {
    console.error('No se pudo actualizar el panel de depuración tras un error crítico', panelError);
  }
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

const derivativeExtension =
  typeof gl.getExtension === 'function' ? gl.getExtension('OES_standard_derivatives') : null;
const derivativesSupported = Boolean(derivativeExtension);
const lightingDiagnostics = {
  derivativesSupported,
  lastAppliedSunSpecular: 0,
  lastAppliedMoonSpecular: 0,
  startupRecorded: false,
  startupNormalizedTime: null,
  startupLightColor: [0, 0, 0],
  startupSunAltitude: 0,
  latestLightColor: [0, 0, 0],
  latestAmbientColor: [0, 0, 0],
  latestDaylight: 0,
  latestSunAltitude: 0,
};

if (!derivativesSupported) {
  recordRuntimeIssue(
    'info',
    'webgl-derivatives',
    new Error(
      'Extensión OES_standard_derivatives no disponible; se usarán normales aproximadas para la iluminación.',
    ),
  );
}

const GL_NO_ERROR = gl.NO_ERROR ?? 0;

gl.clearColor(0.05, 0.08, 0.12, 1);
gl.enable(gl.DEPTH_TEST);

const defaultDepthFunc = gl.LESS ?? 0x0201;
let skyboxProgram = null;
let skyboxPositionAttribute = -1;
let skyboxViewProjectionUniform = null;
let skyboxTopColorUniform = null;
let skyboxMiddleColorUniform = null;
let skyboxBottomColorUniform = null;
let skyboxBuffer = null;
let skyboxVertexCount = 0;
let skyboxViewProjectionMatrix = null;
let lastViewProjectionMatrix = null;

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
  precision mediump float;
  precision mediump int;

  attribute vec3 position;
  attribute vec3 color;

  const int MAX_SWELLS = 4;

  uniform mat4 viewProjection;
  uniform int renderMode;
  uniform float waterTime;
  uniform float waterSurfaceLevel;
  uniform float waterPrimaryWaveFrequency;
  uniform float waterSecondaryWaveFrequency;
  uniform float waterPrimaryWaveSpeed;
  uniform float waterSecondaryWaveSpeed;
  uniform float waterPrimaryAmplitude;
  uniform float waterSecondaryAmplitude;
  uniform vec3 waterDeepColor;
  uniform vec3 waterShallowColor;
  uniform vec3 waterFoamColor;
  uniform float waterColorQuantizeStep;
  uniform int waterSwellCount;
  uniform vec4 waterSwellOrigins[MAX_SWELLS];
  uniform vec4 waterSwellParams[MAX_SWELLS];
  uniform vec4 waterSwellState[MAX_SWELLS];

  varying vec3 vColor;
  varying vec3 vPosition;

  const float TAU = 6.2831853;

  void main() {
    vec3 finalPosition = position;
    vec3 finalColor = color;

    if (renderMode == 1) {
      float foam = color.r;
      float pattern = color.g;
      float shallowMix = color.b;

      float timePrimary = waterTime * waterPrimaryWaveSpeed;
      float timeSecondary = waterTime * waterSecondaryWaveSpeed;

      vec2 primaryDir = normalize(vec2(0.9, 0.35));
      vec2 secondaryDir = normalize(vec2(-0.45, 1.0));
      float primaryPhase =
        dot(position.xz, primaryDir) * waterPrimaryWaveFrequency + timePrimary + pattern * TAU;
      float secondaryPhase =
        dot(position.xz, secondaryDir) * waterSecondaryWaveFrequency + timeSecondary * 1.3 + pattern * 3.14159265;

      float foamAdjusted = clamp(foam, 0.0, 1.0);
      float amplitudeFactor = 0.45 + (1.0 - foamAdjusted) * 0.55;
      float primaryWave = sin(primaryPhase) * waterPrimaryAmplitude * amplitudeFactor;
      float secondaryWave =
        cos(secondaryPhase) *
        waterSecondaryAmplitude *
        (0.35 + (1.0 - foamAdjusted) * 0.65);
      float waveOffset = primaryWave + secondaryWave;

      vec2 horizontalOffset =
        primaryDir * cos(primaryPhase) * waterPrimaryAmplitude * amplitudeFactor * 0.18 +
        secondaryDir *
          sin(secondaryPhase) *
          waterSecondaryAmplitude *
          (0.25 + (1.0 - foamAdjusted) * 0.45) *
          0.14;

      float swellOffset = 0.0;
      float swellFoamBoost = 0.0;
      float swellSplash = 0.0;
      vec2 swellSlide = vec2(0.0);

      for (int i = 0; i < MAX_SWELLS; i++) {
        if (i >= waterSwellCount) {
          break;
        }
        vec4 originData = waterSwellOrigins[i];
        vec4 paramData = waterSwellParams[i];
        vec4 stateData = waterSwellState[i];
        vec2 origin = originData.xy;
        vec2 direction = originData.zw;
        float dirLength = length(direction);
        if (dirLength < 0.0001) {
          continue;
        }
        direction /= dirLength;
        float amplitude = paramData.x;
        float crestLength = max(0.25, paramData.y);
        float lateralSpread = max(0.25, paramData.z);
        float foamBoost = max(0.0, paramData.w);
        float startTime = stateData.x;
        float speed = max(0.01, stateData.y);
        float decayDistance = max(crestLength, stateData.z);
        float splashHeight = max(0.0, stateData.w);

        float elapsed = waterTime - startTime;
        if (elapsed < 0.0) {
          continue;
        }
        float traveled = elapsed * speed;
        vec2 toPoint = position.xz - origin;
        float along = dot(toPoint, direction);
        float aheadLimit = traveled + decayDistance;
        if (along < -crestLength || along > aheadLimit) {
          continue;
        }
        vec2 lateral = toPoint - direction * along;
        float lateralDistance = length(lateral);
        float lateralFactor = exp(-pow(lateralDistance / lateralSpread, 2.0));
        float crestOffset = traveled - along;
        float crestFactor = exp(-pow(crestOffset / crestLength, 2.0));
        float decayFactor = exp(-max(0.0, crestOffset) / decayDistance);
        float energy = crestFactor * lateralFactor * decayFactor;
        if (energy <= 0.0001) {
          continue;
        }
        swellOffset += amplitude * energy;
        swellFoamBoost = max(swellFoamBoost, foamBoost * energy);
        swellSplash = max(swellSplash, splashHeight * energy);
        swellSlide += direction * amplitude * energy * 0.16;
      }

      float foamPulse = sin(waterTime * 2.1 + pattern * TAU * 1.5) * 0.08;
      float foamLevel = clamp(foamAdjusted + swellFoamBoost + foamPulse, 0.0, 1.0);
      waveOffset += swellOffset;
      float splashRaise = swellSplash * smoothstep(0.55, 1.0, foamLevel);

      finalPosition.xz += horizontalOffset + swellSlide;
      finalPosition.y = waterSurfaceLevel + waveOffset + splashRaise;

      vec3 baseColor = mix(waterDeepColor, waterShallowColor, shallowMix);
      float sparkle = sin(waterTime * 1.3 + dot(position.xz, vec2(0.18, 0.23)) + pattern * TAU) * 0.04;
      baseColor.r = clamp(baseColor.r + sparkle * 0.8, 0.0, 1.0);
      baseColor.g = clamp(baseColor.g + sparkle * 0.6, 0.0, 1.0);
      baseColor.b = clamp(baseColor.b + sparkle, 0.0, 1.0);

      float foamHighlight = pow(max(0.0, foamLevel - 0.45), 1.5);
      if (foamHighlight > 0.0 || swellFoamBoost > 0.0) {
        float foamBlend = clamp(foamHighlight + pattern * 0.12 + swellFoamBoost * 0.85, 0.0, 1.0);
        baseColor = mix(baseColor, waterFoamColor, foamBlend);
      }

      vec3 quantized = floor(baseColor / waterColorQuantizeStep + 0.5) * waterColorQuantizeStep;
      finalColor = clamp(quantized, 0.0, 1.0);
    }

    vPosition = finalPosition;
    gl_Position = viewProjection * vec4(finalPosition, 1.0);
    vColor = finalColor;
  }
`;

const derivativeShaderHeader = derivativesSupported
  ? '#extension GL_OES_standard_derivatives : enable'
  : '';

const fragmentNormalComputation = derivativesSupported
  ? `
  vec3 computeSurfaceNormal() {
    vec3 dx = dFdx(vPosition);
    vec3 dy = dFdy(vPosition);
    vec3 normal = normalize(cross(dx, dy));
    if (length(normal) < 0.0001) {
      return vec3(0.0, 1.0, 0.0);
    }
    return gl_FrontFacing ? normal : -normal;
  }
`
  : `
  vec3 computeSurfaceNormal() {
    return vec3(0.0, 1.0, 0.0);
  }
`;

const fragmentSource = `
  precision mediump float;
  precision mediump int;
  ${derivativeShaderHeader}
  varying vec3 vColor;
  varying vec3 vPosition;
  uniform vec3 globalLightColor;
  uniform float terrainAlpha;
  uniform int renderMode;
  uniform float patternTime;
  uniform vec3 ambientLightColor;
  uniform vec3 sunLightDirection;
  uniform vec3 sunLightColor;
  uniform vec3 moonLightDirection;
  uniform vec3 moonLightColor;
  uniform vec3 viewPosition;
  uniform float sunSpecularStrength;
  uniform float moonSpecularStrength;
  uniform float specularPower;
  uniform float surfaceSpecularStrength;
  uniform float emissiveStrength;
  uniform int terrainFlatShading;
  uniform vec3 terrainFlatLightColor;

  const int RENDER_MODE_TERRAIN = 0;
  const int RENDER_MODE_WATER = 1;
  const int RENDER_MODE_WIND = 2;
  const int RENDER_MODE_CLOUD = 3;
  const int RENDER_MODE_CELESTIAL = 4;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float layeredNoise(vec2 uv) {
    float amplitude = 0.55;
    float frequency = 1.0;
    float total = 0.0;
    for (int i = 0; i < 3; i++) {
      total += valueNoise(uv * frequency) * amplitude;
      amplitude *= 0.55;
      frequency *= 2.2;
      uv = uv * 1.7 + 3.1;
    }
    return total;
  }

  ${fragmentNormalComputation}

  void main() {
    vec3 baseColor = clamp(vColor, 0.0, 1.0);

    if (renderMode == RENDER_MODE_WIND) {
      float alpha = clamp(baseColor.b, 0.0, 1.0);
      vec3 windColor = vec3(baseColor.r, baseColor.g, baseColor.r * 0.9);
      vec3 litWind = clamp(windColor * ambientLightColor * globalLightColor, 0.0, 1.0);
      gl_FragColor = vec4(litWind, alpha * terrainAlpha);
      return;
    }

    if (renderMode == RENDER_MODE_CELESTIAL) {
      vec3 emissive = clamp(baseColor * (1.0 + emissiveStrength), 0.0, 1.5);
      gl_FragColor = vec4(emissive, terrainAlpha);
      return;
    }

      if (renderMode == RENDER_MODE_TERRAIN && terrainFlatShading > 0) {
        gl_FragColor = vec4(baseColor, terrainAlpha);
        return;
      }

    vec3 texturedColor = baseColor;
    bool applySurfaceTexture = renderMode != RENDER_MODE_CLOUD;
    if (renderMode == RENDER_MODE_TERRAIN && surfaceSpecularStrength <= 0.2) {
      applySurfaceTexture = false;
    }
    if (applySurfaceTexture) {
      float maxComponent = max(baseColor.r, max(baseColor.g, baseColor.b));
      float minComponent = min(baseColor.r, min(baseColor.g, baseColor.b));
      float saturation = maxComponent - minComponent;
      float brightness = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
      float warmth = baseColor.r - baseColor.b;
      float blueDominance = baseColor.b - (baseColor.r + baseColor.g) * 0.5;
      float waterMask = smoothstep(0.05, 0.18, blueDominance);
      float sandMask = smoothstep(0.15, 0.3, warmth + saturation * 0.5) * (1.0 - waterMask);
      float rockMask = (1.0 - sandMask) * (1.0 - waterMask) * (1.0 - smoothstep(0.55, 0.8, brightness));

      vec3 sandColor = baseColor;
      if (sandMask > 0.001) {
        vec2 sandCoords = vPosition.xz * 0.12;
        float duneWave = sin(sandCoords.x * 4.1 + patternTime * 0.45) * 0.5 +
          cos(sandCoords.y * 3.3 - patternTime * 0.32) * 0.5;
        float grainNoise = layeredNoise(sandCoords * 2.3 + patternTime * 0.05);
        float speckleNoise = layeredNoise(sandCoords * 5.0 - patternTime * 0.07);
        float pattern = duneWave * 0.18 + (grainNoise - 0.5) * 0.22 + (speckleNoise - 0.5) * 0.12;
        float sparkle = smoothstep(0.65, 1.0, speckleNoise) * 0.08;
        sandColor = clamp(baseColor + pattern * vec3(0.14, 0.11, 0.05) + sparkle * vec3(0.16, 0.15, 0.1), 0.0, 1.0);
      }

      vec3 rockColor = baseColor;
      if (rockMask > 0.001) {
        vec2 rockCoords = vec2(
          dot(vPosition.xz, vec2(0.68, 0.52)),
          vPosition.y * 0.6 + vPosition.x * 0.15 - vPosition.z * 0.1
        );
        float strata = sin(rockCoords.x * 3.4 + patternTime * 0.35);
        float contour = cos(rockCoords.y * 2.7 - patternTime * 0.22);
        float coarseNoise = layeredNoise((vPosition.xz + rockCoords.xy) * 1.1 + patternTime * 0.03);
        float fineNoise = layeredNoise(vPosition.xz * 4.8 + rockCoords.yx * 0.5);
        float pattern = strata * 0.18 + contour * 0.12 + (coarseNoise - 0.5) * 0.28 + (fineNoise - 0.5) * 0.08;
        float highlight = smoothstep(0.68, 1.0, fineNoise) * 0.06;
        rockColor = clamp(baseColor + pattern * vec3(0.16, 0.14, 0.12) + highlight * vec3(0.12, 0.13, 0.14), 0.05, 1.0);
      }

      texturedColor = mix(texturedColor, sandColor, clamp(sandMask, 0.0, 1.0));
      texturedColor = mix(texturedColor, rockColor, clamp(rockMask, 0.0, 1.0));
    }

    vec3 normal = computeSurfaceNormal();
    vec3 viewDir = normalize(viewPosition - vPosition);
    if (length(viewDir) < 0.0001) {
      viewDir = vec3(0.0, 0.0, 1.0);
    }

    float sunDiffuse = max(0.0, dot(normal, sunLightDirection));
    float moonDiffuse = max(0.0, dot(normal, moonLightDirection));

    vec3 sunHalf = normalize(sunLightDirection + viewDir);
    vec3 moonHalf = normalize(moonLightDirection + viewDir);

    float rawSunSpec = pow(max(0.0, dot(normal, sunHalf)), specularPower);
    float rawMoonSpec = pow(max(0.0, dot(normal, moonHalf)), specularPower);

    float sunSpec = rawSunSpec * sunSpecularStrength * surfaceSpecularStrength;
    float moonSpec = rawMoonSpec * moonSpecularStrength * surfaceSpecularStrength;

    vec3 lighting = ambientLightColor +
      sunLightColor * (sunDiffuse + sunSpec) +
      moonLightColor * (moonDiffuse + moonSpec);

    if (renderMode == RENDER_MODE_CLOUD) {
      lighting += sunLightColor * (0.1 + 0.2 * sunDiffuse);
      lighting += moonLightColor * (0.08 + 0.12 * moonDiffuse);
    }

    vec3 finalColor = clamp(texturedColor * lighting * globalLightColor, 0.0, 1.35);

    if (renderMode == RENDER_MODE_WATER) {
      float sparkle = clamp(sunSpec * 2.1 + moonSpec * 1.1, 0.0, 1.2);
      float coolSpark = clamp(moonSpec * 0.6, 0.0, 0.6);
      finalColor = clamp(finalColor + sparkle * vec3(0.28, 0.28, 0.25) + coolSpark * vec3(0.05, 0.08, 0.16), 0.0, 1.3);
    } else if (renderMode == RENDER_MODE_CLOUD) {
      finalColor = clamp(mix(finalColor, vec3(1.0), 0.12), 0.0, 1.15);
    }

    if (emissiveStrength > 0.0) {
      finalColor = clamp(finalColor + texturedColor * emissiveStrength, 0.0, 1.35);
    }

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), terrainAlpha);
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
const ambientLightColorUniform = gl.getUniformLocation(program, 'ambientLightColor');
const sunLightDirectionUniform = gl.getUniformLocation(program, 'sunLightDirection');
const sunLightColorUniform = gl.getUniformLocation(program, 'sunLightColor');
const moonLightDirectionUniform = gl.getUniformLocation(program, 'moonLightDirection');
const moonLightColorUniform = gl.getUniformLocation(program, 'moonLightColor');
const viewPositionUniform = gl.getUniformLocation(program, 'viewPosition');
const sunSpecularStrengthUniform = gl.getUniformLocation(program, 'sunSpecularStrength');
const moonSpecularStrengthUniform = gl.getUniformLocation(program, 'moonSpecularStrength');
const specularPowerUniform = gl.getUniformLocation(program, 'specularPower');
const surfaceSpecularStrengthUniform = gl.getUniformLocation(program, 'surfaceSpecularStrength');
const emissiveStrengthUniform = gl.getUniformLocation(program, 'emissiveStrength');
const terrainFlatShadingUniform = gl.getUniformLocation(program, 'terrainFlatShading');
const terrainFlatLightColorUniform = gl.getUniformLocation(program, 'terrainFlatLightColor');
const uniformLocations = {
  renderMode: gl.getUniformLocation(program, 'renderMode'),
};
const patternTimeUniform = gl.getUniformLocation(program, 'patternTime');
const waterTimeUniform = gl.getUniformLocation(program, 'waterTime');
const waterSurfaceLevelUniform = gl.getUniformLocation(program, 'waterSurfaceLevel');
const waterPrimaryWaveFrequencyUniform = gl.getUniformLocation(
  program,
  'waterPrimaryWaveFrequency',
);
const waterSecondaryWaveFrequencyUniform = gl.getUniformLocation(
  program,
  'waterSecondaryWaveFrequency',
);
const waterPrimaryWaveSpeedUniform = gl.getUniformLocation(program, 'waterPrimaryWaveSpeed');
const waterSecondaryWaveSpeedUniform = gl.getUniformLocation(program, 'waterSecondaryWaveSpeed');
const waterPrimaryAmplitudeUniform = gl.getUniformLocation(program, 'waterPrimaryAmplitude');
const waterSecondaryAmplitudeUniform = gl.getUniformLocation(program, 'waterSecondaryAmplitude');
const waterDeepColorUniform = gl.getUniformLocation(program, 'waterDeepColor');
const waterShallowColorUniform = gl.getUniformLocation(program, 'waterShallowColor');
const waterFoamColorUniform = gl.getUniformLocation(program, 'waterFoamColor');
const waterColorQuantizeStepUniform = gl.getUniformLocation(program, 'waterColorQuantizeStep');
const waterSwellCountUniform = gl.getUniformLocation(program, 'waterSwellCount');
const waterSwellOriginsUniform = gl.getUniformLocation(program, 'waterSwellOrigins[0]');
const waterSwellParamsUniform = gl.getUniformLocation(program, 'waterSwellParams[0]');
const waterSwellStateUniform = gl.getUniformLocation(program, 'waterSwellState[0]');

const renderModes = {
  terrain: 0,
  water: 1,
  wind: 2,
  cloud: 3,
  celestial: 4,
};

const skyboxVertexSource = `
  attribute vec3 position;
  uniform mat4 viewProjection;
  varying vec3 vDirection;

  void main() {
    vDirection = position;
    vec4 clip = viewProjection * vec4(position, 1.0);
    gl_Position = vec4(clip.xy, clip.w, clip.w);
  }
`;

const skyboxFragmentSource = `
  precision mediump float;
  varying vec3 vDirection;
  uniform vec3 skyTopColor;
  uniform vec3 skyMiddleColor;
  uniform vec3 skyBottomColor;

  vec3 sampleGradient(float t) {
    float lowerBlend = smoothstep(0.0, 0.5, t);
    float upperBlend = smoothstep(0.5, 1.0, t);
    vec3 midColor = mix(skyBottomColor, skyMiddleColor, lowerBlend);
    return mix(midColor, skyTopColor, upperBlend);
  }

  void main() {
    vec3 direction = normalize(vDirection);
    float t = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = sampleGradient(t);
    gl_FragColor = vec4(color, 1.0);
  }
`;

try {
  const skyboxVertexShader = createShader(gl.VERTEX_SHADER, skyboxVertexSource);
  const skyboxFragmentShader = createShader(gl.FRAGMENT_SHADER, skyboxFragmentSource);
  skyboxProgram = gl.createProgram();
  if (!skyboxProgram) {
    throw new Error('No se pudo crear el programa del skybox');
  }
  gl.attachShader(skyboxProgram, skyboxVertexShader);
  gl.attachShader(skyboxProgram, skyboxFragmentShader);
  gl.linkProgram(skyboxProgram);
  if (!gl.getProgramParameter(skyboxProgram, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(skyboxProgram);
    throw new Error('Error enlazando el programa del skybox: ' + info);
  }
  skyboxPositionAttribute = gl.getAttribLocation(skyboxProgram, 'position');
  skyboxViewProjectionUniform = gl.getUniformLocation(skyboxProgram, 'viewProjection');
  skyboxTopColorUniform = gl.getUniformLocation(skyboxProgram, 'skyTopColor');
  skyboxMiddleColorUniform = gl.getUniformLocation(skyboxProgram, 'skyMiddleColor');
  skyboxBottomColorUniform = gl.getUniformLocation(skyboxProgram, 'skyBottomColor');

  const skyboxVertices = new Float32Array([
    -1, -1, -1,
    1, -1, -1,
    -1, 1, -1,
    -1, 1, -1,
    1, -1, -1,
    1, 1, -1,

    -1, -1, 1,
    -1, 1, 1,
    1, -1, 1,
    -1, 1, 1,
    1, 1, 1,
    1, -1, 1,

    -1, -1, -1,
    -1, 1, -1,
    -1, -1, 1,
    -1, -1, 1,
    -1, 1, -1,
    -1, 1, 1,

    1, -1, -1,
    1, -1, 1,
    1, 1, -1,
    1, -1, 1,
    1, 1, 1,
    1, 1, -1,

    -1, -1, -1,
    -1, -1, 1,
    1, -1, -1,
    -1, -1, 1,
    1, -1, 1,
    1, -1, -1,

    -1, 1, -1,
    1, 1, -1,
    -1, 1, 1,
    -1, 1, 1,
    1, 1, -1,
    1, 1, 1,
  ]);

  skyboxBuffer = gl.createBuffer();
  if (!skyboxBuffer) {
    throw new Error('No se pudo crear el buffer del skybox');
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, skyboxVertices, gl.STATIC_DRAW);
  skyboxVertexCount = skyboxVertices.length / 3;
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
} catch (error) {
  recordRuntimeIssue('warning', 'skybox', error);
  skyboxProgram = null;
  skyboxBuffer = null;
  skyboxVertexCount = 0;
}

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
const sandFlatColor = [0.93, 0.86, 0.7];
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
const waterSurfaceLevel = 19;

const volumetricEngineFactory =
  typeof runtimeGlobal.createVolumetricMassEngine === 'function'
    ? runtimeGlobal.createVolumetricMassEngine
    : null;

if (volumetricEngineFactory) {
  try {
    volumetricEngine = volumetricEngineFactory({
      tileSize: blockSize,
      baseplateSize,
      minY: 0,
      maxY: maxTerrainHeight,
      waterLevel: waterSurfaceLevel,
    });
    runtimeGlobal.__ARRECIFE_VOLUME_ENGINE__ = volumetricEngine;
    runtimeGlobal.__arrecifeVolumeEngine = volumetricEngine;
    if (typeof window !== 'undefined') {
      window.__ARRECIFE_VOLUME_ENGINE__ = volumetricEngine;
      window.__arrecifeVolumeEngine = volumetricEngine;
    }
  } catch (error) {
    volumetricEngine = null;
    pendingRuntimeIssueQueue.push({
      severity: 'warning',
      context: 'volumetric-engine',
      error,
    });
  }
} else {
  pendingRuntimeIssueQueue.push({
    severity: 'warning',
    context: 'volumetric-engine',
    error: new Error('createVolumetricMassEngine no disponible'),
  });
}
const waterAlpha = 0.62;
const waterDeepColor = [0.06, 0.32, 0.66];
const waterShallowColor = [0.28, 0.74, 0.86];
const waterFoamColor = [0.95, 0.97, 1.0];
const waterFoamDepthStart = 0.35;
const waterFoamDepthEnd = 4.5;
const waterColorQuantizeStep = 0.04;
const waterPrimaryWaveFrequency = 0.58;
const waterSecondaryWaveFrequency = 0.32;
const waterPrimaryWaveSpeed = 0.85;
const waterSecondaryWaveSpeed = 0.55;
const waterPrimaryAmplitude = 0.22;
const waterSecondaryAmplitude = 0.12;
const MAX_WATER_SWELLS = 4;
const waterSwellUniformBuffers = {
  origins: new Float32Array(MAX_WATER_SWELLS * 4),
  params: new Float32Array(MAX_WATER_SWELLS * 4),
  state: new Float32Array(MAX_WATER_SWELLS * 4),
};
let waterSwellActiveCount = 0;
let waterSwellState = null;
const waterSwellDiagnostics = {
  resets: 0,
  lastResetSeed: null,
  lastUpdateDurationMs: 0,
  oversubscribedFrames: 0,
  lastError: null,
};

if (uniformLocations.renderMode && typeof gl.uniform1i === 'function') {
  gl.uniform1i(uniformLocations.renderMode, renderModes.terrain);
}
if (waterTimeUniform) {
  gl.uniform1f(waterTimeUniform, 0);
}
if (waterSurfaceLevelUniform) {
  gl.uniform1f(waterSurfaceLevelUniform, waterSurfaceLevel);
}
if (waterPrimaryWaveFrequencyUniform) {
  gl.uniform1f(waterPrimaryWaveFrequencyUniform, waterPrimaryWaveFrequency);
}
if (waterSecondaryWaveFrequencyUniform) {
  gl.uniform1f(waterSecondaryWaveFrequencyUniform, waterSecondaryWaveFrequency);
}
if (waterPrimaryWaveSpeedUniform) {
  gl.uniform1f(waterPrimaryWaveSpeedUniform, waterPrimaryWaveSpeed);
}
if (waterSecondaryWaveSpeedUniform) {
  gl.uniform1f(waterSecondaryWaveSpeedUniform, waterSecondaryWaveSpeed);
}
if (waterPrimaryAmplitudeUniform) {
  gl.uniform1f(waterPrimaryAmplitudeUniform, waterPrimaryAmplitude);
}
if (waterSecondaryAmplitudeUniform) {
  gl.uniform1f(waterSecondaryAmplitudeUniform, waterSecondaryAmplitude);
}
if (waterDeepColorUniform) {
  gl.uniform3f(
    waterDeepColorUniform,
    waterDeepColor[0],
    waterDeepColor[1],
    waterDeepColor[2],
  );
}
if (waterShallowColorUniform) {
  gl.uniform3f(
    waterShallowColorUniform,
    waterShallowColor[0],
    waterShallowColor[1],
    waterShallowColor[2],
  );
}
if (waterFoamColorUniform) {
  gl.uniform3f(
    waterFoamColorUniform,
    waterFoamColor[0],
    waterFoamColor[1],
    waterFoamColor[2],
  );
}
if (waterColorQuantizeStepUniform) {
  gl.uniform1f(waterColorQuantizeStepUniform, waterColorQuantizeStep);
}
if (specularPowerUniform && typeof gl.uniform1f === 'function') {
  gl.uniform1f(specularPowerUniform, 28);
}
if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
  gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
}
if (terrainFlatShadingUniform && typeof gl.uniform1i === 'function') {
  gl.uniform1i(terrainFlatShadingUniform, 0);
}
if (terrainFlatLightColorUniform && typeof gl.uniform3f === 'function') {
  gl.uniform3f(terrainFlatLightColorUniform, 1, 1, 1);
}
if (sunSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
  gl.uniform1f(sunSpecularStrengthUniform, 0.8);
}
if (moonSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
  gl.uniform1f(moonSpecularStrengthUniform, 0.35);
}
if (emissiveStrengthUniform && typeof gl.uniform1f === 'function') {
  gl.uniform1f(emissiveStrengthUniform, 0);
}
if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
  gl.uniform1f(terrainAlphaUniform, 1);
}
const selectionHighlightColor = [0.32, 0.78, 0.94];

const baseplateBuffer = createBuffer(new Float32Array(0));
let baseplateVertexCount = 0;

const waterBuffer = createBuffer(new Float32Array(0));

const blockGridBuffer = createBuffer(new Float32Array(0));
const chunkGridBuffer = createBuffer(new Float32Array(0));
const selectionHighlightBuffer = createBuffer(new Float32Array(0));
const rockBuffer = createBuffer(new Float32Array(0));
const plantBuffer = createBuffer(new Float32Array(0));
const windBuffer = createBuffer(new Float32Array(0));
const cloudBuffer = createBuffer(new Float32Array(0));
const sunBuffer = createBuffer(new Float32Array(0));
const moonBuffer = createBuffer(new Float32Array(0));
const starBuffer = createBuffer(new Float32Array(0));

let blockGridVertexCount = 0;
let chunkGridVertexCount = 0;
let rockVertexCount = 0;
let plantVertexCount = 0;
let selectionHighlightVertexCount = 0;
let waterVertexCount = 0;
let waterVertexData = null;
let waterNeedsUpload = false;
let windVertexCount = 0;
let cloudVertexCount = 0;
let sunVertexCount = 0;
let moonVertexCount = 0;
let starVertexCount = 0;
let sunVertexData = null;
let moonVertexData = null;
const celestialGeometryState = {
  template: null,
  metrics: {
    templateBuilds: 0,
    templateBuildErrors: 0,
    lastTemplateBuildTime: 0,
    lastTemplateErrorTime: 0,
    sunUploads: 0,
    moonUploads: 0,
    uploadErrors: 0,
    lastSunUploadTime: 0,
    lastMoonUploadTime: 0,
    lastUploadErrorTime: 0,
  },
  flags: {
    templateValid: true,
    sunGeometryValid: false,
    moonGeometryValid: false,
  },
};

const WEATHER_WIND_LEAD_TIME = 1.4;
const WEATHER_WIND_DURATION = 2.6;
const MAX_WIND_EFFECTS = 12;
const CLOUD_COUNT = 28;
const CLOUD_ALTITUDE = 150;
const CLOUD_EXTENT_MULTIPLIER = 2.6;
const CLOUD_PUFF_SUBDIVISIONS = 1;
const CELESTIAL_SUBDIVISIONS = 1;
const CELESTIAL_SUN_RADIUS = 42;
const CELESTIAL_MOON_RADIUS = 32;
const STAR_COUNT = 180;
const STAR_FIELD_MARGIN = Math.max(
  MIN_CAMERA_STAR_MARGIN,
  Math.min(CAMERA_STAR_MARGIN, Math.max(MIN_CAMERA_STAR_MARGIN, CAMERA_FAR_PLANE * 0.6)),
);
const STAR_FIELD_RADIUS = Math.max(180, CAMERA_FAR_PLANE - STAR_FIELD_MARGIN);
const STAR_FIELD_RADIUS_JITTER = Math.max(
  30,
  Math.min(120, Math.max(0, STAR_FIELD_RADIUS * 0.35)),
);
const STAR_FIELD_MIN_RADIUS = Math.max(120, STAR_FIELD_RADIUS - STAR_FIELD_RADIUS_JITTER);
const STAR_MIN_SIZE = 3.2;
const STAR_MAX_SIZE = 7.6;
const STAR_BRIGHT_THRESHOLD = 0.74;

runtimeGlobal.STAR_FIELD_MARGIN = STAR_FIELD_MARGIN;
runtimeGlobal.STAR_FIELD_RADIUS = STAR_FIELD_RADIUS;
runtimeGlobal.STAR_FIELD_MIN_RADIUS = STAR_FIELD_MIN_RADIUS;
runtimeGlobal.STAR_FIELD_RADIUS_JITTER = STAR_FIELD_RADIUS_JITTER;

const weatherState = {
  wind: {
    active: [],
    metrics: { active: 0, spawned: 0, culled: 0, geometryRejected: 0 },
    sequence: 0,
  },
  clouds: {
    random: null,
    clouds: [],
    vertexData: new Float32Array(0),
    metrics: {
      count: 0,
      puffs: 0,
      clumps: 0,
      vertexCount: 0,
      lastBuildMs: 0,
      lastRebuildTime: 0,
      lastUploadTime: 0,
      rebuilds: 0,
      lastError: null,
    },
    flags: {
      geometryValid: false,
    },
    needsUpload: true,
  },
};

const starFieldState = {
  random: null,
  stars: [],
  vertexData: new Float32Array(0),
  metrics: {
    count: 0,
    bright: 0,
    dim: 0,
    vertexCount: 0,
    lastBuildMs: 0,
    lastRebuildTime: 0,
    lastUploadTime: 0,
    lastVisibility: 0,
    lastDrawTime: 0,
    rebuilds: 0,
    lastError: null,
    margin: STAR_FIELD_MARGIN,
    radiusMax: STAR_FIELD_RADIUS,
    radiusMin: STAR_FIELD_MIN_RADIUS,
    radiusJitter: STAR_FIELD_RADIUS_JITTER,
    farPlane: CAMERA_FAR_PLANE,
  },
  flags: {
    geometryValid: false,
    clipSafe: STAR_FIELD_RADIUS < CAMERA_FAR_PLANE,
  },
  needsUpload: true,
};

let cloudDriftAccumulator = 0;
let lastWindUpdateTime = 0;

let terrainHeightField = null;
let terrainMaskField = null;
let rockInstances = [];

const defaultSeed = 'coral-dunas';
let currentSeed = defaultSeed;
let simulationTime = 0;
const terrainInfo = {
  seed: currentSeed,
  minHeight: 0,
  maxHeight: 0,
  vertexCount: 0,
  visibleVertices: 0,
  visibleVertexRatio: 0,
  rockCount: 0,
  plantCount: 0,
  featureStats: {
    canyon: 0,
    ravine: 0,
    cliffs: 0,
  },
  surfaceStyle: 'arena clásica',
  colorVariance: 0,
  flags: {
    flatColor: true,
    textured: false,
    lowSpecular: true,
    flatLighting: true,
  },
  flatLighting: {
    color: [1, 1, 1],
    luma: 1,
    daylight: 0,
    moonlight: 0,
  },
};
if (volumetricEngine) {
  terrainInfo.massDiagnostics = volumetricEngine.metrics;
}
let seeThroughTerrain = false;
let selectedBlock = null;
let inverseViewProjectionMatrix = null;

let waterAnimationTime = 0;
let activeRockSelection = null;
let rockInfoPointerHandler = null;
let rockInfoKeyHandler = null;
let ignoreNextRockPointerDown = false;
let pendingRockSelection = null;
const pointerCanvasPosition = { x: 0, y: 0 };

const drawStats = {
  terrain: 0,
  water: 0,
  rocks: 0,
  plants: 0,
  wind: 0,
  clouds: 0,
  celestial: 0,
  blockGrid: 0,
  chunkGrid: 0,
  selection: 0,
  total: 0,
};

const plantSpeciesDefinitions = [
  {
    id: 'coral-bosque',
    name: 'Bosque de coral abanico',
    asset: 'Coral.usdz',
    baseColor: [0.32, 0.7, 0.54],
    tipColor: [0.68, 0.92, 0.74],
    baseHeight: 0.6,
    maxHeight: 2.4,
    initialHeight: 0.4,
    baseRadius: 0.18,
    density: 360,
    photosynthesisRate: 0.95,
    growthConsumptionRate: 0.45,
    growthEfficiency: 0.32,
    energyCapacity: 5,
    nightThreshold: 0.35,
    clusterCount: 6,
    clusterRadius: 5,
    clusterSize: [6, 12],
    minMask: 0.22,
  },
  {
    id: 'coral-pradera',
    name: 'Pradera de algas suaves',
    asset: 'coral-piece.zip',
    baseColor: [0.26, 0.8, 0.44],
    tipColor: [0.58, 0.96, 0.62],
    baseHeight: 0.35,
    maxHeight: 1.45,
    initialHeight: 0.25,
    baseRadius: 0.12,
    density: 280,
    photosynthesisRate: 1.2,
    growthConsumptionRate: 0.55,
    growthEfficiency: 0.27,
    energyCapacity: 3.2,
    nightThreshold: 0.4,
    clusterCount: 8,
    clusterRadius: 3.8,
    clusterSize: [8, 16],
    minMask: 0.18,
  },
  {
    id: 'coral-arbusto',
    name: 'Colonia de alga arbustiva',
    asset: 'coral.zip',
    baseColor: [0.3, 0.64, 0.42],
    tipColor: [0.76, 0.94, 0.58],
    baseHeight: 0.5,
    maxHeight: 1.9,
    initialHeight: 0.32,
    baseRadius: 0.14,
    density: 330,
    photosynthesisRate: 0.85,
    growthConsumptionRate: 0.5,
    growthEfficiency: 0.31,
    energyCapacity: 4.2,
    nightThreshold: 0.3,
    clusterCount: 5,
    clusterRadius: 4.6,
    clusterSize: [5, 10],
    minMask: 0.25,
  },
];

function createEmptyPlantMetrics() {
  return {
    count: 0,
    averageHeight: 0,
    averageMass: 0,
    averageEnergy: 0,
    averageCapacity: 0,
    matureCount: 0,
    sproutCount: 0,
    energyReserveRatio: 0,
    energyAbsorbed: 0,
    energyConsumed: 0,
    growthEvents: 0,
  };
}

function computePlantMetrics(instances) {
  const metrics = createEmptyPlantMetrics();
  if (!instances || instances.length === 0) {
    return metrics;
  }

  let totalHeight = 0;
  let totalMass = 0;
  let totalEnergy = 0;
  let totalCapacity = 0;
  let matureCount = 0;
  let sproutCount = 0;
  let validCount = 0;

  for (const plant of instances) {
    if (!plant) {
      continue;
    }
    const species = plant.species ?? plantSimulation.speciesById.get(plant.speciesId);
    if (!species) {
      continue;
    }

    validCount += 1;

    const height = Math.max(0, plant.currentHeight ?? 0);
    totalHeight += height;
    totalMass += computePlantMass(plant);
    const energy = Math.max(0, plant.energy ?? 0);
    totalEnergy += energy;
    const capacity = Math.max(0, species.energyCapacity ?? 0);
    totalCapacity += capacity;

    const matureThreshold = Math.max(0, species.maxHeight * 0.8);
    if (height >= matureThreshold) {
      matureCount += 1;
    } else {
      const baseHeight = species.initialHeight ?? species.baseHeight ?? species.maxHeight * 0.25;
      const sproutThreshold = Math.max(0, baseHeight * 1.1);
      if (height <= sproutThreshold) {
        sproutCount += 1;
      }
    }
  }

  if (validCount === 0) {
    return metrics;
  }

  metrics.count = validCount;
  metrics.averageHeight = totalHeight / validCount;
  metrics.averageMass = totalMass / validCount;
  metrics.averageEnergy = totalEnergy / validCount;
  metrics.averageCapacity = totalCapacity / validCount;
  metrics.matureCount = matureCount;
  metrics.sproutCount = sproutCount;
  metrics.energyReserveRatio = totalCapacity > 0 ? totalEnergy / totalCapacity : 0;

  return metrics;
}

const plantPlanesPerInstance = 2;
const plantVerticesPerPlane = 12;
const plantVerticesPerInstance = plantPlanesPerInstance * plantVerticesPerPlane;
const plantFloatsPerInstance = plantVerticesPerInstance * floatsPerVertex;

const plantSimulation = {
  species: plantSpeciesDefinitions.map((definition) => ({
    ...definition,
  })),
  speciesById: new Map(),
  instances: [],
  geometryDirty: true,
  metrics: createEmptyPlantMetrics(),
};

for (const species of plantSimulation.species) {
  plantSimulation.speciesById.set(species.id, species);
}

if (typeof window !== 'undefined') {
  window.__terrainInfo = terrainInfo;
  window.__selectedSquare = null;
  window.__selectBlockAt = (x, y) => selectBlockAtScreen(x, y);
  window.__clearSelection = () => clearSelection();
  window.__runtimeIssues = runtimeIssues;
  window.__plantSimulation = plantSimulation;
  window.__uiDebug = {
    registry: uiDebugRegistry.map(({ id, name, label }) => ({ id, name, label })),
    refresh() {
      return getUiDebugSnapshotObject(refreshUiDebugSnapshot());
    },
    get state() {
      return {
        highlight: uiDebugState.highlight,
        track: uiDebugState.track,
        snapshot: getUiDebugSnapshotObject(),
      };
    },
    highlight(active) {
      setUiDebugHighlight(active);
      return uiDebugState.highlight;
    },
    track(active) {
      setUiDebugTracking(active);
      return uiDebugState.track;
    },
  };
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

runtimeGlobal.__runtimeIssues = runtimeIssues;
runtimeGlobal.__ARRECIFE_RUNTIME_STATE__ = runtimeState;
runtimeGlobal.__ARRECIFE_LIGHTING__ = lightingDiagnostics;
runtimeGlobal.__ARRECIFE_WATER_SWELLS__ = waterSwellDiagnostics;


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

function scheduleNextWaterSwell(currentTime) {
  if (!waterSwellState) {
    return;
  }
  const random = waterSwellState.random;
  const minInterval = waterSwellState.minInterval ?? 9;
  const maxInterval = waterSwellState.maxInterval ?? 22;
  const interval =
    typeof random === 'function'
      ? randomInRange(random, minInterval, maxInterval)
      : minInterval + Math.random() * (maxInterval - minInterval);
  waterSwellState.nextSpawnTime = currentTime + interval;
}

function scheduleWindGustFromSwell(swell) {
  if (!swell) {
    return;
  }
  const direction = swell.direction || [0, 1];
  const length = Math.hypot(direction[0], direction[1]) || 1;
  const normalizedDir = [direction[0] / length, direction[1] / length];
  const effect = {
    id: ++weatherState.wind.sequence,
    origin: swell.origin ? swell.origin.slice() : [0, 0],
    direction: normalizedDir,
    crestLength: swell.crestLength ?? 6,
    speed: swell.speed ?? 7,
    startTime: swell.startTime ?? waterAnimationTime,
    appearTime: (swell.startTime ?? waterAnimationTime) - WEATHER_WIND_LEAD_TIME,
    lifespan: WEATHER_WIND_DURATION,
    leadDistance: (swell.speed ?? 7) * WEATHER_WIND_LEAD_TIME,
  };
  weatherState.wind.active.push(effect);
  weatherState.wind.metrics.spawned += 1;
}

function resetWaterSwells(seed) {
  const baseSeed = stringToSeed(seed ?? currentSeed);
  const random = createRandomGenerator(baseSeed ^ 0x3f2a9d17);
  const startTime = waterAnimationTime ?? 0;
  const previousResets = waterSwellDiagnostics.resets;
  waterSwellState = {
    active: [],
    random,
    minInterval: 7,
    maxInterval: 16,
    nextSpawnTime: startTime + randomInRange(random, 5, 9),
    metrics: {
      active: 0,
      spawned: 0,
      culled: 0,
      uploads: 0,
      overflowed: 0,
      bufferUtilization: 0,
      pending: 0,
      lastSpawnTime: null,
      lastUpdateTime: 0,
      resets: previousResets + 1,
    },
    flags: {
      buffersDirty: true,
      spawnBacklog: false,
      overCapacity: false,
    },
  };
  waterSwellActiveCount = 0;
  waterSwellUniformBuffers.origins.fill(0);
  waterSwellUniformBuffers.params.fill(0);
  waterSwellUniformBuffers.state.fill(0);
  waterSwellDiagnostics.resets = previousResets + 1;
  waterSwellDiagnostics.lastResetSeed = seed ?? currentSeed;
  waterSwellDiagnostics.oversubscribedFrames = 0;
  waterSwellDiagnostics.lastUpdateDurationMs = 0;
  waterSwellDiagnostics.lastError = null;
  weatherState.wind.active = [];
  weatherState.wind.metrics.active = 0;
  weatherState.wind.metrics.culled = 0;
  weatherState.wind.metrics.spawned = 0;
  weatherState.wind.metrics.geometryRejected = 0;
  weatherState.wind.sequence = 0;
  const initialSwell = spawnWaterSwell(startTime);
  if (!initialSwell) {
    const warning = 'No se pudo generar la marejada inicial';
    waterSwellDiagnostics.lastError = warning;
    recordRuntimeIssue('warning', 'water-swell-inicial', warning);
  }
  scheduleNextWaterSwell(startTime);
  updateWaterSwells(0);
}

function spawnWaterSwell(currentTime) {
  if (!waterSwellState) {
    resetWaterSwells(currentSeed);
  }
  const random = waterSwellState?.random;
  const randomBetween = (min, max) =>
    typeof random === 'function' ? randomInRange(random, min, max) : min + Math.random() * (max - min);

  const metrics = waterSwellState.metrics;
  const flags = waterSwellState.flags;

  const half = baseplateSize / 2;
  const spawnRadius = half + randomBetween(6, 14);
  const angle = randomBetween(0, Math.PI * 2);
  const originX = Math.cos(angle) * spawnRadius;
  const originZ = Math.sin(angle) * spawnRadius;
  const baseDirection = [-originX, -originZ];
  const baseLength = Math.hypot(baseDirection[0], baseDirection[1]) || 1;
  let dirX = baseDirection[0] / baseLength;
  let dirZ = baseDirection[1] / baseLength;
  const jitter = randomBetween(-Math.PI / 6, Math.PI / 6);
  const cosJ = Math.cos(jitter);
  const sinJ = Math.sin(jitter);
  const rotatedX = dirX * cosJ - dirZ * sinJ;
  const rotatedZ = dirX * sinJ + dirZ * cosJ;
  const dirLength = Math.hypot(rotatedX, rotatedZ) || 1;
  const direction = [rotatedX / dirLength, rotatedZ / dirLength];

  if (!Number.isFinite(direction[0]) || !Number.isFinite(direction[1])) {
    const message = 'Dirección de marejada inválida generada';
    waterSwellDiagnostics.lastError = message;
    recordRuntimeIssue('warning', 'water-swell-direccion', message);
    return null;
  }

  const amplitude = randomBetween(0.35, 0.5);
  const crestLength = randomBetween(5, 12);
  const lateralSpread = randomBetween(8, 18);
  const speed = randomBetween(6, 10);
  const decayDistance = randomBetween(18, 36);
  const foamBoost = randomBetween(0.35, 0.65);
  const splashHeight = randomBetween(0.18, 0.32);
  const lifespan =
    (baseplateSize + decayDistance + crestLength + spawnRadius) / Math.max(0.1, speed) + 6;

  const newSwell = {
    origin: [originX, originZ],
    direction,
    amplitude,
    crestLength,
    lateralSpread,
    foamBoost,
    startTime: currentTime,
    speed,
    decayDistance,
    splashHeight,
    lifespan,
  };

  waterSwellState.active.push(newSwell);
  scheduleWindGustFromSwell(newSwell);
  if (metrics) {
    metrics.spawned += 1;
    metrics.lastSpawnTime = currentTime;
    metrics.active = waterSwellState.active.length;
    metrics.pending = Math.max(0, metrics.active - MAX_WATER_SWELLS);
    metrics.bufferUtilization = Math.min(1, metrics.active / MAX_WATER_SWELLS);
  }
  if (flags) {
    flags.buffersDirty = true;
  }
  waterSwellDiagnostics.lastError = null;
  return newSwell;
}

function updateWaterSwells(deltaTime) {
  if (!waterSwellState) {
    return;
  }

  if (!waterSwellState.metrics) {
    waterSwellState.metrics = {
      active: 0,
      spawned: 0,
      culled: 0,
      uploads: 0,
      overflowed: 0,
      bufferUtilization: 0,
      pending: 0,
      lastSpawnTime: null,
      lastUpdateTime: 0,
      resets: waterSwellDiagnostics.resets,
    };
  }
  if (!waterSwellState.flags) {
    waterSwellState.flags = { buffersDirty: true, spawnBacklog: false, overCapacity: false };
  }

  const metrics = waterSwellState.metrics;
  const flags = waterSwellState.flags;
  const now = Number.isFinite(waterAnimationTime) ? waterAnimationTime : 0;
  const dt = Number.isFinite(deltaTime) ? deltaTime : 0;
  if (metrics) {
    metrics.lastUpdateTime = now;
    if (Number.isFinite(dt)) {
      metrics.accumulatedDelta = (metrics.accumulatedDelta ?? 0) + dt;
    }
  }

  if (typeof waterSwellState.nextSpawnTime === 'number') {
    let attempts = 0;
    const maxAttempts = MAX_WATER_SWELLS * 3;
    while (now >= waterSwellState.nextSpawnTime) {
      if (attempts >= maxAttempts) {
        const message = 'Demasiadas marejadas pendientes de generar';
        waterSwellDiagnostics.lastError = message;
        recordRuntimeIssue('warning', 'water-swell-backlog', message);
        flags.spawnBacklog = true;
        break;
      }
      attempts += 1;
      const spawned = spawnWaterSwell(now);
      if (!spawned) {
        const message = 'El generador de marejadas devolvió un valor nulo';
        waterSwellDiagnostics.lastError = message;
        recordRuntimeIssue('warning', 'water-swell-spawn', message);
        break;
      }
      scheduleNextWaterSwell(now);
    }
    flags.spawnBacklog = now >= waterSwellState.nextSpawnTime;
  }

  const filtered = [];
  let culledThisFrame = 0;
  for (const swell of waterSwellState.active) {
    if (!swell) {
      continue;
    }
    const startTime = Number.isFinite(swell.startTime) ? swell.startTime : now;
    const lifespan = Number.isFinite(swell.lifespan) ? swell.lifespan : Number.POSITIVE_INFINITY;
    if (now - startTime > lifespan) {
      culledThisFrame += 1;
      continue;
    }
    filtered.push(swell);
  }

  waterSwellState.active = filtered;
  if (metrics && culledThisFrame > 0) {
    metrics.culled += culledThisFrame;
  }

  const count = Math.min(filtered.length, MAX_WATER_SWELLS);
  const pending = Math.max(0, filtered.length - count);
  const oversubscribed = pending > 0;
  waterSwellActiveCount = count;

  if (metrics) {
    metrics.active = count;
    metrics.pending = pending;
    metrics.bufferUtilization = count / MAX_WATER_SWELLS;
    if (oversubscribed) {
      metrics.overflowed = (metrics.overflowed ?? 0) + 1;
      waterSwellDiagnostics.oversubscribedFrames += 1;
    }
  }

  flags.overCapacity = oversubscribed;

  waterSwellUniformBuffers.origins.fill(0);
  waterSwellUniformBuffers.params.fill(0);
  waterSwellUniformBuffers.state.fill(0);

  const updateStart = getTimestamp();
  for (let i = 0; i < count; i++) {
    const swell = filtered[i];
    const baseIndex = i * 4;
    const origin = swell.origin || [0, 0];
    const dir = normalize2D(swell.direction || [0, 1]);

    waterSwellUniformBuffers.origins[baseIndex] = origin[0];
    waterSwellUniformBuffers.origins[baseIndex + 1] = origin[1];
    waterSwellUniformBuffers.origins[baseIndex + 2] = dir[0];
    waterSwellUniformBuffers.origins[baseIndex + 3] = dir[1];

    waterSwellUniformBuffers.params[baseIndex] = swell.amplitude ?? 0;
    waterSwellUniformBuffers.params[baseIndex + 1] = swell.crestLength ?? 0;
    waterSwellUniformBuffers.params[baseIndex + 2] = swell.lateralSpread ?? 1;
    waterSwellUniformBuffers.params[baseIndex + 3] = swell.foamBoost ?? 0;

    waterSwellUniformBuffers.state[baseIndex] = swell.startTime ?? now;
    waterSwellUniformBuffers.state[baseIndex + 1] = swell.speed ?? 0;
    waterSwellUniformBuffers.state[baseIndex + 2] = swell.decayDistance ?? 0;
    waterSwellUniformBuffers.state[baseIndex + 3] = swell.splashHeight ?? 0;
  }
  const updateEnd = getTimestamp();
  waterSwellDiagnostics.lastUpdateDurationMs = Math.max(0, updateEnd - updateStart);

  if (metrics) {
    metrics.uploads = (metrics.uploads ?? 0) + 1;
  }
  flags.buffersDirty = false;
}

const runtimeTimingDiagnostics =
  runtimeState && typeof runtimeState === 'object'
    ? (runtimeState.timingDiagnostics =
        runtimeState.timingDiagnostics && typeof runtimeState.timingDiagnostics === 'object'
          ? runtimeState.timingDiagnostics
          : {
              getTimestampCalls: 0,
              lastTimestampMs: null,
              flags: {},
            })
    : { getTimestampCalls: 0, lastTimestampMs: null, flags: {} };

const getTimestamp = (() => {
  const timingFlags =
    runtimeTimingDiagnostics && typeof runtimeTimingDiagnostics.flags === 'object'
      ? runtimeTimingDiagnostics.flags
      : (runtimeTimingDiagnostics.flags = {});

  if (typeof runtimeTimingDiagnostics.getTimestamp === 'function') {
    timingFlags.reusedImplementation = true;
    timingFlags.reusedAt = Date.now();
    if (!timingFlags.reuseReported && typeof recordRuntimeIssue === 'function') {
      recordRuntimeIssue(
        'info',
        'runtime-timing',
        'getTimestamp reutilizado tras una recarga del script; se conservan las métricas previas.',
      );
      timingFlags.reuseReported = true;
    }
    return runtimeTimingDiagnostics.getTimestamp;
  }

  const baseImplementation =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? () => performance.now()
      : () => Date.now();

  const instrumentedImplementation = () => {
    const value = baseImplementation();
    runtimeTimingDiagnostics.getTimestampCalls =
      (runtimeTimingDiagnostics.getTimestampCalls ?? 0) + 1;
    runtimeTimingDiagnostics.lastTimestampMs = value;
    return value;
  };

  runtimeTimingDiagnostics.getTimestamp = instrumentedImplementation;
  timingFlags.reusedImplementation = false;
  timingFlags.reusedAt = null;

  return instrumentedImplementation;
})();

function ensureCelestialMeshTemplate() {
  if (celestialGeometryState.template) {
    return celestialGeometryState.template;
  }

  try {
    let topology = createBaseIcosahedron();
    for (let i = 0; i < CELESTIAL_SUBDIVISIONS; i++) {
      topology = subdivideTopology(topology);
    }
    const triangles = [];
    for (const face of topology.faces) {
      triangles.push(topology.vertices[face[0]]);
      triangles.push(topology.vertices[face[1]]);
      triangles.push(topology.vertices[face[2]]);
    }
    celestialGeometryState.template = { triangles };
    celestialGeometryState.metrics.templateBuilds += 1;
    celestialGeometryState.metrics.lastTemplateBuildTime = getTimestamp();
    celestialGeometryState.flags.templateValid = true;
  } catch (error) {
    celestialGeometryState.metrics.templateBuildErrors += 1;
    celestialGeometryState.metrics.lastTemplateErrorTime = getTimestamp();
    celestialGeometryState.flags.templateValid = false;
    recordRuntimeIssue('error', 'celestial-template', error);
    celestialGeometryState.template = null;
    return null;
  }

  return celestialGeometryState.template;
}

function fillCelestialVertexData(target, radius, position, color) {
  const template = ensureCelestialMeshTemplate();
  if (!template || !template.triangles || template.triangles.length === 0) {
    return new Float32Array(0);
  }
  const requiredLength = template.triangles.length * floatsPerVertex;
  let data = target;
  if (!data || data.length !== requiredLength) {
    data = new Float32Array(requiredLength);
  }
  let offset = 0;
  for (const vertex of template.triangles) {
    offset = pushVertex(
      data,
      offset,
      position[0] + vertex[0] * radius,
      position[1] + vertex[1] * radius,
      position[2] + vertex[2] * radius,
      color,
    );
  }
  return data;
}

function updateCelestialGeometry() {
  const template = ensureCelestialMeshTemplate();
  if (!template) {
    celestialGeometryState.flags.sunGeometryValid = false;
    celestialGeometryState.flags.moonGeometryValid = false;
    return;
  }

  try {
    const sunColor = [
      clamp01(dayNightCycleState.sunLightColor[0] + 0.25),
      clamp01(dayNightCycleState.sunLightColor[1] + 0.18),
      clamp01(dayNightCycleState.sunLightColor[2] + 0.12),
    ];
    sunVertexData = fillCelestialVertexData(
      sunVertexData,
      CELESTIAL_SUN_RADIUS,
      dayNightCycleState.sunPosition,
      sunColor,
    );
    sunVertexCount = sunVertexData.length / floatsPerVertex;
    if (sunVertexCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, sunBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sunVertexData, gl.DYNAMIC_DRAW);
      celestialGeometryState.metrics.sunUploads += 1;
      celestialGeometryState.metrics.lastSunUploadTime = getTimestamp();
      celestialGeometryState.flags.sunGeometryValid = true;
    } else {
      celestialGeometryState.flags.sunGeometryValid = false;
    }
  } catch (error) {
    recordRuntimeIssue('warning', 'sun-geometry', error);
    sunVertexCount = 0;
    celestialGeometryState.metrics.uploadErrors += 1;
    celestialGeometryState.metrics.lastUploadErrorTime = getTimestamp();
    celestialGeometryState.flags.sunGeometryValid = false;
  }

  try {
    const moonColor = [
      clamp01(dayNightCycleState.moonLightColor[0] + 0.08),
      clamp01(dayNightCycleState.moonLightColor[1] + 0.1),
      clamp01(dayNightCycleState.moonLightColor[2] + 0.12),
    ];
    moonVertexData = fillCelestialVertexData(
      moonVertexData,
      CELESTIAL_MOON_RADIUS,
      dayNightCycleState.moonPosition,
      moonColor,
    );
    moonVertexCount = moonVertexData.length / floatsPerVertex;
    if (moonVertexCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, moonBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, moonVertexData, gl.DYNAMIC_DRAW);
      celestialGeometryState.metrics.moonUploads += 1;
      celestialGeometryState.metrics.lastMoonUploadTime = getTimestamp();
      celestialGeometryState.flags.moonGeometryValid = true;
    } else {
      celestialGeometryState.flags.moonGeometryValid = false;
    }
  } catch (error) {
    recordRuntimeIssue('warning', 'moon-geometry', error);
    moonVertexCount = 0;
    celestialGeometryState.metrics.uploadErrors += 1;
    celestialGeometryState.metrics.lastUploadErrorTime = getTimestamp();
    celestialGeometryState.flags.moonGeometryValid = false;
  }
}

function updateWindEffects(deltaTime) {
  void deltaTime;
  const now = waterAnimationTime;
  const active = [];
  for (const effect of weatherState.wind.active) {
    const expireTime = (effect.appearTime ?? effect.startTime) + (effect.lifespan ?? WEATHER_WIND_DURATION);
    if (now <= expireTime + 0.1) {
      active.push(effect);
    } else {
      weatherState.wind.metrics.culled += 1;
    }
  }

  if (active.length > MAX_WIND_EFFECTS) {
    const overflow = active.length - MAX_WIND_EFFECTS;
    active.splice(0, overflow);
    weatherState.wind.metrics.culled += overflow;
  }

  weatherState.wind.active = active;
  weatherState.wind.metrics.active = active.length;
  lastWindUpdateTime = now;
}

function initializeCloudField(seedString) {
  const baseSeed = stringToSeed(`${seedString ?? currentSeed}-clouds`);
  const random = createRandomGenerator(baseSeed);
  const half = (baseplateSize / 2) * CLOUD_EXTENT_MULTIPLIER;
  const clouds = [];
  let totalPuffs = 0;
  let totalClumps = 0;

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const x = randomInRange(random, -half, half);
    const z = randomInRange(random, -half, half);
    const baseAltitude = CLOUD_ALTITUDE + randomInRange(random, -4, 4);
    const radius = randomInRange(random, 12, 26);
    const depth = randomInRange(random, radius * 0.45, radius * 0.75);
    const thickness = randomInRange(random, 6, 12);
    const driftAngle = randomInRange(random, 0, Math.PI * 2);
    const driftSpeed = randomInRange(random, 0.35, 0.95);
    const clusterCount = 2 + Math.floor(randomInRange(random, 0, 3.999));
    const clusters = [];
    for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex++) {
      const spread = randomInRange(random, radius * 0.2, radius * 0.55);
      const angle = randomInRange(random, 0, Math.PI * 2);
      const distance = randomInRange(random, radius * 0.15, radius * 0.75);
      clusters.push({
        center: [
          Math.cos(angle) * distance,
          randomInRange(random, -thickness * 0.45, thickness * 0.45),
          Math.sin(angle) * distance,
        ],
        spread,
        puffCount: 2 + Math.floor(randomInRange(random, 1, 3.999)),
      });
    }

    const puffs = [];
    for (const cluster of clusters) {
      const perCluster = Math.max(2, cluster.puffCount);
      for (let j = 0; j < perCluster; j++) {
        const jitterAngle = randomInRange(random, 0, Math.PI * 2);
        const jitterDistance = randomInRange(random, 0, cluster.spread);
        const jitterHeight = randomInRange(random, -thickness * 0.25, thickness * 0.35);
        puffs.push({
          offset: [
            cluster.center[0] + Math.cos(jitterAngle) * jitterDistance,
            cluster.center[1] + jitterHeight,
            cluster.center[2] + Math.sin(jitterAngle) * jitterDistance,
          ],
          radius: randomInRange(random, radius * 0.18, radius * 0.42),
          brightness: clamp(randomInRange(random, 0.72, 1.08), 0.6, 1.2),
          softness: randomInRange(random, 0.15, 0.32),
        });
      }
    }

    if (puffs.length === 0) {
      puffs.push({
        offset: [0, 0, 0],
        radius: radius * 0.3,
        brightness: 0.95,
        softness: 0.22,
      });
    }

    totalPuffs += puffs.length;
    totalClumps += clusters.length;

    const color = [
      clamp(randomInRange(random, 0.9, 0.98), 0, 1),
      clamp(randomInRange(random, 0.92, 0.99), 0, 1),
      clamp(randomInRange(random, 0.94, 1), 0, 1),
    ];

    clouds.push({
      center: [x, baseAltitude, z],
      baseAltitude,
      radius,
      depth,
      thickness,
      driftDirection: [Math.cos(driftAngle), Math.sin(driftAngle)],
      driftSpeed,
      wobble: randomInRange(random, 0.35, 0.8),
      phase: randomInRange(random, 0, Math.PI * 2),
      color,
      rotation: randomInRange(random, 0, Math.PI * 2),
      puffs,
      clumpCount: clusters.length,
      softness: randomInRange(random, 0.2, 0.45),
    });
  }

  weatherState.clouds.random = random;
  weatherState.clouds.clouds = clouds;
  weatherState.clouds.vertexData = new Float32Array(0);
  weatherState.clouds.needsUpload = true;
  weatherState.clouds.metrics.count = clouds.length;
  weatherState.clouds.metrics.puffs = totalPuffs;
  weatherState.clouds.metrics.clumps = totalClumps;
  weatherState.clouds.metrics.vertexCount = 0;
  weatherState.clouds.metrics.lastError = null;
  weatherState.clouds.metrics.lastBuildMs = 0;
  weatherState.clouds.metrics.lastRebuildTime = 0;
  weatherState.clouds.metrics.lastUploadTime = 0;
  weatherState.clouds.metrics.rebuilds = 0;
  weatherState.clouds.flags.geometryValid = false;
  cloudVertexCount = 0;
}

function initializeStarField(seedString) {
  const baseSeed = stringToSeed(`${seedString ?? currentSeed}-stars`);
  const random = createRandomGenerator(baseSeed);
  const stars = [];
  let bright = 0;
  let dim = 0;

  for (let i = 0; i < STAR_COUNT; i++) {
    const polar = randomInRange(random, 0.05, Math.PI * 0.48);
    const azimuth = randomInRange(random, 0, Math.PI * 2);
    const sinPolar = Math.sin(polar);
    const direction = [
      sinPolar * Math.cos(azimuth),
      Math.cos(polar),
      sinPolar * Math.sin(azimuth),
    ];
    const radius = randomInRange(random, STAR_FIELD_MIN_RADIUS, STAR_FIELD_RADIUS);
    const position = [
      direction[0] * radius,
      direction[1] * radius,
      direction[2] * radius,
    ];
    const size = randomInRange(random, STAR_MIN_SIZE, STAR_MAX_SIZE);
    const brightness = clamp(randomInRange(random, 0.55, 1.12), 0.4, 1.25);
    if (brightness >= STAR_BRIGHT_THRESHOLD) {
      bright += 1;
    } else {
      dim += 1;
    }
    stars.push({
      position,
      direction,
      size,
      brightness,
      twinklePhase: randomInRange(random, 0, Math.PI * 2),
    });
  }

  starFieldState.random = random;
  starFieldState.stars = stars;
  starFieldState.vertexData = new Float32Array(0);
  starFieldState.metrics.count = stars.length;
  starFieldState.metrics.bright = bright;
  starFieldState.metrics.dim = dim;
  starFieldState.metrics.vertexCount = 0;
  starFieldState.metrics.lastError = null;
  starFieldState.metrics.lastBuildMs = 0;
  starFieldState.metrics.lastRebuildTime = 0;
  starFieldState.metrics.lastUploadTime = 0;
  starFieldState.metrics.lastVisibility = 0;
  starFieldState.metrics.lastDrawTime = 0;
  starFieldState.metrics.rebuilds = 0;
  starFieldState.metrics.margin = STAR_FIELD_MARGIN;
  starFieldState.metrics.radiusMax = STAR_FIELD_RADIUS;
  starFieldState.metrics.radiusMin = STAR_FIELD_MIN_RADIUS;
  starFieldState.metrics.radiusJitter = STAR_FIELD_RADIUS_JITTER;
  starFieldState.metrics.farPlane = CAMERA_FAR_PLANE;
  starFieldState.flags.geometryValid = false;
  starFieldState.flags.clipSafe = STAR_FIELD_RADIUS + 1 <= CAMERA_FAR_PLANE;
  starFieldState.needsUpload = true;
  starVertexCount = 0;
}

function updateCloudField(deltaTime) {
  const field = weatherState.clouds;
  const clouds = field.clouds;
  if (!clouds || clouds.length === 0) {
    return;
  }

  const dt = Number.isFinite(deltaTime) ? deltaTime : 0;
  cloudDriftAccumulator += dt;
  const half = (baseplateSize / 2) * CLOUD_EXTENT_MULTIPLIER;
  const wobbleTime = waterAnimationTime * 0.12;

  for (const cloud of clouds) {
    if (!cloud || !cloud.center) {
      continue;
    }
    const speed = cloud.driftSpeed ?? 0;
    const dir = cloud.driftDirection ?? [0, 0];
    cloud.center[0] += dir[0] * speed * dt;
    cloud.center[2] += dir[1] * speed * dt;

    if (cloud.center[0] < -half) {
      cloud.center[0] += half * 2;
    } else if (cloud.center[0] > half) {
      cloud.center[0] -= half * 2;
    }
    if (cloud.center[2] < -half) {
      cloud.center[2] += half * 2;
    } else if (cloud.center[2] > half) {
      cloud.center[2] -= half * 2;
    }

    const wobble = cloud.wobble ?? 0;
    const baseAltitude = cloud.baseAltitude ?? CLOUD_ALTITUDE;
    const phase = cloud.phase ?? 0;
    cloud.center[1] = baseAltitude + Math.sin(phase + wobbleTime) * wobble * 6;
  }

  if (cloudDriftAccumulator >= 0.18) {
    field.needsUpload = true;
    cloudDriftAccumulator = 0;
  }
}

function getCloudPuffTemplate(subdivisions) {
  if (!cloudPuffTopologyCache.has(subdivisions)) {
    let topology = createBaseIcosahedron();
    for (let i = 0; i < subdivisions; i++) {
      topology = subdivideTopology(topology);
    }
    cloudPuffTopologyCache.set(subdivisions, topology);
  }
  const template = cloudPuffTopologyCache.get(subdivisions);
  if (!template) {
    return null;
  }
  return {
    vertices: template.vertices.map((vertex) => vertex.slice()),
    faces: template.faces,
  };
}

function computeCloudPuffColor(cloud, puff, normal) {
  const baseColor = Array.isArray(cloud?.color)
    ? cloud.color
    : [0.92, 0.95, 0.99];
  const brightness = clamp(puff?.brightness ?? 1, 0.5, 1.35);
  const softness = clamp01(puff?.softness ?? cloud?.softness ?? 0.25);
  const daylight = clamp01(dayNightCycleState.daylight ?? 0);
  const moonlight = clamp01(dayNightCycleState.moonlightIntensity ?? 0);
  const vertical = clamp(normal?.[1] ?? 0, -1, 1);
  const highlight = clamp01(0.6 + vertical * 0.4);
  const tone = brightness * (0.82 + highlight * 0.18);
  const warmTint = daylight * 0.18;
  const coolTint = (1 - daylight) * 0.12 + moonlight * 0.2;
  const scatter = clamp01(0.55 + softness * 0.45);

  const r = clamp01(baseColor[0] * tone + warmTint * highlight + scatter * 0.02);
  const g = clamp01(baseColor[1] * tone + warmTint * 0.6 * highlight + scatter * 0.018);
  const b = clamp01(baseColor[2] * tone + coolTint * (0.65 + vertical * 0.15));
  const shading = clamp01(0.78 + vertical * 0.22);

  return [
    clamp01(r * shading),
    clamp01(g * shading),
    clamp01(b * (0.9 + softness * 0.08)),
  ];
}

function rebuildCloudGeometry() {
  const field = weatherState.clouds;
  const clouds = field.clouds;
  const start = getTimestamp();
  field.metrics.lastError = null;
  field.flags.geometryValid = false;

  if (!clouds || clouds.length === 0) {
    field.vertexData = new Float32Array(0);
    cloudVertexCount = 0;
    field.metrics.count = 0;
    field.metrics.puffs = 0;
    field.metrics.clumps = 0;
    field.metrics.vertexCount = 0;
    field.metrics.rebuilds = (field.metrics.rebuilds ?? 0) + 1;
    field.metrics.lastRebuildTime = getTimestamp();
    field.metrics.lastBuildMs = Math.max(0, field.metrics.lastRebuildTime - start);
    try {
      gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, field.vertexData, gl.DYNAMIC_DRAW);
      field.metrics.lastUploadTime = getTimestamp();
      field.flags.geometryValid = true;
    } catch (error) {
      field.metrics.lastError = error?.message || String(error);
      recordRuntimeIssue('warning', 'cloud-buffer', error);
    }
    field.needsUpload = false;
    return;
  }

  const template = getCloudPuffTemplate(CLOUD_PUFF_SUBDIVISIONS);
  if (!template) {
    recordRuntimeIssue('error', 'cloud-geometry', 'Plantilla de nubes no disponible.');
    field.vertexData = new Float32Array(0);
    field.metrics.lastError = 'Plantilla no disponible';
    field.metrics.count = clouds.length;
    field.metrics.vertexCount = 0;
    field.metrics.lastRebuildTime = getTimestamp();
    field.metrics.lastBuildMs = Math.max(0, field.metrics.lastRebuildTime - start);
    field.needsUpload = false;
    cloudVertexCount = 0;
    return;
  }

  const faces = template.faces;
  const vertices = template.vertices;
  let totalVertices = 0;
  let puffTotal = 0;
  let clumpTotal = 0;

  for (const cloud of clouds) {
    const puffs = Array.isArray(cloud?.puffs) ? cloud.puffs : [];
    puffTotal += puffs.length;
    clumpTotal += cloud?.clumpCount ?? 0;
    totalVertices += puffs.length * faces.length * 3;
  }

  if (totalVertices <= 0) {
    field.vertexData = new Float32Array(0);
    field.metrics.count = clouds.length;
    field.metrics.puffs = puffTotal;
    field.metrics.clumps = clumpTotal;
    field.metrics.vertexCount = 0;
    field.metrics.lastRebuildTime = getTimestamp();
    field.metrics.lastBuildMs = Math.max(0, field.metrics.lastRebuildTime - start);
    field.needsUpload = false;
    cloudVertexCount = 0;
    field.metrics.rebuilds = (field.metrics.rebuilds ?? 0) + 1;
    field.flags.geometryValid = true;
    return;
  }

  const vertexData = new Float32Array(totalVertices * floatsPerVertex);
  let offset = 0;

  for (const cloud of clouds) {
    if (!cloud || !cloud.center) {
      continue;
    }
    const center = cloud.center;
    const puffs = Array.isArray(cloud.puffs) ? cloud.puffs : [];
    for (const puff of puffs) {
      const offsetVector = Array.isArray(puff?.offset)
        ? puff.offset
        : [0, 0, 0];
      const base = [
        center[0] + (offsetVector[0] ?? 0),
        center[1] + (offsetVector[1] ?? 0),
        center[2] + (offsetVector[2] ?? 0),
      ];
      const radius = Math.max(1.2, puff?.radius ?? Math.max(2.5, cloud?.radius ?? 8) * 0.25);

      for (let faceIndex = 0; faceIndex < faces.length; faceIndex++) {
        const face = faces[faceIndex];
        for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
          const templateIndex = face[vertexIndex];
          const templateVertex = vertices[templateIndex];
          const normal = normalize(templateVertex);
          const worldPosition = [
            base[0] + templateVertex[0] * radius,
            base[1] + templateVertex[1] * radius,
            base[2] + templateVertex[2] * radius,
          ];
          const color = computeCloudPuffColor(cloud, puff, normal);
          offset = pushVertex(
            vertexData,
            offset,
            worldPosition[0],
            worldPosition[1],
            worldPosition[2],
            color,
          );
        }
      }
    }
  }

  cloudVertexCount = vertexData.length / floatsPerVertex;
  field.vertexData = vertexData;
  field.needsUpload = false;
  field.metrics.count = clouds.length;
  field.metrics.puffs = puffTotal;
  field.metrics.clumps = clumpTotal;
  field.metrics.vertexCount = cloudVertexCount;
  field.metrics.rebuilds = (field.metrics.rebuilds ?? 0) + 1;
  field.metrics.lastRebuildTime = getTimestamp();
  field.metrics.lastBuildMs = Math.max(0, field.metrics.lastRebuildTime - start);

  try {
    gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);
    field.metrics.lastUploadTime = getTimestamp();
    field.flags.geometryValid = true;
  } catch (error) {
    field.metrics.lastError = error?.message || String(error);
    recordRuntimeIssue('warning', 'cloud-buffer', error);
    field.flags.geometryValid = false;
  }
}

function rebuildStarFieldGeometry() {
  const state = starFieldState;
  const stars = state.stars;
  const start = getTimestamp();
  state.metrics.lastError = null;
  state.flags.geometryValid = false;
  state.metrics.margin = STAR_FIELD_MARGIN;
  state.metrics.radiusMax = STAR_FIELD_RADIUS;
  state.metrics.radiusMin = STAR_FIELD_MIN_RADIUS;
  state.metrics.radiusJitter = STAR_FIELD_RADIUS_JITTER;
  state.metrics.farPlane = CAMERA_FAR_PLANE;
  state.flags.clipSafe = STAR_FIELD_RADIUS + 1 <= CAMERA_FAR_PLANE;

  if (!stars || stars.length === 0) {
    state.vertexData = new Float32Array(0);
    starVertexCount = 0;
    state.metrics.count = 0;
    state.metrics.bright = 0;
    state.metrics.dim = 0;
    state.metrics.vertexCount = 0;
    state.metrics.rebuilds = (state.metrics.rebuilds ?? 0) + 1;
    state.metrics.lastRebuildTime = getTimestamp();
    state.metrics.lastBuildMs = Math.max(0, state.metrics.lastRebuildTime - start);
    try {
      gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, state.vertexData, gl.DYNAMIC_DRAW);
      state.metrics.lastUploadTime = getTimestamp();
      state.flags.geometryValid = true;
    } catch (error) {
      state.metrics.lastError = error?.message || String(error);
      recordRuntimeIssue('warning', 'star-buffer', error);
    }
    state.needsUpload = false;
    return;
  }

  const vertexData = new Float32Array(stars.length * 6 * floatsPerVertex);
  let offset = 0;
  let bright = 0;
  let dim = 0;

  for (const star of stars) {
    const direction = normalize(Array.isArray(star?.direction) ? star.direction : star?.position ?? [0, 1, 0]);
    const position = Array.isArray(star?.position)
      ? star.position
      : [direction[0] * STAR_FIELD_RADIUS, direction[1] * STAR_FIELD_RADIUS, direction[2] * STAR_FIELD_RADIUS];
    let right = cross(direction, [0, 1, 0]);
    if (Math.hypot(right[0], right[1], right[2]) < 0.001) {
      right = cross(direction, [1, 0, 0]);
    }
    const rightLength = Math.hypot(right[0], right[1], right[2]) || 1;
    right = [right[0] / rightLength, right[1] / rightLength, right[2] / rightLength];
    let up = cross(right, direction);
    const upLength = Math.hypot(up[0], up[1], up[2]);
    if (upLength < 0.001) {
      up = [0, 1, 0];
    } else {
      up = [up[0] / upLength, up[1] / upLength, up[2] / upLength];
    }
    const halfSize = Math.max(STAR_MIN_SIZE * 0.35, (star?.size ?? STAR_MIN_SIZE) * 0.5);
    const rightVec = scale(right, halfSize);
    const upVec = scale(up, halfSize);

    const brightness = clamp(star?.brightness ?? 0.8, 0.3, 1.4);
    if (brightness >= STAR_BRIGHT_THRESHOLD) {
      bright += 1;
    } else {
      dim += 1;
    }
    const shimmer = Math.sin(star?.twinklePhase ?? 0) * 0.05;
    const baseColor = [
      clamp01(0.78 + brightness * 0.22 + shimmer * 0.3),
      clamp01(0.78 + brightness * 0.18 + shimmer * 0.2),
      clamp01(0.82 + brightness * 0.28 + shimmer * 0.4),
    ];

    const topRight = add(add(position, rightVec), upVec);
    const topLeft = add(add(position, scale(rightVec, -1)), upVec);
    const bottomRight = add(add(position, rightVec), scale(upVec, -1));
    const bottomLeft = add(add(position, scale(rightVec, -1)), scale(upVec, -1));

    offset = pushVertex(vertexData, offset, topRight[0], topRight[1], topRight[2], baseColor);
    offset = pushVertex(vertexData, offset, topLeft[0], topLeft[1], topLeft[2], baseColor);
    offset = pushVertex(vertexData, offset, bottomRight[0], bottomRight[1], bottomRight[2], baseColor);
    offset = pushVertex(vertexData, offset, topLeft[0], topLeft[1], topLeft[2], baseColor);
    offset = pushVertex(vertexData, offset, bottomLeft[0], bottomLeft[1], bottomLeft[2], baseColor);
    offset = pushVertex(vertexData, offset, bottomRight[0], bottomRight[1], bottomRight[2], baseColor);
  }

  starVertexCount = vertexData.length / floatsPerVertex;
  state.vertexData = vertexData;
  state.metrics.vertexCount = starVertexCount;
  state.metrics.rebuilds = (state.metrics.rebuilds ?? 0) + 1;
  state.metrics.lastRebuildTime = getTimestamp();
  state.metrics.lastBuildMs = Math.max(0, state.metrics.lastRebuildTime - start);
  state.metrics.count = stars.length;
  state.metrics.bright = bright;
  state.metrics.dim = dim;

  try {
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);
    state.metrics.lastUploadTime = getTimestamp();
    state.flags.geometryValid = true;
  } catch (error) {
    state.metrics.lastError = error?.message || String(error);
    recordRuntimeIssue('warning', 'star-buffer', error);
    state.flags.geometryValid = false;
  }

  state.needsUpload = false;
}

function composeWindStreakGeometry(effect, now) {
  if (!effect) {
    return null;
  }
  const appearTime = effect.appearTime ?? effect.startTime ?? now;
  const lifespan = effect.lifespan ?? WEATHER_WIND_DURATION;
  const progress = (now - appearTime) / lifespan;
  if (progress <= 0 || progress >= 1.05) {
    return null;
  }

  const fadeIn = clamp01((progress - 0.02) / 0.18);
  const fadeOut = clamp01(1 - (progress - 0.6) / 0.4);
  const alpha = clamp01(fadeIn * fadeOut);
  if (alpha <= 0.001) {
    return null;
  }

  const direction = effect.direction ?? [0, 1];
  const normalizedDir = normalize2D(direction);
  const perp = normalize2D([-normalizedDir[1], normalizedDir[0]]);
  const speed = effect.speed ?? 6;
  const leadDistance = effect.leadDistance ?? speed * WEATHER_WIND_LEAD_TIME;
  const traveled = Math.max(0, now - (effect.startTime ?? now)) * speed;
  const centerDistance = traveled + leadDistance * (1 - progress * 0.65);
  const center = [
    effect.origin[0] + normalizedDir[0] * centerDistance,
    waterSurfaceLevel + 0.35 + progress * 0.45,
    effect.origin[1] + normalizedDir[1] * centerDistance,
  ];

  const length = (effect.crestLength ?? 6) * (0.35 + progress * 0.6);
  const width = 0.18 + progress * 0.28;
  const halfLength = length / 2;
  const head = [
    center[0] + normalizedDir[0] * halfLength,
    center[1] + progress * 0.18,
    center[2] + normalizedDir[1] * halfLength,
  ];
  const tail = [
    center[0] - normalizedDir[0] * halfLength,
    center[1] - progress * 0.12,
    center[2] - normalizedDir[1] * halfLength,
  ];
  const lateral = [perp[0] * width, 0, perp[1] * width];

  const vertices = new Float32Array(6 * floatsPerVertex);
  let offset = 0;
  const headColor = [0.95, 0.92, alpha];
  const tailColor = [0.85, 0.82, alpha * 0.85];

  offset = pushVertex(vertices, offset, head[0] + lateral[0], head[1], head[2] + lateral[2], headColor);
  offset = pushVertex(vertices, offset, head[0] - lateral[0], head[1], head[2] - lateral[2], headColor);
  offset = pushVertex(vertices, offset, tail[0] + lateral[0], tail[1], tail[2] + lateral[2], tailColor);
  offset = pushVertex(vertices, offset, head[0] - lateral[0], head[1], head[2] - lateral[2], headColor);
  offset = pushVertex(vertices, offset, tail[0] - lateral[0], tail[1], tail[2] - lateral[2], tailColor);
  offset = pushVertex(vertices, offset, tail[0] + lateral[0], tail[1], tail[2] + lateral[2], tailColor);

  return { vertices, alpha: clamp01(alpha * 0.65 + 0.2), progress: clamp01(progress) };
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

function fract(value) {
  return value - Math.floor(value);
}

function mixColor(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

function smoothStep(edge0, edge1, value) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function smoothPulse(edge0, edge1, edge2, edge3, value) {
  if (edge0 >= edge1 || edge2 >= edge3) {
    return 0;
  }
  const rise = smoothStep(edge0, edge1, value);
  const fall = smoothStep(edge2, edge3, value);
  return clamp01(rise - fall);
}

function smoothPulseWrap(edge0, edge1, edge2, edge3, value) {
  let result = smoothPulse(edge0, edge1, edge2, edge3, value);
  result += smoothPulse(edge0, edge1, edge2, edge3, value + 1);
  result += smoothPulse(edge0, edge1, edge2, edge3, value - 1);
  return clamp01(result);
}

function accumulateWeightedColor(target, color, weight) {
  if (!target || !color || weight <= 0) {
    return;
  }
  target[0] += color[0] * weight;
  target[1] += color[1] * weight;
  target[2] += color[2] * weight;
}

function normalizeColor(color) {
  if (!color) {
    return [0, 0, 0];
  }
  return [clamp01(color[0]), clamp01(color[1]), clamp01(color[2])];
}

const skyboxPalettes = {
  night: {
    top: [0.08, 0.02, 0.12],
    middle: [0.03, 0.01, 0.08],
    bottom: [0.0, 0.0, 0.03],
  },
  dawn: {
    top: [0.95, 0.6, 0.75],
    middle: [0.98, 0.68, 0.5],
    bottom: [0.92, 0.45, 0.3],
  },
  day: {
    top: [0.18, 0.42, 0.9],
    middle: [0.38, 0.66, 0.96],
    bottom: [0.68, 0.84, 0.97],
  },
  dusk: {
    top: [0.88, 0.44, 0.68],
    middle: [0.98, 0.58, 0.42],
    bottom: [0.64, 0.26, 0.38],
  },
};

const nightSkyColor = skyboxPalettes.night.middle.slice();
const daySkyColor = skyboxPalettes.day.middle.slice();
const nightLightTint = [0.55, 0.68, 0.95];
const dayLightTint = [1, 0.97, 0.9];
const defaultDayStartFraction = 0.52;
const dayNightCycleDuration = 240;

const defaultSkyGradient = {
  top: skyboxPalettes.night.top.slice(),
  middle: skyboxPalettes.night.middle.slice(),
  bottom: skyboxPalettes.night.bottom.slice(),
};

const dayNightCycleState = {
  length: dayNightCycleDuration,
  normalizedTime: 0,
  daylight: 0,
  intensity: 1,
  skyColor: normalizeColor([
    (defaultSkyGradient.top[0] + defaultSkyGradient.middle[0] + defaultSkyGradient.bottom[0]) /
      3,
    (defaultSkyGradient.top[1] + defaultSkyGradient.middle[1] + defaultSkyGradient.bottom[1]) /
      3,
    (defaultSkyGradient.top[2] + defaultSkyGradient.middle[2] + defaultSkyGradient.bottom[2]) /
      3,
  ]),
  lightColor: [1, 1, 1],
  sunAngle: -Math.PI / 2,
  sunDirection: [0, -1, 0],
  sunPosition: [0, 0, 0],
  sunLightColor: dayLightTint.slice(),
  sunSpecularStrength: 0.8,
  sunlightIntensity: 0,
  sunAltitude: -1,
  moonDirection: [0, 1, 0],
  moonPosition: [0, 0, 0],
  moonLightColor: nightLightTint.slice(),
  moonSpecularStrength: 0.35,
  moonlightIntensity: 0,
  moonAltitude: 1,
  ambientLightColor: nightLightTint.slice(),
  skyGradient: {
    top: defaultSkyGradient.top.slice(),
    middle: defaultSkyGradient.middle.slice(),
    bottom: defaultSkyGradient.bottom.slice(),
  },
  skyboxWeights: {
    night: 1,
    dawn: 0,
    day: 0,
    dusk: 0,
  },
  metrics: {
    skyGradientUpdates: 0,
    skyGradientInvalidations: 0,
    lastGradientUpdateTime: 0,
    lastGradientInvalidationTime: 0,
  },
  flags: {
    skyGradientValid: true,
  },
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

function computeSkyboxGradient(normalizedTime) {
  const normalized = ((normalizedTime % 1) + 1) % 1;
  const dawnWeight = smoothPulseWrap(0.17, 0.25, 0.33, 0.41, normalized);
  const dayWeight = smoothPulseWrap(0.28, 0.42, 0.58, 0.72, normalized);
  const duskWeight = smoothPulseWrap(0.6, 0.72, 0.82, 0.94, normalized);
  const totalWarm = clamp01(dawnWeight + dayWeight + duskWeight);
  const nightWeight = clamp01(1 - totalWarm);

  const weights = {
    night: nightWeight,
    dawn: dawnWeight,
    day: dayWeight,
    dusk: duskWeight,
  };

  const gradientAccumulator = {
    top: [0, 0, 0],
    middle: [0, 0, 0],
    bottom: [0, 0, 0],
  };

  for (const [phase, weight] of Object.entries(weights)) {
    if (weight <= 0) {
      continue;
    }
    const palette = skyboxPalettes[phase];
    if (!palette) {
      continue;
    }
    accumulateWeightedColor(gradientAccumulator.top, palette.top, weight);
    accumulateWeightedColor(gradientAccumulator.middle, palette.middle, weight);
    accumulateWeightedColor(gradientAccumulator.bottom, palette.bottom, weight);
  }

  return {
    gradient: {
      top: normalizeColor(gradientAccumulator.top),
      middle: normalizeColor(gradientAccumulator.middle),
      bottom: normalizeColor(gradientAccumulator.bottom),
    },
    weights,
  };
}

function updateDayNightCycleState(currentSimulationTime) {
  const duration = Math.max(1, dayNightCycleDuration);
  const cycleTime = ((currentSimulationTime % duration) + duration) % duration;
  const normalized = cycleTime / duration;
  const sunAngle = normalized * 2 * Math.PI - Math.PI / 2;
  const sunOrbitRadius = Math.max(baseplateSize * 2.6, 520);
  const moonOrbitRadius = Math.max(baseplateSize * 2.3, 460);
  const sunVerticalFactor = Math.sin(sunAngle);
  const sunLateral = Math.sin(normalized * 2 * Math.PI + Math.PI / 4) * 0.45;
  const sunPosition = [
    Math.cos(sunAngle) * sunOrbitRadius,
    sunVerticalFactor * sunOrbitRadius * 0.62,
    sunLateral * sunOrbitRadius * 0.48,
  ];
  const sunDirection = normalize(sunPosition);

  const moonAngle = sunAngle + Math.PI;
  const moonVerticalFactor = Math.sin(moonAngle);
  const moonLateral = Math.sin(normalized * 2 * Math.PI + Math.PI * 0.85) * 0.42;
  const moonPosition = [
    Math.cos(moonAngle) * moonOrbitRadius,
    moonVerticalFactor * moonOrbitRadius * 0.55,
    moonLateral * moonOrbitRadius * 0.4,
  ];
  const moonDirection = normalize(moonPosition);

  const daylight = clamp01(sunDirection[1] * 0.55 + 0.5);
  const rawMoonVisibility = clamp01((1 - daylight) * 0.85 + (moonDirection[1] * 0.6 + 0.4));
  const moonlight = clamp01(rawMoonVisibility);
  const intensity = 0.25 + daylight * 0.75;
  const tint = mixColor(nightLightTint, dayLightTint, daylight);
  const lightColor = [
    clamp01(tint[0] * (0.35 + daylight * 0.95)),
    clamp01(tint[1] * (0.35 + daylight * 0.95)),
    clamp01(tint[2] * (0.35 + daylight * 0.95)),
  ];

  const ambientNight = [0.08, 0.11, 0.18];
  const ambientDay = [0.42, 0.48, 0.56];
  const ambientLightColor = [
    clamp01(lerp(ambientNight[0], ambientDay[0], daylight)),
    clamp01(lerp(ambientNight[1], ambientDay[1], daylight)),
    clamp01(lerp(ambientNight[2], ambientDay[2], daylight)),
  ];

  const baseSunColor = mixColor([1, 0.82, 0.6], [1, 0.96, 0.85], clamp01(daylight * 0.9));
  const sunLightColor = [
    clamp01(baseSunColor[0] * (0.2 + daylight * 1.4)),
    clamp01(baseSunColor[1] * (0.22 + daylight * 1.35)),
    clamp01(baseSunColor[2] * (0.24 + daylight * 1.2)),
  ];
  const baseMoonColor = [0.45, 0.52, 0.78];
  const moonLightColor = [
    clamp01(baseMoonColor[0] * (0.18 + moonlight * 0.5)),
    clamp01(baseMoonColor[1] * (0.2 + moonlight * 0.48)),
    clamp01(baseMoonColor[2] * (0.24 + moonlight * 0.55)),
  ];
  const sunSpecularStrength = clamp01(0.45 + daylight * 0.7);
  const moonSpecularStrength = clamp01(0.22 + moonlight * 0.35);

  const skyboxComputation = computeSkyboxGradient(normalized);
  const skyGradient = skyboxComputation.gradient;
  const weights = skyboxComputation.weights;
  const gradientValid =
    skyGradient &&
    typeof skyGradient === 'object' &&
    Array.isArray(skyGradient.top) &&
    Array.isArray(skyGradient.middle) &&
    Array.isArray(skyGradient.bottom) &&
    skyGradient.top.length === 3 &&
    skyGradient.middle.length === 3 &&
    skyGradient.bottom.length === 3 &&
    skyGradient.top.every(Number.isFinite) &&
    skyGradient.middle.every(Number.isFinite) &&
    skyGradient.bottom.every(Number.isFinite);

  const activeSkyGradient = gradientValid ? skyGradient : dayNightCycleState.skyGradient;
  if (gradientValid) {
    if (!dayNightCycleState.flags.skyGradientValid) {
      recordRuntimeIssue('info', 'ciclo día/noche', 'Gradiente de cielo restaurado.');
    }
    dayNightCycleState.skyGradient.top = skyGradient.top;
    dayNightCycleState.skyGradient.middle = skyGradient.middle;
    dayNightCycleState.skyGradient.bottom = skyGradient.bottom;
    dayNightCycleState.skyboxWeights = weights;
    dayNightCycleState.metrics.skyGradientUpdates += 1;
    dayNightCycleState.metrics.lastGradientUpdateTime = currentSimulationTime;
    dayNightCycleState.flags.skyGradientValid = true;
  } else {
    if (dayNightCycleState.flags.skyGradientValid) {
      recordRuntimeIssue(
        'error',
        'ciclo día/noche',
        'Gradiente de cielo inválido; se mantiene el último valor válido.',
      );
    }
    dayNightCycleState.metrics.skyGradientInvalidations += 1;
    dayNightCycleState.metrics.lastGradientInvalidationTime = currentSimulationTime;
    dayNightCycleState.flags.skyGradientValid = false;
  }

  const averageSkyColor = normalizeColor([
    (activeSkyGradient.top[0] + activeSkyGradient.middle[0] + activeSkyGradient.bottom[0]) / 3,
    (activeSkyGradient.top[1] + activeSkyGradient.middle[1] + activeSkyGradient.bottom[1]) / 3,
    (activeSkyGradient.top[2] + activeSkyGradient.middle[2] + activeSkyGradient.bottom[2]) / 3,
  ]);

  dayNightCycleState.normalizedTime = normalized;
  dayNightCycleState.daylight = daylight;
  dayNightCycleState.intensity = intensity;
  dayNightCycleState.skyColor = averageSkyColor;
  dayNightCycleState.lightColor = lightColor;
  dayNightCycleState.sunAngle = sunAngle;
  dayNightCycleState.sunDirection = sunDirection;
  dayNightCycleState.sunPosition = sunPosition;
  dayNightCycleState.sunLightColor = sunLightColor;
  dayNightCycleState.sunSpecularStrength = sunSpecularStrength;
  dayNightCycleState.sunlightIntensity = daylight;
  dayNightCycleState.sunAltitude = sunPosition[1];
  dayNightCycleState.moonDirection = moonDirection;
  dayNightCycleState.moonPosition = moonPosition;
  dayNightCycleState.moonLightColor = moonLightColor;
  dayNightCycleState.moonSpecularStrength = moonSpecularStrength;
  dayNightCycleState.moonlightIntensity = moonlight;
  dayNightCycleState.moonAltitude = moonPosition[1];
  dayNightCycleState.ambientLightColor = ambientLightColor;

  lightingDiagnostics.latestLightColor = lightColor.slice();
  lightingDiagnostics.latestAmbientColor = ambientLightColor.slice();
  lightingDiagnostics.latestDaylight = daylight;
  lightingDiagnostics.latestSunAltitude = sunPosition[1];
  if (!lightingDiagnostics.startupRecorded) {
    lightingDiagnostics.startupRecorded = true;
    lightingDiagnostics.startupLightColor = lightColor.slice();
    lightingDiagnostics.startupSunAltitude = sunPosition[1];
    lightingDiagnostics.startupNormalizedTime = normalized;
  }
}

const translucentTerrainAlpha = 0.45;

const terrainRenderState = {
  translucent: false,
  alpha: 1,
  flatShading: false,
  metrics: {
    flatShadedDrawsTotal: 0,
    flatShadedDrawsLastFrame: 0,
    lastFlatLightColor: [1, 1, 1],
    lastFlatLightLuma: 1,
    lastDaylight: 0,
    lastMoonlight: 0,
  },
};
runtimeGlobal.__ARRECIFE_TERRAIN_LIGHTING__ = terrainRenderState.metrics;

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

function clearWaterSurface() {
  waterVertexCount = 0;
  waterVertexData = null;
  waterNeedsUpload = false;
  gl.bindBuffer(gl.ARRAY_BUFFER, waterBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(0), gl.STATIC_DRAW);
}

function computeWaterFoamFactor(depth) {
  if (!Number.isFinite(depth)) {
    return 0;
  }
  if (depth <= waterFoamDepthStart) {
    return 1;
  }
  if (depth >= waterFoamDepthEnd) {
    return 0;
  }
  const normalized = 1 - (depth - waterFoamDepthStart) / (waterFoamDepthEnd - waterFoamDepthStart);
  return clamp01(normalized);
}

function sampleWaterPattern(x, z) {
  const hash = Math.sin((x + 37.2) * 12.9898 + (z - 91.7) * 78.233) * 43758.5453;
  return fract(hash);
}

function pushWaterVertexData(vertexIndex, x, z, foam) {
  if (!waterVertexData) {
    return vertexIndex;
  }
  const baseIndex = vertexIndex * floatsPerVertex;
  const pattern = sampleWaterPattern(x, z);
  const shallowMix = Math.pow(clamp01(foam), 0.7);
  waterVertexData[baseIndex + 0] = x;
  waterVertexData[baseIndex + 1] = waterSurfaceLevel;
  waterVertexData[baseIndex + 2] = z;
  waterVertexData[baseIndex + 3] = clamp01(foam);
  waterVertexData[baseIndex + 4] = pattern;
  waterVertexData[baseIndex + 5] = shallowMix;
  return vertexIndex + 1;
}

function rebuildWaterSurface(heightField) {
  if (!heightField || heightField.length <= 1) {
    clearWaterSurface();
    return;
  }

  const blocksPerSide = heightField.length - 1;
  if (blocksPerSide <= 0) {
    clearWaterSurface();
    return;
  }

  const totalVertices = blocksPerSide * blocksPerSide * 6;
  waterVertexData = new Float32Array(totalVertices * floatsPerVertex);

  const half = baseplateSize / 2;
  let vertexIndex = 0;

  for (let z = 0; z < blocksPerSide; z++) {
    const z0 = -half + z * blockSize;
    const z1 = z0 + blockSize;
    const row0 = heightField[z] ?? [];
    const row1 = heightField[z + 1] ?? row0;
    for (let x = 0; x < blocksPerSide; x++) {
      const x0 = -half + x * blockSize;
      const x1 = x0 + blockSize;
      const h00 = row0[x] ?? 0;
      const h10 = row0[x + 1] ?? h00;
      const h01 = row1[x] ?? h00;
      const h11 = row1[x + 1] ?? h10;

      const foam00 = computeWaterFoamFactor(Math.max(0, waterSurfaceLevel - h00));
      const foam10 = computeWaterFoamFactor(Math.max(0, waterSurfaceLevel - h10));
      const foam01 = computeWaterFoamFactor(Math.max(0, waterSurfaceLevel - h01));
      const foam11 = computeWaterFoamFactor(Math.max(0, waterSurfaceLevel - h11));

      vertexIndex = pushWaterVertexData(vertexIndex, x0, z0, foam00);
      vertexIndex = pushWaterVertexData(vertexIndex, x1, z0, foam10);
      vertexIndex = pushWaterVertexData(vertexIndex, x1, z1, foam11);
      vertexIndex = pushWaterVertexData(vertexIndex, x0, z0, foam00);
      vertexIndex = pushWaterVertexData(vertexIndex, x1, z1, foam11);
      vertexIndex = pushWaterVertexData(vertexIndex, x0, z1, foam01);
    }
  }

  waterVertexCount = vertexIndex;
  waterNeedsUpload = true;
  uploadWaterSurfaceBuffer();
}

function uploadWaterSurfaceBuffer() {
  if (!waterNeedsUpload || !waterVertexData) {
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, waterBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, waterVertexData, gl.STATIC_DRAW);
  waterNeedsUpload = false;
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
  closePlantInfo();
  closeRockInfo();
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
  let wetSamples = 0;
  for (const height of heights) {
    const depth = Math.max(0, waterSurfaceLevel - height);
    if (depth > 0) {
      wetSamples += 1;
    }
    depthSum += depth;
  }

  if (depthSum <= 0) {
    return 0;
  }

  const averageDepth = depthSum / heights.length;
  const coverage = wetSamples > 0 ? wetSamples / heights.length : 0;
  const waveCompensation =
    (waterPrimaryAmplitude * 0.5 + waterSecondaryAmplitude * 0.35) * coverage;
  const area = blockSize * blockSize;
  return Math.max(0, averageDepth + waveCompensation) * area;
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

  closeRockInfo();
  closePlantInfo();

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
      suppressNextSelectionClick = true;
      if (typeof setTimeout === 'function') {
        setTimeout(() => {
          suppressNextSelectionPointerDown = false;
        }, 0);
        setTimeout(() => {
          suppressNextSelectionClick = false;
        }, 0);
      } else {
        suppressNextSelectionPointerDown = false;
        suppressNextSelectionClick = false;
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

function closePlantInfo(options = {}) {
  const { restoreCamera = false, event } = options;
  activePlantSelection = null;
  pendingPlantSelection = null;
  ignoreNextPlantPointerDown = false;

  if (plantInfoPanel) {
    plantInfoPanel.hidden = true;
    if (typeof plantInfoPanel.setAttribute === 'function') {
      plantInfoPanel.setAttribute('aria-hidden', 'true');
    }
  }

  if (
    plantInfoPointerHandler &&
    typeof document !== 'undefined' &&
    typeof document.removeEventListener === 'function'
  ) {
    document.removeEventListener('pointerdown', plantInfoPointerHandler, true);
  }

  if (
    plantInfoKeyHandler &&
    typeof document !== 'undefined' &&
    typeof document.removeEventListener === 'function'
  ) {
    document.removeEventListener('keydown', plantInfoKeyHandler, true);
  }

  if (restoreCamera) {
    requestCameraControl(event);
  }
}

function updatePlantInfoPanel(plant = activePlantSelection) {
  const target = plant ?? activePlantSelection;
  if (!target) {
    return;
  }

  const species = target.species ?? plantSimulation.speciesById.get(target.speciesId);

  if (plantInfoSpeciesField) {
    plantInfoSpeciesField.textContent = species?.name ?? '—';
  }

  const ageSeconds = Math.max(0, simulationTime - (target.spawnSimulationTime ?? 0));
  const loreYears = ageSeconds / dayNightCycleDuration;

  if (plantInfoAgeLoreField) {
    plantInfoAgeLoreField.textContent = `${loreYears.toFixed(1)} años`;
  }

  if (plantInfoAgeRealField) {
    plantInfoAgeRealField.textContent = formatDurationHMS(ageSeconds);
  }

  if (plantInfoMassField) {
    const mass = computePlantMass(target);
    plantInfoMassField.textContent = `${mass.toFixed(2)} kg`;
  }

  if (plantInfoNutrientsField) {
    plantInfoNutrientsField.textContent = '—';
  }
}

function openPlantInfo(plantOrHit, event) {
  if (!plantInfoPanel) {
    return;
  }

  const plant = plantOrHit?.plant ?? plantOrHit;
  if (!plant) {
    closePlantInfo();
    return;
  }

  closeRockInfo();
  activePlantSelection = plant;
  updatePlantInfoPanel(plant);
  plantInfoPanel.hidden = false;
  if (typeof plantInfoPanel.setAttribute === 'function') {
    plantInfoPanel.setAttribute('aria-hidden', 'false');
  }
  ignoreNextPlantPointerDown = event?.type === 'pointerdown';

  if (!plantInfoPointerHandler) {
    plantInfoPointerHandler = (pointerEvent) => {
      if (pointerEvent.button !== undefined && pointerEvent.button !== 0) {
        return;
      }
      if (ignoreNextPlantPointerDown) {
        ignoreNextPlantPointerDown = false;
        return;
      }
      suppressNextSelectionPointerDown = true;
      suppressNextSelectionClick = true;
      if (typeof setTimeout === 'function') {
        setTimeout(() => {
          suppressNextSelectionPointerDown = false;
        }, 0);
        setTimeout(() => {
          suppressNextSelectionClick = false;
        }, 0);
      } else {
        suppressNextSelectionPointerDown = false;
        suppressNextSelectionClick = false;
      }
      closePlantInfo({ restoreCamera: true, event: pointerEvent });
    };
  }

  if (!plantInfoKeyHandler) {
    plantInfoKeyHandler = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape' || keyboardEvent.key === 'Esc') {
        keyboardEvent.preventDefault();
        closePlantInfo({ restoreCamera: true, event: keyboardEvent });
      }
    };
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('pointerdown', plantInfoPointerHandler, true);
    document.addEventListener('keydown', plantInfoKeyHandler, true);
  }
}

function updateRockInfoPanel(rock = activeRockSelection) {
  if (!rockInfoPanel || !rock) {
    return;
  }

  const totalMass = Number.isFinite(rock.totalMass) ? Math.max(0, rock.totalMass) : 0;
  const matrixMass = Number.isFinite(rock.matrixMass) ? Math.max(0, rock.matrixMass) : totalMass;
  const ageSeconds = Math.max(0, simulationTime - (rock.formationSimulationTime ?? 0));

  if (rockInfoTypeField) {
    rockInfoTypeField.textContent = rock.typeName ?? 'Roca sin clasificar';
  }
  if (rockInfoMatrixMassField) {
    rockInfoMatrixMassField.textContent = `${matrixMass.toFixed(2)} kg`;
  }
  if (rockInfoMassField) {
    rockInfoMassField.textContent = `${totalMass.toFixed(2)} kg`;
  }
  if (rockInfoAgeField) {
    rockInfoAgeField.textContent = formatDurationHMS(ageSeconds);
  }
  if (rockInfoErosionField) {
    rockInfoErosionField.textContent = '—';
  }

  if (!rockInfoMineralsList) {
    return;
  }

  const entries = Array.isArray(rock.compositionEntries) ? rock.compositionEntries : [];
  const hasDom = typeof document?.createElement === 'function';

  if (typeof rockInfoMineralsList.replaceChildren === 'function' && hasDom) {
    const fragment = document.createDocumentFragment();
    if (entries.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'rock-info__mineral rock-info__mineral--empty';
      emptyItem.textContent = 'Sin datos de composición';
      fragment.appendChild(emptyItem);
    } else {
      for (const entry of entries) {
        const item = document.createElement('li');
        item.className = entry.primary
          ? 'rock-info__mineral rock-info__mineral--matrix'
          : 'rock-info__mineral';
        const percent = (entry.percent * 100).toFixed(1);
        const massValue = entry.mass.toFixed(2);
        item.textContent = `${entry.name}: ${percent}% (${massValue} kg)`;
        fragment.appendChild(item);
      }
    }
    rockInfoMineralsList.replaceChildren(fragment);
    return;
  }

  if (entries.length === 0) {
    rockInfoMineralsList.textContent = 'Sin datos de composición';
    return;
  }

  const summary = entries
    .map((entry) => {
      const percent = (entry.percent * 100).toFixed(1);
      const massValue = entry.mass.toFixed(2);
      return `${entry.name}: ${percent}% (${massValue} kg)`;
    })
    .join('\n');
  rockInfoMineralsList.textContent = summary;
}

function closeRockInfo(options = {}) {
  const { restoreCamera = false, event } = options;
  activeRockSelection = null;
  ignoreNextRockPointerDown = false;

  if (rockInfoPanel) {
    rockInfoPanel.hidden = true;
    if (typeof rockInfoPanel.setAttribute === 'function') {
      rockInfoPanel.setAttribute('aria-hidden', 'true');
    }
  }

  if (
    rockInfoPointerHandler &&
    typeof document !== 'undefined' &&
    typeof document.removeEventListener === 'function'
  ) {
    document.removeEventListener('pointerdown', rockInfoPointerHandler, true);
  }
  if (
    rockInfoKeyHandler &&
    typeof document !== 'undefined' &&
    typeof document.removeEventListener === 'function'
  ) {
    document.removeEventListener('keydown', rockInfoKeyHandler, true);
  }

  if (restoreCamera) {
    requestCameraControl(event);
  }
}

function openRockInfo(rockOrHit, event) {
  if (!rockInfoPanel) {
    return;
  }

  const rock = rockOrHit?.rock ?? rockOrHit;
  if (!rock) {
    closeRockInfo();
    return;
  }

  closeWaterInfo();
  closePlantInfo();
  activeRockSelection = rock;
  updateRockInfoPanel(rock);
  rockInfoPanel.hidden = false;
  if (typeof rockInfoPanel.setAttribute === 'function') {
    rockInfoPanel.setAttribute('aria-hidden', 'false');
  }

  ignoreNextRockPointerDown = event?.type === 'pointerdown';

  if (!rockInfoPointerHandler) {
    rockInfoPointerHandler = (pointerEvent) => {
      if (pointerEvent.button !== undefined && pointerEvent.button !== 0) {
        return;
      }
      if (ignoreNextRockPointerDown) {
        ignoreNextRockPointerDown = false;
        return;
      }
      suppressNextSelectionPointerDown = true;
      suppressNextSelectionClick = true;
      if (typeof setTimeout === 'function') {
        setTimeout(() => {
          suppressNextSelectionPointerDown = false;
        }, 0);
        setTimeout(() => {
          suppressNextSelectionClick = false;
        }, 0);
      } else {
        suppressNextSelectionPointerDown = false;
        suppressNextSelectionClick = false;
      }
      closeRockInfo({ restoreCamera: true, event: pointerEvent });
    };
  }

  if (!rockInfoKeyHandler) {
    rockInfoKeyHandler = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape' || keyboardEvent.key === 'Esc') {
        keyboardEvent.preventDefault();
        closeRockInfo({ restoreCamera: true, event: keyboardEvent });
      }
    };
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('pointerdown', rockInfoPointerHandler, true);
    document.addEventListener('keydown', rockInfoKeyHandler, true);
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
  const waterDepth = Math.max(0, waterSurfaceLevel - height);
  applySelection({
    blockX: sample.blockX,
    blockZ: sample.blockZ,
    chunkX: sample.chunkX,
    chunkZ: sample.chunkZ,
    worldPosition: [sample.centerX, height, sample.centerZ],
    height,
    waterLevel: waterSurfaceLevel,
    waterDepth,
    underwater: waterDepth > 0,
    cornerHeights: sample.cornerHeights,
  });
}

function getPointerPosition(event) {
  if (!canvas) {
    return { x: 0, y: 0 };
  }

  if (document.pointerLockElement === canvas) {
    pointerCanvasPosition.x = canvas.width * 0.5;
    pointerCanvasPosition.y = canvas.height * 0.5;
    return { x: pointerCanvasPosition.x, y: pointerCanvasPosition.y };
  }

  if (event) {
    const rect = canvas.getBoundingClientRect?.() ?? { left: 0, top: 0 };
    const x = (event.clientX ?? rect.left) - rect.left;
    const y = (event.clientY ?? rect.top) - rect.top;
    pointerCanvasPosition.x = clamp(x, 0, canvas.width);
    pointerCanvasPosition.y = clamp(y, 0, canvas.height);
  }

  return { x: pointerCanvasPosition.x, y: pointerCanvasPosition.y };
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
        const waterDepth = Math.max(0, waterSurfaceLevel - height);

        return {
          blockX: centerSample.blockX,
          blockZ: centerSample.blockZ,
          chunkX: centerSample.chunkX,
          chunkZ: centerSample.chunkZ,
          worldPosition: [centerSample.centerX, height, centerSample.centerZ],
          height,
          waterLevel: waterSurfaceLevel,
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

function createPointerRay(pointerX, pointerY) {
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

  return {
    origin: [cameraPosition[0], cameraPosition[1], cameraPosition[2]],
    direction,
  };
}

function intersectPlant(origin, direction, plant) {
  if (!plant) {
    return null;
  }

  const baseY = plant.position?.[1] ?? 0;
  const height = Math.max(0, plant.currentHeight ?? 0);
  const topY = baseY + height;
  if (topY <= baseY) {
    return null;
  }

  const centerX = plant.position?.[0] ?? 0;
  const centerZ = plant.position?.[2] ?? 0;
  const radius = Math.max(0.04, plant.currentRadius ?? 0.12);
  const tipRadius = Math.max(0.04, plant.tipRadius ?? radius * 0.6);
  const effectiveRadius = Math.max(radius, tipRadius);

  const dx = direction[0];
  const dz = direction[2];
  const relX = origin[0] - centerX;
  const relZ = origin[2] - centerZ;

  const a = dx * dx + dz * dz;
  let tCandidate = null;

  if (a > 1e-6) {
    const b = 2 * (relX * dx + relZ * dz);
    const c = relX * relX + relZ * relZ - effectiveRadius * effectiveRadius;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return null;
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t0 = (-b - sqrtDiscriminant) / (2 * a);
    const t1 = (-b + sqrtDiscriminant) / (2 * a);
    if (t0 >= 0) {
      tCandidate = t0;
    } else if (t1 >= 0) {
      tCandidate = t1;
    } else {
      return null;
    }
  } else {
    const distanceSq = relX * relX + relZ * relZ;
    if (distanceSq > effectiveRadius * effectiveRadius) {
      return null;
    }
    if (direction[1] === 0) {
      return null;
    }
    const targetY = direction[1] > 0 ? baseY : topY;
    tCandidate = (targetY - origin[1]) / direction[1];
    if (tCandidate < 0) {
      return null;
    }
  }

  const hitY = origin[1] + direction[1] * tCandidate;
  if (hitY < baseY - 0.2 || hitY > topY + 0.2) {
    return null;
  }

  const hitPoint = [
    origin[0] + direction[0] * tCandidate,
    hitY,
    origin[2] + direction[2] * tCandidate,
  ];

  return { distance: tCandidate, point: hitPoint };
}

function intersectPlants(origin, direction) {
  if (!plantSimulation.instances || plantSimulation.instances.length === 0) {
    return null;
  }

  let closest = null;
  for (const plant of plantSimulation.instances) {
    const hit = intersectPlant(origin, direction, plant);
    if (!hit) {
      continue;
    }
    if (!closest || hit.distance < closest.distance) {
      closest = { plant, distance: hit.distance, point: hit.point };
    }
  }

  return closest;
}

function pickPlantAt(pointerX, pointerY) {
  const ray = createPointerRay(pointerX, pointerY);
  if (!ray) {
    return null;
  }
  return intersectPlants(ray.origin, ray.direction);
}

function intersectRock(origin, direction, rock) {
  if (!rock) {
    return null;
  }

  const position = rock.position ?? [0, 0, 0];
  const rotation = rock.rotation ?? [0, 0, 0];
  const scale = rock.scale ?? [1, 1, 1];
  const safeScale = [
    Math.max(0.001, scale[0] ?? 1),
    Math.max(0.001, scale[1] ?? 1),
    Math.max(0.001, scale[2] ?? 1),
  ];

  const toCenter = subtract(origin, position);
  const radius = Math.max(rock.boundingRadius ?? 0, safeScale[0], safeScale[1], safeScale[2]);
  const sphereA = dot(direction, direction);
  const sphereB = 2 * dot(toCenter, direction);
  const sphereC = dot(toCenter, toCenter) - radius * radius;
  const sphereDisc = sphereB * sphereB - 4 * sphereA * sphereC;
  if (sphereDisc < 0) {
    return null;
  }

  const localOrigin = subtract(origin, position);
  const rotatedOrigin = inverseRotateVector(localOrigin, rotation);
  const rotatedDirection = inverseRotateVector(direction, rotation);
  const scaledOrigin = [
    rotatedOrigin[0] / safeScale[0],
    rotatedOrigin[1] / safeScale[1],
    rotatedOrigin[2] / safeScale[2],
  ];
  const scaledDirection = [
    rotatedDirection[0] / safeScale[0],
    rotatedDirection[1] / safeScale[1],
    rotatedDirection[2] / safeScale[2],
  ];

  const a = dot(scaledDirection, scaledDirection);
  if (a <= 1e-6) {
    return null;
  }
  const b = 2 * dot(scaledOrigin, scaledDirection);
  const c = dot(scaledOrigin, scaledOrigin) - 1;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return null;
  }
  const sqrtDiscriminant = Math.sqrt(discriminant);
  const t0 = (-b - sqrtDiscriminant) / (2 * a);
  const t1 = (-b + sqrtDiscriminant) / (2 * a);
  let t = null;
  if (t0 >= 0) {
    t = t0;
  } else if (t1 >= 0) {
    t = t1;
  }
  if (t === null) {
    return null;
  }

  return {
    distance: t,
    point: [
      origin[0] + direction[0] * t,
      origin[1] + direction[1] * t,
      origin[2] + direction[2] * t,
    ],
  };
}

function pickRockAt(pointerX, pointerY) {
  if (!rockInstances || rockInstances.length === 0) {
    return null;
  }

  const ray = createPointerRay(pointerX, pointerY);
  if (!ray) {
    return null;
  }

  let closest = null;
  for (const rock of rockInstances) {
    const hit = intersectRock(ray.origin, ray.direction, rock);
    if (!hit) {
      continue;
    }
    if (!closest || hit.distance < closest.distance) {
      closest = { rock, distance: hit.distance, point: hit.point };
    }
  }

  return closest;
}

function pickSelectionAt(pointerX, pointerY) {
  const ray = createPointerRay(pointerX, pointerY);
  if (!ray) {
    return null;
  }

  return castTerrainRay(ray.origin, ray.direction);
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
  const colorSum = [0, 0, 0];
  const colorSumSq = [0, 0, 0];
  let colorSamples = 0;
  for (let z = 0; z <= blocksPerSide; z++) {
    colors[z] = new Array(blocksPerSide + 1);
    for (let x = 0; x <= blocksPerSide; x++) {
      const color = sandFlatColor;

      colors[z][x] = color;
      colorSum[0] += color[0];
      colorSum[1] += color[1];
      colorSum[2] += color[2];
      colorSumSq[0] += color[0] * color[0];
      colorSumSq[1] += color[1] * color[1];
      colorSumSq[2] += color[2] * color[2];
      colorSamples += 1;
    }
  }

  let colorVariance = 0;
  if (colorSamples > 0) {
    const inv = 1 / colorSamples;
    const meanR = colorSum[0] * inv;
    const meanG = colorSum[1] * inv;
    const meanB = colorSum[2] * inv;
    const varR = Math.max(0, colorSumSq[0] * inv - meanR * meanR);
    const varG = Math.max(0, colorSumSq[1] * inv - meanG * meanG);
    const varB = Math.max(0, colorSumSq[2] * inv - meanB * meanB);
    colorVariance = clamp((varR + varG + varB) / 3, 0, 1);
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
    colorVariance,
  };
}

const rockTypeDefinitions = [
  { name: 'simple', subdivisions: 0, roughness: 0.32, jaggedness: 0.22, smoothing: 0.08 },
  { name: 'jagged', subdivisions: 1, roughness: 0.48, jaggedness: 0.55, smoothing: 0.04 },
  { name: 'smooth', subdivisions: 1, roughness: 0.22, jaggedness: 0.12, smoothing: 0.4 },
];
const rockTraceMineralDefinitions = [
  { id: 'calcite', name: 'Carbonato de calcio' },
  { id: 'aragonite', name: 'Aragonita' },
  { id: 'magnesium', name: 'Magnesio' },
  { id: 'iron', name: 'Óxidos de hierro' },
  { id: 'silica', name: 'Sílice' },
  { id: 'strontium', name: 'Estroncio' },
  { id: 'manganese', name: 'Manganeso' },
];

const sulfurContentProfiles = [
  { label: 'trace', min: 0, max: 0.004, weight: 0.44 },
  { label: 'minor', min: 0.004, max: 0.028, weight: 0.33 },
  { label: 'vein', min: 0.028, max: 0.14, weight: 0.17 },
  { label: 'massive', min: 0.72, max: 0.9, weight: 0.06 },
];

const phosphorusContentProfiles = [
  { label: 'trace', min: 0, max: 0.006, weight: 0.46 },
  { label: 'minor', min: 0.006, max: 0.038, weight: 0.32 },
  { label: 'nodule', min: 0.038, max: 0.16, weight: 0.16 },
  { label: 'massive', min: 0.72, max: 0.88, weight: 0.06 },
];

const rockTopologyCache = new Map();
const cloudPuffTopologyCache = new Map();

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

function tintRockBaseColor(baseColor, composition) {
  const tinted = Array.isArray(baseColor) ? baseColor.slice() : [0.4, 0.4, 0.4];
  while (tinted.length < 3) {
    tinted.push(0.4);
  }

  if (!composition) {
    return tinted;
  }

  const sulfurPercent = clamp01(composition.sulfurPercent ?? 0);
  const phosphorusPercent = clamp01(composition.phosphorusPercent ?? 0);

  let sulfurInfluence = 0;
  if (sulfurPercent > 0) {
    const subtle = clamp01(sulfurPercent / 0.24) * 0.25;
    const pronounced = clamp01((sulfurPercent - 0.08) / 0.6);
    sulfurInfluence = clamp01(subtle + Math.pow(pronounced, 1.45) * 0.85);
  }

  let phosphorusInfluence = 0;
  if (phosphorusPercent > 0) {
    const subtle = clamp01(phosphorusPercent / 0.26) * 0.22;
    const pronounced = clamp01((phosphorusPercent - 0.06) / 0.58);
    phosphorusInfluence = clamp01(subtle + Math.pow(pronounced, 1.35) * 0.88);
  }

  if (sulfurInfluence > 0) {
    const subtleScale = lerp(0.05, 0.48, sulfurInfluence);
    tinted[0] = clamp(tinted[0] + subtleScale, 0, 1);
    tinted[1] = clamp(tinted[1] + subtleScale * 0.55, 0, 1);
    tinted[2] = clamp(tinted[2] - subtleScale * 0.6, 0, 1);
  }

  if (phosphorusInfluence > 0) {
    const subtleScale = lerp(0.04, 0.4, phosphorusInfluence);
    tinted[0] = clamp(tinted[0] - subtleScale * 0.35, 0, 1);
    tinted[1] = clamp(tinted[1] + subtleScale, 0, 1);
    tinted[2] = clamp(tinted[2] - subtleScale * 0.28, 0, 1);
  }

  return [
    clamp(tinted[0], 0.05, 0.98),
    clamp(tinted[1], 0.05, 0.98),
    clamp(tinted[2], 0.05, 0.98),
  ];
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

function inverseRotateVector(vertex, rotation) {
  const [rx, ry, rz] = rotation;
  let [x, y, z] = vertex;

  const cosZ = Math.cos(-rz);
  const sinZ = Math.sin(-rz);
  const xZ = x * cosZ - y * sinZ;
  const yZ = x * sinZ + y * cosZ;
  x = xZ;
  y = yZ;

  const cosY = Math.cos(-ry);
  const sinY = Math.sin(-ry);
  const xY = x * cosY + z * sinY;
  const zY = -x * sinY + z * cosY;
  x = xY;
  z = zY;

  const cosX = Math.cos(-rx);
  const sinX = Math.sin(-rx);
  const yX = y * cosX - z * sinX;
  const zX = y * sinX + z * cosX;

  return [x, yX, zX];
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

function resetPlantGeometry() {
  gl.bindBuffer(gl.ARRAY_BUFFER, plantBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(0), gl.STATIC_DRAW);
  plantVertexCount = 0;
  plantSimulation.geometryDirty = false;
}

function appendPlantPlane(
  vertexData,
  offset,
  baseAx,
  baseAz,
  baseBx,
  baseBz,
  topAx,
  topAz,
  topBx,
  topBz,
  baseY,
  topY,
  baseColor,
  tipColor
) {
  offset = pushVertex(vertexData, offset, baseAx, baseY, baseAz, baseColor);
  offset = pushVertex(vertexData, offset, baseBx, baseY, baseBz, baseColor);
  offset = pushVertex(vertexData, offset, topBx, topY, topBz, tipColor);

  offset = pushVertex(vertexData, offset, baseAx, baseY, baseAz, baseColor);
  offset = pushVertex(vertexData, offset, topBx, topY, topBz, tipColor);
  offset = pushVertex(vertexData, offset, topAx, topY, topAz, tipColor);

  offset = pushVertex(vertexData, offset, baseBx, baseY, baseBz, baseColor);
  offset = pushVertex(vertexData, offset, baseAx, baseY, baseAz, baseColor);
  offset = pushVertex(vertexData, offset, topAx, topY, topAz, tipColor);

  offset = pushVertex(vertexData, offset, baseBx, baseY, baseBz, baseColor);
  offset = pushVertex(vertexData, offset, topAx, topY, topAz, tipColor);
  offset = pushVertex(vertexData, offset, topBx, topY, topBz, tipColor);

  return offset;
}

function appendPlantInstanceVertices(vertexData, offset, plant) {
  const position = plant.position || [0, 0, 0];
  const baseY = position[1];
  const height = Math.max(0, plant.currentHeight ?? 0);
  const topY = baseY + height;
  if (topY <= baseY) {
    return offset;
  }

  const radius = Math.max(0.04, plant.currentRadius ?? 0.1);
  const tipRadius = Math.max(0.02, plant.tipRadius ?? radius * 0.6);
  const baseColor = plant.baseColor ?? [0.35, 0.78, 0.5];
  const tipColor = plant.tipColor ?? [0.62, 0.92, 0.7];
  const x = position[0];
  const z = position[2];

  offset = appendPlantPlane(
    vertexData,
    offset,
    x - radius,
    z,
    x + radius,
    z,
    x - tipRadius,
    z,
    x + tipRadius,
    z,
    baseY,
    topY,
    baseColor,
    tipColor
  );

  offset = appendPlantPlane(
    vertexData,
    offset,
    x,
    z - radius,
    x,
    z + radius,
    x,
    z - tipRadius,
    x,
    z + tipRadius,
    baseY,
    topY,
    baseColor,
    tipColor
  );

  return offset;
}

function rebuildPlantGeometry() {
  const instances = plantSimulation.instances;
  if (!instances || instances.length === 0) {
    resetPlantGeometry();
    return;
  }

  const vertexData = new Float32Array(instances.length * plantFloatsPerInstance);
  let offset = 0;
  for (const plant of instances) {
    offset = appendPlantInstanceVertices(vertexData, offset, plant);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, plantBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  plantVertexCount = vertexData.length / floatsPerVertex;
  plantSimulation.geometryDirty = false;
}

function computePlantVolume(plant) {
  const height = Math.max(0, plant?.currentHeight ?? 0);
  if (height <= 0) {
    return 0;
  }
  const baseRadius = Math.max(0.01, plant?.currentRadius ?? 0.1);
  const topRadius = Math.max(0.01, plant?.tipRadius ?? baseRadius * 0.6);
  return (
    (Math.PI * height *
      (baseRadius * baseRadius + baseRadius * topRadius + topRadius * topRadius)) /
    3
  );
}

function computePlantMass(plant) {
  if (!plant) {
    return 0;
  }
  const species = plant.species ?? plantSimulation.speciesById.get(plant.speciesId);
  const density = species?.density ?? 300;
  if (!volumetricEngine) {
    return computePlantVolume(plant) * density;
  }

  const height = Math.max(0, plant?.currentHeight ?? 0);
  if (height <= 0) {
    return 0;
  }

  const baseRadius = Math.max(0.01, plant?.currentRadius ?? 0.1);
  const topRadius = Math.max(0.01, plant?.tipRadius ?? baseRadius * 0.6);
  const position = plant.position || [0, 0, 0];
  const baseY = Number.isFinite(position[1])
    ? position[1]
    : sampleTerrainHeight(position[0] ?? 0, position[2] ?? 0);
  const center = [
    Number.isFinite(position[0]) ? position[0] : 0,
    (Number.isFinite(baseY) ? baseY : 0) + height / 2,
    Number.isFinite(position[2]) ? position[2] : 0,
  ];
  const result = volumetricEngine.computeMass({
    shape: 'truncated-cone',
    center,
    dimensions: {
      height,
      bottomRadius: baseRadius,
      topRadius,
      baseY: Number.isFinite(baseY) ? baseY : center[1] - height / 2,
    },
    materialId: species?.volumetricMaterialId ?? 'plant-generic',
    density,
    metadata: {
      type: 'planta',
      id: plant.id,
      speciesId: species?.id,
      category: 'plant',
      clipBelowTerrain: true,
    },
    expectedRange: {
      min: 0,
      max: Math.max(0.5, height * baseRadius * baseRadius * density * 2.2),
    },
  });

  if (result.flagged) {
    reportVolumetricAnomaly(result.flagged, {
      type: 'Planta',
      id: plant.id,
      name: species?.name,
    });
  }

  return Math.max(0, result.mass ?? 0);
}

function regeneratePlants(seedString, heightfield, maskfield) {
  closePlantInfo();
  plantSimulation.instances = [];
  terrainInfo.plantCount = 0;
  plantSimulation.metrics = createEmptyPlantMetrics();

  if (!heightfield || !maskfield) {
    resetPlantGeometry();
    return;
  }

  const baseSeed = stringToSeed(`${seedString}-flora`);
  const random = createRandomGenerator(baseSeed);
  const half = baseplateSize / 2;

  const attemptSpawn = (species, x, z, overrides = {}) => {
    if (x < -half || x > half || z < -half || z > half) {
      return false;
    }

    const mask = sampleTerrainMask(x, z);
    const minMask = overrides.minMask ?? species.minMask ?? 0;
    if (mask < minMask) {
      return false;
    }

    const groundHeight = sampleTerrainHeight(x, z);
    if (!Number.isFinite(groundHeight)) {
      return false;
    }

    const maxElevation = overrides.maxElevation ?? waterSurfaceLevel - 0.2;
    if (groundHeight >= maxElevation) {
      return false;
    }

    const slopeNormal = sampleTerrainNormal(x, z);
    const minSlope = overrides.minSlope ?? 0.35;
    if (slopeNormal[1] < minSlope) {
      return false;
    }

    const baseInitial =
      species.initialHeight ?? species.baseHeight ?? Math.min(1.2, species.maxHeight * 0.35);
    const jitterScale = overrides.heightJitterScale ?? 0.22;
    const heightJitter = randomInRange(random, -baseInitial * 0.18, baseInitial * jitterScale);
    const initialHeight = clamp(baseInitial + heightJitter, 0.18, species.maxHeight * 0.9);

    const radiusJitter = Math.max(0.005, overrides.radiusJitter ?? 0.02);
    const baseRadius = Math.max(
      0.05,
      (species.baseRadius ?? 0.12) + randomInRange(random, -radiusJitter, radiusJitter),
    );

    const energyCapacity = Math.max(0, species.energyCapacity ?? 1);
    const initialEnergy = Math.max(
      0,
      randomInRange(random, 0, energyCapacity * (overrides.initialEnergyRatio ?? 0.35)),
    );

    const plant = {
      id: `${species.id}-${plantSimulation.instances.length}`,
      speciesId: species.id,
      species,
      position: [x, groundHeight, z],
      currentHeight: initialHeight,
      currentRadius: baseRadius,
      tipRadius: Math.max(0.04, baseRadius * 0.6),
      energy: initialEnergy,
      spawnSimulationTime: simulationTime,
      baseColor: species.baseColor,
      tipColor: species.tipColor,
    };

    plantSimulation.instances.push(plant);
    return true;
  };

  for (const species of plantSimulation.species) {
    const clusterCount = Math.max(1, Math.floor(species.clusterCount ?? 1));
    const cellsPerAxis = Math.max(1, Math.ceil(Math.sqrt(clusterCount)));
    const cellWidth = baseplateSize / cellsPerAxis;
    const cellHeight = baseplateSize / cellsPerAxis;

    const centers = [];
    for (let index = 0; index < clusterCount; index++) {
      const gx = index % cellsPerAxis;
      const gz = Math.floor(index / cellsPerAxis);
      const baseX = -half + cellWidth * (gx + 0.5);
      const baseZ = -half + cellHeight * (gz + 0.5);
      const jitterX = randomInRange(random, -cellWidth * 0.35, cellWidth * 0.35);
      const jitterZ = randomInRange(random, -cellHeight * 0.35, cellHeight * 0.35);
      centers.push([baseX + jitterX, baseZ + jitterZ]);
    }

    for (let i = centers.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const temp = centers[i];
      centers[i] = centers[j];
      centers[j] = temp;
    }

    const minMembers = Math.max(1, Math.floor(species.clusterSize?.[0] ?? 4));
    const maxMembers = Math.max(minMembers, Math.floor(species.clusterSize?.[1] ?? minMembers + 2));
    const clusterRadius = Math.max(1, species.clusterRadius ?? 3.5);
    let speciesPlaced = 0;

    for (const [centerX, centerZ] of centers) {
      const targetMembers = Math.round(randomInRange(random, minMembers, maxMembers));
      let attempts = 0;
      let placed = 0;
      const maxAttempts = Math.max(targetMembers * 12, 24);
      while (placed < targetMembers && attempts < maxAttempts) {
        attempts += 1;
        const angle = randomInRange(random, 0, Math.PI * 2);
        const distance = Math.sqrt(random()) * clusterRadius;
        const x = centerX + Math.cos(angle) * distance;
        const z = centerZ + Math.sin(angle) * distance;

        if (attemptSpawn(species, x, z)) {
          placed += 1;
          speciesPlaced += 1;
        }
      }
    }

    if (speciesPlaced === 0) {
      const fallbackTarget = Math.max(minMembers, 4);
      const fallbackConstraints = [
        {
          minMask: Math.max(0, (species.minMask ?? 0) * 0.6),
          minSlope: 0.28,
          heightJitterScale: 0.18,
          initialEnergyRatio: 0.4,
          maxElevation: waterSurfaceLevel - 0.05,
        },
        {
          minMask: 0.02,
          minSlope: 0.12,
          heightJitterScale: 0.24,
          initialEnergyRatio: 0.5,
          maxElevation: waterSurfaceLevel - 0.02,
        },
      ];

      for (const constraints of fallbackConstraints) {
        let fallbackAttempts = 0;
        const fallbackLimit = fallbackTarget * 30;
        while (speciesPlaced < fallbackTarget && fallbackAttempts < fallbackLimit) {
          fallbackAttempts += 1;
          const x = randomInRange(random, -half, half);
          const z = randomInRange(random, -half, half);
          if (attemptSpawn(species, x, z, constraints)) {
            speciesPlaced += 1;
          }
        }
        if (speciesPlaced >= fallbackTarget) {
          break;
        }
      }

      if (speciesPlaced === 0) {
        let emergencyAttempts = 0;
        const emergencyLimit = 240;
        while (speciesPlaced === 0 && emergencyAttempts < emergencyLimit) {
          emergencyAttempts += 1;
          const x = randomInRange(random, -half, half);
          const z = randomInRange(random, -half, half);
          if (
            attemptSpawn(species, x, z, {
              minMask: 0,
              minSlope: 0.05,
              heightJitterScale: 0.25,
              initialEnergyRatio: 0.65,
              maxElevation: waterSurfaceLevel - 0.005,
            })
          ) {
            speciesPlaced += 1;
          }
        }
      }
    }
  }

  terrainInfo.plantCount = plantSimulation.instances.length;
  plantSimulation.geometryDirty = true;
  plantSimulation.metrics = computePlantMetrics(plantSimulation.instances);
  if (plantSimulation.instances.length === 0) {
    resetPlantGeometry();
  } else {
    rebuildPlantGeometry();
  }
}

function tickPlants(deltaTime) {
  if (!plantSimulation.instances || plantSimulation.instances.length === 0) {
    plantSimulation.metrics = createEmptyPlantMetrics();
    return;
  }

  const daylight = clamp01(dayNightCycleState.daylight ?? 0);
  const simulationDelta = baseSimulationStep;
  let geometryNeedsUpdate = false;
  let totalEnergyAbsorbed = 0;
  let totalEnergyConsumed = 0;
  let growthEvents = 0;

  for (const plant of plantSimulation.instances) {
    const species = plant.species ?? plantSimulation.speciesById.get(plant.speciesId);
    if (!species) {
      continue;
    }

    const absorptionRate = Math.max(0, species.photosynthesisRate ?? 0);
    const capacity = Math.max(0, species.energyCapacity ?? 1);
    const previousEnergy = Math.max(0, plant.energy ?? 0);
    const absorbedPotential = Math.max(0, absorptionRate * daylight * simulationDelta);
    const nextEnergy = Math.min(capacity, previousEnergy + absorbedPotential);
    plant.energy = nextEnergy;
    totalEnergyAbsorbed += Math.max(0, nextEnergy - previousEnergy);

    const nightThreshold = species.nightThreshold ?? 0.35;
    if (daylight <= nightThreshold && plant.energy > 0 && plant.currentHeight < species.maxHeight) {
      const consumptionRate = Math.max(0, species.growthConsumptionRate ?? 0.4);
      const available = Math.min(plant.energy, consumptionRate * simulationDelta);
      if (available > 0) {
        plant.energy -= available;
        totalEnergyConsumed += available;
        const efficiency = Math.max(0, species.growthEfficiency ?? 0.25);
        const growthAmount = available * efficiency;
        if (growthAmount > 0) {
          const prevHeight = plant.currentHeight ?? 0;
          const nextHeight = Math.min(species.maxHeight, prevHeight + growthAmount);
          const grew = Math.abs(nextHeight - prevHeight) > 0.0005;
          if (grew) {
            plant.currentHeight = nextHeight;
            const growthFactor = clamp01(nextHeight / species.maxHeight);
            const baseRadius = species.baseRadius ?? plant.currentRadius ?? 0.12;
            const nextRadius = Math.max(0.05, baseRadius * (0.75 + growthFactor * 0.45));
            const nextTipRadius = Math.max(0.04, nextRadius * (0.55 + growthFactor * 0.25));
            if (Math.abs(nextRadius - (plant.currentRadius ?? 0)) > 0.0005) {
              plant.currentRadius = nextRadius;
              geometryNeedsUpdate = true;
            }
            if (Math.abs(nextTipRadius - (plant.tipRadius ?? 0)) > 0.0005) {
              plant.tipRadius = nextTipRadius;
              geometryNeedsUpdate = true;
            }
            if (!geometryNeedsUpdate && grew) {
              geometryNeedsUpdate = true;
            }
            growthEvents += 1;
          }
        }
      }
    }
  }

  if (geometryNeedsUpdate) {
    plantSimulation.geometryDirty = true;
  }

  const metrics = computePlantMetrics(plantSimulation.instances);
  metrics.energyAbsorbed = totalEnergyAbsorbed;
  metrics.energyConsumed = totalEnergyConsumed;
  metrics.growthEvents = growthEvents;
  plantSimulation.metrics = metrics;

  void deltaTime;
}

function pickSpecialContent(random, profiles, maxPercent = 0.92) {
  const cappedMax = clamp01(maxPercent);
  if (cappedMax <= 0) {
    return { percent: 0, label: 'none' };
  }

  const totalWeight = profiles.reduce((sum, profile) => sum + profile.weight, 0) || 1;
  let selection = random() * totalWeight;
  let chosenProfile = profiles[profiles.length - 1];
  for (const profile of profiles) {
    selection -= profile.weight;
    if (selection <= 0) {
      chosenProfile = profile;
      break;
    }
  }

  const min = clamp(chosenProfile.min, 0, cappedMax);
  const max = clamp(chosenProfile.max, min, cappedMax);
  if (max <= 0) {
    return { percent: 0, label: chosenProfile.label };
  }

  const percent = max <= min ? min : clamp(randomInRange(random, min, max), min, max);
  return { percent, label: chosenProfile.label };
}

function classifyRockByComposition({ sulfurPercent, phosphorusPercent }) {
  const highSulfur = sulfurPercent >= 0.7;
  const notableSulfur = !highSulfur && sulfurPercent >= 0.12;
  const faintSulfur = !highSulfur && !notableSulfur && sulfurPercent >= 0.01;
  const highPhosphorus = phosphorusPercent >= 0.7;
  const notablePhosphorus = !highPhosphorus && phosphorusPercent >= 0.12;
  const faintPhosphorus = !highPhosphorus && !notablePhosphorus && phosphorusPercent >= 0.01;

  if (highSulfur && highPhosphorus) {
    return 'Depósito sulfurado-fosfático';
  }
  if (highSulfur) {
    return 'Depósito sulfurado masivo';
  }
  if (highPhosphorus) {
    return 'Fosforita masiva';
  }
  if (notableSulfur && notablePhosphorus) {
    return 'Estrato mixto de azufre y fosfatos';
  }
  if (notableSulfur) {
    return 'Roca con vetas de azufre';
  }
  if (notablePhosphorus) {
    return 'Fosforita nodular';
  }
  if (faintSulfur && faintPhosphorus) {
    return 'Sedimento con trazas sulfuradas-fosfáticas';
  }
  if (faintSulfur) {
    return 'Arenisca con trazas de azufre';
  }
  if (faintPhosphorus) {
    return 'Sedimento fosfático disperso';
  }
  return null;
}

function createRockComposition(random, totalMass) {
  const entries = [];
  const available = rockTraceMineralDefinitions.slice();

  const sulfur = pickSpecialContent(random, sulfurContentProfiles, 0.9);
  let sulfurPercent = clamp01(sulfur.percent);

  const phosphorusProfiles = sulfurPercent >= 0.5
    ? phosphorusContentProfiles.map((profile) =>
        profile.label === 'massive'
          ? { ...profile, max: Math.min(profile.max, 0.28), weight: profile.weight * 0.2 }
          : profile,
      )
    : phosphorusContentProfiles;
  const phosphorus = pickSpecialContent(random, phosphorusProfiles, clamp01(0.92 - sulfurPercent));
  let phosphorusPercent = clamp01(phosphorus.percent);

  if (sulfurPercent + phosphorusPercent > 0.94) {
    const scale = 0.94 / (sulfurPercent + phosphorusPercent);
    sulfurPercent *= scale;
    phosphorusPercent *= scale;
  }

  let assignedPercent = sulfurPercent + phosphorusPercent;

  if (sulfurPercent > 0) {
    entries.push({
      name: 'Azufre elemental',
      percent: sulfurPercent,
      mass: sulfurPercent * totalMass,
      primary: false,
    });
  }

  if (phosphorusPercent > 0) {
    entries.push({
      name: 'Fosfatos marinos',
      percent: phosphorusPercent,
      mass: phosphorusPercent * totalMass,
      primary: false,
    });
  }

  const traceBudget = clamp(randomInRange(random, 0.05, 0.22), 0, 0.96);
  let remainingTraceBudget = Math.max(0, Math.min(traceBudget, 0.96 - assignedPercent));
  const traceCount = remainingTraceBudget > 0 ? Math.max(1, Math.floor(randomInRange(random, 2, 4))) : 0;

  for (let i = 0; i < traceCount && available.length > 0 && remainingTraceBudget > 0.001; i++) {
    const index = Math.min(available.length - 1, Math.floor(random() * available.length));
    const mineral = available.splice(index, 1)[0];
    const slotsLeft = traceCount - i - 1;
    const minShare = 0.008;
    const maxShare = Math.max(minShare, remainingTraceBudget - slotsLeft * minShare);
    const share =
      slotsLeft <= 0
        ? remainingTraceBudget
        : Math.min(maxShare, randomInRange(random, minShare, maxShare));
    const clampedShare = Math.max(0, Math.min(remainingTraceBudget, share));
    if (clampedShare <= 0) {
      continue;
    }
    remainingTraceBudget -= clampedShare;
    assignedPercent += clampedShare;
    entries.push({
      name: mineral.name,
      percent: clampedShare,
      mass: clampedShare * totalMass,
      primary: false,
    });
  }

  const matrixPercent = clamp01(1 - assignedPercent);
  const matrixMass = matrixPercent * totalMass;
  entries.unshift({
    name: 'Matriz rocosa',
    percent: matrixPercent,
    mass: matrixMass,
    primary: true,
  });

  const totalPercent = entries.reduce((sum, entry) => sum + entry.percent, 0);
  if (totalPercent > 0 && Math.abs(totalPercent - 1) > 0.001) {
    const normalization = 1 / totalPercent;
    for (const entry of entries) {
      entry.percent = clamp01(entry.percent * normalization);
      entry.mass = entry.percent * totalMass;
    }
    sulfurPercent = clamp01(sulfurPercent * normalization);
    phosphorusPercent = clamp01(phosphorusPercent * normalization);
  }

  const classification = classifyRockByComposition({ sulfurPercent, phosphorusPercent });

  return {
    entries,
    matrixMass,
    sulfurPercent,
    phosphorusPercent,
    classification,
  };
}

function regenerateRocks(seedString, heightfield, maskfield) {
  closeRockInfo();
  rockInstances = [];
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
  const generatedRocks = [];
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
    const baseTone = [
      clamp(baseColorValue + colorOffset * 0.35, 0.1, 0.9),
      clamp(baseColorValue + colorOffset * 0.15, 0.1, 0.9),
      clamp(baseColorValue - colorOffset * 0.2, 0.1, 0.9),
    ];

    const groundHeight = sampleTerrainHeight(x, z);
    const embedFactor = randomInRange(random, -0.25, 0.12);
    const position = [x, groundHeight + scale[1] * embedFactor, z];

    const fallbackVolume = Math.max(0, ((4 / 3) * Math.PI * scale[0] * scale[1] * scale[2]) || 0);
    const density = randomInRange(random, 2200, 2800);
    const rockId = `rock-${generatedRocks.length + 1}`;
    let massResult;
    if (volumetricEngine) {
      massResult = volumetricEngine.computeMass({
        shape: 'ellipsoid',
        center: position,
        dimensions: { radii: scale },
        materialId: 'rock-generic',
        density,
        metadata: {
          type: 'roca',
          id: rockId,
          category: 'rock',
        },
        expectedRange: {
          min: 2,
          max: Math.max(800, fallbackVolume * density * 1.2),
        },
      });
      if (massResult.flagged) {
        reportVolumetricAnomaly(massResult.flagged, {
          type: 'Roca',
          id: rockId,
          name: type.name,
        });
      }
    } else {
      massResult = {
        volume: fallbackVolume,
        rawVolume: fallbackVolume,
        density,
        mass: Math.max(0, fallbackVolume * density),
        clippedRatio: 1,
      };
    }
    const totalMass = Math.max(0, massResult.mass ?? 0);
    const volume = Math.max(0, massResult.volume ?? fallbackVolume);
    const composition = createRockComposition(random, totalMass);
    const tintedColor = tintRockBaseColor(baseTone, composition);

    const rockVertices = createRockGeometry(random, type, scale, rotation, position, tintedColor);
    if (rockVertices.length === 0) {
      continue;
    }

    const boundingRadius = Math.max(scale[0], scale[1], scale[2]) * 1.05;
    const typeLabel = composition.classification
      ? `${composition.classification} (${type.name ?? 'formación rocosa'})`
      : type.name ?? 'Roca';

    generatedRocks.push({
      id: rockId,
      typeName: typeLabel,
      position,
      rotation,
      scale,
      totalMass,
      matrixMass: composition.matrixMass,
      compositionEntries: composition.entries,
      formationSimulationTime: simulationTime,
      density: massResult.density ?? density,
      volume,
      boundingRadius,
      sulfurPercent: composition.sulfurPercent,
      phosphorusPercent: composition.phosphorusPercent,
      massDiagnostics: {
        clippedRatio: massResult.clippedRatio ?? 1,
        gridFootprint: massResult.gridFootprint ?? null,
        flaggedReason: massResult.flagged?.reason ?? null,
      },
    });

    vertices.push(...rockVertices);
    placed += 1;
  }

  const vertexArray = new Float32Array(vertices);
  gl.bindBuffer(gl.ARRAY_BUFFER, rockBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
  rockVertexCount = vertexArray.length / floatsPerVertex;
  rockInstances = generatedRocks;
  terrainInfo.rockCount = generatedRocks.length;
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
    colorVariance,
  } = generateTerrainVertices(seedString);
  gl.bindBuffer(gl.ARRAY_BUFFER, baseplateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  baseplateVertexCount = vertexData.length / floatsPerVertex;
  terrainHeightField = heightfield;
  terrainMaskField = maskfield;
  if (volumetricEngine) {
    volumetricEngine.updateTerrainContext({
      baseplateSize,
      minY: Math.max(0, minHeight),
      maxY: Math.min(maxTerrainHeight, maxHeight),
      heightField: heightfield,
      waterLevel: waterSurfaceLevel,
    });
    terrainInfo.massDiagnostics = volumetricEngine.metrics;
  }
  updateGridBuffers(heightfield);
  rebuildWaterSurface(heightfield);
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
  terrainInfo.surfaceStyle = 'arena clásica';
  if (!terrainInfo.flags || typeof terrainInfo.flags !== 'object') {
    terrainInfo.flags = {};
  }
  terrainInfo.flags.flatColor = true;
  terrainInfo.flags.textured = false;
  terrainInfo.flags.lowSpecular = true;
  terrainInfo.flags.flatLighting = true;
  terrainInfo.colorVariance = colorVariance;
  resetWaterSwells(seedString);
  initializeCloudField(seedString);
  initializeStarField(seedString);
  regenerateRocks(seedString, heightfield, maskfield);
  regeneratePlants(seedString, heightfield, maskfield);
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

updateDayNightCycleState(simulationTime);

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

const initialCameraPosition = [0, 5, 20];

let yaw = 0; // Comienza mirando hacia -Z
let pitch = -0.35; // Inclina ligeramente la cámara hacia abajo para mostrar la baseplate inicial
const cameraPosition = initialCameraPosition.slice();

const pointerSensitivity = 0.002;

const pointerLockCursorScale = (() => {
  const existing = runtimeGlobal.pointerLockCursorScale;
  if (existing && typeof existing === 'object') {
    if (!Number.isFinite(existing.x)) {
      existing.x = 1;
    }
    if (!Number.isFinite(existing.y)) {
      existing.y = 1;
    }
    return existing;
  }
  const scale = {
    x: 1,
    y: 1,
    targetX: 1,
    targetY: 1,
    set(nextX = 1, nextY = 1) {
      this.x = Number.isFinite(nextX) && nextX > 0 ? nextX : 1;
      this.y = Number.isFinite(nextY) && nextY > 0 ? nextY : 1;
      this.targetX = this.x;
      this.targetY = this.y;
    },
  };
  runtimeGlobal.pointerLockCursorScale = scale;
  return scale;
})();

function resetPointerLockScale() {
  if (typeof pointerLockCursorScale?.set === 'function') {
    pointerLockCursorScale.set(1, 1);
  } else if (pointerLockCursorScale) {
    pointerLockCursorScale.x = 1;
    pointerLockCursorScale.y = 1;
  }
}
const moveSpeed = 12;

function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]);
  if (length === 0) return [0, 0, 0];
  return [v[0] / length, v[1] / length, v[2] / length];
}

function normalize2D(v) {
  const length = Math.hypot(v[0], v[1]);
  if (length === 0) {
    return [0, 1];
  }
  return [v[0] / length, v[1] / length];
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
    pointerCanvasPosition.x = clamp(pointerCanvasPosition.x, 0, width);
    pointerCanvasPosition.y = clamp(pointerCanvasPosition.y, 0, height);
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
  const trustedInteraction = !event || Boolean(event.isTrusted);
  if (event?.detail >= 2) {
    if (trustedInteraction) {
      handleAmbientMusicUserGesture();
    }
    return;
  }
  if (event) {
    event.preventDefault();
  }
  dismissTutorialOverlay();
  if (document.pointerLockElement !== canvas) {
    try {
      canvas.focus?.();
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.warn('No se pudo enfocar el lienzo antes de pointer lock', error);
      }
    }
    try {
      canvas.requestPointerLock();
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.warn('Error al solicitar pointer lock', error);
      }
    }
  }
  if (trustedInteraction) {
    handleAmbientMusicUserGesture();
  }
}

canvas.addEventListener('click', (event) => {
  requestCameraControl(event);
  if (fatalRuntimeError) {
    pendingSelectionForClick = null;
    return;
  }
  if (event.button !== 0) {
    pendingSelectionForClick = null;
    return;
  }
  if (suppressNextSelectionClick) {
    suppressNextSelectionClick = false;
    pendingSelectionForClick = null;
    return;
  }
  const pointer = getPointerPosition(event);
  const plantSelection = pendingPlantSelection ?? pickPlantAt(pointer.x, pointer.y);
  pendingPlantSelection = null;
  if (plantSelection && plantSelection.plant) {
    selectedBlock = null;
    selectionHighlightVertexCount = 0;
    if (selectionInfoPanel) {
      selectionInfoPanel.hidden = true;
    }
    if (typeof window !== 'undefined') {
      window.__selectedSquare = null;
    }
    closeWaterInfo();
    openPlantInfo(plantSelection.plant, event);
    return;
  }

  const rockSelection = pendingRockSelection ?? pickRockAt(pointer.x, pointer.y);
  pendingRockSelection = null;
  if (rockSelection && rockSelection.rock) {
    selectedBlock = null;
    selectionHighlightVertexCount = 0;
    if (selectionInfoPanel) {
      selectionInfoPanel.hidden = true;
    }
    if (typeof window !== 'undefined') {
      window.__selectedSquare = null;
    }
    openRockInfo(rockSelection.rock, event);
    return;
  }

  const selection = pendingSelectionForClick ?? selectBlockAtScreen(pointer.x, pointer.y);
  pendingSelectionForClick = null;
  closeRockInfo();
  closePlantInfo();
  if (selection && selection.underwater) {
    openWaterInfo(selection, event);
  } else {
    closeWaterInfo();
  }
});

canvas.addEventListener('pointerdown', (event) => {
  if (fatalRuntimeError) {
    pendingSelectionForClick = null;
    return;
  }
  if (event.button !== 0) {
    pendingSelectionForClick = null;
    return;
  }
  if (suppressNextSelectionPointerDown) {
    suppressNextSelectionPointerDown = false;
    pendingSelectionForClick = null;
    return;
  }
  const pointer = getPointerPosition(event);
  const plantSelection = pickPlantAt(pointer.x, pointer.y);
  if (plantSelection && plantSelection.plant) {
    pendingPlantSelection = plantSelection;
    pendingRockSelection = null;
    pendingSelectionForClick = null;
    return;
  }
  pendingPlantSelection = null;
  const rockSelection = pickRockAt(pointer.x, pointer.y);
  if (rockSelection && rockSelection.rock) {
    pendingRockSelection = rockSelection;
    pendingSelectionForClick = null;
    return;
  }
  pendingRockSelection = null;
  pendingSelectionForClick = selectBlockAtScreen(pointer.x, pointer.y);
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

if (uiDebugHighlightToggle) {
  uiDebugHighlightToggle.addEventListener('change', (event) => {
    setUiDebugHighlight(event.target.checked);
  });
}

if (uiDebugTrackToggle) {
  uiDebugTrackToggle.addEventListener('change', (event) => {
    setUiDebugTracking(event.target.checked);
  });
}

if (uiDebugLogButton) {
  uiDebugLogButton.addEventListener('click', () => {
    const snapshot = refreshUiDebugSnapshot();
    const summary = getUiDebugSnapshotObject(snapshot);
    console.info('[UI DEBUG] instantánea de elementos', summary);
    if (typeof console.table === 'function') {
      console.table(summary);
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

if (plantInfoCloseButton) {
  plantInfoCloseButton.addEventListener('click', (event) => {
    closePlantInfo({ restoreCamera: true, event });
  });
}

if (rockInfoCloseButton) {
  rockInfoCloseButton.addEventListener('click', (event) => {
    closeRockInfo({ restoreCamera: true, event });
  });
}

const initialTranslucentTerrain = debugTerrainToggle
  ? Boolean(debugTerrainToggle.checked)
  : false;
applyTranslucentTerrainSetting(initialTranslucentTerrain);

let pointerLockErrors = 0;
document.addEventListener('pointerlockerror', () => {
  pointerLockErrors += 1;
  resetPointerLockScale();
  showTutorialOverlay();
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  if (locked) {
    dismissTutorialOverlay();
    pointerCanvasPosition.x = canvas.width * 0.5;
    pointerCanvasPosition.y = canvas.height * 0.5;
  } else if (!overlayDismissed) {
    showTutorialOverlay();
    pointerCanvasPosition.x = clamp(pointerCanvasPosition.x, 0, canvas.width);
    pointerCanvasPosition.y = clamp(pointerCanvasPosition.y, 0, canvas.height);
  } else {
    applyTutorialState(false);
    resetPointerLockScale();
  }
});

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === canvas) {
    const scaleX = Number.isFinite(pointerLockCursorScale.x)
      ? pointerLockCursorScale.x
      : 1;
    const scaleY = Number.isFinite(pointerLockCursorScale.y)
      ? pointerLockCursorScale.y
      : 1;
    pointerCanvasPosition.x = clamp(
      pointerCanvasPosition.x + (event.movementX || 0) * scaleX,
      0,
      canvas.width,
    );
    pointerCanvasPosition.y = clamp(
      pointerCanvasPosition.y + (event.movementY || 0) * scaleY,
      0,
      canvas.height,
    );
    yaw += event.movementX * pointerSensitivity;
    pitch -= event.movementY * pointerSensitivity;
    const limit = Math.PI / 2 - 0.01;
    pitch = clamp(pitch, -limit, limit);
  } else {
    const rect = canvas.getBoundingClientRect?.() ?? { left: 0, top: 0 };
    const x = (event.clientX ?? rect.left) - rect.left;
    const y = (event.clientY ?? rect.top) - rect.top;
    const clampedX = clamp(x, 0, canvas.width);
    const clampedY = clamp(y, 0, canvas.height);
    pointerCanvasPosition.x = clampedX;
    pointerCanvasPosition.y = clampedY;
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
let ticksLastFrame = 0;

simulationTime = dayNightCycleDuration * defaultDayStartFraction;
lightingDiagnostics.startupNormalizedTime = defaultDayStartFraction;
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
  camera: {
    position: [cameraPosition[0], cameraPosition[1], cameraPosition[2]],
    yaw,
    pitch,
    near: CAMERA_NEAR_PLANE,
    far: CAMERA_BASE_FAR_PLANE,
    starMargin: CAMERA_STAR_MARGIN,
    starFarthest: 0,
    starShortfall: 0,
    adjustments: 0,
    marginEstimate: cameraDiagnostics.metrics?.marginEstimate ?? CAMERA_STAR_MARGIN,
    failedDiagnostics: cameraDiagnostics.metrics?.failedUpdates ?? 0,
    clip: snapshotCameraClipDiagnostics(),
    clipFlags: {
      overrideActive: Boolean(cameraDiagnostics.flags?.overrideActive),
      invalidOrdering: Boolean(cameraDiagnostics.flags?.invalidOrdering),
    },
    clipOverrides: {
      count: Math.max(0, cameraDiagnostics.overrides ?? 0),
      lastTimestamp: cameraDiagnostics.lastOverrideTimestamp ?? null,
    },
    flags: {
      frustumClipping: Boolean(cameraDiagnostics.flags?.frustumClipping),
      baseFrustumExceeded: Boolean(cameraDiagnostics.flags?.baseFrustumExceeded),
    },
  },
  dayNight: dayNightCycleState,
  terrain: {
    surfaceStyle: terrainInfo.surfaceStyle,
    colorVariance: terrainInfo.colorVariance,
    minHeight: terrainInfo.minHeight,
    maxHeight: terrainInfo.maxHeight,
    vertexCount: terrainInfo.vertexCount,
    visibleVertices: terrainInfo.visibleVertices,
    visibleRatio: terrainInfo.visibleVertexRatio,
    flags:
      terrainInfo.flags && typeof terrainInfo.flags === 'object' ? { ...terrainInfo.flags } : {},
    flatLighting: {
      color: terrainInfo.flatLighting.color.slice(),
      luma: terrainInfo.flatLighting.luma,
      daylight: terrainInfo.flatLighting.daylight,
      moonlight: terrainInfo.flatLighting.moonlight,
    },
  },
  weather: {
    windActive: weatherState.wind.metrics.active,
    windSpawned: weatherState.wind.metrics.spawned,
    windCulled: weatherState.wind.metrics.culled,
    windGeometryRejected: weatherState.wind.metrics.geometryRejected,
    clouds: weatherState.clouds.metrics?.count ?? 0,
    cloudPuffs: weatherState.clouds.metrics?.puffs ?? 0,
    cloudClumps: weatherState.clouds.metrics?.clumps ?? 0,
    cloudMetrics: weatherState.clouds.metrics ?? {},
    cloudsHealthy: Boolean(weatherState.clouds.flags?.geometryValid),
    swells: {
      active: waterSwellState?.metrics?.active ?? 0,
      spawned: waterSwellState?.metrics?.spawned ?? 0,
      culled: waterSwellState?.metrics?.culled ?? 0,
      overflowed: waterSwellState?.metrics?.overflowed ?? 0,
      bufferUtilization: waterSwellState?.metrics?.bufferUtilization ?? 0,
      pending: waterSwellState?.metrics?.pending ?? 0,
      lastSpawnTime: waterSwellState?.metrics?.lastSpawnTime ?? null,
    },
    diagnostics: {
      swells: {
        resets: waterSwellDiagnostics.resets,
        oversubscribedFrames: waterSwellDiagnostics.oversubscribedFrames,
        lastUpdateDurationMs: waterSwellDiagnostics.lastUpdateDurationMs,
        lastError: waterSwellDiagnostics.lastError,
        spawnBacklog: Boolean(waterSwellState?.flags?.spawnBacklog),
        overCapacity: Boolean(waterSwellState?.flags?.overCapacity),
      },
    },
  },
  debug: {
    panel: {
      updates: 0,
      lastUpdateTime: 0,
      lastDeltaTime: 0,
      heartbeatFailures: 0,
      lastHeartbeatTime: 0,
      lastError: null,
    },
  },
  audio: {
    enabled: ambientAudioState.enabled,
    musicStatus: ambientAudioState.diagnostics.musicStatus,
    pendingGesture: ambientAudioState.diagnostics.pendingGesture,
    lastResumeAttempt: ambientAudioState.diagnostics.lastResumeAttempt,
  },
  celestial: {
    sunAltitude: dayNightCycleState.sunAltitude,
    moonAltitude: dayNightCycleState.moonAltitude,
    sunlight: dayNightCycleState.sunlightIntensity,
    moonlight: dayNightCycleState.moonlightIntensity,
    derivativesSupported,
    skyboxMetrics: dayNightCycleState.metrics,
    skyboxHealthy: dayNightCycleState.flags.skyGradientValid,
    templateHealthy: celestialGeometryState.flags.templateValid,
    sunGeometryValid: celestialGeometryState.flags.sunGeometryValid,
    moonGeometryValid: celestialGeometryState.flags.moonGeometryValid,
    geometryMetrics: celestialGeometryState.metrics,
    stars: starFieldState.metrics.count,
    starMetrics: starFieldState.metrics,
    starsHealthy: starFieldState.flags.geometryValid,
    starRadius: STAR_FIELD_RADIUS,
    starRadiusMin: STAR_FIELD_MIN_RADIUS,
    starMargin: STAR_FIELD_MARGIN,
    starClipSafe: STAR_FIELD_RADIUS + 1 <= CAMERA_FAR_PLANE,
  },
  lighting: {
    global: lightingDiagnostics.latestLightColor.slice(),
    ambient: lightingDiagnostics.latestAmbientColor.slice(),
    daylight: lightingDiagnostics.latestDaylight,
    sunAltitude: lightingDiagnostics.latestSunAltitude,
    startupNormalizedTime: lightingDiagnostics.startupNormalizedTime,
    startupLightColor: lightingDiagnostics.startupLightColor.slice(),
    startupSunAltitude: lightingDiagnostics.startupSunAltitude,
  },
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

function formatDurationHMS(totalSeconds) {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
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
  if (!plantInfoPanel?.hidden) {
    updatePlantInfoPanel();
  }
  if (!rockInfoPanel?.hidden) {
    updateRockInfoPanel();
  }
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
  tickPlants(deltaTime);
}

function computeCameraFrustum() {
  const farthestStar = Math.max(0, starFieldState.metrics?.farthestDistance ?? STAR_FIELD_RADIUS);
  const desiredFar = Math.max(CAMERA_BASE_FAR_PLANE, farthestStar + CAMERA_STAR_MARGIN);
  const near = CAMERA_NEAR_PLANE;
  const previousFar = cameraDiagnostics.far;

  cameraDiagnostics.near = near;
  cameraDiagnostics.metrics.starFarthest = farthestStar;
  cameraDiagnostics.metrics.starShortfall = Math.max(0, farthestStar - CAMERA_BASE_FAR_PLANE);
  cameraDiagnostics.starMargin = desiredFar - farthestStar;
  cameraDiagnostics.flags.baseFrustumExceeded = cameraDiagnostics.metrics.starShortfall > 0.01;
  cameraDiagnostics.flags.frustumClipping = cameraDiagnostics.starMargin < 5;
  cameraDiagnostics.metrics.marginEstimate = cameraDiagnostics.starMargin;

  if (Math.abs(desiredFar - previousFar) > 0.5) {
    cameraDiagnostics.adjustments += 1;
  }

  cameraDiagnostics.far = desiredFar;
  cameraDiagnostics.lastUpdateTime = getTimestamp();
  cameraDiagnostics.metrics.lastUpdateTime = cameraDiagnostics.lastUpdateTime;

  starFieldState.metrics.frustumMargin = cameraDiagnostics.starMargin;
  starFieldState.metrics.baseFarShortfall = cameraDiagnostics.metrics.starShortfall;
  starFieldState.metrics.farthestDistance = farthestStar;
  starFieldState.flags.frustumSafe = !cameraDiagnostics.flags.frustumClipping;

  if (cameraDiagnostics.flags.baseFrustumExceeded && !cameraDiagnostics.warnedFrustum) {
    recordRuntimeIssue(
      'warning',
      'camera-frustum',
      new Error(
        `Plano lejano base insuficiente para estrellas (déficit ${cameraDiagnostics.metrics.starShortfall.toFixed(
          1,
        )} m); se amplió automáticamente a ${desiredFar.toFixed(1)} m.`,
      ),
    );
    cameraDiagnostics.warnedFrustum = true;
  } else if (!cameraDiagnostics.flags.baseFrustumExceeded) {
    cameraDiagnostics.warnedFrustum = false;
  }

  return { near, far: desiredFar };
}

function update(deltaTime) {
  const frustum = computeCameraFrustum();
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

  if (Number.isFinite(deltaTime)) {
    waterAnimationTime += deltaTime;
    updateWaterSwells(deltaTime);
    updateWindEffects(deltaTime);
    updateCloudField(deltaTime);
  } else {
    updateWaterSwells(0);
    updateWindEffects(0);
    updateCloudField(0);
  }

  const isUnderwater = cameraPosition[1] < waterSurfaceLevel - 0.05;
  updateAmbientAudioMix(isUnderwater);

  const target = add(cameraPosition, forwardDirection);
  const projection = createPerspectiveMatrix(
    (60 * Math.PI) / 180,
    canvas.width / canvas.height,
    CAMERA_NEAR_PLANE,
    CAMERA_FAR_PLANE,
  );
  const view = createLookAtMatrix(cameraPosition, target, worldUp);
  const viewProjection = multiplyMatrices(projection, view);
  inverseViewProjectionMatrix = invertMatrix(viewProjection);
  lastViewProjectionMatrix = viewProjection;

  if (skyboxProgram) {
    const viewNoTranslation = new Float32Array(view);
    viewNoTranslation[12] = 0;
    viewNoTranslation[13] = 0;
    viewNoTranslation[14] = 0;
    skyboxViewProjectionMatrix = multiplyMatrices(projection, viewNoTranslation);
  } else {
    skyboxViewProjectionMatrix = null;
  }

  gl.uniformMatrix4fv(viewProjectionUniform, false, viewProjection);

  cameraClipPlanes.near = CAMERA_NEAR_PLANE;
  cameraClipPlanes.far = CAMERA_FAR_PLANE;
  cameraClipPlanes.lastUpdated =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
}

function bindGeometry(buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, vertexStride, 0);
  gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, vertexStride, 12);
}

function renderStarField() {
  if (!uniformLocations.renderMode || typeof gl.uniform1i !== 'function') {
    return false;
  }

  if (starFieldState.needsUpload) {
    rebuildStarFieldGeometry();
  }

  if (starVertexCount <= 0) {
    starFieldState.metrics.lastVisibility = 0;
    return false;
  }

  const daylight = clamp01(dayNightCycleState.daylight ?? 0);
  const moonlight = clamp01(dayNightCycleState.moonlightIntensity ?? 0);
  const visibility = clamp01(1 - daylight * 1.35 + moonlight * 0.22);
  starFieldState.metrics.lastVisibility = visibility;

  if (visibility <= 0.001) {
    return false;
  }

  if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(surfaceSpecularStrengthUniform, 0);
  }
  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, visibility * 0.82);
  }
  if (emissiveStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(emissiveStrengthUniform, 0.6 + visibility * 0.55);
  }

  gl.uniform1i(uniformLocations.renderMode, renderModes.celestial);
  bindGeometry(starBuffer);
  gl.drawArrays(gl.TRIANGLES, 0, starVertexCount);
  drawStats.celestial += 1;
  drawStats.total += 1;
  starFieldState.metrics.lastDrawTime = getTimestamp();

  if (emissiveStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(emissiveStrengthUniform, 0);
  }
  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, 1);
  }

  return true;
}

function renderSkybox() {
  if (!skyboxProgram || !skyboxBuffer || skyboxVertexCount <= 0 || !skyboxViewProjectionMatrix) {
    return;
  }

  const skyGradient = dayNightCycleState.skyGradient;
  if (
    !skyGradient ||
    !Array.isArray(skyGradient.top) ||
    !Array.isArray(skyGradient.middle) ||
    !Array.isArray(skyGradient.bottom)
  ) {
    return;
  }

  if (typeof gl.depthMask === 'function') {
    gl.depthMask(false);
  }
  if (typeof gl.depthFunc === 'function') {
    gl.depthFunc(gl.LEQUAL);
  }

  gl.useProgram(skyboxProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxBuffer);
  gl.vertexAttribPointer(skyboxPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(skyboxPositionAttribute);

  if (skyboxViewProjectionUniform) {
    gl.uniformMatrix4fv(skyboxViewProjectionUniform, false, skyboxViewProjectionMatrix);
  }
  if (skyboxTopColorUniform) {
    gl.uniform3f(
      skyboxTopColorUniform,
      skyGradient.top[0],
      skyGradient.top[1],
      skyGradient.top[2],
    );
  }
  if (skyboxMiddleColorUniform) {
    gl.uniform3f(
      skyboxMiddleColorUniform,
      skyGradient.middle[0],
      skyGradient.middle[1],
      skyGradient.middle[2],
    );
  }
  if (skyboxBottomColorUniform) {
    gl.uniform3f(
      skyboxBottomColorUniform,
      skyGradient.bottom[0],
      skyGradient.bottom[1],
      skyGradient.bottom[2],
    );
  }

  gl.drawArrays(gl.TRIANGLES, 0, skyboxVertexCount);

  if (typeof gl.disableVertexAttribArray === 'function' && skyboxPositionAttribute >= 0) {
    gl.disableVertexAttribArray(skyboxPositionAttribute);
  }

  if (typeof gl.depthMask === 'function') {
    gl.depthMask(true);
  }
  if (typeof gl.depthFunc === 'function') {
    gl.depthFunc(defaultDepthFunc);
  }

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttribute);
  gl.enableVertexAttribArray(colorAttribute);
  if (viewProjectionUniform && lastViewProjectionMatrix) {
    gl.uniformMatrix4fv(viewProjectionUniform, false, lastViewProjectionMatrix);
  }
}

function renderCelestialBodies() {
  updateCelestialGeometry();
  if (!uniformLocations.renderMode || typeof gl.uniform1i !== 'function') {
    return;
  }

  const resetSpecular = () => {
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
    }
    if (emissiveStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(emissiveStrengthUniform, 0);
    }
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
    }
    gl.uniform1i(uniformLocations.renderMode, renderModes.terrain);
  };

  if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(surfaceSpecularStrengthUniform, 0);
  }
  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, 1);
  }

  renderStarField();

  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, 1);
  }

  if (sunVertexCount > 0) {
    gl.uniform1i(uniformLocations.renderMode, renderModes.celestial);
    if (emissiveStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(emissiveStrengthUniform, 1.65);
    }
    bindGeometry(sunBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, sunVertexCount);
    drawStats.celestial += 1;
    drawStats.total += 1;
  }

  if (moonVertexCount > 0) {
    gl.uniform1i(uniformLocations.renderMode, renderModes.celestial);
    if (emissiveStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(emissiveStrengthUniform, 0.45);
    }
    bindGeometry(moonBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, moonVertexCount);
    drawStats.celestial += 1;
    drawStats.total += 1;
  }

  resetSpecular();
}

function renderCloudLayer() {
  if (!uniformLocations.renderMode || typeof gl.uniform1i !== 'function') {
    return;
  }
  if (weatherState.clouds.needsUpload) {
    rebuildCloudGeometry();
  }
  if (cloudVertexCount <= 0) {
    return;
  }

  const blendWasEnabled = terrainRenderState.translucent;
  if (!blendWasEnabled && typeof gl.enable === 'function') {
    gl.enable(gl.BLEND);
    if (typeof gl.blendFunc === 'function') {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
  }
  if (typeof gl.depthMask === 'function') {
    gl.depthMask(false);
  }
  gl.uniform1i(uniformLocations.renderMode, renderModes.cloud);
  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, 0.68);
  }
  if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(surfaceSpecularStrengthUniform, 0.25);
  }
  bindGeometry(cloudBuffer);
  gl.drawArrays(gl.TRIANGLES, 0, cloudVertexCount);
  drawStats.clouds += 1;
  drawStats.total += 1;

  if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
  }
  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
  }
  if (typeof gl.depthMask === 'function') {
    gl.depthMask(true);
  }
  if (!blendWasEnabled && typeof gl.disable === 'function') {
    gl.disable(gl.BLEND);
  }
  gl.uniform1i(uniformLocations.renderMode, renderModes.terrain);
}

function renderWindStreaks() {
  if (!uniformLocations.renderMode || typeof gl.uniform1i !== 'function') {
    return;
  }
  if (!weatherState.wind.active || weatherState.wind.active.length === 0) {
    return;
  }

  const now = waterAnimationTime;
  let drawn = 0;
  let blendingEnabled = terrainRenderState.translucent;
  if (!blendingEnabled && typeof gl.enable === 'function') {
    gl.enable(gl.BLEND);
    blendingEnabled = true;
  }
  if (typeof gl.blendFunc === 'function') {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  if (typeof gl.depthMask === 'function') {
    gl.depthMask(false);
  }

  for (const effect of weatherState.wind.active) {
    const geometry = composeWindStreakGeometry(effect, now);
    if (!geometry) {
      weatherState.wind.metrics.geometryRejected += 1;
      continue;
    }
    try {
      gl.bindBuffer(gl.ARRAY_BUFFER, windBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.DYNAMIC_DRAW);
    } catch (error) {
      recordRuntimeIssue('warning', 'wind-buffer', error);
      continue;
    }
    windVertexCount = geometry.vertices.length / floatsPerVertex;
    if (windVertexCount <= 0) {
      continue;
    }
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, geometry.alpha);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0);
    }
    gl.uniform1i(uniformLocations.renderMode, renderModes.wind);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, vertexStride, 0);
    gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, vertexStride, 12);
    gl.drawArrays(gl.TRIANGLES, 0, windVertexCount);
    drawn += 1;
  }

  if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
  }
  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
  }
  if (typeof gl.depthMask === 'function') {
    gl.depthMask(true);
  }
  if (blendingEnabled && !terrainRenderState.translucent && typeof gl.disable === 'function') {
    gl.disable(gl.BLEND);
  }
  gl.uniform1i(uniformLocations.renderMode, renderModes.terrain);

  if (drawn > 0) {
    drawStats.wind += drawn;
    drawStats.total += drawn;
  }
}

function computeTerrainFlatLighting() {
  const lightColor = dayNightCycleState.lightColor || [1, 1, 1];
  const ambient = dayNightCycleState.ambientLightColor || [0.2, 0.24, 0.3];
  const sunColor = dayNightCycleState.sunLightColor || [1, 0.95, 0.85];
  const moonColor = dayNightCycleState.moonLightColor || [0.45, 0.52, 0.78];
  const daylight = clamp01(dayNightCycleState.sunlightIntensity ?? dayNightCycleState.daylight ?? 0);
  const moonlight = clamp01(dayNightCycleState.moonlightIntensity ?? 0);

  const baseMix = 0.82;
  const ambientMix = 0.45;
  const sunMix = 0.38 * daylight;
  const moonMix = 0.22 * moonlight;
  const brightnessFloor = 0.18 + daylight * 0.45 + moonlight * 0.18;

  const color = [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    const raw =
      lightColor[i] * baseMix + ambient[i] * ambientMix + sunColor[i] * sunMix + moonColor[i] * moonMix;
    color[i] = clamp(Math.max(raw, brightnessFloor), 0, 1.6);
  }

  const luma = clamp(color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722, 0, 1.6);
  return { color, luma, daylight, moonlight };
}

function render() {
  drawStats.terrain = 0;
  drawStats.water = 0;
  drawStats.rocks = 0;
  drawStats.plants = 0;
  drawStats.wind = 0;
  drawStats.clouds = 0;
  drawStats.celestial = 0;
  drawStats.blockGrid = 0;
  drawStats.chunkGrid = 0;
  drawStats.selection = 0;
  drawStats.total = 0;
  terrainRenderState.metrics.flatShadedDrawsLastFrame = 0;
  terrainRenderState.flatShading = false;
  if (terrainFlatShadingUniform && typeof gl.uniform1i === 'function') {
    gl.uniform1i(terrainFlatShadingUniform, 0);
  }

  const skyColor = dayNightCycleState.skyColor;
  if (skyColor) {
    gl.clearColor(skyColor[0], skyColor[1], skyColor[2], 1);
  }

  if (ambientLightColorUniform) {
    const ambient = dayNightCycleState.ambientLightColor || [0.2, 0.24, 0.3];
    gl.uniform3f(ambientLightColorUniform, ambient[0], ambient[1], ambient[2]);
  }
  if (sunLightDirectionUniform) {
    const dir = dayNightCycleState.sunDirection || [0, -1, 0];
    gl.uniform3f(sunLightDirectionUniform, dir[0], dir[1], dir[2]);
  }
  if (sunLightColorUniform) {
    const sunColor = dayNightCycleState.sunLightColor || [1, 0.95, 0.85];
    gl.uniform3f(sunLightColorUniform, sunColor[0], sunColor[1], sunColor[2]);
  }
  if (moonLightDirectionUniform) {
    const dir = dayNightCycleState.moonDirection || [0, 1, 0];
    gl.uniform3f(moonLightDirectionUniform, dir[0], dir[1], dir[2]);
  }
  if (moonLightColorUniform) {
    const moonColor = dayNightCycleState.moonLightColor || [0.45, 0.52, 0.78];
    gl.uniform3f(moonLightColorUniform, moonColor[0], moonColor[1], moonColor[2]);
  }
  if (sunSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(sunSpecularStrengthUniform, dayNightCycleState.sunSpecularStrength ?? 0.6);
  }
  if (moonSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(moonSpecularStrengthUniform, dayNightCycleState.moonSpecularStrength ?? 0.3);
  }
  lightingDiagnostics.lastAppliedSunSpecular = dayNightCycleState.sunSpecularStrength ?? 0.6;
  lightingDiagnostics.lastAppliedMoonSpecular = dayNightCycleState.moonSpecularStrength ?? 0.3;
  if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
  }
  if (emissiveStrengthUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(emissiveStrengthUniform, 0);
  }
  if (viewPositionUniform) {
    gl.uniform3f(viewPositionUniform, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
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

  const terrainFlatLighting = computeTerrainFlatLighting();
  terrainRenderState.metrics.lastFlatLightColor = terrainFlatLighting.color.slice();
  terrainRenderState.metrics.lastFlatLightLuma = terrainFlatLighting.luma;
  terrainRenderState.metrics.lastDaylight = terrainFlatLighting.daylight;
  terrainRenderState.metrics.lastMoonlight = terrainFlatLighting.moonlight;
  if (terrainInfo.flatLighting) {
    terrainInfo.flatLighting.color = terrainFlatLighting.color.slice();
    terrainInfo.flatLighting.luma = terrainFlatLighting.luma;
    terrainInfo.flatLighting.daylight = terrainFlatLighting.daylight;
    terrainInfo.flatLighting.moonlight = terrainFlatLighting.moonlight;
  }
  if (terrainFlatLightColorUniform && typeof gl.uniform3f === 'function') {
    gl.uniform3f(
      terrainFlatLightColorUniform,
      terrainFlatLighting.color[0],
      terrainFlatLighting.color[1],
      terrainFlatLighting.color[2],
    );
  }

  if (patternTimeUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(patternTimeUniform, waterAnimationTime ?? 0);
  }
  if (waterTimeUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(waterTimeUniform, waterAnimationTime ?? 0);
  }
  if (waterSwellCountUniform && typeof gl.uniform1i === 'function') {
    gl.uniform1i(waterSwellCountUniform, waterSwellActiveCount);
  }
  if (waterSwellOriginsUniform && typeof gl.uniform4fv === 'function') {
    gl.uniform4fv(waterSwellOriginsUniform, waterSwellUniformBuffers.origins);
  }
  if (waterSwellParamsUniform && typeof gl.uniform4fv === 'function') {
    gl.uniform4fv(waterSwellParamsUniform, waterSwellUniformBuffers.params);
  }
  if (waterSwellStateUniform && typeof gl.uniform4fv === 'function') {
    gl.uniform4fv(waterSwellStateUniform, waterSwellUniformBuffers.state);
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderSkybox();
  renderCelestialBodies();
  renderCloudLayer();

  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
  }

  if (uniformLocations.renderMode && typeof gl.uniform1i === 'function') {
    gl.uniform1i(uniformLocations.renderMode, renderModes.terrain);
  }

  uploadWaterSurfaceBuffer();

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
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0);
    }
    if (terrainFlatShadingUniform && typeof gl.uniform1i === 'function') {
      gl.uniform1i(terrainFlatShadingUniform, 1);
    }
    terrainRenderState.flatShading = true;
    terrainRenderState.metrics.flatShadedDrawsLastFrame += 1;
    terrainRenderState.metrics.flatShadedDrawsTotal += 1;
    bindGeometry(baseplateBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, baseplateVertexCount);
    drawStats.terrain += 1;
    drawStats.total += 1;
    terrainRenderState.flatShading = false;
    if (terrainFlatShadingUniform && typeof gl.uniform1i === 'function') {
      gl.uniform1i(terrainFlatShadingUniform, 0);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
    }
  }

  if (waterVertexCount > 0) {
    const blendingAlreadyActive = terrainRenderState.translucent;
    let temporarilyEnabledBlend = false;
    if (typeof gl.enable === 'function') {
      if (!blendingAlreadyActive) {
        gl.enable(gl.BLEND);
        temporarilyEnabledBlend = true;
      }
      if (typeof gl.blendFunc === 'function') {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    }

    let depthMaskChanged = false;
    if (typeof gl.depthMask === 'function') {
      gl.depthMask(false);
      depthMaskChanged = true;
    }

    if (uniformLocations.renderMode && typeof gl.uniform1i === 'function') {
      gl.uniform1i(uniformLocations.renderMode, renderModes.water);
    }
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, waterAlpha);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 1.25);
    }

    bindGeometry(waterBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, waterVertexCount);
    drawStats.water += 1;
    drawStats.total += 1;

    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
    }
    if (uniformLocations.renderMode && typeof gl.uniform1i === 'function') {
      gl.uniform1i(uniformLocations.renderMode, renderModes.terrain);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
    }

    if (depthMaskChanged) {
      gl.depthMask(true);
    }
    if (temporarilyEnabledBlend && typeof gl.disable === 'function') {
      gl.disable(gl.BLEND);
    }
  }

  renderWindStreaks();

  if (rockVertexCount > 0) {
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, 1);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0.55);
    }
    bindGeometry(rockBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, rockVertexCount);
    drawStats.rocks += 1;
    drawStats.total += 1;
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
    }
  }

  if (plantSimulation.geometryDirty) {
    rebuildPlantGeometry();
  }

  if (plantVertexCount > 0) {
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, 1);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0.3);
    }
    bindGeometry(plantBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, plantVertexCount);
    drawStats.plants += 1;
    drawStats.total += 1;
    if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
    }
    if (surfaceSpecularStrengthUniform && typeof gl.uniform1f === 'function') {
      gl.uniform1f(surfaceSpecularStrengthUniform, 0.45);
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

  if (terrainAlphaUniform && typeof gl.uniform1f === 'function') {
    gl.uniform1f(terrainAlphaUniform, terrainRenderState.alpha);
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

  debugConsoleDiagnostics.lastUpdateTime = Date.now();
  debugConsoleDiagnostics.lastDeltaTime = Number.isFinite(deltaTime) ? deltaTime : 0;
  debugConsoleDiagnostics.updates = Math.max(
    0,
    (debugConsoleDiagnostics.updates ?? 0) + 1,
  );
  debugConsoleDiagnostics.lastError = null;

  fpsAccumulator += deltaTime;
  fpsSamples += 1;
  if (fpsAccumulator >= 0.5) {
    displayedFps = fpsSamples / fpsAccumulator;
    fpsAccumulator = 0;
    fpsSamples = 0;
  }

  const pointerLocked = document.pointerLockElement === canvas;
  const movementEntries =
    movementState && typeof movementState === 'object' ? Object.entries(movementState) : [];
  const activeMovement = movementEntries
    .filter(([, active]) => Boolean(active))
    .map(([key]) => key)
    .join(', ');

  const visiblePercentage = terrainInfo.vertexCount
    ? terrainInfo.visibleVertexRatio * 100
    : 0;

  const featureStats = terrainInfo.featureStats || { canyon: 0, ravine: 0, cliffs: 0 };
  const formatFeaturePercent = (value) =>
    Number.isFinite(value) ? (Math.max(0, value) * 100).toFixed(0) : '0';

  const plantMetrics = plantSimulation.metrics ?? createEmptyPlantMetrics();
  const formatMetric = (value, digits = 2) => {
    const finite = Number.isFinite(value) ? value : 0;
    return finite.toFixed(digits);
  };
  const swellMetrics = waterSwellState?.metrics ?? {};
  const swellFlags = waterSwellState?.flags ?? {};
  const swellUsage = Number.isFinite(swellMetrics.bufferUtilization)
    ? Math.round(Math.max(0, swellMetrics.bufferUtilization) * 100)
    : 0;
  const swellPending = Math.max(0, swellMetrics.pending ?? 0);
  const reservePercent = formatMetric((plantMetrics.energyReserveRatio ?? 0) * 100, 0);
  const avgHeightMetric = formatMetric(plantMetrics.averageHeight);
  const avgMassMetric = formatMetric(plantMetrics.averageMass, 1);
  const avgEnergyMetric = formatMetric(plantMetrics.averageEnergy);
  const avgCapacityMetric = formatMetric(plantMetrics.averageCapacity);
  const absorbedMetric = formatMetric(plantMetrics.energyAbsorbed);
  const consumedMetric = formatMetric(plantMetrics.energyConsumed);
  const growthEventsMetric = Math.max(0, plantMetrics.growthEvents ?? 0);
  const cloudMetrics = weatherState.clouds?.metrics ?? {};
  const cloudStatus = weatherState.clouds?.flags?.geometryValid ? 'OK' : 'ERROR';
  const cloudBuild = Number.isFinite(cloudMetrics.lastBuildMs)
    ? `${cloudMetrics.lastBuildMs.toFixed(2)}ms`
    : '---';
  const starMetrics = starFieldState.metrics ?? {};
  const starStatus = starFieldState.flags?.geometryValid ? 'OK' : 'ERROR';
  const starVisibility = Number.isFinite(starMetrics.lastVisibility)
    ? starMetrics.lastVisibility.toFixed(2)
    : '0.00';
  const starRadiusMax = Number.isFinite(starMetrics.radiusMax)
    ? starMetrics.radiusMax.toFixed(1)
    : STAR_FIELD_RADIUS.toFixed(1);
  const starRadiusMin = Number.isFinite(starMetrics.radiusMin)
    ? starMetrics.radiusMin.toFixed(1)
    : STAR_FIELD_MIN_RADIUS.toFixed(1);
  const starMargin = Number.isFinite(starMetrics.margin)
    ? starMetrics.margin.toFixed(1)
    : STAR_FIELD_MARGIN.toFixed(1);
  const starClipStatus = starFieldState.flags?.clipSafe === false ? 'riesgo' : 'seguro';

  const selectionStatus = selectedBlock
    ? `bloque ${selectedBlock.blockX},${selectedBlock.blockZ} (${selectedBlock.height.toFixed(2)}m)`
    : 'Ninguna';

  const clipDeviation = Number.isFinite(cameraDiagnostics.lastDeviation)
    ? cameraDiagnostics.lastDeviation
    : 0;
  const clipOverrideActive = Boolean(cameraDiagnostics.flags?.overrideActive);
  const clipInvalidOrdering = Boolean(cameraDiagnostics.flags?.invalidOrdering);
  const cameraOverrides = Math.max(0, cameraDiagnostics.overrides ?? 0);
  const lastOverrideLabel =
    typeof cameraDiagnostics.lastOverrideTimestamp === 'number'
      ? new Date(cameraDiagnostics.lastOverrideTimestamp).toISOString()
      : cameraDiagnostics.lastOverrideTimestamp ?? 'n/d';
  const baseClipLabel = `${CAMERA_BASE_NEAR_PLANE.toFixed(2)}/${CAMERA_BASE_FAR_PLANE.toFixed(1)}`;
  const activeClipLabel = `${CAMERA_NEAR_PLANE.toFixed(2)}/${CAMERA_FAR_PLANE.toFixed(1)}`;

  const now = Date.now();
  cameraDisplayDiagnostics.lastUpdateTime = now;
  cameraDisplayDiagnostics.updates = Math.max(
    0,
    (cameraDisplayDiagnostics.updates ?? 0) + 1,
  );
  let missingCameraDisplays = 0;
  if (
    cameraNearDisplay &&
    typeof cameraNearDisplay === 'object' &&
    'textContent' in cameraNearDisplay
  ) {
    cameraNearDisplay.textContent = CAMERA_NEAR_PLANE.toFixed(2);
  } else {
    missingCameraDisplays += 1;
  }
  if (
    cameraFarDisplay &&
    typeof cameraFarDisplay === 'object' &&
    'textContent' in cameraFarDisplay
  ) {
    cameraFarDisplay.textContent = CAMERA_FAR_PLANE.toFixed(1);
  } else {
    missingCameraDisplays += 1;
  }
  cameraDisplayDiagnostics.missingElements = missingCameraDisplays;
  if (missingCameraDisplays > 0) {
    cameraDisplayDiagnostics.lastMissingTimestamp = now;
  }

  const cameraFarLabel = CAMERA_FAR_PLANE.toFixed(1);
  const marginEstimate = Number.isFinite(cameraDiagnostics.metrics.marginEstimate)
    ? cameraDiagnostics.metrics.marginEstimate
    : cameraDiagnostics.starMargin;
  const cameraMarginLabel = Number.isFinite(marginEstimate)
    ? marginEstimate.toFixed(1)
    : '---';
  const frustumStatus = cameraDiagnostics.flags?.frustumClipping ? 'riesgo' : 'seguro';

  let info = [];
  try {
    info = [
      `Estado: ${pointerLocked ? 'Explorando' : 'En espera'}`,
      `FPS: ${displayedFps ? displayedFps.toFixed(1) : '---'}`,
      `TPS: ${displayedTps ? displayedTps.toFixed(1) : '---'} (objetivo: ${targetTickRate.toFixed(1)})`,
      `Velocidad sim: ${simulationSpeed.toFixed(1)}×`,
      `Tiempo sim: ${simulationTime.toFixed(2)}s`,
      `Ciclo día/noche: ${(dayNightCycleState.normalizedTime * 24).toFixed(1)}h (luz ${(dayNightCycleState.intensity * 100).toFixed(0)}%)`,
      `Ticks totales: ${totalTicks} (cuadro: ${ticksLastFrame})`,
      `Cámara: x=${cameraPosition[0].toFixed(2)} y=${cameraPosition[1].toFixed(2)} z=${cameraPosition[2].toFixed(2)}`,
      `Planos cámara: base=${baseClipLabel} actual=${activeClipLabel} Δ=${clipDeviation.toFixed(3)} override=${
        clipOverrideActive ? 'sí' : 'no'
      } orden=${clipInvalidOrdering ? 'inválido' : 'ok'}`,
      `Overrides cámara: acumulados=${cameraOverrides} último=${lastOverrideLabel}`,
      `Orientación: yaw=${((yaw * 180) / Math.PI).toFixed(1)}° pitch=${((pitch * 180) / Math.PI).toFixed(1)}°`,
      `Frustum cámara: near=${CAMERA_NEAR_PLANE.toFixed(2)} far=${cameraFarLabel} margen_est=${cameraMarginLabel} estado=${frustumStatus} ajustes=${cameraDiagnostics.adjustments}`,
      `Luz global: rgb=${lightingDiagnostics.latestLightColor
        .map((value) => value.toFixed(2))
        .join(', ')} ambient=${lightingDiagnostics.latestAmbientColor
        .map((value) => value.toFixed(2))
        .join(', ')} sol=${lightingDiagnostics.latestSunAltitude.toFixed(1)} luz=${(lightingDiagnostics.latestDaylight * 100).toFixed(0)}%`,
      `Terreno seed: ${terrainInfo.seed}`,
      `Terreno translúcido: ${seeThroughTerrain ? 'Sí' : 'No'}`,
      `Altura terreno: min=${terrainInfo.minHeight.toFixed(2)}m max=${terrainInfo.maxHeight.toFixed(2)}m`,
      `Terreno visible: ${visiblePercentage.toFixed(1)}% (${terrainInfo.visibleVertices}/${terrainInfo.vertexCount})`,
      `Terreno características: cañón=${formatFeaturePercent(featureStats.canyon)}% barranco=${formatFeaturePercent(
        featureStats.ravine,
      )}% acantilado=${formatFeaturePercent(featureStats.cliffs)}%`,
      `Terreno estilo: ${terrainInfo.surfaceStyle ?? 'n/d'} (plano=${terrainInfo.flags?.flatColor ? 'sí' : 'no'} texturizado=${
        terrainInfo.flags?.textured ? 'sí' : 'no'
      } especular=${terrainInfo.flags?.lowSpecular ? 'bajo' : 'normal'} iluminación_plana=${
        terrainInfo.flags?.flatLighting ? 'sí' : 'no'
      })`,
      `Terreno color varianza: ${(terrainInfo.colorVariance ?? 0).toFixed(4)}`,
      `Terreno iluminación plana: rgb=${terrainRenderState.metrics.lastFlatLightColor
        .map((value) => value.toFixed(2))
        .join(', ')} luma=${terrainRenderState.metrics.lastFlatLightLuma.toFixed(2)} frame=${
        terrainRenderState.metrics.flatShadedDrawsLastFrame
      } total=${terrainRenderState.metrics.flatShadedDrawsTotal} luz_día=${(terrainRenderState.metrics.lastDaylight * 100).toFixed(
        0,
      )}% luz_luna=${(terrainRenderState.metrics.lastMoonlight * 100).toFixed(0)}%`,
      `Rocas generadas: ${terrainInfo.rockCount}`,
      `Modelos disponibles: ${modelLibrary.length}`,
      `Selección: ${selectionStatus}`,
      `Movimiento activo: ${activeMovement || 'Ninguno'}`,
      `Depuración: terreno translúcido ${terrainRenderState.translucent ? 'activado' : 'desactivado'}`,
      `Draw calls: total=${drawStats.total} terreno=${drawStats.terrain} agua=${drawStats.water} rocas=${drawStats.rocks} plantas=${drawStats.plants} viento=${drawStats.wind} nubes=${drawStats.clouds} celestes=${drawStats.celestial} bloques=${drawStats.blockGrid} chunks=${drawStats.chunkGrid} selección=${drawStats.selection}`,
      `Clima: viento activo=${weatherState.wind.metrics.active} ráfagas generadas=${weatherState.wind.metrics.spawned} descartes geom.=${weatherState.wind.metrics.geometryRejected} nubes=${weatherState.clouds.metrics.count}`,
      `Nubes detalle: grumos=${cloudMetrics.clumps ?? 0} esferas=${cloudMetrics.puffs ?? 0} vértices=${cloudMetrics.vertexCount ?? 0} estado=${cloudStatus} reconstrucciones=${cloudMetrics.rebuilds ?? 0} tRebuild=${cloudBuild}`,
      `Marejadas: activas=${swellMetrics.active ?? waterSwellActiveCount} generadas=${swellMetrics.spawned ?? 0} descartadas=${swellMetrics.culled ?? 0} pendientes=${swellPending} uso buffers=${swellUsage}% resets=${waterSwellDiagnostics.resets}`,
      `Iluminación: sol=${(dayNightCycleState.sunlightIntensity * 100).toFixed(0)}% luna=${(dayNightCycleState.moonlightIntensity * 100).toFixed(0)}%`,
      `Cuerpos celestes: plantilla=${celestialGeometryState.flags.templateValid ? 'OK' : 'ERROR'} sol=${celestialGeometryState.flags.sunGeometryValid ? 'OK' : 'ERROR'} luna=${celestialGeometryState.flags.moonGeometryValid ? 'OK' : 'ERROR'}`,
      `Celeste métricas: plantillas=${celestialGeometryState.metrics.templateBuilds} errores=${celestialGeometryState.metrics.templateBuildErrors} subidas sol=${celestialGeometryState.metrics.sunUploads} luna=${celestialGeometryState.metrics.moonUploads} fallos=${celestialGeometryState.metrics.uploadErrors}`,
      `Estrellas: total=${starMetrics.count ?? 0} brillantes=${starMetrics.bright ?? 0} tenues=${starMetrics.dim ?? 0} visibilidad=${starVisibility} estado=${starStatus} radio=${starRadiusMin}–${starRadiusMax} margen=${starMargin} clip=${starClipStatus} reconstrucciones=${starMetrics.rebuilds ?? 0}`,
      `Geometría: terreno=${baseplateVertexCount} bloques=${blockGridVertexCount} chunks=${chunkGridVertexCount}`,
      `GL error: ${lastGlError}`,
    ];

    if (terrainInfo.massDiagnostics) {
    const diagnostics = terrainInfo.massDiagnostics;
    const flaggedCount = Array.isArray(diagnostics.flaggedEntities)
      ? diagnostics.flaggedEntities.length
      : 0;
    const lastError = diagnostics.lastError?.message ?? 'ninguno';
    const computations = Number.isFinite(diagnostics.computations)
      ? Math.max(0, diagnostics.computations)
      : 0;
    const clipped = Number.isFinite(diagnostics.clippedComputations)
      ? Math.max(0, diagnostics.clippedComputations)
      : 0;
    const terrainSamples = Number.isFinite(diagnostics.terrainSamples)
      ? Math.max(0, diagnostics.terrainSamples)
      : 0;
    info.push(
      `Masa diag: cálculos=${computations} recortes=${clipped} alertas=${flaggedCount} muestreos=${terrainSamples} error=${lastError}`,
    );
    const reasonEntries = Object.entries(diagnostics.reasonCounts ?? {}).filter(
      ([, count]) => Number.isFinite(count) && count > 0,
    );
    if (reasonEntries.length > 0) {
      const summary = reasonEntries
        .map(([reason, count]) => `${reason}=${Math.round(count)}`)
        .join(' ');
      info.push(`Masa diag alertas: ${summary}`);
    }
    const lastSpec = diagnostics.lastSpecSummary;
    if (lastSpec) {
      const lastMass = Number.isFinite(lastSpec.mass) ? lastSpec.mass.toFixed(2) : 'n/d';
      const lastVolume = Number.isFinite(lastSpec.volume) ? lastSpec.volume.toFixed(3) : 'n/d';
      const clippedPercent = Number.isFinite(lastSpec.clippedRatio)
        ? Math.round(lastSpec.clippedRatio * 100)
        : null;
      const clipText = clippedPercent !== null ? `${clippedPercent}%` : 'n/d';
      info.push(
        `Masa diag última: forma=${lastSpec.shape ?? 'n/d'} material=${
          lastSpec.materialId ?? 'n/d'
        } masa=${lastMass}kg volumen=${lastVolume}m³ recorte=${clipText}`,
      );
      if (lastSpec.issue) {
        info.push(`Masa diag última alerta: ${lastSpec.issue}`);
      }
    }
  }

  const audioDiagnostics = ambientAudioState?.diagnostics;
  if (audioDiagnostics) {
    const musicStatus = audioDiagnostics.musicStatus ?? 'n/d';
    const windLevel = Number.isFinite(audioDiagnostics.windLevel)
      ? audioDiagnostics.windLevel.toFixed(3)
      : '---';
    const windTarget = Number.isFinite(audioDiagnostics.windTarget)
      ? audioDiagnostics.windTarget.toFixed(3)
      : '---';
    const filterFrequency = Number.isFinite(audioDiagnostics.filterFrequency)
      ? Math.round(audioDiagnostics.filterFrequency)
      : '---';
    const underwaterStatus = audioDiagnostics.underwater ? 'sí' : 'no';
    const loadTime =
      Number.isFinite(audioDiagnostics.musicLoadTimeMs) &&
      audioDiagnostics.musicLoadTimeMs !== null
        ? `${audioDiagnostics.musicLoadTimeMs} ms`
        : 'n/d';
    const pendingGesture = audioDiagnostics.pendingGesture ? 'sí' : 'no';
    const lastResume = audioDiagnostics.lastResumeAttempt
      ? new Date(audioDiagnostics.lastResumeAttempt).toISOString()
      : 'n/d';
    info.push(
      `Audio: pista=${audioDiagnostics.musicTrack ?? 'desconocida'} estado=${musicStatus} filtro=${filterFrequency}Hz bajo_agua=${underwaterStatus} viento=${windLevel}/${windTarget} carga=${loadTime} incidencias=${audioDiagnostics.issues ?? 0}`,
    );
    info.push(
      `Audio control: pendiente_gesto=${pendingGesture} último_reanudar=${lastResume}`,
    );
    if (audioDiagnostics.lastError) {
      info.push(`Audio último error: ${audioDiagnostics.lastError}`);
    }
  }

  const debugDiagnostics = debugConsoleDiagnostics;
  if (debugDiagnostics) {
    const lastUpdateLabel = debugDiagnostics.lastUpdateTime
      ? new Date(debugDiagnostics.lastUpdateTime).toISOString()
      : 'n/d';
    const lastHeartbeatLabel = debugDiagnostics.lastHeartbeatTime
      ? new Date(debugDiagnostics.lastHeartbeatTime).toISOString()
      : 'n/d';
    const lastDelta = Number.isFinite(debugDiagnostics.lastDeltaTime)
      ? debugDiagnostics.lastDeltaTime.toFixed(4)
      : 'n/d';
    info.push(
      `Panel depuración: actualizaciones=${debugDiagnostics.updates ?? 0} Δt=${lastDelta}s último=${lastUpdateLabel} latido=${lastHeartbeatLabel} fallos=${debugDiagnostics.heartbeatFailures ?? 0}`,
    );
    if (debugDiagnostics.lastError) {
      info.push(`Panel depuración último error: ${debugDiagnostics.lastError}`);
    }
  }

  if (cameraDisplayDiagnostics.missingElements > 0) {
    const lastMissingLabel = cameraDisplayDiagnostics.lastMissingTimestamp
      ? new Date(cameraDisplayDiagnostics.lastMissingTimestamp).toISOString()
      : 'n/d';
    info.push(
      `UI cámara: faltantes=${cameraDisplayDiagnostics.missingElements} ` +
        `última_falta=${lastMissingLabel}`,
    );
  }

  if (
    (simulationInfoDiagnostics.cameraRepairs ?? 0) > 0 ||
    (simulationInfoDiagnostics.clipRepairs ?? 0) > 0 ||
    (simulationInfoDiagnostics.clipFlagRepairs ?? 0) > 0 ||
    (simulationInfoDiagnostics.clipOverrideRepairs ?? 0) > 0
  ) {
    const lastRepairLabel = simulationInfoDiagnostics.lastRepairTime
      ? new Date(simulationInfoDiagnostics.lastRepairTime).toISOString()
      : 'n/d';
    info.push(
      `SimInfo reparaciones: cámara=${simulationInfoDiagnostics.cameraRepairs ?? 0} ` +
        `clip=${simulationInfoDiagnostics.clipRepairs ?? 0} banderas=${
          simulationInfoDiagnostics.clipFlagRepairs ?? 0
        } overrides=${simulationInfoDiagnostics.clipOverrideRepairs ?? 0} ` +
        `último=${lastRepairLabel}`,
    );
  }

  if (cloudMetrics.lastError) {
    info.push(`Nubes error: ${cloudMetrics.lastError}`);
  }
  if (starMetrics.lastError) {
    info.push(`Estrellas error: ${starMetrics.lastError}`);
  }

  if (pointerLockErrors > 0) {
    info.push(`Pointer lock errores: ${pointerLockErrors}`);
  }

  if (uiDebugState.track) {
    const snapshot = refreshUiDebugSnapshot();
    info.push('', 'UI (depuración):');
    for (const entry of uiDebugRegistry) {
      const details = snapshot.get(entry.name);
      if (!details || !details.present) {
        info.push(`• ${entry.label}: no encontrado`);
        continue;
      }
      const status = details.visible ? 'visible' : 'oculto';
      const size = `${details.width}×${details.height}`;
      info.push(
        `• ${entry.label}: ${status} (hidden=${
          details.hiddenAttribute ? 'sí' : 'no'
        }, display=${details.display ?? 'n/d'}, tamaño=${size})`,
      );
    }
  }

  const fallbackSummary =
    reportedFallbacks && typeof reportedFallbacks === 'object'
      ? Object.values(reportedFallbacks)
      : [];
  if (fallbackSummary.length > 0) {
    info.push('', 'Recuperaciones UI:');
    for (const entry of fallbackSummary) {
      if (!entry) {
        continue;
      }
      const status = entry.severity === 'fatal' ? 'crítico' : 'recuperado';
      const count = entry.count ?? 1;
      const detail = entry.message ? ` – ${entry.message}` : '';
      info.push(`• ${entry.id ?? 'elemento'} (${status}, intentos=${count})${detail}`);
    }
  }

    if (runtimeIssues.length > 0) {
      info.push('', 'Problemas recientes:');
      for (const issue of runtimeIssues) {
        const marker = issue.severity === 'fatal' ? '⛔' : '⚠️';
        info.push(`${marker} [${issue.timestamp}] ${issue.context}: ${formatIssueMessage(issue)}`);
      }
    }
  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error ?? 'Error desconocido');
    debugConsoleDiagnostics.lastError = errorMessage;
    cameraDiagnostics.metrics.failedUpdates = Math.max(
      0,
      (cameraDiagnostics.metrics.failedUpdates ?? 0) + 1,
    );
    runtimeState.lastDebugPanelError = {
      timestamp: Date.now(),
      message: errorMessage,
    };
    console.error('Error al generar la salida del panel de depuración', error);
    info = [
      `Estado: ${pointerLocked ? 'Explorando' : 'En espera'}`,
      `⚠️ Panel depuración error: ${errorMessage}`,
      `Intentos fallidos: ${cameraDiagnostics.metrics.failedUpdates}`,
    ];
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
    let cameraInfo = simulationInfo.camera;
    if (!cameraInfo || typeof cameraInfo !== 'object') {
      cameraInfo = {
        position: [0, 0, 0],
        yaw: 0,
        pitch: 0,
        clip: {},
        clipFlags: { overrideActive: false, invalidOrdering: false },
        clipOverrides: { count: 0, lastTimestamp: null },
      };
      simulationInfo.camera = cameraInfo;
      simulationInfoDiagnostics.cameraRepairs = Math.max(
        0,
        (simulationInfoDiagnostics.cameraRepairs ?? 0) + 1,
      );
      simulationInfoDiagnostics.lastRepairTime = Date.now();
      if (!simulationInfoDiagnostics.reportedCameraRepair) {
        recordRuntimeIssue(
          'warning',
          'sim-info',
          'Se restauró la estructura de la cámara en simulationInfo.',
        );
        simulationInfoDiagnostics.reportedCameraRepair = true;
      }
    }
    if (!Array.isArray(cameraInfo.position) || cameraInfo.position.length !== 3) {
      cameraInfo.position = [0, 0, 0];
      simulationInfoDiagnostics.cameraRepairs = Math.max(
        0,
        (simulationInfoDiagnostics.cameraRepairs ?? 0) + 1,
      );
      simulationInfoDiagnostics.lastRepairTime = Date.now();
    }
    cameraInfo.position[0] = cameraPosition[0];
    cameraInfo.position[1] = cameraPosition[1];
    cameraInfo.position[2] = cameraPosition[2];
    cameraInfo.yaw = yaw;
    cameraInfo.pitch = pitch;
    const clipSnapshot = snapshotCameraClipDiagnostics() ?? {};
    if (!cameraInfo.clip || typeof cameraInfo.clip !== 'object') {
      cameraInfo.clip = {};
      simulationInfoDiagnostics.clipRepairs = Math.max(
        0,
        (simulationInfoDiagnostics.clipRepairs ?? 0) + 1,
      );
      simulationInfoDiagnostics.lastRepairTime = Date.now();
      if (!simulationInfoDiagnostics.reportedClipRepair) {
        recordRuntimeIssue(
          'warning',
          'sim-info',
          'Se restauró la sección clip de simulationInfo.camera.',
        );
        simulationInfoDiagnostics.reportedClipRepair = true;
      }
    }
    Object.assign(cameraInfo.clip, clipSnapshot);
    if (!cameraInfo.clipFlags || typeof cameraInfo.clipFlags !== 'object') {
      cameraInfo.clipFlags = { overrideActive: false, invalidOrdering: false };
      simulationInfoDiagnostics.clipFlagRepairs = Math.max(
        0,
        (simulationInfoDiagnostics.clipFlagRepairs ?? 0) + 1,
      );
      simulationInfoDiagnostics.lastRepairTime = Date.now();
      if (!simulationInfoDiagnostics.reportedFlagRepair) {
        recordRuntimeIssue(
          'warning',
          'sim-info',
          'Se restauraron las banderas de clipping en simulationInfo.camera.',
        );
        simulationInfoDiagnostics.reportedFlagRepair = true;
      }
    }
    cameraInfo.clipFlags.overrideActive = clipSnapshot.overrideActive;
    cameraInfo.clipFlags.invalidOrdering = clipSnapshot.invalidOrdering;
    if (!cameraInfo.clipOverrides || typeof cameraInfo.clipOverrides !== 'object') {
      cameraInfo.clipOverrides = { count: 0, lastTimestamp: null };
      simulationInfoDiagnostics.clipOverrideRepairs = Math.max(
        0,
        (simulationInfoDiagnostics.clipOverrideRepairs ?? 0) + 1,
      );
      simulationInfoDiagnostics.lastRepairTime = Date.now();
      if (!simulationInfoDiagnostics.reportedOverrideRepair) {
        recordRuntimeIssue(
          'warning',
          'sim-info',
          'Se restauraron los contadores de overrides de clipping.',
        );
        simulationInfoDiagnostics.reportedOverrideRepair = true;
      }
    }
    cameraInfo.clipOverrides.count = clipSnapshot.overrides;
    cameraInfo.clipOverrides.lastTimestamp = clipSnapshot.lastOverrideTimestamp;
    simulationInfo.dayNight = dayNightCycleState;
    simulationInfo.terrain.surfaceStyle = terrainInfo.surfaceStyle;
    simulationInfo.terrain.colorVariance = terrainInfo.colorVariance ?? 0;
    simulationInfo.terrain.minHeight = terrainInfo.minHeight ?? 0;
    simulationInfo.terrain.maxHeight = terrainInfo.maxHeight ?? 0;
    simulationInfo.terrain.vertexCount = terrainInfo.vertexCount ?? 0;
    simulationInfo.terrain.visibleVertices = terrainInfo.visibleVertices ?? 0;
    simulationInfo.terrain.visibleRatio = terrainInfo.visibleVertexRatio ?? 0;
    simulationInfo.terrain.flags =
      terrainInfo.flags && typeof terrainInfo.flags === 'object' ? { ...terrainInfo.flags } : {};
    simulationInfo.terrain.flatLighting = {
      color: terrainInfo.flatLighting?.color ? terrainInfo.flatLighting.color.slice() : [1, 1, 1],
      luma: terrainInfo.flatLighting?.luma ?? 1,
      daylight: terrainInfo.flatLighting?.daylight ?? 0,
      moonlight: terrainInfo.flatLighting?.moonlight ?? 0,
    };
    const cloudState = weatherState.clouds ?? {};
    const cloudMetrics = cloudState.metrics ?? {};
    const starMetrics = starFieldState.metrics ?? {};
    simulationInfo.weather.windActive = weatherState.wind.metrics.active;
    simulationInfo.weather.windSpawned = weatherState.wind.metrics.spawned;
    simulationInfo.weather.windCulled = weatherState.wind.metrics.culled;
    simulationInfo.weather.windGeometryRejected = weatherState.wind.metrics.geometryRejected;
    simulationInfo.weather.clouds = cloudMetrics.count ?? 0;
    simulationInfo.weather.cloudPuffs = cloudMetrics.puffs ?? 0;
    simulationInfo.weather.cloudClumps = cloudMetrics.clumps ?? 0;
    simulationInfo.weather.cloudsHealthy = Boolean(cloudState.flags?.geometryValid);
    simulationInfo.weather.cloudMetrics = cloudMetrics;
    const swellMetrics = waterSwellState?.metrics;
    const swellInfo = simulationInfo.weather.swells;
    if (swellInfo) {
      if (swellMetrics) {
        swellInfo.active = swellMetrics.active ?? waterSwellActiveCount;
        swellInfo.spawned = swellMetrics.spawned ?? 0;
        swellInfo.culled = swellMetrics.culled ?? 0;
        swellInfo.overflowed = swellMetrics.overflowed ?? 0;
        swellInfo.bufferUtilization = swellMetrics.bufferUtilization ?? 0;
        swellInfo.pending = swellMetrics.pending ?? 0;
        swellInfo.lastSpawnTime = swellMetrics.lastSpawnTime ?? null;
      } else {
        swellInfo.active = waterSwellActiveCount;
        swellInfo.spawned = 0;
        swellInfo.culled = 0;
        swellInfo.overflowed = 0;
        swellInfo.bufferUtilization = 0;
        swellInfo.pending = 0;
        swellInfo.lastSpawnTime = null;
      }
    }
    if (simulationInfo.weather.diagnostics && simulationInfo.weather.diagnostics.swells) {
      const swellDiagnostics = simulationInfo.weather.diagnostics.swells;
      swellDiagnostics.resets = waterSwellDiagnostics.resets;
      swellDiagnostics.oversubscribedFrames = waterSwellDiagnostics.oversubscribedFrames;
      swellDiagnostics.lastUpdateDurationMs = waterSwellDiagnostics.lastUpdateDurationMs;
      swellDiagnostics.lastError = waterSwellDiagnostics.lastError;
      swellDiagnostics.spawnBacklog = Boolean(waterSwellState?.flags?.spawnBacklog);
      swellDiagnostics.overCapacity = Boolean(waterSwellState?.flags?.overCapacity);
    }
    simulationInfo.celestial.sunAltitude = dayNightCycleState.sunAltitude;
    simulationInfo.celestial.moonAltitude = dayNightCycleState.moonAltitude;
    simulationInfo.celestial.sunlight = dayNightCycleState.sunlightIntensity;
    simulationInfo.celestial.moonlight = dayNightCycleState.moonlightIntensity;
    simulationInfo.celestial.stars = starMetrics.count ?? 0;
    simulationInfo.celestial.starMetrics = starFieldState.metrics;
    simulationInfo.celestial.starsHealthy = Boolean(starFieldState.flags?.geometryValid);
    simulationInfo.celestial.starVisibility = starMetrics.lastVisibility ?? 0;
    simulationInfo.celestial.starRadius = starMetrics.radiusMax ?? STAR_FIELD_RADIUS;
    simulationInfo.celestial.starRadiusMin = starMetrics.radiusMin ?? STAR_FIELD_MIN_RADIUS;
    simulationInfo.celestial.starMargin = starMetrics.margin ?? STAR_FIELD_MARGIN;
    simulationInfo.celestial.starClipSafe = Boolean(starFieldState.flags?.clipSafe);
    simulationInfo.celestial.skyboxMetrics = dayNightCycleState.metrics;
    simulationInfo.celestial.skyboxHealthy = dayNightCycleState.flags.skyGradientValid;
    simulationInfo.celestial.templateHealthy = celestialGeometryState.flags.templateValid;
    simulationInfo.celestial.sunGeometryValid = celestialGeometryState.flags.sunGeometryValid;
    simulationInfo.celestial.moonGeometryValid = celestialGeometryState.flags.moonGeometryValid;
    simulationInfo.celestial.geometryMetrics = celestialGeometryState.metrics;
    if (simulationInfo.debug && simulationInfo.debug.panel) {
      simulationInfo.debug.panel.updates = debugConsoleDiagnostics.updates ?? 0;
      simulationInfo.debug.panel.lastUpdateTime = debugConsoleDiagnostics.lastUpdateTime ?? 0;
      simulationInfo.debug.panel.lastDeltaTime = debugConsoleDiagnostics.lastDeltaTime ?? 0;
      simulationInfo.debug.panel.heartbeatFailures =
        debugConsoleDiagnostics.heartbeatFailures ?? 0;
      simulationInfo.debug.panel.lastHeartbeatTime =
        debugConsoleDiagnostics.lastHeartbeatTime ?? 0;
      simulationInfo.debug.panel.lastError = debugConsoleDiagnostics.lastError ?? null;
    }
    if (simulationInfo.debug) {
      if (!simulationInfo.debug.repairs || typeof simulationInfo.debug.repairs !== 'object') {
        simulationInfo.debug.repairs = {
          camera: 0,
          clip: 0,
          clipFlags: 0,
          clipOverrides: 0,
          lastRepairTime: 0,
        };
      }
      const repairDebug = simulationInfo.debug.repairs;
      repairDebug.camera = simulationInfoDiagnostics.cameraRepairs ?? 0;
      repairDebug.clip = simulationInfoDiagnostics.clipRepairs ?? 0;
      repairDebug.clipFlags = simulationInfoDiagnostics.clipFlagRepairs ?? 0;
      repairDebug.clipOverrides = simulationInfoDiagnostics.clipOverrideRepairs ?? 0;
      repairDebug.lastRepairTime = simulationInfoDiagnostics.lastRepairTime ?? 0;
      if (
        !simulationInfo.debug.cameraDisplay ||
        typeof simulationInfo.debug.cameraDisplay !== 'object'
      ) {
        simulationInfo.debug.cameraDisplay = {
          updates: 0,
          lastUpdateTime: 0,
          missingElements: 0,
          lastMissingTimestamp: null,
        };
      }
      const cameraDisplayDebug = simulationInfo.debug.cameraDisplay;
      cameraDisplayDebug.updates = cameraDisplayDiagnostics.updates ?? 0;
      cameraDisplayDebug.lastUpdateTime = cameraDisplayDiagnostics.lastUpdateTime ?? 0;
      cameraDisplayDebug.missingElements = cameraDisplayDiagnostics.missingElements ?? 0;
      cameraDisplayDebug.lastMissingTimestamp =
        cameraDisplayDiagnostics.lastMissingTimestamp ?? null;
    }
    if (simulationInfo.audio) {
      simulationInfo.audio.enabled = ambientAudioState.enabled;
      simulationInfo.audio.musicStatus = ambientAudioState.diagnostics.musicStatus;
      simulationInfo.audio.pendingGesture = ambientAudioState.diagnostics.pendingGesture;
      simulationInfo.audio.lastResumeAttempt =
        ambientAudioState.diagnostics.lastResumeAttempt;
    }
    simulationInfo.lighting.global = lightingDiagnostics.latestLightColor.slice();
    simulationInfo.lighting.ambient = lightingDiagnostics.latestAmbientColor.slice();
    simulationInfo.lighting.daylight = lightingDiagnostics.latestDaylight;
    simulationInfo.lighting.sunAltitude = lightingDiagnostics.latestSunAltitude;
    simulationInfo.lighting.startupNormalizedTime = lightingDiagnostics.startupNormalizedTime;
    simulationInfo.lighting.startupLightColor = lightingDiagnostics.startupLightColor.slice();
    simulationInfo.lighting.startupSunAltitude = lightingDiagnostics.startupSunAltitude;

    if (simulationInfo.camera) {
      const cameraInfo = simulationInfo.camera;
      cameraInfo.position[0] = cameraPosition[0];
      cameraInfo.position[1] = cameraPosition[1];
      cameraInfo.position[2] = cameraPosition[2];
      cameraInfo.near = cameraDiagnostics.near;
      cameraInfo.far = cameraDiagnostics.far;
      cameraInfo.starMargin = cameraDiagnostics.starMargin;
      cameraInfo.marginEstimate = cameraDiagnostics.metrics.marginEstimate;
      cameraInfo.starFarthest = cameraDiagnostics.metrics.starFarthest;
      cameraInfo.starShortfall = cameraDiagnostics.metrics.starShortfall;
      cameraInfo.adjustments = cameraDiagnostics.adjustments;
      cameraInfo.failedDiagnostics = cameraDiagnostics.metrics.failedUpdates;
      if (!cameraInfo.flags || typeof cameraInfo.flags !== 'object') {
        cameraInfo.flags = {};
      }
      cameraInfo.flags.frustumClipping = cameraDiagnostics.flags.frustumClipping;
      cameraInfo.flags.baseFrustumExceeded = cameraDiagnostics.flags.baseFrustumExceeded;
    }

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
    })(ARRECIFE_BOOT_TARGET, ARRECIFE_MODULE_STATE);
    ARRECIFE_MODULE_STATE.initialized = true;
    ARRECIFE_MODULE_STATE.lastSuccess = Date.now();
  } catch (bootstrapError) {
    ARRECIFE_MODULE_STATE.lastError =
      bootstrapError && bootstrapError.message
        ? String(bootstrapError.message)
        : String(bootstrapError);
    ARRECIFE_MODULE_STATE.failedAttempts = Math.max(
      0,
      (ARRECIFE_MODULE_STATE.failedAttempts || 0) + 1,
    );
    ARRECIFE_MODULE_STATE.initialized = false;
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(
        '[Arrecife] Error al inicializar scripts/main.js. Se liberará el bloqueo para reintentos.',
        bootstrapError,
      );
    }
    throw bootstrapError;
  } finally {
    ARRECIFE_MODULE_STATE.active = false;
  }
  var finalRuntimeState = ARRECIFE_BOOT_TARGET.__ARRECIFE_RUNTIME_STATE__;
  if (finalRuntimeState && typeof finalRuntimeState === 'object') {
    var finalDiagnostics =
      finalRuntimeState.moduleDiagnostics &&
      typeof finalRuntimeState.moduleDiagnostics === 'object'
        ? finalRuntimeState.moduleDiagnostics
        : (finalRuntimeState.moduleDiagnostics = {});
    if (finalDiagnostics.bootstrap) {
      finalDiagnostics.bootstrap.active = false;
      finalDiagnostics.bootstrap.lastSuccess = ARRECIFE_MODULE_STATE.lastSuccess;
      finalDiagnostics.bootstrap.failedAttempts = ARRECIFE_MODULE_STATE.failedAttempts;
      finalDiagnostics.bootstrap.lastError = ARRECIFE_MODULE_STATE.lastError;
    }
  }
}
