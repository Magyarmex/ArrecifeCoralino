const globalScope = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};

const coralUsdAsset = new URL('../Coral.usdz', import.meta.url);
const clownfishPackAsset = new URL('../clownfish.zip', import.meta.url);
const coralPieceAsset = new URL('../coral-piece.zip', import.meta.url);
const coralBlendAsset = new URL('../coral.zip', import.meta.url);
const lowPolyFishAsset = new URL('../lowpoly-fish-pack.zip', import.meta.url);
const hammerheadAsset = new URL('../model-73a-great-hammerhead-shark.zip', import.meta.url);

function toStringArray(items) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item) => String(item));
}

function createFileDescriptor(file) {
  const descriptor = {
    path: String(file.path),
    format: file.format ? String(file.format) : null,
    size: Number.isFinite(file.size) ? file.size : null,
    description: file.description ? String(file.description) : undefined,
    contents: toStringArray(file.contents),
  };

  if (file.href) {
    descriptor.href = String(file.href);
  }

  return descriptor;
}

function createModel(entry) {
  const model = {
    id: String(entry.id),
    name: entry.name ? String(entry.name) : String(entry.id),
    category: entry.category ? String(entry.category) : 'uncategorized',
    tags: toStringArray(entry.tags),
    files: Array.isArray(entry.files) ? entry.files.map(createFileDescriptor) : [],
  };

  if (entry.attribution) {
    model.attribution = String(entry.attribution);
  }

  if (entry.previewImage) {
    model.previewImage = String(entry.previewImage);
  }

  return model;
}

const modelLibrary = [
  createModel({
    id: 'coral-usdz',
    name: 'Coral Reef USDZ Scene',
    category: 'environment',
    tags: ['reef', 'environment', 'ar'],
    files: [
      {
        path: 'Coral.usdz',
        href: coralUsdAsset.href,
        format: 'usdz',
        size: 21209462,
        description: 'Self-contained USDZ export optimized for AR viewers.',
      },
    ],
  }),
  createModel({
    id: 'clownfish-pack',
    name: 'Clownfish PBR Pack',
    category: 'fauna',
    tags: ['fish', 'pbr', 'marine-life'],
    files: [
      {
        path: 'clownfish.zip',
        href: clownfishPackAsset.href,
        format: 'zip',
        size: 6722431,
        description: 'ZIP archive with FBX source and PBR texture set.',
        contents: [
          'source/Clownfish.zip',
          'textures/wire_028149177_AO.jpeg',
          'textures/wire_028149177_albedo.jpeg',
          'textures/wire_028149177_roughness.jpeg',
          'textures/wire_028149177_normal.png',
          'textures/wire_028149177_metallic.jpeg',
        ],
      },
    ],
  }),
  createModel({
    id: 'coral-piece',
    name: 'Coral Piece (FBX)',
    category: 'environment',
    tags: ['coral', 'scenery'],
    files: [
      {
        path: 'coral-piece.zip',
        href: coralPieceAsset.href,
        format: 'zip',
        size: 3146458,
        description: 'Coral FBX export with diffuse, roughness and inverted masks.',
        contents: [
          'source/coral fbx finished.fbx',
          'textures/Planes.png',
          'textures/coral_fbx_lambert1_BaseColor.png',
          'textures/inverted.png',
          'textures/coral_fbx_lambert1_Metallic.png',
          'textures/coral_fbx_lambert1_Roughness.png',
        ],
      },
    ],
  }),
  createModel({
    id: 'coral-source-blend',
    name: 'Coral Source Blend',
    category: 'environment',
    tags: ['coral', 'source'],
    files: [
      {
        path: 'coral.zip',
        href: coralBlendAsset.href,
        format: 'zip',
        size: 887140,
        description: 'Blender project for coral structure plus supporting texture.',
        contents: ['source/coral.blend', 'textures/cora_2l.jpg'],
      },
    ],
  }),
  createModel({
    id: 'lowpoly-fish-pack',
    name: 'Low Poly Fish Pack',
    category: 'fauna',
    tags: ['fish', 'stylized'],
    files: [
      {
        path: 'lowpoly-fish-pack.zip',
        href: lowPolyFishAsset.href,
        format: 'zip',
        size: 5225710,
        description: 'Low poly fish FBX with diffuse and normal texture variants.',
        contents: [
          'source/fish_pack.fbx',
          'textures/fish_2_normal.jpg',
          'textures/fish_3_diffuse.jpg',
          'textures/fish_2_diffuse.jpg',
          'textures/internal_ground_ao_texture.jpeg',
          'textures/fish_1_diffuse.jpg',
          'textures/fish_3_normal.jpg',
        ],
      },
    ],
  }),
  createModel({
    id: 'great-hammerhead-shark',
    name: 'Great Hammerhead Shark',
    category: 'fauna',
    tags: ['shark', 'marine-life', 'high-poly'],
    files: [
      {
        path: 'model-73a-great-hammerhead-shark.zip',
        href: hammerheadAsset.href,
        format: 'zip',
        size: 16627796,
        description: 'High fidelity hammerhead shark with layered texture maps.',
        contents: [
          'source/hammerhead_geo_294_RE-PACKED_jpgs.blend',
          'textures/body_albado_030_mouthFix.jpg',
          'textures/body_roughness_004_contrastForSketchfab_fi.jpg',
          'textures/body_ao_004_gimp_gills.jpg',
          'textures/eye_color.jpeg',
          'textures/body_normal_007_nostrils.jpg',
        ],
      },
    ],
  }),
];

const target = Array.isArray(globalScope.modelLibrary) ? globalScope.modelLibrary : [];
const existingIds = new Set(target.map((item) => item && item.id));

for (const model of modelLibrary) {
  if (!existingIds.has(model.id)) {
    target.push(model);
    existingIds.add(model.id);
  }
}

globalScope.modelLibrary = target;

export { modelLibrary };
export default modelLibrary;
