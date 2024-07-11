import React, { useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
  linearProgressClasses,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const FeedbackCard = ({ heading, feedbackPoints, score }) => {
  const [showFeedback, setShowFeedback] = useState(true);
  const headingsLabelMapping = {
    relevance: "Relevance",
    delivery: "Delivery",
    tone: "Tone",
  };

  // Helper method to get appropriate color to describe the score
  const getColorForScore = (score) => {
    // if (score >= 8) return theme.palette.violet.dark; // Use dark violet for high scores
    // if (score >= 5) return theme.palette.violet.light; // Use light violet for medium scores
    // return theme.palette.gray.dark; // Use dark gray for low scores
    return "gray";
  };

  return (
    <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: "10px" }}>
      <Typography
        variant="body1"
        sx={{ mb: 1, fontFamily: "Roboto", fontWeight: "bold" }}
      >
        {headingsLabelMapping[heading]}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={score * 10}
        sx={{
          mb: 1,
          height: 3,
          borderRadius: 5,
          [`& .${linearProgressClasses.bar}`]: {
            backgroundColor: "gray",
          },
        }}
      />
      {showFeedback && (
        <Box>
          {Array.isArray(feedbackPoints) &&
            feedbackPoints.map((point, index) => (
              <Typography
                display="flex"
                alignItems="top"
                key={index}
                variant="body2"
                sx={{ mb: 0.5, fontFamily: "Roboto" }}
              >
                <ChevronRightIcon
                  key={index}
                  sx={{ fontSize: 20, marginRight: 0.5 }}
                />
                {point}
              </Typography>
            ))}
        </Box>
      )}
      <Button
        size="small"
        // color="gray"
        onClick={() => setShowFeedback(!showFeedback)}
      >
        {showFeedback ? "Hide Feedback" : "Show Feedback"}
      </Button>
    </Paper>
  );
};

export default FeedbackCard;
