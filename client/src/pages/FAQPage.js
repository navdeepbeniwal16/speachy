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
import SnackbarAlert from "../components/SnackbarAlert";
import UserService from "../services/user-service";

const FAQPage = () => {
  const email = "contact@speachy.com";

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 5,
        px: 3,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        align="center"
        gutterBottom
        sx={{
          // background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
          background: "linear-gradient(90deg, #FA735B 20%, #FF8E53 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        How can we assist you?
      </Typography>
      <Typography
        variant="body1"
        align="center"
        sx={{ color: "gray", mb: 4, maxWidth: "600px" }}
      >
        Find the answers to frequently asked questions below or let us know what
        we can do to improve Speachy!
      </Typography>
      <Paper
        elevation={0}
        sx={{
          marginTop: 4,
          width: "100%",
          maxWidth: "700px",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#f9f5f4",
        }}
      >
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expandedIndex === index}
            onChange={() => handleExpansion(index)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-content-${index}`}
              id={`faq-header-${index}`}
            >
              <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: "gray" }}>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Box
        sx={{
          width: "100%",
          maxWidth: "700px",
          mt: 6,
          px: 2,
          py: 4,
          backgroundColor: "#f9f5f4",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          How are you finding Speachy so far?
        </Typography>
        <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
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
          sx={{
            // background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
            color: "#fff",
            fontWeight: "bold",
            px: 4,
            py: 1,
            // borderRadius: 2,
            textTransform: "none",
            backgroundColor: "#FA735B",
            background: "linear-gradient(90deg, #FF8E53 20%, #FA735B 90%)",
            "&:hover": {
              filter: "brightness(0.95)",
            },
          }}
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
        <Typography variant="body1" sx={{ color: "gray", mb: 2 }}>
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
              bgcolor: "#f9f9f9",
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
                color: "#ff7a18",
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
