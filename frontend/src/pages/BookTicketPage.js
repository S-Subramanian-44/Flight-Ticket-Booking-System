import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FlightList from '../components/FlightList';
import BookFlight from '../components/BookFlight';
import { useToast } from '../context/ToastContext';
import '../components/Layout.css';

function BookTicketPage() {
    const { addToast } = useToast();
    const { flightId } = useParams(); // Get flightId from URL

    // We no longer need a separate Alert state
    
    // Key to force FlightList to re-render after a booking
    const [refreshKey, setRefreshKey] = useState(0); 

    const handleBookingSuccess = () => {
        addToast('success', 'Booking successful!');
        setRefreshKey(key => key + 1); // Trigger re-render of list
    };
    
    const handleBookingError = (msg) => {
        addToast('error', msg);
    };

    return (
        <div className="page-container">
            <div className="component-section">
                <h2>🎟️ Book a Ticket</h2>
                <p>
                    {flightId 
                        ? "" 
                        : "Enter a Flight ID manually. You can find one from the list below."
                    }
                </p>
                <BookFlight 
                    // --- NEW: Pass the flightId from the URL ---
                    initialFlightId={flightId}
                    onBookingSuccess={handleBookingSuccess} 
                    onError={handleBookingError} 
                />
            </div>

            <div className="component-section">
                <h2>✈️ Available Flights List</h2>
                {/* This list is just for reference. It has no book button.
                  We pass the refreshKey to update it when a booking is made.
                */}
                <FlightList 
                    key={refreshKey} 
                    showAdminControls={false}
                />
            </div>
        </div>
    );
}

export default BookTicketPage;