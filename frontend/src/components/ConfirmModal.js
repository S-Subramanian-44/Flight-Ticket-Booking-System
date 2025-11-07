import React from 'react';
import '../components/Modal.css';

function ConfirmModal({ open, title, children, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 id="confirm-modal-title" className="modal-title">{title}</h3>
                    <button className="modal-close-btn" onClick={onCancel} aria-label="Close">×</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
                    <button className={"btn " + (danger ? 'btn-danger' : 'btn-primary')} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
