import axios from "axios";
import { getCurrentAdmin } from "./authService";

const API_URL = "http://localhost:5000/api/analytics";

const getAuthHeader = () => {
  const admin = getCurrentAdmin();
  return { Authorization: admin ? `Bearer ${admin.token}` : "" };
};

export const getDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getNewUsersChartData = async () => {
  const response = await axios.get(`${API_URL}/new-users-chart`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Function to get the top active users **
export const getMostActiveUsers = async () => {
  const response = await axios.get(`${API_URL}/most-active-users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
