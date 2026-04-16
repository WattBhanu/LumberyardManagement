import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './ProfitLossSummary.css';

const ProfitLossSummary = ({ token }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Data states
  const [incomeData, setIncomeData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  
  // Calculated P&L
  const [profitLoss, setProfitLoss] = useState(null);
  const [hasInsufficientData, setHasInsufficientData] = useState(false);

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
    </div>
  );
};

export default ProfitLossSummary;
