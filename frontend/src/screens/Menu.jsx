import React from 'react';
import { groups } from '../lib/catalog.js';
import { CartBar, TopBar } from '../components/ui.jsx';

// Los 9 botones del menú.
export default function Menu({ cart, onCart, onCancel, onGroup }) {
  return (
    <main className="screen">
      <TopBar title="Menú" cart={cart} onCart={onCart} onCancel={onCancel} />
      <div className="screen-scroll menu">
        <h2 className="hello">¿Qué se te antoja hoy?</h2>
        <div className="group-grid">
          {groups.map(g => (
            <button key={g.slug} className="gtile" onClick={() => onGroup(g.slug)}>
              <img src={g.image} alt="" />
              <span className="gtile-name">{g.name}</span>
              <span className="gtile-count">{g.categories.reduce((a, c) => a + c.items.length, 0)} opciones</span>
            </button>
          ))}
        </div>
      </div>
      <CartBar cart={cart} onCart={onCart} />
    </main>
  );
}
