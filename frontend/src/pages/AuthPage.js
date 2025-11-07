import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css'; // Make sure this is imported

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminSecret, setAdminSecret] = useState('');
    const [error, setError] = useState('');
    
    // --- NEW: State for password visibility ---
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // --- NEW: Function to clear fields on toggle ---
    const handleToggleForm = () => {
        setIsLogin(!isLogin);
        // Clear all fields and errors
        setEmail('');
        setPassword('');
        setAdminSecret('');
        setError('');
        setShowPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            // --- Handle Login ---
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            try {
                const response = await axios.post('/users/login', params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });
                login(response.data.access_token, response.data.is_admin);
                navigate('/');
            } catch (err) {
                const errorMsg = err.response?.data?.detail || 'Login failed. Please check credentials.';
                setError(errorMsg);
            }
        } else {
            // --- Handle Register ---
            try {
                const payload = { email, password };
                if (adminSecret) {
                    payload.admin_secret = adminSecret;
                }
                await axios.post('/users/register', payload);
                // On success, flip to login and show success message
                handleToggleForm();
                setError('Registration successful! Please log in.');
            } catch (err) {
                // --- Updated error handling ---
                console.error('Registration error:', err.response);
                let errorMsg = 'Registration failed.';
                if (err.response?.data?.detail) {
                    const detail = err.response.data.detail;
                    errorMsg = Array.isArray(detail) ? detail[0].msg : detail;
                }
                setError(errorMsg);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                {error && <p className={error.includes('successful') ? 'auth-success' : 'auth-error'}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    
                    {/* --- NEW: Password wrapper for icon --- */}
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <span 
                            className="password-toggle-icon" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {/* --- THIS IS THE CHANGE --- */}
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                    
                    {!isLogin && (
                        <input
                            type="password"
                            value={adminSecret}
                            onChange={(e) => setAdminSecret(e.target.value)}
                            placeholder="Admin Secret (optional)"
                        />
                    )}
                    <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                </form>
                
                {/* --- UPDATED: Use the new toggle function --- */}
                <button className="toggle-btn" onClick={handleToggleForm}>
                    {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;