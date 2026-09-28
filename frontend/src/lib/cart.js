import { selectedOptions } from './catalog.js';

// Una línea del carrito = producto + opciones elegidas. Si el cliente agrega
// lo mismo dos veces, se suma la cantidad en vez de duplicar la línea.
export function makeLine(item, selections, qty) {
  const options = selectedOptions(item, selections);
  const unitPrice = item.price + options.reduce((a, o) => a + o.price, 0);
  const key = item.id + '|' + options.map(o => `${o.group}:${o.name}`).join('|');
  return { key, item, selections, options, unitPrice, qty };
}

export function cartReducer(lines, action) {
  switch (action.type) {
    case 'add': {
      const existing = lines.find(l => l.key === action.line.key);
      if (existing) return lines.map(l => (l.key === existing.key ? { ...l, qty: l.qty + action.line.qty } : l));
      return [...lines, action.line];
    }
    case 'replace': // al editar una línea (puede cambiar sus opciones)
      return cartReducer(lines.filter(l => l.key !== action.key), { type: 'add', line: action.line });
    case 'qty':
      return lines
        .map(l => (l.key === action.key ? { ...l, qty: l.qty + action.delta } : l))
        .filter(l => l.qty > 0);
    case 'remove':
      return lines.filter(l => l.key !== action.key);
    case 'clear':
      return [];
    default:
      return lines;
  }
}

export const cartTotal = lines => lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
export const cartCount = lines => lines.reduce((a, l) => a + l.qty, 0);
