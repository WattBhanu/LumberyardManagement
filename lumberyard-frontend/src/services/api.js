// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080", // your Spring Boot backend
});

export default API;
