// Ticket del pedido. Primero se manda al servicio local de impresión
// (impresora/, ESC/POS con ESC_POS_USB_NET): corta al ras y sin márgenes.
// Si el servicio no está corriendo, se imprime con window.print() como
// respaldo. Se monta fuera de #root, así al imprimir solo sale el ticket.

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { branch, taxBreakdown } from '../lib/catalog.js';
import { METODOS, fechaHora, printWithService } from '../lib/ticket.js';
import './recibo.css';

const CONSUMIDOR_FINAL_ID = '9999999999999';

const dos = n => n.toFixed(2);

function Cliente({ billing }) {
  if (!billing || billing.type === 'final') {
    return (
      <>
        <p className="centro negrita">CONSUMIDOR FINAL</p>
        <p>C.I./RUC : {CONSUMIDOR_FINAL_ID}</p>
      </>
    );
  }
  const ruc = billing.type === 'ruc';
  return (
    <>
      <p>
        {ruc ? 'Razón social' : 'Cliente'} : {[billing.name, billing.lastName].filter(Boolean).join(' ')}
      </p>
      <p>
        {ruc ? 'RUC' : 'Cédula'} : {billing.id}
      </p>
      {billing.address && <p>Dirección : {billing.address}</p>}
      {billing.email && <p>Correo : {billing.email}</p>}
    </>
  );
}

const PAPEL_MM = 80;

// Chrome no acepta un alto "auto" en @page: se mide el ticket y se le da
// a la página exactamente ese alto, así la impresora corta al ras.
export function printTicket() {
  const ticket = document.getElementById('ticket');
  if (!ticket) return;
  const altoMm = Math.ceil((ticket.getBoundingClientRect().height * 25.4) / 96) + 2;
  let estilo = document.getElementById('ticket-page');
  if (!estilo) {
    estilo = document.createElement('style');
    estilo.id = 'ticket-page';
    document.head.appendChild(estilo);
  }
  estilo.textContent = `@page { size: ${PAPEL_MM}mm ${altoMm}mm; margin: 0; }`;
  window.print();
}

// Imprime el pedido: servicio local y, si no responde, el navegador.
export async function printOrder(order) {
  if (await printWithService(order)) return 'servicio';
  printTicket();
  return 'navegador';
}

// autoPrint: imprime apenas carga el logo.
export default function Recibo({ order, autoPrint }) {
  const logo = useRef(null);
  const { base, tax, rate, total } = taxBreakdown(order.total);
  const pct = Math.round(rate * 100);
  const efectivo = order.method === 'cash';

  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    const img = logo.current;
    const ready = new Promise(resolve => {
      if (!img || img.complete) return resolve();
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
    ready.then(() => !cancelled && printOrder(order));
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  return createPortal(
    <div id="ticket" className="ticket" aria-hidden="true">
      <img ref={logo} className="ticket-logo" src={branch.logo} alt="" />
      <p className="centro negrita grande">TUTTO FREDDO</p>
      <p className="centro">{branch.name}</p>
      <p className="centro">{branch.address}</p>
      <hr />

      <p className="centro">¡Gracias por tu compra!</p>
      <p className="centro">Pedido N°</p>
      <p className="centro numero">{order.number}</p>
      <p>Fecha y hora : {fechaHora(order.at)}</p>
      <p>Forma de pago : {METODOS[order.method] || order.method}</p>
      <hr />

      <Cliente billing={order.billing} />
      <hr />

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th className="num">Cant</th>
            <th className="num">V.Unit</th>
            <th className="num">V.Total</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map(l => (
            <tr key={l.key}>
              <td>
                {l.item.name}
                {l.options.length > 0 && <span className="opciones">{l.options.map(o => o.name).join(', ')}</span>}
              </td>
              <td className="num">{l.qty}</td>
              <td className="num">{dos(l.unitPrice)}</td>
              <td className="num">{dos(l.unitPrice * l.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />

      <div className="totales">
        <p>
          <span>Base imponible IVA {pct}%</span>
          <span>{dos(base)}</span>
        </p>
        <p>
          <span>Base imponible 0%</span>
          <span>0.00</span>
        </p>
        <p>
          <span>IVA {pct}%</span>
          <span>{dos(tax)}</span>
        </p>
        <p className="negrita grande">
          <span>TOTAL USD</span>
          <span>{dos(total)}</span>
        </p>
      </div>
      <hr />

      {efectivo && (
        <>
          <p className="centro negrita">PAGO PENDIENTE: acércate a caja</p>
          <hr />
        </>
      )}
      <p className="centro">Todos nuestros V.Unit incluyen IVA</p>
      {order.billing?.email && <p className="centro">Tu factura electrónica llegará a tu correo</p>}
      <p className="centro">Retira tu pedido cuando llamen tu número</p>
    </div>,
    document.body,
  );
}
