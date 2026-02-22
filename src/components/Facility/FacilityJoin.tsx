import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';
import '../Login/Login.css';

const FacilityJoin = () => {
    const { joinFacility } = useAuth();
    const [adminName, setAdminName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await joinFacility(adminName);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to find facility');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card animate-fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <Search size={40} />
                    </div>
                    <h2>Join Facility</h2>
                    <p>Enter your Admin's name to connect</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-inputs">
                        <div className="form-group">
                            <label>Admin Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="E.g., John Doe"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary login-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Searching...' : 'Join Workspace'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FacilityJoin;
