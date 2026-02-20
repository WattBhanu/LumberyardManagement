import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddCategory from "./pages/AddCategory";
import ViewTable from "./pages/ViewTable";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Lumberyard Dashboard</h1>
        <div style={{ margin: "20px" }}>
          <Link to="/add-category">
            <button style={{ marginRight: "10px" }}>Add New Category</button>
          </Link>
          <Link to="/view-table">
            <button>See Table</button>
          </Link>
        </div>
      </div>

      <Routes>
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/view-table" element={<ViewTable />} />
      </Routes>
    </Router>
  );
}

export default App;
