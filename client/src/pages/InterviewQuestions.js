import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CreateIcon from "@mui/icons-material/Create";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReplayIcon from "@mui/icons-material/Replay";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TuneIcon from "@mui/icons-material/Tune";
import { AppContext } from "../components/AppContext.js";
import BreadcrumbHeader from "../components/BreadcrumbHeader.js";
import InterviewService from "../services/interview-service.js";
import ProjectService from "../services/project-service.js";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const CORAL       = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK   = "#C85A3E";
const PAGE_BG     = "#fff4ef";
const SURFACE     = "#ffffff";
const LINE        = "rgba(252,150,120,0.12)";
const INK         = "#2f170f";
const INK_2       = "rgba(60,32,25,0.78)";
const MUTED       = "rgba(60,32,25,0.45)";
const MUTED_2     = "rgba(60,32,25,0.28)";
const BUTTER_SOFT = "rgba(232,200,124,0.25)";
const BUTTER_INK  = "#8b6a1f";

const DIFF = {
  easy:   { bg: "rgba(52,168,83,0.08)",   color: "#1e6e30" },
  medium: { bg: "rgba(251,188,4,0.14)",   color: "#7a5500" },
  hard:   { bg: CORAL_SOFTER,             color: CORAL_INK },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(252,150,120,0.35)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(252,150,120,0.6)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: CORAL, borderWidth: "1px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: CORAL },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const TrendBadge = ({ trend }) => {
  const map = {
    up:     { icon: <TrendingUpIcon sx={{ fontSize: 11 }} />,   label: "Improving", color: "#1e6e30", bg: "rgba(52,168,83,0.1)"  },
    stable: { icon: <TrendingFlatIcon sx={{ fontSize: 11 }} />, label: "Stable",    color: MUTED,     bg: "rgba(60,32,25,0.06)"  },
    down:   { icon: <TrendingDownIcon sx={{ fontSize: 11 }} />, label: "Declining", color: CORAL_INK, bg: CORAL_SOFTER            },
  };
  const cfg = map[trend] || map.stable;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, backgroundColor: cfg.bg, color: cfg.color, borderRadius: "20px", px: 0.9, py: 0.2, fontSize: 10, fontWeight: 600 }}>
      {cfg.icon}
      {cfg.label}
    </Box>
  );
};

const ScoreTile = ({ label, avg, trend, noData }) => (
  <Box sx={{ backgroundColor: PAGE_BG, border: `1px solid ${LINE}`, borderRadius: "12px", p: "14px 16px", display: "flex", flexDirection: "column", gap: 1, minWidth: 100 }}>
    <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>
      {label}
    </Typography>
    {noData || avg == null ? (
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: MUTED_2 }}>—</Typography>
    ) : (
      <>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: INK, lineHeight: 1 }}>
            {Number(avg).toFixed(1)}
          </Typography>
          <Typography sx={{ fontSize: 11, color: MUTED }}>/ 10</Typography>
        </Box>
        {trend && <TrendBadge trend={trend} />}
      </>
    )}
  </Box>
);

const FilterPill = ({ label, active, onClick, color }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: "pointer",
      px: 1.5, py: 0.45,
      borderRadius: "20px",
      fontSize: 12, fontWeight: 600,
      userSelect: "none",
      transition: "all 120ms ease",
      backgroundColor: active ? (color?.bg || CORAL_SOFTER) : "transparent",
      color: active ? (color?.text || CORAL_INK) : MUTED,
      border: `1px solid ${active ? "transparent" : LINE}`,
      "&:hover": { backgroundColor: color?.bg || CORAL_SOFTER, color: color?.text || CORAL_INK },
    }}
  >
    {label}
  </Box>
);

const TagPill = ({ label }) => (
  <Box sx={{ px: 1.1, py: 0.2, borderRadius: "20px", fontSize: 10.5, fontWeight: 500, color: MUTED, backgroundColor: "rgba(60,32,25,0.05)", whiteSpace: "nowrap" }}>
    {label}
  </Box>
);

const QuestionRow = ({ index, q, onPractice }) => {
  const diff = (q.difficulty || q.difficultyLevel || "medium").toLowerCase();
  const diffStyle = DIFF[diff] || DIFF.medium;
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: 2.5,
        px: 2.5, py: 2.25,
        borderRadius: "14px",
        border: `1px solid ${LINE}`,
        backgroundColor: q.attempted ? SURFACE : PAGE_BG,
        transition: "border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": { borderColor: "rgba(250,115,91,0.35)", boxShadow: "0 4px 20px rgba(252,150,120,0.1)" },
      }}
    >
      <Box sx={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 700, backgroundColor: q.attempted ? CORAL : CORAL_SOFTER, color: q.attempted ? "#fff" : CORAL_INK }}>
        {index}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography sx={{ fontSize: 14, color: INK_2, lineHeight: 1.55, mb: 1 }}>
          {q.question}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mb: q.attempted && q.scores ? 1.5 : 0 }}>
          {(q.tags || []).map((t) => <TagPill key={t} label={t} />)}
        </Box>
        {q.attempted && q.scores && (
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
            {["relevance", "structure", "fluency"].map((k, i) => {
              const val = q.scores[k];
              const scoreColor =
                val >= 8   ? { text: "#1e6e30", bg: "rgba(52,168,83,0.10)" }
                : val >= 6 ? { text: "#7a5500", bg: "rgba(251,188,4,0.12)" }
                :             { text: CORAL_INK, bg: CORAL_SOFTER };
              return (
                <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.7, pr: 2, mr: i < 2 ? 2 : 0, borderRight: i < 2 ? `1px solid ${LINE}` : "none" }}>
                  <Typography sx={{ fontSize: 11.5, color: MUTED, textTransform: "capitalize" }}>{k}</Typography>
                  <Box sx={{ backgroundColor: scoreColor.bg, color: scoreColor.text, borderRadius: "6px", px: 0.85, py: 0.25, fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>
                    {val?.toFixed(1)}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        <Box sx={{ px: 1.25, py: 0.4, borderRadius: "20px", fontSize: 11.5, fontWeight: 600, textTransform: "capitalize", backgroundColor: diffStyle.bg, color: diffStyle.color, display: { xs: "none", sm: "block" } }}>
          {diff}
        </Box>
        <Button
          size="small"
          variant={q.attempted ? "text" : "outlined"}
          startIcon={q.attempted ? <ReplayIcon sx={{ fontSize: "13px !important" }} /> : <PlayCircleOutlineIcon sx={{ fontSize: "13px !important" }} />}
          onClick={() => onPractice(index - 1)}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: 12.5,
            px: 1.75, py: 0.7, borderRadius: "9px",
            ...(q.attempted
              ? { color: MUTED, "&:hover": { color: CORAL, backgroundColor: CORAL_SOFTER } }
              : { borderColor: "rgba(252,150,120,0.4)", color: CORAL, "&:hover": { borderColor: CORAL, backgroundColor: CORAL_SOFTER } }),
          }}
        >
          {q.attempted ? "Retry" : "Practice"}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const InterviewQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const {
    questions: initialQuestions = [],
    project,
    collection,
    companyName,
    jobRole,
    jobDescription,
    industry,
    requiredExperience,
    additionalNotes,
    mode,
  } = location.state || {};

  const isProjectMode    = !!project;
  const isCollectionMode = mode === "collection";

  const [questions, setQuestions] = useState(initialQuestions);
  const [activeDiffs, setActiveDiffs] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState(
    (companyName && jobRole) ? `${companyName} — ${jobRole}` : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // Collection bookmark state
  const [savedProjectId, setSavedProjectId] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [unsaveDialogOpen, setUnsaveDialogOpen] = useState(false);

  useEffect(() => {
    if (!isCollectionMode || !collection) return;
    ProjectService.getAll()
      .then((projects) => {
        const match = projects.find((p) => p.sourceCollectionId === collection.id);
        setSavedProjectId(match ? match.id : null);
      })
      .catch(() => {});
  }, [isCollectionMode, collection?.id]);

  // Derive unique tags from the question set
  const allTags = useMemo(() => {
    const tagSet = new Set();
    questions.forEach((q) => (q.tags || []).forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [questions]);

  const toggleDiff = (d) =>
    setActiveDiffs((prev) => {
      const next = prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d];
      return next.length === 3 ? [] : next; // all selected = same as none = reset to show all
    });

  const toggleTag = (t) =>
    setActiveTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const filtered = questions.filter((q) => {
    const diff = (q.difficulty || q.difficultyLevel || "medium").toLowerCase();
    const diffOk = activeDiffs.length === 0 || activeDiffs.includes(diff);
    const tagOk  = activeTags.length === 0 || (q.tags || []).some((t) => activeTags.includes(t));
    return diffOk && tagOk;
  });

  const attempted = questions.filter((q) => q.attempted).length;
  const remaining = questions.length - attempted;
  const pct = questions.length > 0 ? (attempted / questions.length) * 100 : 0;

  const contextCompanyName = isProjectMode ? project.companyName : companyName;
  const contextJobRole     = isProjectMode ? project.jobRole     : jobRole;

  const navigateToPractice = (questionIndex) => {
    navigate(`/interview/questions/${questionIndex}`, {
      state: {
        questions,
        questionId: questionIndex,
        companyName: contextCompanyName,
        jobRole: contextJobRole,
        jobDescription: isProjectMode ? project.jobDescription : jobDescription,
        industry: isProjectMode ? project.industry : industry,
        requiredExperience: isProjectMode ? project.requiredExperience : requiredExperience,
        additionalNotes: isProjectMode ? project.additionalNotes : additionalNotes,
        mode: isProjectMode ? "project" : mode,
        projectId: project?.id,
        collection: isCollectionMode ? collection : undefined,
        from: location.state?.from,
      },
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await InterviewService.fetchBehaviouralQuestions(
        companyName, jobRole, jobDescription, industry, requiredExperience, additionalNotes
      );
      setQuestions(refreshed);
    } catch (error) {
      showSnackbar("error", error?.userMessage || "Unable to refresh questions right now.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) return;
    setIsSaving(true);
    try {
      await ProjectService.save(projectName.trim(), questions, {
        type: "interview",
        kind: "tailored",
        companyName, jobRole, jobDescription, industry, requiredExperience, additionalNotes,
      });
      showSnackbar("success", "Project saved!");
      setSaveDialogOpen(false);
    } catch {
      showSnackbar("error", "Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCollection = async () => {
    if (bookmarkLoading || !collection) return;
    setBookmarkLoading(true);
    try {
      const result = await ProjectService.save(collection.name, questions, {
        type: "interview",
        kind: "collection",
        sourceCollectionId: collection.id,
        author: collection.author || null,
        collectionLastUpdated: collection.lastUpdated || null,
      });
      setSavedProjectId(result.projectId);
      showSnackbar("success", "Collection saved to your projects.");
    } catch {
      showSnackbar("error", "Could not save collection. Please try again.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleUnsaveCollection = async () => {
    if (!savedProjectId) return;
    setBookmarkLoading(true);
    setUnsaveDialogOpen(false);
    try {
      await ProjectService.delete(savedProjectId);
      setSavedProjectId(null);
      showSnackbar("success", "Collection removed from your projects.");
    } catch {
      showSnackbar("error", "Could not remove collection. Please try again.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Score tile helpers for project mode
  const scoreKeys = ["relevance", "structure", "fluency"];
  const trendMap = { improving: "up", stable: "stable", declining: "down" };
  const getScore = (key) => project?.averageScores?.[key] ?? null;
  const getTrend = (key) => {
    const t = project?.scoreTrends?.[key];
    return t ? (trendMap[t] || t) : null;
  };
  const noScoreData = !project?.averageScores;

  // Kind badge config
  const KIND_BADGE = {
    tailored: { label: "Tailored", bg: CORAL_SOFTER,  color: CORAL_INK,  icon: <AutoAwesomeIcon sx={{ fontSize: 10 }} /> },
    custom:   { label: "Custom",   bg: BUTTER_SOFT,   color: BUTTER_INK, icon: <CreateIcon sx={{ fontSize: 10 }} /> },
  };
  const kindBadge = isProjectMode ? (KIND_BADGE[project.kind] || null) : null;

  const updatedDate = isProjectMode && project.createdAt
    ? new Date(project.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md">

        {/* ── Breadcrumb nav ────────────────────────────────────────────────── */}
        <BreadcrumbHeader
          parentLabel={
            isProjectMode   ? "Projects"
            : isCollectionMode ? (location.state?.from === "projects" ? "Projects" : "Collections")
            : "Interview Hub"
          }
          parentPath={
            isProjectMode   ? "/projects"
            : isCollectionMode ? (location.state?.from === "projects" ? "/projects" : "/interview/collections")
            : "/interview"
          }
          onBack={isCollectionMode ? () => navigate(location.state?.from === "projects" ? "/projects" : "/interview/collections") : undefined}
          currentLabel={
            isProjectMode
              ? (project.companyName || project.name)
              : isCollectionMode
                ? collection.name
                : "Question Set"
          }
          right={
            isProjectMode ? (
              <Typography sx={{ fontSize: 12.5, color: MUTED, fontWeight: 500 }}>
                {questions.length} questions
              </Typography>
            ) : mode === "ai" ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={isRefreshing ? <CircularProgress size={11} sx={{ color: CORAL }} /> : <RefreshIcon sx={{ fontSize: "14px !important" }} />}
                  disabled={isRefreshing}
                  onClick={handleRefresh}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, borderColor: "rgba(252,150,120,0.4)", color: CORAL, borderRadius: "9px", px: 1.5, "&:hover": { borderColor: CORAL, backgroundColor: CORAL_SOFTER } }}
                >
                  {isRefreshing ? "Refreshing…" : "Refresh"}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<BookmarkBorderIcon sx={{ fontSize: "14px !important" }} />}
                  onClick={() => setSaveDialogOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, borderRadius: "9px", px: 1.5, backgroundColor: CORAL, boxShadow: "0px 6px 16px -6px rgba(250,115,91,0.6)", "&:hover": { backgroundColor: CORAL_INK } }}
                >
                  Save
                </Button>
              </Box>
            ) : null
          }
        />

        {/* ── Project mode header card ──────────────────────────────────────── */}
        {isProjectMode && (
          <Box sx={{ backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "20px", p: { xs: 3, md: "32px 36px" }, mb: 3, boxShadow: "0 18px 36px rgba(252,150,120,0.10)" }}>
            <Box sx={{ display: "flex", gap: { xs: 0, md: 5 }, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>

              {/* Left — identity + progress */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Kind badge */}
                {kindBadge && (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, backgroundColor: kindBadge.bg, color: kindBadge.color, borderRadius: "20px", px: 1.1, py: 0.3, fontSize: 11, fontWeight: 700, mb: 2 }}>
                    {kindBadge.icon}
                    {kindBadge.label}
                  </Box>
                )}

                {/* Title + edit button */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography component="h1" sx={{ fontFamily: "Georgia, serif", fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: INK, lineHeight: 1.15, mr: 2 }}>
                    {project.companyName || project.name}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                    sx={{ textTransform: "none", fontWeight: 600, fontSize: 12.5, color: MUTED, borderRadius: "9px", border: `1px solid ${LINE}`, px: 1.5, py: 0.6, flexShrink: 0, "&:hover": { borderColor: CORAL, color: CORAL, backgroundColor: CORAL_SOFTER } }}
                  >
                    Edit
                  </Button>
                </Box>

                {/* Subtitle + experience */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  {project.jobRole && (
                    <Typography sx={{ fontSize: 14, color: MUTED }}>{project.jobRole}</Typography>
                  )}
                  {project.requiredExperience && (
                    <Box sx={{ backgroundColor: "rgba(60,32,25,0.06)", color: INK_2, borderRadius: "20px", px: 1.1, py: 0.2, fontSize: 11, fontWeight: 500 }}>
                      {project.requiredExperience}
                    </Box>
                  )}
                </Box>

                {/* Meta row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Typography sx={{ fontSize: 12, color: MUTED_2 }}>Your project</Typography>
                  {updatedDate && (
                    <>
                      <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: MUTED_2 }} />
                      <Typography sx={{ fontSize: 12, color: MUTED_2 }}>Updated {updatedDate}</Typography>
                    </>
                  )}
                </Box>

                {/* Progress bar */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography sx={{ fontSize: 12.5, color: INK_2, fontWeight: 500 }}>
                      {attempted} of {questions.length} attempted
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: CORAL, fontWeight: 700 }}>
                      {Math.round(pct)}%
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, backgroundColor: CORAL_SOFTER, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", borderRadius: 3, backgroundColor: CORAL, width: `${pct}%`, transition: "width 0.5s ease" }} />
                  </Box>
                </Box>
              </Box>

              {/* Right — score tiles */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25, mt: { xs: 3.5, md: 0 }, flexShrink: 0, minWidth: { md: 360 } }}>
                {scoreKeys.map((k) => (
                  <ScoreTile
                    key={k}
                    label={k.charAt(0).toUpperCase() + k.slice(1)}
                    avg={getScore(k)}
                    trend={getTrend(k)}
                    noData={noScoreData}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Collection mode header card ──────────────────────────────────── */}
        {isCollectionMode && collection && (
          <Box sx={{ backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "20px", p: { xs: 3, md: "32px 36px" }, mb: 3, boxShadow: "0 18px 36px rgba(252,150,120,0.10)" }}>
            <Box sx={{ display: "flex", gap: { xs: 0, md: 5 }, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>

              {/* Left — identity + progress */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Curated badge + bookmark */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, backgroundColor: CORAL_SOFTER, color: CORAL_INK, borderRadius: "20px", px: 1.1, py: 0.3, fontSize: 11, fontWeight: 700 }}>
                    <AutoStoriesIcon sx={{ fontSize: 10 }} />
                    Curated by Speachy
                  </Box>
                  <IconButton
                    size="small"
                    disabled={bookmarkLoading}
                    onClick={() => savedProjectId ? setUnsaveDialogOpen(true) : handleSaveCollection()}
                    sx={{ color: savedProjectId ? CORAL : MUTED, "&:hover": { color: CORAL, backgroundColor: CORAL_SOFTER } }}
                  >
                    {bookmarkLoading
                      ? <CircularProgress size={16} sx={{ color: CORAL }} />
                      : savedProjectId ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />
                    }
                  </IconButton>
                </Box>

                {/* Title */}
                <Typography component="h1" sx={{ fontFamily: "Georgia, serif", fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: INK, lineHeight: 1.15, mb: 0.75 }}>
                  {collection.name}
                </Typography>

                {/* Description */}
                {collection.description && (
                  <Typography sx={{ fontSize: 13.5, color: INK_2, lineHeight: 1.65, mb: 1 }}>
                    {collection.description}
                  </Typography>
                )}

                {/* Meta row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  {collection.author && (
                    <Typography sx={{ fontSize: 12, color: MUTED_2 }}>By {collection.author}</Typography>
                  )}
                  {collection.lastUpdated && (
                    <>
                      <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: MUTED_2 }} />
                      <Typography sx={{ fontSize: 12, color: MUTED_2 }}>
                        Updated {new Date(collection.lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Progress bar */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography sx={{ fontSize: 12.5, color: INK_2, fontWeight: 500 }}>
                      {attempted} of {questions.length} attempted
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: CORAL, fontWeight: 700 }}>
                      {Math.round(pct)}%
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, backgroundColor: CORAL_SOFTER, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", borderRadius: 3, backgroundColor: CORAL, width: `${pct}%`, transition: "width 0.5s ease" }} />
                  </Box>
                </Box>
              </Box>

              {/* Right — score tiles (no data until attempt tracking is added in US4) */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25, mt: { xs: 3.5, md: 0 }, flexShrink: 0, minWidth: { md: 360 } }}>
                {scoreKeys.map((k) => (
                  <ScoreTile key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} avg={null} trend={null} noData />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Session mode compact context strip ───────────────────────────── */}
        {!isProjectMode && (contextCompanyName || contextJobRole) && (
          <Box sx={{ mb: 3 }}>
            <Typography component="h1" sx={{ fontFamily: "Georgia, serif", fontSize: { xs: 20, md: 24 }, fontWeight: 500, color: INK, mb: 0.5 }}>
              {questions.length} questions, ready to practise.
            </Typography>
            {(contextCompanyName || contextJobRole) && (
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, backgroundColor: CORAL_SOFTER, color: CORAL_INK, borderRadius: "20px", px: 1.5, py: 0.4, fontSize: 12, fontWeight: 600 }}>
                {[contextCompanyName, contextJobRole].filter(Boolean).join(" · ")}
              </Box>
            )}
          </Box>
        )}

        {/* ── Filter strip — single scrollable row ─────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2.5, minWidth: 0 }}>

          {/* Filter icon */}
          <TuneIcon sx={{ fontSize: 16, color: MUTED, flexShrink: 0 }} />
          <Box sx={{ width: "1px", height: 16, backgroundColor: LINE, flexShrink: 0 }} />

          {/* Difficulty pills — never shrink */}
          <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
            {["Easy", "Medium", "Hard"].map((label) => {
              const d = label.toLowerCase();
              const active = activeDiffs.includes(d);
              return (
                <Box
                  key={d}
                  onClick={() => toggleDiff(d)}
                  sx={{
                    cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 0.5,
                    px: 1.5, py: 0.45,
                    borderRadius: "20px",
                    fontSize: 12, fontWeight: 600,
                    whiteSpace: "nowrap", userSelect: "none",
                    transition: "all 120ms ease",
                    border: `1.5px solid ${active ? "transparent" : "rgba(60,32,25,0.14)"}`,
                    backgroundColor: active ? DIFF[d].bg : "transparent",
                    color: active ? DIFF[d].color : MUTED,
                    "&:hover": { backgroundColor: DIFF[d].bg, color: DIFF[d].color, border: "1.5px solid transparent" },
                  }}
                >
                  {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: DIFF[d].color, flexShrink: 0 }} />}
                  {label}
                </Box>
              );
            })}
          </Box>

          {/* Separator between difficulty and topics */}
          {allTags.length > 0 && (
            <Box sx={{ width: "1px", height: 16, backgroundColor: LINE, flexShrink: 0 }} />
          )}

          {/* Topic pills — scrollable, fills remaining space */}
          {allTags.length > 0 && (
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                flex: 1, minWidth: 0,
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {allTags.map((t) => {
                const active = activeTags.includes(t);
                return (
                  <Box
                    key={t}
                    onClick={() => toggleTag(t)}
                    sx={{
                      cursor: "pointer", flexShrink: 0,
                      px: 1.5, py: 0.45,
                      borderRadius: "20px",
                      fontSize: 12, fontWeight: active ? 600 : 400,
                      whiteSpace: "nowrap", userSelect: "none",
                      transition: "all 120ms ease",
                      border: `1.5px solid ${active ? "transparent" : "rgba(60,32,25,0.14)"}`,
                      backgroundColor: active ? CORAL_SOFTER : "transparent",
                      color: active ? CORAL_INK : MUTED,
                      "&:hover": { backgroundColor: CORAL_SOFTER, color: CORAL_INK, border: "1.5px solid transparent" },
                    }}
                  >
                    {active && <Box component="span" sx={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", backgroundColor: CORAL_INK, mr: 0.75, verticalAlign: "middle", mb: "1px" }} />}
                    {t}
                  </Box>
                );
              })}
              {activeTags.length > 0 && (
                <Box
                  onClick={() => setActiveTags([])}
                  sx={{ cursor: "pointer", flexShrink: 0, fontSize: 11.5, fontWeight: 500, color: MUTED_2, px: 1, py: 0.3, whiteSpace: "nowrap", userSelect: "none", "&:hover": { color: MUTED }, transition: "color 120ms ease" }}
                >
                  clear ×
                </Box>
              )}
            </Box>
          )}

          {/* Question count — always pinned right */}
          <Typography sx={{ fontSize: 12, color: MUTED_2, fontWeight: 500, flexShrink: 0, ml: allTags.length > 0 ? 0 : "auto" }}>
            {filtered.length === questions.length
              ? `${questions.length} questions`
              : `${filtered.length} of ${questions.length}`}
          </Typography>
        </Box>

        {/* ── Questions section ─────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "20px", p: { xs: 3, md: "28px 32px" }, boxShadow: "0 18px 36px rgba(252,150,120,0.08)" }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>Questions</Typography>
          </Box>

          {filtered.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {filtered.map((q, i) => (
                <QuestionRow
                  key={q.id || i}
                  index={i + 1}
                  q={q}
                  onPractice={navigateToPractice}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: "center", color: MUTED, fontSize: 14 }}>
              No questions match the selected filters.
            </Box>
          )}
        </Box>

      </Container>

      {/* ── Unsave collection dialog ─────────────────────────────────────── */}
      <Dialog
        open={unsaveDialogOpen}
        onClose={() => setUnsaveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", backgroundColor: PAGE_BG, px: 1, py: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: INK, pb: 0.5, fontSize: 16 }}>
          Remove collection?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: INK_2, lineHeight: 1.6 }}>
            This collection will be removed from your projects. You can always save it again.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setUnsaveDialogOpen(false)} sx={{ textTransform: "none", color: MUTED }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUnsaveCollection}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "9px", px: 2.5, py: 1, backgroundColor: CORAL, boxShadow: "0px 8px 20px -8px rgba(250,115,91,0.6)", "&:hover": { backgroundColor: CORAL_INK } }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Save as Project dialog ────────────────────────────────────────── */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => !isSaving && setSaveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", backgroundColor: PAGE_BG, px: 1, py: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: INK, pb: 0.5, fontSize: 16 }}>
          Save as Project
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: INK_2, mb: 2, lineHeight: 1.6 }}>
            Give this question set a name so you can revisit it later.
          </Typography>
          <TextField
            autoFocus fullWidth size="small" label="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && projectName.trim()) handleSaveProject(); }}
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={isSaving} sx={{ textTransform: "none", color: MUTED }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!projectName.trim() || isSaving}
            onClick={handleSaveProject}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "9px", px: 2.5, py: 1, backgroundColor: CORAL, boxShadow: "0px 8px 20px -8px rgba(250,115,91,0.6)", "&:hover": { backgroundColor: CORAL_INK } }}
          >
            {isSaving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewQuestions;
