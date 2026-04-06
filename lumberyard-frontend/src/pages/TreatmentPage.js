import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import './TreatmentPage.css';

const TreatmentPage = () => {
    const [treatments, setTreatments] = useState([]);
    const [treatmentHistory, setTreatmentHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [historyDetails, setHistoryDetails] = useState([]);
    const [timbers, setTimbers] = useState([]);
    const [timberTracking, setTimberTracking] = useState([]);
    const [chemicals, setChemicals] = useState([]);
    const [newTreatment, setNewTreatment] = useState({
        timberCode: '',
        chemicalType: '',
        timberQuantity: '',
        chemicalQuantity: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', data: null, message: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [trackingTab, setTrackingTab] = useState('timber-tracking');
    const [deleteAllModal, setDeleteAllModal] = useState(false);
    const [deleteToken, setDeleteToken] = useState(null);
    const [user, setUser] = useState(null);
    const [deleteHistoryModal, setDeleteHistoryModal] = useState({ isOpen: false, historyId: null, treatmentId: null, eventType: '' });

    const stages = ['STARTED', 'LOADING', 'APPLICATION', 'CURING', 'FINISHED'];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchTreatments(), fetchTimbers(), fetchTimberTracking(), fetchChemicals(), fetchTreatmentHistory()]);
        setLoading(false);
    };

    const fetchTreatments = async () => {
        try {
            const response = await API.get('/treatment/active');
            setTreatments(response.data);
        } catch (error) {
            console.error('Error fetching treatments:', error);
        }
    };

    const fetchTreatmentHistory = async () => {
        try {
            const response = await API.get('/treatment/history');
            setTreatmentHistory(response.data);
        } catch (error) {
            console.error('Error fetching treatment history:', error);
        }
    };

    const fetchHistoryDetails = async (treatmentId) => {
        try {
            const response = await API.get(`/treatment/${treatmentId}/history`);
            setHistoryDetails(response.data);
        } catch (error) {
            console.error('Error fetching history details:', error);
        }
    };

    const fetchTimbers = async () => {
        try {
            const response = await API.get('/timber/all');
            // Filter only untreated timber
            const untreatedTimbers = response.data.filter(t => t.status === 'Untreated');
            setTimbers(untreatedTimbers);
        } catch (error) {
            console.error('Error fetching timbers:', error);
        }
    };

    const fetchTimberTracking = async () => {
        try {
            const response = await API.get('/timber-tracking/all');
            setTimberTracking(response.data);
        } catch (error) {
            console.error('Error fetching timber tracking:', error);
        }
    };

    const fetchChemicals = async () => {
        try {
            const response = await API.get('/chemical/all');
            setChemicals(response.data);
        } catch (error) {
            console.error('Error fetching chemicals:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTreatment({ ...newTreatment, [name]: value });
        if (message) setMessage('');
    };

    const handleAddTreatment = async (e) => {
        e.preventDefault();

        if (!newTreatment.timberCode || !newTreatment.chemicalType || !newTreatment.timberQuantity || !newTreatment.chemicalQuantity) {
            setMessage('Please fill in all fields');
            setMessageType('error');
            return;
        }

        const selectedTimber = timbers.find(t => t.timberCode === newTreatment.timberCode);
        if (selectedTimber && parseFloat(newTreatment.timberQuantity) > selectedTimber.quantity) {
            setMessage(`Timber quantity exceeds available amount (${selectedTimber.quantity})`);
            setMessageType('error');
            return;
        }
        
        // Validate chemical quantity
        const selectedChemical = chemicals.find(c => c.name === newTreatment.chemicalType);
        if (selectedChemical && parseFloat(newTreatment.chemicalQuantity) > selectedChemical.quantity) {
            setMessage(`Chemical quantity exceeds available amount (${selectedChemical.quantity})`);
            setMessageType('error');
            return;
        }

        const confirmMessage = `Are you sure you want to start the treatment process using ${newTreatment.timberQuantity} unit(s) of ${newTreatment.timberCode} with ${newTreatment.chemicalQuantity} units of ${newTreatment.chemicalType}?`;
        setConfirmModal({
            isOpen: true,
            type: 'start',
            data: { ...newTreatment },
            message: confirmMessage
        });
    };

    const confirmStartTreatment = async () => {
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        setIsSubmitting(true);
        try {
            const selectedTimber = timbers.find(t => t.timberCode === confirmModal.data.timberCode);
            const treatmentData = {
                timberId: selectedTimber.id,
                chemicalType: confirmModal.data.chemicalType,
                timberQuantity: parseFloat(confirmModal.data.timberQuantity),
                chemicalQuantity: parseFloat(confirmModal.data.chemicalQuantity)
            };
            
            await API.post('/treatment/start', treatmentData);
            await fetchTreatments();
            await fetchTimbers(); // Refresh timber list with updated quantities
            await fetchChemicals(); // Refresh chemical list with updated quantities
            setNewTreatment({ timberCode: '', chemicalType: '', timberQuantity: '', chemicalQuantity: '' });
            setMessage('Treatment process started successfully! Timber and chemicals deducted immediately.');
            setMessageType('success');
        } catch (error) {
            console.error('Error adding treatment:', error);
            setMessage('Failed to start treatment process');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinishTreatment = (treatment) => {
        setConfirmModal({
            isOpen: true,
            type: 'finish',
            data: treatment,
            message: `Are you sure you want to finish the treatment? This will mark timber ${treatment.timber.timberCode} as "Treated". Chemicals and timber were deducted at start and will NOT be refunded.`
        });
    };

    const handleStatusClick = (treatment, status) => {
        // If clicking FINISHED, show confirmation popup
        if (status === 'FINISHED') {
            handleFinishTreatment(treatment);
            return;
        }

        // For other statuses, update directly
        updateStatus(treatment.id, status);
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/treatment/${id}/status`, { status });
            fetchTreatments();
            fetchTreatmentHistory();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const confirmFinishTreatment = async () => {
        const treatment = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            const response = await API.post(`/treatment/${treatment.id}/finish`);
            await fetchTreatments();
            await fetchTreatmentHistory();
            await fetchTimbers(); // Refresh timber list
            await fetchTimberTracking(); // Refresh tracking data
            
            // Show success message with info about new treated timber
            setMessage('Treatment finished successfully! New treated timber created. Check inventory for details.');
            setMessageType('success');
        } catch (error) {
            console.error('Error finishing treatment:', error);
            setMessage(error.response?.data?.message || 'Failed to finish treatment');
            setMessageType('error');
        }
    };

    const handleCancelTreatment = (treatment) => {
        setConfirmModal({
            isOpen: true,
            type: 'cancel',
            data: treatment,
            message: `Are you sure you want to cancel the treatment? Timber (${treatment.timberQuantity} units) and chemicals (${treatment.chemicalQuantity} units of ${treatment.chemicalType}) will be refunded back to inventory.`
        });
    };

    const confirmCancelTreatment = async () => {
        const treatment = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            await API.post(`/treatment/${treatment.id}/cancel`);
            await fetchTreatments();
            await fetchTreatmentHistory();
            await fetchTimbers(); // Refresh timber list with refunded quantity
            await fetchChemicals(); // Refresh chemical list
            setMessage('Treatment cancelled successfully! Timber and chemicals refunded to inventory.');
            setMessageType('success');
        } catch (error) {
            console.error('Error cancelling treatment:', error);
            setMessage('Failed to cancel treatment');
            setMessageType('error');
        }
    };

    const handleDeleteTreatment = (treatment) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            data: treatment,
            message: `Are you sure you want to delete this treatment? Materials will NOT be refunded (already deducted at start). Timber (${treatment.timberQuantity} units) and chemicals (${treatment.chemicalQuantity} units of ${treatment.chemicalType}) are considered lost.`
        });
    };

    const handleDeleteHistory = (historyId, treatmentId, eventType) => {
        // Show confirmation for FINISHED, CANCELLED and DELETED records (these delete the treatment too)
        if (eventType === 'FINISHED' || eventType === 'CANCELLED' || eventType === 'DELETED') {
            setDeleteHistoryModal({ isOpen: true, historyId, treatmentId, eventType });
        } else {
            // For STARTED and STATUS_CHANGE, delete immediately without confirmation
            confirmDeleteHistory(historyId, treatmentId, eventType);
        }
    };

    const confirmDeleteHistory = async (historyId, treatmentId, eventType) => {
        setDeleteHistoryModal({ isOpen: false, historyId: null, treatmentId: null, eventType: '' });
        try {
            // If it's a final state record, also delete the treatment
            if (eventType === 'FINISHED' || eventType === 'CANCELLED' || eventType === 'DELETED') {
                await API.delete(`/treatment/${treatmentId}/permanent`);
            } else {
                // Just delete the history record
                await API.delete(`/treatment/history/${historyId}`);
            }
            await fetchTreatmentHistory();
            setMessage('Record deleted permanently!');
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting history:', error);
            setMessage('Failed to delete record');
            setMessageType('error');
        }
    };

    const confirmDeleteTreatment = async () => {
        const treatment = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            if (treatment.isPermanent) {
                // Permanent delete - removes from database completely
                await API.delete(`/treatment/${treatment.id}/permanent`);
                setMessage('Treatment permanently deleted! Timber and chemicals were NOT refunded (already deducted at start).');
            } else {
                // Soft delete - moves to history
                await API.delete(`/treatment/${treatment.id}`);
                setMessage('Treatment moved to history successfully! Timber and chemicals were NOT refunded (already deducted at start).');
            }
            await fetchTreatments();
            await fetchTreatmentHistory();
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting treatment:', error);
            setMessage('Failed to delete treatment');
            setMessageType('error');
        }
    };

    const openHistoryModal = async (treatment) => {
        setSelectedHistory(treatment);
        await fetchHistoryDetails(treatment.production?.id || treatment.treatment?.id);
        await fetchTimbers(); // Refresh timber list to show updated quantities
        await fetchChemicals(); // Refresh chemical list
        setShowHistoryModal(true);
    };

    const handleDeleteAllHistory = () => {
        setDeleteToken(Math.random().toString(36).substring(2, 15));
        setDeleteAllModal(true);
    };

    const confirmDeleteAllHistory = async () => {
        setDeleteAllModal(false);
        if (!window.confirm('FINAL CONFIRMATION: This is your last chance to cancel. ALL stored treatments will be permanently deleted. Click OK to proceed.')) {
            setDeleteToken(null);
            return;
        }
        try {
            await API.delete(`/treatment/history/all?token=${deleteToken}`);
            setDeleteToken(null);
            await fetchTreatmentHistory();
            setMessage('All treatments deleted from history!');
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting all history:', error);
            setDeleteToken(null);
            setMessage('Failed to delete all records');
            setMessageType('error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'STARTED': return '#3b82f6';
            case 'FINISHED': return '#059669';
            case 'CANCELLED': return '#f59e0b';
            case 'DELETED': return '#ef4444';
            default: return '#64748b';
        }
    };

    const getEventTypeIcon = (eventType) => {
        switch (eventType) {
            case 'STARTED': return '▶';
            case 'FINISHED': return '✓';
            case 'CANCELLED': return '✕';
            case 'DELETED': return '🗑';
            default: return '•';
        }
    };

    const getStageState = (currentStatus, stage) => {
        // If process is cancelled or deleted, show all stages as pending except current
        if (currentStatus === 'CANCELLED' || currentStatus === 'DELETED') {
            return 'pending';
        }
        const currentIndex = stages.indexOf(currentStatus);
        const stageIndex = stages.indexOf(stage);

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'current';
        return 'pending';
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="treatment-page">
            <div className="page-content">
                <div className="page-header">
                    <div className="header-left">
                        <h1>Treatment Process</h1>
                        <span className="header-badge">Chemical Treatment Management</span>
                    </div>
                    <div className="header-right">
                        <div className="date-display">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>{new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
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
                                <h3>Start New Treatment</h3>
                                <p className="header-description">Initiate a new chemical treatment process</p>
                            </div>

                            <form onSubmit={handleAddTreatment} className="production-form">
                                <div className="form-section">
                                    <div className="form-group">
                                        <label>Chemical Type <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <select 
                                                name="chemicalType" 
                                                value={newTreatment.chemicalType} 
                                                onChange={handleInputChange} 
                                                className="form-select" 
                                                required
                                            >
                                                <option value="">Select Chemical Type</option>
                                                {chemicals.map(chemical => (
                                                    <option key={chemical.id} value={chemical.name}>
                                                        {chemical.name} - {chemical.status} (Qty: {chemical.quantity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Timber Code (Untreated Only) <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <select 
                                                name="timberCode" 
                                                value={newTreatment.timberCode} 
                                                onChange={handleInputChange} 
                                                className="form-select" 
                                                required
                                            >
                                                <option value="">Select Timber Code</option>
                                                {timbers.map(timber => (
                                                    <option key={timber.id} value={timber.timberCode}>
                                                        {timber.timberCode} - (Qty: {timber.quantity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Timber Quantity <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <input
                                                type="number"
                                                name="timberQuantity"
                                                placeholder={newTreatment.timberCode ? `Max: ${timbers.find(t => t.timberCode === newTreatment.timberCode)?.quantity || 0}` : "Enter quantity"}
                                                value={newTreatment.timberQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                max={timbers.find(t => t.timberCode === newTreatment.timberCode)?.quantity || ''}
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Chemical Quantity <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <input
                                                type="number"
                                                name="chemicalQuantity"
                                                placeholder={newTreatment.chemicalType ? `Max: ${chemicals.find(c => c.name === newTreatment.chemicalType)?.quantity || 0}` : "Enter chemical quantity"}
                                                value={newTreatment.chemicalQuantity}
                                                onChange={handleInputChange}
                                                min="0.1"
                                                step="0.1"
                                                max={chemicals.find(c => c.name === newTreatment.chemicalType)?.quantity || ''}
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
                                        ) : 'Start Treatment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Treatments ({treatments.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Treatment History ({treatmentHistory.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tracking')}
                    >
                        Timber Tracking ({timberTracking.length})
                    </button>
                </div>

                <div className="table-section">
                    <div className="section-header">
                        <h2>{activeTab === 'active' ? 'Active Treatments' : 'Treatment History'}</h2>
                        <button className="action-button refresh" onClick={fetchData}>
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                             <path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                           </svg> Refresh
                        </button>
                    </div>

                    {loading ? (
                       <div className="table-loading">
                          <div className="loading-spinner"></div>
                          <p>Loading treatments...</p>
                       </div>
                    ) : activeTab === 'active' ? (
                        treatments.length === 0 ? (
                           <div className="empty-state">
                             <div className="empty-state-icon">
                               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                 <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                 <line x1="16" y1="2" x2="16" y2="6"></line>
                                 <line x1="8" y1="2" x2="8" y2="6"></line>
                                 <line x1="3" y1="10" x2="21" y2="10"></line>
                               </svg>
                             </div>
                             <h3>No Active Treatments</h3>
                             <p>There are currently no active treatment processes. Start a new treatment using the form above.</p>
                           </div>
                        ) : (
                           <div className="production-list">
                             {treatments
                                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                                .map(treatment => (
                                <div key={treatment.id} className="production-card">
                                    <div className="card-header">
                                       <div className="process-details">
                                          <h4>{treatment.chemicalType}</h4>
                                          <span className="timber-tag">{treatment.timber.timberCode}</span>
                                          <span className="id-tag">ID: {treatment.id}</span>
                                       </div>
                                       <div className="process-meta">
                                          <span className="amount-tag">Timber: {treatment.timberQuantity}</span>
                                          <span className="amount-tag">Chemical: {treatment.chemicalQuantity}</span>
                                          <div className="action-buttons">
                                              <button className="finish-btn" onClick={() => handleFinishTreatment(treatment)} title="Finish Treatment">
                                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                  </svg>
                                                  Finish
                                              </button>
                                              <button className="cancel-btn" onClick={() => handleCancelTreatment(treatment)} title="Cancel Treatment">
                                                  Cancel
                                              </button>
                                              <button className="delete-sm-btn" onClick={() => handleDeleteTreatment(treatment)} title="Delete Treatment">
                                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                                                  </svg>
                                              </button>
                                          </div>
                                       </div>
                                    </div>
                                    
                                    <div className="card-body">
                                       <div className="time-info">
                                          <div className="time-item">
                                             <span className="time-label">Started</span>
                                             <span className="time-value">{new Date(treatment.startTime).toLocaleString()}</span>
                                          </div>
                                          {treatment.endTime && (
                                             <div className="time-item">
                                                <span className="time-label">Finished</span>
                                                <span className="time-value">{new Date(treatment.endTime).toLocaleString()}</span>
                                             </div>
                                          )}
                                       </div>
                                       
                                       {/* Status Stages */}
                                       <div className="progress-tracker">
                                            {stages.map((stage, index) => {
                                                const state = getStageState(treatment.status, stage);
                                                return (
                                                    <div key={stage} className={`tracker-step ${state}`} onClick={() => handleStatusClick(treatment, stage)}>
                                                        <div className="step-circle">
                                                            {state === 'completed' || state === 'current' ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            ) : null}
                                                        </div>
                                                        <span className="step-label">{stage.replace('_', ' ')}</span>
                                                        {index < stages.length - 1 && <div className="step-line"></div>}
                                                    </div>
                                                );
                                            })}
                                       </div>
                                    </div>
                                </div>
                             ))}
                           </div>
                        )
                    ) : activeTab === 'tracking' ? (
                        // Timber Tracking Tab
                        timberTracking.length === 0 ? (
                           <div className="empty-state">
                             <div className="empty-state-icon">
                               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                 <circle cx="12" cy="12" r="10"></circle>
                                 <polyline points="12 6 12 12 16 14"></polyline>
                               </svg>
                             </div>
                             <h3>No Timber Tracking Records</h3>
                             <p>Treated timber tracking records will appear here after treatment processes are completed.</p>
                           </div>
                        ) : (
                           <div className="production-list">
                             {timberTracking.map(tracking => {
                                const treatedTimber = tracking.treatedTimber;
                                const originalTimber = tracking.originalTimber;
                                return (
                                    <div key={tracking.id} className="production-card history-card">
                                        <div className="card-header">
                                            <div className="process-details">
                                                <h4>{treatedTimber.timberCode}</h4>
                                                <span className="timber-tag">{treatedTimber.name}</span>
                                                <span className="status-badge" style={{backgroundColor: '#05966920', color: '#059669'}}>TREATED</span>
                                            </div>
                                            <div className="process-meta">
                                                <span className="amount-tag">Tracking ID: {tracking.id}</span>
                                                <span className="amount-tag">Total Qty: {treatedTimber.quantity}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="card-body">
                                            <div className="tracking-details-grid">
                                                <div className="tracking-detail-card">
                                                    <h5>Untreated Timber (Original)</h5>
                                                    <div className="detail-row">
                                                        <span className="detail-label">ID:</span>
                                                        <span className="detail-value">{originalTimber.id}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Timber Code:</span>
                                                        <span className="detail-value">{originalTimber.timberCode}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Current Quantity:</span>
                                                        <span className="detail-value">{originalTimber.quantity}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Status:</span>
                                                        <span className="detail-value">{originalTimber.status}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="tracking-arrow">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                                    </svg>
                                                </div>
                                                
                                                <div className="tracking-detail-card">
                                                    <h5>Treated Timber (New)</h5>
                                                    <div className="detail-row">
                                                        <span className="detail-label">ID:</span>
                                                        <span className="detail-value">{treatedTimber.id}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Timber Code:</span>
                                                        <span className="detail-value">{treatedTimber.timberCode}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Tracked Quantity:</span>
                                                        <span className="detail-value">{tracking.treatedQuantity}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Status:</span>
                                                        <span className="detail-value">{treatedTimber.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                           </div>
                        )
                    ) : (
                        // History Tab
                        treatmentHistory.length === 0 ? (
                           <div className="empty-state">
                             <div className="empty-state-icon">
                               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                 <circle cx="12" cy="12" r="10"></circle>
                                 <polyline points="12 6 12 12 16 14"></polyline>
                               </svg>
                             </div>
                             <h3>No History</h3>
                             <p>No treatment history records found.</p>
                           </div>
                        ) : (
                           <>
                           <div className="history-actions">
                                {isAdmin && (
                                   <button className="delete-all-btn" onClick={handleDeleteAllHistory}>
                                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                           <polyline points="3 6 5 6 21 6"></polyline>
                                           <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                           <line x1="10" y1="11" x2="10" y2="17"></line>
                                           <line x1="14" y1="11" x2="14" y2="17"></line>
                                       </svg>
                                       Delete All Treatments from History
                                   </button>
                                )}
                           </div>
                           <div className="production-list">
                             {treatmentHistory
                                .map(history => (
                                <div key={history.id} className="production-card history-card">
                                    <div className="card-header">
                                       <div className="process-details">
                                          <h4>{history.treatment?.chemicalType || 'Treatment'}</h4>
                                          <span className="timber-tag">{history.treatment?.timber?.timberCode || 'N/A'}</span>
                                          <span className="id-tag">ID: {history.treatment?.id || '-'}</span>
                                          <span className="status-badge" style={{backgroundColor: getStatusColor(history.toStatus || history.eventType) + '20', color: getStatusColor(history.toStatus || history.eventType)}}>
                                              {history.eventType === 'STATUS_CHANGE' ? `${history.fromStatus} → ${history.toStatus}` : history.eventType}
                                          </span>
                                       </div>
                                       <div className="process-meta">
                                          <span className="amount-tag">Timber: {history.treatment?.timberQuantity || '-'}</span>
                                          <span className="amount-tag">Chemical: {history.treatment?.chemicalQuantity || '-'}</span>
                                          {isAdmin && (
                                              <button className="delete-sm-btn" onClick={() => handleDeleteHistory(history.id, history.treatment?.id, history.eventType)} title="Delete Record Permanently">
                                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                                                  </svg>
                                              </button>
                                          )}
                                       </div>
                                    </div>
                                    
                                    <div className="card-body">
                                       <div className="time-info">
                                          <div className="time-item">
                                             <span className="time-label">Time</span>
                                             <span className="time-value">{new Date(history.changeTime).toLocaleString()}</span>
                                          </div>
                                       </div>
                                       <p className="history-notes">{history.notes}</p>
                                       {history.fromStatus && history.toStatus && (
                                           <p className="timeline-status-change">{history.fromStatus} → {history.toStatus}</p>
                                       )}
                                    </div>
                                </div>
                             ))}
                           </div>
                           </>
                        )
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
                            <h3>{confirmModal.type === 'delete' ? 'Delete Treatment' : 'Confirm Action'}</h3>
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
                                className={`modal-confirm-btn ${confirmModal.type === 'delete' || confirmModal.type === 'cancel' ? 'danger' : 'primary'}`}
                                onClick={confirmModal.type === 'delete' ? confirmDeleteTreatment : confirmModal.type === 'finish' ? confirmFinishTreatment : confirmModal.type === 'cancel' ? confirmCancelTreatment : confirmStartTreatment}
                            >
                                {confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'finish' ? 'Finish' : confirmModal.type === 'cancel' ? 'Cancel Treatment' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Detail Modal */}
            {showHistoryModal && selectedHistory && (
                <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="history-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Treatment History Timeline</h3>
                            <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="process-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Chemical:</span>
                                    <span className="summary-value">{selectedHistory.chemicalType}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Timber:</span>
                                    <span className="summary-value">{selectedHistory.timber?.timberCode}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Timber Qty:</span>
                                    <span className="summary-value">{selectedHistory.timberQuantity} units</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Chemical Qty:</span>
                                    <span className="summary-value">{selectedHistory.chemicalQuantity} units</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Final Status:</span>
                                    <span className="summary-value" style={{color: getStatusColor(selectedHistory.status)}}>{selectedHistory.status}</span>
                                </div>
                            </div>
                            
                            <div className="timeline">
                                <h4>Timeline</h4>
                                {historyDetails.length === 0 ? (
                                    <p className="no-history">No detailed history available</p>
                                ) : (
                                    historyDetails.sort((a, b) => new Date(a.changeTime) - new Date(b.changeTime)).map((event, index) => (
                                        <div key={event.id} className="timeline-item">
                                            <div className="timeline-marker" style={{backgroundColor: getStatusColor(event.toStatus || event.eventType)}}>
                                                {getEventTypeIcon(event.eventType)}
                                            </div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <span className="timeline-event">{event.eventType}</span>
                                                    <span className="timeline-time">{new Date(event.changeTime).toLocaleString()}</span>
                                                </div>
                                                <p className="timeline-notes">{event.notes}</p>
                                                {event.fromStatus && event.toStatus && (
                                                    <p className="timeline-status-change">
                                                        {event.fromStatus} → {event.toStatus}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete History Modal */}
            {deleteHistoryModal.isOpen && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div className="modal-header">
                            <div className="modal-icon danger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </div>
                            <h3>Confirm Deletion</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to permanently delete this history record?</p>
                            <p style={{color: '#dc2626', fontSize: '13px', marginTop: '8px'}}>
                                This will also delete the associated treatment from the database.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-cancel-btn"
                                onClick={() => setDeleteHistoryModal({ isOpen: false, historyId: null, treatmentId: null, eventType: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-confirm-btn danger"
                                onClick={() => confirmDeleteHistory(deleteHistoryModal.historyId, deleteHistoryModal.treatmentId, deleteHistoryModal.eventType)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete All Warning Modal */}
            {deleteAllModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div className="modal-header">
                            <div className="modal-icon danger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </div>
                            <h3>WARNING: Delete All Treatments</h3>
                        </div>
                        <div className="modal-body">
                            <p style={{color: '#dc2626', fontWeight: 500, marginBottom: '12px'}}>
                                This will permanently delete ALL stored treatments and their history records from the database.
                            </p>
                            <p>This action cannot be undone. You will be asked to confirm one more time.</p>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="modal-cancel-btn" 
                                onClick={() => setDeleteAllModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-confirm-btn danger"
                                onClick={confirmDeleteAllHistory}
                            >
                                I Understand, Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TreatmentPage;
