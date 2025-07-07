// src/pages/DashboardPage.js
import React, { useState, useEffect } from "react";
import {
  getDashboardStats,
  getNewUsersChartData,
  getMostActiveUsers,
} from "../services/analyticsService";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ForumIcon from "@mui/icons-material/Forum";
import MessageIcon from "@mui/icons-material/Message";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { io } from "socket.io-client";
import { getCurrentAdmin } from "../services/authService";
import RecentActivity from "../components/RecentActivity";
import MostActiveUsers from "../components/MostActiveUsers";

const StatCard = (
  { title, value, icon, color } /* ... (this component remains the same) ... */
) => (
  <Card sx={{ display: "flex", alignItems: "center", p: 2 }}>
    <Box sx={{ p: 2, bgcolor: color, color: "white", borderRadius: "50%" }}>
      {icon}
    </Box>
    <Box sx={{ flexGrow: 1, ml: 2 }}>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Box>
  </Card>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the real-time online user count **
  const [onlineUserCount, setOnlineUserCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, newUsersData] = await Promise.all([
          getDashboardStats(),
          getNewUsersChartData(),
        ]);
        setStats(statsData);
        setChartData(newUsersData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // ** NEW: Set up Socket.IO connection **
    const admin = getCurrentAdmin();
    if (!admin) return;
    // We connect as an admin user to the main socket namespace
    const socket = io("http://localhost:5000", {
      query: { userId: `admin_${admin.admin._id}` }, // Give admin a unique ID
    });

    // Listen for the 'activeUsers' event
    socket.on("activeUsers", (activeUserIds) => {
      // We filter out other admins from the count to only show chat app users
      const chatUsersOnline = activeUserIds.filter(
        (id) => !id.startsWith("admin_")
      );

      // Update the state with the correct count
      setOnlineUserCount(chatUsersOnline.length);
    });

    // Clean up the connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? "..."}
            icon={<PeopleAltIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Conversations"
            value={stats?.totalConversations ?? "..."}
            icon={<ForumIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Messages"
            value={stats?.totalMessages ?? "..."}
            icon={<MessageIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {/* ** UPDATED: This card now uses the real-time state variable ** */}
          <StatCard
            title="Online Users"
            value={onlineUserCount}
            icon={<OnlinePredictionIcon />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Chart Card remains the same */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            New Users (Last 7 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="New Users" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid item xs={12} lg={4}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Most Active Users Leaderboard */}
          <MostActiveUsers />

          {/* Recent Activity Feed */}
          <RecentActivity />
        </Box>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
