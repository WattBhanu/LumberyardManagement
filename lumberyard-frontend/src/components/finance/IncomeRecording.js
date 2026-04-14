import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../services/api';
import './IncomeRecording.css';

const IncomeRecording = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    type: 'INCOME',
    product: '',
    amount: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [summary, setSummary] = useState({ totalRevenue: 0 });
  
  // Reporting states
  const [activeTab, setActiveTab] = useState('recording'); // 'recording' or 'reporting'
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'ALL'
  });
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await API.get('/finance/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await API.get('/finance/transactions/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
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
      const { startDate, endDate, type } = reportFilters;
      const response = await API.get(`/finance/transactions/report?startDate=${startDate}&endDate=${endDate}&type=${type}`);
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
   * This function handles ONLY the report printing logic.
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Separation of Concerns: 
   * PDF generation logic is encapsulated in this function, separate from UI rendering.
   * Open/Closed Principle (OCP): 
   * Can be configured to export different data formats or columns without changing basic logic.
   */
  const handleDownloadPDF = () => {
    if (!reportData || !reportData.success) return;

    const doc = new jsPDF();
    const title = "Income / Sales Report";
    const dateRange = `Period: ${reportData.startDate} to ${reportData.endDate}`;
    const reportType = `Type: ${reportData.reportType}`;

    // Header
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(dateRange, 14, 30);
    doc.text(reportType, 14, 37);

    // Summary Boxes Data as Text
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Transactions: ${reportData.count}`, 14, 48);
    doc.text(`Total Value: LKR ${reportData.totalAmount.toLocaleString()}`, 14, 55);

    // Table
    const tableColumn = ["Date", "Type", "Product", "Qty", "Amount (LKR)"];
    const tableRows = [];

    reportData.transactions.forEach(t => {
      const transactionData = [
        t.date,
        t.type,
        t.product || '-',
        t.quantity || '-',
        t.amount.toLocaleString()
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Income_Report_${reportData.startDate}_${reportData.endDate}.pdf`);
  };

  const validateForm = () => {
    if (!formData.amount || !formData.date) {
      setMessage({ type: 'error', text: 'Amount and Date are required' });
      return false;
    }
    if (formData.type === 'SALE') {
      if (!formData.product || !formData.quantity) {
        setMessage({ type: 'error', text: 'Product and Quantity are required for sales' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/finance/transactions/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Transaction updated successfully' });
      } else {
        await API.post('/finance/transactions', formData);
        setMessage({ type: 'success', text: 'Transaction recorded successfully' });
      }
      resetForm();
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving transaction' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      product: transaction.product || '',
      amount: transaction.amount,
      quantity: transaction.quantity || '',
      date: transaction.date,
      description: transaction.description || ''
    });
    setEditingId(transaction.id);
    setActiveTab('recording');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await API.delete(`/finance/transactions/${id}`);
        setMessage({ type: 'success', text: 'Transaction deleted successfully' });
        fetchTransactions();
        fetchSummary();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting transaction' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'INCOME',
      product: '',
      amount: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingId(null);
  };

  return (
    <div className="income-recording">
      <div className="finance-summary">
        <div className="summary-card total-revenue">
          <h4>Total Revenue</h4>
          <div className="stat-value">LKR {summary.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="finance-tabs">
        <button 
          className={`tab-btn ${activeTab === 'recording' ? 'active' : ''}`}
          onClick={() => setActiveTab('recording')}
        >
          Income Recording
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reporting' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporting')}
        >
          Income Reporting
        </button>
      </div>

      {activeTab === 'recording' ? (
        <>
          <div className="transaction-form-container">
            <h3>{editingId ? 'Update Record' : 'Record New Entry'}</h3>
            {message.text && (
              <div className={`alert ${message.type}`}>
                {message.text}
                <button onClick={() => setMessage({ type: '', text: '' })}>&times;</button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Transaction Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="INCOME">Income</option>
                    <option value="SALE">Sale</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (LKR)</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" />
                </div>
                {formData.type === 'SALE' && (
                  <>
                    <div className="form-group">
                      <label>Product</label>
                      <input type="text" name="product" value={formData.product} onChange={handleInputChange} placeholder="Product Name" />
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="0" />
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter details..."></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Processing...' : (editingId ? 'Update Record' : 'Save Record')}
                </button>
                {editingId && (
                  <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          <div className="records-table-container">
            <h3>Recent Transactions</h3>
            <table className="records-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>
                        <span className={`badge ${t.type.toLowerCase()}`}>{t.type}</span>
                      </td>
                      <td>{t.product || '-'}</td>
                      <td>{t.quantity || '-'}</td>
                      <td>{t.description || '-'}</td>
                      <td className="amount">LKR {t.amount.toLocaleString()}</td>
                      <td className="actions">
                        <button className="edit-link" onClick={() => handleEdit(t)}>Edit</button>
                        <button className="delete-link" onClick={() => handleDelete(t.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">No transactions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="reporting-section">
          <div className="report-filter-card">
            <h3>Generate Sales Report</h3>
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
                <label>Transaction Type</label>
                <select 
                  name="type" 
                  value={reportFilters.type} 
                  onChange={handleReportFilterChange}
                >
                  <option value="ALL">All Transactions</option>
                  <option value="INCOME">Income Only</option>
                  <option value="SALE">Sales Only</option>
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <button 
                  className="generate-btn" 
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
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
                  <button className="download-btn" onClick={handleDownloadPDF}>
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
                        <h5>Total Count</h5>
                        <div className="value">{reportData.count}</div>
                      </div>
                      <div className="report-box">
                        <h5>Total Value</h5>
                        <div className="value">LKR {reportData.totalAmount.toLocaleString()}</div>
                      </div>
                      <div className="report-box">
                        <h5>Period</h5>
                        <div className="value" style={{ fontSize: '1rem' }}>
                          {reportData.startDate} to {reportData.endDate}
                        </div>
                      </div>
                    </div>

                    <div className="records-table-container">
                      <h3>Report Details ({reportData.reportType})</h3>
                      <table className="records-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Description</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.transactions.map((t) => (
                            <tr key={t.id}>
                              <td>{t.date}</td>
                              <td>
                                <span className={`badge ${t.type.toLowerCase()}`}>{t.type}</span>
                              </td>
                              <td>{t.product || '-'}</td>
                              <td>{t.quantity || '-'}</td>
                              <td>{t.description || '-'}</td>
                              <td className="amount">LKR {t.amount.toLocaleString()}</td>
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
                    <p>{reportData.message || "No data to print"}</p>
                    <div className="report-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                      <button className="print-btn" disabled>Print Report</button>
                      <button className="download-btn" disabled>Download PDF</button>
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

export default IncomeRecording;
