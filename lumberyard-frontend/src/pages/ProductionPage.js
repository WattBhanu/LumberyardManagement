
import React, { useState, useEffect } from 'react';
import API from '../services/api'; // Import the configured API instance
import { Link } from 'react-router-dom';
import './ProductionPage.css';

const ProductionPage = () => {
    const [productions, setProductions] = useState([]);
    const [productionHistory, setProductionHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [historyDetails, setHistoryDetails] = useState([]);
    const [timbers, setTimbers] = useState([]);
    const [newProduction, setNewProduction] = useState({
        timberCode: '',
        processType: '',
        amount: ''
    });
    const [customDimensions, setCustomDimensions] = useState({
        type: '',
        width: '',
        height: ''
    });
    const [isCustomType, setIsCustomType] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', data: null, message: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [deleteAllModal, setDeleteAllModal] = useState(false);
    const [deleteToken, setDeleteToken] = useState(null);
    const [selectedProcessFilter, setSelectedProcessFilter] = useState('');
    const [user, setUser] = useState(null);

    const stages = ['STARTED', 'SAWING', 'PLANING', 'ASSEMBLY', 'FINISHED'];

    useEffect(() => {
        // Get user info from localStorage
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
        await Promise.all([fetchProductions(), fetchTimbers(), fetchProductionHistory()]);
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

    const fetchProductionHistory = async () => {
        try {
            const response = await API.get('/production/history');
            setProductionHistory(response.data);
        } catch (error) {
            console.error('Error fetching production history:', error);
        }
    };

    const fetchHistoryDetails = async (productionId) => {
        try {
            const response = await API.get(`/production/${productionId}/history`);
            setHistoryDetails(response.data);
        } catch (error) {
            console.error('Error fetching history details:', error);
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
        if (name === 'processType') {
            if (value === 'CUSTOM_DOOR' || value === 'CUSTOM_WINDOW') {
                setIsCustomType(true);
                setCustomDimensions({ ...customDimensions, type: value });
                setNewProduction({ ...newProduction, processType: '' });
            } else {
                setIsCustomType(false);
                setNewProduction({ ...newProduction, processType: value });
            }
        } else {
            setNewProduction({ ...newProduction, [name]: value });
        }
        if (message) setMessage('');
    };

    const handleCustomDimensionChange = (e) => {
        const { name, value } = e.target;
        setCustomDimensions({ ...customDimensions, [name]: value });
        if (message) setMessage('');
    };

    const getFinalProcessType = () => {
        if (isCustomType) {
            const typePrefix = customDimensions.type === 'CUSTOM_DOOR' ? 'Door' : 'Window';
            return `${typePrefix} ${customDimensions.width}x${customDimensions.height}`;
        }
        return newProduction.processType;
    };

    const handleAddProduction = async (e) => {
        e.preventDefault();

        const finalProcessType = getFinalProcessType();

        if (isCustomType && (!customDimensions.width || !customDimensions.height)) {
            setMessage('Please enter both custom dimensions');
            setMessageType('error');
            return;
        }

        if (!finalProcessType || !newProduction.timberCode || !newProduction.amount) {
            setMessage('Please fill in all fields');
            setMessageType('error');
            return;
        }

        const selectedTimber = timbers.find(t => t.timberCode === newProduction.timberCode);
        if (selectedTimber && parseFloat(newProduction.amount) > selectedTimber.quantity) {
            setMessage(`Amount exceeds available quantity (${selectedTimber.quantity})`);
            setMessageType('error');
            return;
        }

        const confirmMessage = `Are you sure you want to start the ${finalProcessType} process using ${newProduction.amount} unit(s) of ${newProduction.timberCode}?`;
        setConfirmModal({
            isOpen: true,
            type: 'start',
            data: { ...newProduction, processType: finalProcessType },
            message: confirmMessage
        });
    };

    const confirmStartProduction = async () => {
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        setIsSubmitting(true);
        try {
            await API.post('/production', confirmModal.data);
            await fetchProductions();
            await fetchTimbers(); // Refresh dropdown
            setNewProduction({ timberCode: '', processType: '', amount: '' });
            setCustomDimensions({ type: '', width: '', height: '' });
            setIsCustomType(false);
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

    const handleStatusClick = (production, status) => {
        // If clicking FINISHED, show confirmation popup
        if (status === 'FINISHED') {
            handleFinishProduction(production);
            return;
        }

        // For other statuses, update directly
        updateStatus(production.id, status);
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/production/${id}/status`, { status });
            fetchProductions();
            fetchProductionHistory();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleFinishProduction = (production) => {
        setConfirmModal({
            isOpen: true,
            type: 'finish',
            data: production,
            message: `Are you sure you want to finish the "${production.processType}" process? This will mark it as completed and remove it from active processes.`
        });
    };

    const confirmFinishProduction = async () => {
        const production = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            await API.post(`/production/${production.id}/finish`);
            await fetchProductions();
            await fetchProductionHistory();
            setMessage('Process finished successfully!');
            setMessageType('success');
        } catch (error) {
            console.error('Error finishing production:', error);
            setMessage('Failed to finish process');
            setMessageType('error');
        }
    };

    const handleCancelProduction = (production) => {
        setConfirmModal({
            isOpen: true,
            type: 'cancel',
            data: production,
            message: `Are you sure you want to cancel the "${production.processType}" process? This will restore ${production.amount} units to ${production.timber.timberCode} stock.`
        });
    };

    const confirmCancelProduction = async () => {
        const production = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            await API.post(`/production/${production.id}/cancel`);
            await fetchProductions();
            await fetchProductionHistory();
            await fetchTimbers(); // Refresh timber quantities
            setMessage('Process cancelled and stock restored!');
            setMessageType('success');
        } catch (error) {
            console.error('Error cancelling production:', error);
            setMessage('Failed to cancel process');
            setMessageType('error');
        }
    };

    const openHistoryModal = async (production) => {
        setSelectedHistory(production);
        await fetchHistoryDetails(production.id);
        setShowHistoryModal(true);
    };

    const handleDeleteProduction = (production) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            data: production.id,
            message: `Are you sure you want to delete the "${production.processType}" process? ${production.amount} units of timber will be discarded. This cannot be undone.`
        });
    };

    const confirmDeleteProduction = async () => {
        const id = confirmModal.data;
        setConfirmModal({ isOpen: false, type: '', data: null, message: '' });
        try {
            await API.delete(`/production/${id}`);
            await fetchProductions();
            await fetchProductionHistory();
            await fetchTimbers(); // Refresh dropdown after delete if backend restores stock
            setMessage('Process deleted successfully!');
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting production:', error);
            setMessage('Failed to delete process');
            setMessageType('error');
        }
    };

    const [deleteHistoryModal, setDeleteHistoryModal] = useState({ isOpen: false, historyId: null, productionId: null, eventType: '' });

    const handleDeleteHistory = (historyId, productionId, eventType) => {
        // Show confirmation for FINISHED, CANCELLED and DELETED records (these delete the production too)
        if (eventType === 'FINISHED' || eventType === 'CANCELLED' || eventType === 'DELETED') {
            setDeleteHistoryModal({ isOpen: true, historyId, productionId, eventType });
        } else {
            // For STARTED and STATUS_CHANGE, delete immediately without confirmation
            confirmDeleteHistory(historyId, productionId, eventType);
        }
    };

    const confirmDeleteHistory = async (historyId, productionId, eventType) => {
        setDeleteHistoryModal({ isOpen: false, historyId: null, productionId: null, eventType: '' });
        try {
            // If it's a final state record, also delete the production
            if (eventType === 'FINISHED' || eventType === 'CANCELLED' || eventType === 'DELETED') {
                await API.delete(`/production/${productionId}/permanent`);
            } else {
                // Just delete the history record
                await API.delete(`/production/history/${historyId}`);
            }
            await fetchProductionHistory();
            setMessage('Record deleted permanently!');
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting history:', error);
            setMessage('Failed to delete record');
            setMessageType('error');
        }
    };

    const handleDeleteAllHistory = () => {
        // Generate a random token for security
        setDeleteToken(Math.random().toString(36).substring(2, 15));
        setDeleteAllModal(true);
    };

    const confirmDeleteAllHistory = async () => {
        setDeleteAllModal(false);
        // Second confirmation via browser
        if (!window.confirm('FINAL CONFIRMATION: This is your last chance to cancel. ALL stored productions will be permanently deleted. Click OK to proceed.')) {
            setDeleteToken(null);
            return;
        }
        try {
            // Send the token in the request - backend will validate it
            await API.delete(`/production/history/all?token=${deleteToken}`);
            setDeleteToken(null);
            await fetchProductionHistory();
            setMessage('All productions deleted from history!');
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
            case 'STATUS_CHANGE': return '↻';
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

    // Check if user is admin
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="production-page">
            <div className="page-content">
                <div className="page-header">
                    <div className="header-left">
                        <h1>Production Process</h1>
                        <span className="header-badge">Process Management</span>
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
                                <h3>Start New Production</h3>
                                <p className="header-description">Initiate a new timber processing task</p>
                            </div>

                            <form onSubmit={handleAddProduction} className="production-form">
                                <div className="form-section">
                                    <div className="form-group">
                                        <label>Process Type <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <select name="processType" value={isCustomType ? customDimensions.type : newProduction.processType} onChange={handleInputChange} className="form-select" required>
                                                <option value="">Select Process Type</option>
                                                <optgroup label="Windows">
                                                    <option value="Window 4x4">Window 4x4</option>
                                                    <option value="Window 6x2">Window 6x2</option>
                                                    <option value="Window 8x4">Window 8x4</option>
                                                    <option value="Window 10x6">Window 10x6</option>
                                                    <option value="CUSTOM_WINDOW">Custom Window</option>
                                                </optgroup>
                                                <optgroup label="Doors">
                                                    <option value="Door 4x2">Door 4x2</option>
                                                    <option value="Door 6x4">Door 6x4</option>
                                                    <option value="Door 8x6">Door 8x6</option>
                                                    <option value="Door 10x8">Door 10x8</option>
                                                    <option value="CUSTOM_DOOR">Custom Door</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                    {isCustomType && (
                                        <div className="form-group custom-dimensions">
                                            <label>Custom Dimensions <span className="required">*</span></label>
                                            <div className="input-wrapper dimensions-row">
                                                <input
                                                    type="text"
                                                    name="width"
                                                    placeholder="Width"
                                                    value={customDimensions.width}
                                                    onChange={handleCustomDimensionChange}
                                                    className="form-input dimension-input"
                                                    required
                                                />
                                                <span className="dimension-separator">x</span>
                                                <input
                                                    type="text"
                                                    name="height"
                                                    placeholder="Height"
                                                    value={customDimensions.height}
                                                    onChange={handleCustomDimensionChange}
                                                    className="form-input dimension-input"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Timber Code <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <select name="timberCode" value={newProduction.timberCode} onChange={handleInputChange} className="form-select" required>
                                                <option value="">Select Timber Code</option>
                                                {timbers.map(timber => (
                                                    <option key={timber.id} value={timber.timberCode}>
                                                        {timber.timberCode} - {timber.status === 'Treated' ? '[TREATED]' : '[UNTREATED]'} (Qty: {timber.quantity}){timber.originalTimberId ? ` (from T${timber.originalTimberId})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Amount to Process <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <input
                                                type="number"
                                                name="amount"
                                                placeholder={newProduction.timberCode ? `Max: ${timbers.find(t => t.timberCode === newProduction.timberCode)?.quantity || 0}` : "Enter amount"}
                                                value={newProduction.amount}
                                                onChange={handleInputChange}
                                                min="1"
                                                max={timbers.find(t => t.timberCode === newProduction.timberCode)?.quantity || ''}
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

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Processes ({productions.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History ({productionHistory.length})
                    </button>
                </div>

                <div className="table-section">
                    <div className="section-header">
                        <h2>{activeTab === 'active' ? 'Active Processes' : 'Process History'}</h2>
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
                    ) : activeTab === 'active' ? (
                        productions.length === 0 ? (
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
                                {productions
                                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                                    .map(production => (
                                        <div key={production.id} className="production-card">
                                            <div className="card-header">
                                                <div className="process-details">
                                                    <h4>{production.processType}</h4>
                                                    <span className="timber-tag">{production.timber.timberCode}</span>
                                                    <span className="id-tag">ID: {production.id}</span>
                                                </div>
                                                <div className="process-meta">
                                                    <span className="amount-tag">Qty: {production.amount}</span>
                                                    <div className="action-buttons">
                                                        <button className="finish-btn" onClick={() => handleFinishProduction(production)} title="Finish Process">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                            Finish
                                                        </button>
                                                        <button className="cancel-btn" onClick={() => handleCancelProduction(production)} title="Cancel Process">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                                            </svg>
                                                            Cancel
                                                        </button>
                                                        <button className="delete-sm-btn" onClick={() => handleDeleteProduction(production)} title="Delete Process">
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
                                                        <span className="time-value">{new Date(production.startTime).toLocaleString()}</span>
                                                    </div>
                                                    {production.endTime && (
                                                        <div className="time-item">
                                                            <span className="time-label">Finished</span>
                                                            <span className="time-value">{new Date(production.endTime).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="progress-tracker">
                                                    {stages.map((stage, index) => {
                                                        const state = getStageState(production.status, stage);
                                                        return (
                                                            <div key={stage} className={`tracker-step ${state}`} onClick={() => handleStatusClick(production, stage)}>
                                                                <div className="step-circle">
                                                                    {state === 'completed' || state === 'current' ? (
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                    ) : null}
                                                                </div>
                                                                <span className="step-label">{stage.replace('_', ' ')}</span>
                                                                {index < stages.length - 1 && <div className="step-line"></div>}
                                                            </div>
                                                        )})}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )
                    ) : (
                        // History Tab
                        productionHistory.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <h3>No History</h3>
                                <p>No history records found.</p>
                            </div>
                        ) : (
                            <>
                                <div className="history-actions">
                                    <select
                                        className="process-filter-select"
                                        value={selectedProcessFilter}
                                        onChange={(e) => setSelectedProcessFilter(e.target.value)}
                                    >
                                        <option value="">All Process Types</option>
                                        {[...new Set(productionHistory.map(h => h.production?.processType).filter(Boolean))].sort().map(processType => (
                                            <option key={processType} value={processType}>{processType}</option>
                                        ))}
                                    </select>
                                    {isAdmin && (
                                        <button className="delete-all-btn" onClick={handleDeleteAllHistory}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                            Delete All Productions from History
                                        </button>
                                    )}
                                </div>
                                <div className="production-list">
                                    {productionHistory
                                        .filter(history => !selectedProcessFilter || history.production?.processType === selectedProcessFilter)
                                        .map(history => (
                                            <div key={history.id} className="production-card history-card">
                                                <div className="card-header">
                                                    <div className="process-details">
                                                        <h4>{history.production?.processType || 'Production'}</h4>
                                                        <span className="timber-tag">{history.production?.timber?.timberCode || 'N/A'}</span>
                                                        <span className="id-tag">ID: {history.production?.id || '-'}</span>
                                                        <span className="status-badge" style={{backgroundColor: getStatusColor(history.toStatus || history.eventType) + '20', color: getStatusColor(history.toStatus || history.eventType)}}>
                                              {history.eventType === 'STATUS_CHANGE' ? `${history.fromStatus} → ${history.toStatus}` : history.eventType}
                                          </span>
                                                    </div>
                                                    <div className="process-meta">
                                                        <span className="amount-tag">Qty: {history.production?.amount || '-'}</span>
                                                        {isAdmin && (
                                                            <button className="delete-sm-btn" onClick={() => handleDeleteHistory(history.id, history.production?.id, history.eventType)} title="Delete Record Permanently from History">
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
                            <h3>{confirmModal.type === 'delete' ? 'Delete Process' : 'Confirm Action'}</h3>
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
                                onClick={confirmModal.type === 'delete' ? confirmDeleteProduction : confirmModal.type === 'finish' ? confirmFinishProduction : confirmModal.type === 'cancel' ? confirmCancelProduction : confirmStartProduction}
                            >
                                {confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'finish' ? 'Finish' : confirmModal.type === 'cancel' ? 'Cancel Process' : 'Confirm'}
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
                            <h3>Process History Timeline</h3>
                            <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="process-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Process:</span>
                                    <span className="summary-value">{selectedHistory.processType}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Timber:</span>
                                    <span className="summary-value">{selectedHistory.timber?.timberCode}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Amount:</span>
                                    <span className="summary-value">{selectedHistory.amount} units</span>
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
                            <h3>WARNING: Delete All Productions</h3>
                        </div>
                        <div className="modal-body">
                            <p style={{color: '#dc2626', fontWeight: 500, marginBottom: '12px'}}>
                                This will permanently delete ALL stored productions and their history records from the database.
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

            {/* Delete History Record Confirmation Modal */}
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
                                This will also delete the associated production from the database.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-cancel-btn"
                                onClick={() => setDeleteHistoryModal({ isOpen: false, historyId: null, productionId: null, eventType: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-confirm-btn danger"
                                onClick={() => confirmDeleteHistory(deleteHistoryModal.historyId, deleteHistoryModal.productionId, deleteHistoryModal.eventType)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionPage;
