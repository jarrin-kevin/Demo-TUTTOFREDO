import React from 'react';
import { formatMoney, groupItems, groupOfItem, taxBreakdown, upsell } from '../lib/catalog.js';
import { cartTotal } from '../lib/cart.js';
import { Icon, Stepper, TopBar } from '../components/ui.jsx';
import ProductCard from '../components/ProductCard.jsx';

// Si no pidió bebida se sugieren bebidas; si ya tiene, un postre.
const SUGGESTIONS = [
  { group: upsell.group, title: upsell.title },
  { group: 'postres-y-tortas', title: '¿Y algo dulce?', filter: item => item.price < 10 },
];

function pickSuggestion(cart) {
  const inCart = new Set(cart.map(l => groupOfItem[l.item.id]));
  const s = SUGGESTIONS.find(s => !inCart.has(s.group));
  if (!s) return null;
  const items = groupItems(s.group).filter(s.filter || (() => true)).slice(0, 8);
  return { ...s, items };
}

export default function Cart({ cart, dispatch, onItem, onBack, onCancel, onPay }) {
  const total = cartTotal(cart);
  const { base, tax, rate } = taxBreakdown(total);
  const suggestion = pickSuggestion(cart);

  return (
    <main className="screen">
      <TopBar title="Tu pedido" onBack={onBack} onCancel={onCancel} />
      <div className="cart-layout">
        <div className="screen-scroll cart">
          {cart.length === 0 ? (
            <div className="empty">
              <Icon name="bag" size="3em" />
              <p>Tu pedido está vacío</p>
              <button className="btn-primary" onClick={onBack}>
                Ver el menú
              </button>
            </div>
          ) : (
            <ul className="lines">
              {cart.map(l => (
                <li key={l.key} className="line">
                  <img src={l.item.image} alt="" />
                  <div className="line-info">
                    <h3>{l.item.name}</h3>
                    {l.options.length > 0 && (
                      <p className="line-opts">
                        {l.options.map(o => o.name + (o.price ? ` (+${formatMoney(o.price)})` : '')).join(' · ')}
                      </p>
                    )}
                    <p className="line-unit">{formatMoney(l.unitPrice)} c/u</p>
                  </div>
                  <div className="line-actions">
                    <strong>{formatMoney(l.unitPrice * l.qty)}</strong>
                    <Stepper value={l.qty} min={0} onChange={q => dispatch({ type: 'qty', key: l.key, delta: q - l.qty })} />
                    {l.item.optionGroups.length > 0 && (
                      <button className="btn-link" onClick={() => onItem(l.item, l)}>
                        <Icon name="edit" /> Editar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {suggestion && cart.length > 0 && (
            <section className="upsell">
              <h2>{suggestion.title}</h2>
              <div className="upsell-row">
                {suggestion.items.map(item => (
                  <ProductCard key={item.id} item={item} compact onOpen={onItem} />
                ))}
              </div>
            </section>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="summary">
            <dl>
              <div>
                <dt>Subtotal sin IVA</dt>
                <dd>{formatMoney(base)}</dd>
              </div>
              <div>
                <dt>IVA {Math.round(rate * 100)}%</dt>
                <dd>{formatMoney(tax)}</dd>
              </div>
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{formatMoney(total)}</dd>
              </div>
            </dl>
            <div className="summary-actions">
              <button className="btn-secondary btn-lg" onClick={onBack}>
                Seguir pidiendo
              </button>
              <button className="btn-primary btn-lg grow" onClick={onPay}>
                Ir a pagar <Icon name="arrow" />
              </button>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
