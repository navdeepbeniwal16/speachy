import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import BreadcrumbHeader from "../components/BreadcrumbHeader.js";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SpeedIcon from "@mui/icons-material/Speed";
import VoiceRecordingTab from "../components/VoiceRecordingTab";
import InterviewService from "../services/interview-service.js";
import SnackbarAlert from "../components/SnackbarAlert";
import DetailedFeedbackModal from "../components/DetailedFeedbackModal";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const CORAL       = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK   = "#C85A3E";
const PAGE_BG     = "#fff4ef";
const SURFACE     = "#ffffff";
const LINE        = "rgba(252,150,120,0.12)";
const INK         = "#2f170f";
const INK_2       = "rgba(60,32,25,0.78)";
const MUTED       = "rgba(60,32,25,0.45)";
const SURFACE_SHADOW = "0 18px 36px rgba(252,150,120,0.10)";

const DIFFICULTY_LABEL = { easy: "beginner", medium: "intermediate", hard: "advanced" };

const scoreBarColor = (score) => {
  if (score >= 8) return { color: "#4caf50", track: "rgba(76,175,80,0.12)" };
  if (score >= 5) return { color: "#f5a623", track: "rgba(245,166,35,0.12)" };
  return            { color: "#f44336", track: "rgba(244,67,54,0.12)" };
};

const ANALYSE_STEPS = ["Transcribing", "Scoring", "Generating feedback"];

const fmtDur = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ─── Inline audio player ───────────────────────────────────────────────────────
const AudioPlayer = ({ src, label }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dur, setDur] = useState(0);

  const fmt = (s) => {
    const m = Math.floor((s || 0) / 60);
    const sec = Math.floor((s || 0) % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  // MediaRecorder blobs don't embed duration — seek trick forces the browser to calculate it
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.duration === Infinity || isNaN(audio.duration)) {
      audio.currentTime = 1e101;
      const detectDuration = () => {
        if (!isNaN(audio.duration) && audio.duration !== Infinity) {
          setDur(audio.duration);
          audio.currentTime = 0;
          audio.removeEventListener("timeupdate", detectDuration);
        }
      };
      audio.addEventListener("timeupdate", detectDuration);
    } else {
      setDur(audio.duration);
    }
  };

  return (
    <Box>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const t = audioRef.current?.currentTime;
          if (t != null && isFinite(t)) setCurrent(t);
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
      />
      {label && (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: MUTED, mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton
          size="small"
          onClick={toggle}
          sx={{ backgroundColor: CORAL, color: "#fff", width: 32, height: 32, flexShrink: 0, "&:hover": { backgroundColor: CORAL_INK } }}
        >
          {playing ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
        </IconButton>
        <input
          type="range"
          min={0}
          max={dur || 1}
          step={0.1}
          value={current}
          onChange={(e) => {
            if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
            setCurrent(Number(e.target.value));
          }}
          style={{ flex: 1, accentColor: CORAL, height: 4, cursor: "pointer" }}
        />
        <Typography sx={{ fontSize: 12, color: MUTED, whiteSpace: "nowrap", flexShrink: 0 }}>
          {fmt(current)} / {fmt(dur)}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const InterviewPractice = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { questionId } = useParams();

  const questions        = location.state?.questions || [];
  const questionIdx      = parseInt(questionId);
  const q                = questions[questionIdx] || {};
  const question         = q.question || "";
  const qTags            = q.tags || [];
  const qDiff            = (q.difficultyLevel || q.difficulty || "medium").toLowerCase();
  const diffLabel        = DIFFICULTY_LABEL[qDiff] || qDiff;

  const companyName      = location.state?.companyName;
  const jobRole          = location.state?.jobRole;
  const jobDescription   = location.state?.jobDescription;
  const industry         = location.state?.industry;
  const requiredExperience = location.state?.requiredExperience;

  const [inputMode, setInputMode]               = useState("voice");
  const [textAnswer, setTextAnswer]             = useState("");
  const [isEvaluating, setIsEvaluating]         = useState(false);
  const [analysingStep, setAnalysingStep]       = useState(0);
  const [audioUrl, setAudioUrl]                 = useState(null);
  const [transcription, setTranscription]       = useState({ text: "" });
  const [feedback, setFeedback]                 = useState(null);
  const [detailedFeedbackOpen, setDetailedFeedbackOpen] = useState(false);

  const [alertType, setAlertType]     = useState("error");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  let audioDuration = 0;

  // Reset all answer state when the question changes
  useEffect(() => {
    setFeedback(null);
    setTranscription({ text: "" });
    setAudioUrl(null);
    setTextAnswer("");
    setIsEvaluating(false);
    setDetailedFeedbackOpen(false);
  }, [questionIdx]);

  // Cycle analysing step animation while evaluating
  useEffect(() => {
    if (!isEvaluating) { setAnalysingStep(0); return; }
    const timer = setInterval(() => setAnalysingStep((s) => Math.min(s + 1, 2)), 3000);
    return () => clearInterval(timer);
  }, [isEvaluating]);

  const handleModeSwitch = (mode) => {
    if (mode === inputMode) return;
    setInputMode(mode);
    setTextAnswer("");
  };

  const handleTextResponseSubmit = async () => {
    if (!textAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const response = await InterviewService.fetchTextResponseFeedback(
        question, textAnswer, companyName, jobRole, jobDescription, industry, requiredExperience
      );
      const fb = response.feedback;
      fb.duration = null;
      setFeedback(fb);
      setTranscription(response.transcription);
    } catch (error) {
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleVoiceRecordingSubmit = async (audioBlob) => {
    setIsEvaluating(true);
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.preload = "auto";
    const duration = await getAudioDuration(audio);
    audioDuration = parseInt(duration);
    await getAudioResponseFeedback(url);
  };

  const getAudioDuration = (audio) =>
    new Promise((resolve, reject) => {
      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration === Infinity || isNaN(Number(audio.duration))) {
          audio.currentTime = 1e101;
          audio.addEventListener("timeupdate", function getDuration(e) {
            const d = e.target.duration;
            e.target.currentTime = 0;
            e.target.removeEventListener("timeupdate", getDuration);
            d ? resolve(d) : reject("Unable to determine duration");
          });
        } else {
          resolve(audio.duration);
        }
      });
      audio.addEventListener("error", () => reject("Error loading audio"));
    });

  const getAudioResponseFeedback = async (url) => {
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const response = await InterviewService.fetchAudioResponseFeedback(
        question, blob, companyName, jobRole, jobDescription, industry, requiredExperience
      );
      if (!response?.feedback) throw new Error("No feedback received");
      const fb = response.feedback;
      fb.duration = audioDuration;
      setFeedback(fb);
      setTranscription(response.transcription);
    } catch (error) {
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const navigateToQuestion = (idx) =>
    navigate(`/interview/questions/${idx}`, { state: { ...location.state } });

  // Score computations
  const summaryKeys = ["relevance", "structure", "authenticity"];
  const avgScore = feedback
    ? summaryKeys.reduce((sum, k) => sum + (feedback.summary?.[k]?.score || 0), 0) / summaryKeys.length
    : null;

  const scoreColor =
    avgScore == null         ? { bg: CORAL_SOFTER,               text: CORAL_INK  }
    : avgScore >= 8          ? { bg: "rgba(52,168,83,0.12)",      text: "#1a6b31"  }
    : avgScore >= 6          ? { bg: "rgba(251,188,4,0.14)",      text: "#7a5500"  }
    :                          { bg: CORAL_SOFTER,                text: CORAL_INK  };

  const pace = feedback?.duration && transcription?.text
    ? Math.round((transcription.text.split(" ").filter(Boolean).length / feedback.duration) * 60)
    : null;
  const paceLabel = pace == null ? null : pace < 120 ? "Slow" : pace < 180 ? "Good" : "Fast";

  const fillerCount = feedback?.fillers ?? null;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, pb: 6 }}>
      <Container maxWidth="md" sx={{ pt: 5 }}>

        {/* ── Top nav ─────────────────────────────────────────────────────── */}
        <BreadcrumbHeader
          parentLabel="Back to questions"
          parentPath="/interview/questions"
          onBack={() => navigate("/interview/questions", { state: { ...location.state } })}
          currentLabel=""
          right={
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: MUTED }}>
              {questionIdx + 1} of {questions.length}
            </Typography>
          }
        />

        {/* ── Question card ────────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "18px", p: { xs: 3, md: 4 }, mb: 3, boxShadow: SURFACE_SHADOW }}>
          {/* Q icon · difficulty · topic tags — single aligned row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: CORAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Q</Typography>
            </Box>
            <Box sx={{ width: "1px", height: 16, backgroundColor: LINE, flexShrink: 0 }} />
            <Box sx={{ backgroundColor: CORAL_SOFTER, color: CORAL_INK, borderRadius: "20px", px: 1.25, py: 0.3, fontSize: 11.5, fontWeight: 600, textTransform: "capitalize" }}>
              {diffLabel}
            </Box>
            {qTags.length > 0 && (
              <Box sx={{ width: "1px", height: 16, backgroundColor: LINE, flexShrink: 0 }} />
            )}
            {qTags.map((tag) => (
              <Box key={tag} sx={{ backgroundColor: "rgba(60,32,25,0.06)", color: MUTED, borderRadius: "20px", px: 1.25, py: 0.3, fontSize: 11.5, fontWeight: 500, textTransform: "capitalize" }}>
                {tag}
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontFamily: "Georgia, serif", fontSize: { xs: 16, md: 18 }, color: INK, lineHeight: 1.65 }}>
            {question}
          </Typography>
        </Box>

        {/* ── Voice / Text toggle ──────────────────────────────────────────── */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              backgroundColor: SURFACE,
              border: `1px solid ${LINE}`,
              borderRadius: "12px",
              p: "4px",
              gap: "4px",
              boxShadow: "0 2px 8px rgba(252,150,120,0.08)",
            }}
          >
            {[
              { id: "voice", label: "Voice", Icon: KeyboardVoiceIcon },
              { id: "text",  label: "Text",  Icon: EditNoteIcon },
            ].map(({ id, label, Icon }) => (
              <Box
                key={id}
                onClick={() => handleModeSwitch(id)}
                sx={{
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 0.75,
                  px: 2.25, py: 0.7,
                  borderRadius: "8px",
                  fontSize: 13, fontWeight: inputMode === id ? 600 : 500,
                  color: inputMode === id ? "#fff" : MUTED,
                  backgroundColor: inputMode === id ? CORAL : "transparent",
                  boxShadow: inputMode === id ? "0 2px 8px rgba(250,115,91,0.35)" : "none",
                  transition: "all 120ms ease",
                  userSelect: "none",
                }}
              >
                <Icon sx={{ fontSize: 14 }} />
                {label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Recording card ───────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "18px", overflow: "hidden", mb: 3, boxShadow: SURFACE_SHADOW }}>
          {isEvaluating ? (
            <Box sx={{ py: 5, px: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5 }}>
              <CircularProgress size={48} sx={{ color: CORAL }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: INK, mb: 0.5 }}>
                  Analysing your response…
                </Typography>
                <Typography sx={{ fontSize: 13, color: MUTED }}>
                  Evaluating relevance, structure, and authenticity
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                {ANALYSE_STEPS.map((label, i) => {
                  const isDone   = i < analysingStep;
                  const isActive = i === analysingStep;
                  return (
                    <Box
                      key={label}
                      sx={{
                        display: "inline-flex", alignItems: "center", gap: 0.5,
                        px: 1.5, py: 0.4,
                        borderRadius: "20px",
                        fontSize: 12, fontWeight: isDone || isActive ? 600 : 400,
                        backgroundColor: isDone ? "rgba(52,168,83,0.10)" : isActive ? CORAL_SOFTER : "transparent",
                        color: isDone ? "#1a6b31" : isActive ? CORAL_INK : MUTED,
                        border: `1px solid ${isDone ? "rgba(52,168,83,0.2)" : isActive ? "rgba(250,115,91,0.2)" : LINE}`,
                      }}
                    >
                      {isDone   && <CheckCircleIcon sx={{ fontSize: 12 }} />}
                      {isActive && <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: CORAL, flexShrink: 0 }} />}
                      {label}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : inputMode === "voice" ? (
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <VoiceRecordingTab
                handleRecord={() => {}}
                handleSubmit={handleVoiceRecordingSubmit}
              />
            </Box>
          ) : (
            <Box sx={{ p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                multiline
                rows={5}
                fullWidth
                placeholder="Type your answer here…"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(250,115,91,0.25)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(250,115,91,0.55)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: CORAL, borderWidth: "1px" },
                  },
                  "& .MuiInputBase-input": { color: INK_2, fontSize: "0.95rem", lineHeight: 1.7 },
                  "& .MuiInputBase-input::placeholder": { color: "rgba(60,32,25,0.35)" },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  disableElevation
                  disabled={!textAnswer.trim()}
                  onClick={handleTextResponseSubmit}
                  sx={{
                    textTransform: "none", fontWeight: 700, px: 3, py: 1, borderRadius: "10px",
                    backgroundColor: CORAL,
                    boxShadow: "0px 8px 20px -8px rgba(250,115,91,0.6)",
                    "&:hover": { backgroundColor: CORAL_INK },
                  }}
                >
                  Submit Answer
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── Feedback card ────────────────────────────────────────────────── */}
        {feedback && (
          <Box sx={{ backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "18px", p: { xs: 3, md: 4 }, mb: 3, boxShadow: SURFACE_SHADOW }}>
            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AutoAwesomeIcon sx={{ fontSize: 16, color: CORAL }} />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>Feedback</Typography>
              </Box>
              {avgScore != null && (
                <Box sx={{ backgroundColor: scoreColor.bg, color: scoreColor.text, borderRadius: "10px", px: 1.75, py: 0.75, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "inherit" }}>
                    {avgScore.toFixed(1)}
                  </Typography>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: "inherit", opacity: 0.8 }}>avg /10</Typography>
                </Box>
              )}
            </Box>

            {/* Overview */}
            {feedback.overview && (
              <Typography sx={{ fontSize: 14, color: INK_2, lineHeight: 1.65, mb: 2 }}>
                {feedback.overview}
              </Typography>
            )}

            {/* Tip card */}
            {feedback.tip && (
              <Box sx={{ backgroundColor: "rgba(232,200,124,0.20)", border: "1px solid rgba(232,200,124,0.4)", borderRadius: "12px", px: 2, py: 1.5, mb: 2.5, display: "flex", alignItems: "flex-start", gap: 1 }}>
                <BoltIcon sx={{ fontSize: 16, color: "#8b6a1f", flexShrink: 0, mt: 0.25 }} />
                <Typography sx={{ fontSize: 13.5, color: "#5a3f00", lineHeight: 1.6 }}>
                  {feedback.tip}
                </Typography>
              </Box>
            )}

            {/* Stats chips (voice only — based on whether audio was recorded) */}
            {!!audioUrl && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                {fmtDur(feedback.duration) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, backgroundColor: "rgba(60,32,25,0.05)", borderRadius: "20px", px: 1.5, py: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 13, color: MUTED }} />
                    <Typography sx={{ fontSize: 12.5, color: INK_2, fontWeight: 500 }}>{fmtDur(feedback.duration)}</Typography>
                  </Box>
                )}
                {pace != null && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, backgroundColor: "rgba(60,32,25,0.05)", borderRadius: "20px", px: 1.5, py: 0.5 }}>
                    <SpeedIcon sx={{ fontSize: 13, color: MUTED }} />
                    <Typography sx={{ fontSize: 12.5, color: INK_2, fontWeight: 500 }}>{pace} wpm · {paceLabel}</Typography>
                  </Box>
                )}
                <Box sx={{ backgroundColor: fillerCount > 5 ? CORAL_SOFTER : "rgba(60,32,25,0.05)", borderRadius: "20px", px: 1.5, py: 0.5 }}>
                  <Typography sx={{ fontSize: 12.5, color: fillerCount > 5 ? CORAL_INK : INK_2, fontWeight: 500 }}>
                    {fillerCount ? `Fillers: ${fillerCount}` : "No filler words"}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Score bars — 3-column horizontal grid, colour = score level */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 2.5 }}>
              {summaryKeys.map((key) => {
                const score = feedback.summary?.[key]?.score;
                if (score == null) return null;
                const { color, track } = scoreBarColor(score);
                return (
                  <Box key={key}>
                    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 0.6 }}>
                      <Typography sx={{ fontSize: 12.5, color: MUTED, textTransform: "capitalize", fontWeight: 500 }}>
                        {key}
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>
                        {score.toFixed(1)}
                        <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>/10</span>
                      </Typography>
                    </Box>
                    <Box sx={{ height: 5, borderRadius: 3, backgroundColor: track, overflow: "hidden" }}>
                      <Box sx={{ height: "100%", borderRadius: 3, backgroundColor: color, width: `${(score / 10) * 100}%`, transition: "width 0.5s ease" }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Audio player */}
            {audioUrl && (
              <Box sx={{ mb: 2.5 }}>
                <AudioPlayer src={audioUrl} label="Your recording" />
              </Box>
            )}

            {/* View detailed feedback */}
            <Button
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<BarChartIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => setDetailedFeedbackOpen(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13.5,
                py: 1.2,
                borderRadius: "10px",
                backgroundColor: CORAL_SOFTER,
                color: CORAL_INK,
                "&:hover": { backgroundColor: "rgba(250,115,91,0.14)", color: CORAL_INK },
              }}
            >
              View detailed feedback
            </Button>
          </Box>
        )}

        {/* ── Bottom navigation ────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 2.5, mt: 1, borderTop: `1px solid ${LINE}` }}>
          <Button
            startIcon={<ChevronLeftIcon />}
            disabled={questionIdx === 0}
            onClick={() => navigateToQuestion(questionIdx - 1)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, color: questionIdx === 0 ? MUTED : INK_2, "&:hover": { backgroundColor: "transparent", color: CORAL } }}
          >
            Previous
          </Button>
          <Typography sx={{ fontSize: 13, color: MUTED }}>
            Question {questionIdx + 1} of {questions.length}
          </Typography>
          <Button
            endIcon={<ChevronRightIcon />}
            disabled={questionIdx === questions.length - 1}
            onClick={() => navigateToQuestion(questionIdx + 1)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, color: questionIdx === questions.length - 1 ? MUTED : INK_2, "&:hover": { backgroundColor: "transparent", color: CORAL } }}
          >
            Next
          </Button>
        </Box>

      </Container>

      {/* Detailed feedback modal */}
      <DetailedFeedbackModal
        open={detailedFeedbackOpen}
        handleClose={() => setDetailedFeedbackOpen(false)}
        feedback={feedback}
        transcription={transcription}
        audioUrl={audioUrl}
        showAudioMetrics={!!audioUrl}
        fillerCount={fillerCount}
      />

      <SnackbarAlert alertType={alertType} alertMessage={alertMessage} isOpen={isAlertOpen} />
    </Box>
  );
};

export default InterviewPractice;
