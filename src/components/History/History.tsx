import { useState, useEffect } from 'react';
import { History as HistoryIcon, ArrowUpRight } from 'lucide-react';
import api from '../../api';
import './History.css';

const History = () => {
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/parking/history');
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch user history', error);
            }
        };
        fetchHistory();
    }, []);

    const totalSpent = history.reduce((sum, session) => sum + (session.cost || 0), 0);

    const formatDuration = (start: string, end?: string) => {
        if (!end) return 'Active';
        const diffMs = new Date(end).getTime() - new Date(start).getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.round(((diffMs % 3600000) / 60000));
        return `${diffHrs}h ${diffMins}m`;
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>Parking History</h1>
                <p>Review your past parking sessions and charges.</p>
            </div>

            <div className="history-stats grid">
                <div className="stat-card card">
                    <HistoryIcon size={24} className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Sessions</h3>
                        <p className="stat-value">{history.length}</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <ArrowUpRight size={24} className="stat-icon warning" />
                    <div className="stat-info">
                        <h3>Total Spent</h3>
                        <p className="stat-value">₹{totalSpent}</p>
                    </div>
                </div>
            </div>

            <div className="history-table-container card">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Slot Type</th>
                            <th>Cost</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((row) => (
                            <tr key={row._id}>
                                <td className="fw-600">{row._id.substring(row._id.length - 8).toUpperCase()}</td>
                                <td>{new Date(row.startTime).toLocaleDateString()} <span className="time-sub">({new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {row.endTime ? new Date(row.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'})</span></td>
                                <td>{formatDuration(row.startTime, row.endTime)}</td>
                                <td><span className={`type-badge-sm ${row.slotId?.type?.toLowerCase() || 'standard'}`}>{row.slotId?.type || 'Standard'}</span></td>
                                <td className="fw-600 cost-cell">{row.cost ? `₹${row.cost}` : '-'}</td>
                                <td><span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
