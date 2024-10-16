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
  MenuItem,
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
  const [isExperienceProvided, setIsExperienceProvided] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [user, setUser] = useState(null);

  const experienceOptions = [
    { value: "entry", label: "Entry (0-1 years)" },
    { value: "intermediate", label: "Intermediate (1-3 years)" },
    { value: "experienced", label: "Experienced (3-5 years)" },
    { value: "advanced", label: "Advanced (5-10 years)" },
    { value: "expert", label: "Expert (10+ years)" },
  ];

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
    console.log({
      companyName,
      jobRole: jobRole,
      jobDescription,
      industry: industry,
      requiredExperience: experience,
    });

    setIsCompanyProvided(true);
    setIsRoleProvided(true);

    if (!companyName || !jobRole || !experience) {
      if (!companyName) {
        setIsCompanyProvided(false);
      }

      if (!jobRole) {
        setIsRoleProvided(false);
      }

      if (!experience) {
        setIsExperienceProvided(false);
      }

      return;
    }

    setIsUploading(true);

    const questions = await InterviewService.fetchBehaviouralQuestions(
      companyName,
      jobRole,
      jobDescription,
      industry,
      experience
    );
    console.log("Questions (fetched from backend api):", questions);

    navigate("/interview/questions", {
      state: {
        questions: questions,
        companyName: companyName,
        jobRole: jobRole,
        jobDescription: jobDescription,
        industry: industry,
        requiredExperience: experience,
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
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Paper
            variant="elevation"
            elevation={0}
            sx={{
              overflowY: "auto",
              zIndex: 1,
              borderRadius: "10px",
              mt: 2,
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
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h5"
                style={{ fontWeight: "bold", color: "#444444" }}
                gutterBottom
              >
                Prepare for an upcoming interview
              </Typography>
              <Typography
                variant="body2"
                color="grey"
                sx={{
                  mb: 2,
                }}
                style={{ fontWeight: "" }}
              >
                Ace your interviews with practice questions and response
                analysis
              </Typography>
              <Box
                component="form"
                onSubmit={handleUpload}
                noValidate
                sx={{ mt: 0 }}
              >
                <Grid container spacing={3} sx={{ padding: 0 }}>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <TextField
                      size="small"
                      margin="dense"
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
                      size="small"
                      margin="dense"
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
                      required
                      size="small"
                      margin="dense"
                      fullWidth
                      select
                      id="experience"
                      label="Experience Required"
                      name="experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "darkgray",
                          },
                        },
                      }}
                    >
                      {experienceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {!isExperienceProvided && (
                      <Typography variant="body2" color="red">
                        Experience Required is a required field
                      </Typography>
                    )}
                    <TextField
                      size="small"
                      margin="dense"
                      fullWidth
                      id="industry"
                      label="Industry"
                      name="industry"
                      autoComplete="off"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "darkgray",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <TextField
                      size="small"
                      margin="dense"
                      fullWidth
                      name="jobDescription"
                      label="Job Description.."
                      id="job-description"
                      multiline
                      rows={6}
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
                        mt: 2,
                        mb: 2,
                        textTransform: "none",
                        fontWeight: "bold",
                      }}
                      style={{
                        background:
                          "linear-gradient(90deg, #FF8E53 20%, #FA735B 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, #FA735B 20%, #FF8E53 90%)",
                        },
                      }}
                      disabled={isUploading}
                    >
                      Let's go!
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Paper
            variant="none"
            sx={{
              height: "100%",
              borderRadius: "10px",
              backgroundColor: "#FFF",
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
                sx={{ mb: 2, textAlign: "left" }}
                style={{ fontWeight: "bold", color: "#444444" }}
                gutterBottom
              >
                General Practice
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
                sx={{ textTransform: "none", fontWeight: "bold" }}
                style={{
                  backgroundColor: "#FA735B",
                  background:
                    "linear-gradient(90deg, #FF8E53 20%, #FA735B 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #FA735B 20%, #FF8E53 90%)",
                  },
                }}
              >
                Jump In
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
      </Grid>
    </Container>
  );
};

export default InterviewHome;
