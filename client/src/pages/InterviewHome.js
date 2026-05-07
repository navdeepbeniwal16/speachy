import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import WorkIcon from "@mui/icons-material/Work";
import AddIcon from "@mui/icons-material/Add";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import HubHeader from "../components/HubHeader.js";
import InterviewService from "../services/interview-service.js";
import ProjectService from "../services/project-service.js";
import { AppContext } from "../components/AppContext.js";

// Design tokens
const CORAL = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK = "#C85A3E";
const PAGE_BG = "#fff4ef";
const SURFACE = "#ffffff";
const SURFACE_SOFT = "#fff9f7";
const LINE = "rgba(252,150,120,0.12)";
const INK = "#2f170f";
const INK_2 = "rgba(60,32,25,0.78)";
const MUTED = "rgba(60,32,25,0.45)";
const MUTED_2 = "rgba(60,32,25,0.3)";
const BUTTER_SOFT = "rgba(232,200,124,0.25)";
const BUTTER_INK = "#8b6a1f";

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
      borderColor: CORAL,
      borderWidth: "1px",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: CORAL },
};

const orangeInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: SURFACE,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(252, 150, 120, 0.35)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(252, 150, 120, 0.6)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: CORAL,
      borderWidth: "1px",
    },
  },
  "& .MuiInputBase-input": {
    color: INK_2,
    fontSize: "0.95rem",
    lineHeight: 1.7,
  },
  "& .MuiInputBase-input::placeholder": { color: "rgba(60,32,25,0.35)" },
};

const primaryButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  px: 3.5,
  py: 1.4,
  borderRadius: 2,
  backgroundColor: CORAL,
  boxShadow:
    "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
  "&:hover": {
    backgroundColor: "#f8643f",
    boxShadow:
      "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
  },
};

// Progress ring SVG component for project cards
const ProgressRing = ({
  value,
  size = 40,
  stroke = 3.5,
  color = CORAL,
  track = CORAL_SOFTER,
}) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value || 0));
  const dash = pct * circ;
  return (
    <Box
      sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
          />
        )}
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.22,
          fontWeight: 700,
          color,
        }}
      >
        {Math.round(pct * 100)}
      </Box>
    </Box>
  );
};

// Empty state illustration + copy
const EmptyProjectsState = ({ onPrepare, onBuild }) => (
  <Box
    sx={{
      backgroundColor: SURFACE,
      border: `1px solid ${LINE}`,
      borderRadius: "18px",
      p: "28px 32px",
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <Box sx={{ flex: 1, minWidth: 220 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          backgroundColor: CORAL_SOFTER,
          color: CORAL_INK,
          borderRadius: "20px",
          px: 1.5,
          py: 0.4,
          mb: 1.5,
          fontSize: 11.5,
          fontWeight: 600,
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 12 }} />
        New · Projects
      </Box>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: INK,
          mb: 1,
          lineHeight: 1.3,
        }}
      >
        No projects yet — let's change that.
      </Typography>
      <Typography
        sx={{ fontSize: 13.5, color: INK_2, lineHeight: 1.6, mb: 2.5 }}
      >
        A project saves your questions and remembers your progress across
        sessions.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={onPrepare}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            py: 1,
            borderRadius: "10px",
            backgroundColor: CORAL,
            boxShadow: "0px 8px 18px -6px rgba(250,115,91,0.6)",
            "&:hover": { backgroundColor: CORAL_INK },
            fontSize: 13,
          }}
        >
          Start a tailored project
        </Button>
        <Button
          variant="outlined"
          onClick={onBuild}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            py: 1,
            borderRadius: "10px",
            borderColor: LINE,
            color: INK_2,
            "&:hover": {
              borderColor: CORAL,
              color: CORAL,
              backgroundColor: CORAL_SOFTER,
            },
            fontSize: 13,
          }}
        >
          Build my own
        </Button>
      </Box>
    </Box>
    <Box sx={{ flexShrink: 0 }}>
      <svg viewBox="0 0 220 160" width="220" height="160">
        <defs>
          <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF7F2" />
            <stop offset="1" stopColor="#FCE2D8" />
          </linearGradient>
        </defs>
        <g transform="translate(30 50) rotate(-6)">
          <rect
            x="0"
            y="0"
            width="120"
            height="82"
            rx="8"
            fill="url(#folderGrad)"
            stroke="#EE7B5E"
            strokeOpacity="0.35"
          />
          <rect
            x="14"
            y="14"
            width="70"
            height="4"
            rx="2"
            fill="#EE7B5E"
            opacity="0.35"
          />
          <rect
            x="14"
            y="26"
            width="92"
            height="3"
            rx="1.5"
            fill="#EE7B5E"
            opacity="0.2"
          />
          <rect
            x="14"
            y="34"
            width="64"
            height="3"
            rx="1.5"
            fill="#EE7B5E"
            opacity="0.2"
          />
        </g>
        <g transform="translate(60 60) rotate(4)">
          <path
            d="M0 12 Q0 4 8 4 L34 4 L42 12 L112 12 Q120 12 120 20 L120 82 Q120 90 112 90 L8 90 Q0 90 0 82 Z"
            fill="#fff"
            stroke="#EE7B5E"
            strokeOpacity="0.5"
          />
          <rect x="14" y="28" width="60" height="4" rx="2" fill="#C85A3E" />
          <rect
            x="14"
            y="40"
            width="88"
            height="3"
            rx="1.5"
            fill="#EE7B5E"
            opacity="0.3"
          />
          <rect
            x="14"
            y="48"
            width="72"
            height="3"
            rx="1.5"
            fill="#EE7B5E"
            opacity="0.3"
          />
          <rect x="14" y="66" width="40" height="12" rx="6" fill="#FCE2D8" />
        </g>
        <path
          d="M185 42 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z"
          fill="#EE7B5E"
          opacity="0.8"
        />
        <circle cx="170" cy="78" r="2" fill="#EE7B5E" opacity="0.4" />
        <circle cx="198" cy="90" r="2.4" fill="#E8C87C" />
      </svg>
    </Box>
  </Box>
);

const InterviewHome = () => {
  const { showSnackbar } = useContext(AppContext);
  const navigate = useNavigate();

  // AI mode state
  const [isUploading, setIsUploading] = useState(false);
  const [isCompanyProvided, setIsCompanyProvided] = useState(true);
  const [isRoleProvided, setIsRoleProvided] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("entry");
  const [jobDescription, setJobDescription] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  // Mode toggle
  const [interviewMode, setInterviewMode] = useState(null); // null | "ai" | "custom"

  // Saved projects
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Custom questions state
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [saveCustomDialogOpen, setSaveCustomDialogOpen] = useState(false);
  const [saveAsProject, setSaveAsProject] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  // New state
  const [questionCount, setQuestionCount] = useState(10);
  const [contextOpen, setContextOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ProjectService.getAll();
        setProjects(data);
      } catch (error) {
        showSnackbar("error", "Could not load your saved projects.");
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const experienceOptions = [
    { value: "entry", label: "Entry", sub: "0–2 yrs" },
    { value: "mid", label: "Mid", sub: "2–5 yrs" },
    { value: "senior", label: "Senior", sub: "5–9 yrs" },
    { value: "staff", label: "Staff+", sub: "9+ yrs" },
  ];

  // --- AI mode handlers ---

  const handleUpload = async (event) => {
    event.preventDefault();

    setIsCompanyProvided(true);
    setIsRoleProvided(true);
    if (!companyName || !jobRole) {
      if (!companyName) setIsCompanyProvided(false);
      if (!jobRole) setIsRoleProvided(false);
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
        additionalNotes,
        questionCount,
      );

      // Auto-save as project, then navigate to project detail
      const projectName =
        companyName && jobRole
          ? `${companyName} — ${jobRole}`
          : companyName || jobRole || "Interview Prep";

      let savedProjectId = null;
      try {
        const saved = await ProjectService.save(projectName, questions, {
          kind: "tailored",
          companyName: companyName || null,
          jobRole: jobRole || null,
          jobDescription: jobDescription || null,
          industry: industry || null,
          requiredExperience: experience || null,
          additionalNotes: additionalNotes || null,
        });
        savedProjectId = saved?.projectId || null;
      } catch (_) {
        // non-blocking — save failure should not prevent navigation
      }

      setInterviewMode(null);

      if (savedProjectId) {
        navigate("/interview/questions", {
          state: {
            project: {
              id: savedProjectId,
              name: projectName,
              questions,
              kind: "tailored",
              companyName: companyName || null,
              jobRole: jobRole || null,
              jobDescription: jobDescription || null,
              industry: industry || null,
              requiredExperience: experience || null,
              additionalNotes: additionalNotes || null,
              practicedCount: 0,
            },
            questions,
            mode: "project",
          },
        });
      } else {
        // Fallback if save failed — go to questions list directly
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
      }
    } catch (error) {
      const message =
        error?.userMessage ||
        "Unable to generate questions right now. Please try again.";
      showSnackbar("error", message);
    } finally {
      setIsUploading(false);
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
    if (saveAsProject) {
      setCustomProjectName(
        companyName && jobRole ? `${companyName} — ${jobRole}` : "",
      );
      setSaveCustomDialogOpen(true);
      return;
    }
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
      const saved = await ProjectService.save(
        customProjectName.trim(),
        customQuestions,
        {
          kind: "custom",
          companyName: companyName || null,
          jobRole: jobRole || null,
          jobDescription: jobDescription || null,
          industry: industry || null,
          requiredExperience: experience || null,
          additionalNotes: null,
        },
      );
      setSaveCustomDialogOpen(false);
      setInterviewMode(null);
      if (saved?.projectId) {
        navigate("/interview/questions", {
          state: {
            project: {
              id: saved.projectId,
              name: customProjectName.trim(),
              questions: customQuestions,
              kind: "custom",
              companyName: companyName || null,
              jobRole: jobRole || null,
              jobDescription: jobDescription || null,
              industry: industry || null,
              requiredExperience: experience || null,
              additionalNotes: null,
              practicedCount: 0,
            },
            questions: customQuestions,
            mode: "project",
          },
        });
      }
    } catch (error) {
      showSnackbar("error", "Failed to save project. Please try again.");
    } finally {
      setIsSavingCustom(false);
    }
  };

  const suggestionPrompts = [
    "Tell me about a conflict you resolved on your team.",
    "Describe a time you had to push back on a stakeholder.",
    "Walk me through a decision you later regretted.",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: PAGE_BG,
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="md">
        <HubHeader
          title="Interview Hub"
          subtitle="Start preparing for your next interview."
        />

        {/* Entry cards grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: "14px",
            mb: 5,
          }}
        >
          {/* PrepareCard */}
          <Box
            onClick={() => setInterviewMode("ai")}
            sx={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              backgroundColor: SURFACE,
              border: `1px solid ${LINE}`,
              borderRadius: "18px",
              p: "22px 22px 18px",
              minHeight: 210,
              display: "flex",
              flexDirection: "column",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 22px 40px rgba(252,150,120,0.2)",
              },
            }}
          >
            {/* Icon box */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: CORAL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                flexShrink: 0,
              }}
            >
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 16 }} />
            </Box>

            {/* Badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: CORAL_SOFTER,
                color: CORAL_INK,
                borderRadius: "20px",
                px: 1.25,
                py: 0.3,
                fontSize: 10.5,
                fontWeight: 700,
                mb: 1,
                width: "fit-content",
                letterSpacing: 0.3,
              }}
            >
              AI · Tailored
            </Box>

            <Typography
              sx={{ fontSize: 17, fontWeight: 600, color: INK, mb: 0.75 }}
            >
              Prepare for a role
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: INK_2, lineHeight: 1.6, flex: 1 }}
            >
              Drop in a company &amp; role — we'll generate a set tailored to
              the exact bar they'll hold you to.
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 600,
                color: CORAL_INK,
                mt: 1.5,
              }}
            >
              Generate questions
            </Typography>
          </Box>

          {/* BuildCard */}
          <Box
            onClick={() => setInterviewMode("custom")}
            sx={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              backgroundColor: SURFACE_SOFT,
              backgroundImage:
                "radial-gradient(circle, rgba(200,90,62,0.14) 1px, transparent 1.2px)",
              backgroundSize: "14px 14px",
              border: `1px solid ${LINE}`,
              borderRadius: "18px",
              p: "22px 22px 18px",
              minHeight: 210,
              display: "flex",
              flexDirection: "column",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 22px 40px rgba(232,200,124,0.25)",
              },
            }}
          >
            {/* Icon box */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: SURFACE,
                border: `1px solid ${LINE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                flexShrink: 0,
              }}
            >
              <CreateIcon sx={{ color: CORAL, fontSize: 16 }} />
            </Box>

            {/* Badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: BUTTER_SOFT,
                color: BUTTER_INK,
                borderRadius: "20px",
                px: 1.25,
                py: 0.3,
                fontSize: 10.5,
                fontWeight: 700,
                mb: 1,
                width: "fit-content",
                letterSpacing: 0.3,
              }}
            >
              Custom
            </Box>

            <Typography
              sx={{ fontSize: 17, fontWeight: 600, color: INK, mb: 0.75 }}
            >
              Build your own set
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: INK_2, lineHeight: 1.6, flex: 1 }}
            >
              Write the exact questions you're dreading — the ones the AI
              wouldn't think to ask.
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 600,
                color: BUTTER_INK,
                mt: 1.5,
              }}
            >
              Start a new set
            </Typography>
          </Box>

          {/* Curated Collections card */}
          <Box
            onClick={() => navigate("/interview/collections")}
            sx={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              backgroundColor: INK,
              borderRadius: "18px",
              p: "22px 22px 18px",
              minHeight: 210,
              display: "flex",
              flexDirection: "column",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 22px 40px rgba(47,23,15,0.35)",
              },
            }}
          >
            {/* Coral orb */}
            <Box
              sx={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 30%, #FA735B 0%, #C85A3E 70%, transparent 72%)",
                pointerEvents: "none",
                opacity: 0.4,
              }}
            />

            {/* Icon box */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                flexShrink: 0,
              }}
            >
              <AutoStoriesIcon sx={{ color: "#fff", fontSize: 16 }} />
            </Box>

            {/* Badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.9)",
                borderRadius: "20px",
                px: 1.25,
                py: 0.3,
                fontSize: 10.5,
                fontWeight: 700,
                mb: 1,
                width: "fit-content",
                letterSpacing: 0.3,
              }}
            >
              Ready to practice
            </Box>

            <Typography
              sx={{ fontSize: 17, fontWeight: 600, color: "#fff", mb: 0.75 }}
            >
              Collections
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.6,
                flex: 1,
              }}
            >
              Professionally authored question sets for common interview roles.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/interview/collections")}
              sx={{
                mt: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                px: 2.5,
                py: 1,
                borderRadius: "10px",
                backgroundColor: CORAL,
                color: "#fff",
                alignSelf: "flex-start",
                boxShadow: "0 8px 18px rgba(250,115,91,0.45)",
                "&:hover": { backgroundColor: CORAL_INK },
              }}
            >
              Explore
            </Button>
          </Box>
        </Box>

        {/* Recent projects section */}
        <Box>
          {/* Section header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>
                Recent projects
              </Typography>
              {!projectsLoading && projects.length > 0 && (
                <Typography sx={{ fontSize: 12.5, color: MUTED }}>
                  {projects.length} saved
                </Typography>
              )}
            </Box>
            {!projectsLoading && projects.length > 0 && (
              <Button
                size="small"
                onClick={() => navigate("/projects")}
                sx={{
                  textTransform: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: MUTED,
                  px: 0,
                  "&:hover": { color: CORAL, backgroundColor: "transparent" },
                }}
              >
                View all
              </Button>
            )}
          </Box>

          {projectsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={28} sx={{ color: CORAL }} />
            </Box>
          ) : projects.length === 0 ? (
            <EmptyProjectsState
              onPrepare={() => setInterviewMode("ai")}
              onBuild={() => setInterviewMode("custom")}
            />
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 2,
              }}
            >
              {projects.slice(0, 3).map((project) => {
                const total = project.questions?.length || 0;
                const done = project.practicedCount || 0;
                const pct = total > 0 ? done / total : 0;
                const isCustom = project.kind === "custom";
                const isCollection = project.kind === "collection";
                const createdDate = project.createdAt
                  ? new Date(project.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

                return (
                  <Box
                    key={project.id}
                    onClick={() =>
                      isCollection
                        ? navigate("/interview/questions", {
                            state: {
                              mode: "collection",
                              collection: {
                                id: project.sourceCollectionId,
                                name: project.name,
                                author: project.author,
                                lastUpdated: project.collectionLastUpdated,
                              },
                              questions: project.questions,
                              from: "projects",
                              projectId: project.id,
                            },
                          })
                        : navigate("/interview/questions", {
                            state: {
                              project,
                              questions: project.questions,
                              mode: "project",
                            },
                          })
                    }
                    sx={{
                      cursor: "pointer",
                      backgroundColor: SURFACE,
                      border: `1px solid ${LINE}`,
                      borderRadius: "14px",
                      p: "18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      transition: "transform 120ms ease, box-shadow 120ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 18px 32px rgba(252,150,120,0.18)",
                      },
                    }}
                  >
                    {/* Kind badge + progress ring */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {isCollection ? (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            backgroundColor: "rgba(82,130,255,0.08)",
                            color: "#2a4bcc",
                            borderRadius: "20px",
                            px: 1.1,
                            py: 0.3,
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}
                        >
                          <AutoStoriesIcon sx={{ fontSize: 10 }} />
                          Curated
                        </Box>
                      ) : isCustom ? (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            backgroundColor: BUTTER_SOFT,
                            color: BUTTER_INK,
                            borderRadius: "20px",
                            px: 1.1,
                            py: 0.3,
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}
                        >
                          <CreateIcon sx={{ fontSize: 10 }} />
                          Custom
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            backgroundColor: CORAL_SOFTER,
                            color: CORAL_INK,
                            borderRadius: "20px",
                            px: 1.1,
                            py: 0.3,
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 10 }} />
                          Tailored
                        </Box>
                      )}
                      <ProgressRing value={pct} size={38} />
                    </Box>

                    {/* Company / role */}
                    <Box sx={{ minHeight: 62 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 15,
                          color: INK,
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {isCollection
                          ? project.name
                          : project.companyName || project.name}
                      </Typography>
                      {isCollection ? (
                        <Typography
                          sx={{ fontSize: 12.5, color: MUTED, mt: 0.25 }}
                        >
                          By {project.author || "Speachy"}
                        </Typography>
                      ) : project.jobRole ? (
                        <Typography
                          sx={{ fontSize: 12.5, color: MUTED, mt: 0.25 }}
                        >
                          {project.jobRole}
                        </Typography>
                      ) : null}
                    </Box>

                    {/* Progress bar */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography sx={{ fontSize: 11.5, color: INK_2 }}>
                          {done} of {total} practised
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: MUTED }}>
                          {createdDate}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: CORAL_SOFTER,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            borderRadius: 2,
                            backgroundColor: CORAL,
                            width: `${pct * 100}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: MUTED,
                        "&:hover": { color: CORAL },
                      }}
                    >
                      {done > 0 ? "Continue practising" : "Open project"}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Container>

      {/* Prepare for a role dialog */}
      <Dialog
        open={interviewMode === "ai"}
        onClose={() => setInterviewMode(null)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: PAGE_BG,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, position: "relative" }}>
          <IconButton
            size="small"
            onClick={() => setInterviewMode(null)}
            sx={{ position: "absolute", top: 14, right: 14, color: MUTED }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{ fontSize: 20, fontWeight: 700, color: INK, mb: 0.75, pr: 4 }}
          >
            Tell us about the role
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: INK_2,
              lineHeight: 1.6,
              maxWidth: 420,
            }}
          >
            The more context you give, the sharper the questions. You can always
            edit the set after.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: LINE }} />

        <DialogContent sx={{ px: 3.5, py: 3, backgroundColor: PAGE_BG }}>
          <Box component="form" onSubmit={handleUpload} noValidate>
            <Grid container spacing={2.5}>
              {/* Company */}
              <Grid item xs={12} sm={6}>
                <Typography
                  sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 0.6 }}
                >
                  Company <span style={{ color: CORAL }}>*</span>
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  autoComplete="off"
                  autoFocus
                  placeholder="e.g. Atlassian"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root": {
                      ...inputSx["& .MuiOutlinedInput-root"],
                      backgroundColor: SURFACE,
                    },
                  }}
                />
                {!isCompanyProvided && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Company name is required
                  </Typography>
                )}
              </Grid>

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <Typography
                  sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 0.6 }}
                >
                  Role <span style={{ color: CORAL }}>*</span>
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  autoComplete="off"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobRole}
                  onChange={(e) => setRole(e.target.value)}
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root": {
                      ...inputSx["& .MuiOutlinedInput-root"],
                      backgroundColor: SURFACE,
                    },
                  }}
                />
                {!isRoleProvided && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Role is required
                  </Typography>
                )}
              </Grid>

              {/* Experience — segmented control */}
              <Grid item xs={12}>
                <Typography
                  sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 0.75 }}
                >
                  Experience level <span style={{ color: CORAL }}>*</span>
                </Typography>
                <Box
                  sx={{
                    backgroundColor: "rgba(60,32,25,0.06)",
                    borderRadius: "10px",
                    p: "4px",
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                  }}
                >
                  {experienceOptions.map((opt) => (
                    <Box
                      key={opt.value}
                      onClick={() => setExperience(opt.value)}
                      sx={{
                        cursor: "pointer",
                        py: 1,
                        px: 1,
                        borderRadius: "7px",
                        textAlign: "center",
                        backgroundColor:
                          experience === opt.value ? SURFACE : "transparent",
                        boxShadow:
                          experience === opt.value
                            ? `0 1px 4px rgba(60,32,25,0.1), inset 0 0 0 1px ${LINE}`
                            : "none",
                        transition:
                          "background-color 120ms ease, box-shadow 120ms ease",
                        userSelect: "none",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: experience === opt.value ? 700 : 500,
                          color: experience === opt.value ? INK : MUTED,
                          lineHeight: 1,
                        }}
                      >
                        {opt.label}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 10.5, color: MUTED_2, mt: 0.3 }}
                      >
                        {opt.sub}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Industry */}
              <Grid item xs={12}>
                <Typography
                  component="div"
                  sx={{ fontSize: 13, fontWeight: 500, mb: 0.6 }}
                >
                  <span style={{ color: INK }}>Industry</span>{" "}
                  <span style={{ color: MUTED }}>- optional</span>
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  autoComplete="off"
                  placeholder="e.g. Fintech, SaaS, Travel"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root": {
                      ...inputSx["& .MuiOutlinedInput-root"],
                      backgroundColor: SURFACE,
                    },
                  }}
                />
              </Grid>

              {/* Job description */}
              <Grid item xs={12}>
                <Typography
                  component="div"
                  sx={{ fontSize: 13, fontWeight: 500, mb: 0.6 }}
                >
                  <span style={{ color: INK }}>Job description</span>{" "}
                  <span style={{ color: MUTED }}>- optional</span>
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Paste the job description, or describe what the role involves..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root": {
                      ...inputSx["& .MuiOutlinedInput-root"],
                      backgroundColor: SURFACE,
                    },
                  }}
                />
              </Grid>

              {/* Additional notes */}
              <Grid item xs={12}>
                <Typography
                  component="div"
                  sx={{ fontSize: 13, fontWeight: 500, mb: 0.6 }}
                >
                  <span style={{ color: INK }}>Additional notes</span>{" "}
                  <span style={{ color: MUTED }}>— optional</span>
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="e.g. Focus on leadership and conflict resolution"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root": {
                      ...inputSx["& .MuiOutlinedInput-root"],
                      backgroundColor: SURFACE,
                    },
                  }}
                />
              </Grid>

              {/* Question count slider */}
              <Grid item xs={12}>
                <Typography
                  sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 1.25 }}
                >
                  Number of questions
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Slider
                    value={questionCount}
                    onChange={(_, v) => setQuestionCount(v)}
                    min={5}
                    max={30}
                    step={1}
                    sx={{
                      flex: 1,
                      color: CORAL,
                      "& .MuiSlider-thumb": {
                        width: 18,
                        height: 18,
                        "&:hover": { boxShadow: `0 0 0 6px ${CORAL_SOFTER}` },
                      },
                      "& .MuiSlider-track": { height: 4, borderRadius: 2 },
                      "& .MuiSlider-rail": {
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: CORAL_SOFTER,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      backgroundColor: CORAL_SOFTER,
                      color: CORAL_INK,
                      borderRadius: "20px",
                      px: 1.75,
                      py: 0.6,
                      fontSize: 13,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {questionCount} qs
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3.5,
            py: 2.5,
            borderTop: `1px solid ${LINE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: PAGE_BG,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: MUTED,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <BookmarkBorderIcon sx={{ fontSize: 14 }} />
            Saved automatically as a project
          </Typography>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={isUploading}
            startIcon={
              isUploading ? null : (
                <AutoAwesomeIcon sx={{ fontSize: "14px !important" }} />
              )
            }
            sx={{ ...primaryButtonSx, py: 1.1, px: 2.5, fontSize: 13.5 }}
          >
            {isUploading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Generate"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Build your own set dialog */}
      <Dialog
        open={interviewMode === "custom"}
        onClose={() => setInterviewMode(null)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: PAGE_BG,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, position: "relative" }}>
          <IconButton
            size="small"
            onClick={() => setInterviewMode(null)}
            sx={{ position: "absolute", top: 14, right: 14, color: MUTED }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{ fontSize: 20, fontWeight: 700, color: INK, mb: 0.75, pr: 4 }}
          >
            Write the questions you want to practise
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: INK_2,
              lineHeight: 1.6,
              maxWidth: 420,
            }}
          >
            Add any number of behavioural question - one at a time.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: LINE }} />

        <DialogContent sx={{ px: 3.5, py: 3, backgroundColor: PAGE_BG }}>
          {/* Collapsible job context */}
          <Box
            sx={{
              border: `1px solid ${LINE}`,
              borderRadius: "12px",
              mb: 2.5,
              overflow: "hidden",
              backgroundColor: SURFACE,
            }}
          >
            <Box
              onClick={() => setContextOpen((v) => !v)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 1.5,
                cursor: "pointer",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <WorkIcon sx={{ fontSize: 15, color: MUTED }} />
                Job context{" "}
                <span
                  style={{
                    color: MUTED,
                    fontSize: 12,
                    fontWeight: 400,
                  }}
                >
                  (optional — improves feedback relevance)
                </span>
              </Typography>
              <ExpandMoreIcon
                sx={{
                  color: MUTED,
                  fontSize: 18,
                  transition: "transform 200ms ease",
                  transform: contextOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Box>
            {contextOpen && (
              <Box
                sx={{
                  px: 2.5,
                  pb: 2.5,
                  pt: 2,
                  borderTop: `1px solid ${LINE}`,
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Company"
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
                      placeholder="Role"
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
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      SelectProps={{ displayEmpty: true }}
                      sx={{
                        ...inputSx,
                        "& .MuiSelect-select": {
                          color: experience ? INK_2 : "rgba(60,32,25,0.35)",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <span style={{ color: "rgba(60,32,25,0.35)" }}>
                          Experience level
                        </span>
                      </MenuItem>
                      {[
                        { value: "entry", label: "Entry (0–2 yrs)" },
                        { value: "mid", label: "Mid (2–5 yrs)" },
                        { value: "senior", label: "Senior (5–9 yrs)" },
                        { value: "staff", label: "Staff+ (9+ yrs)" },
                      ].map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Industry"
                      autoComplete="off"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Job description — optional"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Additional notes — optional"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

          {/* Question textarea */}
          <TextField
            multiline
            rows={4}
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
            sx={{ ...orangeInputSx }}
          />

          {/* Hint row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
              mb: 2.5,
            }}
          >
            <Typography sx={{ fontSize: 12, color: MUTED }}>
              Press Enter to add quickly
            </Typography>
            <Button
              size="small"
              disabled={!customQuestionInput.trim()}
              onClick={handleAddCustomQuestion}
              startIcon={
                <Box
                  component="span"
                  sx={{ fontSize: 16, lineHeight: 1, fontWeight: 400 }}
                >
                  +
                </Box>
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                color: customQuestionInput.trim() ? CORAL_INK : MUTED,
                px: 1,
                minWidth: 0,
                "&:hover": { backgroundColor: CORAL_SOFTER },
              }}
            >
              Add question
            </Button>
          </Box>

          {/* Need a nudge */}
          <Box sx={{ mb: customQuestions.length > 0 ? 2.5 : 0 }}>
            <Typography
              sx={{
                fontSize: 10.5,
                color: CORAL_INK,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                mb: 1.25,
              }}
            >
              Need a nudge?
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {suggestionPrompts.map((prompt) => (
                <Box
                  key={prompt}
                  onClick={() => setCustomQuestionInput(prompt)}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: 13,
                    color: INK_2,
                    backgroundColor: SURFACE,
                    border: `1px solid ${LINE}`,
                    borderRadius: "20px",
                    px: 1.75,
                    py: 0.6,
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    "&:hover": {
                      borderColor: CORAL,
                      backgroundColor: CORAL_SOFTER,
                      color: CORAL_INK,
                    },
                    transition: "all 120ms ease",
                  }}
                >
                  <span style={{ color: CORAL, fontWeight: 600 }}>+</span>{" "}
                  {prompt}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Questions list */}
          {customQuestions.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    color: CORAL,
                    fontWeight: 700,
                    letterSpacing: 1.1,
                    textTransform: "uppercase",
                  }}
                >
                  Your Practice Set ({customQuestions.length})
                </Typography>
                <Box
                  onClick={() => setCustomQuestions([])}
                  sx={{
                    fontSize: 11.5,
                    color: MUTED,
                    cursor: "pointer",
                    "&:hover": { color: CORAL_INK },
                    transition: "color 120ms ease",
                  }}
                >
                  Clear all
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {customQuestions.map((q, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.25,
                      borderRadius: "10px",
                      border: `1px solid ${LINE}`,
                      backgroundColor: SURFACE,
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: CORAL_SOFTER,
                        color: CORAL_INK,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10.5,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: 13,
                        color: INK_2,
                        lineHeight: 1.5,
                      }}
                    >
                      {q.question}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveCustomQuestion(i)}
                      sx={{
                        color: MUTED,
                        flexShrink: 0,
                        "&:hover": {
                          color: "#e04028",
                          bgcolor: "rgba(224,64,40,0.08)",
                        },
                        transition: "all 0.15s ease",
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${LINE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: PAGE_BG,
          }}
        >
          {/* Save as project toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              cursor: "pointer",
            }}
            onClick={() => setSaveAsProject((v) => !v)}
          >
            <Checkbox
              checked={saveAsProject}
              size="small"
              disableRipple
              sx={{
                p: 0.5,
                color: MUTED,
                "&.Mui-checked": { color: CORAL },
                pointerEvents: "none",
              }}
            />
            <BookmarkBorderIcon sx={{ fontSize: 15, color: MUTED, mr: 0.5 }} />
            <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
              Save as project
            </Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            disabled={customQuestions.length === 0}
            onClick={handleStartCustomPractice}
            startIcon={
              customQuestions.length > 0 ? (
                <PlayCircleOutlineIcon sx={{ fontSize: "15px !important" }} />
              ) : null
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              py: 1.2,
              px: 2.5,
              borderRadius: "10px",
              fontSize: 13,
              backgroundColor: customQuestions.length > 0 ? CORAL : undefined,
              boxShadow:
                customQuestions.length > 0
                  ? "0px 12px 24px -12px rgba(250,115,91,0.7)"
                  : "none",
              "&:hover": {
                backgroundColor: CORAL_INK,
                boxShadow: "0px 14px 26px -12px rgba(250,115,91,0.8)",
              },
            }}
          >
            {customQuestions.length === 0
              ? "Add at least one question to start"
              : `Start practising · ${customQuestions.length} qs`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save as Project dialog */}
      <Dialog
        open={saveCustomDialogOpen}
        onClose={() => setSaveCustomDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", px: 1, py: 0.5 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, color: INK, pb: 0.5, fontSize: 16 }}
        >
          Save as Project
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: 13.5, color: INK_2, mb: 2, lineHeight: 1.6 }}
          >
            Give this question set a name so you can revisit and practice from
            it later.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Project name"
            value={customProjectName}
            onChange={(e) => setCustomProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                customProjectName.trim() &&
                !isSavingCustom
              ) {
                handleSaveCustomProject();
              }
            }}
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setSaveCustomDialogOpen(false)}
            sx={{ textTransform: "none", color: MUTED }}
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
            {isSavingCustom ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewHome;
