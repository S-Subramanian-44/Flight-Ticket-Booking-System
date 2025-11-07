import React from 'react';
import './Modal.css';

function Modal({ title, children, confirmText, cancelText, onConfirm, onCancel, show }) {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close-btn" onClick={onCancel}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>
                        {cancelText || 'Cancel'}
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;