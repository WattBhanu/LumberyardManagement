// src/components/chemical/ChemicalPage.js
import React, { useState, useEffect, useRef } from "react";
import AddChemical from "./AddChemical";
import ChemicalTable from "./ChemicalTable";
import StockManager from "../StockManager";
import API from "../../services/api";
import "./ChemicalPage.css";

function ChemicalPage() {
  const [chemicals, setChemicals] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    critical: 0,
    totalQuantity: 0
  });
  const tableRef = useRef();

  const refreshTable = () => setRefreshFlag(prev => !prev);

  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const res = await API.get("/chemical/all");
      setChemicals(res.data);
      
      const total = res.data.length;
      const lowStock = res.data.filter(c => c.quantity <= 5).length;
      const critical = res.data.filter(c => c.quantity <= 2).length;
      const totalQuantity = res.data.reduce((sum, c) => sum + c.quantity, 0);
      
      setStats({ total, lowStock, critical, totalQuantity });
    } catch (error) {
      console.error("Error fetching chemicals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemicals();
  }, [refreshFlag]);

  return (
    <div className="chemical-page">
      {/* Main Content */}
      <div className="page-content">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-left">
            <h1>Chemical Inventory</h1>
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
              <span className="stat-label">Total Chemicals</span>
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
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column - Add Chemical Form */}
          <div className="grid-left">
            <AddChemical refreshTable={refreshTable} />
          </div>

          {/* Right Column - Stock Manager */}
          <div className="grid-right">
            <StockManager type="chemical" refreshTable={refreshTable} />
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="section-header">
            <h2>Chemical Inventory List</h2>
            <div className="section-actions">
              <button 
                className="action-button export"
                onClick={() => {
                  console.log("Exporting data...");
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

          {/* Loading State */}
          {loading ? (
            <div className="table-loading">
              <div className="loading-spinner"></div>
              <p>Loading inventory data...</p>
            </div>
          ) : (
            <ChemicalTable 
              chemicals={chemicals} 
              tableRef={tableRef}
              lowStockThreshold={5}
            />
          )}
        </div>

        {/* Footer */}
        <div className="page-footer">
          <p>© 2024 Chemical Inventory System. All rights reserved.</p>
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

export default ChemicalPage;