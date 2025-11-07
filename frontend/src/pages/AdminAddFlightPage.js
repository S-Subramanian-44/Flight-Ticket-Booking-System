import React, { useState } from 'react';
import AdminPanel from '../components/AdminPanel';
import Alert from '../components/Alert';
import '../components/Layout.css';

function AdminAddFlightPage() {
    const [alert, setAlert] = useState(null);

    return (
        <div className="page-container">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
            
            {/* We pass 'add' to tell the component to only show the Add Flight form */}
            <AdminPanel 
                mode="add"
                onActionSuccess={(msg) => setAlert({ type: 'success', message: msg })}
                onError={(msg) => setAlert({ type: 'error', message: msg })}
            />
        </div>
    );
}

export default AdminAddFlightPage;