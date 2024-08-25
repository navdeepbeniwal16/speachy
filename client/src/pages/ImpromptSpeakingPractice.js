import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Skeleton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import VoiceRecordingTab from "../components/VoiceRecordingTab";
import ImpromptuSpeakingService from "../services/impromptu-speaking-service.js";
import FeedbackPane from "../components/FeedbackPane";
import { ReactComponent as FeedbackIcon } from "../assets/chat-evaluation.svg";
import SnackbarAlert from "../components/SnackbarAlert";

const ImpromptSpeakingPractice = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState(null);
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

      const response =
        await ImpromptuSpeakingService.fetchAudioResponseFeedback(
          prompt.question,
          audioBlob
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

  const fetchPrompt = async () => {
    console.log("handleImpromptCardClick is called...");
    const promptObj = await ImpromptuSpeakingService.fetchPrompt();
    console.log("Prompt", promptObj);
    if (promptObj && promptObj.prompt) {
      setPrompt(promptObj.prompt);
    } else {
      console.log("Error fetching prompt...");
    }
  };

  useEffect(() => {
    fetchPrompt();
  }, []);

  return (
    <Container component="main" maxWidth="lg" sx={{ paddingTop: "20px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom>
          Imprompt Speaking Practice Arena
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
          {prompt ? (
            <Box sx={{ mx: "5px" }}>
              <Paper
                variant="rounded"
                height={130}
                sx={{
                  p: 2,
                  my: 2,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  // boxShadow: "none",
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
                    flexDirection: "row",
                    marginTop: 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    variant="filled"
                    size="small"
                    label={
                      prompt.difficulty.toUpperCase()[0] +
                      prompt.difficulty.toLowerCase().substring(1)
                    }
                  ></Chip>
                  <IconButton onClick={fetchPrompt}>
                    <RefreshIcon
                      sx={{
                        height: "20px",
                        color: "gray",
                      }}
                    ></RefreshIcon>
                  </IconButton>
                </Box>
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
          ) : (
            <Skeleton
              variant="rectangular"
              sx={{ mx: "5px", mt: "15px", borderRadius: "10px" }}
              height={118}
              // width={210} height={118}
            />
          )}
        </Box>
        <Box sx={{ width: "55%", ml: 2, maxWidth: "55%" }}>
          <Paper
            variant="elevation"
            elevation={"1"}
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
                <LinearProgress color="warning" />
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

export default ImpromptSpeakingPractice;
