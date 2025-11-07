import React, { useState } from 'react';
import FlightList from '../components/FlightList';
import AdminPanel from '../components/AdminPanel';
import Alert from '../components/Alert';
import '../components/Layout.css';

function AdminManageFlightsPage() {
    const [alert, setAlert] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 

    const handleActionSuccess = (msg) => {
        setAlert({ type: 'success', message: msg });
        setRefreshKey(key => key + 1); // Trigger re-render
    };

    return (
        <div className="page-container">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
            
            {/* Pass 'delete' to only show the Delete Flight form */}
            <AdminPanel 
                mode="delete"
                onActionSuccess={handleActionSuccess}
                onError={(msg) => setAlert({ type: 'error', message: msg })}
            />

            <div className="component-section">
                <h2>All Flights</h2>
                <FlightList key={refreshKey} />
            </div>
        </div>
    );
}

export default AdminManageFlightsPage;