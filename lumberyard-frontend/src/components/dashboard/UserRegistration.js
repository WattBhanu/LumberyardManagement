import React, { useState, useEffect } from 'react';
import './UserRegistration.css';

const UserRegistration = ({ token }) => {
  console.log('UserRegistration component rendered with token:', token);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'FINANCE_MANAGER'
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

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
      const response = await fetch('http://localhost:8080/api/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users fetched successfully:', data);
        setUsers(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users. Status:', response.status, 'Error:', errorText);
        setMessage(`Failed to load users: ${response.status} ${response.statusText}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Fetch error name:', error.name);
      console.error('Fetch error message:', error.message);
      console.error('Fetch error stack:', error.stack);
      
      let errorMessage = 'Network error while fetching users';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Failed to connect to server to fetch users. Please check if the backend is running on http://localhost:8081';
      } else if (error.message) {
        errorMessage = `Network error while fetching users: ${error.message}`;
      }
      
      setMessage(errorMessage);
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
      
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        })
      });

      console.log('Registration response status:', response.status);
      
      if (response.ok) {
        await response.json();
        setMessage('User registered successfully!');
        setMessageType('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'FINANCE_MANAGER'
        });
        // Refresh user list
        fetchAllUsers();
      } else {
        const errorText = await response.text();
        console.error('Registration failed. Status:', response.status, 'Error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setMessage(errorData.error || `Registration failed: ${response.status} ${response.statusText}`);
        } catch {
          setMessage(`Registration failed: ${response.status} ${response.statusText}`);
        }
        setMessageType('error');
      }
    } catch (error) {
      console.error('Network error during registration:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Network error occurred';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Failed to connect to server. Please check if the backend is running on http://localhost:8081';
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
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
                    <td>
                      <span className={`status ${user.status ? 'active' : 'inactive'}`}>
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
    </div>
  );
};

export default UserRegistration;