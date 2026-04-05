import React from 'react';

const JobSquare = ({ job, onClick }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="job-square" onClick={onClick}>
      <div className="job-square-header">
        <span className="job-square-id">{job.jobId}</span>
        <span 
          className="job-square-status"
          style={{ backgroundColor: getStatusColor(job.status) }}
        >
          {job.status?.replace('_', ' ')}
        </span>
      </div>
      
      <div className="job-square-body">
        <h3 className="job-square-name">{job.jobName}</h3>
        <p className="job-square-date">{new Date(job.date).toLocaleDateString()}</p>
        
        {/* Show assigned workers by position */}
        {job.assignedWorkers && job.assignedWorkers.length > 0 ? (
          <div className="job-square-requirements">
            {(() => {
              console.log('Assigned workers:', job.assignedWorkers); // Debug log
              // Group assigned workers by position
              const workersByPosition = {};
              job.assignedWorkers.forEach(worker => {
                const pos = worker.position || 'Worker';
                if (!workersByPosition[pos]) {
                  workersByPosition[pos] = 0;
                }
                workersByPosition[pos]++;
              });
              
              console.log('Workers by position:', workersByPosition); // Debug log
              
              // Display each position with count
              return Object.entries(workersByPosition).map(([position, count]) => (
                <div key={position} className="job-square-position">
                  <span className="position-name">{position}</span>
                  <span className="position-count">{count}</span>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="job-square-requirements">
            <div className="job-square-position-empty">
              <span className="position-name">No workers assigned yet</span>
              {console.log('No workers - job data:', job)} {/* Debug log */}
            </div>
          </div>
        )}
      </div>
      
      <div className="job-square-footer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        <span>Manage Shifts</span>
      </div>
    </div>
  );
};

export default JobSquare;
