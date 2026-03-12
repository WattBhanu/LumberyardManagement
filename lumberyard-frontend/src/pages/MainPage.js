import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
    return (
        <div className="main-page">
            <div className="main-content">
                <div className="main-header">
                    <div className="header-left">
                        <h1>Lumberyard Management</h1>
                        <span className="header-badge">Main System Dashboard</span>
                    </div>
                </div>

                <div className="modules-grid">
                    <Link to="/inventory" className="module-card">
                        <div className="module-icon inventory">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <div className="module-content">
                            <h3>Inventory System</h3>
                            <p>Manage timber, logs, and chemical supplies across the entire facility.</p>
                        </div>
                        <div className="module-arrow">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                    </Link>

                    <Link to="/production" className="module-card">
                        <div className="module-icon production">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                        </div>
                        <div className="module-content">
                            <h3>Production Process</h3>
                            <p>Track active processing, stages, and timber utilization queues.</p>
                        </div>
                        <div className="module-arrow">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
