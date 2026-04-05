import React, { useState, useEffect } from 'react';
import API from '../../../services/api';
import './HistoryTab.css';

const HistoryTab = () => {
  const [expiredJobs, setExpiredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchExpiredJobs();
  }, []);

  const fetchExpiredJobs = async () => {
    try {
      setLoading(true);
      const response = await API.get('/shifts/history/expired');
      console.log('Expired jobs response:', response);
      console.log('Expired jobs data:', response.data);
      
      // Ensure we're setting an array
      let jobsData = [];
      if (Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with an error property, don't set it as jobs
        if (response.data.error) {
          console.error('API returned error:', response.data.error);
          jobsData = [];
        } else {
          // Try to extract array from object if possible
          jobsData = [];
        }
      }
      
      setExpiredJobs(jobsData);
    } catch (error) {
      console.error('Error fetching expired jobs:', error);
      setExpiredJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId, jobName) => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete this expired job?\n\nJob: "${jobName}"\n\nThis action CANNOT be undone!`
    );
    
    if (!confirmed) return;

    try {
      await API.delete(`/shifts/history/${jobId}`);
      alert(`Job "${jobName}" deleted successfully`);
      fetchExpiredJobs(); // Refresh list
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. You must be an admin to perform this action.');
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  return (
    <div className="history-tab">
      <div className="history-header-info">
        <h2>Expired Jobs History</h2>
        <p>Jobs with dates in the past are automatically moved here</p>
      </div>

      {loading ? (
        <div className="history-loading">Loading history...</div>
      ) : expiredJobs.length === 0 ? (
        <div className="history-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p>No expired jobs</p>
          <small>All current jobs are active or in the future</small>
        </div>
      ) : (
        <div className="history-jobs-list">
          <table className="history-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Job Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Workers Assigned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(expiredJobs) && expiredJobs.map((job) => (
                <tr key={job.id} className="history-row">
                  <td className="history-job-id">{job.jobId}</td>
                  <td className="history-job-name">{job.jobName}</td>
                  <td className="history-date">{new Date(job.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`history-status-badge history-status-${job.status?.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="history-workers">
                    {job.assignedWorkers?.length || 0} worker(s)
                  </td>
                  <td className="history-actions">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetails(job)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View Details
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteJob(job.id, job.jobName)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete (Admin Only)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Job Details Modal */}
      {showDetails && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="history-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-header">
              <h2>{selectedJob.jobName}</h2>
              <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
            </div>

            <div className="details-modal-body">
              <div className="details-section">
                <h3>Job Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Job ID:</span>
                  <span className="detail-value">{selectedJob.jobId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(selectedJob.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-status detail-status-${selectedJob.status?.toLowerCase()}`}>
                    {selectedJob.status}
                  </span>
                </div>
              </div>

              <div className="workers-section">
                <h3>Assigned Workers & Shifts</h3>
                {selectedJob.assignedWorkers && Array.isArray(selectedJob.assignedWorkers) && selectedJob.assignedWorkers.length > 0 ? (
                  <div className="workers-history-list">
                    {selectedJob.assignedWorkers.map((worker, index) => (
                      <div key={index} className="worker-history-item">
                        <div className="worker-history-header">
                          <span className="worker-history-name">{worker.workerName}</span>
                          <span className="worker-history-position">{worker.position}</span>
                        </div>
                        <div className="worker-history-shifts">
                          <small>Assigned shifts will appear here</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-workers-history">No workers were assigned to this job</p>
                )}
              </div>
            </div>

            <div className="details-modal-footer">
              <button className="btn-close" onClick={() => setShowDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
