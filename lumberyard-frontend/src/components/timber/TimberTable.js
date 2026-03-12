/*import React from "react";

function TimberTable({ timbers, title }) {
  const LOW_STOCK_THRESHOLD = 5;

  return (
    <div style={{ flex: 1, margin: "10px" }}>
      <h3>{title}</h3>
      <table border="1" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Status</th>
            <th>Length</th>
            <th>Long Feet</th>
            <th>Width</th>
            <th>Thickness</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {timbers.map((t) => (
            <tr
              key={t.id}
              style={{
                backgroundColor:
                  t.quantity <= LOW_STOCK_THRESHOLD ? "#ffcccc" : "white"
              }}
            >
              <td>{t.id}</td>
              <td>{t.timberCode}</td>
              <td>{t.name}</td>
              <td>{t.status}</td>
              <td>{t.length}</td>
              <td>{t.longFeet}</td>
              <td>{t.width}</td>
              <td>{t.thickness}</td>
              <td>{t.price}</td>
              <td>{t.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "10px", color: "#ff0000" }}>
        *Rows highlighted indicate low stock (≤ {LOW_STOCK_THRESHOLD})
      </p>
    </div>
  );
}

export default TimberTable; */
/*
// src/components/timber/TimberTable.js
import React from "react";

function TimberTable({ timbers }) {
  // Define a threshold for low stock
  const LOW_STOCK_THRESHOLD = 5;

  return (
    <div style={{ padding: "20px" }}>
      <h3>Timber Inventory</h3>
      <table border="1" cellPadding="5" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Status</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {timbers.map((item) => (
            <tr
              key={item.id}
              style={{
                backgroundColor: item.quantity <= LOW_STOCK_THRESHOLD ? "#ffcccc" : "transparent", // red if low stock
              }}
            >
              <td>{item.id}</td>
              <td>{item.timberCode}</td>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "10px", color: "#ff0000" }}>
        *Rows highlighted in red indicate low stock (≤ {LOW_STOCK_THRESHOLD})
      </p>
    </div>
  );
}

export default TimberTable;*/

// src/components/timber/TimberTable.js
import React, { useState, useEffect } from "react";
import "./TimberTable.css";

function TimberTable({ timbers, title, lowStockThreshold = 5, showStatus = true }) {
  const [sortOrder, setSortOrder] = useState(null);
  const [sortColumn, setSortColumn] = useState("quantity");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTimbers, setFilteredTimbers] = useState([]);
  const [tableStats, setTableStats] = useState({
    total: 0,
    lowStock: 0,
    totalValue: 0,
    averagePrice: 0,
    treated: 0,
    untreated: 0
  });

  useEffect(() => {
    let filtered = [...timbers];
    
    if (searchTerm) {
      filtered = filtered.filter(timber => 
        timber.timberCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timber.id?.toString().includes(searchTerm) ||
        timber.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTimbers(filtered);
    
    const total = filtered.length;
    const lowStock = filtered.filter(t => t.quantity <= lowStockThreshold).length;
    const totalValue = filtered.reduce((sum, t) => sum + (t.price || 0) * (t.quantity || 0), 0);
    const avgPrice = filtered.length > 0 
      ? filtered.reduce((sum, t) => sum + (t.price || 0), 0) / filtered.length 
      : 0;
    const treated = filtered.filter(t => t.status === "Treated").length;
    const untreated = filtered.filter(t => t.status === "Untreated").length;
    
    setTableStats({ total, lowStock, totalValue, averagePrice: avgPrice, treated, untreated });
  }, [timbers, searchTerm, lowStockThreshold]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedTimbers = [...filteredTimbers];
  if (sortOrder) {
    sortedTimbers.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      if (sortColumn === 'quantity' || sortColumn === 'price' || sortColumn === 'length' || 
          sortColumn === 'longFeet' || sortColumn === 'width' || sortColumn === 'thickness') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
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

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="timber-table-container">
      <div className="table-header">
        <div className="header-left">
          <h3>{title}</h3>
          <span className="item-count">{tableStats.total} items</span>
        </div>
        
        <div className="table-controls">
          <div className="search-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search timber..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Table Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Treated:</span>
          <span className="stat-value treated">{tableStats.treated}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Untreated:</span>
          <span className="stat-value untreated">{tableStats.untreated}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Value:</span>
          <span className="stat-value">Rs. {tableStats.totalValue.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Price:</span>
          <span className="stat-value">Rs. {tableStats.averagePrice.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Low Stock:</span>
          <span className={`stat-value ${tableStats.lowStock > 0 ? 'warning' : 'normal'}`}>
            {tableStats.lowStock}
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="timber-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                ID {renderSortIcon('id') && <span className="sort-indicator">{renderSortIcon('id')}</span>}
              </th>
              <th onClick={() => handleSort('timberCode')} className="sortable">
                Code {renderSortIcon('timberCode') && <span className="sort-indicator">{renderSortIcon('timberCode')}</span>}
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {renderSortIcon('name') && <span className="sort-indicator">{renderSortIcon('name')}</span>}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {renderSortIcon('status') && <span className="sort-indicator">{renderSortIcon('status')}</span>}
              </th>
              <th onClick={() => handleSort('length')} className="sortable">
                Length {renderSortIcon('length') && <span className="sort-indicator">{renderSortIcon('length')}</span>}
              </th>
              <th onClick={() => handleSort('longFeet')} className="sortable">
                Long Feet {renderSortIcon('longFeet') && <span className="sort-indicator">{renderSortIcon('longFeet')}</span>}
              </th>
              <th onClick={() => handleSort('width')} className="sortable">
                Width {renderSortIcon('width') && <span className="sort-indicator">{renderSortIcon('width')}</span>}
              </th>
              <th onClick={() => handleSort('thickness')} className="sortable">
                Thickness {renderSortIcon('thickness') && <span className="sort-indicator">{renderSortIcon('thickness')}</span>}
              </th>
              <th onClick={() => handleSort('price')} className="sortable">
                Price {renderSortIcon('price') && <span className="sort-indicator">{renderSortIcon('price')}</span>}
              </th>
              <th onClick={() => handleSort('quantity')} className="sortable">
                Quantity {renderSortIcon('quantity') && <span className="sort-indicator">{renderSortIcon('quantity')}</span>}
              </th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedTimbers.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty-state">
                  {timbers.length === 0 ? "No timber available" : "No items match your search"}
                </td>
              </tr>
            ) : (
              sortedTimbers.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="id-cell">#{t.id}</td>
                  <td className="code-cell">{t.timberCode}</td>
                  <td className="name-cell">{t.name}</td>
                  <td className="status-badge-cell">
                    <span 
                      className={`treatment-badge ${t.status === 'Treated' ? 'treated' : 'untreated'}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="dimension-cell">{t.length || 0}</td>
                  <td className="dimension-cell">{t.longFeet || 0}</td>
                  <td className="dimension-cell">{t.width || 0}</td>
                  <td className="dimension-cell">{t.thickness || 0}</td>
                  <td className="price-cell">
                    <span className="price-value">Rs. {t.price || 0}</span>
                  </td>
                  <td className="quantity-cell">
                    <span className={`quantity-badge ${getStockStatus(t.quantity)}`}>
                      {t.quantity}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span 
                      className={`stock-badge ${getStockStatus(t.quantity)}`}
                    >
                      {getStockStatus(t.quantity)}
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
        
        <div className="total-value">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Total: Rs. {tableStats.totalValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default TimberTable;