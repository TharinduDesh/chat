// src/services/activityLogService.js
import axios from "axios";
import { getCurrentAdmin } from "./authService";

const API_URL = "http://localhost:5000/api/logs";

const getAuthHeader = () => {
  const admin = getCurrentAdmin();
  return { Authorization: admin ? `Bearer ${admin.token}` : "" };
};

// Update this function to accept a search term
export const getActivityLogs = async (searchTerm = "") => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeader(),
    params: { search: searchTerm }, // Pass the search term as a query parameter
  });
  return response.data;
};

// Function to get only the most recent logs **
export const getRecentActivityLogs = async () => {
  const response = await axios.get(`${API_URL}/recent`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
