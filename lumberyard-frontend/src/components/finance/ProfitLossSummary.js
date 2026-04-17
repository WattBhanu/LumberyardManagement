import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './ProfitLossSummary.css';

const ProfitLossSummary = ({ token }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('calculations'); // 'calculations' or 'reporting'
  
  // Data states
  const [incomeData, setIncomeData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  
  // Calculated P&L
  const [profitLoss, setProfitLoss] = useState(null);
  const [hasInsufficientData, setHasInsufficientData] = useState(false);

  // Reporting states
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    calculateProfitLoss();
  }, [selectedDate]);

  const calculateProfitLoss = async () => {
    setLoading(true);
    setHasInsufficientData(false);
    setProfitLoss(null);
    
    try {
      // Fetch all income transactions and filter by date
      const incomeResponse = await API.get('/finance/transactions');
      const allTransactions = incomeResponse.data;
      const filteredIncome = allTransactions.filter(t => t.date === selectedDate);
      const totalIncome = filteredIncome.reduce((sum, t) => sum + (t.amount || 0), 0);
      setIncomeData({ totalRevenue: totalIncome, count: filteredIncome.length });
      
      // Fetch all expenses and filter by date
      const expenseResponse = await API.get('/finance/expenses');
      const allExpenses = expenseResponse.data;
      const filteredExpenses = allExpenses.filter(e => e.date.toString() === selectedDate);
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      setExpenseData({ totalExpenses: totalExpenses, count: filteredExpenses.length });
      
      // Fetch salary for selected date
      const [year, month, day] = selectedDate.split('-');
      const salaryResponse = await API.get(`/salary/reports/daily?year=${year}&month=${parseInt(month)}&day=${parseInt(day)}`);
      setSalaryData(salaryResponse.data);
      
      const totalSalary = salaryResponse.data?.totalPayroll || 0;
      
      // Check if we have sufficient data
      const hasIncome = filteredIncome.length > 0 && totalIncome > 0;
      const hasExpenses = filteredExpenses.length > 0 && totalExpenses > 0;
      const hasSalary = salaryResponse.data?.items?.length > 0 || totalSalary > 0;
      
      // If all are zero/empty, show insufficient data message
      if (!hasIncome && !hasExpenses && !hasSalary) {
        setHasInsufficientData(true);
        setMessage({ 
          type: 'warning', 
          text: 'Insufficient data to calculate profit or loss' 
        });
        setProfitLoss(null);
        return;
      }
      
      // Calculate P&L
      const calculatedPnL = totalIncome - (totalExpenses + totalSalary);
      setProfitLoss(calculatedPnL);
      
      setMessage({ type: 'success', text: `Profit & Loss calculated for ${selectedDate}` });
      
    } catch (error) {
      console.error('Error calculating profit/loss:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to calculate profit or loss. Please try again.' 
      });
      setHasInsufficientData(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Report generation function
  const generateReport = async () => {
    setReportLoading(true);
    setReportError('');
    setReportData(null);

    try {
      const response = await API.get('/finance/profit-loss-report', {
        params: {
          startDate: reportStartDate,
          endDate: reportEndDate
        }
      });

      if (response.data.success) {
        setReportData(response.data);
      } else {
        setReportError(response.data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReportError('Failed to generate report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  // Print report function
  const printReport = () => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Profit & Loss Report - ${reportData.startDate} to ${reportData.endDate}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            color: #1e293b;
            margin: 0;
          }
          h1 { 
            color: #1e293b; 
            text-align: center; 
            margin-bottom: 10px;
            font-size: 28px;
          }
          .period { 
            text-align: center; 
            color: #64748b; 
            margin-bottom: 30px;
            font-size: 14px;
          }
          .summary { 
            background: #f8fafc; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .summary-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 0; 
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          .summary-item:last-child { 
            border-bottom: none; 
            font-weight: bold;
            font-size: 16px;
          }
          .profit { color: #10b981; }
          .loss { color: #ef4444; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 30px;
            font-size: 12px;
          }
          th, td { 
            padding: 10px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0;
          }
          th { 
            background: #f1f5f9; 
            font-weight: 600; 
            color: #475569;
          }
          .text-right { text-align: right; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Profit & Loss Report</h1>
        <p class="period"><strong>Period:</strong> ${reportData.startDate} to ${reportData.endDate}</p>
        <div class="summary">
          <div class="summary-item"><span>Total Income:</span><span>${formatCurrency(reportData.totalIncome)}</span></div>
          <div class="summary-item"><span>Total Expenses:</span><span>${formatCurrency(reportData.totalExpenses)}</span></div>
          <div class="summary-item"><span>Total Salary:</span><span>${formatCurrency(reportData.totalSalary)}</span></div>
          <div class="summary-item"><span>Net:</span><span class="${reportData.net >= 0 ? 'profit' : 'loss'}">${formatCurrency(Math.abs(reportData.net))} ${reportData.net >= 0 ? '(Profit)' : '(Loss)'}</span></div>
          <div class="summary-item"><span>Status:</span><span class="${reportData.status === 'Profit' ? 'profit' : 'loss'}">${reportData.status}</span></div>
        </div>
        <table>
          <thead>
            <tr><th>Date</th><th class="text-right">Income</th><th class="text-right">Expenses</th><th class="text-right">Salary</th><th class="text-right">Net</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${reportData.dailyReports.map(r => `
              <tr>
                <td>${r.date}</td>
                <td class="text-right">${formatCurrency(r.totalIncome)}</td>
                <td class="text-right">${formatCurrency(r.totalExpenses)}</td>
                <td class="text-right">${formatCurrency(r.totalSalary)}</td>
                <td class="text-right ${r.net >= 0 ? 'profit' : 'loss'}">${formatCurrency(Math.abs(r.net))}</td>
                <td class="${r.status === 'Profit' ? 'profit' : 'loss'}">${r.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Download PDF function
  const downloadPDF = () => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Profit & Loss Report - ${reportData.startDate} to ${reportData.endDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
          h1 { color: #1e293b; text-align: center; margin-bottom: 10px; }
          .period { text-align: center; color: #64748b; margin-bottom: 30px; }
          .summary { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .summary-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
          .summary-item:last-child { border-bottom: none; font-weight: bold; }
          .profit { color: #10b981; }
          .loss { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: 600; color: #475569; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Profit & Loss Report</h1>
        <p class="period"><strong>Period:</strong> ${reportData.startDate} to ${reportData.endDate}</p>
        <div class="summary">
          <div class="summary-item"><span>Total Income:</span><span>${formatCurrency(reportData.totalIncome)}</span></div>
          <div class="summary-item"><span>Total Expenses:</span><span>${formatCurrency(reportData.totalExpenses)}</span></div>
          <div class="summary-item"><span>Total Salary:</span><span>${formatCurrency(reportData.totalSalary)}</span></div>
          <div class="summary-item"><span>Net:</span><span class="${reportData.net >= 0 ? 'profit' : 'loss'}">${formatCurrency(Math.abs(reportData.net))} ${reportData.net >= 0 ? '(Profit)' : '(Loss)'}</span></div>
          <div class="summary-item"><span>Status:</span><span class="${reportData.status === 'Profit' ? 'profit' : 'loss'}">${reportData.status}</span></div>
        </div>
        <table>
          <thead>
            <tr><th>Date</th><th class="text-right">Income</th><th class="text-right">Expenses</th><th class="text-right">Salary</th><th class="text-right">Net</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${reportData.dailyReports.map(r => `
              <tr>
                <td>${r.date}</td>
                <td class="text-right">${formatCurrency(r.totalIncome)}</td>
                <td class="text-right">${formatCurrency(r.totalExpenses)}</td>
                <td class="text-right">${formatCurrency(r.totalSalary)}</td>
                <td class="text-right ${r.net >= 0 ? 'profit' : 'loss'}">${formatCurrency(Math.abs(r.net))}</td>
                <td class="${r.status === 'Profit' ? 'profit' : 'loss'}">${r.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="profit-loss-summary">
      {/* Header Section */}
      <div className="pl-header">
        <h1>Profit & Loss Summary</h1>
        <div className="pl-date-selector">
          <label htmlFor="pl-date">Date:</label>
          <input
            type="date"
            id="pl-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button 
            className="pl-calculate-btn"
            onClick={calculateProfitLoss}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="pl-tabs">
        <button 
          className={`pl-tab-button ${activeTab === 'calculations' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculations')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="8" y1="6" x2="16" y2="6"></line>
            <line x1="8" y1="10" x2="16" y2="10"></line>
            <line x1="8" y1="14" x2="12" y2="14"></line>
          </svg>
          Profit & Loss Calculations
        </button>
        <button 
          className={`pl-tab-button ${activeTab === 'reporting' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporting')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Profit & Loss Reporting
        </button>
      </div>

      {/* Tab Content - Calculations */}
      {activeTab === 'calculations' && (
        <>
          {/* Message Alert */}
          {message.text && (
            <div className={`pl-alert ${message.type}`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage({ type: '', text: '' })}>&times;</button>
            </div>
          )}

          {/* Insufficient Data Warning */}
          {hasInsufficientData && (
            <div className="pl-insufficient-data">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <p>Insufficient data to calculate profit or loss</p>
              <p className="pl-subtitle">Please ensure income, expense, or salary records exist for {formatDate(selectedDate)}</p>
            </div>
          )}

          {/* P&L Calculation Results */}
          {!hasInsufficientData && profitLoss !== null && (
            <div className="pl-results">
              {/* Summary Cards */}
              <div className="pl-cards-grid">
                <div className="pl-card income-card">
                  <div className="pl-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <h4>Total Income</h4>
                  <div className="pl-card-value">{formatCurrency(incomeData?.totalRevenue || 0)}</div>
                </div>

                <div className="pl-card expense-card">
                  <div className="pl-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </div>
                  <h4>Total Expenses</h4>
                  <div className="pl-card-value">{formatCurrency(expenseData?.totalExpenses || 0)}</div>
                </div>

                <div className="pl-card salary-card">
                  <div className="pl-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h4>Total Salary</h4>
                  <div className="pl-card-value">{formatCurrency(salaryData?.totalPayroll || 0)}</div>
                </div>
              </div>

              {/* P&L Result Box */}
              <div className={`pl-result-box ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
                <div className="pl-result-header">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {profitLoss >= 0 ? (
                      <>
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </>
                    ) : (
                      <>
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                        <polyline points="17 18 23 18 23 12"></polyline>
                      </>
                    )}
                  </svg>
                  <h2>{profitLoss >= 0 ? 'NET PROFIT' : 'NET LOSS'}</h2>
                </div>
                <div className="pl-result-amount">{formatCurrency(Math.abs(profitLoss))}</div>
                <div className="pl-result-date">{formatDate(selectedDate)}</div>
              </div>

              {/* Calculation Summary Table */}
              <div className="pl-calculation-table">
                <h3>Calculation Summary</h3>
                <table>
                  <tbody>
                    <tr>
                      <td>Total Income</td>
                      <td className="pl-positive">{formatCurrency(incomeData?.totalRevenue || 0)}</td>
                    </tr>
                    <tr>
                      <td>Total Expenses</td>
                      <td className="pl-negative">- {formatCurrency(expenseData?.totalExpenses || 0)}</td>
                    </tr>
                    <tr>
                      <td>Total Salary</td>
                      <td className="pl-negative">- {formatCurrency(salaryData?.totalPayroll || 0)}</td>
                    </tr>
                    <tr className="pl-total-row">
                      <td><strong>{profitLoss >= 0 ? 'NET PROFIT' : 'NET LOSS'}</strong></td>
                      <td className={profitLoss >= 0 ? 'pl-positive' : 'pl-negative'}>
                        <strong>{formatCurrency(Math.abs(profitLoss))}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab Content - Reporting */}
      {activeTab === 'reporting' && (
        <div className="pl-reporting-content">
          {/* Date Range Filter */}
          <div className="pl-report-filters">
            <h3>Generate Profit & Loss Report</h3>
            <div className="pl-date-range">
              <div className="pl-date-field">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                />
              </div>
              <div className="pl-date-field">
                <label>End Date:</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                />
              </div>
              <button 
                className="pl-generate-btn"
                onClick={generateReport}
                disabled={reportLoading}
              >
                {reportLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {reportError && (
            <div className="pl-alert error">
              <span>{reportError}</span>
              <button onClick={() => setReportError('')}>&times;</button>
            </div>
          )}

          {/* Report Results */}
          {reportData && reportData.success && (
            <div className="pl-report-results">
              {/* Summary Section */}
              <div className="pl-report-summary">
                <h4>Report Summary</h4>
                <div className="pl-summary-grid">
                  <div className="pl-summary-item">
                    <span className="pl-summary-label">Period:</span>
                    <span className="pl-summary-value">{reportData.startDate} to {reportData.endDate}</span>
                  </div>
                  <div className="pl-summary-item">
                    <span className="pl-summary-label">Total Income:</span>
                    <span className="pl-summary-value pl-positive">{formatCurrency(reportData.totalIncome)}</span>
                  </div>
                  <div className="pl-summary-item">
                    <span className="pl-summary-label">Total Expenses:</span>
                    <span className="pl-summary-value pl-negative">{formatCurrency(reportData.totalExpenses)}</span>
                  </div>
                  <div className="pl-summary-item">
                    <span className="pl-summary-label">Total Salary:</span>
                    <span className="pl-summary-value pl-negative">{formatCurrency(reportData.totalSalary)}</span>
                  </div>
                  <div className="pl-summary-item pl-net-item">
                    <span className="pl-summary-label">Net:</span>
                    <span className={`pl-summary-value ${reportData.net >= 0 ? 'pl-positive' : 'pl-negative'}`}>
                      {formatCurrency(Math.abs(reportData.net))} ({reportData.status})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pl-report-actions">
                <button className="pl-action-btn pl-print-btn" onClick={printReport}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Print Report
                </button>
                <button className="pl-action-btn pl-download-btn" onClick={downloadPDF}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download PDF
                </button>
              </div>

              {/* Detailed Table */}
              <div className="pl-report-table">
                <h4>Daily Breakdown</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total Income</th>
                      <th>Total Expenses</th>
                      <th>Total Salary</th>
                      <th>Net Profit/Loss</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.dailyReports.map((report, index) => (
                      <tr key={index}>
                        <td>{report.date}</td>
                        <td className="pl-positive">{formatCurrency(report.totalIncome)}</td>
                        <td className="pl-negative">{formatCurrency(report.totalExpenses)}</td>
                        <td className="pl-negative">{formatCurrency(report.totalSalary)}</td>
                        <td className={report.net >= 0 ? 'pl-positive' : 'pl-negative'}>
                          {formatCurrency(Math.abs(report.net))}
                        </td>
                        <td>
                          <span className={`pl-status-badge ${report.status.toLowerCase()}`}>
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {reportData && !reportData.success && (
            <div className="pl-no-data">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <p>No profit/loss data available to generate report</p>
              <p className="pl-subtitle">Please ensure income and expense records exist for the selected date range</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfitLossSummary;
