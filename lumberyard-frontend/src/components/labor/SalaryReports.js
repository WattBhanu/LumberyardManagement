import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './LaborManagement.css';

const SalaryReports = ({ user }) => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({ items: [], totalPayroll: 0, averageSalary: 0 });
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('daily'); // 'daily' or 'monthly'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleBack = () => {
    // Finance Managers go back to Finance Dashboard, others go to Labor Dashboard
    if (user && user.role === 'FINANCE_MANAGER') {
      navigate('/finance');
    } else {
      navigate('/labor');
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, date, month, year]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let response;
      if (reportType === 'daily') {
        const [y, m, d] = date.split('-');
        response = await API.get(`/salary/reports/daily?year=${y}&month=${m}&day=${d}`);
      } else {
        response = await API.get(`/salary/reports/monthly?year=${year}&month=${month}`);
      }
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching salary report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="labor-mgmt-management">
      <div className="labor-mgmt-header">
        <button className="labor-mgmt-back-btn" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Dashboard
        </button>
        <h1>Salary Reports</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="daily">Daily Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
          {reportType === 'daily' ? (
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          ) : (
            <>
              <select 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                style={{ width: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </>
          )}
        </div>
      </div>

      <div className="labor-mgmt-summary-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="labor-mgmt-summary-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Total Payroll (LKR)</h4>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#2563eb' }}>{reportData.totalPayroll.toLocaleString()}</div>
        </div>
        <div className="labor-mgmt-summary-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Average Salary (LKR)</h4>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{reportData.averageSalary.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="labor-mgmt-table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="labor-mgmt-table">
            <thead>
              {reportType === 'daily' ? (
                <tr>
                  <th>Worker</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total Hours</th>
                  <th>Attendance %</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Daily Salary</th>
                </tr>
              ) : (
                <tr>
                  <th>Worker</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Total Hours</th>
                  <th>Attendance %</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Monthly Salary</th>
                </tr>
              )}
            </thead>
            <tbody>
              {reportData.items.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>No salary data available.</td>
                </tr>
              ) : (
                reportData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.workerName}</td>
                    <td>{item.presentDays}</td>
                    <td>{item.absentDays}</td>
                    <td>{item.totalHours.toFixed(2)}</td>
                    <td>{item.attendancePercentage.toFixed(0)}%</td>
                    <td>{item.position}</td>
                    <td>{item.department}</td>
                    <td style={{ fontWeight: '600' }}>{item.totalSalary.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalaryReports;
