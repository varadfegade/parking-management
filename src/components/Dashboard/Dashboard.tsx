import { useState, useEffect } from 'react';
import { Car, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { role, facilityId, facilityName } = useAuth();
    const navigate = useNavigate();
    const [slots, setSlots] = useState<any[]>([]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!facilityId) return;
            try {
                const { data } = await api.get(`/parking/slots/${facilityId}`);
                setSlots(data);
            } catch (error) {
                console.error('Failed to fetch slots for dashboard', error);
            }
        };
        fetchSlots();
    }, [facilityId]);

    const totalSlots = slots.length || 60; // default to 60 if empty
    const occupiedSlots = slots.filter(s => s.isOccupied).length;
    const availableSlots = totalSlots - occupiedSlots;
    const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    const recentActivity = [
        { id: 'TKT-1042', plate: 'MH-12-AB-1234', action: 'Parked', time: '10 mins ago', slot: 'A-12' },
        { id: 'TKT-1041', plate: 'DL-01-XY-9876', action: 'Left', time: '15 mins ago', slot: 'B-04' },
        { id: 'TKT-1040', plate: 'KA-05-MN-5566', action: 'Parked', time: '22 mins ago', slot: 'A-15' },
        { id: 'TKT-1039', plate: 'GJ-01-PR-1122', action: 'Parked', time: '1 hour ago', slot: 'C-01' },
    ];

    if (!facilityId) {
        return (
            <div className="dashboard-container">
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>Welcome to AutoSpace</h2>
                    <p>Please join an Admin's facility to view metrics.</p>
                    {role === 'admin' ? (
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '1.5rem' }}
                            onClick={() => navigate('/facility/setup')}
                        >
                            Create Facility Layout
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '1.5rem' }}
                            onClick={() => navigate('/facility/join')}
                        >
                            Join a Facility
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>{facilityName} Dashboard Overview</h1>
                    <p>Real-time parking facility metrics</p>
                </div>
                {role === 'admin' ? (
                    <button
                        className="btn btn-outline"
                        onClick={() => navigate('/facility/setup')}
                    >
                        Edit Facility Layout
                    </button>
                ) : (
                    <button
                        className="btn btn-outline"
                        onClick={() => navigate('/facility/join')}
                    >
                        Change Facility
                    </button>
                )}
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon-wrapper primary">
                        <Car size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Total Parked</h3>
                        <p className="metric-value">{occupiedSlots}</p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon-wrapper success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Available Slots</h3>
                        <p className="metric-value">{availableSlots}</p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon-wrapper warning">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Occupancy</h3>
                        <p className="metric-value">{occupancyRate}%</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="card activity-card">
                    <div className="card-header">
                        <h2>Recent Activity</h2>
                        <button className="btn btn-outline btn-sm">View All</button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon">
                                    <Clock size={16} />
                                </div>
                                <div className="activity-details">
                                    <p className="activity-plate">{activity.plate}</p>
                                    <p className="activity-meta">Slot {activity.slot} • {activity.time}</p>
                                </div>
                                <div className={`activity-status ${activity.action.toLowerCase()}`}>
                                    {activity.action}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card chart-card">
                    <div className="card-header">
                        <h2>Live Capacity Status</h2>
                    </div>
                    <div className="capacity-visualizer">
                        <div className="capacity-circle">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg"
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                    strokeDasharray={`${occupancyRate} 100`}
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="capacity-text">
                                <span className="percentage">{occupancyRate}%</span>
                                <span className="label">Full</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
