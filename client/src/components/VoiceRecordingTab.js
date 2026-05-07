import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopIcon from "@mui/icons-material/Stop";
import CloseIcon from "@mui/icons-material/Close";

const CORAL     = "#FA735B";
const CORAL_INK = "#C85A3E";
const MUTED     = "rgba(60,32,25,0.45)";
const MUTED_2   = "rgba(60,32,25,0.28)";

const waveBarSx = (delay) => ({
  width: 3,
  borderRadius: 2,
  backgroundColor: CORAL,
  animation: "waveBar 0.9s ease-in-out infinite",
  animationDelay: delay,
  "@keyframes waveBar": {
    "0%, 100%": { height: 6 },
    "50%":      { height: 22 },
  },
});

const VoiceRecordingTab = ({ handleRecord, handleSubmit }) => {
  const [recorder, setRecorder]     = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [timer, setTimer]           = useState(0);
  const intervalRef                 = useRef(null);
  const isCancelledRef              = useRef(false);
  let chunks = [];

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setRecorder(new MediaRecorder(stream));
      } catch (e) {
        console.error("Microphone access error:", e);
      }
    };
    prepare();
    return () => {
      if (recorder) {
        recorder.stream.getTracks().forEach((t) => t.stop());
        if (recorder.state === "recording") recorder.stop();
      }
    };
  }, []);

  const startTimer = () => {
    setTimer(0);
    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const stopTimer = () => clearInterval(intervalRef.current);

  const handleRecordInner = () => {
    if (!recorder) return;
    isCancelledRef.current = false;
    setIsRecording(true);
    startTimer();
    recorder.start(1000);
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
      if (isCancelledRef.current) { isCancelledRef.current = false; chunks = []; return; }
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      setIsLoading(true);
      try { await handleSubmit(blob); } finally { setIsLoading(false); chunks = []; }
    };
  };

  const handleStopInner = () => {
    setIsRecording(false);
    stopTimer();
    setTimer(0);
    if (recorder && recorder.state === "recording") recorder.stop();
  };

  const handleCancelInner = () => {
    isCancelledRef.current = true;
    setIsRecording(false);
    stopTimer();
    setTimer(0);
    if (recorder && recorder.state === "recording") recorder.stop();
  };

  // ── Idle state ──────────────────────────────────────────────────────────────
  if (!isRecording) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 2.5 }}>
        {/* Mic button with outer ring */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", backgroundColor: "rgba(250,115,91,0.12)" }} />
          <IconButton
            onClick={handleRecordInner}
            sx={{
              width: 68, height: 68,
              backgroundColor: CORAL,
              color: "#fff",
              "&:hover": { backgroundColor: CORAL_INK, transform: "scale(1.04)" },
              transition: "all 150ms ease",
              zIndex: 1,
            }}
          >
            <KeyboardVoiceIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Box>

        <Typography sx={{ fontSize: 13.5, color: MUTED }}>
          Tap to start recording your answer
        </Typography>
      </Box>
    );
  }

  // ── Recording state ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 2 }}>
      {/* Recording indicator + timer */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#e53935", animation: "pulse 1.2s ease-in-out infinite", "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.3 } } }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#e53935", letterSpacing: 1.2, textTransform: "uppercase" }}>
          Recording
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 32, fontWeight: 700, color: "rgba(60,32,25,0.78)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {formatTime(timer)}
      </Typography>

      {/* Waveform */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", height: 28 }}>
        {["0s", "0.15s", "0.3s", "0.45s", "0.6s", "0.45s", "0.3s", "0.15s", "0s", "0.15s", "0.3s", "0.45s"].map((delay, i) => (
          <Box key={i} sx={waveBarSx(delay)} />
        ))}
      </Box>

      {/* Stop button */}
      <IconButton
        onClick={handleStopInner}
        sx={{ width: 56, height: 56, backgroundColor: "#e53935", color: "#fff", "&:hover": { backgroundColor: "#c62828", transform: "scale(1.04)" }, transition: "all 150ms ease", mt: 0.5 }}
      >
        <StopIcon sx={{ fontSize: 24 }} />
      </IconButton>

      <Typography sx={{ fontSize: 12, color: MUTED_2 }}>
        Click stop when you're done
      </Typography>

      {/* Cancel — last, clearly separated */}
      <Box
        onClick={handleCancelInner}
        sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", color: MUTED, fontSize: 13, fontWeight: 500, "&:hover": { color: "rgba(60,32,25,0.7)" }, transition: "color 120ms ease", mt: 0.5 }}
      >
        <CloseIcon sx={{ fontSize: 15 }} />
        Cancel
      </Box>
    </Box>
  );
};

export default VoiceRecordingTab;
