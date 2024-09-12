import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Grid,
  Paper,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InterviewService from "../services/interview-service.js";
import { getAuth } from "firebase/auth";

const InterviewHome = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompanyProvided, setIsCompanyProvided] = useState(true);
  const [isRoleProvided, setIsRoleProvided] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setUser(firebaseUser);
    } else {
      setUser(null);
    }

    return;
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    console.log({ companyName, jobRole: jobRole, jobDescription });

    setIsCompanyProvided(true);
    setIsRoleProvided(true);

    if (!companyName || !jobRole) {
      if (!companyName) {
        setIsCompanyProvided(false);
      }

      if (!jobRole) {
        setIsRoleProvided(false);
      }

      return;
    }

    setIsUploading(true);

    const questions = await InterviewService.fetchBehaviouralQuestions(
      companyName,
      jobRole,
      jobDescription
    );
    console.log("Questions (fetched from backend api):", questions);

    navigate("/interview/questions", {
      state: {
        questions: questions,
        companyName: companyName,
        jobRole: jobRole,
        jobDescription: jobDescription,
      },
    });
  };

  const handleStart = async (event) => {
    event.preventDefault();
    setIsStarting(true);

    const questions = await InterviewService.fetchBehaviouralQuestions(
      null,
      null,
      null
    );
    console.log("Questions (fetched from backend api):", questions);

    navigate("/interview/questions", {
      state: {
        questions: questions,
        companyName: companyName,
        jobRole: jobRole,
        jobDescription: jobDescription,
      },
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom>
          👔 Job Interview Preparation
        </Typography>
        <Box></Box>
      </Box>

      <Grid container spacing={2} sx={{ padding: 0 }}>
        <Grid item xs={12} sm={12} md={12} lg={5} xl={5}>
          <Paper
            variant="none"
            sx={{
              height: "100%",
              backgroundColor: "#FAF9F2",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Typography
                variant="h5"
                sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
                gutterBottom
              >
                Practice
              </Typography>

              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mb: 3, textAlign: "center" }}
              >
                Get ready to tackle the most common questions with confidence.
                Start your practice now!
              </Typography>

              <Button
                variant="contained"
                color="warning"
                onClick={handleStart}
                disabled={isStarting}
                sx={{ width: "50%", textTransform: "none", fontWeight: "bold" }}
                style={{ backgroundColor: "#FA735B" }}
              >
                Start
              </Button>

              {isStarting && (
                <Box
                  sx={{
                    display: "flex",
                    padding: 3,
                  }}
                >
                  <CircularProgress style={{ color: "#FA735B" }} />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid
          item
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          xs={12}
          sm={12}
          md={12}
          lg={2}
          xl={2}
        >
          <Typography>or</Typography>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={5} xl={5}>
          <Paper
            variant="elevation"
            elevation={0}
            sx={{
              overflowY: "auto",
              zIndex: 1,
              borderRadius: "10px",
            }}
          >
            {isUploading && (
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                  sx={{
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#FA735B", // Custom color for the progress bar
                    },
                  }}
                />
              </Box>
            )}
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  textAlign: "center",
                }}
                gutterBottom
              >
                Prepare for upcoming Interview
              </Typography>
              <Typography
                variant="body2"
                color="grey"
                sx={{ mb: 3, textAlign: "center" }}
              >
                Tell us about your upcoming Interview, and we'll create a custom
                question bank just for your prep!
              </Typography>
              <Box
                component="form"
                onSubmit={handleUpload}
                noValidate
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="company-name"
                  label="Company Name"
                  name="companyName"
                  autoComplete="off"
                  autoFocus
                  variant="outlined"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "darkgray",
                      },
                    },
                  }}
                />
                {!isCompanyProvided && (
                  <Typography variant="body2" color="red">
                    Company name is a required field
                  </Typography>
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="role"
                  label="Role"
                  name="role"
                  autoComplete="off"
                  value={jobRole}
                  onChange={(e) => setRole(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "darkgray",
                      },
                    },
                  }}
                />
                {!isRoleProvided && (
                  <Typography variant="body2" color="red">
                    Role is a required field
                  </Typography>
                )}
                <TextField
                  margin="normal"
                  fullWidth
                  name="jobDescription"
                  label="Job Description"
                  id="job-description"
                  multiline
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "darkgray",
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="warning"
                  sx={{
                    mt: 3,
                    mb: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                  style={{ backgroundColor: "#FA735B" }}
                  disabled={isUploading}
                >
                  Upload
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InterviewHome;
