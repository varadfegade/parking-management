import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Save, Edit3 } from 'lucide-react';
import '../Booking/Booking.css';
import '../Login/Login.css';

interface CustomSlot {
    slotNumber: string;
    row: number;
    col: number;
    type: 'standard' | 'vip' | 'disabled' | 'empty';
}

const FacilitySetup = () => {
    const { setupFacility, userName } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [facilityName, setFacilityName] = useState(`${userName}'s Facility`);
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(10);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Grid Canvas State
    const [customGrid, setCustomGrid] = useState<CustomSlot[]>([]);
    const [selectedBrush, setSelectedBrush] = useState<'standard' | 'vip' | 'disabled' | 'empty'>('standard');

    const handleGenerateCanvas = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (rows * cols > 200) {
            setError('For interactive design, maximum 200 slots (e.g. 10x20) is supported.');
            return;
        }

        const initialGrid: CustomSlot[] = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const rowLetter = String.fromCharCode(65 + r);
                initialGrid.push({
                    slotNumber: `${rowLetter}-${c + 1}`,
                    row: r,
                    col: c,
                    type: 'standard'
                });
            }
        }
        setCustomGrid(initialGrid);
        setStep(2);
    };

    const handleSlotClick = (index: number) => {
        const newGrid = [...customGrid];
        newGrid[index].type = selectedBrush;
        setCustomGrid(newGrid);
    };

    const handleSaveLayout = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            // Filter out empty spaces before sending to backend
            const finalSlots = customGrid.filter(slot => slot.type !== 'empty');

            if (finalSlots.length === 0) {
                setError('You must have at least one valid parking slot.');
                setIsSubmitting(false);
                return;
            }

            await setupFacility(facilityName, rows, cols, finalSlots);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to setup facility');
            setIsSubmitting(false);
        }
    };

    if (step === 2) {
        return (
            <div className="booking-container">
                <div className="booking-header">
                    <div>
                        <h1>Interactive Grid Designer</h1>
                        <p>Click on slots to change their type. Mark areas as "Empty Space" for driveways.</p>
                    </div>
                    <div className="booking-actions">
                        <button className="btn btn-outline" onClick={() => setStep(1)}><Edit3 size={18} /> Edit Dimensions</button>
                        <button className="btn btn-primary" onClick={handleSaveLayout} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : <><Save size={18} /> Save Layout</>}
                        </button>
                    </div>
                </div>

                <div className="legend-strip" style={{ marginBottom: '2rem' }}>
                    <div
                        className={`legend-item ${selectedBrush === 'standard' ? 'active-brush' : ''}`}
                        onClick={() => setSelectedBrush('standard')}
                        style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', border: selectedBrush === 'standard' ? '2px solid var(--primary)' : '2px solid transparent' }}
                    >
                        <div className="color-box standard"></div> Standard
                    </div>
                    <div
                        className={`legend-item ${selectedBrush === 'vip' ? 'active-brush' : ''}`}
                        onClick={() => setSelectedBrush('vip')}
                        style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', border: selectedBrush === 'vip' ? '2px solid var(--primary)' : '2px solid transparent' }}
                    >
                        <div className="color-box vip"></div> VIP
                    </div>
                    <div
                        className={`legend-item ${selectedBrush === 'disabled' ? 'active-brush' : ''}`}
                        onClick={() => setSelectedBrush('disabled')}
                        style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', border: selectedBrush === 'disabled' ? '2px solid var(--primary)' : '2px solid transparent' }}
                    >
                        <div className="color-box disabled"></div> Disabled
                    </div>
                    <div
                        className={`legend-item ${selectedBrush === 'empty' ? 'active-brush' : ''}`}
                        onClick={() => setSelectedBrush('empty')}
                        style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', border: selectedBrush === 'empty' ? '2px solid var(--primary)' : '2px solid transparent' }}
                    >
                        <div className="color-box" style={{ background: 'transparent', border: '2px dashed var(--border)' }}></div> Empty Space (Driveway)
                    </div>
                </div>

                {error && <p className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                <div className="parking-graph" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {customGrid.map((slot, index) => (
                        <button
                            key={`${slot.row}-${slot.col}`}
                            className={`slot-card ${slot.type === 'empty' ? 'empty-slot' : slot.type}`}
                            onClick={() => handleSlotClick(index)}
                            style={{
                                gridColumn: slot.col + 1,
                                gridRow: slot.row + 1,
                                opacity: slot.type === 'empty' ? 0.3 : 1,
                                border: slot.type === 'empty' ? '1px dashed var(--border)' : '',
                                background: slot.type === 'empty' ? 'transparent' : ''
                            }}
                        >
                            {slot.type !== 'empty' && <span className="slot-id">{slot.slotNumber}</span>}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card card animate-fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <LayoutDashboard size={40} />
                    </div>
                    <h2>Facility Setup</h2>
                    <p>Start by defining the outer dimensions</p>
                </div>

                <form onSubmit={handleGenerateCanvas} className="login-form">
                    <div className="login-inputs">
                        <div className="form-group">
                            <label>Facility Name</label>
                            <input
                                type="text"
                                className="input"
                                value={facilityName}
                                onChange={(e) => setFacilityName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Total Rows</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    max="26"
                                    value={rows}
                                    onChange={(e) => setRows(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <label>Total Columns</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    max="100"
                                    value={cols}
                                    onChange={(e) => setCols(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary login-submit-btn">
                        Create Grid Canvas
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FacilitySetup;
