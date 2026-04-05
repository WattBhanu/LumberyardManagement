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
  const [selectedDate, setSelectedDate] = useState(''); // Empty string means "all dates"

  useEffect(() => {
    fetchUnassignedJobs();
  }, [selectedDate]);

  const fetchUnassignedJobs = async () => {
    try {
      setLoading(true);
      if (selectedDate) {
        console.log('Fetching unassigned jobs for specific date:', selectedDate);
        const response = await API.get(`/jobs/unassigned?date=${selectedDate}`);
        console.log('Unassigned jobs loaded:', response.data);
        console.log('Number of jobs needing workers:', response.data.length);
        response.data.forEach(job => {
          console.log(`Job ${job.jobId}:`, {
            date: job.date,
            positionRequirements: job.positionRequirements,
            requiredEmployees: job.requiredEmployees,
            requiredSupervisors: job.requiredSupervisors,
            assignedPositionsCount: job.assignedPositionsCount,
            assignedEmployeesCount: job.assignedEmployeesCount,
            assignedSupervisorsCount: job.assignedSupervisorsCount,
            status: job.status
          });
        });
        setJobs(response.data);
      } else {
        // Fetch all jobs and filter those that need workers
        console.log('Fetching ALL unassigned jobs (no date filter)...');
        const response = await API.get('/jobs');
        console.log('All jobs loaded:', response.data);
        
        // Get today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        // Filter jobs that need workers AND are not expired (today or future)
        const jobsNeedingWorkers = response.data.filter(job => {
          // First, filter out expired jobs (before today)
          const jobDate = new Date(job.date);
          jobDate.setHours(0, 0, 0, 0);
          if (jobDate < today) {
            return false; // Skip expired jobs
          }
          
          // Then check if job needs workers
          const positionReqs = job.positionRequirements || {};
          const totalPositions = Object.keys(positionReqs).length;
          
          if (totalPositions > 0) {
            // Position-based: check if any position needs workers
            return Object.entries(positionReqs).some(([position, required]) => {
              const assigned = job.assignedPositionsCount?.[position] || 0;
              return assigned < required;
            });
          } else {
            // Legacy: check employees or supervisors
            return (job.assignedEmployeesCount || 0) < (job.requiredEmployees || 0) ||
                   (job.assignedSupervisorsCount || 0) < (job.requiredSupervisors || 0);
          }
        });
        
        console.log('Jobs needing workers (filtered):', jobsNeedingWorkers.length);
        setJobs(jobsNeedingWorkers);
      }
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
        <div className="sj-date-filter">
          <label htmlFor="job-date-filter">Filter by Date:</label>
          <select
            id="job-date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="sj-date-input"
          >
            <option value="">All Dates (Next 2 Weeks)</option>
            {(() => {
              const options = [];
              const today = new Date();
              for (let i = 0; i <= 14; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                const dateString = date.toISOString().split('T')[0];
                const displayDate = date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                });
                const todayLabel = i === 0 ? ' (Today)' : (i === 1 ? ' (Tomorrow)' : '');
                options.push(
                  <option key={dateString} value={dateString}>
                    {displayDate}{todayLabel}
                  </option>
                );
              }
              return options;
            })()}
          </select>
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
            <p>
              {selectedDate 
                ? `No jobs need workers on ${new Date(selectedDate).toLocaleDateString()}`
                : 'No jobs need workers in the next 2 weeks!'}
            </p>
            <small>
              {selectedDate 
                ? (selectedDate === new Date().toISOString().split('T')[0]
                    ? "All jobs for today are fully staffed! Try selecting a different date."
                    : "All jobs for this date are fully staffed! Try a different date.")
                : "All jobs are fully staffed for the next 2 weeks. Create a new job or check back later."}
            </small>
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
                  const hasLegacyRequirements = (job.requiredEmployees || 0) > 0 || (job.requiredSupervisors || 0) > 0;
                  
                  console.log(`Rendering job ${job.jobId}:`, {
                    totalPositions,
                    positionReqs,
                    hasLegacyRequirements,
                    requiredEmployees: job.requiredEmployees,
                    requiredSupervisors: job.requiredSupervisors,
                    assignedPositionsCount: job.assignedPositionsCount,
                    assignedEmployeesCount: job.assignedEmployeesCount,
                    assignedSupervisorsCount: job.assignedSupervisorsCount
                  });
                  
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
