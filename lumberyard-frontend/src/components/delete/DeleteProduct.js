// src/components/delete/DeleteProduct.js
import React, { useState } from "react";
import API from "../../services/api";
import "./DeleteProduct.css";

const DeleteProduct = ({ productType }) => {
  const [productCode, setProductCode] = useState("");
  const [step, setStep] = useState(1); // 1: enter code, 2: confirm
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Get API endpoint based on product type
  const getApiEndpoint = () => {
    switch(productType) {
      case "timber": return "/timber";
      case "logs": return "/logs";
      case "chemical": return "/chemical";
      default: return "/timber";
    }
  };

  // Get product code field name
  const getCodeField = () => {
    switch(productType) {
      case "timber": return "timberCode";
      case "logs": return "logCode";
      case "chemical": return "chemicalCode";
      default: return "timberCode";
    }
  };

  // Get parameter name for delete request
  const getParamName = () => {
    switch(productType) {
      case "timber": return "timberCode";
      case "logs": return "logCode";
      case "chemical": return "chemicalCode";
      default: return "timberCode";
    }
  };

  // Get display name for product type
  const getProductTypeName = () => {
    switch(productType) {
      case "timber": return "Timber";
      case "logs": return "Log";
      case "chemical": return "Chemical";
      default: return "Product";
    }
  };

  // Helper function to extract error message from response
  const extractErrorMessage = (error) => {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        return errorData;
      } else if (errorData.message) {
        return errorData.message;
      } else if (errorData.error) {
        return errorData.error;
      } else {
        // If it's an object but we can't extract a message, return a generic message
        return "Server error occurred";
      }
    } else if (error.message) {
      return error.message;
    }
    return "An unknown error occurred";
  };

  // Search for product by code
  const handleSearch = async () => {
    if (!productCode.trim()) {
      setMessage("Please enter a product code");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const codeField = getCodeField();
      // Search for product with the given code
      const res = await API.get(`${getApiEndpoint()}/search?code=${productCode}`);
      
      if (res.data && res.data.length > 0) {
        // Find exact match
        const exactMatch = res.data.find(item => 
          item[codeField]?.toLowerCase() === productCode.toLowerCase()
        );
        
        if (exactMatch) {
          setProduct(exactMatch);
          setStep(2);
          setMessage("");
        } else {
          setMessage(`No ${getProductTypeName().toLowerCase()} found with code "${productCode}"`);
          setMessageType("error");
        }
      } else {
        setMessage(`No ${getProductTypeName().toLowerCase()} found with code "${productCode}"`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error searching product:", error);
      const errorMessage = extractErrorMessage(error);
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!product) return;

    setDeleting(true);
    setMessage("");

    try {
      // Get the correct code field based on product type
      const codeField = getCodeField();
      const code = product[codeField];
      const paramName = getParamName();
      
      console.log(`Deleting ${productType} with code:`, code);
      console.log(`Using parameter:`, paramName);
      
      // Use query parameter as expected by your backend
      const response = await API.delete(`${getApiEndpoint()}/delete`, {
        params: {
          [paramName]: code
        }
      });
      
      console.log("Delete response:", response);
      
      // Extract message from response - handle different response formats
      let successMessage = "Deleted successfully!";
      if (response.data) {
        if (typeof response.data === 'string') {
          successMessage = response.data;
        } else if (response.data.message) {
          successMessage = response.data.message;
        }
      }
      
      setMessage(successMessage);
      setMessageType("success");
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setProductCode("");
        setProduct(null);
        setStep(1);
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error deleting product:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      
      const errorMessage = extractErrorMessage(error);
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setProductCode("");
    setProduct(null);
    setStep(1);
    setMessage("");
  };

  // Get icon based on product type
  const getProductIcon = () => {
    switch(productType) {
      case "timber": return "🪚";
      case "logs": return "🪵";
      case "chemical": return "🧪";
      default: return "📦";
    }
  };

  // Get color based on product type
  const getProductColor = () => {
    switch(productType) {
      case "timber": return "#f59e0b";
      case "logs": return "#059669";
      case "chemical": return "#3b82f6";
      default: return "#64748b";
    }
  };

  return (
    <div className="delete-product">
      <div className="delete-product-card">
        {/* Header */}
        <div className="delete-header">
          <div className="delete-icon-wrapper" style={{ backgroundColor: `${getProductColor()}15`, color: getProductColor() }}>
            <span className="delete-icon">{getProductIcon()}</span>
          </div>
          <h3>Delete {getProductTypeName()}</h3>
          <p className="delete-subtitle">
            {step === 1 
              ? `Enter the ${getProductTypeName().toLowerCase()} code to remove from inventory` 
              : `Confirm deletion of ${product?.name || getProductTypeName()}`}
          </p>
        </div>

        {/* Step 1: Enter Code */}
        {step === 1 && (
          <div className="delete-step">
            <div className="form-group">
              <label htmlFor="productCode">
                {getProductTypeName()} Code
                <span className="required">*</span>
              </label>
              <div className="input-with-button">
                <div className="input-wrapper">
                  <input
                    id="productCode"
                    type="text"
                    placeholder={`Enter ${getProductTypeName().toLowerCase()} code`}
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="form-input"
                    autoFocus
                  />
                </div>
                <button 
                  className="search-product-btn"
                  onClick={handleSearch}
                  disabled={loading || !productCode.trim()}
                  style={{ backgroundColor: getProductColor() }}
                >
                  {loading ? <span className="spinner-small"></span> : "Find Product"}
                </button>
              </div>
              <p className="input-hint">
                Enter the unique code of the {getProductTypeName().toLowerCase()} you want to delete
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Confirm Delete */}
        {step === 2 && product && (
          <div className="delete-step confirm-step">
            {/* Product Preview */}
            <div className="product-preview">
              <h4>Product Details</h4>
              <div className="preview-details">
                <div className="preview-row">
                  <span className="preview-label">Code:</span>
                  <span className="preview-value code">{product[getCodeField()]}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Name:</span>
                  <span className="preview-value">{product.name || '-'}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Quantity:</span>
                  <span className="preview-value quantity">{product.quantity || 0}</span>
                </div>
                {product.price && (
                  <div className="preview-row">
                    <span className="preview-label">Price:</span>
                    <span className="preview-value">Rs. {product.price}</span>
                  </div>
                )}
                {product.status && (
                  <div className="preview-row">
                    <span className="preview-label">Status:</span>
                    <span className="preview-value">{product.status}</span>
                  </div>
                )}
                {product.length && (
                  <div className="preview-row">
                    <span className="preview-label">Length:</span>
                    <span className="preview-value">{product.length}m</span>
                  </div>
                )}
                {product.cubicFeet && (
                  <div className="preview-row">
                    <span className="preview-label">Volume:</span>
                    <span className="preview-value">{product.cubicFeet} ft³</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="delete-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div className="warning-text">
                <strong>Warning:</strong> This action cannot be undone. This will permanently delete this {getProductTypeName().toLowerCase()} from the inventory.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="delete-actions">
              <button 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleDelete}
                disabled={deleting}
                style={{ backgroundColor: '#dc2626' }}
              >
                {deleting ? (
                  <>
                    <span className="spinner-small"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`delete-message ${messageType}`}>
            <span className="message-icon">
              {messageType === "success" ? "✓" : "!"}
            </span>
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="delete-tips">
        <h4>Quick Tips</h4>
        <ul>
          <li>Make sure you have the correct product code before deleting</li>
          <li>Deleted products cannot be recovered</li>
          <li>Check product details carefully before confirming deletion</li>
          <li>Consider archiving instead of deleting for record keeping</li>
        </ul>
      </div>
    </div>
  );
};

export default DeleteProduct;