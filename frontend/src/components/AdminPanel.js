import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// This component will be shown on the main dashboard if the user is an admin
function AdminPanel({ onActionSuccess, onError }) {
    const { token } = useAuth();
    
    // States for Add Flight form
    const [flightNumber, setFlightNumber] = useState('');
    const [airline, setAirline] = useState('');
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [totalSeats, setTotalSeats] = useState(100);

    // State for Delete Flight form
    const [deleteFlightId, setDeleteFlightId] = useState('');

    // --- Handle Add Flight ---
    const handleAddFlight = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                flight_number: flightNumber,
                airline,
                departure,
                destination,
                departure_time: new Date(departureTime).toISOString(),
                total_seats: parseInt(totalSeats, 10)
            };
            await axios.post('/flights/', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onActionSuccess('Flight added successfully!');
            // Clear form
            setFlightNumber('');
            setAirline('');
            setDeparture('');
            setDestination('');
            setDepartureTime('');
            setTotalSeats(100);
        } catch (err) {
            console.error('Add flight error:', err.response);
            const errorMsg = err.response?.data?.detail[0]?.msg || 'Failed to add flight.';
            onError(errorMsg);
        }
    };

    // --- Handle Delete Flight ---
    const handleDeleteFlight = async (e) => {
        e.preventDefault();
        if (!deleteFlightId) {
            onError('Flight ID is required to delete.');
            return;
        }
        try {
            // Confirm before deleting
            if (!window.confirm(`Are you sure you want to delete flight ${deleteFlightId}? This will cancel all its bookings.`)) {
                return;
            }
            
            await axios.delete(`/flights/${deleteFlightId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onActionSuccess(`Flight ${deleteFlightId} deleted successfully.`);
            setDeleteFlightId('');
        } catch (err) {
            console.error('Delete flight error:', err.response);
            const errorMsg = err.response?.data?.detail || 'Failed to delete flight.';
            onError(errorMsg);
        }
    };

    return (
        <div className="admin-panel">
            <h2>Admin Controls</h2>
            
            {/* --- Add Flight Form --- */}
            <form onSubmit={handleAddFlight} className="admin-form">
                <h3>Add a New Flight</h3>
                <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="Flight Number" required />
                <input type="text" value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Airline" required />
                <input type="text" value={departure} onChange={(e) => setDeparture(e.target.value)} placeholder="Departure (e.g., LHR)" required />
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (e.g., JFK)" required />
                <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
                <input type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} placeholder="Total Seats" required />
                <button type="submit">Add Flight</button>
            </form>

            {/* --- Delete Flight Form --- */}
            <form onSubmit={handleDeleteFlight} className="admin-form">
                <h3>Delete a Flight</h3>
                <input type="text" value={deleteFlightId} onChange={(e) => setDeleteFlightId(e.target.value)} placeholder="Flight ID to Delete" required />
                <button type="submit" className="delete-btn">Delete Flight</button>
            </form>
        </div>
    );
}

export default AdminPanel;