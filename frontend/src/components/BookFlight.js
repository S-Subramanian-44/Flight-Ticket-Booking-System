import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// --- NEW: Accept initialFlightId prop ---
function BookFlight({ initialFlightId, onBookingSuccess, onError }) {
    const [passengerName, setPassengerName] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    // --- NEW: Set initial state from prop ---
    const [flightId, setFlightId] = useState(initialFlightId || '');
    const [loading, setLoading] = useState(false);
    
    const { token } = useAuth(); 

    // --- NEW: Update state if prop changes (e.g., user navigates) ---
    useEffect(() => {
        if (initialFlightId) {
            setFlightId(initialFlightId);
        }
    }, [initialFlightId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (rest of the submit logic is unchanged)
        
        if (!passengerName || !passportNumber || !flightId) {
            onError('All fields are required.');
            return;
        }
        if (!token) {
            onError('You must be logged in to book.');
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post(`/flights/${flightId}/book`, {
                passenger_name: passengerName,
                passport_number: passportNumber
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onBookingSuccess();
            // Clear form
            setPassengerName('');
            setPassportNumber('');
            // Only clear flightId if it wasn't passed in
            if (!initialFlightId) {
                setFlightId('');
            }
        } catch (err) {
            console.error('Booking error:', err.response);
            let errorMsg = 'Booking failed. Please check details.';
            if (err.response?.status === 401) {
                errorMsg = "Your session expired. Please log out and log in again.";
            } else if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMsg = detail[0].msg || 'Validation error';
                } else {
                    errorMsg = detail;
                }
            }
            onError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="book-flight-form">
            <div className="form-group">
                <label>Flight ID</label>
                <input
                    type="text"
                    value={flightId}
                    onChange={(e) => setFlightId(e.target.value)}
                    placeholder="Flight ID (e.g., 1)"
                    required
                    // --- NEW: Make it read-only if ID was passed ---
                    readOnly={!!initialFlightId} 
                />
            </div>
            <div className="form-group">
                <label>Passenger Name</label>
                <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Full Name"
                    required
                />
            </div>
            <div className="form-group">
                <label>Passport Number</label>
                <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder="e.g., P123456"
                    required
                />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
        </form>
    );
}

export default BookFlight;