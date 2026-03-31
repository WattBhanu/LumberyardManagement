import React, { useState } from 'react';
import API from '../../services/api';
import './CreateJobModal.css';

const JOB_NAMES = [
  'Timber Unloading',
  'Timber Arrangement',
  'Sawing',
  'Timber Treatment',
  'Timber Peeling',
  'Processing',
  'Shop Work'
];

const POSITIONS = [
  'Employee', 'Sawyer', 'Forklift Operator', 'Team Lead', 'Supervisor',
  'Quality Inspector', 'Maintenance Technician', 'Logistics Coordinator', 'Safety Officer', 'Other'
];

const CreateJobModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    jobId: '',
    jobName: '',
    customJobName: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [positionQuantities, setPositionQuantities] = useState({});
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'jobName') {
      setShowCustomInput(value === 'Add Job');
    }
  };

  const handleQuantityChange = (position, delta) => {
    setPositionQuantities(prev => {
      const current = prev[position] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [position]: newValue };
    });
  };

  // Calculate max date (2 weeks from today)
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate total workers needed
      const totalWorkers = Object.values(positionQuantities).reduce((sum, qty) => sum + qty, 0);
      
      const payload = {
        jobId: formData.jobId,
        jobName: formData.jobName,
        customJobName: showCustomInput ? formData.customJobName : null,
        positionRequirements: positionQuantities,
        totalWorkers: totalWorkers,
        date: formData.date
      };

      console.log('Creating job:', payload);
      const response = await API.post('/jobs', payload);
      console.log('Job created:', response.data);
      
      onSuccess(response.data);
      onClose();
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.error || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-job-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Job</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error">{error}</div>
          )}

          <div className="form-group">
            <label>Job ID *</label>
            <input
              type="text"
              name="jobId"
              value={formData.jobId}
              onChange={handleChange}
              placeholder="e.g., JOB-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Job Name *</label>
            <select
              name="jobName"
              value={formData.jobName}
              onChange={handleChange}
              required
            >
              <option value="">Select a job...</option>
              {JOB_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="Add Job">+ Add Job</option>
            </select>
          </div>

          {showCustomInput && (
            <div className="form-group">
              <label>Custom Job Name *</label>
              <input
                type="text"
                name="customJobName"
                value={formData.customJobName}
                onChange={handleChange}
                placeholder="Enter custom job name"
                required={showCustomInput}
              />
            </div>
          )}

          <div className="form-group">
            <label>Positions Required</label>
            <div className="positions-list">
              {POSITIONS.map(position => (
                <div key={position} className="position-row">
                  <span className="position-name">{position}</span>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(position, -1)}
                      disabled={(positionQuantities[position] || 0) <= 0}
                    >
                      −
                    </button>
                    <span className="quantity-value">
                      {positionQuantities[position] || 0}
                    </span>
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(position, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <small className="form-hint">
              Total workers: {Object.values(positionQuantities).reduce((sum, qty) => sum + qty, 0)}
            </small>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today.toISOString().split('T')[0]}
              max={maxDateString}
              required
            />
            <small className="form-hint">
              Jobs can be scheduled up to 2 weeks in advance
            </small>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
