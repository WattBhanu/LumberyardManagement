import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AddWorker from "./AddWorker";
import WorkerTable from "./WorkerTable";
import API from "../../services/api";
import "./WorkerPage.css";

const WorkerPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const tableRef = useRef();

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/workers/all");
      console.log("Workers fetched from API:", res.data);
      setWorkers(res.data || []);

      // Calculate stats
      const data = res.data || [];
      const total = data.length;
      const active = data.filter((w) => w.status === "ACTIVE").length;
      const inactive = data.filter((w) => w.status === "INACTIVE").length;

      setStats({
        total,
        active,
        inactive,
      });
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const refreshTable = () => {
    fetchWorkers();
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingWorker(null);
  };

  return (
    <div className="worker-page">
      <div className="page-content">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-left">
            <Link to="/labor-dashboard" className="back-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </Link>
            <h1>Worker Profile Management</h1>
            <span className="header-badge">Human Resources</span>
          </div>

          <div className="header-right">
            <button
              className="btn-add-worker"
              onClick={() => {
                setEditingWorker(null);
                setShowAddForm(true);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add New Worker
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Workers</p>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>Active Workers</p>
            </div>
          </div>

          <div className="stat-card inactive">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.inactive}</h3>
              <p>Inactive Workers</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Worker Form */}
        {showAddForm && (
          <div className="form-section">
            <AddWorker
              refreshTable={refreshTable}
              editingWorker={editingWorker}
              onClose={handleCloseForm}
            />
          </div>
        )}

        {/* Worker Table */}
        {!loading ? (
          <WorkerTable
            workers={workers}
            refreshTable={refreshTable}
            onEdit={handleEdit}
          />
        ) : (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading workers...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerPage;
