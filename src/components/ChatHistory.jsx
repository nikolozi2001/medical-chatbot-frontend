import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

const ChatHistory = ({
  chatSessions,
  onSelectSession,
  onBack,
  onDeleteSession,
  onClearHistory,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const handleDelete = (sessionId, e) => {
    e.stopPropagation(); // Prevent triggering the ListItemButton click
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDeleteSession(sessionToDelete);
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const confirmClearAll = () => {
    onClearHistory();
    setClearAllDialogOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      width: "100%",
      overflowX: "hidden" // Prevent horizontal scrolling
    }}>
      {/* Header with back button and clear all */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Changed to space-between
          mb: 2,
          padding: "8px 0", // Added padding
          width: "100%", // Ensure full width
        }}
      >
        {/* Left side with back button and title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={onBack}
            edge="start"
            aria-label="back"
            sx={{
              color: "primary.main",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.04)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            ჩეთის ისტორია
          </Typography>
        </Box>

        {/* Right side with clear all button */}
        {chatSessions.length > 0 && (
          <Tooltip title="Clear all chat history">
            <Button
              variant="text"
              color="error"
              size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setClearAllDialogOpen(true)}
              sx={{
                borderRadius: 4,
                px: 1, // Reduced horizontal padding
                mr: 1, // Reduced right margin
                "&:hover": {
                  bgcolor: "rgba(211, 47, 47, 0.04)",
                },
                transition: "all 0.2s ease",
              }}
            >
              წაშლა
            </Button>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {chatSessions.length > 0 ? (
        <List sx={{ 
          flexGrow: 1, 
          overflow: "auto",
          width: "100%", // Ensure full width
          overflowX: "hidden" // Prevent horizontal scrolling
        }}>
          {chatSessions.map((session) => (
            <ListItem
              key={session.id}
              disablePadding
              sx={{ 
                width: "100%", // Ensure full width
                paddingRight: "40px", // Slightly reduced padding
                position: "relative"  // Added relative position
              }}
            >
              <ListItemButton
                onClick={() => onSelectSession(session)}
                sx={{
                  width: "100%", // Ensure full width
                  borderRadius: 1,
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                  "&.Mui-selected": { bgcolor: "rgba(25, 118, 210, 0.08)" },
                  pr: 5, // Add right padding for the delete button space
                }}
              >
                <ListItemText
                  primary={`Chat ${session.id.slice(0, 8)}...`}
                  secondary={formatDate(session.date)}
                  sx={{
                    overflow: "hidden", // Prevent text overflow
                    textOverflow: "ellipsis", // Add ellipsis for overflowing text
                    whiteSpace: "nowrap" // Keep text on one line
                  }}
                />
              </ListItemButton>
              {/* Positioned absolutely within the relatively positioned ListItem */}
              <Tooltip title="Delete this chat session">
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => handleDelete(session.id, e)}
                  color="error"
                  sx={{
                    position: "absolute", // Absolute position
                    right: 4,            // Reduced from 8px
                    top: "50%",          // Center vertically
                    transform: "translateY(-50%)", // Center vertically
                    "&:hover": {
                      bgcolor: "rgba(211, 47, 47, 0.04)",
                      transform: "translateY(-50%) scale(1.1)", // Keep vertical centering when scaling
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            აქ ჯერ არაფერია
          </Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Chat Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this chat session? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
      >
        <DialogTitle>Clear All History</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all chat history? This will delete
            all your previous conversations and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmClearAll} color="error" autoFocus>
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ChatHistory.propTypes = {
  chatSessions: PropTypes.array.isRequired,
  onSelectSession: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onDeleteSession: PropTypes.func.isRequired,
  onClearHistory: PropTypes.func.isRequired,
};

export default ChatHistory;
