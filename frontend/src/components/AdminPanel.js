import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css'; // Re-use main styles for forms

// This component now conditionally renders based on the 'mode' prop
function AdminPanel({ mode, onActionSuccess, onError }) {
    const { token } = useAuth();
    
    // States for Add Flight form
    const [flightNumber, setFlightNumber] = useState('');
    const [airline, setAirline] = useState('');
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState(''); // <-- NEW
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
                arrival_time: new Date(arrivalTime).toISOString(), // <-- NEW
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
            setArrivalTime(''); // <-- NEW
            setTotalSeats(100);
        } catch (err) {
            console.error('Add flight error:', err.response);
            let errorMsg = 'Failed to add flight.';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                errorMsg = Array.isArray(detail) ? detail[0].msg : detail;
            }
            onError(errorMsg);
        }
    };

    // --- Handle Delete Flight ---
    const handleDeleteFlight = async (e) => {
        // ... (this function is unchanged)
        e.preventDefault();
        if (!deleteFlightId) {
            onError('Flight ID is required to delete.');
            return;
        }
        try {
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
            {/* --- Conditionally render Add Flight Form --- */}
            {mode === 'add' && (
                <form onSubmit={handleAddFlight} className="admin-form">
                    <h2>Add a New Flight</h2>
                    {/* Use explicit layout classes to avoid fragile nth-of-type selectors */}
                    <label>Flight Number:</label>
                    <input className="full" type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="Flight Number" required />
                    
                    <label>Flight Name:</label>
                    <input className="full" type="text" value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Airline" required />
                    
                    <label>Departure:</label>
                    <input className="full" type="text" value={departure} onChange={(e) => setDeparture(e.target.value)} placeholder="Departure (e.g., LHR)" required />
                    
                    <label>Destination:</label>
                    <input className="full" type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (e.g., JFK)" required />
                    
                    <label>Departure Time:</label>
                    <input className="full" type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
                    
                    <label>Arrival Time:</label>
                    <input className="full" type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required />
                    
                    <label>Total Seats:</label>
                    <input className="full" type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} placeholder="Total Seats" required />
                    
                    <button type="submit" className="btn btn-primary">Add Flight</button>
                </form>
            )}

            {/* --- Conditionally render Delete Flight Form --- */}
            {mode === 'delete' && (
                <form onSubmit={handleDeleteFlight} className="admin-form">
                    <h2>Delete a Flight</h2>
                    <input type="text" value={deleteFlightId} onChange={(e) => setDeleteFlightId(e.target.value)} placeholder="Flight ID to Delete" required />
                    <button type="submit" className="btn btn-danger">Delete Flight</button>
                </form>
            )}
        </div>
    );
}

export default AdminPanel;