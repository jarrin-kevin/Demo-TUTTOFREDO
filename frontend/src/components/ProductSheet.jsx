import React, { useRef, useState } from 'react';
import { defaultSelections, formatMoney, isAutoGroup, missingRequired } from '../lib/catalog.js';
import { makeLine } from '../lib/cart.js';
import { Icon, Stepper } from './ui.jsx';

// Pantalla "Personalizar": foto, descripción, opciones y cantidad.
export default function ProductSheet({ item, line, onClose, onConfirm }) {
  const [selections, setSelections] = useState(line ? line.selections : defaultSelections(item));
  const [qty, setQty] = useState(line ? line.qty : 1);
  const [showMissing, setShowMissing] = useState(false);
  const groupRefs = useRef({});

  const draft = makeLine(item, selections, qty);
  const missing = missingRequired(item, selections);

  function toggle(gi, oi) {
    const group = item.optionGroups[gi];
    setSelections(prev => {
      const current = prev[gi] || [];
      let next;
      if (group.selectionType === 'multiple') {
        next = current.includes(oi) ? current.filter(x => x !== oi) : [...current, oi];
      } else {
        // Única: tocar otra la reemplaza; tocar la misma la quita solo si es opcional.
        next = current[0] === oi && !group.required ? [] : [oi];
      }
      return { ...prev, [gi]: next };
    });
  }

  function submit() {
    if (missing.length) {
      setShowMissing(true);
      const gi = item.optionGroups.findIndex(g => g.name === missing[0]);
      groupRefs.current[gi]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onConfirm(draft);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={item.name} onClick={e => e.stopPropagation()}>
        <button className="btn-icon sheet-close" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" />
        </button>
        <div className="sheet-scroll">
          <img className="sheet-img" src={item.image} alt="" />
          <div className="sheet-body">
            <h2 className="sheet-title">{item.name}</h2>
            {item.description && <p className="sheet-desc">{item.description}</p>}
            <p className="sheet-price">{formatMoney(item.price)}</p>

            {item.optionGroups.map((g, gi) => {
              if (isAutoGroup(g)) return null;
              const isMissing = showMissing && missing.includes(g.name);
              return (
                <section key={g.name} className={'optgroup' + (isMissing ? ' missing' : '')} ref={el => (groupRefs.current[gi] = el)}>
                  <div className="optgroup-head">
                    <h3>{g.name}</h3>
                    <span className={g.required ? 'tag tag-req' : 'tag'}>{g.required ? 'Obligatorio · elige 1' : 'Opcional'}</span>
                  </div>
                  <div className={'chips' + (g.options.length > 6 ? ' chips-dense' : '')}>
                    {g.options.map((o, oi) => {
                      const on = (selections[gi] || []).includes(oi);
                      return (
                        <button key={o.name} className={'chip' + (on ? ' on' : '')} onClick={() => toggle(gi, oi)} aria-pressed={on}>
                          {on && <Icon name="check" />}
                          <span>{o.name}</span>
                          {o.price > 0 && <small>+{formatMoney(o.price)}</small>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
        <footer className="sheet-foot">
          <Stepper value={qty} onChange={setQty} />
          <button className="btn-primary btn-lg grow" onClick={submit}>
            {missing.length && showMissing ? `Elige: ${missing[0]}` : line ? 'Guardar cambios' : 'Agregar al pedido'}
            <span className="btn-price">{formatMoney(draft.unitPrice * qty)}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
