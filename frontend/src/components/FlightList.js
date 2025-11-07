import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FlightList.css'; // <-- New CSS file

// We now accept props to control its behavior
function FlightList({ onBookClick, showAdminControls, onAdminDelete }) {
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
    if (error) return <p className="error-text">{error}</p>;

    return (
        <div className="flight-list">
            {flights.length === 0 ? (
                <p>No flights available at the moment.</p>
            ) : (
                flights.map(flight => (
                    <div key={flight.id} className="flight-card">
                        <div className="card-header">
                            <h3>{flight.airline} <span className="flight-number">({flight.flight_number})</span></h3>
                            <span className={flight.available_seats > 0 ? 'seats-available' : 'seats-full'}>
                                {flight.available_seats > 0 ? `${flight.available_seats} Seats Left` : 'Full'}
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="route">
                                <span className="route-code">{flight.departure}</span>
                                <span className="route-arrow">→</span>
                                <span className="route-code">{flight.destination}</span>
                            </div>
                            <div className="time">
                                <p><strong>Departs:</strong> {new Date(flight.departure_time).toLocaleString()}</p>
                                <p><strong>Arrives:</strong> {new Date(flight.arrival_time).toLocaleString()}</p>
                            </div>
                            <p className="flight-id-label">Flight ID: {flight.id}</p>
                        </div>
                        <div className="card-footer">
                            {/* --- NEW: Conditional Button Rendering --- */}
                            
                            {/* Show "Book Now" button if onBookClick is provided */}
                            {onBookClick && (
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => onBookClick(flight.id)}
                                    disabled={flight.available_seats <= 0}
                                >
                                    Book Now
                                </button>
                            )}
                            
                            {/* Show "Delete" button if admin controls are enabled */}
                            {showAdminControls && onAdminDelete && (
                                <button 
                                    className="btn btn-danger"
                                    onClick={() => onAdminDelete(flight.id, flight.flight_number)}
                                >
                                    Delete Flight
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default FlightList;