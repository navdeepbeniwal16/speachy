import React, { useState } from "react";
import {
  Box,
  LinearProgress,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";

const FeedbackCard = ({ heading, feedbackPoints = [], score = 0, example }) => {
  const [showFeedback, setShowFeedback] = useState(true);

  const headingsLabelMapping = {
    relevance: "Relevance",
    structure: "Structure",
    tone: "Tone",
    sentiment: "Sentiment",
    authenticity: "Authenticity",
  };

  const toolTipText = {
    relevance: "Measures how well the response answers the question",
    structure:
      "Measures how clearly the response is organized, including logical flow and storytelling",
    tone: "Appropriateness of professionalism, enthusiasm, and engagement",
    sentiment:
      "Measures the warmth, positivity, and emotional alignment of the response",
    authenticity:
      "Measures how genuine, personal, and unique the response feels, reflecting the individual’s true character and approach",
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
          <Tooltip title={toolTipText[heading]}>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
            background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
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
        {/* {example && (
          <Paper
            variant="outlined"
            sx={{ mt: 1, p: 2, borderRadius: "10px" }}
            style={{ background: "#f9f5f7" }}
          >
            <Typography variant="caption" fontStyle="italic">
              ..{example}..
            </Typography>
          </Paper>
        )} */}
      </Collapse>
    </Paper>
  );
};

export default FeedbackCard;
