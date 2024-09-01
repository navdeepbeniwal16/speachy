import { Box, Container, Button, Typography } from "@mui/material";
import { React, useState } from "react";
import FeedbackCard from "./FeedbackCard";
import DetailedFeedbackModal from "../components/DetailedFeedbackModal";

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
      <Typography variant="h6">Summary</Typography>

      <Box sx={{ py: 2 }}>
        {feedback &&
          Object.entries(feedback.summary).map(([heading, details]) => (
            <FeedbackCard
              heading={heading}
              score={details.score}
              feedbackPoints={details.waysToImprove}
            />
          ))}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="warning"
            onClick={handleOpenModal}
            sx={{ width: "100%", textTransform: "none", fontWeight: "bold" }}
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
    </Container>
  );
};

export default FeedbackPane;
