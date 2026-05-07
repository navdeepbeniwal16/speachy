import { Box, Container, Button, Typography, Chip, Paper } from "@mui/material";
import { React, useState } from "react";
import FeedbackCard from "./FeedbackCard";
import DetailedFeedbackModal from "../components/DetailedFeedbackModal";
import SummarizeIcon from "@mui/icons-material/Summarize";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import AlarmOnOutlinedIcon from "@mui/icons-material/AlarmOnOutlined";
import SpeedIcon from "@mui/icons-material/Speed";
import BoltIcon from "@mui/icons-material/Bolt";

const FeedbackPane = ({ feedback, transcription, showAudioMetrics = true }) => {
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  // Get the duration formatted in MM:SS (minutes:seconds)
  const getDurationFormattedString = (seconds) => {
    // NOTE: the function doesn't format for hours when duration is over an hour
    let minutes = parseInt(seconds / 60);
    let remainderSeconds = seconds % 60;

    if (String(minutes).length === 1) {
      minutes = "0" + minutes;
    }

    if (String(remainderSeconds).length === 1) {
      remainderSeconds = "0" + remainderSeconds;
    }

    const formattedDurationString = `${minutes}:${remainderSeconds}`;
    return formattedDurationString;
  };

  // Get a string representing the pace Pace (WPM)
  const getPraceString = (transcription, seconds) => {
    const noOfWords = transcription?.split(" ").length || 0;

    if (seconds === 0) return "Invalid"; // TODO: Can we think of a better string to return

    const wordsPerMinute = parseInt((noOfWords * 60) / seconds);

    let pace = "";
    if (wordsPerMinute <= 110) {
      pace = "Slow";
    } else if (wordsPerMinute > 110 && wordsPerMinute <= 160) {
      pace = "Good";
    } else {
      pace = "Fast";
    }

    return `${pace} (${noOfWords} WPM)`;
  };

  return (
    <Container sx={{ py: 2 }}>
      {feedback && (
        <Box>
          <Typography variant="h6">Summary</Typography>

          <Box
            sx={{
              py: 2,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                mb: 2,
                p: 2,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                borderColor: "#FA735B",
              }}
            >
              <SummarizeIcon style={{ color: "#FA735B" }} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {feedback.overview}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                mb: 2,
                p: 2,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
                color: "#FFF",
              }}
            >
              <TipsAndUpdatesIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {feedback.tip}
              </Typography>
            </Paper>

            {showAudioMetrics && (
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  flexDirection: "row",
                  alignContent: "space-around",
                }}
              >
                <Chip
                  icon={<AlarmOnOutlinedIcon />}
                  label={getDurationFormattedString(feedback?.duration || 0)}
                  sx={{ mr: 1 }}
                ></Chip>
                <Chip
                  icon={<SpeedIcon />}
                  label={getPraceString(
                    transcription.text || "",
                    feedback?.duration || 0
                  )}
                  sx={{ mr: 1 }}
                ></Chip>
                <Chip
                  icon={<BoltIcon />}
                  label={(feedback?.fillers || "No") + " Filler Words"}
                  sx={{ mr: 1 }}
                ></Chip>
              </Box>
            )}

            {Object.entries(feedback?.summary || {}).map(
              ([heading, details]) => (
                <FeedbackCard
                  heading={heading}
                  score={details.score}
                  feedbackPoints={details.waysToImprove}
                  example={details.exampleResponseExcerpt}
                />
              )
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="warning"
                onClick={handleOpenModal}
                sx={{
                  width: "100%",
                  textTransform: "none",
                  fontWeight: "bold",
                  background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(90deg, #e7610b, #db2037)",
                  },
                }}
              >
                See Detailed Feedback
              </Button>
            </Box>
          </Box>
          <DetailedFeedbackModal
            open={open}
            handleClose={handleCloseModal}
            feedbackText={feedback.detailedFeedback}
          />
        </Box>
      )}
    </Container>
  );
};

export default FeedbackPane;
