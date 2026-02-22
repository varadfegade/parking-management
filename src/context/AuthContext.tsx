import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
    role: UserRole;
    userEmail: string | null;
    userName: string | null;
    facilityId: string | null;
    facilityName: string | null;
    login: (role: UserRole, email: string) => Promise<void>;
    register: (role: UserRole, email: string, name: string) => Promise<void>;
    joinFacility: (adminName: string) => Promise<void>;
    setupFacility: (name: string, rows: number, cols: number, customSlots?: any[]) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [role, setRole] = useState<UserRole>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [facilityId, setFacilityId] = useState<string | null>(null);
    const [facilityName, setFacilityName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole') as UserRole;
        const storedEmail = localStorage.getItem('userEmail');
        const storedName = localStorage.getItem('userName');
        const storedFacilityId = localStorage.getItem('facilityId');
        const storedFacilityName = localStorage.getItem('facilityName');
        const token = localStorage.getItem('token');
        if (storedRole && token) {
            setRole(storedRole);
            setUserEmail(storedEmail);
            setUserName(storedName);
            setFacilityId(storedFacilityId);
            setFacilityName(storedFacilityName);
        } else {
            setRole(null);
            setUserEmail(null);
            setUserName(null);
            setFacilityId(null);
            setFacilityName(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('facilityId');
            localStorage.removeItem('facilityName');
            navigate('/login');
        }
        setIsLoading(false);
    }, [navigate]);

    const login = async (_selectedRole: UserRole, email: string) => {
        // Assume default password 'password123' for demonstration
        const response = await api.post('/auth/login', { email, password: 'password123' });
        const { token, user } = response.data;

        setRole(user.role);
        setUserEmail(user.email);
        setUserName(user.name);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('token', token);

        if (user.role === 'admin') navigate('/facility/setup');
        else navigate('/facility/join');
    };

    const register = async (selectedRole: UserRole, email: string, name: string) => {
        const response = await api.post('/auth/register', { email, name, password: 'password123', role: selectedRole });
        const { token, user } = response.data;

        setRole(user.role);
        setUserEmail(user.email);
        setUserName(user.name);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('token', token);

        // Let user choose app path or redirect to setup if admin
        if (user.role === 'admin') navigate('/facility/setup');
        else navigate('/facility/join');
    };

    const joinFacility = async (adminName: string) => {
        const response = await api.get(`/facility/admin/${adminName}`);
        const facility = response.data;

        setFacilityId(facility._id);
        setFacilityName(facility.name);
        localStorage.setItem('facilityId', facility._id);
        localStorage.setItem('facilityName', facility.name);
        navigate('/');
    };

    const setupFacility = async (name: string, rows: number, cols: number, customSlots?: any[]) => {
        const response = await api.post('/facility/setup', { name, rows, cols, customSlots });
        const { facility } = response.data;

        setFacilityId(facility._id);
        setFacilityName(facility.name);
        localStorage.setItem('facilityId', facility._id);
        localStorage.setItem('facilityName', facility.name);
        navigate('/');
    };

    const logout = () => {
        setRole(null);
        setUserEmail(null);
        setUserName(null);
        setFacilityId(null);
        setFacilityName(null);
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('facilityId');
        localStorage.removeItem('facilityName');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ role, userEmail, userName, facilityId, facilityName, login, register, joinFacility, setupFacility, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
