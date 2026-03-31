import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './WorkerManagement.css';

const WorkerManagement = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeWorkers: 0,
    inactiveWorkers: 0
  });

  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: 'Sawyer',
    department: 'Sawmill',
    status: 'ACTIVE',
    hireDate: '',
    dateOfBirth: '',
    address: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const positions = [
    'Employee',
    'Sawyer',
    'Forklift Operator',
    'Team Lead',
    'Supervisor',
    'Quality Inspector',
    'Maintenance Technician',
    'Logistics Coordinator',
    'Safety Officer',
    'Other'
  ];

  const departments = [
    'Sawmill',
    'Kiln Operation',
    'Quality Control',
    'Maintenance',
    'Logistics',
    'Administration'
  ];

  // Fetch all workers on component mount
  useEffect(() => {
    fetchWorkers();
    fetchStats();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/workers/all');
      setWorkers(response.data);
      setMessage(null);
    } catch (error) {
      console.error('Fetch workers error:', error);
      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       'Failed to load workers.';
      setMessage({ type: 'error', text: `Error loading workers: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/workers/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up form data - remove empty optional fields
      const cleanData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        position: formData.position,
        department: formData.department,
        status: formData.status,
        hourlyRate: 15.0,
        isAvailable: true,
        ...(formData.email && formData.email.trim() && { email: formData.email.trim() }),
        ...(formData.hireDate && { hireDate: formData.hireDate }),
        ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
        ...(formData.address && formData.address.trim() && { address: formData.address.trim() })
      };

      if (editingWorker) {
        await API.put(`/workers/update/${editingWorker.workerId}`, cleanData);
        setMessage({ type: 'success', text: 'Worker updated successfully!' });
      } else {
        await API.post('/workers/add', cleanData);
        setMessage({ type: 'success', text: 'Worker added successfully!' });
      }

      setShowModal(false);
      setEditingWorker(null);
      setFormData(initialFormState);
      fetchWorkers();
      fetchStats();
    } catch (error) {
      console.error('Error saving worker:', error);
      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       'Failed to save worker.';
      setMessage({ type: 'error', text: `Error: ${errorMsg}` });
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email || '',
      phone: worker.phone || '',
      position: worker.position,
      department: worker.department,
      status: worker.status || 'ACTIVE',
      hireDate: worker.hireDate || '',
      dateOfBirth: worker.dateOfBirth || '',
      address: worker.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Are you sure you want to delete this worker?\n\nThis will also delete all associated attendance records and cannot be undone.')) {
      try {
        await API.delete(`/workers/delete/${id}`);
        setMessage({ type: 'success', text: 'Worker and associated records deleted successfully!' });
        fetchWorkers();
        fetchStats();
      } catch (error) {
        console.error('Delete failed:', error);
        const errorMsg = error.response?.data?.error ||
                         error.response?.data?.message ||
                         'Failed to delete worker.';
        setMessage({ type: 'error', text: errorMsg });
      }
    }
  };

  const openAddModal = () => {
    setEditingWorker(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingWorker(null);
    setFormData(initialFormState);
  };

  // Filter workers based on search query and filters
  const filteredWorkers = workers.filter(worker => {
    const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
    const emailMatch = (worker.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const positionMatch = (worker.position || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    const matchesSearch = searchQuery === '' || nameMatch || emailMatch || positionMatch;

    const matchesStatus = statusFilter === 'All' || worker.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || worker.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const activeCount = filteredWorkers.filter(worker => worker.status === 'ACTIVE').length;

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="wm-page">
      {/* GRADIENT HEADER */}
      <div className="wm-header">
        <div className="wm-header-left">
          <button
            className="wm-back-btn"
            onClick={() => navigate('/labor')}
            aria-label="Go back"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="wm-header-text">
            <h1>Worker Directory</h1>
            <span className="wm-badge">
              <i className="fas fa-id-badge"></i> HR · Workforce Management
            </span>
          </div>
        </div>
        <button className="wm-add-btn" onClick={openAddModal}>
          <i className="fas fa-user-plus"></i> Add New Worker
        </button>
      </div>

      {/* ALERT MESSAGE */}
      {message && (
        <div className={`wm-alert wm-alert-${message.type}`}>
          <span>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
            {' '}{message.text}
          </span>
          <button
            className="wm-alert-close"
            onClick={() => setMessage(null)}
            aria-label="Close alert"
          >
            ×
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="wm-stats">
        <div className="wm-stat-card">
          <div className="wm-stat-icon wm-icon-blue">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <div className="wm-stat-number">{stats.totalWorkers}</div>
            <div className="wm-stat-label">Total Workers</div>
          </div>
        </div>

        <div className="wm-stat-card">
          <div className="wm-stat-icon wm-icon-green">
            <i className="fas fa-user-check"></i>
          </div>
          <div>
            <div className="wm-stat-number">{stats.activeWorkers}</div>
            <div className="wm-stat-label">Active Workers</div>
          </div>
        </div>

        <div className="wm-stat-card">
          <div className="wm-stat-icon wm-icon-red">
            <i className="fas fa-user-slash"></i>
          </div>
          <div>
            <div className="wm-stat-number">{stats.inactiveWorkers}</div>
            <div className="wm-stat-label">Inactive Workers</div>
          </div>
        </div>
      </div>

      {/* WORKER DIRECTORY TABLE */}
      <div className="wm-table-card">
        <div className="wm-table-header">
          <div className="wm-table-title-row">
            <h2>
              <i className="fas fa-address-card"></i> Worker Registry
            </h2>
            <div className="wm-table-meta">
              <span>
                <i className="far fa-file-alt"></i> Total: {filteredWorkers.length}
              </span>
              <span className="wm-active-badge">
                <i className="fas fa-circle"></i> Active: {activeCount}
              </span>
            </div>
          </div>

          <div className="wm-filters">
            <input
              className="wm-search"
              type="text"
              placeholder="🔍 Search by name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="wm-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <select
              className="wm-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="wm-loading">
            <i className="fas fa-spinner fa-pulse wm-loading-spinner"></i>
            {' '}Loading workforce data...
          </div>
        ) : (
          <div className="wm-table-wrap">
            <table className="wm-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Date of Birth</th>
                  <th>Home Address</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="wm-empty">
                      <i className="fas fa-user-friends"></i> No workers found
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((worker) => (
                    <tr key={worker.workerId || worker.id}>
                      <td className="wm-name-cell">
                        <div className="wm-avatar">
                          {worker.firstName?.[0]}
                          {worker.lastName?.[0]}
                        </div>
                        <span>
                          {worker.firstName} {worker.lastName}
                        </span>
                      </td>
                      <td>{worker.email || '—'}</td>
                      <td>{worker.phone || '—'}</td>
                      <td>{worker.position}</td>
                      <td>{worker.department}</td>
                      <td>{worker.dateOfBirth || '—'}</td>
                      <td className="wm-address">
                        {worker.address || '—'}
                      </td>
                      <td>{worker.hireDate || '—'}</td>
                      <td>
                        <span
                          className={`wm-status ${
                            worker.status === 'ACTIVE'
                              ? 'wm-status-active'
                              : 'wm-status-inactive'
                          }`}
                        >
                          <i
                            className={`fas fa-${
                              worker.status === 'ACTIVE' ? 'check' : 'ban'
                            }`}
                          ></i>
                          {worker.status}
                        </span>
                      </td>
                      <td>
                        <div className="wm-actions">
                          <button
                            className="wm-btn-edit"
                            onClick={() => handleEdit(worker)}
                            title="Edit worker"
                            aria-label="Edit"
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                          <button
                            className="wm-btn-delete"
                            onClick={() => handleDelete(worker.workerId)}
                            title="Delete worker"
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div
          className="wm-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="wm-modal">
            <div className="wm-modal-header">
              <h2>
                {editingWorker ? (
                  <>
                    <i className="fas fa-user-edit"></i> Edit Worker Profile
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i> Onboard New Talent
                  </>
                )}
              </h2>
              <button
                className="wm-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="wm-form">
              <div className="wm-form-grid">
                <div className="wm-field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>

                <div className="wm-field">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>

                <div className="wm-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@company.com"
                  />
                </div>

                <div className="wm-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 555 123 4567"
                  />
                </div>

                <div className="wm-field">
                  <label>Position *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  >
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="wm-field">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="wm-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="wm-field">
                  <label>Hire Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="wm-field">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="wm-field wm-field-full">
                  <label>Home Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter home address"
                  />
                </div>
              </div>

              <div className="wm-modal-footer">
                <button
                  type="button"
                  className="wm-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="wm-save-btn">
                  {editingWorker ? 'Update Worker' : 'Save Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;