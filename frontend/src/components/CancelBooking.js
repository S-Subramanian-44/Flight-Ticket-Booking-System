import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth
import ConfirmModal from './ConfirmModal';

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
        // show confirm modal
        setPendingId(bookingId);
        setShowConfirm(true);
    };

    const doCancel = async (id) => {
        setShowConfirm(false);
        setLoading(true);
        try {
            const response = await axios.delete(`/bookings/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
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

    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingId, setPendingId] = useState(null);

    return (
        <>
        <form onSubmit={handleSubmit} className="cancel-booking-form">
            <input
                type="text"
                className="form-control"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Booking ID"
                required
            />
            <button type="submit" disabled={loading} className="btn btn-danger cancel-booking-btn">
                {loading ? 'Canceling...' : 'Cancel Booking'}
            </button>
        </form>
        <ConfirmModal
            open={showConfirm}
            title={`Cancel Booking ${pendingId}`}
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => doCancel(pendingId)}
            confirmText="Cancel"
            cancelText="Keep"
            danger={true}
        >
            <p>Are you sure you want to cancel booking <strong>{pendingId}</strong>? This action cannot be undone.</p>
        </ConfirmModal>
        </>
    );
}

export default CancelBooking;