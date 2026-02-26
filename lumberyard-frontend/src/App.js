import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/dashboard/AdminDashboard';
import InventoryOperationsManagerDashboard from './components/dashboard/InventoryOperationsManagerDashboard';
import LaborManagerDashboard from './components/dashboard/LaborManagerDashboard';
import FinanceManagerDashboard from './components/dashboard/FinanceManagerDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(token);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  const handleLogin = (authData) => {
    setUser({
      username: authData.username,
      name: authData.name,
      role: authData.role
    });
    setToken(authData.token);
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };
  
  // Render appropriate component based on authentication status
  if (isAuthenticated && user) {
    // Route to the appropriate dashboard based on user role
    switch(user.role) {
      case 'ADMIN':
        return <AdminDashboard user={user} onLogout={handleLogout} token={token} />;
      case 'INVENTORY_OPERATIONS_MANAGER':
        return <InventoryOperationsManagerDashboard user={user} onLogout={handleLogout} />;
      case 'LABOR_MANAGER':
        return <LaborManagerDashboard user={user} onLogout={handleLogout} />;
      case 'FINANCE_MANAGER':
        return <FinanceManagerDashboard user={user} onLogout={handleLogout} />;
      default:
        return <div>Unknown role: {user.role}</div>;
    }
  }
  
  // Show login form if not authenticated
  return (
    <div>
      <Login onLogin={handleLogin} />
    </div>
  );
}

export default App;
