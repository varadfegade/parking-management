import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { ShieldAlert, User, CarFront } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<UserRole>('user');
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(selectedRole, email, password);
            } else {
                await register(selectedRole, email, name, password);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card animate-fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <CarFront size={40} />
                    </div>
                    <h2>Welcome to AutoSpace</h2>
                    <p>{isLogin ? 'Login to access' : 'Register for'} the Smart Parking system</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="role-selection">
                        <button
                            type="button"
                            className={`role-btn ${selectedRole === 'user' ? 'active' : ''}`}
                            onClick={() => setSelectedRole('user')}
                        >
                            <User size={24} className="role-icon" />
                            <span>User Portal</span>
                        </button>
                        <button
                            type="button"
                            className={`role-btn admin ${selectedRole === 'admin' ? 'active' : ''}`}
                            onClick={() => setSelectedRole('admin')}
                        >
                            <ShieldAlert size={24} className="role-icon" />
                            <span>Admin Portal</span>
                        </button>
                    </div>

                    <div className="login-inputs">
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name / Identifier</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder={`Enter your ${selectedRole} email`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                className="input" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    {error && <p className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary login-submit-btn">
                        {isLogin ? 'Sign In as' : 'Register as'} {selectedRole?.charAt(0).toUpperCase()}{selectedRole?.slice(1)}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginTop: '1rem', width: '100%' }}
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
