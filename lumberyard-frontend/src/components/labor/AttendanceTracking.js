import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './AttendanceTracking.css';

const AttendanceTracking = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    workerId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    arrivalTime: '',
    departureTime: '',
    note: ''
  });

  useEffect(() => {
    fetchWorkers();
    fetchAttendance();
  }, [selectedDate]);

  const fetchWorkers = async () => {
    try {
      console.log('Fetching workers from /api/workers/all...');
      // Try the main workers endpoint first
      const response = await API.get('/workers/all');
      console.log('Workers response:', response.data);
      console.log('First worker sample:', response.data[0]);
      
      // More lenient filter - just check for id and active status (case-insensitive)
      const validWorkers = Array.isArray(response.data) 
        ? response.data.filter(w => {
            const hasId = w && (w.id || w.workerId);
            const status = (w.status || '').toUpperCase();
            const isActive = status === 'ACTIVE' || status === 'ACTIVE '; // handle trailing spaces
            console.log(`Worker: ${w.firstName} ${w.lastName}, ID: ${w.id || w.workerId}, Status: '${status}', Active: ${isActive}`);
            return hasId && isActive;
          })
        : [];
      
      console.log('Valid workers after filter:', validWorkers.length, 'workers');
      console.log('Filtered workers:', validWorkers);
      setWorkers(validWorkers);
    } catch (error) {
      console.error('Error fetching workers from /workers/all:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Try alternative endpoint as fallback
      try {
        console.log('Trying fallback endpoint /api/labor/workers/all...');
        const fallbackResponse = await API.get('/labor/workers/all');
        const validWorkers = Array.isArray(fallbackResponse.data) 
          ? fallbackResponse.data.filter(w => w && (w.id || w.workerId) && (w.status || '').toUpperCase() === 'ACTIVE')
          : [];
        console.log('Fallback workers:', validWorkers.length, 'workers');
        setWorkers(validWorkers);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError.message);
        setWorkers([]);
      }
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/attendance/date/${selectedDate}`);
      const validAttendance = Array.isArray(response.data) ? response.data : [];
      setAttendance(validAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setMessage({ type: 'error', text: 'Failed to load attendance records.' });
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/attendance', formData);
      setMessage({ type: 'success', text: 'Attendance recorded successfully!' });
      setShowModal(false);
      setEditingRecord(null);
      fetchAttendance();
    } catch (error) {
      setMessage({ type: 'error', text: "Failed to record attendance. Check if it's a duplicate." });
    }
  };

  const handleUpdate = (record) => {
    setEditingRecord(record);
    setFormData({
      workerId: record.worker.id || record.worker.workerId,
      date: record.date,
      status: record.status,
      arrivalTime: record.arrivalTime || '',
      departureTime: record.departureTime || '',
      note: record.note || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({
      workerId: '',
      date: selectedDate,
      status: 'Present',
      arrivalTime: '',
      departureTime: '',
      note: ''
    });
    setShowModal(true);
  };

  const totalWorkers = attendance.length;
  const totalHours = attendance.reduce((sum, r) => sum + (r.workedHours || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="at-page">

      {/* ── HEADER ── */}
      <div className="at-header">
        <button className="at-back-btn" onClick={() => navigate('/labor')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="at-header-text">
          <h1>Attendance Tracking</h1>
          <span className="at-badge">ATTENDANCE MANAGEMENT</span>
        </div>
        <div className="at-header-right">
          <input
            className="at-date-input"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <button className="at-add-btn" onClick={openAddModal}>+ Record Attendance</button>
        </div>
      </div>

      {/* ── ALERT ── */}
      {message && (
        <div className={`at-alert at-alert-${message.type}`}>
          {message.text}
          <button className="at-alert-close" onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* ── SUMMARY STATS ── */}
      <div className="at-summary">
        <div className="at-summary-row">
          <span className="at-summary-label">Total Workers:</span>
          <span className="at-summary-value">{totalWorkers}</span>
        </div>
        <div className="at-summary-row">
          <span className="at-summary-label">Total Hours:</span>
          <span className="at-summary-value">{totalHours.toFixed(2)}</span>
        </div>
      </div>

      {/* ── ATTENDANCE TABLE ── */}
      <div className="at-table-card">
        {loading ? (
          <div className="at-loading">Loading...</div>
        ) : (
          <div className="at-table-wrap">
            <table className="at-table">
              <thead>
                <tr>
                  <th>WORKER</th>
                  <th>DATE</th>
                  <th>ARRIVAL<br/>TIME</th>
                  <th>DEPARTURE<br/>TIME</th>
                  <th>WORKED<br/>HOURS</th>
                  <th>POSITION</th>
                  <th>DEPARTMENT</th>
                  <th>STATUS</th>
                  <th>NOTES</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="at-empty">No attendance records for this date.</td>
                  </tr>
                ) : (
                  attendance.map(record => (
                    <tr key={record.id}>
                      <td className="at-worker-name">
                        {record.worker.firstName} {record.worker.lastName}
                      </td>
                      <td className="at-date-cell">{formatDate(record.date)}</td>
                      <td>{record.arrivalTime || '—'}</td>
                      <td>{record.departureTime || '—'}</td>
                      <td className="at-hours">
                        {record.workedHours != null ? record.workedHours.toFixed(2) : '—'}
                      </td>
                      <td>{record.worker.position}</td>
                      <td>{record.worker.department}</td>
                      <td>
                        {record.status === 'Present' ? (
                          <span className="at-status at-status-present">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            PRESENT
                          </span>
                        ) : record.status === 'Absent' ? (
                          <span className="at-status at-status-absent">
                            ✕ ABSENT
                          </span>
                        ) : (
                          <span className="at-status at-status-halfday">
                            {record.status}
                          </span>
                        )}
                      </td>
                      <td className="at-notes">{record.note || 'No notes'}</td>
                      <td>
                        <button className="at-update-btn" onClick={() => handleUpdate(record)}>
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="at-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="at-modal">
            <div className="at-modal-header">
              <h2>{editingRecord ? 'Update Attendance Record' : 'Record Attendance'}</h2>
              <button className="at-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="at-form">
              <div className="at-form-grid">
                <div className="at-field at-field-full">
                  <label>Worker *</label>
                  <select name="workerId" value={formData.workerId} onChange={handleInputChange} required>
                    <option value="">Select a worker</option>
                    {workers.length > 0 ? (
                      workers.map((w, index) => (
                        <option key={w.id || w.workerId || `worker-${index}`} value={w.id || w.workerId}>
                          {w.firstName} {w.lastName} ({w.position})
                        </option>
                      ))
                    ) : (
                      <option disabled>No workers available</option>
                    )}
                  </select>
                </div>
                <div className="at-field">
                  <label>Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div className="at-field">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half-Day">Half-Day</option>
                  </select>
                </div>
                <div className="at-field">
                  <label>Arrival Time</label>
                  <input type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleInputChange} />
                </div>
                <div className="at-field">
                  <label>Departure Time</label>
                  <input type="time" name="departureTime" value={formData.departureTime} onChange={handleInputChange} />
                </div>
                <div className="at-field at-field-full">
                  <label>Note</label>
                  <textarea name="note" value={formData.note} onChange={handleInputChange} rows="2" placeholder="Any notes..." />
                </div>
              </div>
              <div className="at-modal-footer">
                <button type="button" className="at-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="at-save-btn">
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
