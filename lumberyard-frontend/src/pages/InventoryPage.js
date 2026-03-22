// src/pages/Dashboard.js
import React, { useState, useEffect, useRef } from "react";
import TimberPage from "../components/timber/TimberPage";
import LogsPage from "../components/logs/LogPage";
import ChemicalPage from "../components/chemical/ChemicalPage";
import DeletePage from "./DeletePage"; // Import DeletePage
import API from "../services/api";
import "./Dashboard.css";
import { Link } from 'react-router-dom';

function InventoryPage() {
  const [viewMode, setViewMode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  const [timberCount, setTimberCount] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [chemicalCount, setChemicalCount] = useState(0);
  const [timberQty, setTimberQty] = useState(0);
  const [logQty, setLogQty] = useState(0);
  const [chemicalQty, setChemicalQty] = useState(0);

  useEffect(() => {
    if (viewMode === "") {
      const fetchSummary = async () => {
        try {
          const [timberRes, logRes, chemRes] = await Promise.all([
            API.get("/timber/all"),
            API.get("/logs/all"),
            API.get("/chemical/all"),
          ]);

          setTimberCount(timberRes.data.length);
          setLogCount(logRes.data.length);
          setChemicalCount(chemRes.data.length);

          setTimberQty(timberRes.data.reduce((sum, i) => sum + (i.quantity || 0), 0));
          setLogQty(logRes.data.reduce((sum, i) => sum + (i.quantity || 0), 0));
          setChemicalQty(chemRes.data.reduce((sum, i) => sum + (i.quantity || 0), 0));
        } catch (err) {
          console.error(err);
        }
      };
      fetchSummary();
    }
  }, [viewMode]);

  const handleSearch = async () => {
    const code = searchCode.trim();
    if (!code) return;

    setLoading(true);
    try {
      const [timberRes, logsRes, chemicalRes] = await Promise.all([
        API.get(`/timber/search?code=${code}`),
        API.get(`/logs/search?code=${code}`),
        API.get(`/chemical/search?code=${code}`),
      ]);

      const combinedResults = [
        ...timberRes.data.map(i => ({ ...i, type: "Timber" })),
        ...logsRes.data.map(i => ({ ...i, type: "Log" })),
        ...chemicalRes.data.map(i => ({ ...i, type: "Chemical" })),
      ];

      setSearchResults(combinedResults);
      setViewMode("search-results");
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchCode("");
    setSearchResults([]);
    setViewMode("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleNavigation = (mode) => {
    setViewMode(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 5) return "low";
    if (quantity <= 10) return "medium";
    return "normal";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "low": return "#dc2626";
      case "medium": return "#d97706";
      default: return "#059669";
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Inventory Management System</h1>
            <span className="header-badge">Lumberyard</span>
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

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by product code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={handleKeyPress}
                className="search-input"
              />
              {searchCode && (
                <button className="search-clear" onClick={() => setSearchCode("")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            <button
              className="search-button"
              onClick={handleSearch}
              disabled={loading || !searchCode.trim()}
            >
              {loading ? <span className="spinner"></span> : "Search"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${viewMode === '' ? 'active' : ''}`}
            onClick={() => handleNavigation('')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Dashboard
          </button>
          <button
            className={`nav-tab timber ${viewMode === 'timber' ? 'active' : ''}`}
            onClick={() => handleNavigation('timber')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2"></rect>
              <line x1="8" y1="10" x2="16" y2="10"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
            </svg>
            Timber
          </button>
          <button
            className={`nav-tab logs ${viewMode === 'logs' ? 'active' : ''}`}
            onClick={() => handleNavigation('logs')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z"></path>
              <line x1="4" y1="8" x2="20" y2="8"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="16" x2="20" y2="16"></line>
            </svg>
            Logs
          </button>
          <button
            className={`nav-tab chemical ${viewMode === 'chemical' ? 'active' : ''}`}
            onClick={() => handleNavigation('chemical')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"></path>
              <path d="M8 4h8v4H8z"></path>
            </svg>
            Chemical
          </button>
          {/* New Delete Button */}
          <button
            className={`nav-tab delete ${viewMode === 'delete' ? 'active' : ''}`}
            onClick={() => handleNavigation('delete')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete Product
          </button>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {/* Dashboard Home */}
          {viewMode === "" && (
            <div className="dashboard-home">
              <div className="summary-section">
                <h2 className="section-title">Inventory Overview</h2>
                <div className="summary-grid">
                  <SummaryBox
                    title="Timber"
                    count={timberCount}
                    quantity={timberQty}
                    icon="timber"
                    color="#f59e0b"
                  />
                  <SummaryBox
                    title="Logs"
                    count={logCount}
                    quantity={logQty}
                    icon="logs"
                    color="#059669"
                  />
                  <SummaryBox
                    title="Chemicals"
                    count={chemicalCount}
                    quantity={chemicalQty}
                    icon="chemical"
                    color="#3b82f6"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {viewMode === "search-results" && (
            <div className="results-section">
              <div className="results-header">
                <h2>Search Results</h2>
                <button className="clear-results" onClick={clearSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Clear Search
                </button>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Searching inventory...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="results-table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>ID</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((item, idx) => {
                        const status = getStockStatus(item.quantity);
                        const statusColor = getStatusColor(status);

                        return (
                          <tr key={idx} className="result-row">
                            <td>
                              <span className={`type-badge ${item.type.toLowerCase()}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="id-cell">#{item.id}</td>
                            <td className="code-cell">{item.timberCode || item.logCode || item.chemicalCode}</td>
                            <td className="name-cell">{item.name || '-'}</td>
                            <td>
                              <span className={`quantity-badge ${status}`}>
                                {item.quantity}
                              </span>
                            </td>
                            <td>
                              <span className={`stock-badge ${status}`}>
                                {status === "low" ? "Low Stock" : status === "medium" ? "Medium" : "In Stock"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-results">
                  <p>No results found for "{searchCode}"</p>
                  <button className="try-again-btn" onClick={clearSearch}>
                    Try Another Search
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Conditional Pages */}
          {viewMode === "timber" && (
            <div className="page-wrapper">
              <TimberPage />
            </div>
          )}
          {viewMode === "logs" && (
            <div className="page-wrapper">
              <LogsPage />
            </div>
          )}
          {viewMode === "chemical" && (
            <div className="page-wrapper">
              <ChemicalPage />
            </div>
          )}
          {/* Delete Page */}
          {viewMode === "delete" && (
            <div className="page-wrapper">
              <DeletePage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ title, count, quantity, icon, color }) {
  return (
    <div className="summary-card">
      <div className="summary-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {icon === "timber" && (
            <rect x="4" y="2" width="16" height="20" rx="2"></rect>
          )}
          {icon === "logs" && (
            <path d="M4 4h16v16H4z"></path>
          )}
          {icon === "chemical" && (
            <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"></path>
          )}
        </svg>
      </div>
      <div className="summary-content">
        <h3>{title}</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Items:</span>
            <span className="stat-value">{count}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Quantity:</span>
            <span className="stat-value">{quantity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;
