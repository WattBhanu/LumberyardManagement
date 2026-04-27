// src/components/timber/TimberPage.js
import React, { useState, useEffect, useRef } from "react";
import AddTimber from "./AddTimber";
import TimberTable from "./TimberTable";
import StockManager from "../StockManager";
import API from "../../services/api";
import "./TimberPage.css";

const TimberPage = () => {
  const [timbers, setTimbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    treated: 0,
    untreated: 0,
    lowStock: 0,
    critical: 0,
    totalValue: 0,
    totalVolume: 0
  });
  const tableRef = useRef();

  const fetchTimbers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/timber/all");
      setTimbers(res.data);
      
      const total = res.data.length;
      const treated = res.data.filter(t => t.status === "Treated").length;
      const untreated = res.data.filter(t => t.status === "Untreated").length;
      const lowStock = res.data.filter(t => t.quantity <= 5).length;
      const critical = res.data.filter(t => t.quantity <= 2).length;
      
      const totalValue = res.data.reduce((sum, t) => sum + (t.price || 0) * (t.quantity || 0), 0);
      
      const totalVolume = res.data.reduce((sum, t) => {
        const volume = (t.length || 0) * (t.width || 0) * (t.thickness || 0) * (t.quantity || 0);
        return sum + volume;
      }, 0);
      
      setStats({ 
        total, 
        treated, 
        untreated, 
        lowStock, 
        critical,
        totalValue,
        totalVolume
      });
    } catch (error) {
      console.error("Error fetching timbers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimbers();
  }, []);

  if (tableRef) tableRef.current = fetchTimbers;

  const filteredTimbers = timbers.filter(t => {
    if (statusFilter === "all") return true;
    if (statusFilter === "treated") return t.status === "Treated";
    if (statusFilter === "untreated") return t.status === "Untreated";
    return true;
  });

  const refreshTable = () => {
    if (tableRef.current) {
      tableRef.current();
    }
  };

  return (
    <div className="timber-page">
      {/* Main Content */}
      <div className="page-content">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-left">
            <h1>Timber Inventory</h1>
            <span className="header-badge">Management System</span>
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Timbers</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon treated">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Treated</span>
              <span className="stat-value">{stats.treated}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon untreated">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Untreated</span>
              <span className="stat-value">{stats.untreated}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon low">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Low Stock</span>
              <span className="stat-value">{stats.lowStock}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon critical">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Critical</span>
              <span className="stat-value">{stats.critical}</span>
            </div>
          </div>


        </div>

          <div className="stats-grid-1">
              <div className="stat-card-1">
                  <div className="stat-icon value">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                  </div>
                  <div className="stat-content">
                      <span className="stat-label">Total Value</span>
                      <span className="stat-value">Rs. {stats.totalValue.toFixed(2)}</span>
                  </div>
              </div>

              <div className="stat-card-1">
                  <div className="stat-icon volume">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2"></polygon>
                          <line x1="12" y1="22" x2="12" y2="12"></line>
                          <polyline points="22 7 12 12 2 7"></polyline>
                      </svg>
                  </div>
                  <div className="stat-content">
                      <span className="stat-label">Total Volume</span>
                      <span className="stat-value">{stats.totalVolume.toFixed(2)} m³</span>
                  </div>
              </div>
          </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column - Add Timber Form */}
          <div className="grid-left">
            <AddTimber refreshTable={refreshTable} />
          </div>

          {/* Right Column - Stock Manager */}
          <div className="grid-right">
            <StockManager type="timber" refreshTable={refreshTable} />
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="section-header">
            <h2>Timber Inventory</h2>
            <div className="section-actions">
              {/* Status Filter Tabs */}
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({stats.total})
                </button>
                <button 
                  className={`filter-tab treated ${statusFilter === 'treated' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('treated')}
                >
                  Treated ({stats.treated})
                </button>
                <button 
                  className={`filter-tab untreated ${statusFilter === 'untreated' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('untreated')}
                >
                  Untreated ({stats.untreated})
                </button>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="action-button export"
                  onClick={() => {
                    console.log("Exporting timber data...");
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export
                </button>
                <button 
                  className="action-button print"
                  onClick={() => window.print()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <path d="M6 9V3h12v6"></path>
                    <rect x="6" y="15" width="12" height="6" rx="2"></rect>
                  </svg>
                  Print
                </button>
                <button 
                  className="action-button refresh"
                  onClick={refreshTable}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="table-loading">
              <div className="loading-spinner"></div>
              <p>Loading timber inventory...</p>
            </div>
          ) : (
            <div className="single-table-container">
              <TimberTable 
                timbers={filteredTimbers} 
                title={`Timber Inventory ${statusFilter !== 'all' ? `- ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` : ''}`}
                lowStockThreshold={5}
                showStatus={true}
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={refreshTable}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh All
          </button>
          <button className="quick-action-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            Back to Top
          </button>
        </div>

        {/* Footer */}
        <div className="page-footer">
          <p>© 2024 Timber Inventory System. All rights reserved.</p>
          <div className="footer-info">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span className="footer-divider">•</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimberPage;