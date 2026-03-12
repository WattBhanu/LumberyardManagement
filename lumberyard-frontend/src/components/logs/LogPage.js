// src/pages/LogsPage.js
/*import React, { useState } from "react";
import AddLog from "./AddLog";
import LogsTable from "./LogsTable";

function LogsPage() {
  // single state for triggering table refresh
  const [refreshFlag, setRefreshFlag] = useState(false);

  // function to toggle the refreshFlag
  const refreshLogs = () => setRefreshFlag(prev => !prev);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Logs Management</h2>

      {/* AddLog receives refreshLogs to trigger table refresh */
      //<AddLog refreshLogs={refreshLogs} />

      //{/* LogsTable reloads data whenever refreshFlag changes */}
      //<LogsTable refreshFlag={refreshFlag} />
    //</div>
  //);
//}

//export default LogsPage;*/

// src/components/logs/LogPage.js

// src/components/logs/LogPage.js
import React, { useState, useEffect, useRef } from "react";
import AddLog from "./AddLog";
import LogsTable from "./LogsTable";
import StockManager from "../StockManager";
import API from "../../services/api";
import "./LogPage.css";

function LogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    critical: 0,
    totalQuantity: 0,
    averageLength: 0
  });
  const tableRef = useRef();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/logs/all");
      setLogs(res.data);
      
      const total = res.data.length;
      const lowStock = res.data.filter(l => l.quantity <= 5).length;
      const critical = res.data.filter(l => l.quantity <= 2).length;
      const totalQuantity = res.data.reduce((sum, l) => sum + l.quantity, 0);
      
      const logsWithLength = res.data.filter(l => l.length);
      const avgLength = logsWithLength.length > 0 
        ? logsWithLength.reduce((sum, l) => sum + l.length, 0) / logsWithLength.length 
        : 0;
      
      setStats({ 
        total, 
        lowStock, 
        critical, 
        totalQuantity,
        averageLength: avgLength.toFixed(1)
      });
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const refreshLogs = () => fetchLogs();

  return (
    <div className="log-page">
      {/* Main Content */}
      <div className="page-content">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-left">
            <h1>Logs Inventory</h1>
            <span className="header-badge">Timber Management</span>
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
              <span className="stat-label">Total Logs</span>
              <span className="stat-value">{stats.total}</span>
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

          <div className="stat-card">
            <div className="stat-icon quantity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Units</span>
              <span className="stat-value">{stats.totalQuantity}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon length">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <polyline points="12 2 12 12 20 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Avg. Length</span>
              <span className="stat-value">{stats.averageLength}m</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column - Add Log Form */}
          <div className="grid-left">
            <AddLog refreshLogs={refreshLogs} />
          </div>

          {/* Right Column - Stock Manager */}
          <div className="grid-right">
            <StockManager type="logs" refreshTable={refreshLogs} />
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="section-header">
            <h2>Logs Inventory List</h2>
            <div className="section-actions">
              <button 
                className="action-button export"
                onClick={() => {
                  console.log("Exporting logs data...");
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
                onClick={refreshLogs}
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

          {/* Loading State */}
          {loading ? (
            <div className="table-loading">
              <div className="loading-spinner"></div>
              <p>Loading logs inventory...</p>
            </div>
          ) : (
            <LogsTable 
              logs={logs} 
              tableRef={tableRef}
              lowStockThreshold={5}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={refreshLogs}>
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
          <p>© 2024 Logs Inventory System. All rights reserved.</p>
          <div className="footer-info">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span className="footer-divider">•</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogPage;