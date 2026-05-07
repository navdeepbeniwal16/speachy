import React, { useState, useRef } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SpeedIcon from "@mui/icons-material/Speed";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const CORAL        = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK    = "#C85A3E";
const PAGE_BG      = "#fff4ef";
const SURFACE      = "#ffffff";
const LINE         = "rgba(252,150,120,0.12)";
const INK          = "#2f170f";
const INK_2        = "rgba(60,32,25,0.78)";
const MUTED        = "rgba(60,32,25,0.45)";

const scoreBarColor = (score) => {
  if (score >= 8) return { color: "#4caf50", track: "rgba(76,175,80,0.12)" };
  if (score >= 5) return { color: "#f5a623", track: "rgba(245,166,35,0.12)" };
  return            { color: "#f44336", track: "rgba(244,67,54,0.12)" };
};

const fmtDur = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ─── Audio player ──────────────────────────────────────────────────────────────
const AudioPlayer = ({ src }) => {
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const DetailedFeedbackModal = ({
  open,
  handleClose,
  feedback,
  transcription,
  audioUrl,
  showAudioMetrics,
  fillerCount,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!feedback) return null;

  const summaryKeys = ["relevance", "structure", "authenticity"];

  const avgScore =
    summaryKeys.reduce((sum, k) => sum + (feedback.summary?.[k]?.score || 0), 0) /
    summaryKeys.length;

  const scoreColor =
    avgScore >= 8 ? { bg: "rgba(52,168,83,0.12)", text: "#1a6b31" }
    : avgScore >= 6 ? { bg: "rgba(251,188,4,0.14)", text: "#7a5500" }
    : { bg: CORAL_SOFTER, text: CORAL_INK };

  const pace =
    showAudioMetrics && feedback.duration && transcription?.text
      ? Math.round(
          (transcription.text.split(" ").filter(Boolean).length / feedback.duration) * 60
        )
      : null;
  const paceLabel =
    pace == null ? null : pace < 120 ? "Slow" : pace < 180 ? "Good" : "Fast";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: { borderRadius: "20px", backgroundColor: PAGE_BG, maxHeight: "90vh" },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3.5,
          py: 2.5,
          borderBottom: `1px solid ${LINE}`,
          backgroundColor: SURFACE,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: CORAL }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>
            Detailed Feedback
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: MUTED }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3.5, py: 3 }}>

        {/* Summary + score badge */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
          {feedback.overview && (
            <Typography sx={{ fontSize: 14, color: INK_2, lineHeight: 1.65, flex: 1 }}>
              {feedback.overview}
            </Typography>
          )}
          <Box
            sx={{
              backgroundColor: scoreColor.bg,
              color: scoreColor.text,
              borderRadius: "10px",
              px: 1.75,
              py: 0.75,
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "inherit" }}>
              {avgScore.toFixed(1)}
            </Typography>
            <Typography sx={{ fontSize: 10, color: "inherit", opacity: 0.8 }}>avg /10</Typography>
          </Box>
        </Box>

        {/* Tip card */}
        {feedback.tip && (
          <Box
            sx={{
              backgroundColor: "rgba(232,200,124,0.20)",
              border: "1px solid rgba(232,200,124,0.4)",
              borderRadius: "12px",
              px: 2,
              py: 1.5,
              mb: 3,
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <BoltIcon sx={{ fontSize: 16, color: "#8b6a1f", flexShrink: 0, mt: 0.25 }} />
            <Typography sx={{ fontSize: 13.5, color: "#5a3f00", lineHeight: 1.6 }}>
              {feedback.tip}
            </Typography>
          </Box>
        )}

        {/* Stats tiles (voice only) */}
        {showAudioMetrics && (
          <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mb: 3 }}>
            {fmtDur(feedback.duration) && (
              <Box
                sx={{
                  flex: 1, minWidth: 80,
                  backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px",
                  p: "12px 16px", textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>
                  <ScheduleIcon sx={{ fontSize: 11 }} /> Duration
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: INK }}>
                  {fmtDur(feedback.duration)}
                </Typography>
              </Box>
            )}
            {pace != null && (
              <Box
                sx={{
                  flex: 1, minWidth: 80,
                  backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px",
                  p: "12px 16px", textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>
                  <SpeedIcon sx={{ fontSize: 11 }} /> Pace
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: INK }}>
                  {pace} <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>wpm</span>
                </Typography>
                <Typography sx={{ fontSize: 11, color: MUTED }}>{paceLabel}</Typography>
              </Box>
            )}
            <Box
              sx={{
                flex: 1, minWidth: 80,
                backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px",
                p: "12px 16px", textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5 }}>
                Fillers
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: fillerCount > 5 ? CORAL_INK : INK }}>
                {fillerCount ?? 0}
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED }}>
                {!fillerCount || fillerCount <= 2 ? "Great" : fillerCount <= 5 ? "Okay" : "Too many"}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Aspect breakdown */}
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, mb: 1.5 }}>
          Aspect breakdown
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {summaryKeys.map((key) => {
            const item = feedback.summary?.[key];
            if (!item) return null;
            const { color, track } = scoreBarColor(item.score || 0);
            return (
              <Box
                key={key}
                sx={{
                  backgroundColor: SURFACE,
                  border: `1px solid ${LINE}`,
                  borderRadius: "12px",
                  p: "16px 20px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, textTransform: "capitalize" }}>
                    {key}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color }}>
                    {item.score?.toFixed(1)}
                    <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>/10</span>
                  </Typography>
                </Box>
                <Box sx={{ height: 5, borderRadius: 3, backgroundColor: track, overflow: "hidden", mb: 1.25 }}>
                  <Box
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: color,
                      width: `${((item.score || 0) / 10) * 100}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </Box>
                {(item.waysToImprove || []).map((tip, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: i < item.waysToImprove.length - 1 ? 0.5 : 0 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: color, flexShrink: 0, mt: "7px" }} />
                    <Typography sx={{ fontSize: 13, color: INK_2, lineHeight: 1.6 }}>{tip}</Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>

        {/* Your recording */}
        {audioUrl && (
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, mb: 1.5 }}>
              Your recording
            </Typography>
            <AudioPlayer src={audioUrl} />
            <Box
              onClick={() => setShowTranscript((v) => !v)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                mt: 1.5,
                cursor: "pointer",
                color: CORAL,
                fontSize: 13,
                fontWeight: 600,
                "&:hover": { opacity: 0.75 },
                transition: "opacity 120ms ease",
              }}
            >
              {showTranscript ? "Hide transcript" : "Show transcript"}
            </Box>
            {showTranscript && transcription?.text && (
              <Box
                sx={{
                  mt: 1.5,
                  backgroundColor: SURFACE,
                  border: `1px solid ${LINE}`,
                  borderRadius: "12px",
                  p: "16px 20px",
                }}
              >
                <Typography sx={{ fontSize: 13.5, color: INK_2, lineHeight: 1.8, fontStyle: "italic" }}>
                  "{transcription.text}"
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Text answer (text mode) */}
        {!audioUrl && transcription?.text && transcription.text.trim() !== "" && (
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, mb: 1.5 }}>
              Your answer
            </Typography>
            <Box
              sx={{
                backgroundColor: SURFACE,
                border: `1px solid ${LINE}`,
                borderRadius: "12px",
                p: "16px 20px",
              }}
            >
              <Typography sx={{ fontSize: 13.5, color: INK_2, lineHeight: 1.8 }}>
                {transcription.text}
              </Typography>
            </Box>
          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default DetailedFeedbackModal;
