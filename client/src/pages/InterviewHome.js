import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InterviewService from "../services/interview-service.js";
import { getAuth } from "firebase/auth";
import { AppContext } from "../components/AppContext.js";

const PAGE_BG = "#fff4ef";
const SURFACE_BG = "#ffffff";
const SURFACE_BORDER = "1px solid rgba(252,150,120,0.14)";
const SURFACE_SHADOW = "0 18px 36px rgba(252,150,120,0.12)";
const HEADING_COLOR = "#2f170f";
const BODY_COLOR = "rgba(60,32,25,0.78)";
const MUTED_COLOR = "rgba(60,32,25,0.45)";

const InterviewHome = () => {
  const auth = getAuth();
  const { showSnackbar } = useContext(AppContext);
  const navigate = useNavigate();

  // AI mode state
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

  // Mode toggle
  const [interviewMode, setInterviewMode] = useState("ai"); // "ai" | "custom"

  // Custom questions state
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);

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

  const orangeInputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(250,115,91,0.25)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(250,115,91,0.55)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#FA735B",
      },
    },
    "& .MuiInputBase-input": {
      color: BODY_COLOR,
      fontSize: "0.95rem",
      lineHeight: 1.7,
    },
    "& .MuiInputBase-input::placeholder": {
      color: "rgba(60,32,25,0.35)",
    },
  };

  const primaryButtonSx = {
    textTransform: "none",
    fontWeight: 600,
    px: 3.5,
    py: 1.4,
    borderRadius: 2,
    backgroundColor: "#FA735B",
    boxShadow:
      "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
    "&:hover": {
      backgroundColor: "#f8643f",
      boxShadow:
        "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
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
      } else {
        setUser(null);
      }
    };
    fetchData();
  }, []);

  // --- AI mode handlers ---

  const handleUpload = async (event) => {
    event.preventDefault();

    setIsCompanyProvided(true);
    setIsRoleProvided(true);
    setIsExperienceProvided(true);

    if (!companyName || !jobRole || !experience) {
      if (!companyName) setIsCompanyProvided(false);
      if (!jobRole) setIsRoleProvided(false);
      if (!experience) setIsExperienceProvided(false);
      return;
    }

    setIsUploading(true);
    try {
      const questions = await InterviewService.fetchBehaviouralQuestions(
        companyName,
        jobRole,
        jobDescription,
        industry,
        experience
      );
      navigate("/interview/questions", {
        state: {
          questions,
          companyName,
          jobRole,
          jobDescription,
          industry,
          requiredExperience: experience,
        },
      });
    } catch (error) {
      const message =
        error?.userMessage ||
        "Unable to generate questions right now. Please try again.";
      showSnackbar("error", message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = async (event) => {
    event.preventDefault();
    setIsStarting(true);
    try {
      const questions = await InterviewService.fetchBehaviouralQuestions(
        null,
        null,
        null
      );
      navigate("/interview/questions", {
        state: {
          questions,
          companyName,
          jobRole,
          jobDescription,
        },
      });
    } catch (error) {
      const message =
        error?.userMessage ||
        "Unable to generate questions right now. Please try again.";
      showSnackbar("error", message);
    } finally {
      setIsStarting(false);
    }
  };

  // --- Custom questions handlers ---

  const handleAddCustomQuestion = () => {
    const trimmed = customQuestionInput.trim();
    if (!trimmed) return;
    setCustomQuestions((prev) => [
      ...prev,
      {
        question: trimmed,
        tags: [],
        difficultyLevel: "medium",
        isAIGenerated: false,
        isCustom: true,
      },
    ]);
    setCustomQuestionInput("");
  };

  const handleRemoveCustomQuestion = (index) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartCustomPractice = () => {
    if (customQuestions.length === 0) return;
    navigate("/interview/questions", {
      state: {
        questions: customQuestions,
        companyName: companyName || "",
        jobRole: jobRole || "",
        jobDescription: jobDescription || "",
        industry: industry || "",
        requiredExperience: experience || "",
      },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">

        {/* Page header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{ color: HEADING_COLOR, borderRadius: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: HEADING_COLOR, fontWeight: 600 }}>
            Job Interview Preparation
          </Typography>
          <Box />
        </Box>

        {/* Mode toggle */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              bgcolor: "#f5ede9",
              borderRadius: "12px",
              p: "4px",
              gap: "4px",
            }}
          >
            <Button
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setInterviewMode("ai")}
              disableElevation
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                px: 2.5,
                py: 0.8,
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                ...(interviewMode === "ai"
                  ? {
                      bgcolor: "#FA735B",
                      color: "#fff",
                      boxShadow: "0px 4px 12px rgba(250,115,91,0.4)",
                      "&:hover": { bgcolor: "#e8614a" },
                    }
                  : {
                      color: MUTED_COLOR,
                      "&:hover": { bgcolor: "transparent", color: BODY_COLOR },
                    }),
              }}
            >
              AI Questions
            </Button>
            <Button
              startIcon={<CreateOutlinedIcon />}
              onClick={() => setInterviewMode("custom")}
              disableElevation
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                px: 2.5,
                py: 0.8,
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                ...(interviewMode === "custom"
                  ? {
                      bgcolor: "#FA735B",
                      color: "#fff",
                      boxShadow: "0px 4px 12px rgba(250,115,91,0.4)",
                      "&:hover": { bgcolor: "#e8614a" },
                    }
                  : {
                      color: MUTED_COLOR,
                      "&:hover": { bgcolor: "transparent", color: BODY_COLOR },
                    }),
              }}
            >
              Custom Questions
            </Button>
          </Box>
        </Box>

        {/* AI mode */}
        {interviewMode === "ai" && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  overflow: "hidden",
                  borderRadius: 3,
                  border: SURFACE_BORDER,
                  backgroundColor: SURFACE_BG,
                  boxShadow: SURFACE_SHADOW,
                }}
              >
                {isUploading && (
                  <LinearProgress
                    sx={{
                      "& .MuiLinearProgress-bar": { backgroundColor: "#FA735B" },
                      backgroundColor: "rgba(250,115,91,0.12)",
                    }}
                  />
                )}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: HEADING_COLOR }} gutterBottom>
                    Prepare for an upcoming interview
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: BODY_COLOR }}>
                    Ace your interviews with practice questions and response analysis
                  </Typography>
                  <Box component="form" onSubmit={handleUpload} noValidate>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          margin="dense"
                          required
                          fullWidth
                          label="Company Name"
                          autoComplete="off"
                          autoFocus
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
                          label="Role"
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
                          label="Experience Required"
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
                          label="Industry"
                          autoComplete="off"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          margin="dense"
                          fullWidth
                          label="Job Description.."
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
                          sx={{ ...primaryButtonSx, mt: 2, mb: 2 }}
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

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: SURFACE_BG,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 3,
                  borderRadius: 3,
                  border: SURFACE_BORDER,
                  boxShadow: SURFACE_SHADOW,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ mb: 2, textAlign: "center", fontWeight: 700, color: HEADING_COLOR }}
                  gutterBottom
                >
                  General Practice
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, textAlign: "center", color: BODY_COLOR }}>
                  Get ready to tackle the most common questions with confidence. Start your practice now!
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleStart}
                  disabled={isStarting}
                  sx={primaryButtonSx}
                >
                  Jump In
                </Button>
                {isStarting && (
                  <Box sx={{ display: "flex", padding: 3 }}>
                    <CircularProgress style={{ color: "#FA735B" }} />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Custom questions mode */}
        {interviewMode === "custom" && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: SURFACE_BORDER,
                  backgroundColor: SURFACE_BG,
                  boxShadow: SURFACE_SHADOW,
                  p: 3,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: HEADING_COLOR, mb: 0.5 }}>
                  Build your question set
                </Typography>
                <Typography variant="body2" sx={{ color: BODY_COLOR, mb: 3 }}>
                  Add any questions you want to practice — real interview questions, domain-specific scenarios, or anything the system doesn't cover.
                </Typography>

                {/* Optional job context */}
                <Accordion
                  elevation={0}
                  disableGutters
                  sx={{
                    mb: 3,
                    border: SURFACE_BORDER,
                    borderRadius: "10px !important",
                    "&:before": { display: "none" },
                    "&.MuiAccordion-root": { borderRadius: "10px" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: MUTED_COLOR }} />}
                    sx={{ px: 2, py: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ color: MUTED_COLOR }}>
                      Add job context <span style={{ color: "rgba(60,32,25,0.3)" }}>(optional — improves feedback relevance)</span>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Company Name"
                          autoComplete="off"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Role"
                          autoComplete="off"
                          value={jobRole}
                          onChange={(e) => setRole(e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          fullWidth
                          select
                          label="Experience Level"
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
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Industry"
                          autoComplete="off"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Question input */}
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="e.g. Tell me about a time you resolved a conflict in your team."
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCustomQuestion();
                    }
                  }}
                  sx={{ ...orangeInputSx, mb: 1.5 }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                  <Button
                    variant="contained"
                    disableElevation
                    disabled={!customQuestionInput.trim()}
                    onClick={handleAddCustomQuestion}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      background: customQuestionInput.trim()
                        ? "linear-gradient(135deg, #FA735B 0%, #f8553a 100%)"
                        : undefined,
                      boxShadow: customQuestionInput.trim()
                        ? "0px 8px 20px -8px rgba(250,115,91,0.7)"
                        : "none",
                      "&:hover": {
                        background: "linear-gradient(135deg, #e8614a 0%, #e04028 100%)",
                        boxShadow: "0px 12px 24px -8px rgba(250,115,91,0.8)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Add Question
                  </Button>
                </Box>

                {/* Added questions list */}
                {customQuestions.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="overline"
                      sx={{ color: "#FA735B", fontWeight: 700, letterSpacing: 1.2, mb: 1.5, display: "block" }}
                    >
                      Your Practice Set ({customQuestions.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {customQuestions.map((q, i) => (
                        <Paper
                          key={i}
                          elevation={0}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            px: 2,
                            py: 1.5,
                            borderRadius: 2,
                            border: SURFACE_BORDER,
                            backgroundColor: "#fffaf8",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#FA735B",
                              fontWeight: 700,
                              minWidth: 24,
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: BODY_COLOR, flex: 1, lineHeight: 1.6 }}
                          >
                            {q.question}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveCustomQuestion(i)}
                            sx={{
                              color: MUTED_COLOR,
                              flexShrink: 0,
                              "&:hover": { color: "#e04028", bgcolor: "rgba(224,64,40,0.08)" },
                              transition: "all 0.15s ease",
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Start Practice */}
                <Button
                  fullWidth
                  variant="contained"
                  disableElevation
                  disabled={customQuestions.length === 0}
                  onClick={handleStartCustomPractice}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.4,
                    borderRadius: 2,
                    background:
                      customQuestions.length > 0
                        ? "linear-gradient(135deg, #FA735B 0%, #f8553a 100%)"
                        : undefined,
                    boxShadow:
                      customQuestions.length > 0
                        ? "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)"
                        : "none",
                    "&:hover": {
                      background: "linear-gradient(135deg, #e8614a 0%, #e04028 100%)",
                      boxShadow:
                        "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {customQuestions.length === 0
                    ? "Add at least one question to start"
                    : `Start Practice — ${customQuestions.length} question${customQuestions.length !== 1 ? "s" : ""}`}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

      </Container>
    </Box>
  );
};

export default InterviewHome;
