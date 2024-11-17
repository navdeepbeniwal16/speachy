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
import QuestionProgressView from "../components/QuestionProgressView.js";

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
  const industry = location.state.industry;
  const requiredExperience = location.state.requiredExperience;

  const [isEvaluating, setIsEvaluating] = useState(false);

  const [audioUrl, setAudioUrl] = useState(null);
  let audioDuration = 0;
  const [transcription, setTranscription] = useState({
    text: "No response recorded yet",
  });
  const [feedback, setFeedback] = useState(null);

  const [alertType, setAlertType] = useState("error");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [responseProgressData, setResponseProgressData] = useState([
    { name: "relevance", data: [], attemptDateTime: [] },
    { name: "structure", data: [], attemptDateTime: [] },
    { name: "sentiment", data: [], attemptDateTime: [] },
    { name: "authenticity", data: [], attemptDateTime: [] },
  ]);

  const handleVoiceRecordingSubmit = async (audioBlob) => {
    console.log("handleVoiceRecordingSubmit is called...");
    setIsEvaluating(true);

    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(audioUrl);

    // Create an Audio element
    const audio = new Audio(audioUrl);
    audio.preload = "auto";

    // Handle loaded metadata event
    const duration = await getAudioDuration(audio); // Wait for duration to be fetched
    console.log("Audio Duration:", duration);

    // Converting the seconds to a whole number
    audioDuration = parseInt(duration);

    console.log("Initiate request to get response feedback");
    getAudioResponseFeedback(audioUrl);
  };

  const getAudioDuration = (audio) => {
    return new Promise((resolve, reject) => {
      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration === Infinity || isNaN(Number(audio.duration))) {
          audio.currentTime = 1e101;

          audio.addEventListener("timeupdate", function getDuration(event) {
            const duration = event.target.duration;
            event.target.currentTime = 0;
            event.target.removeEventListener("timeupdate", getDuration);

            if (duration) {
              resolve(duration); // Resolve the promise with the correct duration
            } else {
              reject("Unable to determine duration");
            }
          });
        } else {
          resolve(audio.duration); // Duration is already available, resolve it
        }
      });

      audio.addEventListener("error", (err) => {
        reject("Error loading audio metadata");
      });
    });
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
        jobDescription,
        industry,
        requiredExperience
      );

      console.log("Audio Evaluation Results:", response);

      const feedback = response.feedback;
      feedback.duration = audioDuration; // Set duration of the audio
      updateProgressView(feedback);
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

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const updateProgressView = (feedbackData) => {
    console.log("InterviewPractice: updateProgressView() is called");
    const relevanceScore = feedbackData.summary.relevance.score;
    const structureScore = feedbackData.summary.structure.score;
    const sentimentScore = feedbackData.summary.sentiment.score;
    const authenticityScore = feedbackData.summary.authenticity.score;

    const feedbackTimeStamp = getCurrentTime();

    setResponseProgressData((prevData) =>
      prevData.map((progress) => {
        // Create updated progress objects based on feedbackData
        if (progress.name === "relevance") {
          return {
            ...progress,
            data: [...progress.data, relevanceScore],
            attemptDateTime: [...progress.attemptDateTime, feedbackTimeStamp],
          };
        } else if (progress.name === "structure") {
          return {
            ...progress,
            data: [...progress.data, structureScore],
            attemptDateTime: [...progress.attemptDateTime, feedbackTimeStamp],
          };
        } else if (progress.name === "sentiment") {
          return {
            ...progress,
            data: [...progress.data, sentimentScore],
            attemptDateTime: [...progress.attemptDateTime, feedbackTimeStamp],
          };
        } else if (progress.name === "authenticity") {
          return {
            ...progress,
            data: [...progress.data, authenticityScore],
            attemptDateTime: [...progress.attemptDateTime, feedbackTimeStamp],
          };
        }
        console.log("InterviewPractice: Progress is updated");
        return progress;
      })
    );
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
        <Grid item xs={12} lg={12}>
          <Box sx={{ mt: "auto", mb: 0 }}>
            <TranscriptionBox
              transcription={transcription.text}
              audioUrl={audioUrl}
            />
          </Box>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box sx={{ mt: "auto", mb: 2 }}>
            <QuestionProgressView seriesData={responseProgressData} />
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
                <FeedbackPane
                  feedback={feedback}
                  transcription={transcription}
                />
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
