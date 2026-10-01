import { branch, taxBreakdown } from './catalog.js';

// Servicio local de impresión (carpeta impresora/ del repo): imprime por
// ESC/POS directo en la térmica, sin márgenes del driver y con corte al ras.
// Si la app la sirve el mismo servicio (build con VITE_PRINT_URL=same-origin)
// se llama a /imprimir en el mismo origen.
const envUrl = import.meta.env.VITE_PRINT_URL;
export const PRINT_URL = envUrl === 'same-origin' ? '' : envUrl || 'http://127.0.0.1:5123';

export const METODOS = { card: 'Tarjeta', deuna: 'Deuna', cash: 'Efectivo (pagar en caja)' };

export function fechaHora(iso) {
  const d = iso ? new Date(iso) : new Date();
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const redondear = n => Math.round(n * 100) / 100;

// Mismo contenido que el ticket del navegador, en el formato de Ticket.cs.
export function buildTicket(order) {
  const { base, tax, rate, total } = taxBreakdown(order.total);
  const b = order.billing || { type: 'final' };
  const conDatos = b.type === 'cedula' || b.type === 'ruc';
  return {
    local: { nombre: branch.name, direccion: branch.address },
    orden: order.number,
    fechaHora: fechaHora(order.at),
    formaPago: METODOS[order.method] || order.method,
    cliente: conDatos
      ? { tipo: b.type, nombre: [b.name, b.lastName].filter(Boolean).join(' '), identificacion: b.id, direccion: b.address || '', correo: b.email || '' }
      : { tipo: 'final' },
    productos: order.lines.map(l => ({
      nombre: l.item.name,
      opciones: l.options.map(o => o.name).join(', '),
      cantidad: l.qty,
      valorUnitario: redondear(l.unitPrice),
      valorTotal: redondear(l.unitPrice * l.qty),
    })),
    baseImponible: redondear(base),
    iva: redondear(tax),
    ivaPorcentaje: Math.round(rate * 100),
    total: redondear(total),
    pagoPendiente: order.method === 'cash',
    facturaPorCorreo: Boolean(conDatos && b.email),
  };
}

// true si el servicio local imprimió; false si no está corriendo o falló.
export async function printWithService(order) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`${PRINT_URL}/imprimir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildTicket(order)),
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
