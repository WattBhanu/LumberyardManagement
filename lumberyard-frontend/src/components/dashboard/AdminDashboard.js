import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import UserRegistration from './UserRegistration';

const AdminDashboard = ({ user, onLogout, token }) => {
  console.log('AdminDashboard rendered with token:', token);
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'user-registration':
        return <UserRegistration token={token} />;
      case 'overview':
      default:
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <h3>System Overview</h3>
              <p>Manage all aspects of the lumberyard system</p>
            </div>
            
            <div className="dashboard-card">
              <h3>User Management</h3>
              <p>Create and manage users across all roles</p>
              <button 
                className="action-button"
                onClick={() => setActiveTab('user-registration')}
              >
                Register New User
              </button>
            </div>
            
            <div className="dashboard-card">
              <h3>System Settings</h3>
              <p>Configure system-wide settings</p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h2>Admin Dashboard</h2>
          {activeTab !== 'overview' && (
            <button 
              className="back-button"
              onClick={() => setActiveTab('overview')}
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;