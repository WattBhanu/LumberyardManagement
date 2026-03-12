import React from 'react';
import DashboardLayout from './DashboardLayout';

const InventoryOperationsManagerDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="inventory-dashboard">
        <h2>Inventory Operations Manager Dashboard</h2>
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>Timber Management</h3>
            <p>Track and manage timber inventory</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Treatment Tracking</h3>
            <p>Monitor timber treatment processes</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Production Orders</h3>
            <p>Create and monitor production orders</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Material Usage</h3>
            <p>Monitor production material usage</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryOperationsManagerDashboard;