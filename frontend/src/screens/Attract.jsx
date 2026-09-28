import React, { useEffect, useState } from 'react';
import { branch, groups } from '../lib/catalog.js';

// Pantalla de reposo: fotos del menú rotando hasta que alguien toque.
const slides = groups.map(g => ({ image: g.image, name: g.name }));

export default function Attract({ onStart }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="attract" onClick={onStart}>
      <div className="attract-slides" aria-hidden="true">
        {slides.map((s, n) => (
          <img key={s.image} src={s.image} alt="" className={n === i ? 'on' : ''} />
        ))}
      </div>
      <div className="attract-shade" />
      <div className="attract-content">
        <img className="attract-logo" src={branch.logo} alt="Tutto Freddo" />
        <p className="attract-kicker">{slides[i].name}</p>
        <h1>
          Pide aquí,
          <br />
          sin hacer fila
        </h1>
        <button className="btn-primary btn-xl attract-cta">Toca para ordenar</button>
        <p className="attract-foot">Paga con tarjeta, Deuna o en caja</p>
      </div>
    </main>
  );
}
