import React from 'react';
import { groups } from '../lib/catalog.js';
import { CartBar, TopBar } from '../components/ui.jsx';

// Colores del logo de Tutto Freddo, uno por recuadro.
export const BRAND_COLORS = ['var(--red)', 'var(--blue)', 'var(--magenta)', 'var(--orange)', 'var(--green)'];

// Los 9 grupos: recuadro con el nombre grande en color y la foto.
export default function Menu({ cart, onCart, onCancel, onGroup }) {
  return (
    <main className="screen">
      <TopBar title="Menú" cart={cart} onCart={onCart} onCancel={onCancel} />
      <div className="screen-scroll menu">
        <div className="group-grid">
          {groups.map((g, i) => (
            <button key={g.slug} className="gtile" onClick={() => onGroup(g.slug)} style={{ '--tile': BRAND_COLORS[i % BRAND_COLORS.length] }}>
              <span className="gtile-frame">
                <span className="gtile-title">{g.title}</span>
                <img src={g.image} alt="" />
              </span>
              <span className="gtile-caption">{g.caption}</span>
            </button>
          ))}
        </div>
      </div>
      <CartBar cart={cart} onCart={onCart} />
    </main>
  );
}
