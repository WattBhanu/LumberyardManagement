import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../services/api';
import './SalaryReports.css';

const SalaryReports = () => {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'report', 'history'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  
  // Attendance tab state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [managers, setManagers] = useState([]);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
  const managersLoadedRef = useRef(false);
  
  // Report tab state
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportFilter, setReportFilter] = useState('ALL'); // 'ALL', 'WORKER', 'MANAGER'
  const [workerReportData, setWorkerReportData] = useState(null);
  
  // History tab state
  const [reportHistory, setReportHistory] = useState([]);
  
  // Salary Report tab state (date range reporting)
  const [salaryReportFilters, setSalaryReportFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [salaryReportData, setSalaryReportData] = useState(null);
  const [salaryReportLoading, setSalaryReportLoading] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Validate current user has email
  const getUserEmail = () => {
    return currentUser.email || currentUser.name || 'system';
  };

  // Load managers on mount
  useEffect(() => {
    loadManagers();
    loadReportHistory();
    managersLoadedRef.current = false; // Reset ref on mount
  }, []);

  // Load attendance from backend when managers are loaded or date changes
  useEffect(() => {
    if (managers.length > 0 && !managersLoadedRef.current) {
      console.log('Managers loaded, now fetching attendance for:', selectedDate);
      managersLoadedRef.current = true;
      loadAttendanceForDate(selectedDate);
    }
  }, [managers, selectedDate]);

  // Load managers for attendance
  const loadManagers = async () => {
    try {
      const response = await API.get('/salary-reports/managers');
      console.log('Managers loaded from API:', response.data);
      setManagers(response.data);
    } catch (error) {
      console.error('Error loading managers:', error);
      setMessage('Failed to load managers');
      setMessageType('error');
    }
  };

  // Load attendance from backend for selected date
  const loadAttendanceForDate = async (date) => {
    try {
      console.log('Loading attendance for date:', date);
      setLoading(true);
      const response = await API.get(`/salary-reports/attendance/${date}`);
      const attendanceData = response.data;
      console.log('Attendance data from backend:', attendanceData);
      
      // Update managers with attendance status from backend
      if (attendanceData && attendanceData.length > 0) {
        setHasExistingAttendance(true);
        // Create a new array to avoid reference issues
        const updatedManagers = managers.map(m => {
          const attendanceRecord = attendanceData.find(a => a.managerId === m.managerId);
          if (attendanceRecord) {
            console.log(`Updating manager ${m.managerName}: isPresent = ${attendanceRecord.isPresent}`);
            return { ...m, isPresent: attendanceRecord.isPresent };
          }
          return m;
        });
        setManagers(updatedManagers);
        console.log('Managers after applying attendance:', updatedManagers);
      } else {
        setHasExistingAttendance(false);
        console.log('No attendance data found for this date');
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      setHasExistingAttendance(false);
      // If no attendance found for this date, that's okay - managers will have null isPresent
    } finally {
      setLoading(false);
    }
  };

  // Handle date change for attendance
  const handleAttendanceDateChange = (date) => {
    setSelectedDate(date);
  };

  // Toggle attendance for a manager
  const toggleAttendance = (managerId, value) => {
    setManagers(prevManagers => prevManagers.map(m => {
      if (m.managerId === managerId) {
        return { ...m, isPresent: value };
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
      
      // Reload attendance to show updated state
      loadAttendanceForDate(selectedDate);
      
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
      setReportLoading(true);
      
      // Load consolidated report (managers)
      const response = await API.get(`/salary-reports/${date}`);
      setCurrentReport(response.data);
      
      // Load worker salary report
      const [year, month, day] = date.split('-');
      const workerResponse = await API.get(`/salary/reports/daily?year=${year}&month=${parseInt(month)}&day=${parseInt(day)}`);
      setWorkerReportData(workerResponse.data);
      
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
      setWorkerReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  // Load report history
  const loadReportHistory = async () => {
    try {
      const response = await API.get('/salary-reports/history');
      const historyData = response.data;
      
      // Enhance each history entry with worker data
      const enhancedHistory = await Promise.all(
        historyData.map(async (report) => {
          try {
            // Fetch worker report for this date
            const [year, month, day] = report.reportDate.split('-');
            const workerResponse = await API.get(`/salary/reports/daily?year=${year}&month=${parseInt(month)}&day=${parseInt(day)}`);
            const workerData = workerResponse.data;
            
            // Calculate combined total
            const workerTotalCost = workerData?.totalPayroll || 0;
            const managerTotalCost = report.managerTotalCost || 0;
            const combinedTotal = workerTotalCost + managerTotalCost;
            
            return {
              ...report,
              workerTotalCost: workerTotalCost,
              workerCount: workerData?.items?.length || 0,
              combinedTotalCost: combinedTotal
            };
          } catch (error) {
            console.error(`Error fetching worker data for ${report.reportDate}:`, error);
            // Return original report with zero worker data
            return {
              ...report,
              workerTotalCost: 0,
              workerCount: 0,
              combinedTotalCost: report.managerTotalCost || 0
            };
          }
        })
      );
      
      setReportHistory(enhancedHistory);
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

  // Salary Report filter change
  const handleSalaryReportFilterChange = (e) => {
    const { name, value } = e.target;
    setSalaryReportFilters({ ...salaryReportFilters, [name]: value });
  };

  // Generate salary report for date range
  const handleGenerateSalaryReport = async () => {
    setSalaryReportLoading(true);
    setSalaryReportData(null);
    try {
      const { startDate, endDate } = salaryReportFilters;
      const response = await API.get(`/salary-reports/report?startDate=${startDate}&endDate=${endDate}`);
      const reportData = response.data;
      
      if (!reportData.success) {
        setSalaryReportData(reportData);
        return;
      }
      
      // Enhance each report entry with worker data from the worker salary API
      const enhancedReports = await Promise.all(
        reportData.reports.map(async (report) => {
          try {
            // Fetch worker report for this date
            const [year, month, day] = report.reportDate.split('-');
            const workerResponse = await API.get(`/salary/reports/daily?year=${year}&month=${parseInt(month)}&day=${parseInt(day)}`);
            const workerData = workerResponse.data;
            
            // Get worker cost and count from worker API
            const workerTotalCost = workerData?.totalPayroll || 0;
            const workerCount = workerData?.items?.length || 0;
            
            return {
              ...report,
              workerTotalCost: workerTotalCost,
              totalWorkers: workerCount
            };
          } catch (error) {
            console.error(`Error fetching worker data for ${report.reportDate}:`, error);
            // Return original report with existing worker data (from backend calculation)
            return report;
          }
        })
      );
      
      // Recalculate totals with enhanced worker data
      const totalWorkerCost = enhancedReports.reduce((sum, r) => sum + (r.workerTotalCost || 0), 0);
      const totalManagerCost = enhancedReports.reduce((sum, r) => sum + (r.managerTotalCost || 0), 0);
      const grandTotal = totalWorkerCost + totalManagerCost;
      
      setSalaryReportData({
        ...reportData,
        reports: enhancedReports,
        totalWorkerCost: totalWorkerCost,
        totalManagerCost: totalManagerCost,
        grandTotal: grandTotal
      });
    } catch (error) {
      console.error('Error generating salary report:', error);
      setMessage('Failed to generate salary report');
      setMessageType('error');
    } finally {
      setSalaryReportLoading(false);
    }
  };

  // Print salary report
  const handlePrintSalaryReport = () => {
    window.print();
  };

  // Download salary report as PDF
  const handleDownloadSalaryPDF = () => {
    if (!salaryReportData || !salaryReportData.success) return;

    const doc = new jsPDF();
    const title = "Salary Report";
    const dateRange = `Period: ${salaryReportData.startDate} to ${salaryReportData.endDate}`;

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(dateRange, 14, 30);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Days: ${salaryReportData.totalDays || 0}`, 14, 42);
    doc.text(`Total Worker Cost: LKR ${(salaryReportData.totalWorkerCost || 0).toLocaleString()}`, 14, 49);
    doc.text(`Total Manager Cost: LKR ${(salaryReportData.totalManagerCost || 0).toLocaleString()}`, 14, 56);
    doc.text(`Grand Total: LKR ${(salaryReportData.grandTotal || 0).toLocaleString()}`, 14, 63);

    const tableColumn = ["Date", "Workers", "Managers", "Worker Cost (LKR)", "Manager Cost (LKR)", "Total Cost (LKR)"];
    const tableRows = [];

    salaryReportData.reports.forEach(r => {
      const reportData = [
        r.reportDate,
        r.totalWorkers || 0,
        r.totalManagers || 0,
        (r.workerTotalCost || 0).toLocaleString(),
        (r.managerTotalCost || 0).toLocaleString(),
        ((r.workerTotalCost || 0) + (r.managerTotalCost || 0)).toLocaleString()
      ];
      tableRows.push(reportData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 72,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Salary_Report_${salaryReportData.startDate}_${salaryReportData.endDate}.pdf`);
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
        <button 
          className={`tab-button ${activeTab === 'salary-report' ? 'active' : ''}`}
          onClick={() => setActiveTab('salary-report')}
        >
          Salary Report
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
              <div className="attendance-header">
                <h3>Manager Attendance for {formatDate(selectedDate)}</h3>
                {hasExistingAttendance && (
                  <span className="saved-badge">✓ Attendance Saved</span>
                )}
              </div>
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Manager Name</th>
                    <th>Role</th>
                    <th>Present</th>
                    <th>Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.managerId}>
                      <td>{manager.managerName}</td>
                      <td>{getRoleLabel(manager.managerRole)}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={manager.isPresent === true}
                          onChange={(e) => toggleAttendance(manager.managerId, e.target.checked)}
                          className="attendance-checkbox present-checkbox"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={manager.isPresent === false}
                          onChange={(e) => toggleAttendance(manager.managerId, e.target.checked ? false : null)}
                          className="attendance-checkbox absent-checkbox"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="attendance-actions">
              {hasExistingAttendance ? (
                <button 
                  className="update-btn"
                  onClick={handleMarkAttendance}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Attendance'}
                </button>
              ) : (
                <button 
                  className="apply-btn"
                  onClick={handleMarkAttendance}
                  disabled={loading || managers.every(m => m.isPresent === null)}
                >
                  {loading ? 'Processing...' : 'Apply & Generate Report'}
                </button>
              )}
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
                disabled={reportLoading}
              >
                {reportLoading ? 'Loading...' : 'Load Report'}
              </button>
            </div>

            {currentReport && (
              <>
                {/* Summary Cards */}
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Workers Present</h4>
                    <p className="summary-value">{workerReportData?.items?.length || 0}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Workers Cost</h4>
                    <p className="summary-value">LKR {formatCurrency(workerReportData?.totalPayroll)}</p>
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
                    <p className="summary-value">LKR {formatCurrency((workerReportData?.totalPayroll || 0) + (currentReport.managerTotalCost || 0))}</p>
                  </div>
                </div>

                {/* Managers Table */}
                <div className="staff-table-container">
                  <h3>Manager Details for {formatDate(reportDate)}</h3>
                  {currentReport.staffDetails && currentReport.staffDetails.filter(s => s.staffType === 'MANAGER').length > 0 ? (
                    <table className="staff-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Rate Type</th>
                          <th>Daily Rate</th>
                          <th>Days</th>
                          <th>Total Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentReport.staffDetails
                          .filter(s => s.staffType === 'MANAGER')
                          .map((staff, index) => (
                            <tr key={index}>
                              <td>{staff.staffName}</td>
                              <td>
                                <span className="staff-badge manager">
                                  {staff.positionRole}
                                </span>
                              </td>
                              <td>{staff.rateType}</td>
                              <td>LKR {formatCurrency(staff.rateAmount)}</td>
                              <td>{staff.hoursOrDays}</td>
                              <td className="salary-cell">
                                LKR {formatCurrency(staff.totalSalary)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-text">No manager attendance records for this date</p>
                  )}
                </div>

                {/* Workers Table */}
                <div className="staff-table-container">
                  <h3>Worker Details for {formatDate(reportDate)}</h3>
                  {workerReportData && workerReportData.items && workerReportData.items.length > 0 ? (
                    <table className="staff-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Position</th>
                          <th>Department</th>
                          <th>Total Hours</th>
                          <th>Attendance %</th>
                          <th>Total Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workerReportData.items.map((worker, index) => (
                          <tr key={index}>
                            <td>{worker.workerName}</td>
                            <td>{worker.position}</td>
                            <td>{worker.department}</td>
                            <td>{worker.totalHours.toFixed(2)}</td>
                            <td>{worker.attendancePercentage.toFixed(0)}%</td>
                            <td className="salary-cell">
                              LKR {formatCurrency(worker.totalSalary)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-text">No worker attendance records for this date</p>
                  )}
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
                      <td>{report.workerCount || report.totalWorkers || 0}</td>
                      <td>{report.totalManagers || 0}</td>
                      <td>LKR {formatCurrency(report.workerTotalCost)}</td>
                      <td>LKR {formatCurrency(report.managerTotalCost)}</td>
                      <td className="total-cost">LKR {formatCurrency(report.combinedTotalCost || report.totalCost)}</td>
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

        {/* TAB 4: Salary Report (Date Range) */}
        {activeTab === 'salary-report' && (
          <div className="salary-report-tab">
            <h3>Generate Salary Report</h3>
            
            <div className="report-filters-section">
              <div className="filter-group">
                <label>Start Date:</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={salaryReportFilters.startDate}
                  onChange={handleSalaryReportFilterChange}
                />
              </div>
              <div className="filter-group">
                <label>End Date:</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={salaryReportFilters.endDate}
                  onChange={handleSalaryReportFilterChange}
                />
              </div>
              <button 
                className="generate-report-btn"
                onClick={handleGenerateSalaryReport}
                disabled={salaryReportLoading}
              >
                {salaryReportLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>

            {salaryReportData && salaryReportData.success && (
              <div className="printable-report">
                <div className="salary-report-results">
                {/* Summary Cards */}
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Total Days</h4>
                    <p className="summary-value">{salaryReportData.totalDays || 0}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Total Worker Cost</h4>
                    <p className="summary-value">LKR {(salaryReportData.totalWorkerCost || 0).toLocaleString()}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Total Manager Cost</h4>
                    <p className="summary-value">LKR {(salaryReportData.totalManagerCost || 0).toLocaleString()}</p>
                  </div>
                  <div className="summary-card total">
                    <h4>Grand Total</h4>
                    <p className="summary-value">LKR {(salaryReportData.grandTotal || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="report-actions">
                  <button className="print-btn" onClick={handlePrintSalaryReport}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Print Report
                  </button>
                  <button className="pdf-btn" onClick={handleDownloadSalaryPDF}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download PDF
                  </button>
                </div>

                {/* Report Table */}
                <div className="report-table-container">
                  <h4>Salary Details</h4>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Workers</th>
                        <th>Managers</th>
                        <th>Worker Cost</th>
                        <th>Manager Cost</th>
                        <th>Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryReportData.reports.map((report, index) => (
                        <tr key={index}>
                          <td>{formatDate(report.reportDate)}</td>
                          <td>{report.totalWorkers || 0}</td>
                          <td>{report.totalManagers || 0}</td>
                          <td>LKR {(report.workerTotalCost || 0).toLocaleString()}</td>
                          <td>LKR {(report.managerTotalCost || 0).toLocaleString()}</td>
                          <td className="total-cost">
                            LKR {((report.workerTotalCost || 0) + (report.managerTotalCost || 0)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            )}

            {!salaryReportData && !salaryReportLoading && (
              <div className="no-data-message">
                <p>Select a date range and click "Generate Report"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryReports;
