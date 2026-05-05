import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Rating,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HubHeader from "../components/HubHeader.js";
import SnackbarAlert from "../components/SnackbarAlert";
import UserService from "../services/user-service";

const FAQPage = () => {
  const email = "contact@speachy.com";
  const primaryButtonSx = {
    textTransform: "none",
    fontWeight: 600,
    px: 3.5,
    py: 1.4,
    borderRadius: 2,
    backgroundColor: "#FA735B",
    boxShadow:
      "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
    "&:hover": {
      backgroundColor: "#f8643f",
      boxShadow:
        "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
    },
  };

  const faqs = [
    {
      question: "I can’t record my answer.",
      answer:
        "Ensure your microphone is enabled in browser/app settings. Refresh the page or restart the app.",
    },
    {
      question: "I didn’t receive feedback.",
      answer:
        "Check your internet connection. Some responses may take longer to process; try refreshing.",
    },
    {
      question: "My feedback doesn’t seem accurate.",
      answer:
        "Speachy’s AI improves over time—try different question types for better results. Provide feedback to help us refine our analysis.",
    },
  ];

  const [rating, setRating] = useState(null);
  const [userFeedback, setUserFeedback] = useState("");

  const uploadUserFeedback = async (rating, feedback) => {
    console.log("Submitting feedback to backend...");
    console.log("Rating:", rating);
    console.log("Feedback:", feedback);

    try {
      await UserService.postUserFeedback({ rating, feedbackText: feedback });

      triggerSnackbar("success", "Thanks for your feedback!");
      setRating(null);
      setUserFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      triggerSnackbar("error", "Failed to submit feedback. Please try again.");
    }
  };

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Snackbar flags
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  const triggerSnackbar = (type, message) => {
    setSnackbarOpen(false); // Close first to re-trigger
    setTimeout(() => {
      setSnackbarType(type);
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    }, 100);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return; // optional: allow dismiss on clickaway
    setSnackbarOpen(false);
  };

  const handleExpansion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    triggerSnackbar("info", "Email copied to clipboard!");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff4ef",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 5,
        px: 3,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "700px" }}>
        <HubHeader
          title="Help & FAQ"
          subtitle="Find answers to common questions or let us know how we can improve Speachy."
        />
      </Box>
      <Paper
        elevation={0}
        sx={{
          marginTop: 4,
          width: "100%",
          maxWidth: "700px",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
          border: "1px solid #f0e6e1",
          boxShadow: "0 2px 8px rgba(250, 115, 91, 0.06)",
        }}
      >
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expandedIndex === index}
            onChange={() => handleExpansion(index)}
            elevation={0}
            sx={{
              "&:before": {
                display: "none",
              },
              borderBottom:
                index === faqs.length - 1 ? "none" : "1px solid #f4e9e3",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-content-${index}`}
              id={`faq-header-${index}`}
              sx={{ py: 1.5 }}
            >
              <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: "rgba(60,32,25,0.72)" }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Box
        sx={{
          width: "100%",
          maxWidth: "700px",
          mt: 6,
          px: 3,
          py: 4,
          backgroundColor: "#fff",
          border: "1px solid #f0e6e1",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(250, 115, 91, 0.06)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          How are you finding Speachy so far?
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(60,32,25,0.72)", mb: 2 }}>
          We're eager to hear your feedback!
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
          <Rating
            name="feedback-rating"
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Share your thoughts..."
          variant="outlined"
          value={userFeedback}
          onChange={(e) => setUserFeedback(e.target.value)}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 0.5,
            mb: 3,
          }}
        />

        <Button
          variant="contained"
          onClick={() => uploadUserFeedback(rating, userFeedback)}
          disabled={!rating && userFeedback.trim() === ""}
          sx={primaryButtonSx}
        >
          Send feedback
        </Button>
      </Box>

      <Box
        sx={{
          mt: 6,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Have any other questions?
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(60,32,25,0.72)", mb: 2 }}>
          Don’t hesitate to send us an email with your enquiry or statement at:
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Paper
            variant="none"
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              bgcolor: "#fff4ef",
              border: "1px solid #f0e6e1",
            }}
          >
            <Typography
              sx={{
                mr: 2,
              }}
            >
              {email}
            </Typography>

            <IconButton
              onClick={copyToClipboard}
              sx={{
                color: "#FA735B",
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Paper>
        </Box>

        <SnackbarAlert
          alertType={snackbarType}
          alertMessage={snackbarMessage}
          isOpen={snackbarOpen}
          onClose={handleSnackbarClose}
        />
      </Box>
    </Box>
  );
};

export default FAQPage;
