import React from 'react';
import { branch, formatMoney } from '../lib/catalog.js';
import { cartCount, cartTotal } from '../lib/cart.js';

const paths = {
  back: 'M15 18l-6-6 6-6',
  close: 'M6 6l12 12M18 6L6 18',
  bag: 'M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 016 0v2',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4z',
  trash: 'M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 12l5 5L20 7',
  card: 'M3 6h18v12H3zM3 10h18M7 15h4',
  phone: 'M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2',
  cash: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM6 10v4M18 10v4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
};

export function Icon({ name, size = '1.2em' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export function TopBar({ title, onBack, onCancel, cart, onCart }) {
  const count = cart ? cartCount(cart) : 0;
  return (
    <header className="topbar">
      {onBack ? (
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="back" /> Volver
        </button>
      ) : (
        <img className="topbar-logo" src={branch.logo} alt="Tutto Freddo" />
      )}
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions">
        {onCart && (
          <button className="btn-icon cart-icon" onClick={onCart} aria-label="Ver pedido">
            <Icon name="bag" />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
        )}
        {onCancel && (
          <button className="btn-icon" onClick={onCancel} aria-label="Cancelar pedido">
            <Icon name="close" />
          </button>
        )}
      </div>
    </header>
  );
}

export function CartBar({ cart, onCart }) {
  if (!cart.length) return null;
  return (
    <button className="cartbar" onClick={onCart}>
      <span className="cartbar-count">{cartCount(cart)}</span>
      <span>Ver mi pedido</span>
      <span className="cartbar-total">{formatMoney(cartTotal(cart))}</span>
      <Icon name="arrow" />
    </button>
  );
}

export function Stepper({ value, onChange, min = 1 }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Menos">
        <Icon name={value <= 1 && min === 0 ? 'trash' : 'minus'} />
      </button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="Más">
        <Icon name="plus" />
      </button>
    </div>
  );
}
