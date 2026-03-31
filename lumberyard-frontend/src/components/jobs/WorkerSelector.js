import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './WorkerSelector.css';

const WorkerSelector = ({ job, role, onComplete, onCancel }) => {
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAvailableWorkers();
  }, [job, role]);

  const fetchAvailableWorkers = async () => {
    try {
      setLoading(true);
      console.log('Fetching available workers for date:', job.date, 'with position filter:', role);
      const response = await API.get(`/jobs/workers/available?date=${job.date}`);
      console.log('All available workers:', response.data);
      
      // Filter workers based on the selected position
      let filteredWorkers = response.data;
      if (role && role !== 'EMPLOYEE' && role !== 'SUPERVISOR') {
        // New position-based filtering - match exact position name
        filteredWorkers = response.data.filter(worker => 
          worker.position && worker.position.toLowerCase() === role.toLowerCase()
        );
        console.log(`Filtered workers for position ${role}:`, filteredWorkers);
      } else if (role === 'SUPERVISOR') {
        // Legacy: Only show workers whose position contains 'supervisor'
        filteredWorkers = response.data.filter(worker => 
          worker.position && worker.position.toLowerCase().includes('supervisor')
        );
        console.log('Filtered supervisors:', filteredWorkers);
      } else if (role === 'EMPLOYEE') {
        // Legacy: For employees, exclude supervisors
        filteredWorkers = response.data.filter(worker => 
          !worker.position || !worker.position.toLowerCase().includes('supervisor')
        );
        console.log('Filtered employees:', filteredWorkers);
      }
      
      setAvailableWorkers(filteredWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setMessage({ type: 'error', text: 'Failed to load available workers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorker = (workerId) => {
    if (selectedWorkers.includes(workerId)) {
      setSelectedWorkers(selectedWorkers.filter(id => id !== workerId));
    } else {
      setSelectedWorkers([...selectedWorkers, workerId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedWorkers.length === availableWorkers.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(availableWorkers.map(w => w.workerId || w.id));
    }
  };

  const handleAssign = async () => {
    if (selectedWorkers.length === 0) {
      setMessage({ type: 'warning', text: 'Please select at least one worker' });
      return;
    }

    try {
      setSaving(true);
      console.log('Assigning workers:', selectedWorkers, 'to job:', job.id, 'as role:', role);
      
      const payload = {
        jobAssignmentId: job.id,
        workerIds: selectedWorkers,
        role: role
      };

      await API.post('/jobs/assign', payload);
      
      setMessage({ type: 'success', text: `Successfully assigned ${selectedWorkers.length} worker(s) as ${role}(s)!` });
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Error assigning workers:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to assign workers' 
      });
    } finally {
      setSaving(false);
    }
  };

  const getRemainingSlots = () => {
    // Check if using new position-based requirements
    if (job.positionRequirements && job.positionRequirements[role]) {
      const required = job.positionRequirements[role];
      const assigned = job.assignedPositionsCount?.[role] || 0;
      return required - assigned;
    } else if (role === 'EMPLOYEE') {
      return job.requiredEmployees - (job.assignedEmployeesCount || 0);
    } else if (role === 'SUPERVISOR') {
      return job.requiredSupervisors - (job.assignedSupervisorsCount || 0);
    }
    return 0;
  };

  const remainingSlots = getRemainingSlots();

  return (
    <div className="worker-selector-page">
      {/* Header */}
      <div className="ws-header">
        <div className="ws-header-text">
          <h1>Assign {role === 'EMPLOYEE' ? 'Employees' : 'Supervisors'}</h1>
          <p>
            Job: <strong>{job.jobName}</strong> ({job.jobId})
          </p>
          <p>
            Date: <strong>{new Date(job.date).toLocaleDateString()}</strong>
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`ws-alert ws-alert-${message.type}`}>
          {message.text}
          {message.type === 'success' ? null : (
            <button className="ws-alert-close" onClick={() => setMessage(null)}>×</button>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="ws-info-card">
        <div className="ws-info-row">
          <span className="ws-info-label">Required:</span>
          <span className="ws-info-value">
            {job.positionRequirements && job.positionRequirements[role] 
              ? `${job.positionRequirements[role]} ${role}s` 
              : role === 'EMPLOYEE' 
                ? `${job.requiredEmployees} Employees` 
                : `${job.requiredSupervisors} Supervisors`}
          </span>
        </div>
        <div className="ws-info-row">
          <span className="ws-info-label">Already Assigned:</span>
          <span className="ws-info-value">
            {job.positionRequirements && job.positionRequirements[role]
              ? (job.assignedPositionsCount?.[role] || 0)
              : role === 'EMPLOYEE'
                ? (job.assignedEmployeesCount || 0)
                : (job.assignedSupervisorsCount || 0)}
          </span>
        </div>
        <div className="ws-info-row">
          <span className="ws-info-label">Remaining Slots:</span>
          <span className="ws-info-value ws-remaining">{remainingSlots}</span>
        </div>
        <div className="ws-info-row">
          <span className="ws-info-label">Available Workers:</span>
          <span className="ws-info-value">{availableWorkers.length}</span>
        </div>
      </div>

      {/* Workers List */}
      <div className="ws-table-card">
        <div className="ws-table-header">
          <h2>Select {role}{role && role !== 'EMPLOYEE' && role !== 'SUPERVISOR' ? 's' : ''}</h2>
          <button 
            className="ws-btn-select-all"
            onClick={handleSelectAll}
            disabled={availableWorkers.length === 0}
          >
            {selectedWorkers.length === availableWorkers.length && availableWorkers.length > 0 
              ? 'Deselect All' 
              : 'Select All'}
          </button>
        </div>

        {loading ? (
          <div className="ws-loading">Loading workers...</div>
        ) : availableWorkers.length === 0 ? (
          <div className="ws-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <p>No available workers for this date</p>
            <small>All workers are already assigned to other jobs.</small>
          </div>
        ) : (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th width="50">
                    <input
                      type="checkbox"
                      checked={selectedWorkers.length === availableWorkers.length && availableWorkers.length > 0}
                      onChange={handleSelectAll}
                      className="ws-checkbox-header"
                    />
                  </th>
                  <th>Worker ID</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {availableWorkers.map((worker) => {
                  const workerId = worker.workerId || worker.id;
                  return (
                    <tr key={workerId} className={`ws-row ${selectedWorkers.includes(workerId) ? 'ws-selected' : ''}`}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedWorkers.includes(workerId)}
                          onChange={() => handleSelectWorker(workerId)}
                          className="ws-checkbox"
                        />
                      </td>
                      <td className="ws-worker-id">#{workerId}</td>
                      <td className="ws-worker-name">
                        {worker.firstName} {worker.lastName}
                      </td>
                      <td>{worker.position}</td>
                      <td>{worker.department}</td>
                      <td>{worker.email}</td>
                      <td>
                        <span className={`ws-status-badge ws-status-${worker.status?.toLowerCase()}`}>
                          {worker.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="ws-footer">
        <button className="ws-btn-cancel" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button 
          className="ws-btn-assign" 
          onClick={handleAssign}
          disabled={selectedWorkers.length === 0 || saving}
        >
          {saving ? (
            <>
              <span className="ws-spinner"></span>
              Assigning...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Assign {selectedWorkers.length} Worker{selectedWorkers.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkerSelector;
