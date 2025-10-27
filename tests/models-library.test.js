const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const libraryPath = path.resolve(__dirname, '..', 'scripts', 'models-library.js');
const library = require(libraryPath);

assert(Array.isArray(library), 'La biblioteca de modelos debe ser un arreglo.');
assert(library.length >= 6, 'Se esperaban al menos seis modelos registrados.');

const expectedIds = [
  'coral-usdz',
  'clownfish-pack',
  'coral-piece',
  'coral-source-blend',
  'lowpoly-fish-pack',
  'great-hammerhead-shark',
];

for (const id of expectedIds) {
  const model = library.find((entry) => entry && entry.id === id);
  assert(model, `Falta el modelo obligatorio: ${id}`);
  assert(Array.isArray(model.files) && model.files.length > 0, `El modelo ${id} debe listar archivos.`);
}

const coralUsd = library.find((entry) => entry.id === 'coral-usdz');
const coralUsdFile = coralUsd.files.find((file) => file.path === 'Coral.usdz');
assert(coralUsdFile, 'El modelo coral-usdz debe incluir el archivo Coral.usdz.');
assert(coralUsdFile.format === 'usdz', 'El archivo Coral.usdz debe declarar formato usdz.');

const hammerhead = library.find((entry) => entry.id === 'great-hammerhead-shark');
assert(hammerhead.files.some((file) => Array.isArray(file.contents) && file.contents.includes('source/hammerhead_geo_294_RE-PACKED_jpgs.blend')),
  'El modelo de tiburón martillo debe enumerar su archivo .blend principal.');

console.log('✅ Biblioteca de modelos verificada correctamente');
