import React, { useState, useEffect } from 'react';
import API from '../services/api'; // Import the configured API instance
import { Link } from 'react-router-dom';
import './ProductionPage.css';

const ProductionPage = () => {
    const [productions, setProductions] = useState([]);
    const [timbers, setTimbers] = useState([]);
    const [selectedTimber, setSelectedTimber] = useState(null);
    const [newProduction, setNewProduction] = useState({
        timberCode: '',
        processType: '',
        amount: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', data: null, message: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchProductions(), fetchTimbers()]);
        setLoading(false);
    }

    const fetchProductions = async () => {
        try {
            const response = await API.get('/production');
            setProductions(response.data);
        } catch (error) {
            console.error('Error fetching productions:', error);
        }
    };

    const fetchTimbers = async () => {
        try {
            const response = await API.get('/production/timber');
            setTimbers(response.data);
        } catch (error) {
            console.error('Error fetching timbers:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduction({ ...newProduction, [name]: value });

        if (name === 'timberCode') {
            const timber = timbers.find(t => t.timberCode === value);
            setSelectedTimber(timber);
            setNewProduction(prod => ({ ...prod, amount: '' }));
        }

        if (message) setMessage('');
    };

    const handleAddProduction = async (e) => {
        e.preventDefault();
        
        if (!newProduction.processType || !newProduction.timberCode || !newProduction.amount) {
            setMessage('Please fill in all fields');
            setMessageType('error');
            return;
        }

        if (selectedTimber && parseInt(newProduction.amount, 10) > selectedTimber.quantity) {
            setMessage('Amount to process cannot exceed available quantity.');
            setMessageType('error');
            return;
        }

        const confirmMessage = `Are you sure you want to start the ${newProduction.processType} process using ${newProduction.amount} unit(s) of ${newProduction.timberCode}?`;
        setConfirmModal({
            isOpen: true,
            type: 'start',
            data: newProduction,
            message: confirmMessage
        });
    };

    const confirmStartProduction = async () => {
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        setIsSubmitting(true);
        try {
            await API.post('/production', confirmModal.data);
            await fetchData();
            setNewProduction({ timberCode: '', processType: '', amount: '' });
            setSelectedTimber(null);
            setMessage('Process started successfully!');
            setMessageType('success');
        } catch (error) {
            console.error('Error adding production:', error);
            setMessage('Failed to start process');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduction = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            data: id,
            message: "Are you sure you want to delete this process? This cannot be undone."
        });
    };

    const confirmDeleteProduction = async () => {
        const id = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            await API.delete(`/production/${id}`);
            await fetchProductions();
        } catch (error) {
            console.error('Error deleting production:', error);
        }
    };

    const handleFinishProduction = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'finish',
            data: id,
            message: "Are you sure you want to mark this process as finished?"
        });
    };

    const confirmFinishProduction = async () => {
        const id = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            await API.post(`/production/${id}/finish`);
            await fetchProductions();
        } catch (error) {
            console.error('Error finishing production:', error);
        }
    };

    return (
        <div className="production-page">
            <div className="page-content">
                <div className="page-header">
                    <div className="header-left">
                        <h1>Production Process</h1>
                        <span className="header-badge">Process Management</span>
                    </div>
                     <div className="header-right">
                        <Link to="/main" className="action-button">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line>
                            </svg>
                            Back to Main
                        </Link>
                    </div>
                </div>

                <div className="content-grid-prod">
                    <div className="grid-center">
                        <div className="add-production-form">
                            <div className="add-production-header">
                                <h3>Start New Production</h3>
                                <p className="header-description">Initiate a new timber processing task</p>
                            </div>

                            <form onSubmit={handleAddProduction} className="production-form">
                                <div className="form-section">
                                    <div className="form-group">
                                        <label>Process Type <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                          <select name="processType" value={newProduction.processType} onChange={handleInputChange} className="form-select" required>
                                              <option value="">Select Process Type</option>
                                              <option value="Window 4x4">Window 4x4</option>
                                              <option value="Door 4x2">Door 4x2</option>
                                              <option value="Window 6x2">Window 6x2</option>
                                          </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Timber Code <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                          <select name="timberCode" value={newProduction.timberCode} onChange={handleInputChange} className="form-select" required>
                                              <option value="">Select Timber Code</option>
                                              {timbers.map(timber => (
                                                  <option key={timber.id} value={timber.timberCode}>
                                                      {timber.timberCode} (Qty: {timber.quantity})
                                                  </option>
                                              ))}
                                          </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Amount to Process {selectedTimber && `(Available: ${selectedTimber.quantity})`} <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                          <input
                                              type="number"
                                              name="amount"
                                              placeholder={selectedTimber ? `Max: ${selectedTimber.quantity}` : "Select timber first"}
                                              value={newProduction.amount}
                                              onChange={handleInputChange}
                                              min="1"
                                              max={selectedTimber ? selectedTimber.quantity : undefined}
                                              className="form-input"
                                              required
                                          />
                                        </div>
                                    </div>
                                </div>
                                
                                {message && (
                                    <div className={`message ${messageType}`}>
                                        <div className="message-content">
                                            <span className="message-icon">
                                                {messageType === "success" ? "✓" : "!"}
                                            </span>
                                            <span>{message}</span>
                                        </div>
                                        <button type="button" className="message-close" onClick={() => setMessage("")}>×</button>
                                    </div>
                                )}

                                <div className="form-actions-prod">
                                    <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting || loading}>
                                        {isSubmitting ? (
                                           <><span className="spinner"></span>Starting...</>
                                        ) : 'Start Process'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="section-header">
                        <h2>Active Processes</h2>
                        <button className="action-button refresh" onClick={fetchData}>
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                             <path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                           </svg> Refresh
                        </button>
                    </div>

                    {loading ? (
                       <div className="table-loading">
                          <div className="loading-spinner"></div>
                          <p>Loading processes...</p>
                       </div>
                    ) : productions.length === 0 ? (
                       <div className="empty-state">
                         <div className="empty-state-icon">
                           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                             <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                             <line x1="16" y1="2" x2="16" y2="6"></line>
                             <line x1="8" y1="2" x2="8" y2="6"></line>
                             <line x1="3" y1="10" x2="21" y2="10"></line>
                           </svg>
                         </div>
                         <h3>No Active Processes</h3>
                         <p>There are currently no active production processes. Start a new process using the form above.</p>
                       </div>
                    ) : (
                       <div className="production-list">
                         {productions.map(production => (
                            <div key={production.id} className="production-card">
                                <div className="card-header">
                                   <div className="process-details">
                                      <h4>{production.processType}</h4>
                                      <span className="timber-tag">{production.timber.timberCode}</span>
                                   </div>
                                   <div className="process-meta">
                                      <span className="amount-tag">Qty: {production.amount}</span>
                                      {production.status !== 'FINISHED' && (
                                          <button className="finish-sm-btn" onClick={() => handleFinishProduction(production.id)} title="Finish Process">
                                              Finish
                                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                              </svg>
                                          </button>
                                      )}
                                      <button className="delete-sm-btn" onClick={() => handleDeleteProduction(production.id)} title="Delete Process">
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                                          </svg>
                                      </button>
                                   </div>
                                </div>
                                
                                <div className="card-body">
                                   <div className="time-info">
                                      <div className="time-item">
                                         <span className="time-label">Started</span>
                                         <span className="time-value">{new Date(production.startTime).toLocaleString()}</span>
                                      </div>
                                   </div>
                                    <div className="status-display">
                                        <span className={`status-text ${production.status === 'FINISHED' ? 'finished' : 'started'}`}>
                                            {production.status === 'FINISHED' ? 'Finished' : 'Started'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                         ))}
                       </div>
                    )}
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div className="modal-header">
                            <div className={`modal-icon ${confirmModal.type === 'delete' ? 'danger' : 'info'}`}>
                                {confirmModal.type === 'delete' ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                )}
                            </div>
                            <h3>{confirmModal.type === 'delete' ? 'Delete Process' : confirmModal.type === 'finish' ? 'Finish Process' : 'Confirm Action'}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{confirmModal.message}</p>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="modal-cancel-btn" 
                                onClick={() => setConfirmModal({ isOpen: false, type: '', data: null, message: '' })}
                            >
                                Cancel
                            </button>
                            <button 
                                className={`modal-confirm-btn ${confirmModal.type === 'delete' ? 'danger' : confirmModal.type === 'finish' ? 'success' : 'primary'}`}
                                onClick={confirmModal.type === 'delete' ? confirmDeleteProduction : confirmModal.type === 'finish' ? confirmFinishProduction : confirmStartProduction}
                            >
                                {confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'finish' ? 'Finish' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionPage;
