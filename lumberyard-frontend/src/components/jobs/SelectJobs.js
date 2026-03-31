import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import './SelectJobs.css';
import WorkerSelector from './WorkerSelector';

const SelectJobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showWorkerSelector, setShowWorkerSelector] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchUnassignedJobs();
  }, []);

  const fetchUnassignedJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching unassigned jobs...');
      const today = new Date().toISOString().split('T')[0];
      const response = await API.get(`/jobs/unassigned?date=${today}`);
      console.log('Unassigned jobs loaded:', response.data);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching unassigned jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorkers = (job, role) => {
    console.log('Assigning workers for job:', job.jobId, 'Role:', role);
    setSelectedJob(job);
    setSelectedRole(role);
    setShowWorkerSelector(true);
  };

  const handleWorkerAssignmentComplete = () => {
    console.log('Worker assignment complete, refreshing jobs...');
    setShowWorkerSelector(false);
    setSelectedJob(null);
    setSelectedRole(null);
    fetchUnassignedJobs(); // Refresh the list
  };

  const getProgressPercentage = (assigned, required) => {
    if (!required || required === 0) return 0;
    return Math.round((assigned / required) * 100);
  };

  if (showWorkerSelector && selectedJob) {
    return (
      <WorkerSelector
        job={selectedJob}
        role={selectedRole}
        onComplete={handleWorkerAssignmentComplete}
        onCancel={() => {
          setShowWorkerSelector(false);
          setSelectedJob(null);
          setSelectedRole(null);
        }}
      />
    );
  }

  return (
    <div className="select-jobs-page">
      {/* Header */}
      <div className="sj-header">
        <button className="sj-back-btn" onClick={() => navigate('/labor/jobs/assignment')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="sj-header-text">
          <h1>Select Job to Assign Workers</h1>
          <span className="sj-badge">JOBS NEEDING WORKERS</span>
        </div>
      </div>

      {/* Jobs List */}
      <div className="sj-table-card">
        <div className="sj-table-header">
          <h2>Available Jobs</h2>
          <span className="sj-count">Total: {jobs.length}</span>
        </div>

        {loading ? (
          <div className="sj-loading">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="sj-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>All jobs are fully staffed!</p>
            <small>No jobs need workers at the moment.</small>
          </div>
        ) : (
          <div className="sj-table-wrap">
            <table className="sj-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Job Name</th>
                  <th>Date</th>
                  <th>Employees Progress</th>
                  <th>Supervisors Progress</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  // Get all position requirements
                  const positionReqs = job.positionRequirements || {};
                  const totalPositions = Object.keys(positionReqs).length;
                  
                  return (
                    <tr key={job.id} className="sj-row">
                      <td className="sj-job-id">{job.jobId}</td>
                      <td className="sj-job-name">{job.jobName}</td>
                      <td>{new Date(job.date).toLocaleDateString()}</td>
                      <td colSpan="2" style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                        {totalPositions > 0 ? (
                          <div>
                            <strong>Total Workers Needed:</strong> {Object.values(positionReqs).reduce((a, b) => a + b, 0)}
                          </div>
                        ) : (
                          <div>
                            Employees: {job.requiredEmployees}, Supervisors: {job.requiredSupervisors}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`sj-status-badge sj-status-${job.status.toLowerCase()}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div className="sj-action-buttons">
                          {totalPositions > 0 ? (
                            // Show button for each position type
                            Object.entries(positionReqs).map(([position, required]) => {
                              const assigned = job.assignedPositionsCount?.[position] || 0;
                              if (assigned < required) {
                                return (
                                  <button 
                                    key={position}
                                    className="sj-btn-assign sj-btn-position"
                                    onClick={() => handleAssignWorkers(job, position)}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                      <circle cx="9" cy="7" r="4"></circle>
                                      <line x1="23" y1="11" x2="17" y2="11"></line>
                                    </svg>
                                    Add {position}s ({assigned}/{required})
                                  </button>
                                );
                              }
                              return null;
                            })
                          ) : (
                            // Legacy support for employees/supervisors
                            <>
                              {(job.assignedEmployeesCount || 0) < job.requiredEmployees && (
                                <button 
                                  className="sj-btn-assign sj-btn-employees"
                                  onClick={() => handleAssignWorkers(job, 'EMPLOYEE')}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                  </svg>
                                  Add Employees
                                </button>
                              )}
                              {(job.assignedSupervisorsCount || 0) < job.requiredSupervisors && (
                                <button 
                                  className="sj-btn-assign sj-btn-supervisors"
                                  onClick={() => handleAssignWorkers(job, 'SUPERVISOR')}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                  </svg>
                                  Add Supervisors
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectJobs;
