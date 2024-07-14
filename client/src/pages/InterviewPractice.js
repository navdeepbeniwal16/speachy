import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  LinearProgress,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  const [transcription, setTranscription] = useState(null);
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
    <Container component="main" maxWidth="lg" sx={{ paddingTop: "20px" }}>
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
          Interview Practice Arena
        </Typography>
        <Typography></Typography>
      </Box>
      <Box sx={{ display: "flex", height: "80vh" }}>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: "45%",
            maxWidth: "45%",
          }}
        >
          <Box sx={{ mx: "5px" }}>
            <Paper
              variant="rounded"
              height={130}
              sx={{
                p: 2,
                my: 2,
                borderRadius: "10px",
                backgroundColor: "lightgray",
                // backgroundColor: (theme) =>
                //   theme.palette.mode === "light"
                //     ? theme.palette.grey[200]
                //     : theme.palette.grey[800],
                boxShadow: "none",
              }}
            >
              <Typography
                variant="body2"
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

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "65vh",
                marginY: "2px",
              }}
            >
              <Box
                sx={{
                  marginX: "5px",
                  paddin: "5px",
                  display: "flex",
                  overflowY: "auto",
                  zIndex: 1,
                }}
              >
                {transcription && (
                  <Typography variant="body2" sx={{ textAlign: "center" }}>
                    {transcription.text}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  marginBottom: 3,
                  width: "100%",
                }}
              >
                {audioUrl && (
                  <audio src={audioUrl} controls style={{ width: "60%" }} />
                )}
                <VoiceRecordingTab
                  handleRecord={() =>
                    console.log("Handle record is pressed...")
                  }
                  handleSubmit={handleVoiceRecordingSubmit}
                  style={{ width: "100%" }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: "55%", ml: 2, maxWidth: "55%" }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: "10px",
              mt: "16px",
              height: "90%",
              overflowY: "auto",
              zIndex: 1,
            }}
          >
            {isEvaluating && (
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                // color="violet"
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
                }}
              >
                <FeedbackIcon
                  style={{
                    width: "300px",
                    height: "300px",
                    marginBottom: "8px",
                  }}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      textAlign: "center",
                      // color: "grey"
                    }}
                  >
                    {isEvaluating
                      ? "Hang tight! We're processing your response..."
                      : "Your personalised feedback will be shown here..."}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
        <SnackbarAlert
          alertType={alertType}
          alertMessage={alertMessage}
          isOpen={isAlertOpen}
        />
      </Box>
    </Container>
  );
};

export default InterviewPractice;
