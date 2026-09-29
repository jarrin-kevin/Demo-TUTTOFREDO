import React from 'react';
import { formatMoney } from '../lib/catalog.js';
import { Icon, TopBar } from '../components/ui.jsx';

const METHODS = [
  { id: 'card', icon: 'card', name: 'Tarjeta de crédito o débito', detail: 'Visa · Mastercard · Diners · American Express' },
  { id: 'qr', icon: 'phone', name: 'Deuna o transferencia', detail: 'Escanea un código QR con tu celular' },
  { id: 'cash', icon: 'cash', name: 'Efectivo en caja', detail: 'Paga en caja con tu número de pedido' },
];

// Método de pago: un toque y se pasa a cobrar.
export default function Payment({ total, onBack, onCancel, onPay }) {
  return (
    <main className="screen">
      <TopBar title="¿Cómo quieres pagar?" onBack={onBack} onCancel={onCancel} />
      <div className="screen-scroll pay">
        <p className="pay-total">
          Total a pagar <strong>{formatMoney(total)}</strong>
        </p>
        <div className="methods">
          {METHODS.map(m => (
            <button key={m.id} className="method" onClick={() => onPay(m.id)}>
              <span className="method-icon">
                <Icon name={m.icon} size="1.8em" />
              </span>
              <span className="method-text">
                <strong>{m.name}</strong>
                <small>{m.detail}</small>
              </span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
