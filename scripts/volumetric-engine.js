(function (global) {
  'use strict';

  const DEFAULT_TILE_SIZE = 1;
  const MAX_FLAGGED_ENTRIES = 12;
  const SUPPORTED_SHAPES = new Set(['ellipsoid', 'truncated-cone', 'capsule', 'cylinder', 'box']);
  const DEFAULT_DENSITIES = {
    'rock-generic': 2550,
    'rock-matrix': 2620,
    'rock-sulfur': 2070,
    'rock-phosphate': 1900,
    'plant-generic': 360,
    'plant-algae': 310,
    'plant-coral': 1470,
    'fish-generic': 1080,
    water: 1000,
  };

  function clamp(value, min, max) {
    if (!Number.isFinite(value)) {
      return min;
    }
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  function toPositive(value, fallback = 0) {
    if (!Number.isFinite(value)) {
      return fallback;
    }
    return value > 0 ? value : fallback;
  }

  function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
  }

  function truncatedConeVolume(height, bottomRadius, topRadius) {
    const h = toPositive(height, 0);
    if (h <= 0) {
      return 0;
    }
    const r1 = Math.max(0, toFiniteNumber(bottomRadius, 0));
    const r2 = Math.max(0, toFiniteNumber(topRadius, 0));
    if (r1 === 0 && r2 === 0) {
      return 0;
    }
    return (Math.PI * h * (r1 * r1 + r1 * r2 + r2 * r2)) / 3;
  }

  function ellipsoidVolume(rx, ry, rz) {
    const ax = Math.max(0, toFiniteNumber(rx, 0));
    const ay = Math.max(0, toFiniteNumber(ry, 0));
    const az = Math.max(0, toFiniteNumber(rz, 0));
    if (ax === 0 || ay === 0 || az === 0) {
      return 0;
    }
    return (4 / 3) * Math.PI * ax * ay * az;
  }

  function capsuleVolume(radius, cylinderHeight) {
    const r = Math.max(0, toFiniteNumber(radius, 0));
    if (r <= 0) {
      return 0;
    }
    const h = Math.max(0, toFiniteNumber(cylinderHeight, 0));
    const sphereVolume = (4 / 3) * Math.PI * r * r * r;
    const cylinderVolume = Math.PI * r * r * h;
    return sphereVolume + cylinderVolume;
  }

  function computeShapeBounds(shape, center, dimensions) {
    const cx = toFiniteNumber(center?.[0], 0);
    const cy = toFiniteNumber(center?.[1], 0);
    const cz = toFiniteNumber(center?.[2], 0);

    if (shape === 'ellipsoid') {
      const radii = dimensions?.radii ?? dimensions;
      const rx = Math.max(0, toFiniteNumber(radii?.[0], radii?.rx ?? 0));
      const ry = Math.max(0, toFiniteNumber(radii?.[1], radii?.ry ?? 0));
      const rz = Math.max(0, toFiniteNumber(radii?.[2], radii?.rz ?? 0));
      return {
        minX: cx - rx,
        maxX: cx + rx,
        minY: cy - ry,
        maxY: cy + ry,
        minZ: cz - rz,
        maxZ: cz + rz,
      };
    }

    if (shape === 'truncated-cone') {
      const height = Math.max(0, toFiniteNumber(dimensions?.height, 0));
      const baseY = Number.isFinite(dimensions?.baseY)
        ? dimensions.baseY
        : cy - height / 2;
      const topY = baseY + height;
      const bottomRadius = Math.max(0, toFiniteNumber(dimensions?.bottomRadius, 0));
      const topRadius = Math.max(0, toFiniteNumber(dimensions?.topRadius, 0));
      const radialExtent = Math.max(bottomRadius, topRadius);
      return {
        minX: cx - radialExtent,
        maxX: cx + radialExtent,
        minY: baseY,
        maxY: topY,
        minZ: cz - radialExtent,
        maxZ: cz + radialExtent,
      };
    }

    if (shape === 'capsule') {
      const radius = Math.max(0, toFiniteNumber(dimensions?.radius, 0));
      const cylinderHeight = Math.max(0, toFiniteNumber(dimensions?.height, 0));
      const halfHeight = cylinderHeight / 2;
      return {
        minX: cx - radius,
        maxX: cx + radius,
        minY: cy - halfHeight - radius,
        maxY: cy + halfHeight + radius,
        minZ: cz - radius,
        maxZ: cz + radius,
      };
    }

    if (shape === 'box') {
      const halfWidth = Math.max(0, toFiniteNumber(dimensions?.width, 0)) / 2;
      const halfHeight = Math.max(0, toFiniteNumber(dimensions?.height, 0)) / 2;
      const halfDepth = Math.max(0, toFiniteNumber(dimensions?.depth, 0)) / 2;
      return {
        minX: cx - halfWidth,
        maxX: cx + halfWidth,
        minY: cy - halfHeight,
        maxY: cy + halfHeight,
        minZ: cz - halfDepth,
        maxZ: cz + halfDepth,
      };
    }

    const halfSize = Math.max(0, toFiniteNumber(dimensions?.halfSize, 0));
    return {
      minX: cx - halfSize,
      maxX: cx + halfSize,
      minY: cy - halfSize,
      maxY: cy + halfSize,
      minZ: cz - halfSize,
      maxZ: cz + halfSize,
    };
  }

  function computeGridFootprint(bounds, tileSize) {
    const size = Math.max(DEFAULT_TILE_SIZE, toPositive(tileSize, DEFAULT_TILE_SIZE));
    const minTileX = Math.floor(bounds.minX / size);
    const maxTileX = Math.floor((bounds.maxX - Number.EPSILON) / size);
    const minTileZ = Math.floor(bounds.minZ / size);
    const maxTileZ = Math.floor((bounds.maxZ - Number.EPSILON) / size);
    const tilesX = maxTileX - minTileX + 1;
    const tilesZ = maxTileZ - minTileZ + 1;
    const tileCount = Math.max(0, tilesX) * Math.max(0, tilesZ);
    return {
      minTileX,
      maxTileX,
      minTileZ,
      maxTileZ,
      tileCount,
    };
  }

  function createVolumetricMassEngine(options = {}) {
    const tileSize = Math.max(DEFAULT_TILE_SIZE, toPositive(options.tileSize, DEFAULT_TILE_SIZE));
    const metrics = {
      computations: 0,
      clippedComputations: 0,
      errors: 0,
      flaggedEntities: [],
      reasonCounts: Object.create(null),
      lastError: null,
      lastResult: null,
      lastFootprint: null,
      totalFootprintTiles: 0,
      lastTerrainUpdate: null,
      terrainSamples: 0,
      lastSpecSummary: null,
    };

    const densityProfiles = new Map();
    const densityMetadata = new Map();

    const context = {
      tileSize,
      baseplateSize: Math.max(tileSize, toPositive(options.baseplateSize, tileSize)),
      worldBounds: {
        minX: toFiniteNumber(options.minX, -Infinity),
        maxX: toFiniteNumber(options.maxX, Infinity),
        minY: toFiniteNumber(options.minY, -Infinity),
        maxY: toFiniteNumber(options.maxY, Infinity),
        minZ: toFiniteNumber(options.minZ, -Infinity),
        maxZ: toFiniteNumber(options.maxZ, Infinity),
      },
      heightField: null,
      waterLevel: Number.isFinite(options.waterLevel) ? options.waterLevel : null,
    };

    function setBaseplateSize(size) {
      const positive = Math.max(tileSize, toPositive(size, tileSize));
      context.baseplateSize = positive;
      const half = positive / 2;
      context.worldBounds.minX = -half;
      context.worldBounds.maxX = half;
      context.worldBounds.minZ = -half;
      context.worldBounds.maxZ = half;
    }

    if (Number.isFinite(options.baseplateSize)) {
      setBaseplateSize(options.baseplateSize);
    }

    for (const [id, density] of Object.entries(DEFAULT_DENSITIES)) {
      densityProfiles.set(id, { id, density });
      densityMetadata.set(id, { source: 'default' });
    }

    function updateTerrainContext(update = {}) {
      if (Number.isFinite(update.baseplateSize)) {
        setBaseplateSize(update.baseplateSize);
      }
      if (Number.isFinite(update.minY)) {
        context.worldBounds.minY = update.minY;
      }
      if (Number.isFinite(update.maxY)) {
        context.worldBounds.maxY = update.maxY;
      }
      if (Array.isArray(update.heightField)) {
        context.heightField = update.heightField;
      }
      if (Number.isFinite(update.waterLevel)) {
        context.waterLevel = update.waterLevel;
      }
      metrics.lastTerrainUpdate = Date.now();
    }

    function registerDensityProfile(id, density, meta = {}) {
      if (!id || typeof id !== 'string') {
        return false;
      }
      const value = toPositive(density, NaN);
      if (!Number.isFinite(value)) {
        return false;
      }
      densityProfiles.set(id, { id, density: value });
      densityMetadata.set(id, { ...meta, source: meta?.source ?? 'custom' });
      return true;
    }

    function resolveDensity(materialId, fallbackDensity, metadata) {
      if (Number.isFinite(fallbackDensity) && fallbackDensity > 0) {
        return fallbackDensity;
      }
      if (materialId && densityProfiles.has(materialId)) {
        return densityProfiles.get(materialId).density;
      }
      const category = metadata?.category;
      if (category) {
        const categoryId = `${category}-generic`;
        if (densityProfiles.has(categoryId)) {
          return densityProfiles.get(categoryId).density;
        }
      }
      if (materialId && materialId.includes(':')) {
        const [prefix] = materialId.split(':');
        const fallbackId = `${prefix}-generic`;
        if (densityProfiles.has(fallbackId)) {
          return densityProfiles.get(fallbackId).density;
        }
      }
      return densityProfiles.get('water').density;
    }

    function sampleHeight(x, z) {
      const field = context.heightField;
      if (!Array.isArray(field) || field.length === 0) {
        return null;
      }
      const gridSize = field.length;
      const maxIndex = gridSize - 1;
      const baseSize = context.baseplateSize;
      if (!Number.isFinite(baseSize) || baseSize <= 0) {
        return null;
      }
      const half = baseSize / 2;
      const normalizedX = clamp((x + half) / baseSize, 0, 1) * maxIndex;
      const normalizedZ = clamp((z + half) / baseSize, 0, 1) * maxIndex;
      const x0 = Math.floor(normalizedX);
      const z0 = Math.floor(normalizedZ);
      const x1 = Math.min(maxIndex, x0 + 1);
      const z1 = Math.min(maxIndex, z0 + 1);
      const tx = normalizedX - x0;
      const tz = normalizedZ - z0;

      const v00 = toFiniteNumber(field[z0]?.[x0], 0);
      const v10 = toFiniteNumber(field[z0]?.[x1], v00);
      const v01 = toFiniteNumber(field[z1]?.[x0], v00);
      const v11 = toFiniteNumber(field[z1]?.[x1], v10);

      const lerp = (a, b, t) => a + (b - a) * t;
      const ix0 = lerp(v00, v10, tx);
      const ix1 = lerp(v01, v11, tx);
      return lerp(ix0, ix1, tz);
    }

    function registerFlaggedEntry(entry) {
      if (!entry) {
        return null;
      }
      metrics.flaggedEntities.unshift(entry);
      if (metrics.flaggedEntities.length > MAX_FLAGGED_ENTRIES) {
        metrics.flaggedEntities.length = MAX_FLAGGED_ENTRIES;
      }
      const reason = entry.reason;
      if (reason) {
        metrics.reasonCounts[reason] = (metrics.reasonCounts[reason] || 0) + 1;
      }
      return entry;
    }

    function computeVolumeInternal(shape, dimensions) {
      if (shape === 'ellipsoid') {
        const radii = dimensions?.radii ?? dimensions;
        return ellipsoidVolume(radii?.[0], radii?.[1], radii?.[2]);
      }
      if (shape === 'truncated-cone') {
        return truncatedConeVolume(dimensions?.height, dimensions?.bottomRadius, dimensions?.topRadius);
      }
      if (shape === 'capsule') {
        return capsuleVolume(dimensions?.radius, dimensions?.height);
      }
      if (shape === 'cylinder') {
        const radius = Math.max(0, toFiniteNumber(dimensions?.radius, 0));
        const height = Math.max(0, toFiniteNumber(dimensions?.height, 0));
        return Math.PI * radius * radius * height;
      }
      if (shape === 'box') {
        const width = Math.max(0, toFiniteNumber(dimensions?.width, 0));
        const depth = Math.max(0, toFiniteNumber(dimensions?.depth, 0));
        const height = Math.max(0, toFiniteNumber(dimensions?.height, 0));
        if (width === 0 || depth === 0 || height === 0) {
          return 0;
        }
        return width * depth * height;
      }
      return 0;
    }

    function applyWorldClipping(volume, bounds) {
      if (!Number.isFinite(volume) || volume <= 0) {
        return { volume: 0, ratio: 0 };
      }
      const world = context.worldBounds;
      const width = bounds.maxX - bounds.minX;
      const height = bounds.maxY - bounds.minY;
      const depth = bounds.maxZ - bounds.minZ;
      const clippedWidth = Math.max(0, Math.min(bounds.maxX, world.maxX) - Math.max(bounds.minX, world.minX));
      const clippedHeight = Math.max(0, Math.min(bounds.maxY, world.maxY) - Math.max(bounds.minY, world.minY));
      const clippedDepth = Math.max(0, Math.min(bounds.maxZ, world.maxZ) - Math.max(bounds.minZ, world.minZ));

      let ratio = 1;
      if (width > 0 && clippedWidth < width) {
        ratio *= clippedWidth / width;
      }
      if (height > 0 && clippedHeight < height) {
        ratio *= clippedHeight / height;
      }
      if (depth > 0 && clippedDepth < depth) {
        ratio *= clippedDepth / depth;
      }
      ratio = clamp(ratio, 0, 1);
      const clippedVolume = volume * ratio;
      return { volume: clippedVolume, ratio };
    }

    function evaluateOutlier(mass, volume, density, spec) {
      if (!Number.isFinite(mass) || mass < 0) {
        return 'mass-invalid';
      }
      if (volume > 0 && (!Number.isFinite(density) || density <= 0)) {
        return 'density-invalid';
      }
      const expected = spec.expectedRange;
      if (expected) {
        if (Number.isFinite(expected.min) && mass < expected.min) {
          return 'mass-below-range';
        }
        if (Number.isFinite(expected.max) && mass > expected.max) {
          return 'mass-above-range';
        }
      }
      if (volume > 0) {
        const ratio = mass / volume;
        if (!Number.isFinite(ratio) || ratio <= 0) {
          return 'density-invalid';
        }
        if (ratio > 8000 || ratio < 30) {
          return 'density-outlier';
        }
      }
      return null;
    }

    function computeMass(spec = {}) {
      metrics.computations += 1;
      try {
        const shape = spec.shape || 'ellipsoid';
        if (!SUPPORTED_SHAPES.has(shape)) {
          const density = resolveDensity(spec.materialId, spec.density, spec.metadata);
          const error = new Error(`Forma volumétrica no soportada: ${shape}`);
          metrics.errors += 1;
          metrics.lastError = { message: error.message, stack: error.stack ?? null };
          const flaggedEntry = registerFlaggedEntry({
            reason: 'shape-unsupported',
            metadata: spec.metadata || null,
            timestamp: Date.now(),
            shape,
          });
          const result = {
            volume: 0,
            rawVolume: 0,
            density,
            mass: 0,
            error,
            clippedRatio: 0,
            gridFootprint: null,
            flagged: flaggedEntry,
          };
          metrics.lastResult = result;
          metrics.lastSpecSummary = {
            shape,
            materialId: spec.materialId ?? null,
            density,
            volume: 0,
            mass: 0,
            clippedRatio: 0,
            timestamp: Date.now(),
            issue: 'shape-unsupported',
          };
          return result;
        }
        const center = spec.center || [0, 0, 0];
        const dimensions = spec.dimensions || {};
        const metadata = spec.metadata || {};
        const baseVolume = computeVolumeInternal(shape, dimensions);
        const bounds = computeShapeBounds(shape, center, dimensions);
        const clipping = applyWorldClipping(baseVolume, bounds);
        if (clipping.ratio < 0.999) {
          metrics.clippedComputations += 1;
        }

        let effectiveVolume = clipping.volume;
        if (metadata.clipBelowTerrain && Number.isFinite(center?.[0]) && Number.isFinite(center?.[2])) {
          const ground = sampleHeight(center[0], center[2]);
          if (Number.isFinite(ground)) {
            metrics.terrainSamples += 1;
            const totalHeight = bounds.maxY - bounds.minY;
            if (totalHeight > 0 && ground > bounds.minY) {
              const availableHeight = Math.max(0, bounds.maxY - ground);
              const ratio = clamp(availableHeight / totalHeight, 0, 1);
              effectiveVolume *= ratio;
              if (ratio < 0.999) {
                metrics.clippedComputations += 1;
              }
            }
          }
        }

        const density = resolveDensity(spec.materialId, spec.density, metadata);
        const mass = effectiveVolume * density;

        const footprint = computeGridFootprint(bounds, context.tileSize);
        metrics.lastFootprint = footprint;
        metrics.totalFootprintTiles += footprint.tileCount;

        const outlier = evaluateOutlier(mass, effectiveVolume, density, spec);
        let flaggedEntry = null;
        if (outlier) {
          flaggedEntry = registerFlaggedEntry({
            reason: outlier,
            mass,
            volume: effectiveVolume,
            density,
            metadata,
            timestamp: Date.now(),
            shape,
          });
        }

        const result = {
          volume: effectiveVolume,
          rawVolume: baseVolume,
          density,
          mass,
          clippedRatio: clipping.ratio,
          gridFootprint: footprint,
          flagged: flaggedEntry,
        };
        metrics.lastResult = result;
        metrics.lastSpecSummary = {
          shape,
          materialId: spec.materialId ?? null,
          density,
          volume: effectiveVolume,
          mass,
          clippedRatio: clipping.ratio,
          timestamp: Date.now(),
          issue: flaggedEntry ? flaggedEntry.reason : null,
        };
        return result;
      } catch (error) {
        metrics.errors += 1;
        metrics.lastError = {
          message: error?.message ?? String(error),
          stack: typeof error?.stack === 'string' ? error.stack : null,
        };
        registerFlaggedEntry({
          reason: 'mass-computation-error',
          metadata: spec?.metadata || null,
          timestamp: Date.now(),
          shape: spec?.shape || null,
        });
        return {
          volume: 0,
          rawVolume: 0,
          density: 0,
          mass: 0,
          error,
          clippedRatio: 0,
          gridFootprint: null,
          flagged: metrics.flaggedEntities[0] || null,
        };
      }
    }

    return {
      computeMass,
      computeVolume: (shapeSpec) => computeVolumeInternal(shapeSpec?.shape, shapeSpec?.dimensions ?? shapeSpec),
      resolveDensity: (materialId, fallbackDensity, metadata) =>
        resolveDensity(materialId, fallbackDensity, metadata),
      registerDensityProfile,
      updateTerrainContext,
      metrics,
      getContext: () => ({ ...context }),
    };
  }

  if (typeof global.createVolumetricMassEngine !== 'function') {
    global.createVolumetricMassEngine = createVolumetricMassEngine;
  }
  global.__ARRECIFE_VOLUME_FACTORY__ = createVolumetricMassEngine;
  if (typeof module !== 'undefined' && module && module.exports) {
    module.exports = createVolumetricMassEngine;
    module.exports.createVolumetricMassEngine = createVolumetricMassEngine;
  }
})(typeof globalThis !== 'undefined'
  ? globalThis
  : typeof self !== 'undefined'
  ? self
  : typeof window !== 'undefined'
  ? window
  : this);
