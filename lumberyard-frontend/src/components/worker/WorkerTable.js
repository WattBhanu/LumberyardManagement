import React, { useState } from "react";
import API from "../../services/api";
import "./WorkerTable.css";

const WorkerTable = ({ workers, refreshTable, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Filter workers
  let filteredWorkers = workers.filter((worker) => {
    const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || worker.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "all" || worker.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Sort workers
  filteredWorkers.sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return 0;
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = async () => {
    if (!selectedWorker) return;

    setDeletingId(selectedWorker.workerId);
    try {
      await API.delete(`/workers/delete/${selectedWorker.workerId}`);
      setShowConfirmDelete(false);
      setSelectedWorker(null);
      refreshTable();
    } catch (error) {
      console.error("Error deleting worker:", error);
      const errorMessage = error.response?.data?.error || "Error deleting worker. Please try again.";
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteClick = (worker) => {
    setSelectedWorker(worker);
    setShowConfirmDelete(true);
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: "active",
      INACTIVE: "inactive",
      SUSPENDED: "suspended",
      TERMINATED: "terminated",
    };
    return statusMap[status] || "active";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="worker-table-container">
      <div className="table-header">
        <h2>Worker Directory</h2>
        <div className="table-info">
          <span className="info-badge">Total: {filteredWorkers.length}</span>
          <span className="info-badge active">
            Active: {filteredWorkers.filter((w) => w.status === "ACTIVE").length}
          </span>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Departments</option>
            <option value="Sawmill">Sawmill</option>
            <option value="Kiln Operations">Kiln Operations</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Logistics">Logistics</option>
            <option value="Administration">Administration</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="worker-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("firstName")}>
                Name {getSortIcon("firstName")}
              </th>
              <th onClick={() => handleSort("email")}>
                Email {getSortIcon("email")}
              </th>
              <th onClick={() => handleSort("phone")}>
                Phone Number {getSortIcon("phone")}
              </th>
              <th onClick={() => handleSort("position")}>
                Position {getSortIcon("position")}
              </th>
              <th onClick={() => handleSort("department")}>
                Department {getSortIcon("department")}
              </th>
              <th onClick={() => handleSort("dateOfBirth")}>
                Date of Birth {getSortIcon("dateOfBirth")}
              </th>
              <th>Home Address</th>
              <th onClick={() => handleSort("hireDate")}>
                Hire Date {getSortIcon("hireDate")}
              </th>
              <th onClick={() => handleSort("status")}>
                Status {getSortIcon("status")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <tr key={worker.workerId} className="worker-row">
                  <td className="name-cell">
                    {`${worker.firstName} ${worker.lastName}`}
                  </td>
                  <td>{worker.email}</td>
                  <td>{worker.phone}</td>
                  <td>{worker.position}</td>
                  <td>{worker.department}</td>
                  <td>{formatDate(worker.dateOfBirth)}</td>
                  <td>{worker.address}</td>
                  <td>{formatDate(worker.hireDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(worker.status)}`}>
                      {worker.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(worker)}
                      title="Edit worker"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteClick(worker)}
                      disabled={deletingId === worker.workerId}
                      title="Delete worker"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="empty-message">
                  No workers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showConfirmDelete && selectedWorker && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the worker profile for <strong>{selectedWorker.firstName} {selectedWorker.lastName}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-confirm-delete"
                onClick={handleDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? "Deleting..." : "Delete"}
              </button>
              <button
                className="btn-cancel-delete"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedWorker(null);
                }}
                disabled={deletingId !== null}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerTable;
