// src/pages/DeletePage.js
import React, { useState } from "react";
import DeleteProduct from "../components/delete/DeleteProduct";
import "./DeletePage.css";

const DeletePage = () => {
  const [deleteType, setDeleteType] = useState("timber"); // timber, logs, chemical

  return (
    <div className="delete-page">
      <div className="delete-page-content">
        {/* Header */}
        <div className="delete-page-header">
          <h1>Delete Product</h1>
          <p className="header-description">Remove products from inventory by entering their code</p>
        </div>

        {/* Type Selection Tabs */}
        <div className="delete-type-tabs">
          <button
            className={`delete-type-tab ${deleteType === 'timber' ? 'active timber' : ''}`}
            onClick={() => setDeleteType('timber')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2"></rect>
              <line x1="8" y1="10" x2="16" y2="10"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
            </svg>
            Delete Timber
          </button>
          <button
            className={`delete-type-tab ${deleteType === 'logs' ? 'active logs' : ''}`}
            onClick={() => setDeleteType('logs')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z"></path>
              <line x1="4" y1="8" x2="20" y2="8"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="16" x2="20" y2="16"></line>
            </svg>
            Delete Logs
          </button>
          <button
            className={`delete-type-tab ${deleteType === 'chemical' ? 'active chemical' : ''}`}
            onClick={() => setDeleteType('chemical')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"></path>
              <path d="M8 4h8v4H8z"></path>
            </svg>
            Delete Chemical
          </button>
        </div>

        {/* Delete Form Component */}
        <DeleteProduct productType={deleteType} />
      </div>
    </div>
  );
};

export default DeletePage;