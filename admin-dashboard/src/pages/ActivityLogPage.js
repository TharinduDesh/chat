// src/pages/ActivityLogPage.js
import React, { useState, useEffect, useCallback } from "react";
import { getActivityLogs } from "../services/activityLogService";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { debounce } from "lodash";

// Helper to give each action type a color for better visuals
const getActionChipColor = (action) => {
  switch (action) {
    case "CREATED_USER":
    case "RESTORED_USER":
      return "success";
    case "EDITED_USER":
    case "UNBANNED_USER":
      return "info";
    case "BANNED_USER":
      return "warning";
    case "DEACTIVATED_USER":
    case "PERMANENTLY_DELETED_USER":
      return "error";
    default:
      return "default";
  }
};

const formatActionText = (log) => {
  // ... (This helper function remains the same as before)
  const actionMap = {
    CREATED_USER: "created user",
    EDITED_USER: "edited user",
    DEACTIVATED_USER: "deactivated user",
    RESTORED_USER: "restored user",
    PERMANENTLY_DELETED_USER: "permanently deleted user",
    BANNED_USER: "banned user",
    UNBANNED_USER: "unbanned user",
  };
  return (
    <span>
      <strong>{log.adminName}</strong>{" "}
      {actionMap[log.action] || "performed an action on"}{" "}
      <strong>{log.targetName}</strong>.
    </span>
  );
};

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async (search) => {
    setLoading(true);
    try {
      const data = await getActivityLogs(search);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch activity logs", error);
    } finally {
      setLoading(false);
    }
  };

  // useMemo with debounce is a performance optimization to prevent API calls on every keystroke
  const debouncedFetch = useCallback(debounce(fetchLogs, 500), []);

  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => debouncedFetch.cancel(); // Cleanup debounce on component unmount
  }, [searchTerm, debouncedFetch]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Activity Log
      </Typography>

      <TextField
        label="Search Logs"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Paper>
        <List>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            logs.map((log, index) => (
              <React.Fragment key={log._id}>
                <ListItem
                  secondaryAction={
                    <Chip
                      label={log.action.replace("_", " ")}
                      color={getActionChipColor(log.action)}
                      size="small"
                    />
                  }
                >
                  <ListItemText
                    primary={formatActionText(log)}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                        {log.details && ` — Details: ${log.details}`}
                      </>
                    }
                  />
                </ListItem>
                {index < logs.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ActivityLogPage;
