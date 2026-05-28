import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // Hardcoded since no .env file
});

export default axiosInstance;