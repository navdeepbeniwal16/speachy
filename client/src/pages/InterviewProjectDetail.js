import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CreateIcon from "@mui/icons-material/Create";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import InterviewService from "../services/interview-service.js";
import { AppContext } from "../components/AppContext.js";

const CORAL = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK = "#C85A3E";
const PAGE_BG = "#fff4ef";
const SURFACE = "#ffffff";
const LINE = "rgba(252,150,120,0.12)";
const INK = "#2f170f";
const INK_2 = "rgba(60,32,25,0.78)";
const MUTED = "rgba(60,32,25,0.45)";
const BUTTER_SOFT = "rgba(232,200,124,0.25)";
const BUTTER_INK = "#8b6a1f";


const InterviewProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const [project, setProject] = useState(location.state?.project || null);
  const [loading, setLoading] = useState(!location.state?.project);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) return;
    const load = async () => {
      try {
        const data = await InterviewService.getProject(id);
        setProject(data);
      } catch (err) {
        setError("Could not load project. It may have been deleted or you may not have access.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStartPractice = () => {
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
        projectId: id,
      },
    });
  };

  const handlePracticeQuestion = (questionIndex) => {
    navigate(`/interview/questions/${questionIndex}`, {
      state: {
        questions: project.questions,
        questionId: questionIndex,
        companyName: project.companyName,
        jobRole: project.jobRole,
        jobDescription: project.jobDescription,
        industry: project.industry,
        requiredExperience: project.requiredExperience,
        additionalNotes: project.additionalNotes,
        mode: "project",
        projectId: id,
      },
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={32} sx={{ color: CORAL }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <Typography sx={{ color: INK_2, fontSize: 15 }}>{error || "Project not found."}</Typography>
        <Button onClick={() => navigate("/interview")} sx={{ textTransform: "none", color: CORAL, fontWeight: 600 }}>
          ← Back to Interview Home
        </Button>
      </Box>
    );
  }

  const total = project.questions?.length || 0;
  const done = project.practicedCount || 0;
  const remaining = total - done;
  const pct = total > 0 ? done / total : 0;

  const isPrepare = project.kind === "prepare" || !project.kind;

  const lastPractised = project.lastPractisedAt
    ? new Date(project.lastPractisedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";

  const statTiles = [
    { label: "Questions", value: total },
    { label: "Practised", value: done },
    { label: "Last session", value: lastPractised },
    { label: "Score", value: "—" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">

        {/* Back button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate("/projects")}
            sx={{
              textTransform: "none",
              color: MUTED,
              fontWeight: 500,
              fontSize: 13.5,
              px: 0,
              "&:hover": { color: INK, backgroundColor: "transparent" },
            }}
          >
            All projects
          </Button>
        </Box>

        {/* Header card */}
        <Box
          sx={{
            backgroundColor: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: "18px",
            p: { xs: 3, md: 4 },
            mb: 3,
            boxShadow: "0 18px 36px rgba(252,150,120,0.10)",
          }}
        >
          <Box sx={{ display: "flex", gap: { xs: 0, md: 4 }, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>

            {/* Left: main info */}
            <Box sx={{ flex: 1 }}>
              {/* Badges row */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {isPrepare ? (
                  <Chip
                    icon={<AutoAwesomeIcon sx={{ fontSize: "12px !important", color: `${CORAL_INK} !important` }} />}
                    label="Tailored"
                    size="small"
                    sx={{ backgroundColor: CORAL_SOFTER, color: CORAL_INK, fontWeight: 600, fontSize: 11.5, height: 24, "& .MuiChip-icon": { ml: "6px" } }}
                  />
                ) : (
                  <Chip
                    icon={<CreateIcon sx={{ fontSize: "12px !important", color: `${BUTTER_INK} !important` }} />}
                    label="Custom"
                    size="small"
                    sx={{ backgroundColor: BUTTER_SOFT, color: BUTTER_INK, fontWeight: 600, fontSize: 11.5, height: 24, "& .MuiChip-icon": { ml: "6px" } }}
                  />
                )}
                {project.requiredExperience && (
                  <Chip
                    label={project.requiredExperience}
                    size="small"
                    sx={{ backgroundColor: "rgba(60,32,25,0.06)", color: INK_2, fontSize: 11.5, height: 24, fontWeight: 500 }}
                  />
                )}
                {project.industry && (
                  <Chip
                    label={project.industry}
                    size="small"
                    sx={{ backgroundColor: "rgba(60,32,25,0.06)", color: INK_2, fontSize: 11.5, height: 24, fontWeight: 500 }}
                  />
                )}
              </Box>

              {/* Company / Role */}
              <Typography
                component="h1"
                sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 700, color: INK, fontFamily: "Georgia, serif", lineHeight: 1.2, mb: 0.5 }}
              >
                {project.companyName || project.name}
              </Typography>
              {project.jobRole && (
                <Typography sx={{ fontSize: 14, color: MUTED, mb: 2.5 }}>
                  {project.jobRole}
                </Typography>
              )}

              {/* Progress */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                  <Typography sx={{ fontSize: 12.5, color: INK_2, fontWeight: 500 }}>
                    {done} of {total} practised
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: CORAL, fontWeight: 700 }}>
                    {Math.round(pct * 100)}%
                  </Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, backgroundColor: CORAL_SOFTER, overflow: "hidden" }}>
                  <Box
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: CORAL,
                      width: `${pct * 100}%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </Box>
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={handleStartPractice}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1.2,
                    borderRadius: "10px",
                    backgroundColor: CORAL,
                    boxShadow: "0px 10px 20px -8px rgba(250,115,91,0.65)",
                    "&:hover": { backgroundColor: CORAL_INK, boxShadow: "0px 12px 22px -8px rgba(250,115,91,0.75)" },
                  }}
                >
                  {done > 0 ? "Continue practising" : "Start practising"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => showSnackbar("info", "Coming soon")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2.5,
                    py: 1.2,
                    borderRadius: "10px",
                    borderColor: LINE,
                    color: INK_2,
                    "&:hover": { borderColor: CORAL, color: CORAL, backgroundColor: CORAL_SOFTER },
                  }}
                >
                  + Add question
                </Button>
              </Box>
            </Box>

            {/* Right: stat tiles */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
                mt: { xs: 3, md: 0 },
                minWidth: { md: 240 },
                flexShrink: 0,
              }}
            >
              {statTiles.map((tile) => (
                <Box
                  key={tile.label}
                  sx={{
                    backgroundColor: PAGE_BG,
                    border: `1px solid ${LINE}`,
                    borderRadius: "12px",
                    p: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.25,
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: MUTED, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {tile.label}
                  </Typography>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: INK }}>
                    {tile.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Questions list card */}
        <Box
          sx={{
            backgroundColor: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: "18px",
            p: { xs: 3, md: 4 },
            boxShadow: "0 18px 36px rgba(252,150,120,0.10)",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>
              Questions
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: MUTED }}>
              {total} total · {remaining} remaining
            </Typography>
          </Box>

          {/* Question rows */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(project.questions || []).map((q, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderRadius: "12px",
                  border: `1px solid ${LINE}`,
                  backgroundColor: PAGE_BG,
                  transition: "border-color 120ms ease",
                  "&:hover": { borderColor: "rgba(250,115,91,0.35)" },
                }}
              >
                {/* Number */}
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: CORAL_SOFTER,
                    color: CORAL_INK,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11.5,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </Box>

                {/* Question text */}
                <Typography sx={{ flex: 1, fontSize: 13.5, color: INK_2, lineHeight: 1.5 }}>
                  {q.question}
                </Typography>

                {/* Tag */}
                {q.tags?.[0] && (
                  <Chip
                    label={q.tags[0]}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(60,32,25,0.06)",
                      color: MUTED,
                      fontSize: 10.5,
                      height: 20,
                      flexShrink: 0,
                      display: { xs: "none", sm: "flex" },
                    }}
                  />
                )}

                {/* Practice button */}
                <Button
                  size="small"
                  startIcon={<PlayCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                  onClick={() => handlePracticeQuestion(i)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 12,
                    color: MUTED,
                    flexShrink: 0,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "8px",
                    "&:hover": { color: CORAL, backgroundColor: CORAL_SOFTER },
                  }}
                >
                  Practice
                </Button>
              </Box>
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default InterviewProjectDetail;
