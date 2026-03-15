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
  Divider,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import EditNoteIcon from "@mui/icons-material/EditNote";
import VoiceRecordingTab from "../components/VoiceRecordingTab";
import InterviewService from "../services/interview-service.js";
import FeedbackPane from "../components/FeedbackPane";
import { ReactComponent as FeedbackIcon } from "../assets/chat-evaluation.svg";
import SnackbarAlert from "../components/SnackbarAlert";
import QuestionProgressView from "../components/QuestionProgressView.js";

const SURFACE_SHADOW = "0 18px 36px rgba(252,150,120,0.15)";
const SURFACE_BORDER = "1px solid rgba(252,150,120,0.12)";

const InterviewPractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questionId } = useParams();

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
    setIsEvaluating(true);

    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(audioUrl);

    const audio = new Audio(audioUrl);
    audio.preload = "auto";

    const duration = await getAudioDuration(audio);
    audioDuration = parseInt(duration);

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
              resolve(duration);
            } else {
              reject("Unable to determine duration");
            }
          });
        } else {
          resolve(audio.duration);
        }
      });

      audio.addEventListener("error", () => {
        reject("Error loading audio metadata");
      });
    });
  };

  const getAudioResponseFeedback = async (audioUrl) => {
    try {
      const audioBlob = await urlToBlob(audioUrl);

      const response = await InterviewService.fetchAudioResponseFeedback(
        question,
        audioBlob,
        companyName,
        jobRole,
        jobDescription,
        industry,
        requiredExperience
      );

      if (!response) {
        throw new Error("No response received from the server");
      }

      const feedback = response.feedback;
      if (!feedback) {
        throw new Error("No feedback data received from the server");
      }

      feedback.duration = audioDuration;
      updateProgressView(feedback);
      setFeedback(feedback);
      setTranscription(response.transcription);
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
    const relevanceScore = feedbackData.summary.relevance.score;
    const structureScore = feedbackData.summary.structure.score;
    const authenticityScore = feedbackData.summary.authenticity.score;
    const feedbackTimeStamp = getCurrentTime();

    setResponseProgressData((prevData) =>
      prevData.map((progress) => {
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
        return progress;
      })
    );
  };

  async function urlToBlob(url) {
    const response = await fetch(url);
    return response.blob();
  }

  const questionIndex = parseInt(questionId) + 1;
  const totalQuestions = questions.length;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff4ef", pb: 6 }}>
      <Container component="main" maxWidth="lg" sx={{ pt: 3 }}>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <IconButton
            onClick={() =>
              navigate("/interview/questions", { state: { questions } })
            }
            sx={{
              color: "#2f170f",
              border: SURFACE_BORDER,
              bgcolor: "#ffffff",
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#fff4ef",
                transform: "translateY(-1px)",
                boxShadow: SURFACE_SHADOW,
              },
              transition: "all 0.2s ease",
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h6"
              sx={{ color: "#2f170f", fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.2 }}
            >
              Interview Practice
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(60,32,25,0.45)" }}>
              Question {questionIndex} of {totalQuestions}
            </Typography>
          </Box>

          {/* Spacer to keep title centred */}
          <Box sx={{ width: 40 }} />
        </Box>

        {/* Question Card */}
        {question ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 3,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              border: SURFACE_BORDER,
              boxShadow: SURFACE_SHADOW,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "#FA735B",
                fontWeight: 700,
                letterSpacing: 1.4,
                mb: 1,
                display: "block",
              }}
            >
              Question
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#2f170f", fontWeight: 600, lineHeight: 1.65 }}
            >
              {question}
            </Typography>
          </Paper>
        ) : (
          <Skeleton
            variant="rectangular"
            sx={{ mb: 3, borderRadius: 3 }}
            height={100}
          />
        )}

        {/* Input Section Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            border: SURFACE_BORDER,
            boxShadow: SURFACE_SHADOW,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Mode toggle */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5ede9",
                borderRadius: "10px",
                p: "4px",
                gap: "4px",
                mb: 3,
              }}
            >
              <Button
                size="small"
                startIcon={<KeyboardVoiceIcon />}
                onClick={() => handleModeSwitch("voice")}
                disableElevation
                sx={{
                  borderRadius: "7px",
                  textTransform: "none",
                  px: 2.5,
                  py: 0.75,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  ...(inputMode === "voice"
                    ? {
                        bgcolor: "#FA735B",
                        color: "#fff",
                        boxShadow: "0px 4px 12px rgba(250,115,91,0.4)",
                        "&:hover": { bgcolor: "#e8614a" },
                      }
                    : {
                        color: "rgba(60,32,25,0.45)",
                        "&:hover": {
                          bgcolor: "transparent",
                          color: "rgba(60,32,25,0.65)",
                        },
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
                  borderRadius: "7px",
                  textTransform: "none",
                  px: 2.5,
                  py: 0.75,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  ...(inputMode === "text"
                    ? {
                        bgcolor: "#FA735B",
                        color: "#fff",
                        boxShadow: "0px 4px 12px rgba(250,115,91,0.4)",
                        "&:hover": { bgcolor: "#e8614a" },
                      }
                    : {
                        color: "rgba(60,32,25,0.45)",
                        "&:hover": {
                          bgcolor: "transparent",
                          color: "rgba(60,32,25,0.65)",
                        },
                      }),
                }}
              >
                Text
              </Button>
            </Box>

            {/* Input area */}
            {inputMode === "voice" ? (
              <VoiceRecordingTab
                handleRecord={() => {}}
                handleSubmit={handleVoiceRecordingSubmit}
                style={{ width: "100%" }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
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
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(250,115,91,0.25)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(250,115,91,0.55)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FA735B",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "rgba(60,32,25,0.78)",
                      fontSize: "0.95rem",
                      lineHeight: 1.7,
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(60,32,25,0.35)",
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    disableElevation
                    disabled={isEvaluating || !textAnswer.trim()}
                    onClick={handleTextResponseSubmit}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      background:
                        isEvaluating || !textAnswer.trim()
                          ? undefined
                          : "linear-gradient(135deg, #FA735B 0%, #f8553a 100%)",
                      boxShadow:
                        isEvaluating || !textAnswer.trim()
                          ? "none"
                          : "0px 8px 20px -8px rgba(250,115,91,0.7)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #e8614a 0%, #e04028 100%)",
                        boxShadow: "0px 12px 24px -8px rgba(250,115,91,0.8)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Submit Answer
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Bottom grid */}
        <Grid container spacing={3}>
          {inputMode === "voice" && (
            <Grid item xs={12}>
              <TranscriptionBox
                transcription={transcription.text}
                audioUrl={audioUrl}
              />
            </Grid>
          )}

          <Grid item xs={12} lg={6}>
            <QuestionProgressView seriesData={responseProgressData} />
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                minHeight: "40vh",
                borderRadius: 3,
                border: SURFACE_BORDER,
                boxShadow: SURFACE_SHADOW,
                overflow: "hidden",
                backgroundColor: "#ffffff",
              }}
            >
              {isEvaluating && inputMode === "text" && (
                <LinearProgress
                  sx={{
                    "& .MuiLinearProgress-bar": { backgroundColor: "#FA735B" },
                    backgroundColor: "rgba(250,115,91,0.12)",
                  }}
                />
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
                    p: 4,
                    minHeight: "40vh",
                  }}
                >
                  <FeedbackIcon
                    style={{ width: 200, height: 200, marginBottom: 16, opacity: 0.85 }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#2f170f",
                      fontWeight: 600,
                      textAlign: "center",
                      mb: 0.5,
                    }}
                  >
                    {isEvaluating ? "Analysing your response..." : "Ready for feedback"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(60,32,25,0.45)", textAlign: "center" }}
                  >
                    {isEvaluating
                      ? "Hang tight — this usually takes 10–15 seconds."
                      : "Submit your answer to receive personalised AI feedback."}
                  </Typography>
                </Box>
              )}
            </Paper>
            <SnackbarAlert
              alertType={alertType}
              alertMessage={alertMessage}
              isOpen={isAlertOpen}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const TranscriptionBox = ({ transcription, audioUrl }) => {
  const [showText, setShowText] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(252,150,120,0.12)",
        boxShadow: "0 18px 36px rgba(252,150,120,0.15)",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              color: "#FA735B",
              fontWeight: 700,
              letterSpacing: 1.4,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Your Recording
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <audio
            src={audioUrl}
            controls
            style={{ width: "100%", height: 36, display: "block" }}
          />
        </Box>

        <IconButton
          size="small"
          onClick={() => setShowText(!showText)}
          sx={{
            color: "rgba(60,32,25,0.45)",
            border: "1px solid rgba(252,150,120,0.2)",
            borderRadius: 1.5,
            flexShrink: 0,
            "&:hover": { bgcolor: "#fff4ef", color: "#FA735B" },
            transition: "all 0.2s ease",
          }}
        >
          {showText ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Collapse in={showText}>
        <Divider sx={{ borderColor: "rgba(252,150,120,0.1)" }} />
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 2.5,
            backgroundColor: "#fffaf8",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "rgba(60,32,25,0.78)", lineHeight: 1.8 }}
          >
            {transcription}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default InterviewPractice;
