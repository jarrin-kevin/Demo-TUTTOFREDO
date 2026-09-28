import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { formatMoney } from '../lib/catalog.js';
import { Icon } from '../components/ui.jsx';

const QR_SECONDS = 180;

// Cobro simulado. En el equipo real aquí se conecta el datáfono (Datafast)
// o la API de Deuna; en el demo se aprueba o rechaza con los botones de abajo.
export default function PayTerminal({ order, onApproved, onBack }) {
  const [status, setStatus] = useState('waiting'); // waiting | processing | approved | declined
  const [qr, setQr] = useState(null);
  const [left, setLeft] = useState(QR_SECONDS);
  const isQr = order.method === 'qr';
  const approvedRef = useRef(onApproved);
  approvedRef.current = onApproved;

  useEffect(() => {
    if (!isQr) return;
    const payload = `DEUNA-DEMO|TUTTOFREDDO|${order.total.toFixed(2)}|${Date.now()}`;
    QRCode.toDataURL(payload, { margin: 1, width: 560, color: { dark: '#2b1b12', light: '#ffffff' } }).then(setQr);
  }, [isQr, order.total]);

  useEffect(() => {
    if (!isQr || status !== 'waiting') return;
    const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isQr, status]);

  useEffect(() => {
    if (status === 'processing') {
      const t = setTimeout(() => setStatus('approved'), 1800);
      return () => clearTimeout(t);
    }
    if (status === 'approved') {
      const t = setTimeout(() => approvedRef.current(), 1400);
      return () => clearTimeout(t);
    }
  }, [status]);

  const expired = isQr && left === 0 && status === 'waiting';
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  return (
    <main className="screen terminal">
      <div className="terminal-box">
        <p className="terminal-amount">{formatMoney(order.total)}</p>

        {status === 'waiting' && !isQr && (
          <>
            <div className="card-anim" aria-hidden="true">
              <div className="card-chip" />
            </div>
            <h2>Acerca, inserta o desliza tu tarjeta</h2>
            <p>Sigue las instrucciones del datáfono.</p>
          </>
        )}

        {status === 'waiting' && isQr && (
          <>
            <div className={'qr' + (expired ? ' expired' : '')}>{qr && <img src={qr} alt="Código QR de pago" />}</div>
            <h2>{expired ? 'El código expiró' : 'Escanea con Deuna o tu app bancaria'}</h2>
            <p>{expired ? 'Vuelve atrás para generar uno nuevo.' : `Esperando confirmación… el código vence en ${mmss}`}</p>
          </>
        )}

        {status === 'processing' && (
          <>
            <div className="spinner" aria-hidden="true" />
            <h2>Procesando pago…</h2>
            <p>No retires tu tarjeta.</p>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="ok-mark">
              <Icon name="check" size="3em" />
            </div>
            <h2>¡Pago aprobado!</h2>
          </>
        )}

        {status === 'declined' && (
          <>
            <div className="ok-mark bad">
              <Icon name="close" size="3em" />
            </div>
            <h2>Pago rechazado</h2>
            <p>Intenta de nuevo o elige otro método de pago.</p>
            <div className="terminal-actions">
              <button className="btn-secondary btn-lg" onClick={onBack}>
                Otro método
              </button>
              <button className="btn-primary btn-lg" onClick={() => setStatus('waiting')}>
                Reintentar
              </button>
            </div>
          </>
        )}

        {status === 'waiting' && (
          <button className="btn-link terminal-back" onClick={onBack}>
            <Icon name="back" /> Cambiar método de pago
          </button>
        )}
      </div>

      {status === 'waiting' && !expired && (
        <div className="demo-bar">
          <span>MODO DEMO</span>
          <button onClick={() => setStatus('processing')}>Simular pago aprobado</button>
          <button onClick={() => setStatus('declined')}>Simular rechazo</button>
        </div>
      )}
    </main>
  );
}
