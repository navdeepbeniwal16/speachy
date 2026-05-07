import React, { useState } from "react";
import {
  Box,
  Container,
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
import BreadcrumbHeader from "../components/BreadcrumbHeader.js";
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

  const LINE = "rgba(252,150,120,0.12)";
  const INK = "#2f170f";
  const INK_2 = "rgba(60,32,25,0.78)";
  const MUTED = "rgba(60,32,25,0.45)";
  const CORAL = "#FA735B";
  const SURFACE_SHADOW = "0 18px 36px rgba(252,150,120,0.10)";
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252,150,120,0.35)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252,150,120,0.6)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: CORAL,
        borderWidth: "1px",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff4ef",
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="md">
        <BreadcrumbHeader
          parentLabel="Home"
          parentPath="/home"
          currentLabel="Help & FAQ"
        />
        <HubHeader
          title="Help & FAQ"
          subtitle="Find answers to common questions or let us know how we can improve Speachy."
        />

        {/* FAQ accordion card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "18px",
            overflow: "hidden",
            backgroundColor: "#fff",
            border: `1px solid ${LINE}`,
            boxShadow: SURFACE_SHADOW,
            mb: 3,
          }}
        >
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expandedIndex === index}
              onChange={() => handleExpansion(index)}
              elevation={0}
              sx={{
                "&:before": { display: "none" },
                borderBottom:
                  index === faqs.length - 1 ? "none" : `1px solid ${LINE}`,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`faq-content-${index}`}
                id={`faq-header-${index}`}
                sx={{ px: 3, py: 1.5 }}
              >
                <Typography sx={{ fontWeight: 500, color: INK }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3 }}>
                <Typography sx={{ color: INK_2, lineHeight: 1.65 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        {/* Feedback card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "18px",
            backgroundColor: "#fff",
            border: `1px solid ${LINE}`,
            boxShadow: SURFACE_SHADOW,
            mb: 3,
          }}
        >
          <Typography
            sx={{ fontSize: 16, fontWeight: 700, color: INK, mb: 0.5 }}
          >
            How are you finding Speachy so far?
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: MUTED, mb: 2.5 }}>
            We’re eager to hear your feedback!
          </Typography>

          <Box sx={{ mb: 2.5 }}>
            <Rating
              name="feedback-rating"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              sx={{
                "& .MuiRating-iconFilled": { color: CORAL },
                "& .MuiRating-iconHover": { color: CORAL },
              }}
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
            sx={{ ...inputSx, mb: 3 }}
          />

          <Button
            variant="contained"
            onClick={() => uploadUserFeedback(rating, userFeedback)}
            disabled={!rating && userFeedback.trim() === ""}
            sx={primaryButtonSx}
          >
            Send feedback
          </Button>
        </Paper>

        {/* Contact section */}
        <Box sx={{ textAlign: "center", pt: 2, pb: 4 }}>
          <Typography
            sx={{ fontSize: 16, fontWeight: 700, color: INK, mb: 0.5 }}
          >
            Have any other questions?
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: MUTED, mb: 2.5 }}>
            Don’t hesitate to reach out at:
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#fff",
              border: `1px solid ${LINE}`,
              borderRadius: "12px",
              px: 2.5,
              py: 1.25,
            }}
          >
            <Typography sx={{ fontSize: 14, color: INK_2 }}>{email}</Typography>
            <IconButton
              onClick={copyToClipboard}
              size="small"
              sx={{
                color: CORAL,
                "&:hover": { backgroundColor: "rgba(250,115,91,0.08)" },
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <SnackbarAlert
          alertType={snackbarType}
          alertMessage={snackbarMessage}
          isOpen={snackbarOpen}
          onClose={handleSnackbarClose}
        />
      </Container>
    </Box>
  );
};

export default FAQPage;
