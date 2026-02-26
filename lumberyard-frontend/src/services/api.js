// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081", // your Spring Boot backend
});

export default API;