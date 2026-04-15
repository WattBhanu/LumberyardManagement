import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../services/api';
import './IncomeRecording.css'; // Reusing similar styling structure

const ExpenseRecording = ({ token }) => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    category: 'Transport',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Reporting states
  const [activeTab, setActiveTab] = useState('recording'); // 'recording' or 'reporting'
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'ALL'
  });
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Sorting and Filtering states for Recent Expenses table
  const [filterDate, setFilterDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const categories = ['Transport', 'Salary', 'Maintenance', 'Chemicals', 'Utilities', 'Taxes', 'Other'];

  useEffect(() => {
    fetchExpenses();
    fetchTotalExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await API.get('/finance/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchTotalExpenses = async () => {
    try {
      const response = await API.get('/finance/expenses/total');
      setTotalExpenses(response.data.totalExpenses);
    } catch (error) {
      console.error('Error fetching total expenses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReportFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters({ ...reportFilters, [name]: value });
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportData(null);
    try {
      const { startDate, endDate, category } = reportFilters;
      const response = await API.get(`/finance/expenses/report?startDate=${startDate}&endDate=${endDate}&category=${category}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage({ type: 'error', text: 'Failed to generate report' });
    } finally {
      setReportLoading(false);
    }
  };

  /**
   * Single Responsibility Principle (SRP): 
   * This function handles ONLY the print triggering.
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Separation of Concerns: 
   * PDF formatting logic is separate from the UI component tree.
   */
  const handleDownloadPDF = () => {
    if (!reportData || !reportData.success) return;

    const doc = new jsPDF();
    const title = "Expense Report";
    const dateRange = `Period: ${reportData.startDate} to ${reportData.endDate}`;
    const categoryInfo = `Category: ${reportData.category}`;

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(dateRange, 14, 30);
    doc.text(categoryInfo, 14, 37);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Transactions: ${reportData.count}`, 14, 48);
    doc.text(`Total Spending: LKR ${reportData.totalAmount.toLocaleString()}`, 14, 55);

    const tableColumn = ["Date", "Category", "Description", "Amount (LKR)"];
    const tableRows = [];

    reportData.expenses.forEach(e => {
      const expenseData = [
        e.date,
        e.category,
        e.description || '-',
        e.amount.toLocaleString()
      ];
      tableRows.push(expenseData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] } // Red theme for expenses
    });

    doc.save(`Expense_Report_${reportData.startDate}_${reportData.endDate}.pdf`);
  };

  const validateForm = () => {
    if (!formData.category || !formData.amount || !formData.date) {
      setMessage({ type: 'error', text: 'Category, Amount and Date are required' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/finance/expenses/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Expense record updated successfully' });
      } else {
        await API.post('/finance/expenses', formData);
        setMessage({ type: 'success', text: 'Expense recorded successfully' });
      }
      resetForm();
      fetchExpenses();
      fetchTotalExpenses();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving expense' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description || ''
    });
    setEditingId(expense.id);
    setActiveTab('recording');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await API.delete(`/finance/expenses/${id}`);
        setMessage({ type: 'success', text: 'Expense record deleted successfully' });
        fetchExpenses();
        fetchTotalExpenses();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting expense record' });
      }
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    let processed = [...data];
    processed.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      
      if (sortConfig.key === 'amount') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else {
        valA = valA ? valA.toString().toLowerCase() : '';
        valB = valB ? valB.toString().toLowerCase() : '';
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return processed;
  };

  const getProcessedExpenses = () => {
    let processed = filterDate ? expenses.filter(e => e.date === filterDate) : [...expenses];
    return sortData(processed);
  };

  const SortIcon = ({ column }) => {
    const isActive = sortConfig.key === column;
    const isAsc = isActive && sortConfig.direction === 'asc';
    const isDesc = isActive && sortConfig.direction === 'desc';

    return (
      <span className={`sort-icon ${isActive ? 'active' : ''}`}>
        {isActive ? (
          isAsc ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3">
            <path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path>
          </svg>
        )}
      </span>
    );
  };

  const resetForm = () => {
    setFormData({
      category: 'Transport',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingId(null);
  };

  return (
    <div className="income-recording">
      <div className="finance-summary">
        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)' }}>
          <h4>Total Expenses</h4>
          <div className="stat-value">LKR {totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      <div className="finance-tabs">
        <button 
          className={`tab-btn ${activeTab === 'recording' ? 'active' : ''}`}
          onClick={() => setActiveTab('recording')}
        >
          Expense Recording
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reporting' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporting')}
        >
          Expense Reporting
        </button>
      </div>

      {activeTab === 'recording' ? (
        <>
          <div className="transaction-form-container">
            <h3>{editingId ? 'Update Expense Record' : 'Record New Expense'}</h3>
            {message.text && (
              <div className={`alert ${message.type}`}>
                {message.text}
                <button onClick={() => setMessage({ type: '', text: '' })}>&times;</button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Expense Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Amount (LKR)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter details..."></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading} style={{ background: '#ef4444' }}>
                  {loading ? 'Processing...' : (editingId ? 'Update Record' : 'Save Record')}
                </button>
                {editingId && (
                  <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          <div className="records-table-container">
            <div className="table-header-row">
              <h3>Recent Expenses</h3>
              <div className="table-filter">
                <label>FILTER BY DATE:</label>
                <input 
                  type="date" 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)} 
                  className="filter-date-input"
                />
                {filterDate && (
                  <button className="clear-filter" onClick={() => setFilterDate('')}>Clear</button>
                )}
              </div>
            </div>
            <table className="records-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('date')} className="sortable">
                    Date <SortIcon column="date" />
                  </th>
                  <th onClick={() => requestSort('category')} className="sortable">
                    Category <SortIcon column="category" />
                  </th>
                  <th>Description</th>
                  <th onClick={() => requestSort('amount')} className="sortable">
                    Amount <SortIcon column="amount" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getProcessedExpenses().length > 0 ? (
                  getProcessedExpenses().map((e) => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td>
                        <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>{e.category}</span>
                      </td>
                      <td>{e.description || '-'}</td>
                      <td className="amount" style={{ color: '#dc2626' }}>LKR {e.amount.toLocaleString()}</td>
                      <td className="actions">
                        <button className="edit-link" onClick={() => handleEdit(e)}>Edit</button>
                        <button className="delete-link" onClick={() => handleDelete(e.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No expense records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="reporting-section">
          <div className="report-filter-card">
            <h3>Generate Expense Report</h3>
            <div className="form-row">
              <div className="form-group">
                <label>From Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={reportFilters.startDate} 
                  onChange={handleReportFilterChange} 
                />
              </div>
              <div className="form-group">
                <label>To Date</label>
                <input 
                  type="date" 
                  name="endDate" 
                  value={reportFilters.endDate} 
                  onChange={handleReportFilterChange} 
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category" 
                  value={reportFilters.category} 
                  onChange={handleReportFilterChange}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <button 
                  className="generate-btn" 
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  style={{ background: '#ef4444' }}
                >
                  {reportLoading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {reportLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Preparing your report...</p>
            </div>
          )}

          {reportData && (
            <div className="report-results">
              {reportData.success && (
                <div className="report-actions">
                  <button className="print-btn" onClick={handlePrint}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Print Report
                  </button>
                  <button className="download-btn" onClick={handleDownloadPDF} style={{ background: '#ef4444' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download PDF
                  </button>
                </div>
              )}

              <div className={reportData.success ? "printable-report" : ""}>
                {reportData.success ? (
                  <>
                    <div className="report-summary-boxes">
                      <div className="report-box">
                        <h5>Transaction Count</h5>
                        <div className="value">{reportData.count}</div>
                      </div>
                      <div className="report-box">
                        <h5>Total Spending</h5>
                        <div className="value">LKR {reportData.totalAmount.toLocaleString()}</div>
                      </div>
                      <div className="report-box">
                        <h5>Filter: {reportData.category}</h5>
                        <div className="value" style={{ fontSize: '1rem' }}>
                          {reportData.startDate} to {reportData.endDate}
                        </div>
                      </div>
                    </div>

                    <div className="records-table-container">
                      <h3>Expense Details</h3>
                      <table className="records-table">
                        <thead>
                          <tr>
                            <th onClick={() => requestSort('date')} className="sortable">
                              Date <SortIcon column="date" />
                            </th>
                            <th onClick={() => requestSort('category')} className="sortable">
                              Category <SortIcon column="category" />
                            </th>
                            <th>Description</th>
                            <th onClick={() => requestSort('amount')} className="sortable">
                              Amount <SortIcon column="amount" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortData(reportData.expenses).map((e) => (
                            <tr key={e.id}>
                              <td>{e.date}</td>
                              <td>
                                <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>{e.category}</span>
                              </td>
                              <td>{e.description || '-'}</td>
                              <td className="amount" style={{ color: '#dc2626' }}>LKR {e.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="no-report-data">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p>{reportData.message}</p>
                    <div className="report-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                      <button className="print-btn" disabled>Print Report</button>
                      <button className="download-btn" disabled style={{ background: '#ef4444' }}>Download PDF</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseRecording;
