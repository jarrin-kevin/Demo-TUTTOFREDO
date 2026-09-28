const fs = require('fs');
const path = require('path');
const https = require('https');

const config = require('./kiosk-config');

// --skip-images regenera solo el JSON, sin volver a bajar las fotos.
const skipImages = process.argv.includes('--skip-images');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-raw.json'), 'utf8'));

const outDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');
fs.mkdirSync(outDir, { recursive: true });
const brandDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'brand');
fs.mkdirSync(brandDir, { recursive: true });

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function download(url, destPath) {
  if (skipImages) return Promise.resolve();
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  const branch = raw.branch;
  const jobs = [];

  jobs.push(download(branch.logoUrl, path.join(brandDir, 'logo.webp')));
  jobs.push(download(branch.menuCoverUrl, path.join(brandDir, 'cover.webp')));

  const categories = [];
  const seenNames = new Map();

  for (const cat of raw.menu.categories) {
    const catSlug = slugify(cat.name);
    const catCoverFile = cat.cover ? `${catSlug}-cover.webp` : null;
    if (cat.cover) jobs.push(download(cat.cover, path.join(outDir, catCoverFile)));

    const items = [];
    for (const item of cat.items) {
      if (!item.active || item.available === false) continue;
      let slug = slugify(item.name);
      const count = seenNames.get(slug) || 0;
      seenNames.set(slug, count + 1);
      if (count > 0) slug = `${slug}-${count + 1}`;

      const fileName = `${slug}.webp`;
      if (item.imageUrl) {
        jobs.push(download(item.imageUrl, path.join(outDir, fileName)));
      }

      const optionGroups = (item.optionGroupAssignments || []).map(a => ({
        name: a.optionGroup.name,
        required: a.optionGroup.required || config.requiredOptionGroups.includes(a.optionGroup.name),
        selectionType: a.optionGroup.selectionType,
        options: (a.optionGroup.items || []).filter(o => o.active).map(o => ({
          name: o.name,
          price: o.price || 0,
        })),
      })).filter(g => g.options.length > 0); // p. ej. "Sabor de helado soft" viene vacío

      items.push({
        id: item.id,
        slug,
        name: config.renameItems[item.id] || item.name,
        description: item.description || '',
        price: item.price,
        image: item.imageUrl ? `/images/products/${fileName}` : null,
        optionGroups,
      });
    }

    if (items.length === 0) continue;

    categories.push({
      id: cat.id,
      slug: catSlug,
      name: cat.name,
      label: config.categoryLabels[catSlug] || cat.name,
      cover: catCoverFile ? `/images/products/${catCoverFile}` : null,
      items,
    });
  }

  if (skipImages) {
    console.log('Skipping image downloads (--skip-images).');
  } else {
    console.log(`Downloading ${jobs.length} images...`);
    const results = await Promise.allSettled(jobs);
    const failed = results.filter(r => r.status === 'rejected');
    console.log(`Done. ${results.length - failed.length} ok, ${failed.length} failed.`);
    failed.forEach(f => console.log('  FAILED:', f.reason.message));
  }

  const catalog = {
    branch: {
      name: branch.name,
      address: branch.address,
      brandColor: branch.brandColor,
      logo: '/images/brand/logo.webp',
      cover: '/images/brand/cover.webp',
      currency: 'USD',
      taxRate: config.tax.rate,
      pricesIncludeTax: config.tax.pricesIncludeTax,
    },
    groups: config.groups.map(g => {
      const missing = g.categories.filter(slug => !categories.some(c => c.slug === slug));
      if (missing.length) throw new Error(`Grupo "${g.name}": categorías inexistentes ${missing.join(', ')}`);
      return { ...g, image: `/images/products/${g.image}.webp`, cover: `/images/products/${g.cover}-cover.webp` };
    }),
    upsell: config.upsell,
    categories,
  };
  const grouped = new Set(config.groups.flatMap(g => g.categories));
  const orphans = categories.filter(c => !grouped.has(c.slug)).map(c => c.slug);
  if (orphans.length) throw new Error(`Categorías sin grupo: ${orphans.join(', ')}`);

  const outPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'catalog.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2));
  console.log(`Catalog written: ${outPath}`);
  console.log(`Categories: ${categories.length}, Items: ${categories.reduce((a, c) => a + c.items.length, 0)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
