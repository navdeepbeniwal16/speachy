import React, { useState } from "react";
import {
  Box,
  LinearProgress,
  Paper,
  Typography,
  IconButton,
  Collapse,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const FeedbackCard = ({ heading, feedbackPoints = [], score = 0 }) => {
  const [showFeedback, setShowFeedback] = useState(true);

  const headingsLabelMapping = {
    relevance: "Relevance",
    delivery: "Delivery",
    tone: "Tone",
  };

  // Helper method to get appropriate color to describe the score
  const getColorForScore = (score) => {
    if (score >= 8) return "#4caf50"; // Green for high scores
    if (score >= 5) return "#ffeb3b"; // Yellow for medium scores
    return "#f44336"; // Red for low scores
  };

  const progressBarColor = getColorForScore(score);

  return (
    <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: "10px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body1" sx={{ mb: 1, fontWeight: "bold" }}>
          {headingsLabelMapping[heading] || "Unknown Heading"}
        </Typography>
        <IconButton onClick={() => setShowFeedback(!showFeedback)}>
          {showFeedback ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <LinearProgress
        variant="determinate"
        value={score * 10}
        sx={{
          mb: 1,
          height: 4,
          borderRadius: 5,
          [`& .MuiLinearProgress-bar`]: {
            backgroundColor: "#FA735B",
          },
        }}
      />
      <Collapse in={showFeedback}>
        <Box>
          {Array.isArray(feedbackPoints) && feedbackPoints.length > 0 ? (
            feedbackPoints.map((point, index) => (
              <Typography
                display="flex"
                alignItems="center"
                key={index}
                variant="body2"
                sx={{ mb: 0.5 }}
              >
                <CircleIcon sx={{ fontSize: 8, marginRight: 1 }} />
                {point}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              No feedback available
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FeedbackCard;
