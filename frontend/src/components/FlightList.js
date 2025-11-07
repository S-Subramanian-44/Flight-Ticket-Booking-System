import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FlightList() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/flights/');
                setFlights(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching flights:", err);
                setError('Could not load flights. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) return <p>Loading flights...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="flight-list">
            {flights.length === 0 ? (
                <p>No flights available at the moment.</p>
            ) : (
                flights.map(flight => (
                    <div key={flight.id} className="flight-card">
                        <h3>{flight.airline} ({flight.flight_number})</h3>
                        <p><strong>From:</strong> {flight.departure} <strong>To:</strong> {flight.destination}</p>
                        <p><strong>Time:</strong> {new Date(flight.departure_time).toLocaleString()}</p>
                        <p><strong>Flight ID:</strong> {flight.id}</p>
                        <p className={flight.available_seats > 0 ? 'seats-available' : 'seats-full'}>
                            Seats Left: {flight.available_seats} / {flight.total_seats}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default FlightList;