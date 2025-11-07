import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

function CancelBooking({ onCancelSuccess, onError }) {
    const [bookingId, setBookingId] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { token } = useAuth(); // <-- Get token from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bookingId) {
            onError('Booking ID is required.');
            return;
        }
        if (!token) { // <-- Check for token
            onError('You must be logged in to cancel.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.delete(`/bookings/${bookingId}`, {
                headers: { // <-- Send token in headers
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Cancel response:', response.data);
            onCancelSuccess();
            setBookingId(''); // Clear form
        } catch (err) {
            console.error('Cancellation error:', err.response);
            // --- UPDATED ERROR HANDLING ---
            let errorMsg = 'Cancellation failed. Please check Booking ID.'; // Default
            if (err.response?.status === 401) {
                errorMsg = "Your session expired. Please log out and log in again.";
            } else if (err.response?.status === 403) {
                errorMsg = "You are not authorized to cancel this booking.";
            } else if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    // Handle Pydantic validation error
                    errorMsg = detail[0].msg || 'Validation error';
                } else {
                    // Handle standard string error
                    errorMsg = detail;
                }
            }
            onError(errorMsg); // This now *always* sends a string
            // --- END OF UPDATE ---
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* ... (form input is unchanged) ... */}
            <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Booking ID"
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Canceling...' : 'Cancel Booking'}
            </button>
        </form>
    );
}

export default CancelBooking;