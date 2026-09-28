import React from 'react';

export default function Dialog({ title, text, confirm, cancel, onConfirm, onCancel }) {
  return (
    <div className="overlay center">
      <div className="dialog" role="alertdialog" aria-label={title}>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="dialog-actions">
          {cancel && (
            <button className="btn-secondary" onClick={onCancel}>
              {cancel}
            </button>
          )}
          <button className="btn-primary" onClick={onConfirm}>
            {confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
