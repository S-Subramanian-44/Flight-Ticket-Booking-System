import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminSecret, setAdminSecret] = useState(''); // <-- New state for admin secret
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();

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
                // --- Save token AND admin status ---
                login(response.data.access_token, response.data.is_admin);
                navigate('/');
            } catch (err) {
                // ... (error handling) ...
                const errorMsg = err.response?.data?.detail || 'Login failed. Please check credentials.';
                setError(errorMsg);
            }
        } else {
            // --- Handle Register ---
            try {
                // --- Send admin_secret if it exists ---
                const payload = { email, password };
                if (adminSecret) {
                    payload.admin_secret = adminSecret;
                }

                await axios.post('/users/register', payload);
                setIsLogin(true);
                setError('Registration successful! Please log in.');
                // Clear secret field after use
                setAdminSecret('');
            } catch (err) {
                // ... (updated error handling) ...
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
                {error && <p className="auth-error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    {/* --- NEW: Show admin secret field only on register --- */}
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
                <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;