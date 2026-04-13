import React, { useState, useEffect } from 'react';
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
    <div className="income-recording"> {/* Reusing class for layout consistency */}
      <div className="finance-summary">
        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}>
          <h4>Total Expenses</h4>
          <div className="stat-value">LKR {totalExpenses.toLocaleString()}</div>
        </div>
      </div>

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
        <h3>Recent Expenses</h3>
        <table className="records-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((e) => (
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
    </div>
  );
};

export default ExpenseRecording;
