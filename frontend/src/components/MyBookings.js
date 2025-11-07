import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

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

    return (
        <div className="booking-list">
            {bookings.length === 0 ? (
                <p>You have no bookings.</p>
            ) : (
                bookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                        <h4>Booking ID: {booking.id}</h4>
                        <p><strong>Flight:</strong> {booking.flight.flight_number} ({booking.flight.airline})</p>
                        <p><strong>Passenger:</strong> {booking.passenger_name}</p>
                        <p><strong>Passport:</strong> {booking.passport_number}</p>
                        <p><strong>Status:</strong> <span className={booking.status === 'Booked' ? 'status-booked' : 'status-canceled'}>{booking.status}</span></p>
                    </div>
                ))
            )}
        </div>
    );
}

export default MyBookings;