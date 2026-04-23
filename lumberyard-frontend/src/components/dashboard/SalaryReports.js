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
  const [historyFilters, setHistoryFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showFilteredResults, setShowFilteredResults] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState([]);
  
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
      setHistoryLoading(true);
      const response = await API.get('/salary-reports/history');
      const historyData = response.data;
      
      // Map history data to a consistent format
      const formattedHistory = historyData.map(report => ({
        ...report,
        // Ensure workerTotalCost and managerTotalCost are numbers for calculations
        workerTotalCost: parseFloat(report.workerTotalCost || 0),
        managerTotalCost: parseFloat(report.managerTotalCost || 0),
        totalCost: parseFloat(report.totalCost || 0),
        totalWorkers: report.totalWorkers || 0,
        totalManagers: report.totalManagers || 0
      }));
      
      setReportHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setHistoryLoading(false);
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

  // Download Daily Report as PDF
  const handleDownloadDailyPDF = () => {
    if (!currentReport) return;

    const doc = new jsPDF();
    const dateStr = formatDate(reportDate);
    const title = `Staff Salary Report - ${dateStr}`;

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 14, 20);

    // Summary Info
    doc.setFontSize(11);
    doc.setTextColor(100);
    const workersPresent = workerReportData?.items?.length || 0;
    const managersPresent = currentReport.totalManagers || 0;
    const workerCost = formatCurrency(workerReportData?.totalPayroll);
    const managerCost = formatCurrency(currentReport.managerTotalCost);
    const totalCost = formatCurrency((workerReportData?.totalPayroll || 0) + (currentReport.managerTotalCost || 0));

    doc.text(`Workers Present: ${workersPresent} (LKR ${workerCost})`, 14, 30);
    doc.text(`Managers Present: ${managersPresent} (LKR ${managerCost})`, 14, 37);
    doc.text(`Total Daily Cost: LKR ${totalCost}`, 14, 44);

    let currentY = 50;

    // Manager Table
    const managerData = currentReport.staffDetails
      .filter(s => s.staffType === 'MANAGER')
      .map(s => [
        s.staffName,
        s.positionRole,
        s.rateType,
        formatCurrency(s.rateAmount),
        s.hoursOrDays,
        formatCurrency(s.totalSalary)
      ]);

    if (managerData.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Manager Details", 14, currentY);
      
      autoTable(doc, {
        head: [['Name', 'Role', 'Rate Type', 'Rate', 'Days', 'Salary (LKR)']],
        body: managerData,
        startY: currentY + 5,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Worker Table
    const workerData = (workerReportData?.items || []).map(w => [
      w.workerName,
      w.position,
      w.department,
      w.totalHours.toFixed(2),
      `${w.attendancePercentage.toFixed(0)}%`,
      formatCurrency(w.totalSalary)
    ]);

    if (workerData.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Worker Details", 14, currentY);
      
      autoTable(doc, {
        head: [['Name', 'Position', 'Department', 'Hours', 'Attnd %', 'Salary (LKR)']],
        body: workerData,
        startY: currentY + 5,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });
    }

    doc.save(`Salary_Report_${reportDate}.pdf`);
  };

  // Generic Print function
  const handlePrint = () => {
    window.print();
  };

  // Handle History Search with Date Range
  const handleHistorySearch = async () => {
    if (historyFilters.startDate > historyFilters.endDate) {
      setMessage("Start Date must be before or equal to End Date");
      setMessageType("error");
      return;
    }

    try {
      setHistoryLoading(true);
      const response = await API.get(`/salary/report-history?startDate=${historyFilters.startDate}&endDate=${historyFilters.endDate}`);
      
      if (response.data.success) {
        setFilteredHistory(response.data.reports);
        setShowFilteredResults(true);
        setMessage("");
      } else {
        setMessage(response.data.message || "No report data available for selected period");
        setMessageType("warning");
        setFilteredHistory([]);
        setShowFilteredResults(false);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setMessage("Failed to load report history");
      setMessageType("error");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Download History Report as PDF
  const handleDownloadHistoryPDF = () => {
    const dataToExport = showFilteredResults ? filteredHistory : reportHistory;
    if (!dataToExport || dataToExport.length === 0) return;

    const doc = new jsPDF();
    const title = "Salary Report History";
    const dateRange = showFilteredResults 
      ? `Report Period: ${historyFilters.startDate} to ${historyFilters.endDate}`
      : "Full Report History";

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(dateRange, 14, 28);

    // Calculate totals for export
    const totalWorkerCost = dataToExport.reduce((sum, r) => sum + (parseFloat(r.workerTotalCost) || 0), 0);
    const totalManagerCost = dataToExport.reduce((sum, r) => sum + (parseFloat(r.managerTotalCost) || 0), 0);
    const grandTotal = totalWorkerCost + totalManagerCost;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Days: ${dataToExport.length}`, 14, 40);
    doc.text(`Total Worker Cost: LKR ${totalWorkerCost.toLocaleString()}`, 14, 47);
    doc.text(`Total Manager Cost: LKR ${totalManagerCost.toLocaleString()}`, 14, 54);
    doc.text(`Grand Total: LKR ${grandTotal.toLocaleString()}`, 14, 61);

    const tableColumn = ["Date", "Workers", "Managers", "Worker Cost", "Manager Cost", "Total Cost"];
    const tableRows = dataToExport.map(r => [
      formatDate(r.reportDate),
      r.totalWorkers || 0,
      r.totalManagers || 0,
      (parseFloat(r.workerTotalCost) || 0).toLocaleString(),
      (parseFloat(r.managerTotalCost) || 0).toLocaleString(),
      (parseFloat(r.totalCost) || 0).toLocaleString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Salary_History_${new Date().getTime()}.pdf`);
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
              {currentReport && (
                <div className="report-action-buttons">
                  <button className="secondary-btn print-btn" onClick={handlePrint}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Print Report
                  </button>
                  <button className="secondary-btn pdf-btn" onClick={handleDownloadDailyPDF}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            {currentReport && (
              <div id="daily-report-section" className="printable-report">
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
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Report History */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <h3>Report History</h3>
            
            <div className="history-filter-section no-print">
              <div className="filter-group">
                <label>START DATE:</label>
                <input 
                  type="date" 
                  value={historyFilters.startDate}
                  onChange={(e) => setHistoryFilters({...historyFilters, startDate: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>END DATE:</label>
                <input 
                  type="date" 
                  value={historyFilters.endDate}
                  onChange={(e) => setHistoryFilters({...historyFilters, endDate: e.target.value})}
                />
              </div>
              <div className="filter-actions">
                <button 
                  className="generate-report-btn"
                  onClick={handleHistorySearch}
                  disabled={historyLoading}
                >
                  {historyLoading ? 'Processing...' : 'Filter History'}
                </button>
                {showFilteredResults && (
                  <button 
                    className="secondary-btn"
                    onClick={() => {
                      setShowFilteredResults(false);
                      setMessage("");
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {(showFilteredResults ? filteredHistory : reportHistory).length > 0 ? (
              <div className="history-results-container printable-report">
                <div className="results-header">
                  <h4>{showFilteredResults ? `Filtered Results: ${historyFilters.startDate} to ${historyFilters.endDate}` : "All History Records"}</h4>
                  <div className="report-action-buttons no-print">
                    <button className="secondary-btn print-btn" onClick={handlePrint}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                      Print
                    </button>
                    <button className="secondary-btn pdf-btn" onClick={handleDownloadHistoryPDF}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>

                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Total Worker Cost</h4>
                    <p className="summary-value">LKR {(showFilteredResults ? filteredHistory : reportHistory).reduce((sum, r) => sum + (parseFloat(r.workerTotalCost) || 0), 0).toLocaleString()}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Total Manager Cost</h4>
                    <p className="summary-value">LKR {(showFilteredResults ? filteredHistory : reportHistory).reduce((sum, r) => sum + (parseFloat(r.managerTotalCost) || 0), 0).toLocaleString()}</p>
                  </div>
                  <div className="summary-card total">
                    <h4>Grand Total Cost</h4>
                    <p className="summary-value">LKR {(showFilteredResults ? filteredHistory : reportHistory).reduce((sum, r) => sum + (parseFloat(r.totalCost) || 0), 0).toLocaleString()}</p>
                  </div>
                </div>

                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Workers</th>
                      <th>Managers</th>
                      <th>Worker Cost</th>
                      <th>Manager Cost</th>
                      <th>Total Cost</th>
                      <th className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showFilteredResults ? filteredHistory : reportHistory).map((report, index) => (
                      <tr key={index}>
                        <td>{formatDate(report.reportDate)}</td>
                        <td>{report.totalWorkers || 0}</td>
                        <td>{report.totalManagers || 0}</td>
                        <td>LKR {formatCurrency(report.workerTotalCost)}</td>
                        <td>LKR {formatCurrency(report.managerTotalCost)}</td>
                        <td className="total-cost">LKR {formatCurrency(report.totalCost)}</td>
                        <td className="no-print">
                          <button 
                            className="view-btn"
                            onClick={() => viewReportFromHistory(report.reportDate)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data-message">
                <p>{historyLoading ? 'Loading records...' : 'No historical records found.'}</p>
                {!historyLoading && !showFilteredResults && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Mark attendance to generate reports.
                  </p>
                )}
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
};

export default SalaryReports;
