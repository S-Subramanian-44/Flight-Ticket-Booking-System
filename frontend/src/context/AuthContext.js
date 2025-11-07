import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Store token and admin status from localStorage
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('is_admin') === 'true');

    const login = (newToken, newIsAdmin) => {
        // Save to local storage
        localStorage.setItem('token', newToken);
        localStorage.setItem('is_admin', newIsAdmin);
        // Save to state
        setToken(newToken);
        setIsAdmin(newIsAdmin);
    };

    const logout = () => {
        // Remove from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('is_admin');
        // Remove from state
        setToken(null);
        setIsAdmin(false);
    };

    // Pass new values to the provider
    return (
        <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};