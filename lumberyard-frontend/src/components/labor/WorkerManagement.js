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
  const [stats, setStats] = useState({ totalWorkers: 0, activeWorkers: 0, inactiveWorkers: 0 });

  const initialFormState = {
    firstName: '', lastName: '', email: '', phone: '',
    position: 'Sawyer', department: 'Sawmill', status: 'Active',
    hireDate: '', dateOfBirth: '', homeAddress: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const positions = [
    'Sawyer', 'Forklift Operator', 'Team Lead', 'Supervisor',
    'Quality Inspector', 'Maintenance Technician', 'Logistics Coordinator', 'Safety Officer', 'Other'
  ];

  const departments = [
    'Sawmill', 'Kiln Operation', 'Quality Control', 'Maintenance', 'Logistics', 'Administration'
  ];

  useEffect(() => {
    fetchWorkers();
    fetchStats();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/workers');
      setWorkers(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load workers.' });
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
      if (editingWorker) {
        await API.put(`/workers/${editingWorker.id}`, formData);
        setMessage({ type: 'success', text: 'Worker updated successfully!' });
      } else {
        await API.post('/workers', formData);
        setMessage({ type: 'success', text: 'Worker added successfully!' });
      }
      setShowModal(false);
      setEditingWorker(null);
      setFormData(initialFormState);
      fetchWorkers();
      fetchStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save worker.' });
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      firstName: worker.firstName, lastName: worker.lastName,
      email: worker.email || '', phone: worker.phone,
      position: worker.position, department: worker.department,
      status: worker.status, hireDate: worker.hireDate || '',
      dateOfBirth: worker.dateOfBirth || '', homeAddress: worker.homeAddress || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await API.delete(`/workers/${id}`);
        setMessage({ type: 'success', text: 'Worker deleted successfully!' });
        fetchWorkers();
        fetchStats();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete worker.' });
      }
    }
  };

  const openAddModal = () => {
    setEditingWorker(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch =
      `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.position || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || w.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const activeCount = filteredWorkers.filter(w => w.status === 'Active').length;

  return (
    <div className="wm-page">

      {/* ── GRADIENT HEADER ── */}
      <div className="wm-header">
        <button className="wm-back-btn" onClick={() => navigate('/labor')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="wm-header-text">
          <h1>Worker Profile Management</h1>
          <span className="wm-badge">HUMAN RESOURCES</span>
        </div>
        <button className="wm-add-btn" onClick={openAddModal}>
          + Add New Worker
        </button>
      </div>

      {/* ── ALERT MESSAGE ── */}
      {message && (
        <div className={`wm-alert wm-alert-${message.type}`}>
          {message.text}
          <button className="wm-alert-close" onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* ── STATS CARDS ── */}
      <div className="wm-stats">
        <div className="wm-stat-card">
          <div className="wm-stat-icon wm-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="wm-stat-number">{stats.totalWorkers}</div>
            <div className="wm-stat-label">Total Workers</div>
          </div>
        </div>

        <div className="wm-stat-card">
          <div className="wm-stat-icon wm-icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="wm-stat-number">{stats.activeWorkers}</div>
            <div className="wm-stat-label">Active Workers</div>
          </div>
        </div>

        <div className="wm-stat-card">
          <div className="wm-stat-icon wm-icon-red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div>
            <div className="wm-stat-number">{stats.inactiveWorkers}</div>
            <div className="wm-stat-label">Inactive Workers</div>
          </div>
        </div>
      </div>

      {/* ── WORKER DIRECTORY TABLE ── */}
      <div className="wm-table-card">
        <div className="wm-table-header">
          <div className="wm-table-title-row">
            <h2>Worker Directory</h2>
            <div className="wm-table-meta">
              <span>Total: {filteredWorkers.length}</span>
              <span className="wm-active-badge">Active: {activeCount}</span>
            </div>
          </div>

          <div className="wm-filters">
            <input
              className="wm-search"
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select className="wm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select className="wm-select" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="wm-loading">Loading...</div>
        ) : (
          <div className="wm-table-wrap">
            <table className="wm-table">
              <thead>
                <tr>
                  <th>Name ↑</th>
                  <th>Email</th>
                  <th>Phone Number</th>
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
                    <td colSpan="10" className="wm-empty">No workers found.</td>
                  </tr>
                ) : (
                  filteredWorkers.map(worker => (
                    <tr key={worker.id}>
                      <td className="wm-name-cell">
                        <div className="wm-avatar">{worker.firstName?.[0]}{worker.lastName?.[0]}</div>
                        <span>{worker.firstName} {worker.lastName}</span>
                      </td>
                      <td>{worker.email || '—'}</td>
                      <td>{worker.phone || '—'}</td>
                      <td>{worker.position}</td>
                      <td>{worker.department}</td>
                      <td>{worker.dateOfBirth || '—'}</td>
                      <td className="wm-address">{worker.homeAddress || '—'}</td>
                      <td>{worker.hireDate || '—'}</td>
                      <td>
                        <span className={`wm-status wm-status-${(worker.status || '').toLowerCase()}`}>
                          {worker.status}
                        </span>
                      </td>
                      <td>
                        <div className="wm-actions">
                          <button className="wm-btn-edit" onClick={() => handleEdit(worker)} title="Edit">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="wm-btn-delete" onClick={() => handleDelete(worker.id)} title="Delete">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
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

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="wm-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="wm-modal">
            <div className="wm-modal-header">
              <h2>{editingWorker ? 'Edit Worker Profile' : 'Add New Worker'}</h2>
              <button className="wm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="wm-form">
              <div className="wm-form-grid">
                <div className="wm-field">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="Enter first name" />
                </div>
                <div className="wm-field">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Enter last name" />
                </div>
                <div className="wm-field">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" />
                </div>
                <div className="wm-field">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="07XXXXXXXX" />
                </div>
                <div className="wm-field">
                  <label>Position *</label>
                  <select name="position" value={formData.position} onChange={handleInputChange} required>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="wm-field">
                  <label>Department *</label>
                  <select name="department" value={formData.department} onChange={handleInputChange} required>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="wm-field">
                  <label>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                </div>
                <div className="wm-field">
                  <label>Hire Date</label>
                  <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} />
                </div>
                <div className="wm-field">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="wm-field wm-field-full">
                  <label>Home Address</label>
                  <textarea name="homeAddress" value={formData.homeAddress} onChange={handleInputChange} rows="2" placeholder="Enter home address" />
                </div>
              </div>
              <div className="wm-modal-footer">
                <button type="button" className="wm-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="wm-save-btn">{editingWorker ? 'Update Worker' : 'Save Worker'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;
