import { useState, useEffect } from 'react';
import { Search, MapPin, Car, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './Retrieval.css';

const Retrieval = () => {
    const { role, facilityId, facilityName } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isUnparking, setIsUnparking] = useState(false);
    const [slots, setSlots] = useState<any[]>([]);

    useEffect(() => {
        const loadSlots = async () => {
            if (!facilityId) return;
            try {
                const { data } = await api.get(`/parking/slots/${facilityId}`);
                setSlots(data);
            } catch (err) {
                console.error('Failed to load slots data', err);
            }
        };
        loadSlots();
    }, [facilityId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const q = searchQuery.replace(/-/g, '').toLowerCase();

        // Find slot where currentSessionId exists and matches plate or session id
        const foundSlot = slots.find(s => {
            if (!s.isOccupied || !s.currentSessionId) return false;
            const session = s.currentSessionId;
            return session.vehiclePlate.replace(/-/g, '').toLowerCase() === q ||
                session._id.toLowerCase() === q;
        });

        if (foundSlot) {
            setResult({
                slotId: foundSlot._id,
                slotNumber: foundSlot.slotNumber,
                type: foundSlot.type,
                ...foundSlot.currentSessionId
            });
        } else {
            setResult(null);
        }

        setHasSearched(true);
        setIsUnparking(false);
    };

    const handleUnpark = async () => {
        if (!result) return;
        setIsUnparking(true);
        try {
            await api.post(`/parking/unpark/${result.slotId}`);

            const { data } = await api.get(`/parking/slots/${facilityId}`);
            setSlots(data);

            setResult(null);
            setHasSearched(false);
            setSearchQuery('');
        } catch (error) {
            console.error('Unpark failed', error);
            alert('Failed to unpark vehicle.');
        } finally {
            setIsUnparking(false);
        }
    };

    if (!facilityId) {
        return (
            <div className="retrieval-container">
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>No Facility Selected</h2>
                    <p>You must join a parking facility to search for a vehicle.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="retrieval-container">
            <div className="retrieval-header">
                <h1>{facilityName} - {role === 'admin' ? 'Find & Manage Vehicles' : 'Vehicle Retrieval'}</h1>
                <p>{role === 'admin' ? 'Search by Ticket ID or License Plate to force unpark any vehicle.' : 'Locate your parked vehicle by entering your ticket ID or License Plate number.'}</p>
            </div>

            <div className="search-section card">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <Search className="search-icon-large" size={24} />
                        <input
                            type="text"
                            className="search-input-large"
                            placeholder="Enter Ticket ID (e.g. TKT-1042) or License Plate"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                        />
                        <button type="submit" className="btn btn-primary search-btn">Find Vehicle</button>
                    </div>
                </form>
            </div>

            {hasSearched && !result && (
                <div className="search-empty animate-fade-in">
                    <Car size={48} className="empty-icon" />
                    <h3>Vehicle Not Found</h3>
                    <p>We couldn't locate any active parking session matching "{searchQuery}". Please check the details and try again.</p>
                </div>
            )}

            {hasSearched && result && (
                <div className="search-result animate-fade-in">
                    <div className="result-card card">
                        <div className="result-header">
                            <div className="plate-badge">{result.vehiclePlate}</div>
                            <span className={`type-badge ${result.type.toLowerCase()}`}>{result.type} Slot</span>
                        </div>

                        <div className="result-details">
                            <div className="detail-row">
                                <span className="detail-label">Ticket ID:</span>
                                <span className="detail-value">{result._id.substring(result._id.length - 8).toUpperCase()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Parked Since:</span>
                                <span className="detail-value">{new Date(result.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="detail-row highlight-row">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">{result.status}</span>
                            </div>
                        </div>

                        <div className="location-box">
                            <MapPin size={32} className="location-icon" />
                            <div>
                                <h4>Your Vehicle is at Slot</h4>
                                <div className="slot-highlight">{result.slotNumber}</div>
                            </div>
                        </div>

                        <div className="result-actions">
                            <button
                                className="btn btn-outline unpark-btn"
                                onClick={handleUnpark}
                                disabled={isUnparking}
                            >
                                {isUnparking ? (
                                    'Processing...'
                                ) : (
                                    <><LogOut size={18} /> {role === 'admin' ? 'Force Unpark Vehicle' : 'Initiate Unpark'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Retrieval;
