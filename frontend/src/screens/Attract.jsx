import React from 'react';

const base = import.meta.env.BASE_URL;

// Pantalla de reposo: el video de invitación en bucle hasta que alguien toque.
export default function Attract({ onStart }) {
  return (
    <main className="attract" onClick={onStart}>
      <video
        className="attract-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={`${base}video/invitacion-poster.webp`}
        aria-hidden="true"
      >
        <source src={`${base}video/invitacion.webm`} type="video/webm" />
        <source src={`${base}video/invitacion.mp4`} type="video/mp4" />
      </video>
      <div className="attract-shade" />
      <div className="attract-content">
        <button className="btn-primary btn-xl attract-cta">Toca para ordenar</button>
      </div>
    </main>
  );
}
