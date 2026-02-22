import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun, LayoutDashboard, CarFront, Search, History, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const { role, logout } = useAuth();

    return (
        <div className="layout-root">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <CarFront size={28} className="logo-icon" />
                    <h2>Auto<span>Space</span></h2>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/booking" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <CarFront size={20} />
                        <span>Book Slot</span>
                    </NavLink>
                    <NavLink to="/retrieval" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Search size={20} />
                        <span>Find & Unpark</span>
                    </NavLink>
                    {role === 'user' && (
                        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <History size={20} />
                            <span>History</span>
                        </NavLink>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout-btn" onClick={logout}>
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-content">
                <header className="topbar">
                    <div className="topbar-search">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Quick search ticket or plate..." className="input-search" />
                    </div>
                    <div className="topbar-actions">
                        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="user-profile">
                            <div className="avatar">{role === 'admin' ? 'A' : 'U'}</div>
                            <span className="user-name">{role === 'admin' ? 'Administrator' : 'User'}</span>
                        </div>
                    </div>
                </header>

                <main className="page-content animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
