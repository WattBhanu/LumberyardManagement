import React from 'react';
import DashboardLayout from './DashboardLayout';

const LaborManagerDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="labor-dashboard">
        <h2>Labor Manager Dashboard</h2>
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>Worker Management</h3>
            <p>View and manage worker profiles</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Shift Management</h3>
            <p>Create and manage work shifts</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Attendance Tracking</h3>
            <p>Record and monitor worker attendance</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Salary Reports</h3>
            <p>Generate salary reports and compensation data</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaborManagerDashboard;