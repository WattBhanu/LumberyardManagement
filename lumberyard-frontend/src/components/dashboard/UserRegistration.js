import React, { useState, useEffect } from 'react';
import './UserRegistration.css';
import ManagerSalaryManagement from '../labor/ManagerSalaryManagement';
import API from '../../services/api';

const UserRegistration = ({ token }) => {
  console.log('UserRegistration component rendered with token:', token);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'FINANCE_MANAGER',
    dailySalaryRate: '',
    status: true // true = active, false = inactive
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showManagerSalaries, setShowManagerSalaries] = useState(false);
  
  // Get current user from localStorage to check admin role and prevent self-deletion
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'ADMIN';
  
  // Only admins can see manager salaries
  const canViewManagerSalaries = isAdmin;

  const roles = [
    { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
    { value: 'INVENTORY_OPERATIONS_MANAGER', label: 'Inventory Operations Manager' },
    { value: 'LABOR_MANAGER', label: 'Labor Manager' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching users with token:', token);
      const response = await API.get('/users/all');
      
      console.log('Users fetch response status:', response.status);
      
      const data = response.data;
      console.log('Users fetched successfully:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Failed to load users. Please check your connection.');
      setMessageType('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Registering user with token:', token);
      console.log('Form data:', formData);
      
      const response = await API.post('/users/register', formData);

      console.log('Registration response status:', response.status);
      
      setMessage('User registered successfully!');
      setMessageType('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'FINANCE_MANAGER',
        dailySalaryRate: '',
        status: true
      });
      // Refresh user list
      fetchAllUsers();
    } catch (error) {
      console.error('Network error during registration:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  return (
    <div className="user-registration">
      {/* Toggle Buttons */}
      <div className="registration-toggle">
        <button 
          className={`toggle-btn ${!showManagerSalaries ? 'active' : ''}`}
          onClick={() => setShowManagerSalaries(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          User Management
        </button>
        {canViewManagerSalaries && (
          <button 
            className={`toggle-btn ${showManagerSalaries ? 'active' : ''}`}
            onClick={() => setShowManagerSalaries(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Manager Salaries
          </button>
        )}
      </div>

      {/* User Registration Section */}
      {!showManagerSalaries && (
        <>
          <div className="registration-form-container">
            <h2>User Registration</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          
          {(formData.role === 'ADMIN' || formData.role === 'FINANCE_MANAGER' || formData.role === 'LABOR_MANAGER' || formData.role === 'INVENTORY_OPERATIONS_MANAGER') && (
            <div className="form-group">
              <label htmlFor="dailySalaryRate">Daily Salary Rate (LKR) *</label>
              <input
                type="number"
                id="dailySalaryRate"
                name="dailySalaryRate"
                value={formData.dailySalaryRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 5000 (0 for inactive)"
                required
              />
              <small className="form-hint">Set to 0 to mark manager as inactive. Status auto-sets based on salary.</small>
            </div>
          )}
          
          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register User'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="user-list-container">
        <h2>Registered Users</h2>
        <div className="user-list">
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Salary Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{getRoleLabel(user.role)}</td>
                    <td>{user.dailySalaryRate ? `LKR ${user.dailySalaryRate}` : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${user.status ? 'active' : 'inactive'}`}>
                        {user.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
          </div>
        </>
      )}

      {/* Manager Salaries Section */}
      {showManagerSalaries && canViewManagerSalaries && (
        <ManagerSalaryManagement />
      )}
    </div>
  );
};

export default UserRegistration;