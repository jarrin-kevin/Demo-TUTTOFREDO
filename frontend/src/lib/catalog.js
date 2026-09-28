import raw from '../data/catalog.json';

// Las rutas del JSON son absolutas ("/images/..."). Se les antepone la base
// de Vite para que funcione también en una subcarpeta (GitHub Pages).
const asset = path => (path ? import.meta.env.BASE_URL + path.replace(/^\//, '') : path);

const catalog = {
  ...raw,
  branch: { ...raw.branch, logo: asset(raw.branch.logo), cover: asset(raw.branch.cover) },
  groups: raw.groups.map(g => ({ ...g, image: asset(g.image), cover: asset(g.cover) })),
  categories: raw.categories.map(c => ({
    ...c,
    cover: asset(c.cover),
    items: c.items.map(i => ({ ...i, image: asset(i.image) })),
  })),
};

export const branch = catalog.branch;

const categoriesBySlug = Object.fromEntries(catalog.categories.map(c => [c.slug, c]));

// Los 9 grupos del menú, cada uno con sus categorías (pestañas) resueltas.
export const groups = catalog.groups.map(g => ({
  ...g,
  categories: g.categories.map(slug => categoriesBySlug[slug]),
}));

export const groupsBySlug = Object.fromEntries(groups.map(g => [g.slug, g]));

// Qué grupo contiene a cada producto (para saber si el carrito ya tiene bebida).
export const groupOfItem = {};
for (const g of groups) {
  for (const c of g.categories) for (const item of c.items) groupOfItem[item.id] = g.slug;
}

export const upsell = catalog.upsell;

export function groupItems(slug) {
  return groupsBySlug[slug].categories.flatMap(c => c.items);
}

// Grupos que el cliente no necesita ver: obligatorios con una sola opción
// (p. ej. "Tipo de leche: Leche entera"). Se eligen solos.
export function isAutoGroup(group) {
  return group.required && group.options.length === 1;
}

export function defaultSelections(item) {
  const sel = {};
  item.optionGroups.forEach((g, i) => {
    if (isAutoGroup(g)) sel[i] = [0];
  });
  return sel;
}

export function needsCustomizing(item) {
  return item.optionGroups.some(g => !isAutoGroup(g));
}

export function missingRequired(item, selections) {
  return item.optionGroups
    .map((g, i) => (g.required && !(selections[i] || []).length ? g.name : null))
    .filter(Boolean);
}

export function selectedOptions(item, selections) {
  const out = [];
  item.optionGroups.forEach((g, i) => {
    for (const idx of selections[i] || []) out.push({ group: g.name, name: g.options[idx].name, price: g.options[idx].price });
  });
  return out;
}

// Mismo formato que el menú impreso: $4.50
export const formatMoney = n => `$${n.toFixed(2)}`;

// Los precios ya incluyen IVA: se desglosa la base imponible y el impuesto.
export function taxBreakdown(total) {
  const rate = branch.taxRate || 0;
  const base = branch.pricesIncludeTax ? total / (1 + rate) : total;
  const tax = branch.pricesIncludeTax ? total - base : total * rate;
  return { base, tax, total: branch.pricesIncludeTax ? total : total + tax, rate };
}
