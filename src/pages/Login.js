import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthService } from '../utils/AuthService';
import { loginStart, loginSuccess, loginFailure, selectAuthLoading, selectAuthError, selectIsAuthenticated, selectUser } from '../redux/authSlice';
import './Login.css';

const Login = () => {
    const [empEmail, setEmpEmail] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [empLocalError, setEmpLocalError] = useState('');
    const [adminLocalError, setAdminLocalError] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (user.role === 'employee') {
                navigate('/employee-dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogin = async (e, email, password, expectedRole, setLocalError) => {
        e.preventDefault();
        setLocalError('');
        dispatch(loginStart());
        try {
            const user = await AuthService.login(email, password, expectedRole);
            dispatch(loginSuccess(user));
        } catch (err) {
            dispatch(loginFailure(err));
            setLocalError(err);
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-container">
                <div className="login-card employee-card">
                    <h2>Employee Login</h2>
                    <form onSubmit={(e) => handleLogin(e, empEmail, empPassword, 'employee', setEmpLocalError)}>
                        <div className="form-group">
                            <label htmlFor="emp-email">Email</label>
                            <input
                                type="email"
                                id="emp-email"
                                placeholder="Enter your email"
                                value={empEmail}
                                onChange={(e) => setEmpEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="emp-password">Password</label>
                            <input
                                type="password"
                                id="emp-password"
                                placeholder="Enter your password"
                                value={empPassword}
                                onChange={(e) => setEmpPassword(e.target.value)}
                                required
                            />
                        </div>
                        {empLocalError && <div className="error-message">{empLocalError}</div>}
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
                <div className="login-card admin-card">
                    <h2>Admin Login</h2>
                    <form onSubmit={(e) => handleLogin(e, adminEmail, adminPassword, 'admin', setAdminLocalError)}>
                        <div className="form-group">
                            <label htmlFor="admin-email">Email</label>
                            <input
                                type="email"
                                id="admin-email"
                                placeholder="Enter your email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="admin-password">Password</label>
                            <input
                                type="password"
                                id="admin-password"
                                placeholder="Enter your password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                required
                            />
                        </div>
                        {adminLocalError && <div className="error-message">{adminLocalError}</div>}
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Admin Access'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
