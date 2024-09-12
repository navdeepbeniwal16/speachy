import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  LinearProgress,
  Skeleton,
  Grid,
  Collapse,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VoiceRecordingTab from "../components/VoiceRecordingTab";
import InterviewService from "../services/interview-service.js";
import FeedbackPane from "../components/FeedbackPane";
import { ReactComponent as FeedbackIcon } from "../assets/chat-evaluation.svg";
import SnackbarAlert from "../components/SnackbarAlert";

const InterviewPractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questionId } = useParams();
  console.log("QuestionId:", questionId);

  const questions = location.state.questions;
  const question = questions[questionId].question;
  const companyName = location.state.companyName;
  const jobRole = location.state.jobRole;
  const jobDescription = location.state.jobDescription;

  const [isEvaluating, setIsEvaluating] = useState(false);

  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState({
    text: "No response recorded yet",
  });
  const [feedback, setFeedback] = useState(null);

  const [alertType, setAlertType] = useState("error");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleVoiceRecordingSubmit = (audioUrl) => {
    console.log("handleVoiceRecordingSubmit is called...");
    setIsEvaluating(true);
    setAudioUrl(audioUrl);
    console.log("Initiate request to get response feedback");
    getAudioResponseFeedback(audioUrl);
  };

  const getAudioResponseFeedback = async (audioUrl) => {
    try {
      console.log("Fetching audio response feedback...");
      const audioBlob = await urlToBlob(audioUrl);
      console.log("Audio blob obtained:", audioBlob);

      const response = await InterviewService.fetchAudioResponseFeedback(
        question,
        audioBlob,
        companyName,
        jobRole,
        jobDescription
      );

      console.log("Audio Evaluation Results:", response);

      const feedback = response.feedback;
      const transcription = response.transcription;
      setFeedback(feedback);
      setTranscription(transcription);
    } catch (error) {
      console.error("Error in fetching audio response feedback:", error);
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  async function urlToBlob(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  }

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          onClick={() =>
            navigate("/interview/questions", {
              state: { questions: questions },
            })
          }
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom>
          👔 Interview Practice Arena
        </Typography>
        <Typography></Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box>
          {question ? (
            <Paper
              variant="rounded"
              sx={{
                p: 2,
                my: 2,
                borderRadius: "10px",
                backgroundColor: "#fff",
              }}
            >
              <Typography
                variant="body"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "#333333",
                }}
              >
                {question}
              </Typography>
            </Paper>
          ) : (
            <Skeleton
              variant="rectangular"
              sx={{ mx: 1, mt: 2, borderRadius: "10px" }}
              height={118}
            />
          )}

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 2,
              mb: 3,
            }}
          >
            <VoiceRecordingTab
              handleRecord={() => console.log("Handle record is pressed...")}
              handleSubmit={handleVoiceRecordingSubmit}
              style={{ width: "100%" }}
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Box sx={{ mt: "auto", mb: 0 }}>
            <TranscriptionBox
              transcription={transcription.text}
              audioUrl={audioUrl}
            />
          </Box>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Box sx={{ minHeight: "40vh" }}>
            <Paper
              variant="elevation"
              elevation={0}
              sx={{
                borderRadius: "10px",
                height: "100%",
                overflowY: "auto",
              }}
            >
              {isEvaluating && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    sx={{
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#FA735B", // Custom color for the progress bar
                      },
                    }}
                  />
                </Box>
              )}

              {feedback ? (
                <FeedbackPane feedback={feedback} />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                  }}
                >
                  <FeedbackIcon
                    style={{ width: 300, height: 300, marginBottom: 8 }}
                  />
                  <Typography variant="subtitle2" sx={{ textAlign: "center" }}>
                    {isEvaluating
                      ? "Hang tight! We're processing your response..."
                      : "Your personalised feedback will be shown here..."}
                  </Typography>
                </Box>
              )}
            </Paper>
            <SnackbarAlert
              alertType={alertType}
              alertMessage={alertMessage}
              isOpen={isAlertOpen}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const TranscriptionBox = ({ transcription, audioUrl }) => {
  const [showText, setShowText] = useState(false);

  const handleToggleText = () => {
    setShowText(!showText);
  };

  return (
    <Box sx={{ bgcolor: "#fff", py: 2, px: 2, borderRadius: "10px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ width: "100%" }}>
          Transcription
        </Typography>

        <audio
          src={audioUrl}
          controls
          style={{ width: "100%", marginRight: "5px" }}
        />
        <IconButton onClick={handleToggleText}>
          {showText ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={showText}>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {transcription}
        </Typography>
      </Collapse>
    </Box>
  );
};

export default InterviewPractice;
