import React, { useState, useEffect } from 'react';
import API from '../../../services/api';
import './ShiftAssignmentModal.css';

const ShiftAssignmentModal = ({ job, onClose, onSuccess }) => {
  const [shifts, setShifts] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeShifts, setActiveShifts] = useState({}); // Track which shifts are ON
  const [draggedWorker, setDraggedWorker] = useState(null);

  useEffect(() => {
    fetchShiftsAndWorkers();
  }, [job]);

  const fetchShiftsAndWorkers = async () => {
    try {
      setLoading(true);
      // Fetch shifts for the job date
      const scheduleResponse = await API.get(`/shifts/schedule?date=${job.date}`);
      setShifts(scheduleResponse.data.shifts || []);
      
      // Initialize active shifts (all ON by default)
      const initialActiveState = {};
      (scheduleResponse.data.shifts || []).forEach(shift => {
        initialActiveState[shift.id] = true;
      });
      setActiveShifts(initialActiveState);
      
      // Get workers assigned to this specific job
      const jobAssignedWorkers = job.assignedWorkers || [];
      console.log('=== SHIFT ASSIGNMENT MODAL DEBUG ===');
      console.log('Job object:', job);
      console.log('Job assigned workers:', jobAssignedWorkers);
      console.log('Job ID:', job.id);
      console.log('Job name:', job.jobName);
      
      if (jobAssignedWorkers.length === 0) {
        // If no workers assigned to job, show empty list
        setAvailableWorkers([]);
        setMessage({ type: 'info', text: 'No workers assigned to this job. Please assign workers in Job Assignment first.' });
      } else {
        // Transform the assigned workers to match the expected format
        // The job.assignedWorkers already contains the workers we need!
        const transformedWorkers = jobAssignedWorkers.map(worker => ({
          workerId: worker.workerId,
          firstName: worker.workerName.split(' ')[0] || '',
          lastName: worker.workerName.split(' ').slice(1).join(' ') || '',
          position: worker.position || worker.role || 'EMPLOYEE'
        }));
        
        console.log('Transformed workers for shift assignment:', transformedWorkers);
        console.log('=====================================');
        setAvailableWorkers(transformedWorkers);
        
        if (transformedWorkers.length === 0) {
          setMessage({ type: 'warning', text: 'No workers are assigned to this job.' });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load shifts or workers' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async (shiftId, workerId) => {
    try {
      setSaving(true);
      await API.post('/shifts/assign', null, {
        params: {
          shiftId,
          workerId,
          jobId: job.id
        }
      });
      setMessage({ type: 'success', text: 'Worker assigned successfully!' });
      fetchShiftsAndWorkers(); // Refresh
    } catch (error) {
      console.error('Error assigning worker:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to assign worker' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWorker = async (shiftId, workerId) => {
    try {
      setSaving(true);
      await API.delete('/shifts/remove', {
        params: { shiftId, workerId }
      });
      setMessage({ type: 'success', text: 'Worker removed from shift' });
      fetchShiftsAndWorkers(); // Refresh
    } catch (error) {
      console.error('Error removing worker:', error);
      setMessage({ type: 'error', text: 'Failed to remove worker' });
    } finally {
      setSaving(false);
    }
  };

  const toggleShift = (shiftId) => {
    setActiveShifts(prev => ({
      ...prev,
      [shiftId]: !prev[shiftId]
    }));
  };

  const handleDragStart = (e, worker) => {
    setDraggedWorker(worker);
    e.dataTransfer.effectAllowed = 'copy';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedWorker(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (activeShifts[e.currentTarget.closest('.shift-item').dataset.shiftId]) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, shiftId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (draggedWorker && activeShifts[shiftId]) {
      handleAssignWorker(shiftId, draggedWorker.workerId);
      setDraggedWorker(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="shift-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="shift-modal-header">
          <h2>Manage Shifts - {job.jobName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {message && (
          <div className={`modal-alert modal-alert-${message.type}`}>
            {message.text}
            <button className="modal-alert-close" onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        <div className="shift-modal-body">
          {loading ? (
            <div className="modal-loading">Loading shifts...</div>
          ) : (
            <>
              {/* Worker Profiles at Top */}
              <div className="worker-profiles-section">
                <h3>Available Workers</h3>
                <p className="section-hint">Drag workers to active shifts</p>
                <div className="worker-circles">
                  {availableWorkers.map((worker) => (
                    <div
                      key={worker.workerId}
                      className="worker-circle"
                      draggable
                      onDragStart={(e) => handleDragStart(e, worker)}
                      onDragEnd={handleDragEnd}
                      title={`${worker.firstName} ${worker.lastName} - ${worker.position}`}
                    >
                      <div className="worker-avatar">
                        {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                      </div>
                      <div className="worker-circle-name">
                        {worker.firstName} {worker.lastName}
                      </div>
                      <div className="worker-circle-position">{worker.position}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shifts List */}
              <div className="shifts-list">
                {shifts.map((shift) => (
                  <div 
                    key={shift.id} 
                    className={`shift-item ${!activeShifts[shift.id] ? 'shift-inactive' : ''}`}
                    data-shift-id={shift.id}
                  >
                    <div className="shift-header">
                      <div className="shift-title-row">
                        <h3>{shift.name}</h3>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={!!activeShifts[shift.id]}
                            onChange={() => toggleShift(shift.id)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <span className="shift-time">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>

                    {/* Assigned Workers */}
                    <div 
                      className="assigned-workers" 
                      data-shift-id={shift.id}
                      onDragOver={handleDragOver} 
                      onDragLeave={handleDragLeave} 
                      onDrop={(e) => handleDrop(e, shift.id)}
                    >
                      <h4>Assigned Workers ({shift.totalWorkers || 0})</h4>
                      {shift.workerAssignments && shift.workerAssignments.length > 0 ? (
                        <div className="workers-grid">
                          {shift.workerAssignments.map((assignment) => (
                            <div key={assignment.id} className="worker-chip">
                              <span className="worker-chip-name">{assignment.workerName}</span>
                              <span className="worker-chip-position">{assignment.workerPosition}</span>
                              <button
                                className="worker-chip-remove"
                                onClick={() => handleRemoveWorker(shift.id, assignment.workerId)}
                                disabled={saving || !activeShifts[shift.id]}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-workers">No workers assigned yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="shift-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftAssignmentModal;
