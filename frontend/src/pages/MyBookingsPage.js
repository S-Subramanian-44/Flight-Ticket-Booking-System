import React, { useState } from 'react';
import MyBookings from '../components/MyBookings';
import CancelBooking from '../components/CancelBooking';
import Alert from '../components/Alert';
import '../components/Layout.css';

function MyBookingsPage() {
    const [alert, setAlert] = useState(null);
    // Key to force MyBookings to re-render after a cancellation
    const [refreshKey, setRefreshKey] = useState(0); 

    const handleCancelSuccess = () => {
        setAlert({ type: 'success', message: 'Cancellation successful!' });
        setRefreshKey(key => key + 1); // Trigger re-render
    };
    
    return (
        <div className="page-container">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <div className="component-section">
                <h2>❌ Cancel a Booking</h2>
                <CancelBooking 
                    onCancelSuccess={handleCancelSuccess}
                    onError={(msg) => setAlert({ type: 'error', message: msg })}
                />
            </div>
            
            <div className="component-section">
                <h2>My Bookings</h2>
                <MyBookings 
                    key={refreshKey} 
                    onCancelSuccess={handleCancelSuccess}
                    onError={(msg) => setAlert({ type: 'error', message: msg })}
                />
            </div>
        </div>
    );
}

export default MyBookingsPage;