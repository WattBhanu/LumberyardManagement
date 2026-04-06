import React, { useState, useEffect } from 'react';
import API from '../../../services/api';
import './ScheduleTab.css';
import JobSquare from './JobSquare';
import ShiftAssignmentModal from './ShiftAssignmentModal';

const ScheduleTab = () => {
  const [selectedDate, setSelectedDate] = useState(''); // Empty = all dates
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const url = selectedDate 
        ? `/shifts/schedule?date=${selectedDate}`
        : '/shifts/schedule'; // No date param = all dates
      const response = await API.get(url);
      console.log('Schedule loaded:', response.data);
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const getSortedJobs = () => {
    if (!schedule || !schedule.jobs) return [];
    
    // Filter out expired jobs (only show today and future jobs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeJobs = schedule.jobs.filter(job => {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);
      return jobDate >= today;
    });
    
    // Sort by date by default
    let sortedJobs = [...activeJobs];
    sortedJobs.sort((a, b) => a.date.localeCompare(b.date));
    
    return sortedJobs;
  };

  const sortedJobs = getSortedJobs();

  return (
    <div className="schedule-tab">
      {/* Controls */}
      <div className="schedule-controls">
        <div className="schedule-control-group">
          <label>Date Filter:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="schedule-date-input"
          >
            <option value="">All Dates</option>
            {Array.from({ length: 15 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateStr = date.toISOString().split('T')[0];
              const displayDate = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <option key={dateStr} value={dateStr}>
                  {displayDate} ({dateStr})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="schedule-loading">Loading schedule...</div>
      ) : sortedJobs.length === 0 ? (
        <div className="schedule-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <p>{selectedDate ? 'No jobs scheduled for this date' : 'No jobs found'}</p>
          <small>{selectedDate ? 'Try selecting a different date' : 'Create a job to get started'}</small>
        </div>
      ) : (
        <div className="jobs-grid">
          {sortedJobs.map((job) => (
            <JobSquare
              key={job.id}
              job={job}
              onClick={() => handleJobClick(job)}
            />
          ))}
        </div>
      )}

      {/* Shift Assignment Modal */}
      {showModal && selectedJob && (
        <ShiftAssignmentModal
          job={selectedJob}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchSchedule();
          }}
        />
      )}
    </div>
  );
};

export default ScheduleTab;
