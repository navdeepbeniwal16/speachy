import React from "react";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "80vh",
  bgcolor: "background.paper",
  border: "0.5px solid gray",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
  zIndex: 1,
};

const DetailedFeedbackModal = ({ open, handleClose, feedbackText }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography></Typography>
          <Typography variant="h6" gutterBottom>
            Detailed Feedback
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon></CloseIcon>
          </IconButton>
        </Box>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          {feedbackText}
        </Typography>
      </Box>
    </Modal>
  );
};

export default DetailedFeedbackModal;
