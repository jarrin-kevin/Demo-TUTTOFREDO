import React from 'react';
import { formatMoney, needsCustomizing } from '../lib/catalog.js';
import { Icon } from './ui.jsx';

export default function ProductCard({ item, onOpen, onQuickAdd, compact }) {
  const quick = onQuickAdd && !needsCustomizing(item);
  return (
    <article className={'pcard' + (compact ? ' compact' : '')} onClick={() => onOpen(item)}>
      <div className="pcard-img">
        <img src={item.image} alt="" loading="lazy" />
      </div>
      <div className="pcard-body">
        <h3>{item.name}</h3>
        {!compact && item.description && <p>{item.description}</p>}
        <div className="pcard-foot">
          <strong>{formatMoney(item.price)}</strong>
          <button
            className="btn-add"
            aria-label={quick ? `Agregar ${item.name}` : `Elegir opciones de ${item.name}`}
            onClick={e => {
              e.stopPropagation();
              quick ? onQuickAdd(item) : onOpen(item);
            }}
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
    </article>
  );
}
