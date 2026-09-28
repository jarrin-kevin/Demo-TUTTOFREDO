import React, { useEffect, useState } from 'react';
import { formatMoney } from '../lib/catalog.js';
import { Icon } from '../components/ui.jsx';

const RESET_SECONDS = 25;

export default function Done({ order, onNew }) {
  const [left, setLeft] = useState(RESET_SECONDS);
  useEffect(() => {
    const t = setInterval(() => setLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left <= 0) onNew();
  }, [left, onNew]);

  const cash = order.method === 'cash';
  const firstName = order.billing.type === 'cedula' ? order.billing.name.trim().split(/\s+/)[0] : null;

  return (
    <main className="screen done">
      <div className="done-box">
        <div className="ok-mark">
          <Icon name="check" size="3em" />
        </div>
        <h1>{firstName ? `¡Gracias, ${firstName}!` : '¡Pedido confirmado!'}</h1>
        <p className="done-label">Tu número de pedido</p>
        <p className="done-number">{order.number}</p>
        <p className="done-instr">
          {cash
            ? `Acércate a caja, paga ${formatMoney(order.total)} y retira tu pedido cuando llamen tu número.`
            : 'Te llamaremos por este número cuando tu pedido esté listo.'}
        </p>
        <ul className="done-lines">
          {order.lines.map(l => (
            <li key={l.key}>
              <span>
                {l.qty} × {l.item.name}
              </span>
              <span>{formatMoney(l.unitPrice * l.qty)}</span>
            </li>
          ))}
          <li className="done-total">
            <span>Total {cash ? 'a pagar' : 'pagado'}</span>
            <span>{formatMoney(order.total)}</span>
          </li>
        </ul>
        {order.billing.email && <p className="done-mail">Tu factura electrónica llegará a {order.billing.email}</p>}
        <button className="btn-primary btn-xl" onClick={onNew}>
          Nuevo pedido
        </button>
        <p className="done-reset">La pantalla se reinicia en {Math.max(left, 0)} s</p>
      </div>
    </main>
  );
}
