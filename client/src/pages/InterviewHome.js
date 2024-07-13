import React, { useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InterviewService from "../services/interview-service.js";

const InterviewHome = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompanyProvided, setIsCompanyProvided] = useState(true);
  const [isRoleProvided, setIsRoleProvided] = useState(true);

  const [companyName, setCompanyName] = useState("");
  const [jobRole, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

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
    <Container component="main" maxWidth="lg" sx={{ paddingTop: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon></ArrowBackIcon>
        </IconButton>
        <Typography variant="h5" gutterBottom sx={{ marginLeft: "-25px" }}>
          Interviews
        </Typography>
        <Typography></Typography>
      </Box>

      <Grid container spacing={3} sx={{ padding: 2 }}>
        <Grid item md={6} xs={12}>
          <Paper
            variant="none"
            sx={{
              height: "100%",
              backgroundColor: "#f4f5f5",
              overflowY: "auto",
              zIndex: 1,
            }}
          >
            {isStarting && (
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                // color="violet"
                />
              </Box>
            )}

            <Box sx={{ padding: 2, height: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                }}
                gutterBottom
              >
                Practice
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "80%",
                }}
              >
                <Typography
                  variant="body2"
                  color="grey"
                  sx={{ mb: 3, textAlign: "center" }}
                >
                  Practice frequently asked questions
                </Typography>

                <Button
                  variant="contained"
                  onClick={handleStart}
                  disabled={isStarting}
                >
                  Start
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item md={6} xs={12}>
          <Paper variant="outlined" sx={{ overflowY: "auto", zIndex: 1 }}>
            {isUploading && (
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                // color="violet"
                />
              </Box>
            )}
            <Box sx={{ padding: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                }}
                gutterBottom
              >
                Prepare for upcoming Interview
              </Typography>
              <Typography variant="body2" color="grey" sx={{ mb: 3 }}>
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
                        //   borderColor: "violet.dark",
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
                        //   borderColor: "violet.dark",
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
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "violet.dark",
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  // color="violet"
                  sx={{ mt: 3, mb: 2 }}
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
