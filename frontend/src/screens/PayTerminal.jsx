import React, { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../lib/catalog.js';
import { Icon } from '../components/ui.jsx';

const CODE_SECONDS = 180;
const RECENT_KEY = 'tf-deuna-recent';

// Código de pago Deuna de 6 dígitos, distinto de los últimos emitidos en este
// tótem. En producción lo entrega la API de Deuna al crear el cobro.
function newPaymentCode() {
  let recent = [];
  try {
    recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    recent = [];
  }
  let code;
  do {
    const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
    code = String(n).padStart(6, '0');
  } while (recent.includes(code));
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([code, ...recent].slice(0, 200)));
  } catch {
    // sin almacenamiento: el código sigue siendo aleatorio
  }
  return code;
}

// Cobro simulado. En el equipo real aquí se conecta el datáfono (Datafast)
// o la API de Deuna; en el demo se aprueba o rechaza con los botones de abajo.
export default function PayTerminal({ order, onApproved, onBack }) {
  const [status, setStatus] = useState('waiting'); // waiting | processing | approved | declined
  const isDeuna = order.method === 'deuna';
  const [code, setCode] = useState(() => (isDeuna ? newPaymentCode() : null));
  const [left, setLeft] = useState(CODE_SECONDS);
  const approvedRef = useRef(onApproved);
  approvedRef.current = onApproved;

  useEffect(() => {
    if (!isDeuna || status !== 'waiting') return;
    const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isDeuna, status, code]);

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

  const refreshCode = () => {
    setCode(newPaymentCode());
    setLeft(CODE_SECONDS);
    setStatus('waiting');
  };

  const expired = isDeuna && left === 0 && status === 'waiting';
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  return (
    <main className="screen terminal">
      <div className="terminal-box">
        <p className="terminal-amount">{formatMoney(order.total)}</p>

        {status === 'waiting' && !isDeuna && (
          <>
            <div className="card-anim" aria-hidden="true">
              <div className="card-chip" />
            </div>
            <h2>Acerca, inserta o desliza tu tarjeta</h2>
            <p>Sigue las instrucciones del datáfono.</p>
          </>
        )}

        {status === 'waiting' && isDeuna && (
          <>
            <h2>{expired ? 'El código venció' : 'Paga con Deuna'}</h2>
            <div className={'paycode' + (expired ? ' expired' : '')} aria-label={`Código de pago ${code.split('').join(' ')}`}>
              {code.split('').map((d, i) => (
                <span key={i} className={i === 3 ? 'gap' : ''}>
                  {d}
                </span>
              ))}
            </div>
            {expired ? (
              <button className="btn-primary btn-lg" onClick={refreshCode}>
                Generar nuevo código
              </button>
            ) : (
              <>
                <ol className="paycode-steps">
                  <li>Abre Deuna en tu celular</li>
                  <li>Digita este código</li>
                  <li>
                    Te aparecerá el monto de <strong>{formatMoney(order.total)}</strong>: toca Pagar
                  </li>
                </ol>
                <p>Esperando tu pago… el código vence en {mmss}</p>
              </>
            )}
          </>
        )}

        {status === 'processing' && (
          <>
            <div className="spinner" aria-hidden="true" />
            <h2>Procesando pago…</h2>
            <p>{isDeuna ? 'Recibiendo la confirmación de Deuna.' : 'No retires tu tarjeta.'}</p>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="ok-mark">
              <Icon name="check" size="3em" />
            </div>
            <h2>¡Pago aceptado!</h2>
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
              <button className="btn-primary btn-lg" onClick={isDeuna ? refreshCode : () => setStatus('waiting')}>
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
          <button onClick={() => setStatus('processing')}>Simular pago aceptado</button>
          <button onClick={() => setStatus('declined')}>Simular rechazo</button>
        </div>
      )}
    </main>
  );
}
