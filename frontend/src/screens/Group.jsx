import React, { useEffect, useRef, useState } from 'react';
import { formatMoney, groups, groupsBySlug } from '../lib/catalog.js';
import { CartBar, Icon, TopBar } from '../components/ui.jsx';
import { BRAND_COLORS } from './Menu.jsx';

// Productos de un grupo en filas grandes (foto alternando lado). Toda la
// fila es el botón; queda resaltada si el producto ya está en el pedido.
export default function Group({ slug, cart, onCart, onCancel, onBack, onItem }) {
  const group = groupsBySlug[slug];
  const color = BRAND_COLORS[groups.indexOf(group) % BRAND_COLORS.length];
  const [tab, setTab] = useState(0);
  const scroller = useRef(null);

  useEffect(() => {
    setTab(0);
  }, [slug]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [slug, tab]);

  const category = group.categories[tab] || group.categories[0];
  const qtyInCart = id => cart.filter(l => l.item.id === id).reduce((a, l) => a + l.qty, 0);

  return (
    <main className="screen" style={{ '--tile': color }}>
      <TopBar title={group.title} onBack={onBack} cart={cart} onCart={onCart} onCancel={onCancel} />
      {group.categories.length > 1 && (
        <div className="tabs" role="tablist">
          {group.categories.map((c, i) => (
            <button key={c.slug} role="tab" aria-selected={i === tab} className={'tab' + (i === tab ? ' on' : '')} onClick={() => setTab(i)}>
              {c.label}
            </button>
          ))}
        </div>
      )}
      <section className="screen-scroll plist" ref={scroller}>
        {category.items.map((item, i) => {
          const qty = qtyInCart(item.id);
          return (
            <button key={item.id} className={'prow' + (i % 2 ? ' flip' : '') + (qty ? ' in-cart' : '')} onClick={() => onItem(item)}>
              <img src={item.image} alt="" loading="lazy" />
              <span className="prow-text">
                <span className="prow-name">{item.name}</span>
                {item.description && <span className="prow-desc">{item.description}</span>}
                <span className="prow-price">{formatMoney(item.price)}</span>
                {qty > 0 && (
                  <span className="prow-qty">
                    <Icon name="check" /> {qty} en tu pedido
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </section>
      <CartBar cart={cart} onCart={onCart} />
    </main>
  );
}
