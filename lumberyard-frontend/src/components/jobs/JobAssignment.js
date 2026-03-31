import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './JobAssignment.css';
import CreateJobModal from './CreateJobModal';
import EditJobModal from './EditJobModal';

const JobAssignment = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs...');
      const response = await API.get('/jobs');
      console.log('Jobs loaded:', response.data);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setMessage({ type: 'error', text: 'Failed to load jobs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewJob = () => {
    setShowCreateModal(true);
  };

  const handleSelectJob = () => {
    console.log('Navigating to Select Jobs page');
    navigate('/labor/jobs/select');
  };

  const toggleExpandJob = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleEditJob = (job) => {
    console.log('Editing job:', job);
    setEditingJob(job);
    setShowEditModal(true);
  };

  const handleDeleteJob = async (jobId, jobName) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete this job?\n\n` +
      `Job: "${jobName}"\n\n` +
      `This will:\n` +
      `• Delete the job permanently\n` +
      `• Free all assigned workers\n\n` +
      `This action CANNOT be undone!`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/jobs/${jobId}`);
      setMessage({ 
        type: 'success', 
        text: `Job "${jobName}" and all worker assignments deleted successfully! Workers have been freed.` 
      });
      // Refresh the jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to delete job.' 
      });
    }
  };

  return (
    <div className="job-assignment-page">
      {/* Header */}
      <div className="ja-header">
        <button className="ja-back-btn" onClick={() => navigate('/labor/jobs')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="ja-header-text">
          <h1>Job Assignment Dashboard</h1>
          <span className="ja-badge">WORKFORCE MANAGEMENT</span>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`ja-alert ja-alert-${message.type}`}>
          {message.text}
          <button className="ja-alert-close" onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="ja-action-buttons">
        <button className="ja-btn-primary" onClick={handleNewJob}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Job
        </button>
        <button className="ja-btn-secondary" onClick={handleSelectJob}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Select
        </button>
      </div>

      {/* Jobs Table */}
      <div className="ja-table-card">
        <div className="ja-table-header">
          <h2>All Job Assignments</h2>
          <span className="ja-count">Total: {jobs.length}</span>
        </div>

        {loading ? (
          <div className="ja-loading">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="ja-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>No jobs created yet</p>
            <button className="ja-create-first" onClick={handleNewJob}>
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="ja-table-wrap">
            <table className="ja-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>Job ID</th>
                  <th>Job Name</th>
                  <th>Date</th>
                  <th>Positions Required</th>
                  <th>Total Workers</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const positionReqs = job.positionRequirements || {};
                  const totalPositions = Object.keys(positionReqs).length;
                  const totalWorkersNeeded = Object.values(positionReqs).reduce((a, b) => a + b, 0);
                  const totalAssigned = (job.assignedEmployeesCount || 0) + (job.assignedSupervisorsCount || 0);
                  const isExpanded = expandedJob === job.id;
                  
                  return (
                    <React.Fragment key={job.id}>
                      <tr key={job.id} className={`ja-status-${job.status.toLowerCase()}`}>
                        <td>
                          <button 
                            className="ja-expand-btn" 
                            onClick={() => toggleExpandJob(job.id)}
                            disabled={!job.assignedWorkers || job.assignedWorkers.length === 0}
                          >
                            {job.assignedWorkers && job.assignedWorkers.length > 0 ? (
                              isExpanded ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              )
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>−</span>
                            )}
                          </button>
                        </td>
                        <td className="ja-job-id">{job.jobId}</td>
                        <td className="ja-job-name">{job.jobName}</td>
                        <td>{new Date(job.date).toLocaleDateString()}</td>
                        <td>
                          {totalPositions > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {Object.entries(positionReqs).map(([position, qty]) => (
                                <span key={position} className="ja-position-badge">
                                  {position}: {qty}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span>
                              Emp: {job.requiredEmployees}, Sup: {job.requiredSupervisors}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="ja-worker-count">
                            {totalPositions > 0 ? (
                              `${totalAssigned} / ${totalWorkersNeeded}`
                            ) : (
                              `${totalAssigned} / ${job.requiredEmployees + job.requiredSupervisors}`
                            )}
                          </span>
                        </td>
                        <td>
                          <span className={`ja-status-badge ja-status-${job.status.toLowerCase()}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <div className="ja-action-buttons-cell">
                            <button 
                              className="ja-btn-edit" 
                              onClick={() => handleEditJob(job)}
                              title="Edit Job"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button 
                              className="ja-btn-delete" 
                              onClick={() => handleDeleteJob(job.id, job.jobName)}
                              title="Delete Job"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && job.assignedWorkers && job.assignedWorkers.length > 0 && (
                        <tr className="ja-expanded-row">
                          <td colSpan="8">
                            <div className="ja-workers-detail">
                              <h4 style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Assigned Workers ({job.assignedWorkers.length})
                              </h4>
                              <div className="ja-workers-grid">
                                {job.assignedWorkers.map((worker, index) => (
                                  <div key={index} className="ja-worker-card">
                                    <div className="ja-worker-info">
                                      <div className="ja-worker-avatar">
                                        {worker.workerName.charAt(0)}
                                      </div>
                                      <div className="ja-worker-details">
                                        <div className="ja-worker-name">{worker.workerName}</div>
                                        <div className="ja-worker-meta">
                                          <span className="ja-worker-id">ID: {worker.workerId}</span>
                                          {worker.position && (
                                            <span className="ja-worker-position">{worker.position}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <span className={`ja-role-badge ja-role-${worker.role.toLowerCase()}`}>
                                      {worker.role}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newJob) => {
            setJobs([...jobs, newJob]);
            setMessage({ 
              type: 'success', 
              text: `Job "${newJob.jobName}" created successfully!` 
            });
          }}
        />
      )}

      {/* Edit Job Modal */}
      {showEditModal && editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedJob) => {
            // Update the job in the list
            setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
            setMessage({ 
              type: 'success', 
              text: `Job "${updatedJob.jobName}" updated successfully!` 
            });
            setShowEditModal(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default JobAssignment;
