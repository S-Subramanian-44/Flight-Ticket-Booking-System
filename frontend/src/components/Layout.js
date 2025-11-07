import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import './Layout.css'; // <-- New CSS file

function Layout() {
    return (
        <div className="layout-container">
            <NavBar />
            <main className="content-container">
                <Outlet /> {/* This is where the child pages (e.g., Dashboard, MyBookings) will render */}
            </main>
        </div>
    );
}

export default Layout;