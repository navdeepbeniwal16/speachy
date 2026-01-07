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
import QuestionsList from "../components/QuestionsList.js";

const PAGE_BG = "#fff4ef";
const SURFACE_BG = "#ffffff";
const SURFACE_BORDER = "1px solid rgba(252,150,120,0.14)";
const SURFACE_SHADOW = "0 18px 36px rgba(252,150,120,0.12)";
const HEADING_COLOR = "#2f170f";
const BODY_COLOR = "rgba(60,32,25,0.78)";

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
  const [savedQuestions, setSavedQuestions] = useState([]);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(47,23,15,0.2)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(47,23,15,0.4)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#FA735B",
      },
    },
  };

  const experienceOptions = [
    { value: "entry", label: "Entry (0-1 years)" },
    { value: "intermediate", label: "Intermediate (1-3 years)" },
    { value: "experienced", label: "Experienced (3-5 years)" },
    { value: "advanced", label: "Advanced (5-10 years)" },
    { value: "expert", label: "Expert (10+ years)" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const allSavedQuestions =
            await InterviewService.getAllSavedInterviewQuestions();
          console.log("Saved Interview Questions:", allSavedQuestions);
          setSavedQuestions(allSavedQuestions);
        } catch (error) {
          console.error("Error fetching saved questions:", error);
        }
      } else {
        setUser(null);
      }
    };

    fetchData();
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
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{ color: HEADING_COLOR, borderRadius: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom sx={{ color: HEADING_COLOR, fontWeight: 600 }}>
            👔 Job Interview Preparation
          </Typography>
          <Box />
        </Box>

        <Grid container spacing={3} sx={{ padding: 0 }}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              zIndex: 1,
              mt: 2,
              borderRadius: 3,
              border: SURFACE_BORDER,
              backgroundColor: SURFACE_BG,
              boxShadow: SURFACE_SHADOW,
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
                sx={{ fontWeight: 700, color: HEADING_COLOR }}
                gutterBottom
              >
                Prepare for an upcoming interview
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: BODY_COLOR,
                }}
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
                      sx={inputSx}
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
                      sx={inputSx}
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
                      sx={inputSx}
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
                      sx={inputSx}
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
                      sx={inputSx}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 2,
                        mb: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        backgroundColor: "#FA735B",
                        boxShadow:
                          "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
                        "&:hover": {
                          backgroundColor: "#f8643f",
                          boxShadow:
                            "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
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
            elevation={0}
            sx={{
              backgroundColor: SURFACE_BG,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
              mt: 2,
              borderRadius: 3,
              border: SURFACE_BORDER,
              boxShadow: SURFACE_SHADOW,
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
                sx={{ mb: 2, textAlign: "center", fontWeight: 700, color: HEADING_COLOR }}
                gutterBottom
              >
                General Practice
              </Typography>

              <Typography
                variant="body1"
                sx={{ mb: 3, textAlign: "center", color: BODY_COLOR }}
              >
                Get ready to tackle the most common questions with confidence.
                Start your practice now!
              </Typography>

              <Button
                variant="contained"
                onClick={handleStart}
                disabled={isStarting}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "#FA735B",
                  boxShadow:
                    "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
                  "&:hover": {
                    backgroundColor: "#f8643f",
                    boxShadow:
                      "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
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

        {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Paper
            variant="none"
            sx={{
              height: "100%",
              borderRadius: "10px",
              backgroundColor: "#FFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "left",
              padding: 3,
              mt: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ pl: 3, pb: 1, pt: 1, textAlign: "left" }}
              style={{ fontWeight: "bold", color: "#444444" }}
              gutterBottom
            >
              Saved Questions
            </Typography>

            <QuestionsList questions={savedQuestions}></QuestionsList>
          </Paper>
        </Grid> */}
      </Grid>
    </Container>
    </Box>
  );
};

export default InterviewHome;
