import React, { useState } from 'react';
import { formatMoney } from '../lib/catalog.js';
import { CONSUMIDOR_FINAL_MAX, isValidCedula, isValidEmail, isValidRuc } from '../lib/billing.js';
import { Icon, TopBar } from '../components/ui.jsx';

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

// Datos de facturación: van siempre, antes de elegir cómo pagar.
export default function Billing({ total, initial, onBack, onCancel, onNext }) {
  const finalAllowed = total <= CONSUMIDOR_FINAL_MAX;
  const [type, setType] = useState(initial?.type || 'cedula');
  const [fields, setFields] = useState({ id: '', name: '', lastName: '', address: '', email: '', ...(initial?.type !== 'final' ? initial : {}) });
  const [tried, setTried] = useState(false);

  const errors = validate(type, fields);
  const shown = tried ? errors : {};
  const set = key => e => setFields(f => ({ ...f, [key]: key === 'id' ? e.target.value.replace(/\D/g, '') : e.target.value }));

  function submit() {
    setTried(true);
    if (Object.keys(errors).length) return;
    const { id, name, lastName, address, email } = fields;
    onNext(type === 'final' ? { type, name: 'Consumidor final', id: '9999999999999' } : { type, id, name, lastName, address, email });
  }

  return (
    <main className="screen">
      <TopBar title="Datos de facturación" onBack={onBack} onCancel={onCancel} />
      <div className="screen-scroll billing">
        <p className="sri-note">Tu factura electrónica llegará a tu correo. Por disposición del SRI, las facturas a consumidor final no pueden ser anuladas.</p>
        <div className="segmented" role="radiogroup" aria-label="Tipo de factura">
          {ID_TYPES.map(t => (
            <button
              key={t.id}
              role="radio"
              aria-checked={type === t.id}
              className={type === t.id ? 'on' : ''}
              disabled={t.id === 'final' && !finalAllowed}
              onClick={() => {
                setType(t.id);
                setTried(false);
              }}
            >
              {t.label}
            </button>
          ))}
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
      <footer className="screen-foot">
        <button className="btn-primary btn-lg grow" onClick={submit}>
          Continuar <Icon name="arrow" />
        </button>
      </footer>
    </main>
  );
}
