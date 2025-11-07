import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

function BookFlight({ onBookingSuccess, onError }) {
    const [passengerName, setPassengerName] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [flightId, setFlightId] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { token } = useAuth(); // <-- Get token from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passengerName || !passportNumber || !flightId) {
            onError('All fields are required.');
            return;
        }
        if (!token) { // <-- Check for token
            onError('You must be logged in to book.');
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post(`/flights/${flightId}/book`, {
                passenger_name: passengerName,
                passport_number: passportNumber
            }, {
                headers: { // <-- Send token in headers
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Booking response:', response.data);
            onBookingSuccess();
            // Clear form
            setPassengerName('');
            setPassportNumber('');
            setFlightId('');
        } catch (err) {
            console.error('Booking error:', err.response);
            
            // --- UPDATED ERROR HANDLING ---
            let errorMsg = 'Booking failed. Please check details.'; // Default
            if (err.response?.status === 401) {
                errorMsg = "Your session expired. Please log out and log in again.";
            } else if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    // Handle Pydantic validation error (like "password too short")
                    errorMsg = detail[0].msg || 'Validation error'; 
                } else {
                    // Handle standard string error (like "No available seats")
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
            {/* ... (form inputs are unchanged) ... */}
            <input
                type="text"
                value={flightId}
                onChange={(e) => setFlightId(e.target.value)}
                placeholder="Flight ID"
                required
            />
            <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Passenger Name"
                required
            />
            <input
                type="text"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                placeholder="Passport Number"
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Booking...' : 'Book Flight'}
            </button>
        </form>
    );
}

export default BookFlight;