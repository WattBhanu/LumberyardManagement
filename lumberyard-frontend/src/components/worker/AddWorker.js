import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./AddWorker.css";

const AddWorker = ({ refreshTable, editingWorker, onClose }) => {
  const [worker, setWorker] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    status: "ACTIVE",
    hireDate: "",
    dateOfBirth: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingWorker) {
      setWorker({
        firstName: editingWorker.firstName || "",
        lastName: editingWorker.lastName || "",
        email: editingWorker.email || "",
        phone: editingWorker.phone || "",
        position: editingWorker.position || "",
        department: editingWorker.department || "",
        status: editingWorker.status || "ACTIVE",
        hireDate: editingWorker.hireDate || "",
        dateOfBirth: editingWorker.dateOfBirth || "",
        address: editingWorker.address || "",
      });
    }
  }, [editingWorker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorker({ ...worker, [name]: value });
    if (message) setMessage("");
  };

  const validateForm = () => {
    if (!worker.firstName.trim()) {
      setMessage("First name is required");
      setMessageType("error");
      return false;
    }
    if (!worker.lastName.trim()) {
      setMessage("Last name is required");
      setMessageType("error");
      return false;
    }
    if (!worker.email.trim()) {
      setMessage("Email is required");
      setMessageType("error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(worker.email)) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return false;
    }
    if (!worker.phone.trim()) {
      setMessage("Phone number is required");
      setMessageType("error");
      return false;
    }
    if (!worker.position.trim()) {
      setMessage("Position is required");
      setMessageType("error");
      return false;
    }
    if (!worker.department.trim()) {
      setMessage("Department is required");
      setMessageType("error");
      return false;
    }
    if (!worker.hireDate) {
      setMessage("Hire date is required");
      setMessageType("error");
      return false;
    }
    if (!worker.dateOfBirth) {
      setMessage("Date of birth is required");
      setMessageType("error");
      return false;
    }
    if (!worker.address.trim()) {
      setMessage("Home address is required");
      setMessageType("error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const workerData = {
        firstName: worker.firstName.trim(),
        lastName: worker.lastName.trim(),
        email: worker.email.trim(),
        phone: worker.phone.trim(),
        position: worker.position.trim(),
        department: worker.department.trim(),
        status: worker.status,
        hireDate: worker.hireDate,
        dateOfBirth: worker.dateOfBirth,
        address: worker.address.trim(),
      };

      let res;
      if (editingWorker) {
        res = await API.put(`/workers/update/${editingWorker.workerId}`, workerData);
        setMessage(res.data?.message || "Worker updated successfully!");
      } else {
        res = await API.post("/workers/add", workerData);
        setMessage(res.data?.message || "Worker added successfully!");
      }

      setMessageType("success");

      if (!editingWorker) {
        setWorker({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          position: "",
          department: "",
          status: "ACTIVE",
          hireDate: "",
          dateOfBirth: "",
          address: "",
        });
      }

      setTimeout(() => {
        refreshTable();
        if (editingWorker && onClose) {
          onClose();
        }
      }, 1000);
    } catch (error) {
      console.error("Error saving worker:", error);
      let errorMessage = "Error saving worker. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "A worker with this email or phone already exists.";
      }
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setWorker({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      status: "ACTIVE",
      hireDate: "",
      dateOfBirth: "",
      address: "",
    });
    setMessage("");
    if (onClose) onClose();
  };

  return (
    <div className="add-worker-container">
      <h2>{editingWorker ? "Update Worker Profile" : "Add New Worker"}</h2>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="worker-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={worker.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={worker.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={worker.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={worker.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <select
              id="position"
              name="position"
              value={worker.position}
              onChange={handleChange}
              required
            >
              <option value="">Select a position</option>
              <option value="Sawyer">Sawyer</option>
              <option value="Forklift Operator">Forklift Operator</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Quality Inspector">Quality Inspector</option>
              <option value="Maintenance Technician">Maintenance Technician</option>
              <option value="Logistics Coordinator">Logistics Coordinator</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              name="department"
              value={worker.department}
              onChange={handleChange}
              required
            >
              <option value="">Select a department</option>
              <option value="Sawmill">Sawmill</option>
              <option value="Kiln Operations">Kiln Operations</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Logistics">Logistics</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={worker.status}
              onChange={handleChange}
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="hireDate">Hire Date *</label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={worker.hireDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth *</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={worker.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Home Address *</label>
          <textarea
            id="address"
            name="address"
            value={worker.address}
            onChange={handleChange}
            placeholder="Enter home address"
            rows="3"
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : editingWorker
              ? "Update Worker"
              : "Add Worker"}
          </button>
          {editingWorker && (
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddWorker;