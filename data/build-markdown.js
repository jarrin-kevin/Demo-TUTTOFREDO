const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'frontend', 'src', 'data', 'catalog.json'), 'utf8'));

// GitHub/VS Code-style slugify: lowercase, KEEP accented letters (í, ñ, á...)
// since that's what real markdown viewers do when auto-generating heading
// anchors — only strip punctuation that isn't a letter/number/space/hyphen,
// then turn spaces into hyphens. Stripping accents here would produce anchors
// that don't match the actual rendered heading anchor.
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replace(/ /g, '-');
}

// Map a catalog image path (e.g. "/images/products/foo.webp") to the local
// converted JPG living in catalogo-fotos/, relative to the project root
// (where CATALOGO.md lives).
function toLocalImagePath(imagePath) {
  const base = path.basename(imagePath, path.extname(imagePath));
  const dir = path.basename(path.dirname(imagePath)); // "products" or "brand"
  return `catalogo-fotos/${dir}/${base}.jpg`;
}

const lines = [];
lines.push(`# Catálogo — ${catalog.branch.name}`);
lines.push('');
lines.push(`${catalog.branch.address}`);
lines.push('');
lines.push('> Bajado del menú real (Clickeame). Foto, descripción y precio de cada producto. Vas agregando lo que encuentres debajo de cada sección o al final.');
lines.push('');

lines.push('## Índice');
lines.push('');
for (const cat of catalog.categories) {
  const anchor = slugify(cat.name);
  lines.push(`- [${cat.name}](#${anchor}) (${cat.items.length})`);
}
lines.push('');
lines.push('---');
lines.push('');

let totalItems = 0;

for (const cat of catalog.categories) {
  lines.push(`## ${cat.name}`);
  lines.push('');
  for (const item of cat.items) {
    totalItems++;
    lines.push(`### ${item.name} — $${item.price.toFixed(2)}`);
    lines.push('');
    if (item.image) {
      lines.push(`![${item.name}](${toLocalImagePath(item.image)})`);
      lines.push('');
    }
    if (item.description) {
      lines.push(item.description);
      lines.push('');
    }
    if (item.optionGroups && item.optionGroups.length) {
      for (const g of item.optionGroups) {
        const req = g.required ? ' (obligatorio)' : ' (opcional)';
        lines.push(`- **${g.name}**${req}: ${g.options.map(o => o.name).join(', ')}`);
      }
      lines.push('');
    }
  }
  lines.push('---');
  lines.push('');
}

lines.push('## Notas / cosas por agregar');
lines.push('');
lines.push('- ');
lines.push('');

fs.writeFileSync(path.join(__dirname, '..', 'CATALOGO.md'), lines.join('\n'));
console.log(`CATALOGO.md escrito: ${catalog.categories.length} categorías, ${totalItems} productos.`);
