import React, { useState, useRef, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import TimerIcon from "@mui/icons-material/Timer";

const VoiceRecordingTab = ({ handleRecord, handleSubmit }) => {
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

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
    recorder.start();

    let chunks = []; // Array to collect data chunks

    // Handle incoming data
    recorder.ondataavailable = (e) => {
      chunks.push(e.data); // Collect chunks of recorded data
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
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
      <TimerIcon color="gray" sx={{ mr: "-20px" }}></TimerIcon>
      <Typography sx={{ color: "gray" }}>
        <strong>{`${timer}s`}</strong>
      </Typography>

      <Button
        variant="contained"
        // color="violet"
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
        onClick={isRecording ? handleSubmitInner : handleRecordInner}
        sx={{ minWidth: "10%" }}
      >
        {isRecording ? "Submit" : "Record"}
      </Button>
      <RadioButtonCheckedIcon
      // color={isRecording ? "violet" : "gray"}
      ></RadioButtonCheckedIcon>
    </Box>
  );
};

export default VoiceRecordingTab;
