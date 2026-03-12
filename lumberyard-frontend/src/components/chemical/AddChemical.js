// src/components/chemical/AddChemical.js
import React, { useState } from "react";
import API from "../../services/api";
import "./AddChemical.css";

function AddChemical({ refreshTable }) {
  const [chemical, setChemical] = useState({
    chemicalCode: "",
    name: "",
    quantity: "",
    status: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setChemical({ ...chemical, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await API.post("/chemical/add", {
        chemicalCode: chemical.chemicalCode.trim(),
        name: chemical.name.trim(),
        quantity: Number(chemical.quantity),
        status: chemical.status.trim(),
      });

      setMessage(res.data);
      setMessageType("success");
      setChemical({ chemicalCode: "", name: "", quantity: "", status: "" });

      if (refreshTable) refreshTable();

    } catch (error) {
      setMessage(error.response?.data || "Error adding chemical");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-chemical">
      <div className="add-chemical-header">
        <h3>Add New Chemical</h3>
        <p className="header-description">Enter the details of the new chemical to add to inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="chemical-form">
        <div className="form-group">
          <label htmlFor="chemicalCode">
            Chemical Code
            <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="chemicalCode"
              name="chemicalCode"
              type="text"
              placeholder="e.g., CHEM-001, H2SO4-01"
              value={chemical.chemicalCode}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Chemical Name
            <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Sulfuric Acid, Sodium Hydroxide"
              value={chemical.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
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
                min="0"
                step="1"
                value={chemical.quantity}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Description
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="status"
                name="status"
                type="text"
                placeholder="e.g., Industrial grade, 98% purity"
                value={chemical.status}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>
        </div>

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
              'Add Chemical'
            )}
          </button>
          
          <button 
            type="button" 
            className="reset-btn"
            onClick={() => {
              setChemical({ chemicalCode: "", name: "", quantity: "", status: "" });
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
          <li>Use unique chemical codes for easy identification</li>
          <li>Include concentration/purity in description</li>
          <li>Enter quantity in standard units (liters/kg)</li>
          <li>Add safety codes in description if needed</li>
        </ul>
      </div>
    </div>
  );
}

export default AddChemical;