import React, { useState, useEffect } from 'react';
import API from '../../../services/api';
import './WorkerTab.css';

const WorkerTab = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'position'
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerDetails, setWorkerDetails] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      // Get all shifts with workers
      const response = await API.get('/shifts');
      console.log('All shifts:', response.data);
      
      // Extract unique workers from all shifts
      const workerMap = new Map();
      response.data.forEach(shift => {
        if (shift.workerAssignments) {
          shift.workerAssignments.forEach(assignment => {
            if (!workerMap.has(assignment.workerId)) {
              workerMap.set(assignment.workerId, {
                ...assignment,
                shifts: []
              });
            }
            workerMap.get(assignment.workerId).shifts.push({
              shiftName: assignment.shiftName,
              jobName: assignment.jobName,
              date: assignment.date
            });
          });
        }
      });
      
      const workersList = Array.from(workerMap.values());
      console.log('Workers list:', workersList);
      setWorkers(workersList);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerClick = async (worker) => {
    setSelectedWorker(worker);
    // Fetch detailed worker information
    try {
      const response = await API.get(`/shifts/worker/${worker.workerId}`);
      console.log('Worker details:', response.data);
      setWorkerDetails({
        ...worker,
        assignments: response.data
      });
    } catch (error) {
      console.error('Error fetching worker details:', error);
    }
  };

  const getSortedWorkers = () => {
    let sortedWorkers = [...workers];
    
    if (sortBy === 'position') {
      sortedWorkers.sort((a, b) => (a.workerPosition || '').localeCompare(b.workerPosition || ''));
    } else {
      sortedWorkers.sort((a, b) => (a.workerName || '').localeCompare(b.workerName || ''));
    }
    
    return sortedWorkers;
  };

  const sortedWorkers = getSortedWorkers();

  return (
    <div className="worker-tab">
      <div className="worker-controls">
        <div className="worker-control-group">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="worker-sort-select"
          >
            <option value="name">Name</option>
            <option value="position">Position</option>
          </select>
        </div>
        <span className="worker-count">Total Workers: {workers.length}</span>
      </div>

      {loading ? (
        <div className="worker-loading">Loading workers...</div>
      ) : workers.length === 0 ? (
        <div className="worker-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          <p>No workers assigned to shifts yet</p>
          <small>Assign workers to shifts from the Schedule tab</small>
        </div>
      ) : (
        <div className="workers-grid-list">
          {sortedWorkers.map((worker) => (
            <div 
              key={worker.workerId} 
              className={`worker-card ${selectedWorker?.workerId === worker.workerId ? 'worker-card-selected' : ''}`}
              onClick={() => handleWorkerClick(worker)}
            >
              <div className="worker-card-header">
                <h3>{worker.workerName}</h3>
                <span className="worker-position-badge">{worker.workerPosition}</span>
              </div>
              <div className="worker-card-body">
                <p className="worker-job">{worker.jobName}</p>
                <p className="worker-shifts-count">
                  {worker.shifts?.length || 0} shift(s) assigned
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Worker Details Modal */}
      {workerDetails && (
        <div className="modal-overlay" onClick={() => setWorkerDetails(null)}>
          <div className="worker-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="worker-details-header">
              <h2>{workerDetails.workerName}</h2>
              <button className="modal-close" onClick={() => setWorkerDetails(null)}>×</button>
            </div>
            
            <div className="worker-details-body">
              <div className="worker-info-section">
                <h3>Information</h3>
                <div className="info-row">
                  <span className="info-label">Position:</span>
                  <span className="info-value">{workerDetails.workerPosition}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Assignments:</span>
                  <span className="info-value">{workerDetails.assignments?.length || 0}</span>
                </div>
              </div>

              <div className="assignments-section">
                <h3>Assigned Shifts & Jobs</h3>
                {workerDetails.assignments && workerDetails.assignments.length > 0 ? (
                  <div className="assignments-list">
                    {workerDetails.assignments.map((assignment) => (
                      <div key={assignment.id} className="assignment-item">
                        <div className="assignment-header">
                          <span className="assignment-shift">{assignment.shiftName} Shift</span>
                          <span className="assignment-date">{new Date(assignment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="assignment-job">{assignment.jobName}</div>
                        {assignment.colleagues && assignment.colleagues.length > 0 && (
                          <div className="assignment-colleagues">
                            <small>Working with:</small>
                            <span>{assignment.colleagues.map(c => c.name).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-assignments">No shift assignments found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerTab;
