import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShiftScheduling.css';
import ScheduleTab from './shift/ScheduleTab';
import WorkerTab from './shift/WorkerTab';
import HistoryTab from './shift/HistoryTab';

const ShiftScheduling = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleTab />;
      case 'worker':
        return <WorkerTab />;
      case 'history':
        return <HistoryTab />;
      default:
        return <ScheduleTab />;
    }
  };

  return (
    <div className="shift-scheduling-page">
      {/* Header */}
      <div className="shift-header">
        <button className="shift-back-btn" onClick={() => navigate('/labor/jobs')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="shift-header-text">
          <h1>Shift Scheduling</h1>
          <span className="shift-badge">SHIFT MANAGEMENT</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="shift-nav-tabs">
        <button
          className={`shift-tab ${activeTab === 'schedule' ? 'shift-tab-active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Schedule
        </button>
        <button
          className={`shift-tab ${activeTab === 'worker' ? 'shift-tab-active' : ''}`}
          onClick={() => setActiveTab('worker')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Worker
        </button>
        <button
          className={`shift-tab ${activeTab === 'history' ? 'shift-tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="shift-tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ShiftScheduling;
