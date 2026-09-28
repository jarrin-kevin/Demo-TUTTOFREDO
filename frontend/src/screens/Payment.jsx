import React, { useState } from 'react';
import { formatMoney } from '../lib/catalog.js';
import { cartTotal } from '../lib/cart.js';
import { CONSUMIDOR_FINAL_MAX, isValidCedula, isValidEmail, isValidRuc } from '../lib/billing.js';
import { Icon, TopBar } from '../components/ui.jsx';

const METHODS = [
  { id: 'card', icon: 'card', name: 'Tarjeta de crédito o débito', detail: 'Visa · Mastercard · Diners · American Express' },
  { id: 'qr', icon: 'phone', name: 'Deuna o transferencia', detail: 'Escanea un código QR con tu celular' },
  { id: 'cash', icon: 'cash', name: 'Efectivo en caja', detail: 'Imprime tu número y paga en caja' },
];

const ID_TYPES = [
  { id: 'cedula', label: 'Cédula' },
  { id: 'ruc', label: 'RUC' },
  { id: 'final', label: 'Consumidor final' },
];

function validate(type, f) {
  const e = {};
  if (type === 'final') return e;
  if (type === 'cedula' && !isValidCedula(f.id)) e.id = 'Cédula no válida (10 dígitos)';
  if (type === 'ruc' && !isValidRuc(f.id)) e.id = 'RUC no válido (13 dígitos, termina en 001)';
  if (!f.name.trim()) e.name = type === 'ruc' ? 'Ingresa la razón social' : 'Ingresa tus nombres';
  if (type === 'cedula' && !f.lastName.trim()) e.lastName = 'Ingresa tus apellidos';
  if (!f.address.trim()) e.address = 'Ingresa tu dirección';
  if (!isValidEmail(f.email)) e.email = 'Correo no válido';
  return e;
}

function Field({ label, error, ...props }) {
  return (
    <label className={'field' + (error ? ' has-error' : '')}>
      <span>{label}</span>
      <input {...props} />
      {error && <em>{error}</em>}
    </label>
  );
}

export default function Payment({ cart, onBack, onCancel, onPay }) {
  const total = cartTotal(cart);
  const finalAllowed = total <= CONSUMIDOR_FINAL_MAX;
  const [method, setMethod] = useState(null);
  const [type, setType] = useState('cedula');
  const [fields, setFields] = useState({ id: '', name: '', lastName: '', address: '', email: '' });
  const [tried, setTried] = useState(false);

  const errors = validate(type, fields);
  const shown = tried ? errors : {};
  const set = key => e => setFields(f => ({ ...f, [key]: key === 'id' ? e.target.value.replace(/\D/g, '') : e.target.value }));

  function submit() {
    setTried(true);
    if (Object.keys(errors).length) return;
    const billing = type === 'final' ? { type, name: 'Consumidor final', id: '9999999999999' } : { type, ...fields };
    onPay({ method, billing, total });
  }

  return (
    <main className="screen">
      <TopBar title="¿Cómo quieres pagar?" onBack={onBack} onCancel={onCancel} />
      <div className="screen-scroll pay">
        <p className="pay-total">
          Total a pagar <strong>{formatMoney(total)}</strong>
        </p>
        <div className="methods">
          {METHODS.map(m => (
            <button key={m.id} className="method" onClick={() => setMethod(m.id)}>
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

      {method && (
        <div className="overlay" onClick={() => setMethod(null)}>
          <div className="sheet billing" role="dialog" aria-label="Datos de facturación" onClick={e => e.stopPropagation()}>
            <button className="btn-icon sheet-close" onClick={() => setMethod(null)} aria-label="Cerrar">
              <Icon name="close" />
            </button>
            <div className="sheet-scroll sheet-body">
              <h2 className="sheet-title">Datos de facturación</h2>
              <p className="sri-note">Tu factura electrónica llegará a tu correo. Por disposición del SRI, las facturas a consumidor final no pueden ser anuladas.</p>
              <div className="segmented" role="radiogroup">
                {ID_TYPES.map(t => {
                  const disabled = t.id === 'final' && !finalAllowed;
                  return (
                    <button
                      key={t.id}
                      role="radio"
                      aria-checked={type === t.id}
                      className={type === t.id ? 'on' : ''}
                      disabled={disabled}
                      onClick={() => {
                        setType(t.id);
                        setTried(false);
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {!finalAllowed && <p className="hint">Consumidor final solo hasta {formatMoney(CONSUMIDOR_FINAL_MAX)}.</p>}

              {type === 'final' ? (
                <p className="final-note">Se emitirá la factura a nombre de Consumidor final, sin datos personales.</p>
              ) : (
                <div className="form-grid">
                  <Field
                    label={type === 'ruc' ? 'RUC' : 'Cédula'}
                    inputMode="numeric"
                    maxLength={type === 'ruc' ? 13 : 10}
                    value={fields.id}
                    onChange={set('id')}
                    error={shown.id}
                  />
                  <Field label={type === 'ruc' ? 'Razón social' : 'Nombres'} value={fields.name} onChange={set('name')} error={shown.name} />
                  {type === 'cedula' && <Field label="Apellidos" value={fields.lastName} onChange={set('lastName')} error={shown.lastName} />}
                  <Field label="Dirección" value={fields.address} onChange={set('address')} error={shown.address} />
                  <Field label="Correo electrónico" type="email" inputMode="email" value={fields.email} onChange={set('email')} error={shown.email} />
                </div>
              )}
            </div>
            <footer className="sheet-foot">
              <button className="btn-primary btn-lg grow" onClick={submit}>
                {method === 'cash' ? 'Confirmar pedido' : `Pagar ${formatMoney(total)}`} <Icon name="arrow" />
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
