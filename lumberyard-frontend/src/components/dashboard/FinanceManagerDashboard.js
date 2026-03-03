import React from 'react';
import DashboardLayout from './DashboardLayout';

const FinanceManagerDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="finance-dashboard">
        <h2>Finance Manager Dashboard</h2>
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>Sales Records</h3>
            <p>Record and track sales transactions</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Expense Tracking</h3>
            <p>Record and monitor business expenses</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Financial Summary</h3>
            <p>Generate financial summaries and reports</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Financial Reports</h3>
            <p>Create detailed financial analysis reports</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceManagerDashboard;