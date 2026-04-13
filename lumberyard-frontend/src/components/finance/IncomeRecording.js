import React, { useState, useEffect } from 'react';
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
                  <td className="amount">LKR {t.amount.toLocaleString()}</td>
                  <td className="actions">
                    <button className="edit-link" onClick={() => handleEdit(t)}>Edit</button>
                    <button className="delete-link" onClick={() => handleDelete(t.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No transactions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeRecording;
