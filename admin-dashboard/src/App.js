// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ProfilePage from "./pages/ProfilePage";
import ActivityLogPage from "./pages/ActivityLogPage";
import { getCurrentAdmin } from "./services/authService";

// This component protects routes that require authentication
const ProtectedRoute = ({ children }) => {
  const admin = getCurrentAdmin();
  return admin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* All dashboard routes are children of the DashboardLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default route is /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="manage-users" element={<ManageUsersPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
