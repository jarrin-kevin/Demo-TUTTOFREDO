import React, { useEffect, useReducer, useRef, useState } from 'react';
import { cartReducer, makeLine } from './lib/cart.js';
import { defaultSelections } from './lib/catalog.js';
import Attract from './screens/Attract.jsx';
import Menu from './screens/Menu.jsx';
import Group from './screens/Group.jsx';
import Cart from './screens/Cart.jsx';
import Payment from './screens/Payment.jsx';
import PayTerminal from './screens/PayTerminal.jsx';
import Done from './screens/Done.jsx';
import ProductSheet from './components/ProductSheet.jsx';
import Dialog from './components/Dialog.jsx';

const IDLE_MS = 75_000; // sin tocar la pantalla → "¿Sigues ahí?"
const IDLE_GRACE_S = 15; // segundos para responder antes de reiniciar

function nextOrderNumber() {
  let n = 0;
  try {
    n = Number(localStorage.getItem('tf-order-seq') || 0);
    localStorage.setItem('tf-order-seq', String((n + 1) % 1000));
  } catch {
    n = Math.floor(Math.random() * 999);
  }
  return String(n + 1).padStart(3, '0');
}

export default function App() {
  const [screen, setScreen] = useState('attract');
  const [groupSlug, setGroupSlug] = useState(null);
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [sheet, setSheet] = useState(null); // { item, line? }
  const [order, setOrder] = useState(null); // { method, billing, number, lines, total }
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [idleLeft, setIdleLeft] = useState(null);
  const lastTouch = useRef(Date.now());

  function reset() {
    dispatch({ type: 'clear' });
    setSheet(null);
    setOrder(null);
    setGroupSlug(null);
    setConfirmCancel(false);
    setIdleLeft(null);
    setScreen('attract');
  }

  // Temporizador de inactividad: el tótem vuelve solo a la pantalla de inicio.
  useEffect(() => {
    const touch = () => {
      lastTouch.current = Date.now();
    };
    window.addEventListener('pointerdown', touch);
    window.addEventListener('keydown', touch);
    const timer = setInterval(() => {
      if (['attract', 'done', 'pay'].includes(screen)) return;
      const idle = Date.now() - lastTouch.current;
      if (idle < IDLE_MS) return setIdleLeft(null);
      const left = IDLE_GRACE_S - Math.floor((idle - IDLE_MS) / 1000);
      if (left <= 0) reset();
      else setIdleLeft(left);
    }, 500);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
    };
  }, [screen]);

  const openGroup = slug => {
    setGroupSlug(slug);
    setScreen('group');
  };

  const openItem = (item, line) => setSheet({ item, line });

  const quickAdd = item => dispatch({ type: 'add', line: makeLine(item, defaultSelections(item), 1) });

  const confirmSheet = line => {
    if (sheet.line) dispatch({ type: 'replace', key: sheet.line.key, line });
    else dispatch({ type: 'add', line });
    setSheet(null);
  };

  const askCancel = () => (cart.length ? setConfirmCancel(true) : reset());

  const startPayment = ({ method, billing, total }) => {
    setOrder({ method, billing, total, lines: cart, number: null });
    if (method === 'cash') finishOrder({ method, billing, total, lines: cart });
    else setScreen('pay');
  };

  const finishOrder = base => {
    const done = { ...(base || order), number: nextOrderNumber(), at: new Date().toISOString() };
    // Aquí se enviaría el pedido a cocina / POS. En el demo queda en consola.
    console.info('Pedido confirmado', done);
    setOrder(done);
    dispatch({ type: 'clear' });
    setScreen('done');
  };

  const common = { cart, onCart: () => setScreen('cart'), onCancel: askCancel };

  return (
    <div className="kiosk">
      {screen === 'attract' && <Attract onStart={() => setScreen('menu')} />}
      {screen === 'menu' && <Menu {...common} onGroup={openGroup} />}
      {screen === 'group' && (
        <Group
          {...common}
          slug={groupSlug}
          onGroup={setGroupSlug}
          onBack={() => setScreen('menu')}
          onItem={openItem}
          onQuickAdd={quickAdd}
        />
      )}
      {screen === 'cart' && (
        <Cart
          cart={cart}
          dispatch={dispatch}
          onItem={openItem}
          onBack={() => setScreen(groupSlug ? 'group' : 'menu')}
          onCancel={askCancel}
          onPay={() => setScreen('payment')}
        />
      )}
      {screen === 'payment' && (
        <Payment cart={cart} onBack={() => setScreen('cart')} onCancel={askCancel} onPay={startPayment} />
      )}
      {screen === 'pay' && order && (
        <PayTerminal order={order} onApproved={() => finishOrder()} onBack={() => setScreen('payment')} />
      )}
      {screen === 'done' && order && <Done order={order} onNew={reset} />}

      {sheet && (
        <ProductSheet
          key={sheet.item.id + (sheet.line?.key || '')}
          item={sheet.item}
          line={sheet.line}
          onClose={() => setSheet(null)}
          onConfirm={confirmSheet}
        />
      )}

      {confirmCancel && (
        <Dialog
          title="¿Cancelar tu pedido?"
          text="Se borrarán los productos que agregaste."
          confirm="Sí, cancelar"
          cancel="Seguir pidiendo"
          onConfirm={reset}
          onCancel={() => setConfirmCancel(false)}
        />
      )}

      {idleLeft !== null && (
        <Dialog
          title="¿Sigues ahí?"
          text={`Tu pedido se cancelará en ${idleLeft} segundos.`}
          confirm="Sí, continuar"
          onConfirm={() => {
            lastTouch.current = Date.now();
            setIdleLeft(null);
          }}
        />
      )}
    </div>
  );
}
