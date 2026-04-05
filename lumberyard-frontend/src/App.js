import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/dashboard/AdminDashboard';
import LaborManagerDashboard from './components/dashboard/LaborManagerDashboard';
import FinanceManagerDashboard from './components/dashboard/FinanceManagerDashboard';
import MainPage from './pages/MainPage';
import InventoryPage from './pages/InventoryPage';
import ProductionPage from './pages/ProductionPage';
import TreatmentPage from './pages/TreatmentPage';
// Labor components
import WorkerManagement from './components/labor/WorkerManagement';
import AttendanceTracking from './components/labor/AttendanceTracking';
import SalaryReports from './components/labor/SalaryReports';
// Job Assignment components
import Jobs from './components/jobs/Jobs';
import JobAssignment from './components/jobs/JobAssignment';
import SelectJobs from './components/jobs/SelectJobs';
import ShiftScheduling from './components/jobs/ShiftScheduling';
// Old Worker components (for backward compatibility)
import WorkerPage from './components/worker/WorkerPage';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
    const isAuthenticated = localStorage.getItem('token') !== null;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to role-appropriate page
        if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
        if (userRole === 'INVENTORY_OPERATIONS_MANAGER') return <Navigate to="/main" replace />;
        if (userRole === 'LABOR_MANAGER') return <Navigate to="/labor" replace />;
        if (userRole === 'FINANCE_MANAGER') return <Navigate to="/finance" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

// Role-based redirect component
const RoleBasedRedirect = ({ user }) => {
    if (!user) return <Navigate to="/" replace />;

    switch(user.role) {
        case 'ADMIN':
            return <Navigate to="/admin" replace />;
        case 'INVENTORY_OPERATIONS_MANAGER':
            return <Navigate to="/main" replace />;
        case 'LABOR_MANAGER':
            return <Navigate to="/labor" replace />;
        case 'FINANCE_MANAGER':
            return <Navigate to="/finance" replace />;
        default:
            return <Navigate to="/" replace />;
    }
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in on app load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (storedToken && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setToken(storedToken);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (authData) => {
        setUser({
            username: authData.username,
            name: authData.name,
            role: authData.role
        });
        setToken(authData.jwt);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public route - Login */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <RoleBasedRedirect user={user} />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />

                {/* Main Page - Inventory Operations Manager landing page */}
                <Route
                    path="/main"
                    element={
                        <ProtectedRoute allowedRoles={['INVENTORY_OPERATIONS_MANAGER', 'ADMIN']} userRole={user?.role}>
                            <MainPage user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Inventory Page - Accessible to Admin and Inventory Operations Manager */}
                <Route
                    path="/inventory"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_OPERATIONS_MANAGER']} userRole={user?.role}>
                            <InventoryPage />
                        </ProtectedRoute>
                    }
                />

                {/* Production Page - Accessible to Admin and Inventory Operations Manager */}
                <Route
                    path="/production"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_OPERATIONS_MANAGER']} userRole={user?.role}>
                            <ProductionPage />
                        </ProtectedRoute>
                    }
                />

                {/* Treatment Page - Accessible to Admin and Inventory Operations Manager */}
                <Route
                    path="/treatment"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_OPERATIONS_MANAGER']} userRole={user?.role}>
                            <TreatmentPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard - Admin only */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']} userRole={user?.role}>
                            <AdminDashboard user={user} onLogout={handleLogout} token={token} />
                        </ProtectedRoute>
                    }
                />

                {/* Labor Manager Dashboard */}
                <Route
                    path="/labor"
                    element={
                        <ProtectedRoute allowedRoles={['LABOR_MANAGER', 'ADMIN']} userRole={user?.role}>
                            <LaborManagerDashboard user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="workers" element={<WorkerManagement />} />
                    <Route path="attendance" element={<AttendanceTracking />} />
                    <Route path="salary" element={<SalaryReports />} />
                    <Route path="jobs" element={<Jobs />}>
                        <Route path="assignment" element={<JobAssignment />} />
                        <Route path="select" element={<SelectJobs />} />
                        <Route path="shift-scheduling" element={<ShiftScheduling />} />
                    </Route>
                </Route>

                {/* Finance Manager Dashboard */}
                <Route
                    path="/finance/*"
                    element={
                        <ProtectedRoute allowedRoles={['FINANCE_MANAGER', 'ADMIN']} userRole={user?.role}>
                            <FinanceManagerDashboard user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect old dashboard routes based on role */}
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated ? (
                            user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> :
                                user?.role === 'LABOR_MANAGER' ? <Navigate to="/labor" replace /> :
                                    user?.role === 'FINANCE_MANAGER' ? <Navigate to="/finance" replace /> :
                                        <Navigate to="/main" replace />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />

                {/* Catch all - redirect based on role */}
                <Route path="*" element={<RoleBasedRedirect user={user} />} />
            </Routes>
        </Router>
    );
}

export default App;