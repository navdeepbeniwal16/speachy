import React, { useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
      <Typography variant="body1" sx={{ mb: 1, fontWeight: "bold" }}>
        {headingsLabelMapping[heading] || "Unknown Heading"}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={score * 10}
        sx={{
          mb: 1,
          height: 4,
          borderRadius: 5,
          [`& .MuiLinearProgress-bar`]: {
            backgroundColor: progressBarColor,
          },
        }}
      />
      {showFeedback && (
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
                <ChevronRightIcon sx={{ fontSize: 20, marginRight: 1 }} />
                {point}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              No feedback available
            </Typography>
          )}
        </Box>
      )}
      <Button
        size="small"
        onClick={() => setShowFeedback(!showFeedback)}
        sx={{ mt: 2 }}
      >
        {showFeedback ? "Hide Feedback" : "Show Feedback"}
      </Button>
    </Paper>
  );
};

export default FeedbackCard;
