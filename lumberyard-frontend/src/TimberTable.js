import React, { useState, useEffect } from "react";
import axios from "axios";

function TimberTable() {
  const [timbers, setTimbers] = useState([]);
  const [reduceData, setReduceData] = useState({ timberCode: "", quantity: "" });
  const [addData, setAddData] = useState({ timberCode: "", quantity: "" });
  const [message, setMessage] = useState("");

  const fetchTimbers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/timber/all");
      setTimbers(res.data);
    } catch (err) {
      console.error("Error fetching timbers:", err);
    }
  };

  useEffect(() => {
    fetchTimbers();
  }, []);

  const rawTimbers = timbers.filter(t => t.status.toLowerCase() === "raw");
  const treatedTimbers = timbers.filter(t => t.status.toLowerCase() === "treated");

  const handleReduceChange = (e) => setReduceData({ ...reduceData, [e.target.name]: e.target.value });
  const handleAddChange = (e) => setAddData({ ...addData, [e.target.name]: e.target.value });

  const handleReduceStock = async () => {
    if (!reduceData.timberCode || !reduceData.quantity) {
      setMessage("Please enter Timber Code and Quantity to reduce");
      return;
    }
    try {
      await axios.put("http://localhost:8080/timber/reduce", null, {
        params: { timberCode: reduceData.timberCode, quantity: parseFloat(reduceData.quantity) }
      });
      setMessage("Stock reduced successfully!");
      setReduceData({ timberCode: "", quantity: "" });
      fetchTimbers();
    } catch (err) {
      setMessage("Error reducing stock");
      console.error(err);
    }
  };

  const handleAddStock = async () => {
    if (!addData.timberCode || !addData.quantity) {
      setMessage("Please enter Timber Code and Quantity to add");
      return;
    }
    try {
      await axios.put("http://localhost:8080/timber/addStock", null, {
        params: { timberCode: addData.timberCode, quantity: parseFloat(addData.quantity) }
      });
      setMessage("Stock added successfully!");
      setAddData({ timberCode: "", quantity: "" });
      fetchTimbers();
    } catch (err) {
      setMessage("Error adding stock");
      console.error(err);
    }
  };

  const renderTable = (title, data) => (
    <div style={{ margin: "20px auto", maxWidth: "90%", backgroundColor: "#fff8f0", borderRadius: "15px", padding: "15px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
      <h3 style={{ color: "#ff9800", marginBottom: "10px" }}>{title}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#ffcc80" }}>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Length</th>
            <th>Long Feet</th>
            <th>Width</th>
            <th>Thickness</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {data.map(t => (
            <tr key={t.id} style={{ textAlign: "center", borderBottom: "1px solid #ffd699" }}>
              <td>{t.id}</td>
              <td>{t.timberCode}</td>
              <td>{t.name}</td>
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
    </div>
  );

  const inputStyle = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ffcc80",
    outline: "none",
    marginRight: "10px",
    width: "150px"
  };

  const buttonStyle = {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#ff9800",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s"
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1 style={{ color: "#ff9800" }}>Timber Inventory</h1>

      {renderTable("Untreated Timber", rawTimbers)}
      {renderTable("Treated Timber", treatedTimbers)}

      {/* Reduce Stock Form */}
      <div style={{ marginTop: "30px", backgroundColor: "#fff8f0", padding: "20px", borderRadius: "15px", display: "inline-block", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}>
        <h3 style={{ color: "#ff9800" }}>Reduce Timber Stock</h3>
        <input
          type="text"
          name="timberCode"
          placeholder="Timber Code"
          value={reduceData.timberCode}
          onChange={handleReduceChange}
          style={inputStyle}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity to reduce"
          value={reduceData.quantity}
          onChange={handleReduceChange}
          style={inputStyle}
        />
        <button onClick={handleReduceStock} style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#ffb74d")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#ff9800")}
        >Reduce Stock</button>
      </div>

      {/* Add Stock Form */}
      <div style={{ marginTop: "30px", backgroundColor: "#fff8f0", padding: "20px", borderRadius: "15px", display: "inline-block", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}>
        <h3 style={{ color: "#ff9800" }}>Add Timber Stock</h3>
        <input
          type="text"
          name="timberCode"
          placeholder="Timber Code"
          value={addData.timberCode}
          onChange={handleAddChange}
          style={inputStyle}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity to add"
          value={addData.quantity}
          onChange={handleAddChange}
          style={inputStyle}
        />
        <button onClick={handleAddStock} style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#ffb74d")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#ff9800")}
        >Add Stock</button>
      </div>

      {message && <p style={{ color: "#ff9800", fontWeight: "bold", marginTop: "20px" }}>{message}</p>}
    </div>
  );
}

export default TimberTable;