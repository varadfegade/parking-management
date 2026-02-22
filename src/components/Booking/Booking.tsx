import { useState, useEffect } from 'react';
import { Filter, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './Booking.css';

interface Slot {
    _id: string;
    slotNumber: string;
    col: number;
    row: number;
    type: 'standard' | 'vip' | 'disabled';
    isOccupied: boolean;
    currentSessionId?: {
        _id: string;
        vehiclePlate: string;
    };
}

const Booking = () => {
    const { role, facilityId, facilityName } = useAuth();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vehiclePlate, setVehiclePlate] = useState('');

    const fetchSlots = async () => {
        if (!facilityId) return;
        try {
            const { data } = await api.get(`/parking/slots/${facilityId}`);
            // Sort to ensure row-major order
            const sortedData = data.sort((a: any, b: any) => {
                if (a.row === b.row) return a.col - b.col;
                return a.row - b.row;
            });
            setSlots(sortedData);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [facilityId]);

    const filteredSlots = slots.filter(slot => {
        if (filter === 'available') return !slot.isOccupied;
        if (filter === 'occupied') return slot.isOccupied;
        return true;
    });

    const maxCols = slots.length > 0 ? Math.max(...slots.map(s => s.col)) + 1 : 1;

    const handleSlotClick = (slot: Slot) => {
        if (slot.isOccupied) return;
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !vehiclePlate) return;

        try {
            const endpoint = role === 'admin'
                ? `/parking/register/${selectedSlot._id}`
                : `/parking/book/${selectedSlot._id}`;

            await api.post(endpoint, { vehiclePlate });

            await fetchSlots();
            setIsModalOpen(false);
            setSelectedSlot(null);
            setVehiclePlate('');
        } catch (error) {
            console.error('Failed to book slot:', error);
            alert('Booking failed. Please check the console or try again.');
        }
    };

    if (!facilityId) {
        return (
            <div className="booking-container">
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>No Facility Selected</h2>
                    <p>You must join a parking facility to view and book slots.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-container">
            <div className="booking-header">
                <div>
                    <h1>{facilityName} - {role === 'admin' ? 'Register Vehicle' : 'Advance Slot Booking'}</h1>
                    <p>{role === 'admin' ? 'Select an available slot to register a user\'s vehicle.' : 'Select an available slot from the parking graph below.'}</p>
                </div>
                <div className="booking-actions">
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="slot-filter"
                        >
                            <option value="all">All Slots</option>
                            <option value="available">Available Only</option>
                            <option value="occupied">Occupied Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="legend-strip">
                <div className="legend-item"><div className="color-box standard"></div> Standard (Available)</div>
                <div className="legend-item"><div className="color-box vip"></div> VIP</div>
                <div className="legend-item"><div className="color-box disabled"></div> Reserved (Disabled)</div>
                <div className="legend-item"><div className="color-box occupied"></div> Occupied</div>
            </div>

            <div className="parking-graph" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
                {filteredSlots.map(slot => (
                    <button
                        key={slot._id}
                        className={`slot-card ${slot.isOccupied ? 'occupied' : slot.type}`}
                        onClick={() => handleSlotClick(slot)}
                        disabled={slot.isOccupied}
                        style={{ gridColumn: slot.col + 1, gridRow: slot.row + 1 }}
                    >
                        <span className="slot-id">{slot.slotNumber}</span>
                        {slot.type === 'vip' && !slot.isOccupied && <ShieldCheck size={16} className="slot-icon" />}
                        {slot.isOccupied && <span className="slot-plate">{slot.currentSessionId?.vehiclePlate}</span>}
                    </button>
                ))}
            </div>

            {isModalOpen && selectedSlot && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h2>{role === 'admin' ? 'Register' : 'Book'} Slot {selectedSlot.slotNumber}</h2>
                        <p className="modal-subtitle">{role === 'admin' ? 'Assign a user\'s vehicle to' : 'Reserve'} this {selectedSlot.type} slot</p>

                        <form onSubmit={handleBooking} className="booking-form">
                            <div className="form-group">
                                <label>Vehicle License Plate</label>
                                <input
                                    type="text"
                                    value={vehiclePlate}
                                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                                    className="input"
                                    placeholder="e.g. MH-12-AB-1234"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Estimated Arrival</label>
                                <input type="time" className="input" required />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;
