import {
  Box,
  Button,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  Skeleton,
  Grid,
  Collapse,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import EditNoteIcon from "@mui/icons-material/EditNote";
import VoiceRecordingTab from "../components/VoiceRecordingTab";
import InterviewService from "../services/interview-service.js";
import FeedbackPane from "../components/FeedbackPane";
import { ReactComponent as FeedbackIcon } from "../assets/chat-evaluation.svg";
import SnackbarAlert from "../components/SnackbarAlert";
import QuestionProgressView from "../components/QuestionProgressView.js";

const NAV_ICON_SX = { color: "#2f170f", borderRadius: 2 };

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

  const [inputMode, setInputMode] = useState("voice"); // "voice" | "text"
  const [textAnswer, setTextAnswer] = useState("");

  const [isEvaluating, setIsEvaluating] = useState(false);

  const [audioUrl, setAudioUrl] = useState(null);
  let audioDuration = 0;
  const [transcription, setTranscription] = useState({
    text: "No response recorded yet",
  });
  const [feedback, setFeedback] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [alertType, setAlertType] = useState("error");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [responseProgressData, setResponseProgressData] = useState([
    { name: "relevance", data: [], attemptDateTime: [] },
    { name: "structure", data: [], attemptDateTime: [] },
    { name: "authenticity", data: [], attemptDateTime: [] },
  ]);

  const handleModeSwitch = (mode) => {
    if (mode === inputMode) return;
    setInputMode(mode);
    setFeedback(null);
    setTranscription({ text: "No response recorded yet" });
    setAudioUrl(null);
    setTextAnswer("");
  };

  const handleTextResponseSubmit = async () => {
    if (!textAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const response = await InterviewService.fetchTextResponseFeedback(
        question,
        textAnswer,
        companyName,
        jobRole,
        jobDescription,
        industry,
        requiredExperience
      );
      const feedback = response.feedback;
      feedback.duration = null;
      updateProgressView(feedback);
      setFeedback(feedback);
      setTranscription(response.transcription);
    } catch (error) {
      console.error("Error in fetching text response feedback:", error);
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    } finally {
      setIsEvaluating(false);
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

    audioDuration = parseInt(duration);

    console.log("Initiate request to get response feedback");

    await getAudioResponseFeedback(audioUrl);
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

      if (!response) {
        throw new Error("No response received from the server");
      }

      const feedback = response.feedback;
      if (!feedback) {
        throw new Error("No feedback data received from the server");
      }

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

  async function handleBookmarkClick() {
    const questionText = question;
    const responseText = transcription;
    const progressStats = [
      responseProgressData.reduce((acc, item) => {
        acc[item.name] = item.data[0];
        return acc;
      }, {}),
    ];
    console.log("Progress:", JSON.stringify(responseProgressData));
    const saveSuccessful = await InterviewService.saveInterviewQuestion(
      questionText,
      responseText,
      progressStats
    );
    console.log("Is bookmark successful? :", saveSuccessful);

    setIsBookmarked(saveSuccessful);
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
          sx={NAV_ICON_SX}
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
              {/* <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Box></Box>
                <IconButton
                  onClick={() => {
                    // setIsBookmarked(!isBookmarked);
                    // TODO: Handle bookmark save
                    handleBookmarkClick();
                  }}
                >
                  {isBookmarked ? (
                    <BookmarkAddedIcon></BookmarkAddedIcon>
                  ) : (
                    <BookmarkAddIcon></BookmarkAddIcon>
                  )}
                </IconButton>
              </Box> */}
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
              width: "100%",
            }}
          >
            {/* Mode toggle */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5ede9",
                borderRadius: "8px",
                p: "4px",
                gap: "4px",
                mb: 2,
              }}
            >
              <Button
                size="small"
                startIcon={<KeyboardVoiceIcon />}
                onClick={() => handleModeSwitch("voice")}
                disableElevation
                sx={{
                  borderRadius: "6px",
                  textTransform: "none",
                  px: 2,
                  ...(inputMode === "voice"
                    ? {
                        bgcolor: "#FA735B",
                        color: "#fff",
                        "&:hover": { bgcolor: "#e8614a" },
                      }
                    : {
                        color: "rgba(60,32,25,0.45)",
                        "&:hover": { bgcolor: "transparent" },
                      }),
                }}
              >
                Voice
              </Button>
              <Button
                size="small"
                startIcon={<EditNoteIcon />}
                onClick={() => handleModeSwitch("text")}
                disableElevation
                sx={{
                  borderRadius: "6px",
                  textTransform: "none",
                  px: 2,
                  ...(inputMode === "text"
                    ? {
                        bgcolor: "#FA735B",
                        color: "#fff",
                        "&:hover": { bgcolor: "#e8614a" },
                      }
                    : {
                        color: "rgba(60,32,25,0.45)",
                        "&:hover": { bgcolor: "transparent" },
                      }),
                }}
              >
                Text
              </Button>
            </Box>

            {/* Input area */}
            {inputMode === "voice" ? (
              <VoiceRecordingTab
                handleRecord={() => console.log("Handle record is pressed...")}
                handleSubmit={handleVoiceRecordingSubmit}
                style={{ width: "100%" }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <TextField
                  multiline
                  rows={5}
                  fullWidth
                  placeholder="Type your answer here..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={isEvaluating}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#ffffff",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(250,115,91,0.35)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(250,115,91,0.6)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FA735B",
                      },
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    disableElevation
                    disabled={isEvaluating || !textAnswer.trim()}
                    onClick={handleTextResponseSubmit}
                    sx={{ textTransform: "none" }}
                    style={{
                      backgroundColor:
                        isEvaluating || !textAnswer.trim()
                          ? undefined
                          : "#FA735B",
                    }}
                  >
                    <strong>Submit Answer</strong>
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {inputMode === "voice" && (
          <Grid item xs={12} lg={12}>
            <Box sx={{ mt: "auto", mb: 0 }}>
              <TranscriptionBox
                transcription={transcription.text}
                audioUrl={audioUrl}
              />
            </Box>
          </Grid>
        )}
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
              {isEvaluating && inputMode === "text" && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    sx={{
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#FA735B",
                      },
                    }}
                  />
                </Box>
              )}
              {feedback ? (
                <FeedbackPane
                  feedback={feedback}
                  transcription={transcription}
                  showAudioMetrics={inputMode === "voice"}
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
