import React, { useEffect, useState } from 'react';
import './Loader.css';

interface LoaderProps {
    onComplete: () => void;
}

const AppLoader: React.FC<LoaderProps> = ({ onComplete }) => {
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFading(true);
            setTimeout(onComplete, 500); // 500ms fade out transition
        }, 2000); // 2 second display time
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`loader-container ${isFading ? 'fade-out' : ''}`}>
            <div className="loader-content">
                <div className="car-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3" />
                        <circle cx="6.5" cy="16.5" r="2.5" />
                        <circle cx="17.5" cy="16.5" r="2.5" />
                    </svg>
                </div>
                <h1 className="loader-title">Auto<span>Space</span></h1>
                <p className="loader-subtitle">Smart Parking Management</p>
                <div className="loading-bar">
                    <div className="progress"></div>
                </div>
            </div>
        </div>
    );
};

export default AppLoader;
