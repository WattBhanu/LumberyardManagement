// src/components/timber/AddTimber.js
import React, { useState } from "react";
import API from "../../services/api";
import "./AddTimber.css";

const AddTimber = ({ refreshTable }) => {
  const [timber, setTimber] = useState({
    timberCode: "",
    name: "",
    status: "",
    length: "",
    longFeet: "",
    width: "",
    thickness: "",
    price: "",
    quantity: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setTimber({ ...timber, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const totalValue = (Number(timber.price) * Number(timber.quantity)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!timber.timberCode || !timber.name || !timber.status) {
      setMessage("Please fill in Timber Code, Name, and Status");
      setMessageType("error");
      return;
    }

    if (!timber.length || !timber.longFeet || !timber.width || !timber.thickness) {
      setMessage("Please fill in all dimensions");
      setMessageType("error");
      return;
    }

    if (!timber.price || !timber.quantity) {
      setMessage("Please fill in Price and Quantity");
      setMessageType("error");
      return;
    }

    if (Number(timber.price) <= 0) {
      setMessage("Price must be greater than 0");
      setMessageType("error");
      return;
    }

    if (Number(timber.quantity) <= 0) {
      setMessage("Quantity must be greater than 0");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await API.post("/timber/add", {
        timberCode: timber.timberCode.trim(),
        name: timber.name.trim(),
        status: timber.status,
        length: Number(timber.length),
        longFeet: Number(timber.longFeet),
        width: Number(timber.width),
        thickness: Number(timber.thickness),
        price: Number(timber.price),
        quantity: Number(timber.quantity),
      });

      setMessage(res.data || "Timber added successfully!");
      setMessageType("success");
      setTimber({
        timberCode: "",
        name: "",
        status: "",
        length: "",
        longFeet: "",
        width: "",
        thickness: "",
        price: "",
        quantity: "",
      });

      if (refreshTable) refreshTable();
    } catch (error) {
      setMessage(error.response?.data || "Error adding timber");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-timber">
      <div className="add-timber-header">
        <h3>Add New Timber</h3>
        <p className="header-description">Enter the details of the new timber product</p>
      </div>

      <form onSubmit={handleSubmit} className="timber-form">
        <div className="form-section">
          <h4 className="section-title">Basic Information</h4>
          
          <div className="form-group">
            <label htmlFor="timberCode">
              Timber Code
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="timberCode"
                name="timberCode"
                type="text"
                placeholder="e.g., TIM-001, OAK-01"
                value={timber.timberCode}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">
              Timber Name
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Oak Wood, Pine Timber"
                value={timber.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Treatment Status
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <select
                id="status"
                name="status"
                value={timber.status}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select Status</option>
                <option value="Treated">Treated</option>
                <option value="Untreated">Untreated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-title">Dimensions</h4>
          
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
                  value={timber.length}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="longFeet">
                Long Feet
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="longFeet"
                  name="longFeet"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={timber.longFeet}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="width">
                Width (m)
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="width"
                  name="width"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={timber.width}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="thickness">
                Thickness (m)
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="thickness"
                  name="thickness"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={timber.thickness}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-title">Pricing & Inventory</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">
                Price per Unit (Rs.)
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={timber.price}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
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
                  value={timber.quantity}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {timber.price && timber.quantity && (
            <div className="price-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>Rs. {(Number(timber.price) * Number(timber.quantity)).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Value:</span>
                <span>Rs. {totalValue}</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {(timber.timberCode || timber.name || timber.status || timber.length || timber.price) && (
          <div className="preview-section">
            <h4>Summary</h4>
            <div className="preview-grid">
              {timber.timberCode && (
                <div className="preview-item">
                  <span className="preview-label">Code:</span>
                  <span className="preview-value">{timber.timberCode}</span>
                </div>
              )}
              {timber.name && (
                <div className="preview-item">
                  <span className="preview-label">Name:</span>
                  <span className="preview-value">{timber.name}</span>
                </div>
              )}
              {timber.status && (
                <div className="preview-item">
                  <span className="preview-label">Status:</span>
                  <span className="preview-value">{timber.status}</span>
                </div>
              )}
              {timber.length && (
                <div className="preview-item">
                  <span className="preview-label">Length:</span>
                  <span className="preview-value">{timber.length}m</span>
                </div>
              )}
              {timber.longFeet && (
                <div className="preview-item">
                  <span className="preview-label">Long Feet:</span>
                  <span className="preview-value">{timber.longFeet}</span>
                </div>
              )}
              {timber.width && (
                <div className="preview-item">
                  <span className="preview-label">Width:</span>
                  <span className="preview-value">{timber.width}m</span>
                </div>
              )}
              {timber.thickness && (
                <div className="preview-item">
                  <span className="preview-label">Thickness:</span>
                  <span className="preview-value">{timber.thickness}m</span>
                </div>
              )}
              {timber.price && (
                <div className="preview-item">
                  <span className="preview-label">Price:</span>
                  <span className="preview-value">Rs. {timber.price}</span>
                </div>
              )}
              {timber.quantity && (
                <div className="preview-item">
                  <span className="preview-label">Quantity:</span>
                  <span className="preview-value">{timber.quantity}</span>
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
              'Add Timber'
            )}
          </button>
          
          <button 
            type="button" 
            className="reset-btn"
            onClick={() => {
              setTimber({
                timberCode: "",
                name: "",
                status: "",
                length: "",
                longFeet: "",
                width: "",
                thickness: "",
                price: "",
                quantity: "",
              });
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
    </div>
  );
};

export default AddTimber;