import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import InterviewService from "../services/interview-service.js";
import { getAuth } from "firebase/auth";
import { AppContext } from "../components/AppContext.js";

const PAGE_BG = "#fff4ef";
const SURFACE_BG = "#ffffff";
const SURFACE_BORDER = "1px solid rgba(252, 150, 120, 0.12)";
const SURFACE_SHADOW = "0 18px 36px rgba(252, 150, 120, 0.15)";
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
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [user, setUser] = useState(null);

  // Mode toggle
  const [interviewMode, setInterviewMode] = useState(null); // null | "ai" | "custom"

  // Saved projects
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Custom questions state
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [saveCustomDialogOpen, setSaveCustomDialogOpen] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252, 150, 120, 0.35)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252, 150, 120, 0.6)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#FA735B",
        borderWidth: "1px",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#FA735B",
    },
  };

  const orangeInputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252, 150, 120, 0.35)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252, 150, 120, 0.6)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#FA735B",
        borderWidth: "1px",
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await InterviewService.getProjects();
        setProjects(data);
      } catch (error) {
        showSnackbar("error", "Could not load your saved projects.");
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
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
        experience,
        additionalNotes
      );
      navigate("/interview/questions", {
        state: {
          questions,
          companyName,
          jobRole,
          jobDescription,
          industry,
          requiredExperience: experience,
          additionalNotes,
          mode: "ai",
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

  const handleSaveCustomProject = async () => {
    if (!customProjectName.trim() || customQuestions.length === 0) return;
    setIsSavingCustom(true);
    try {
      await InterviewService.saveProject(customProjectName.trim(), customQuestions, {
        companyName: companyName || null,
        jobRole: jobRole || null,
        jobDescription: jobDescription || null,
        industry: industry || null,
        requiredExperience: experience || null,
        additionalNotes: null,
      });
      showSnackbar("success", "Project saved!");
      setSaveCustomDialogOpen(false);
      setCustomProjectName("");
      const updated = await InterviewService.getProjects();
      setProjects(updated);
    } catch (error) {
      showSnackbar("error", "Failed to save project. Please try again.");
    } finally {
      setIsSavingCustom(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 6, md: 8 } }}>
      <Container maxWidth="xl">

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

        {/* Entry point cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>

          {/* Card A — Prepare for a specific role */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              onClick={() => setInterviewMode("ai")}
              sx={{
                cursor: "pointer",
                px: { xs: 3, md: 4 },
                py: { xs: 3, md: 4 },
                height: "100%",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                border: SURFACE_BORDER,
                backgroundColor: SURFACE_BG,
                boxShadow: SURFACE_SHADOW,
                transition: "transform 120ms ease, border-color 120ms ease, background-color 120ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "rgba(250,115,91,0.5)",
                  backgroundColor: "rgba(250,115,91,0.03)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <AutoAwesomeIcon sx={{ color: "#FA735B", fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: HEADING_COLOR }}>
                  Prepare for a role
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: BODY_COLOR, lineHeight: 1.6, flex: 1 }}>
                Generate a tailored question set based on the company, role, and experience level.
              </Typography>
            </Paper>
          </Grid>

          {/* Card B — Build your own set */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              onClick={() => setInterviewMode("custom")}
              sx={{
                cursor: "pointer",
                px: { xs: 3, md: 4 },
                py: { xs: 3, md: 4 },
                height: "100%",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                border: SURFACE_BORDER,
                backgroundColor: SURFACE_BG,
                boxShadow: SURFACE_SHADOW,
                transition: "transform 120ms ease, border-color 120ms ease, background-color 120ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "rgba(250,115,91,0.5)",
                  backgroundColor: "rgba(250,115,91,0.03)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <CreateOutlinedIcon sx={{ color: "#FA735B", fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: HEADING_COLOR }}>
                  Build your own set
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: BODY_COLOR, lineHeight: 1.6, flex: 1 }}>
                Add your own questions and practice anything not covered by the AI.
              </Typography>
            </Paper>
          </Grid>

          {/* Card C — Quick Practice (most prominent) */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                px: { xs: 3, md: 4 },
                py: { xs: 3, md: 4 },
                height: "100%",
                borderRadius: 4,
                border: SURFACE_BORDER,
                backgroundColor: "rgba(250,115,91,0.05)",
                boxShadow: SURFACE_SHADOW,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <PlayCircleOutlineIcon sx={{ color: "#FA735B", fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: HEADING_COLOR }}>
                  Quick Practice
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: BODY_COLOR, lineHeight: 1.6, mb: 2.5, flex: 1 }}>
                Jump straight into commonly asked behavioural questions — no setup needed.
              </Typography>
              <Button
                variant="contained"
                onClick={handleStart}
                disabled={isStarting}
                sx={primaryButtonSx}
              >
                {isStarting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Jump In"}
              </Button>
            </Paper>
          </Grid>

        </Grid>

        {/* Your Projects */}
        <Box sx={{ mt: 5 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: HEADING_COLOR, mb: 2.5 }}
          >
            Your Projects
          </Typography>

          {projectsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#FA735B" }} />
            </Box>
          ) : projects.length === 0 ? (
            <Typography variant="body2" sx={{ color: MUTED_COLOR }}>
              No saved projects yet — generate a question set above and save it as a project.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Paper
                    elevation={0}
                    onClick={() =>
                      navigate("/interview/questions", {
                        state: {
                          questions: project.questions,
                          companyName: project.companyName,
                          jobRole: project.jobRole,
                          jobDescription: project.jobDescription,
                          industry: project.industry,
                          requiredExperience: project.requiredExperience,
                          additionalNotes: project.additionalNotes,
                          mode: "project",
                        },
                      })
                    }
                    sx={{
                      cursor: "pointer",
                      px: 3,
                      py: 2.5,
                      borderRadius: 4,
                      border: SURFACE_BORDER,
                      backgroundColor: SURFACE_BG,
                      boxShadow: SURFACE_SHADOW,
                      transition: "transform 120ms ease, box-shadow 120ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: "rgba(250,115,91,0.4)",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: HEADING_COLOR, mb: 0.5 }}
                    >
                      {project.name}
                    </Typography>

                    {(project.companyName || project.jobRole) && (
                      <Typography
                        variant="body2"
                        sx={{ color: BODY_COLOR, mb: 1 }}
                      >
                        {[project.companyName, project.jobRole]
                          .filter(Boolean)
                          .join(" — ")}
                      </Typography>
                    )}

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                      {project.requiredExperience && (
                        <Chip
                          label={project.requiredExperience}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(250,115,91,0.1)",
                            color: "#FA735B",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                      <Chip
                        label={`${project.questions?.length ?? 0} questions`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(60,32,25,0.06)",
                          color: BODY_COLOR,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>

                    <Typography variant="caption" sx={{ color: MUTED_COLOR }}>
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

      </Container>

      {/* Prepare for a role dialog */}
      <Dialog
        open={interviewMode === "ai"}
        onClose={() => setInterviewMode(null)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: "#FA735B", fontSize: 18 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: HEADING_COLOR }}>
                Prepare for a role
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setInterviewMode(null)} sx={{ color: MUTED_COLOR }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: HEADING_COLOR, mb: 2.5 }}>
            Fill in your role details
          </Typography>
          <Box component="form" onSubmit={handleUpload} noValidate>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Company Name"
                  autoComplete="off"
                  autoFocus
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  sx={inputSx}
                />
                {!isCompanyProvided && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    Company name is required
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Role"
                  autoComplete="off"
                  value={jobRole}
                  onChange={(e) => setRole(e.target.value)}
                  sx={inputSx}
                />
                {!isRoleProvided && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    Role is required
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  required
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
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    Experience level is required
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="Job Description"
                  multiline
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="Additional Notes"
                  placeholder="e.g. Focus on leadership and conflict resolution"
                  multiline
                  rows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ ...primaryButtonSx, py: 1.5 }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Generate Questions"
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Build your own set dialog */}
      <Dialog
        open={interviewMode === "custom"}
        onClose={() => setInterviewMode(null)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CreateOutlinedIcon sx={{ color: "#FA735B", fontSize: 18 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: HEADING_COLOR }}>
                Build your own set
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setInterviewMode(null)} sx={{ color: MUTED_COLOR }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: HEADING_COLOR, mb: 2.5 }}>
            Add the questions you want to practise
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
                      sx={{ color: "#FA735B", fontWeight: 700, minWidth: 24, flexShrink: 0 }}
                    >
                      {i + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ color: BODY_COLOR, flex: 1, lineHeight: 1.6 }}>
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
        </DialogContent>
        <DialogActions sx={{ px: { xs: 3, md: 4 }, py: 2.5, gap: 1.5 }}>
          <Button
            variant="outlined"
            disabled={customQuestions.length === 0}
            startIcon={<BookmarkBorderIcon />}
            onClick={() => {
              setCustomProjectName(
                companyName && jobRole ? `${companyName} — ${jobRole}` : ""
              );
              setSaveCustomDialogOpen(true);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              borderColor: "rgba(252,150,120,0.4)",
              color: "#FA735B",
              "&:hover": {
                borderColor: "#FA735B",
                backgroundColor: "rgba(250,115,91,0.04)",
              },
            }}
          >
            Save as Project
          </Button>
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
        </DialogActions>
      </Dialog>

      {/* Save as Project dialog */}
      <Dialog
        open={saveCustomDialogOpen}
        onClose={() => setSaveCustomDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, px: 1, py: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: HEADING_COLOR, pb: 0.5 }}>
          Save as Project
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: BODY_COLOR, mb: 2 }}>
            Give this question set a name so you can revisit and practice from it later.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Project name"
            value={customProjectName}
            onChange={(e) => setCustomProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customProjectName.trim() && !isSavingCustom) {
                handleSaveCustomProject();
              }
            }}
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setSaveCustomDialogOpen(false)}
            sx={{ textTransform: "none", color: MUTED_COLOR }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!customProjectName.trim() || isSavingCustom}
            onClick={handleSaveCustomProject}
            sx={{ ...primaryButtonSx, py: 1, px: 2.5 }}
          >
            {isSavingCustom ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewHome;
