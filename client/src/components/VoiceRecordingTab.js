import React, { useState, useRef, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";

const VoiceRecordingTab = ({ handleRecord, handleSubmit }) => {
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  let chunks = [];

  const handleRecordInner = () => {
    setIsRecording(true);
    startTimer();
    // Additional recording logic would go here
    startRecording();
  };

  const handleSubmitInner = () => {
    setIsRecording(false);
    stopTimer();
    // Additional stop recording logic would go here
    stopRecording();
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

    recorder.start(1000); // Use timeslice of 1000ms (1 second) to fix data audio data compatibility sent from Safari browser

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data); // Collect chunks of recorded data
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsRecording(false);
      handleSubmit(url); // Call the submit handler with the new URL
      chunks = []; // Reset chunks for the next recording
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
    setTimer(0); // Reset the timer
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
      <TimerOutlinedIcon
        color="gray"
        fontSize="large"
        sx={{
          mr: "-20px",
          color: "gray",
        }}
      ></TimerOutlinedIcon>
      <Typography variant="h5" sx={{ color: "gray" }}>
        <strong>{`${timer}s`}</strong>
      </Typography>

      <Button
        variant="contained"
        color="warning"
        onClick={isRecording ? handleSubmitInner : handleRecordInner}
        sx={{ minWidth: "10%", textTransform: "none" }}
      >
        <strong>{isRecording ? "Submit" : "Record"}</strong>
      </Button>

      {isRecording ? (
        <MicNoneOutlinedIcon
          color="warning"
          fontSize="large"
        ></MicNoneOutlinedIcon>
      ) : (
        <MicOffOutlinedIcon
          fontSize="large"
          sx={{ color: "gray" }}
        ></MicOffOutlinedIcon>
      )}
    </Box>
  );
};

export default VoiceRecordingTab;
