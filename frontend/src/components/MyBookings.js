import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

function MyBookings({ onCancelSuccess, onError }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const [cancellingId, setCancellingId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingCancelId, setPendingCancelId] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get('/bookings/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setBookings(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError('Could not load your bookings.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [token]);

    if (loading) return <p>Loading your bookings...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const requestInlineCancel = (id) => {
        if (!token) {
            onError && onError('You must be logged in to cancel.');
            return;
        }
        setPendingCancelId(id);
        setShowConfirm(true);
    };

    const doInlineCancel = async (id) => {
        setShowConfirm(false);
        try {
            setCancellingId(id);
            await axios.delete(`/bookings/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            onCancelSuccess && onCancelSuccess();
        } catch (err) {
            console.error('Inline cancel error:', err.response || err);
            const msg = err.response?.data?.detail || 'Cancellation failed.';
            onError && onError(msg);
        } finally {
            setCancellingId(null);
            setPendingCancelId(null);
        }
    };

    return (
        <div className="my-bookings">
            {bookings.length === 0 ? (
                <p>You have no bookings.</p>
            ) : (
                bookings.map(booking => {
                    const statusClass = (booking.status || '').toLowerCase();
                    return (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-meta">
                                <div><strong>Flight:</strong> {booking.flight.flight_number} ({booking.flight.airline})</div>
                                <div><strong>Passenger:</strong> {booking.passenger_name}</div>
                                <div><strong>Passport:</strong> {booking.passport_number}</div>
                            </div>
                            <div className="booking-right">
                                <div className="booking-id">#{booking.id}</div>
                                <div className={`status-pill ${statusClass}`}>{booking.status}</div>
                                {!(statusClass.includes('cancel')) && (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => requestInlineCancel(booking.id)}
                                        disabled={cancellingId === booking.id}
                                        style={{ marginTop: '8px' }}
                                    >
                                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            <ConfirmModal
                open={showConfirm}
                title={`Cancel Booking ${pendingCancelId}`}
                onCancel={() => setShowConfirm(false)}
                onConfirm={() => doInlineCancel(pendingCancelId)}
                confirmText="Cancel"
                cancelText="Keep"
                danger={true}
            >
                <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            </ConfirmModal>
        </div>
    );
}

export default MyBookings;