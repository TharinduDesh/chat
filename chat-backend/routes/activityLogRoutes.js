// chat-backend/routes/activityLogRoutes.js
const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const ActivityLog = require("../models/ActivityLog");

/**
 * @route   GET /api/logs
 * @desc    Get all activity logs with optional filtering
 * @access  Private (Admin only)
 */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const { search } = req.query; // Get a search query param
    let query = {};

    if (search) {
      // Create a search query that looks for the text in adminName, action, or targetName
      query = {
        $or: [
          { adminName: { $regex: search, $options: "i" } },
          { action: { $regex: search, $options: "i" } },
          { targetName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const logs = await ActivityLog.find(query).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching logs." });
  }
});

/**
 * @route   GET /api/logs/recent
 * @desc    Get the 5 most recent activity logs
 * @access  Private (Admin only)
 */
router.get("/recent", protectAdmin, async (req, res) => {
  try {
    const recentLogs = await ActivityLog.find({})
      .sort({ timestamp: -1 }) // Get newest first
      .limit(5); // Limit the results to 5
    res.json(recentLogs);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching recent logs." });
  }
});

module.exports = router;
