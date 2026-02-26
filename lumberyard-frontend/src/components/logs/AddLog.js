// src/components/logs/AddLog.js
import React, { useState } from "react";
import API from "../../services/api";
import "./AddLog.css";

function AddLog({ refreshLogs }) {
  const [log, setLog] = useState({
    logCode: "",
    name: "",
    length: "",
    cubicFeet: "",
    quantity: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setLog({ ...log, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate all fields
    if (!log.logCode || !log.name || !log.length || !log.cubicFeet || !log.quantity) {
      setMessage("All fields are required");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    if (Number(log.length) <= 0) {
      setMessage("Length must be greater than 0");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    if (Number(log.cubicFeet) <= 0) {
      setMessage("Cubic feet must be greater than 0");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    if (Number(log.quantity) <= 0) {
      setMessage("Quantity must be greater than 0");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await API.post("/logs/add", {
        logCode: log.logCode.trim(),
        name: log.name.trim(),
        length: Number(log.length),
        cubicFeet: Number(log.cubicFeet),
        quantity: Number(log.quantity),
      });

      setMessage(res.data || "Log added successfully!");
      setMessageType("success");
      setLog({ logCode: "", name: "", length: "", cubicFeet: "", quantity: "" });

      if (refreshLogs) refreshLogs();
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Error adding log";
      setMessage(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-log">
      <div className="add-log-header">
        <h3>Add New Log</h3>
        <p className="header-description">Enter the details of the new log to add to inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="log-form">
        <div className="form-group">
          <label htmlFor="logCode">
            Log Code
            <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="logCode"
              name="logCode"
              type="text"
              placeholder="e.g., LOG-001, PINE-01"
              value={log.logCode}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Log Name
            <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Pine Log, Oak Timber"
              value={log.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">
              Length (m)
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="length"
                name="length"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={log.length}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cubicFeet">
              Cubic Feet
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="cubicFeet"
                name="cubicFeet"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={log.cubicFeet}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">
            Quantity
            <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="quantity"
              name="quantity"
              type="number"
              placeholder="0"
              min="1"
              step="1"
              value={log.quantity}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Preview Section */}
        {(log.logCode || log.name || log.length || log.cubicFeet || log.quantity) && (
          <div className="preview-section">
            <h4>Summary</h4>
            <div className="preview-grid">
              {log.logCode && (
                <div className="preview-item">
                  <span className="preview-label">Code:</span>
                  <span className="preview-value">{log.logCode}</span>
                </div>
              )}
              {log.name && (
                <div className="preview-item">
                  <span className="preview-label">Name:</span>
                  <span className="preview-value">{log.name}</span>
                </div>
              )}
              {log.length && (
                <div className="preview-item">
                  <span className="preview-label">Length:</span>
                  <span className="preview-value">{log.length}m</span>
                </div>
              )}
              {log.cubicFeet && (
                <div className="preview-item">
                  <span className="preview-label">Volume:</span>
                  <span className="preview-value">{log.cubicFeet} ft³</span>
                </div>
              )}
              {log.quantity && (
                <div className="preview-item">
                  <span className="preview-label">Quantity:</span>
                  <span className="preview-value">{log.quantity}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Adding...
              </>
            ) : (
              'Add Log'
            )}
          </button>
          
          <button 
            type="button" 
            className="reset-btn"
            onClick={() => {
              setLog({ logCode: "", name: "", length: "", cubicFeet: "", quantity: "" });
              setMessage("");
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {message && (
        <div className={`message ${messageType}`}>
          <div className="message-content">
            <span className="message-icon">
              {messageType === "success" ? "✓" : "!"}
            </span>
            <span>{message}</span>
          </div>
          <button className="message-close" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="quick-tips">
        <h4>Quick Tips</h4>
        <ul>
          <li>Use unique log codes for easy identification</li>
          <li>Include species name in the log name</li>
          <li>Measure length accurately in meters</li>
          <li>Calculate cubic feet precisely for volume tracking</li>
        </ul>
      </div>
    </div>
  );
}

export default AddLog;