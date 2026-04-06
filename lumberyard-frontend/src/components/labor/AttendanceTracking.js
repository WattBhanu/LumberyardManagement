import React, { useState, useEffect, useRef } from 'react';
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
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'with-time', 'without-time'

  const [formData, setFormData] = useState({
    workerId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    arrivalTime: '',
    departureTime: '',
    note: ''
  });

  // State for datetime pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  
  // Refs for picker positioning
  const dateInputRef = useRef(null);
  const arrivalTimeInputRef = useRef(null);
  const departureTimeInputRef = useRef(null);

  useEffect(() => {
    fetchWorkers();
    fetchAttendance();
  }, [selectedDate]);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDatePicker || showArrivalTimePicker || showDepartureTimePicker) {
        // Don't close if clicking on the picker itself
        if (!e.target.closest('.at-picker-popup')) {
          setShowDatePicker(false);
          setShowArrivalTimePicker(false);
          setShowDepartureTimePicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, showArrivalTimePicker, showDepartureTimePicker]);

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
    
    // Clear arrival/departure times when status is changed to Absent
    if (name === 'status' && value === 'Absent') {
      setFormData(prev => ({
        ...prev,
        status: value,
        arrivalTime: '',
        departureTime: ''
      }));
    }
  };

  // Date picker helpers
  const openDatePicker = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX });
    setShowDatePicker(true);
    setShowArrivalTimePicker(false);
    setShowDepartureTimePicker(false);
  };

  const selectDate = (dateStr) => {
    setFormData({ ...formData, date: dateStr });
    setShowDatePicker(false);
  };

  // Time picker helpers
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const openArrivalTimePicker = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX });
    
    // Pre-fill with current arrival time if exists
    if (formData.arrivalTime) {
      const [hour24, minute] = formData.arrivalTime.split(':');
      const hour24Num = parseInt(hour24);
      const period = hour24Num >= 12 ? 'PM' : 'AM';
      const hour12 = hour24Num % 12 || 12;
      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(minute);
      setSelectedPeriod(period);
    } else {
      setSelectedHour('12');
      setSelectedMinute('00');
      setSelectedPeriod('AM');
    }
    
    setShowArrivalTimePicker(true);
    setShowDatePicker(false);
    setShowDepartureTimePicker(false);
  };

  const openDepartureTimePicker = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX });
    
    // Pre-fill with current departure time if exists
    if (formData.departureTime) {
      const [hour24, minute] = formData.departureTime.split(':');
      const hour24Num = parseInt(hour24);
      const period = hour24Num >= 12 ? 'PM' : 'AM';
      const hour12 = hour24Num % 12 || 12;
      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(minute);
      setSelectedPeriod(period);
    } else {
      setSelectedHour('12');
      setSelectedMinute('00');
      setSelectedPeriod('AM');
    }
    
    setShowDepartureTimePicker(true);
    setShowDatePicker(false);
    setShowArrivalTimePicker(false);
  };

  const selectTime = (field) => {
    // Convert 12-hour format to 24-hour format for storage
    let hour24 = parseInt(selectedHour);
    if (selectedPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    const timeStr = `${hour24.toString().padStart(2, '0')}:${selectedMinute}`;
    setFormData({ ...formData, [field]: timeStr });
    setShowArrivalTimePicker(false);
    setShowDepartureTimePicker(false);
  };

  // Generate hours (1-12)
  const generateHours = () => {
    const hours = [];
    for (let i = 1; i <= 12; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  };

  // Generate minutes (00-59)
  const generateMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      minutes.push(i.toString().padStart(2, '0'));
    }
    return minutes;
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const currentDate = formData.date ? new Date(formData.date) : new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: Absent workers cannot have times
    if (formData.status === 'Absent') {
      if (formData.arrivalTime || formData.departureTime) {
        setMessage({ 
          type: 'error', 
          text: 'Absent workers cannot have arrival or departure times.' 
        });
        return;
      }
    }
    
    // Validate times for present workers
    if (formData.arrivalTime && formData.departureTime && formData.status !== 'Absent') {
      const arrival = new Date(`1970-01-01T${formData.arrivalTime}`);
      const departure = new Date(`1970-01-01T${formData.departureTime}`);
      
      if (departure < arrival) {
        setMessage({ 
          type: 'error', 
          text: 'Departure time cannot be earlier than arrival time. Worked hours cannot be negative.' 
        });
        return;
      }
      
      // Check if worked hours exceed 24
      const diffHours = (departure - arrival) / (1000 * 60 * 60);
      if (diffHours > 24) {
        setMessage({ 
          type: 'error', 
          text: 'Worked hours cannot exceed 24 hours.' 
        });
        return;
      }
    }
    
    try {
      await API.post('/attendance', formData);
      setMessage({ type: 'success', text: 'Attendance recorded successfully!' });
      setShowModal(false);
      setEditingRecord(null);
      fetchAttendance();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || "Failed to record attendance. Check if it's a duplicate." });
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

  // Filter attendance records based on time filter
  const getFilteredAttendance = () => {
    if (timeFilter === 'all') return attendance;
    if (timeFilter === 'with-time') {
      return attendance.filter(r => r.arrivalTime && r.departureTime);
    }
    if (timeFilter === 'without-time') {
      return attendance.filter(r => !r.arrivalTime || !r.departureTime);
    }
    return attendance;
  };

  const filteredAttendance = getFilteredAttendance();

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
          <select 
            className="at-time-filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            title="Filter by time entries"
          >
            <option value="all">All Records</option>
            <option value="with-time">With Time Entries</option>
            <option value="without-time">Without Time Entries</option>
          </select>
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
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="at-empty">
                      {timeFilter === 'all' 
                        ? 'No attendance records for this date.' 
                        : timeFilter === 'with-time'
                        ? 'No records with time entries.'
                        : 'No records without time entries.'}
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map(record => (
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
                  <div className="at-datetime-input-wrapper">
                    <input 
                      ref={dateInputRef}
                      type="text"
                      className="at-datetime-display"
                      value={formatDateForDisplay(formData.date)}
                      onClick={openDatePicker}
                      readOnly
                      placeholder="Select date"
                      required
                    />
                    <span className="at-datetime-icon">📅</span>
                  </div>
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
                  <div className="at-datetime-input-wrapper">
                    <input 
                      ref={arrivalTimeInputRef}
                      type="text"
                      className="at-datetime-display"
                      value={formData.arrivalTime || ''}
                      onClick={openArrivalTimePicker}
                      readOnly
                      disabled={formData.status === 'Absent'}
                      placeholder={formData.status === 'Absent' ? 'Not applicable' : 'Select time'}
                    />
                    <span className="at-datetime-icon">🕐</span>
                  </div>
                </div>
                <div className="at-field">
                  <label>Departure Time</label>
                  <div className="at-datetime-input-wrapper">
                    <input 
                      ref={departureTimeInputRef}
                      type="text"
                      className="at-datetime-display"
                      value={formData.departureTime || ''}
                      onClick={openDepartureTimePicker}
                      readOnly
                      disabled={formData.status === 'Absent'}
                      placeholder={formData.status === 'Absent' ? 'Not applicable' : 'Select time'}
                    />
                    <span className="at-datetime-icon">🕔</span>
                  </div>
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

      {/* Date Picker Popup */}
      {showDatePicker && (
        <div 
          className="at-picker-popup at-date-picker"
          style={{ top: pickerPosition.top, left: pickerPosition.left }}
        >
          <div className="at-picker-header">
            <button 
              className="at-picker-nav"
              onClick={() => {
                const currentDate = new Date(formData.date);
                currentDate.setMonth(currentDate.getMonth() - 1);
                setFormData({ ...formData, date: currentDate.toISOString().split('T')[0] });
              }}
            >
              ‹
            </button>
            <h3>
              {new Date(formData.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              className="at-picker-nav"
              onClick={() => {
                const currentDate = new Date(formData.date);
                currentDate.setMonth(currentDate.getMonth() + 1);
                setFormData({ ...formData, date: currentDate.toISOString().split('T')[0] });
              }}
            >
              ›
            </button>
          </div>
          <div className="at-picker-grid">
            <div className="at-picker-day-header">Sun</div>
            <div className="at-picker-day-header">Mon</div>
            <div className="at-picker-day-header">Tue</div>
            <div className="at-picker-day-header">Wed</div>
            <div className="at-picker-day-header">Thu</div>
            <div className="at-picker-day-header">Fri</div>
            <div className="at-picker-day-header">Sat</div>
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                className={`at-picker-day ${!day ? 'at-picker-day-empty' : ''} ${
                  day && day.toISOString().split('T')[0] === formData.date ? 'at-picker-day-selected' : ''
                }`}
                onClick={() => day && selectDate(day.toISOString().split('T')[0])}
                disabled={!day}
              >
                {day ? day.getDate() : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Arrival Time Picker Popup */}
      {showArrivalTimePicker && (
        <div 
          className="at-picker-popup at-time-picker"
          style={{ top: pickerPosition.top, left: pickerPosition.left }}
        >
          <div className="at-picker-header">
            <h3>Select Arrival Time</h3>
          </div>
          <div className="at-clock-picker">
            <div className="at-clock-column">
              <label>Hour</label>
              <div className="at-clock-scroll">
                {generateHours().map((hour) => (
                  <button
                    key={hour}
                    className={`at-clock-option ${hour === selectedHour ? 'at-clock-selected' : ''}`}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            <div className="at-clock-separator">:</div>
            <div className="at-clock-column">
              <label>Minute</label>
              <div className="at-clock-scroll">
                {generateMinutes().map((minute) => (
                  <button
                    key={minute}
                    className={`at-clock-option ${minute === selectedMinute ? 'at-clock-selected' : ''}`}
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
            <div className="at-clock-column at-clock-period-column">
              <label>Period</label>
              <div className="at-clock-period-buttons">
                <button
                  className={`at-clock-period-btn ${selectedPeriod === 'AM' ? 'at-clock-period-selected' : ''}`}
                  onClick={() => setSelectedPeriod('AM')}
                >
                  AM
                </button>
                <button
                  className={`at-clock-period-btn ${selectedPeriod === 'PM' ? 'at-clock-period-selected' : ''}`}
                  onClick={() => setSelectedPeriod('PM')}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
          <div className="at-clock-footer">
            <button 
              className="at-clock-confirm-btn"
              onClick={() => selectTime('arrivalTime')}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Departure Time Picker Popup */}
      {showDepartureTimePicker && (
        <div 
          className="at-picker-popup at-time-picker"
          style={{ top: pickerPosition.top, left: pickerPosition.left }}
        >
          <div className="at-picker-header">
            <h3>Select Departure Time</h3>
          </div>
          <div className="at-clock-picker">
            <div className="at-clock-column">
              <label>Hour</label>
              <div className="at-clock-scroll">
                {generateHours().map((hour) => (
                  <button
                    key={hour}
                    className={`at-clock-option ${hour === selectedHour ? 'at-clock-selected' : ''}`}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            <div className="at-clock-separator">:</div>
            <div className="at-clock-column">
              <label>Minute</label>
              <div className="at-clock-scroll">
                {generateMinutes().map((minute) => (
                  <button
                    key={minute}
                    className={`at-clock-option ${minute === selectedMinute ? 'at-clock-selected' : ''}`}
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
            <div className="at-clock-column at-clock-period-column">
              <label>Period</label>
              <div className="at-clock-period-buttons">
                <button
                  className={`at-clock-period-btn ${selectedPeriod === 'AM' ? 'at-clock-period-selected' : ''}`}
                  onClick={() => setSelectedPeriod('AM')}
                >
                  AM
                </button>
                <button
                  className={`at-clock-period-btn ${selectedPeriod === 'PM' ? 'at-clock-period-selected' : ''}`}
                  onClick={() => setSelectedPeriod('PM')}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
          <div className="at-clock-footer">
            <button 
              className="at-clock-confirm-btn"
              onClick={() => selectTime('departureTime')}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
