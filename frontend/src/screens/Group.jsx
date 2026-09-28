import React, { useEffect, useRef, useState } from 'react';
import { groups, groupsBySlug } from '../lib/catalog.js';
import { CartBar, Icon, TopBar } from '../components/ui.jsx';
import ProductCard from '../components/ProductCard.jsx';

// Productos de un grupo: barra lateral con los 9 grupos y pestañas si el
// grupo junta varias categorías (Helado artesanal / Helado soft, etc.).
export default function Group({ slug, cart, onCart, onCancel, onBack, onGroup, onItem, onQuickAdd }) {
  const group = groupsBySlug[slug];
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState(null);
  const scroller = useRef(null);

  useEffect(() => {
    setTab(0);
  }, [slug]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [slug, tab]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const category = group.categories[tab] || group.categories[0];

  const quickAdd = item => {
    onQuickAdd(item);
    setToast(`${item.name} agregado`);
  };

  return (
    <main className="screen">
      <TopBar title={group.name} onBack={onBack} cart={cart} onCart={onCart} onCancel={onCancel} />
      <div className="group-layout">
        <nav className="rail" aria-label="Categorías">
          {groups.map(g => (
            <button key={g.slug} className={'rail-item' + (g.slug === slug ? ' on' : '')} onClick={() => onGroup(g.slug)}>
              <img src={g.image} alt="" />
              <span>{g.name}</span>
            </button>
          ))}
        </nav>
        <section className="group-main" ref={scroller}>
          <div className="group-banner" style={{ backgroundImage: `url(${group.cover})` }} />
          {group.categories.length > 1 && (
            <div className="tabs" role="tablist">
              {group.categories.map((c, i) => (
                <button key={c.slug} role="tab" aria-selected={i === tab} className={'tab' + (i === tab ? ' on' : '')} onClick={() => setTab(i)}>
                  {c.label}
                  <small>{c.items.length}</small>
                </button>
              ))}
            </div>
          )}
          <div className="product-grid">
            {category.items.map(item => (
              <ProductCard key={item.id} item={item} onOpen={onItem} onQuickAdd={quickAdd} />
            ))}
          </div>
        </section>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" /> {toast}
        </div>
      )}
      <CartBar cart={cart} onCart={onCart} />
    </main>
  );
}
