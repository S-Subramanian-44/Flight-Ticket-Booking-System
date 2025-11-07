import React from 'react';

function Alert({ type, message, onClose }) {
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    return (
        <div className={`alert alert-${type}`} role="alert">
            <div className="alert-icon" aria-hidden>{icon}</div>
            <div className="alert-message">{message}</div>
            <button onClick={onClose} className="alert-close-btn" aria-label="Close">&times;</button>
        </div>
    );
}

export default Alert;