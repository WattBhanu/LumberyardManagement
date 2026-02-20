import React from 'react';
import DashboardLayout from './DashboardLayout';

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>System Overview</h3>
            <p>Manage all aspects of the lumberyard system</p>
          </div>
          
          <div className="dashboard-card">
            <h3>User Management</h3>
            <p>Create and manage users across all roles</p>
          </div>
          
          <div className="dashboard-card">
            <h3>System Settings</h3>
            <p>Configure system-wide settings</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;