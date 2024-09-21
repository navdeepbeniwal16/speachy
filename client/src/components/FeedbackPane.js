import {
  Box,
  Container,
  Button,
  Typography,
  Chip,
  Paper,
  styled,
} from "@mui/material";
import { React, useState } from "react";
import FeedbackCard from "./FeedbackCard";
import DetailedFeedbackModal from "../components/DetailedFeedbackModal";
import SummarizeIcon from "@mui/icons-material/Summarize";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import AlarmOnOutlinedIcon from "@mui/icons-material/AlarmOnOutlined";
import SpeedIcon from "@mui/icons-material/Speed";
import BoltIcon from "@mui/icons-material/Bolt";

const FeedbackPane = ({ feedback }) => {
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
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
              }}
              style={{ backgroundColor: "#FA735B", color: "#FFF" }}
            >
              <TipsAndUpdatesIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {feedback.tip}
              </Typography>
            </Paper>

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
                label={"1:23"}
                sx={{ mr: 1 }}
              ></Chip>
              <Chip
                icon={<SpeedIcon />}
                label={"Fast (198 WPM)"}
                sx={{ mr: 1 }}
              ></Chip>
              <Chip
                icon={<BoltIcon />}
                label={feedback.fillers + " Filler Words"}
                sx={{ mr: 1 }}
              ></Chip>
            </Box>

            {Object.entries(feedback?.summary || {}).map(
              ([heading, details]) => (
                <FeedbackCard
                  heading={heading}
                  score={details.score}
                  feedbackPoints={details.waysToImprove}
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
                }}
                style={{ backgroundColor: "#FA735B" }}
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
