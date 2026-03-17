import React, { useState, useRef, useEffect } from "react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import CloseIcon from "@mui/icons-material/Close";
import "../css/bouncing-loader.css"; // We'll define the wave animation in this CSS

const VoiceRecordingTab = ({ handleRecord, handleSubmit }) => {
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const isCancelledRef = useRef(false);
  let chunks = [];

  // Format timer to show minutes and seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRecordInner = () => {
    setIsRecording(true);
    startTimer();
    startRecording();
  };

  const handleSubmitInner = () => {
    setIsRecording(false);
    stopTimer();
    stopRecording();
    setIsLoading(true); // show loader while waiting for server
  };

  const handleCancelInner = () => {
    isCancelledRef.current = true;
    setIsRecording(false);
    stopTimer();
    setTimer(0);
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  };

  const getMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error) {
      console.log("Error accessing microphone:", error);
    }
  };

  useEffect(() => {
    const prepareRecorder = async () => {
      const stream = await getMicrophoneAccess();
      if (stream) {
        const newRecorder = new MediaRecorder(stream);
        setRecorder(newRecorder);
      }
    };

    prepareRecorder();

    return () => {
      if (recorder) {
        recorder.stream.getTracks().forEach((track) => track.stop());
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }
    };
  }, []);

  const startRecording = () => {
    if (!recorder) return;

    setIsRecording(true);

    recorder.start(1000);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      if (isCancelledRef.current) {
        isCancelledRef.current = false;
        chunks = [];
        return;
      }

      const blob = new Blob(chunks, { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsLoading(true);

      try {
        await handleSubmit(blob);
      } finally {
        setIsLoading(false);
        chunks = [];
      }
    };
  };

  const stopRecording = () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setIsRecording(false);
      setTimer(0);
    }
  };

  const startTimer = () => {
    setTimer(0);
    intervalRef.current = setInterval(() => {
      setTimer((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: 2,
        gap: 3,
      }}
    >
      <TimerOutlinedIcon fontSize="large" sx={{ color: "gray", mr: "-20px" }} />
      <Typography variant="h5" sx={{ color: "gray" }}>
        <strong>{formatTime(timer)}</strong>
      </Typography>

      {isLoading ? (
        <Box className="bouncing-loader" sx={{ height: 36, width: 60 }}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </Box>
      ) : (
        <Button
          variant="contained"
          onClick={isRecording ? handleSubmitInner : handleRecordInner}
          sx={{
            minWidth: "10%",
            textTransform: "none",
            backgroundColor: "#FA735B",
            color: "#fff",
            fontWeight: "bold",
            boxShadow:
              "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
            "&:hover": {
              backgroundColor: "#f8643f",
              boxShadow:
                "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
            },
          }}
        >
          <strong>{isRecording ? "Submit" : "Record"}</strong>
        </Button>
      )}

      {isRecording ? (
        <MicNoneOutlinedIcon style={{ color: "#FA735B" }} fontSize="large" />
      ) : (
        <MicOffOutlinedIcon fontSize="large" sx={{ color: "gray" }} />
      )}

      {isRecording && (
        <Button
          variant="outlined"
          onClick={handleCancelInner}
          startIcon={<CloseIcon />}
          sx={{
            textTransform: "none",
            color: "rgba(60,32,25,0.55)",
            borderColor: "rgba(60,32,25,0.2)",
            fontWeight: "bold",
            ml: 1,
            "&:hover": {
              borderColor: "rgba(60,32,25,0.4)",
              backgroundColor: "rgba(60,32,25,0.04)",
            },
          }}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
};

export default VoiceRecordingTab;
