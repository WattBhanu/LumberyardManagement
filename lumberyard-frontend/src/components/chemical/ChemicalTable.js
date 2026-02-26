/*import React, { useState, useEffect } from "react";
import API from "../../services/api";

function ChemicalTable({ tableRef, lowStockThreshold = 5 }) {
  const [chemicals, setChemicals] = useState([]);
  const [sortOrder, setSortOrder] = useState(null); // null | "asc" | "desc"

  const fetchChemicals = async () => {
    try {
      const res = await API.get("/chemical/all");
      setChemicals(res.data);
    } catch (err) {
      console.error("Error fetching chemicals:", err);
    }
  };

  useEffect(() => {
    fetchChemicals();
  }, []);

  if (tableRef) tableRef.current = fetchChemicals;

  // Sort chemicals before rendering
  const sortedChemicals = [...chemicals];
  if (sortOrder) {
    sortedChemicals.sort((a, b) =>
      sortOrder === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity
    );
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Chemical Table</h3>
      <table border="1" style={{ margin: "auto", width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th
              onClick={toggleSort}
              style={{ cursor: "pointer" }}
            >
              Quantity {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}
            </th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {sortedChemicals.map((c) => (
            <tr
              key={c.id}
              style={{
                backgroundColor:
                  c.quantity <= lowStockThreshold ? "#ffcccc" : "transparent",
              }}
            >
              <td>{c.id}</td>
              <td>{c.chemicalCode}</td>
              <td>{c.name}</td>
              <td>{c.quantity}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "10px", color: "#ff0000" }}>
        *Rows highlighted in red indicate low stock (≤ {lowStockThreshold})
      </p>
    </div>
  );
}

export default ChemicalTable;   */







import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./ChemicalTable.css";

function ChemicalTable({ tableRef, lowStockThreshold = 5 }) {
  const [chemicals, setChemicals] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const res = await API.get("/chemical/all");
      setChemicals(res.data);
    } catch (err) {
      console.error("Error fetching chemicals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemicals();
  }, []);

  if (tableRef) tableRef.current = fetchChemicals;

  // Filter and sort chemicals
  const filteredChemicals = chemicals.filter(chemical => {
    const matchesSearch = 
      chemical.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chemical.chemicalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chemical.id?.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "low" && chemical.quantity <= lowStockThreshold) ||
      (filterStatus === "normal" && chemical.quantity > lowStockThreshold);
    
    return matchesSearch && matchesStatus;
  });

  const sortedChemicals = [...filteredChemicals];
  if (sortOrder) {
    sortedChemicals.sort((a, b) =>
      sortOrder === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity
    );
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getStockStatus = (quantity) => {
    if (quantity <= lowStockThreshold) return "critical";
    if (quantity <= lowStockThreshold * 2) return "low";
    return "normal";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "critical": return "#dc2626";
      case "low": return "#d97706";
      default: return "#059669";
    }
  };

  if (loading) {
    return (
      <div className="chemical-table-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading chemical inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chemical-table-container">
      <div className="table-header">
        <div className="header-left">
          <h2>Chemical Inventory</h2>
          <span className="item-count">{sortedChemicals.length} items</span>
        </div>
        
        <div className="table-controls">
          <div className="search-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by ID, code, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal Stock</option>
          </select>
          
          <button onClick={fetchChemicals} className="refresh-btn" title="Refresh data">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="chemical-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th onClick={toggleSort} className="sortable">
                Quantity
                <span className="sort-indicator">
                  {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}
                </span>
              </th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedChemicals.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No chemical items found
                </td>
              </tr>
            ) : (
              sortedChemicals.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="id-cell">#{c.id}</td>
                  <td className="code-cell">{c.chemicalCode}</td>
                  <td className="name-cell">{c.name}</td>
                  <td className="quantity-cell">
                    <span className={`quantity-badge ${getStockStatus(c.quantity)}`}>
                      {c.quantity}
                    </span>
                  </td>
                  <td className="description-cell">{c.status || "—"}</td>
                  <td className="status-cell">
                    <span 
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(getStockStatus(c.quantity))}10`,
                        color: getStatusColor(getStockStatus(c.quantity)),
                      }}
                    >
                      {getStockStatus(c.quantity)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="stock-legend">
          <span className="legend-item">
            <span className="dot critical"></span>
            Critical (≤ {lowStockThreshold})
          </span>
          <span className="legend-item">
            <span className="dot low"></span>
            Low (≤ {lowStockThreshold * 2})
          </span>
          <span className="legend-item">
            <span className="dot normal"></span>
            Normal
          </span>
        </div>
        
        <div className="stock-summary">
          <span>Low Stock: {chemicals.filter(c => c.quantity <= lowStockThreshold).length}</span>
        </div>
      </div>
    </div>
  );
}

export default ChemicalTable;