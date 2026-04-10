import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './LaborManagement.css';

const ManagerSalaryManagement = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [updateForm, setUpdateForm] = useState({
    newDailyRate: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/salaries/managers');
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setMessage('Failed to load manager salaries');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (manager) => {
    setSelectedManager(manager);
    setUpdateForm({
      newDailyRate: manager.currentDailyRate || '',
      effectiveDate: new Date().toISOString().split('T')[0],
      reason: ''
    });
    setShowUpdateModal(true);
  };

  const handleHistoryClick = async (manager) => {
    try {
      setSelectedManager(manager);
      const response = await API.get(`/salaries/managers/history/${manager.managerId}`);
      setSalaryHistory(response.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching salary history:', error);
      setMessage('Failed to load salary history');
      setMessageType('error');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put('/salaries/managers/update', {
        managerId: selectedManager.managerId,
        newDailyRate: parseFloat(updateForm.newDailyRate),
        effectiveDate: updateForm.effectiveDate,
        reason: updateForm.reason || 'Salary update'
      }, {
        headers: {
          'X-User-Email': currentUser.email
        }
      });

      setMessage(`Salary updated successfully for ${selectedManager.managerName}`);
      setMessageType('success');
      setShowUpdateModal(false);
      fetchManagers();
    } catch (error) {
      console.error('Error updating salary:', error);
      setMessage(error.response?.data?.error || 'Failed to update salary');
      setMessageType('error');
    }
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'ADMIN': 'Admin',
      'FINANCE_MANAGER': 'Finance Manager',
      'LABOR_MANAGER': 'Labor Manager',
      'INVENTORY_OPERATIONS_MANAGER': 'Inventory Manager'
    };
    return roleMap[role] || role;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="manager-salary-section">
      <div className="labor-mgmt-header">
        <h1>Manager Salary Management</h1>
      </div>

      {message && (
        <div className={`message ${messageType}`} style={{ marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      <div className="labor-mgmt-table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : managers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>No salary records available</p>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Register managers with salary rates to see them here</p>
          </div>
        ) : (
          <table className="labor-mgmt-table">
            <thead>
              <tr>
                <th>Manager Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Daily Salary (LKR)</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.managerId}>
                  <td>{manager.managerName}</td>
                  <td>{manager.managerEmail}</td>
                  <td>{getRoleLabel(manager.managerRole)}</td>
                  <td style={{ fontWeight: '600', color: '#2563eb' }}>
                    {manager.currentDailyRate ? manager.currentDailyRate.toLocaleString() : 'Not Set'}
                  </td>
                  <td>{formatDate(manager.effectiveDate)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="view-btn"
                        onClick={() => handleHistoryClick(manager)}
                        title="View Salary History"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        History
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleUpdateClick(manager)}
                        title="Update Salary"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Update Salary Modal */}
      {showUpdateModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Salary - {selectedManager.managerName}</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              {getRoleLabel(selectedManager.managerRole)} | Current: {selectedManager.currentDailyRate?.toLocaleString() || 'Not Set'} LKR/day
            </p>
            
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label htmlFor="newDailyRate">New Daily Salary Rate (LKR) *</label>
                <input
                  type="number"
                  id="newDailyRate"
                  value={updateForm.newDailyRate}
                  onChange={(e) => setUpdateForm({...updateForm, newDailyRate: e.target.value})}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="effectiveDate">Effective Date *</label>
                <input
                  type="date"
                  id="effectiveDate"
                  value={updateForm.effectiveDate}
                  onChange={(e) => setUpdateForm({...updateForm, effectiveDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <select
                  id="reason"
                  value={updateForm.reason}
                  onChange={(e) => setUpdateForm({...updateForm, reason: e.target.value})}
                >
                  <option value="">Select reason...</option>
                  <option value="Initial salary">Initial Salary</option>
                  <option value="Annual raise">Annual Raise</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Performance adjustment">Performance Adjustment</option>
                  <option value="Market adjustment">Market Adjustment</option>
                  <option value="Salary update">Other</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Update Salary</button>
                <button type="button" className="cancel-btn" onClick={() => setShowUpdateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {showHistoryModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h3>Salary History - {selectedManager.managerName}</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              {getRoleLabel(selectedManager.managerRole)}
            </p>
            
            {salaryHistory.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No salary history available</p>
            ) : (
              <table className="labor-mgmt-table">
                <thead>
                  <tr>
                    <th>Effective Date</th>
                    <th>Daily Rate (LKR)</th>
                    <th>Reason</th>
                    <th>Updated By</th>
                    <th>Updated On</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryHistory.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.effectiveDate)}</td>
                      <td style={{ fontWeight: '600' }}>{record.newDailyRate?.toLocaleString()}</td>
                      <td>{record.reason}</td>
                      <td>{record.createdBy || 'N/A'}</td>
                      <td>{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="cancel-btn" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSalaryManagement;
