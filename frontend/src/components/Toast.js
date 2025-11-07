import React, { useEffect, useState } from 'react';
import './Toast.css';

function Toast({ type, message, onClose }) {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // This handles the case where the component is unmounted by the provider
        // before the fade-out animation can complete.
        return () => {
            // Cleanup logic if needed
        };
    }, []);

    const handleClose = () => {
        setIsFadingOut(true);
        // Wait for animation to finish before calling parent's onClose
        setTimeout(onClose, 300);
    };

    const icon = type === 'success' ? '✓' : '!';

    return (
        <div className={`toast toast-${type} ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
            <span className="toast-icon">{icon}</span>
            <p className="toast-message">{message}</p>
            <button className="toast-close-btn" onClick={handleClose}>
                &times;
            </button>
        </div>
    );
}

export default Toast;