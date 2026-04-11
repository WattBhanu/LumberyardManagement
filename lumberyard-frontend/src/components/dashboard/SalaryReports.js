import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './SalaryReports.css';

const SalaryReports = () => {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'report', 'history'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Attendance tab state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [managers, setManagers] = useState([]);
  
  // Report tab state
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportFilter, setReportFilter] = useState('ALL'); // 'ALL', 'WORKER', 'MANAGER'
  
  // History tab state
  const [reportHistory, setReportHistory] = useState([]);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Validate current user has email
  const getUserEmail = () => {
    return currentUser.email || currentUser.name || 'system';
  };

  // Load managers on mount
  useEffect(() => {
    loadManagers();
    loadReportHistory();
  }, []);

  // Load managers for attendance
  const loadManagers = async () => {
    try {
      const response = await API.get('/salary-reports/managers');
      setManagers(response.data);
    } catch (error) {
      console.error('Error loading managers:', error);
      setMessage('Failed to load managers');
      setMessageType('error');
    }
  };

  // Load attendance for selected date
  const loadAttendanceForDate = async (date) => {
    try {
      setLoading(true);
      const response = await API.get(`/salary-reports/attendance/${date}`);
      setManagers(response.data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date change for attendance
  const handleAttendanceDateChange = (date) => {
    setSelectedDate(date);
    loadAttendanceForDate(date);
  };

  // Toggle attendance for a manager
  const toggleAttendance = (managerId) => {
    setManagers(managers.map(m => {
      if (m.managerId === managerId) {
        return { ...m, isPresent: m.isPresent === true ? false : true };
      }
      return m;
    }));
  };

  // Mark attendance and generate report
  const handleMarkAttendance = async () => {
    try {
      setLoading(true);
      
      // 1. Save attendance
      await API.post('/salary-reports/attendance', {
        attendanceList: managers.filter(m => m.isPresent !== null).map(m => ({
          managerId: m.managerId,
          managerName: m.managerName,
          managerRole: m.managerRole,
          isPresent: m.isPresent
        })),
        date: selectedDate,
        markedBy: getUserEmail()
      });

      // 2. Generate report
      const reportResponse = await API.post('/salary-reports/generate', {
        reportDate: selectedDate,
        generatedBy: getUserEmail()
      });

      setMessage(`Attendance marked and report generated for ${selectedDate}`);
      setMessageType('success');
      
      // Load the report
      setCurrentReport(reportResponse.data.summary);
      
      // Reload history
      loadReportHistory();
      
      // Switch to report tab
      setActiveTab('report');
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage(error.response?.data?.error || 'Failed to mark attendance');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Load report for a date
  const loadReport = async (date) => {
    try {
      setLoading(true);
      const response = await API.get(`/salary-reports/${date}`);
      setCurrentReport(response.data);
      setMessageType('');
      setMessage('');
    } catch (error) {
      console.error('Error loading report:', error);
      if (error.response?.status === 404) {
        setMessage('No report found for this date. Please mark attendance first.');
        setMessageType('warning');
      } else {
        setMessage('Failed to load report');
        setMessageType('error');
      }
      setCurrentReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Load report history
  const loadReportHistory = async () => {
    try {
      const response = await API.get('/salary-reports/history');
      setReportHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // View report from history
  const viewReportFromHistory = (date) => {
    setReportDate(date);
    loadReport(date);
    setActiveTab('report');
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role label
  const getRoleLabel = (role) => {
    const roleMap = {
      'ADMIN': 'Admin',
      'FINANCE_MANAGER': 'Finance Manager',
      'LABOR_MANAGER': 'Labor Manager',
      'INVENTORY_OPERATIONS_MANAGER': 'Inventory Manager'
    };
    return roleMap[role] || role;
  };

  // Filter staff details
  const getFilteredStaff = () => {
    if (!currentReport || !currentReport.staffDetails) return [];
    if (reportFilter === 'ALL') return currentReport.staffDetails;
    return currentReport.staffDetails.filter(s => s.staffType === reportFilter);
  };

  return (
    <div className="salary-reports-container">
      <div className="salary-reports-header">
        <h1>📊 Daily Salary Reports</h1>
      </div>

      {message && (
        <div className={`message ${messageType}`} style={{ marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="salary-reports-tabs">
        <button 
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Mark Attendance
        </button>
        <button 
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          View Report
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Report History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* TAB 1: Mark Attendance */}
        {activeTab === 'attendance' && (
          <div className="attendance-tab">
            <div className="date-selector">
              <label>Select Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => handleAttendanceDateChange(e.target.value)}
              />
            </div>

            <div className="attendance-table-container">
              <h3>Manager Attendance for {formatDate(selectedDate)}</h3>
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Manager Name</th>
                    <th>Role</th>
                    <th>Present?</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.managerId}>
                      <td>{manager.managerName}</td>
                      <td>{getRoleLabel(manager.managerRole)}</td>
                      <td>
                        <button 
                          className={`attendance-toggle ${manager.isPresent === true ? 'present' : manager.isPresent === false ? 'absent' : 'unmarked'}`}
                          onClick={() => toggleAttendance(manager.managerId)}
                        >
                          {manager.isPresent === true ? '✓ Present' : manager.isPresent === false ? '✗ Absent' : '○ Not Marked'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="attendance-actions">
              <button 
                className="apply-btn"
                onClick={handleMarkAttendance}
                disabled={loading || managers.every(m => m.isPresent === null)}
              >
                {loading ? 'Processing...' : 'Apply & Generate Report'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: View Report */}
        {activeTab === 'report' && (
          <div className="report-tab">
            <div className="date-selector">
              <label>Select Date:</label>
              <input 
                type="date" 
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
              <button 
                className="load-report-btn"
                onClick={() => loadReport(reportDate)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load Report'}
              </button>
            </div>

            {currentReport && (
              <>
                {/* Summary Cards */}
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Workers Present</h4>
                    <p className="summary-value">{currentReport.totalWorkers || 0}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Workers Cost</h4>
                    <p className="summary-value">LKR {formatCurrency(currentReport.workerTotalCost)}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Managers Present</h4>
                    <p className="summary-value">{currentReport.totalManagers || 0}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Managers Cost</h4>
                    <p className="summary-value">LKR {formatCurrency(currentReport.managerTotalCost)}</p>
                  </div>
                  <div className="summary-card total">
                    <h4>Total Cost</h4>
                    <p className="summary-value">LKR {formatCurrency(currentReport.totalCost)}</p>
                  </div>
                </div>

                {/* Filter */}
                <div className="report-filter">
                  <label>Filter:</label>
                  <select 
                    value={reportFilter} 
                    onChange={(e) => setReportFilter(e.target.value)}
                  >
                    <option value="ALL">All Staff</option>
                    <option value="WORKER">Workers Only</option>
                    <option value="MANAGER">Managers Only</option>
                  </select>
                </div>

                {/* Staff Table */}
                <div className="staff-table-container">
                  <h3>Staff Details for {formatDate(reportDate)}</h3>
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Position/Role</th>
                        <th>Rate Type</th>
                        <th>Rate</th>
                        <th>Days/Hours</th>
                        <th>Total Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredStaff().length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                            No staff records found
                          </td>
                        </tr>
                      ) : (
                        getFilteredStaff().map((staff, index) => (
                          <tr key={index}>
                            <td>{staff.staffName}</td>
                            <td>
                              <span className={`staff-badge ${staff.staffType.toLowerCase()}`}>
                                {staff.staffType}
                              </span>
                            </td>
                            <td>{staff.positionRole}</td>
                            <td>{staff.rateType}</td>
                            <td>LKR {formatCurrency(staff.rateAmount)}</td>
                            <td>{staff.hoursOrDays}</td>
                            <td className="salary-cell">
                              LKR {formatCurrency(staff.totalSalary)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: Report History */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <h3>Report History</h3>
            {reportHistory.length === 0 ? (
              <div className="no-data-message">
                <p>No reports generated yet</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                  Mark manager attendance to generate the first report
                </p>
              </div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Workers</th>
                    <th>Managers</th>
                    <th>Worker Cost</th>
                    <th>Manager Cost</th>
                    <th>Total Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map((report, index) => (
                    <tr key={index}>
                      <td>{formatDate(report.reportDate)}</td>
                      <td>{report.totalWorkers || 0}</td>
                      <td>{report.totalManagers || 0}</td>
                      <td>LKR {formatCurrency(report.workerTotalCost)}</td>
                      <td>LKR {formatCurrency(report.managerTotalCost)}</td>
                      <td className="total-cost">LKR {formatCurrency(report.totalCost)}</td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => viewReportFromHistory(report.reportDate)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryReports;
