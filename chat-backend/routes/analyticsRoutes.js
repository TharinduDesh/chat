// chat-backend/routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { subDays, format } = require("date-fns");

/**
 * @route   GET /api/analytics/stats
 * @desc    Get dashboard summary statistics
 * @access  Private (Admin only)
 */
router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalConversations = await Conversation.countDocuments({});
    const totalMessages = await Message.countDocuments({});

    // Get the activeUsers object we set in server.js
    const activeUsers = req.app.get("activeUsers") || {};
    const onlineUserCount = Object.keys(activeUsers).length;

    res.json({
      totalUsers,
      totalConversations,
      totalMessages,
      onlineUserCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching stats." });
  }
});

/**
 * @route   GET /api/analytics/new-users-chart
 * @desc    Get data for new user signups for the last 7 days
 * @access  Private (Admin only)
 */
router.get("/new-users-chart", protectAdmin, async (req, res) => {
  try {
    const today = new Date();
    const last7Days = subDays(today, 7);

    const userSignups = await User.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format data for the chart
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, "yyyy-MM-dd");
      const dayName = format(date, "EEE"); // 'Mon', 'Tue', etc.

      const found = userSignups.find((item) => item._id === dateString);
      chartData.push({
        date: dayName,
        "New Users": found ? found.count : 0,
      });
    }

    res.json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching chart data." });
  }
});

/**
 * @route   GET /api/analytics/most-active-users
 * @desc    Get the top 5 most active users by message count
 * @access  Private (Admin only)
 */
router.get("/most-active-users", protectAdmin, async (req, res) => {
  try {
    const mostActiveUsers = await Message.aggregate([
      // Stage 1: Group messages by sender and count them
      {
        $group: {
          _id: "$sender", // Group by the sender's ObjectId
          messageCount: { $sum: 1 }, // Count the number of documents in each group
        },
      },
      // Stage 2: Sort the groups by message count in descending order
      {
        $sort: { messageCount: -1 },
      },
      // Stage 3: Limit the results to the top 5
      {
        $limit: 5,
      },
      // Stage 4: Join with the 'users' collection to get user details
      {
        $lookup: {
          from: "users", // The collection to join with
          localField: "_id", // The field from the input documents (the grouped sender ID)
          foreignField: "_id", // The field from the documents of the "from" collection
          as: "userDetails", // The name of the new array field to add
        },
      },
      // Stage 5: Deconstruct the userDetails array and merge its fields
      {
        $unwind: "$userDetails",
      },
      // Stage 6: Project the final fields we want to send to the client
      {
        $project: {
          _id: 0, // Exclude the default _id field
          userId: "$userDetails._id",
          fullName: "$userDetails.fullName",
          profilePictureUrl: "$userDetails.profilePictureUrl",
          messageCount: "$messageCount",
        },
      },
    ]);

    res.json(mostActiveUsers);
  } catch (error) {
    console.error("Most Active Users Error:", error);
    res.status(500).json({ message: "Server error fetching active users." });
  }
});

module.exports = router;
