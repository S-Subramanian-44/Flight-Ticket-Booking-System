import React, { useState } from 'react';
import axios from 'axios';
import FlightList from '../components/FlightList';
import Modal from '../components/Modal'; // <-- Import Modal
import { useToast } from '../context/ToastContext'; // <-- Import Toast
import { useAuth } from '../context/AuthContext';
import '../components/Layout.css';

function AdminManageFlightsPage() {
    const { addToast } = useToast();
    const { token } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0); 

    // --- NEW: State for the confirmation modal ---
    const [modalState, setModalState] = useState({
        show: false,
        flightId: null,
        flightNumber: ''
    });

    // --- NEW: Show confirmation modal ---
    const handleDeleteClick = (flightId, flightNumber) => {
        setModalState({ show: true, flightId, flightNumber });
    };

    // --- NEW: Close modal ---
    const handleCloseModal = () => {
        setModalState({ show: false, flightId: null, flightNumber: '' });
    };

    // --- NEW: Handle confirmed deletion ---
    const handleConfirmDelete = async () => {
        const { flightId } = modalState;
        if (!flightId) return;

        try {
            await axios.delete(`/flights/${flightId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            addToast('success', `Flight ${flightId} deleted successfully.`);
            setRefreshKey(key => key + 1); // Trigger re-render of FlightList
        } catch (err) {
            console.error('Delete flight error:', err.response);
            const errorMsg = err.response?.data?.detail || 'Failed to delete flight.';
            addToast('error', errorMsg);
        } finally {
            handleCloseModal(); // Close modal on success or error
        }
    };

    return (
        <div className="page-container">
            {/* --- NEW: Modal Component --- */}
            <Modal
                show={modalState.show}
                title="Delete Flight"
                confirmText="Delete"
                onCancel={handleCloseModal}
                onConfirm={handleConfirmDelete}
            >
                <p>Are you sure you want to delete flight <strong>{modalState.flightNumber}</strong> (ID: {modalState.flightId})?</p>
                <p>This action is permanent and will delete all associated bookings.</p>
            </Modal>
            
            {/* We no longer need the AdminPanel component here.
              The delete logic is now part of the FlightList.
            */}
            
            <div className="component-section">
                <h2>Manage All Flights</h2>
                <p>Click "Delete Flight" on any card to remove it from the system.</p>
                <FlightList 
                    key={refreshKey}
                    showAdminControls={true} // <-- Show admin buttons
                    onAdminDelete={handleDeleteClick} // <-- Pass delete handler
                />
            </div>
        </div>
    );
}

export default AdminManageFlightsPage;