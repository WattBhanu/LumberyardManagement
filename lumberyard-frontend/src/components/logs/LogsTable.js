// src/components/logs/LogsTable.js
/*import React, { useEffect, useState } from "react";
import API from "../../services/api";

function LogsTable({ refreshFlag }) {
  const [logs, setLogs] = useState([]);
  const [update, setUpdate] = useState({ code: "", quantity: "" });
  const [message, setMessage] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await API.get("/logs/all");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshFlag]); // auto-refresh when parent changes refreshFlag

  const handleChange = (e) => setUpdate({ ...update, [e.target.name]: e.target.value });

  const handleStockUpdate = async (type) => {
    if (!update.code || !update.quantity) return;
    try {
      const url = type === "add" ? "/logs/addStock" : "/logs/reduce";
      const res = await API.put(url, null, {
        params: { logCode: update.code.trim(), quantity: Number(update.quantity) },
      });
      setMessage(res.data);
      fetchLogs(); // refresh table
      setUpdate({ code: "", quantity: "" });
    } catch (err) {
      console.error(err);
      setMessage("Error updating stock");
    }
  };

  return (
    <div>
      <h3>Logs Table</h3>

      <table border="1" cellPadding="5" style={{ marginBottom: "20px", width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Log Code</th>
            <th>Name</th>
            <th>Length</th>
            <th>Cubic Feet</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.logCode}</td>
              <td>{log.name}</td>
              <td>{log.length}</td>
              <td>{log.cubicFeet}</td>
              <td>{log.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input name="code" placeholder="Log Code" value={update.code} onChange={handleChange} />
        <input name="quantity" type="number" placeholder="Quantity" value={update.quantity} onChange={handleChange} />
        <button onClick={() => handleStockUpdate("add")}>Increase Stock</button>
        <button onClick={() => handleStockUpdate("reduce")}>Decrease Stock</button>
      </div>
      <p>{message}</p>
    </div>
  );
}

export default LogsTable;

// src/components/logs/LogsTable.js
import React from "react";

function LogsTable({ logs, lowStockThreshold = 5 }) {
  return (
    <div style={{ padding: "20px" }}>
      <h3>Logs Inventory</h3>
      <table border="1" cellPadding="5" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Long</th>
            <th>Cubic Feet</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              style={{
                backgroundColor:
                  log.quantity <= lowStockThreshold ? "#ffcccc" : "transparent", // red if low stock
              }}
            >
              <td>{log.id}</td>
              <td>{log.logCode}</td>
              <td>{log.name}</td>
              <td>{log.long}</td>
              <td>{log.cubicFeet}</td>
              <td>{log.quantity}</td>
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

export default LogsTable; */


// src/components/logs/LogsTable.js
import React, { useState, useEffect } from "react";
import "./LogsTable.css";

function LogsTable({ logs, lowStockThreshold = 5 }) {
  const [sortOrder, setSortOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    let filtered = [...logs];
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.logCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id?.toString().includes(searchTerm)
      );
    }
    
    if (filterStatus === "low") {
      filtered = filtered.filter(log => log.quantity <= lowStockThreshold);
    } else if (filterStatus === "normal") {
      filtered = filtered.filter(log => log.quantity > lowStockThreshold);
    }
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, filterStatus, lowStockThreshold]);

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedLogs = [...filteredLogs];
  if (sortOrder) {
    sortedLogs.sort((a, b) =>
      sortOrder === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity
    );
  }

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

  const totalVolume = logs.reduce((sum, l) => 
    sum + (l.cubicFeet || 0) * (l.quantity || 0), 0
  ).toFixed(1);

  return (
    <div className="logs-table-container">
      <div className="table-header">
        <div className="header-left">
          <h3>Logs Inventory</h3>
          <span className="item-count">{sortedLogs.length} items</span>
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
            <option value="all">All Logs</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Length (m)</th>
              <th>Cubic Feet</th>
              <th onClick={handleSort} className="sortable">
                Quantity
                <span className="sort-indicator">
                  {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}
                </span>
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  {logs.length === 0 ? "No logs found in inventory" : "No logs match your search"}
                </td>
              </tr>
            ) : (
              sortedLogs.map((log) => (
                <tr key={log.id} className="table-row">
                  <td className="id-cell">#{log.id}</td>
                  <td className="code-cell">{log.logCode}</td>
                  <td className="name-cell">{log.name}</td>
                  <td className="length-cell">
                    <span className="measurement-badge">{log.length || log.long || 0} m</span>
                  </td>
                  <td className="cubic-cell">
                    <span className="measurement-badge">{log.cubicFeet || 0} ft³</span>
                  </td>
                  <td className="quantity-cell">
                    <span className={`quantity-badge ${getStockStatus(log.quantity)}`}>
                      {log.quantity}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span 
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(getStockStatus(log.quantity))}10`,
                        color: getStatusColor(getStockStatus(log.quantity)),
                      }}
                    >
                      {getStockStatus(log.quantity)}
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
          <span>Total: {sortedLogs.length} logs</span>
          <span className="summary-divider">•</span>
          <span>Low Stock: {logs.filter(l => l.quantity <= lowStockThreshold).length}</span>
          <span className="summary-divider">•</span>
          <span>Total Volume: {totalVolume} ft³</span>
        </div>
      </div>
    </div>
  );
}

export default LogsTable;