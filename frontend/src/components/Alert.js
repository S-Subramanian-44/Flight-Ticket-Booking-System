import React from 'react';

function Alert({ type, message, onClose }) {
    return (
        <div className={`alert alert-${type}`}>
            {message}
            <button onClick={onClose} className="alert-close-btn">&times;</button>
        </div>
    );
}

export default Alert;