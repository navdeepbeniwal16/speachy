import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  Chip,
  Skeleton,
  Grid,
  Collapse,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import VoiceRecordingTab from "../components/VoiceRecordingTab";
import ImpromptuSpeakingService from "../services/impromptu-speaking-service.js";
import FeedbackPane from "../components/FeedbackPane";
import { ReactComponent as FeedbackIcon } from "../assets/chat-evaluation.svg";
import SnackbarAlert from "../components/SnackbarAlert";

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

const ImpromptSpeakingPractice = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState(null);
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

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const promptObj = await ImpromptuSpeakingService.fetchPrompt();
      if (promptObj?.prompt) {
        setPrompt(promptObj.prompt);
      } else {
        console.error("Error fetching prompt");
      }
    } catch (error) {
      console.error("Error fetching prompt:", error);
    }
  };

  const handleVoiceRecordingSubmit = async (audioBlob) => {
    console.log("handleVoiceRecordingSubmit is called...");
    setIsEvaluating(true);

    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(audioUrl);

    const audio = new Audio(audioUrl);
    audio.preload = "auto";

    const duration = await getAudioDuration(audio);
    console.log("Audio Duration:", duration);

    audioDuration = parseInt(duration); // Trim to whole seconds

    console.log("Initiate request to get response feedback");
    await getAudioResponseFeedback(audioUrl); // Ensure loader stays until done
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
      const audioBlob = await urlToBlob(audioUrl);
      const response =
        await ImpromptuSpeakingService.fetchAudioResponseFeedback(
          prompt.question,
          audioBlob
        );

      if (!response) {
        throw new Error("No response received from the server");
      }

      const feedbackResponse = response.feedback;
      if (!feedbackResponse) {
        throw new Error("No feedback data received from the server");
      }

      feedbackResponse.duration = audioDuration;

      setFeedback(feedbackResponse);
      setTranscription(response.transcription);
    } catch (error) {
      console.error("Error fetching audio response feedback:", error);
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const urlToBlob = async (url) => {
    const response = await fetch(url);
    return await response.blob();
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom>
          🎤 Impromptu Speaking
        </Typography>
        <Box></Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box>
          {prompt ? (
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
                {prompt.question}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Chip
                  variant="filled"
                  size="small"
                  label={
                    prompt.difficulty.charAt(0).toUpperCase() +
                    prompt.difficulty.slice(1).toLowerCase()
                  }
                />
                <IconButton onClick={fetchPrompt}>
                  <RefreshIcon sx={{ height: "20px", color: "gray" }} />
                </IconButton>
              </Box>
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

export default ImpromptSpeakingPractice;
