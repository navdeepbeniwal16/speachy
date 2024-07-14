import { Box, Container, Button } from "@mui/material";
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
    <Container>
      <Box sx={{ my: "22px" }}>
        {feedback &&
          Object.entries(feedback.summary).map(([heading, details]) => (
            <FeedbackCard
              heading={heading}
              score={details.score}
              feedbackPoints={details.waysToImprove}
            />
          ))}
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" color="warning" onClick={handleOpenModal}>
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
