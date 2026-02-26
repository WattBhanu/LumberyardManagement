// src/components/StockManager.js
/*import React, { useState } from "react";
import API from "../services/api";

function StockManager({ type, refreshTable }) {
  const [productCode, setProductCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  const handleAction = async (action) => {
    if (!productCode || !quantity) {
      setMessage("Both Product Code and Quantity are required");
      return;
    }

    try {
      const endpoint = `/${type}/${action}?${
        type === "logs"
          ? "logCode"
          : type === "timber"
          ? "timberCode"
          : "chemicalCode"
      }=${productCode}&quantity=${quantity}`;

      const res = await API.put(endpoint);
      setMessage(res.data || "Stock updated successfully!");
      setProductCode("");
      setQuantity("");

      // Refresh table after stock update
      if (refreshTable) refreshTable();
    } catch (error) {
      setMessage(error.response?.data || "Error updating stock");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h4>{type.charAt(0).toUpperCase() + type.slice(1)} Stock Manager</h4>
      <input
        placeholder="Product Code"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button onClick={() => handleAction("addStock")}>Increase Stock</button>
      <button onClick={() => handleAction("reduce")}>Decrease Stock</button>
      <p>{message}</p>
    </div>
  );
}

export default StockManager;  */


// src/components/StockManager.js
import React, { useState, useEffect } from "react";
import API from "../services/api";
import "./StockManager.css";

function StockManager({ type, refreshTable }) {
  const [productCode, setProductCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Reset message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getProductLabel = () => {
    switch(type) {
      case "logs": return "Log Code";
      case "timber": return "Timber Code";
      case "chemical": return "Chemical Code";
      default: return "Product Code";
    }
  };

  const getProductIcon = () => {
    switch(type) {
      case "logs": return "🪵";
      case "timber": return "🪚";
      case "chemical": return "🧪";
      default: return "📦";
    }
  };

  const getColorScheme = () => {
    switch(type) {
      case "logs": return {
        primary: "#10b981",
        secondary: "#059669",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        light: "#d1fae5"
      };
      case "timber": return {
        primary: "#f59e0b",
        secondary: "#d97706",
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        light: "#fef3c7"
      };
      case "chemical": return {
        primary: "#667eea",
        secondary: "#764ba2",
        gradient: "linear-gradient(135deg, #667eea, #764ba2)",
        light: "#e0e7ff"
      };
      default: return {
        primary: "#64748b",
        secondary: "#475569",
        gradient: "linear-gradient(135deg, #64748b, #475569)",
        light: "#f1f5f9"
      };
    }
  };

  const colors = getColorScheme();

  const fetchProductDetails = async (code) => {
    if (!code) return;
    
    try {
      const endpoint = `/${type}/getByCode?${
        type === "logs" ? "logCode" :
        type === "timber" ? "timberCode" :
        "chemicalCode"
      }=${code}`;
      
      const res = await API.get(endpoint);
      setProductDetails(res.data);
    } catch (error) {
      setProductDetails(null);
    }
  };

  const handleCodeChange = (e) => {
    const code = e.target.value;
    setProductCode(code);
    if (code.length >= 3) {
      fetchProductDetails(code);
    } else {
      setProductDetails(null);
    }
  };

  const handleAction = async (action) => {
    if (!productCode || !quantity) {
      setMessage("Both Product Code and Quantity are required");
      setMessageType("error");
      return;
    }

    if (Number(quantity) <= 0) {
      setMessage("Quantity must be greater than 0");
      setMessageType("error");
      return;
    }

    if (action === "reduce" && productDetails && productDetails.quantity < Number(quantity)) {
      setMessage(`Insufficient stock! Available: ${productDetails.quantity}`);
      setMessageType("error");
      return;
    }

    setPendingAction(action);
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    setShowConfirm(false);
    setIsLoading(true);

    try {
      const codeParam = type === "logs" ? "logCode" :
                       type === "timber" ? "timberCode" :
                       "chemicalCode";

      const endpoint = `/${type}/${pendingAction}?${codeParam}=${productCode}&quantity=${quantity}`;

      const res = await API.put(endpoint);
      setMessage(res.data || "Stock updated successfully!");
      setMessageType("success");
      
      // Clear form
      setProductCode("");
      setQuantity("");
      setProductDetails(null);

      // Refresh table after stock update
      if (refreshTable) refreshTable();
    } catch (error) {
      setMessage(error.response?.data || "Error updating stock");
      setMessageType("error");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setPendingAction(null);
  };

  return (
    <div className="stock-manager-container">
      <div className="stock-manager-card" style={{ borderTop: `4px solid ${colors.primary}` }}>
        {/* Header */}
        <div className="manager-header">
          <div className="header-icon-wrapper" style={{ background: colors.gradient }}>
            <span className="header-icon">{getProductIcon()}</span>
          </div>
          <div className="header-title">
            <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Stock Manager</h3>
            <p className="header-subtitle">Manage inventory levels</p>
          </div>
        </div>

        {/* Product Info Banner */}
        {productDetails && (
          <div className="product-info-banner" style={{ background: colors.light }}>
            <div className="product-info">
              <span className="info-label">Current Stock:</span>
              <span className="info-value" style={{ color: colors.primary }}>
                {productDetails.quantity} units
              </span>
            </div>
            <div className="product-info">
              <span className="info-label">Product:</span>
              <span className="info-value">{productDetails.name || productDetails.chemicalCode}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="stock-form">
          <div className="form-group">
            <label htmlFor="productCode">
              <span className="label-icon">🔑</span>
              {getProductLabel()}
            </label>
            <div className="input-wrapper">
              <input
                id="productCode"
                type="text"
                placeholder={`Enter ${getProductLabel().toLowerCase()}`}
                value={productCode}
                onChange={handleCodeChange}
                className="form-input"
                disabled={isLoading}
              />
              {productCode && (
                <span className="input-status" style={{ color: productDetails ? colors.primary : '#ef4444' }}>
                  {productDetails ? '✓' : '?'}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">
              <span className="label-icon">📊</span>
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={() => handleAction("addStock")}
              className="action-btn increase"
              style={{ background: colors.gradient }}
              disabled={isLoading || !productCode || !quantity}
            >
              <span className="btn-icon">⬆️</span>
              <span className="btn-text">Increase Stock</span>
              {isLoading && pendingAction === "addStock" && (
                <span className="btn-spinner"></span>
              )}
            </button>

            <button
              onClick={() => handleAction("reduce")}
              className="action-btn decrease"
              style={{ 
                background: 'white',
                color: colors.primary,
                border: `2px solid ${colors.primary}`
              }}
              disabled={isLoading || !productCode || !quantity}
            >
              <span className="btn-icon">⬇️</span>
              <span className="btn-text">Decrease Stock</span>
              {isLoading && pendingAction === "reduce" && (
                <span className="btn-spinner" style={{ borderColor: `${colors.primary} transparent ${colors.primary} transparent` }}></span>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="quick-btn"
              onClick={() => setQuantity("1")}
              disabled={isLoading}
            >
              +1
            </button>
            <button
              className="quick-btn"
              onClick={() => setQuantity("5")}
              disabled={isLoading}
            >
              +5
            </button>
            <button
              className="quick-btn"
              onClick={() => setQuantity("10")}
              disabled={isLoading}
            >
              +10
            </button>
            <button
              className="quick-btn"
              onClick={() => setQuantity("")}
              disabled={isLoading}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message-popup ${messageType}`}>
            <span className="message-icon">
              {messageType === "success" ? "✅" : "❌"}
            </span>
            <span className="message-text">{message}</span>
            <button className="message-close" onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {/* Tips Section */}
        <div className="stock-tips">
          <div className="tip-item">
            <span className="tip-dot" style={{ background: colors.primary }}></span>
            <span>Enter valid product code to see current stock</span>
          </div>
          <div className="tip-item">
            <span className="tip-dot" style={{ background: colors.primary }}></span>
            <span>Use quick action buttons for common quantities</span>
          </div>
          <div className="tip-item">
            <span className="tip-dot" style={{ background: colors.primary }}></span>
            <span>System validates available stock before decrease</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-icon">⚠️</div>
            <h4>Confirm Action</h4>
            <p>
              Are you sure you want to <strong style={{ color: colors.primary }}>
                {pendingAction === "addStock" ? "increase" : "decrease"}
              </strong> stock by <strong>{quantity}</strong> units?
            </p>
            {productDetails && (
              <p className="modal-details">
                Product: {productDetails.name || productDetails.chemicalCode}<br />
                Current Stock: {productDetails.quantity}<br />
                {pendingAction === "reduce" && (
                  <>New Stock: {productDetails.quantity - Number(quantity)}</>
                )}
                {pendingAction === "addStock" && (
                  <>New Stock: {productDetails.quantity + Number(quantity)}</>
                )}
              </p>
            )}
            <div className="modal-actions">
              <button 
                className="modal-btn confirm"
                style={{ background: colors.gradient }}
                onClick={confirmAction}
              >
                Confirm
              </button>
              <button 
                className="modal-btn cancel"
                onClick={cancelAction}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockManager;