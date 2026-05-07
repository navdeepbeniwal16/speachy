import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

// ─── Design tokens ────────────────────────────────────────────────────────────
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

// ─── Dummy data ───────────────────────────────────────────────────────────────
const PROJECT_META = {
  mode:        "project",
  name:        "Vanguard",
  subtitle:    "Operations Manager",
  kind:        "tailored",
  experience:  "mid",
  owner:       "You",
  updatedAt:   "Apr 19, 2026",
  totalQs:     15,
  attemptedQs: 6,
  scores: {
    relevance:  { avg: 7.8, trend: "up",     last5: [6.2, 6.8, 7.4, 7.8, 8.3] },
    structure:  { avg: 7.1, trend: "up",     last5: [5.9, 6.4, 6.9, 7.1, 7.6] },
    fluency:    { avg: 6.9, trend: "stable", last5: [6.5, 6.8, 7.0, 6.9, 7.1] },
  },
};

const COLLECTION_META = {
  mode:        "collection",
  name:        "Behavioural Essentials",
  subtitle:    "The must-know questions for any behavioural round.",
  kind:        "collection",
  experience:  null,
  owner:       "Speachy",
  updatedAt:   "Apr 2026",
  totalQs:     15,
  attemptedQs: 4,
  scores: {
    relevance:  { avg: 7.4, trend: "up",   last5: [6.0, 6.5, 7.0, 7.4, 7.9] },
    structure:  { avg: 6.5, trend: "up",   last5: [5.2, 5.8, 6.2, 6.5, 7.0] },
    fluency:    { avg: 6.1, trend: "down", last5: [7.0, 6.8, 6.4, 6.1, 5.9] },
  },
};

const ALL_QUESTIONS = [
  {
    id: 1,
    question: "Tell me about a time you led a team through a difficult situation.",
    tags: ["leadership", "teamwork"],
    difficulty: "hard",
    attempted: true,
    scores: { relevance: 7.8, structure: 8.1, fluency: 7.2 },
  },
  {
    id: 2,
    question: "Describe a situation where you had to adapt quickly to unexpected change.",
    tags: ["adaptability"],
    difficulty: "medium",
    attempted: true,
    scores: { relevance: 8.2, structure: 7.4, fluency: 8.0 },
  },
  {
    id: 3,
    question: "Give an example of a time you resolved a conflict within your team.",
    tags: ["communication", "teamwork"],
    difficulty: "medium",
    attempted: false,
  },
  {
    id: 4,
    question: "What's your approach to managing competing priorities under pressure?",
    tags: ["leadership", "problem-solving"],
    difficulty: "hard",
    attempted: false,
  },
  {
    id: 5,
    question: "Tell me about a time you made a significant mistake and how you handled it.",
    tags: ["general"],
    difficulty: "easy",
    attempted: true,
    scores: { relevance: 9.0, structure: 8.5, fluency: 8.8 },
  },
  {
    id: 6,
    question: "If you had to give a TED talk tomorrow, what would it be about?",
    tags: ["curveball"],
    difficulty: "hard",
    attempted: false,
  },
  {
    id: 7,
    question: "Describe a project where you had to collaborate with cross-functional stakeholders.",
    tags: ["teamwork", "communication"],
    difficulty: "medium",
    attempted: false,
  },
  {
    id: 8,
    question: "How do you handle a situation where you disagree with your manager's decision?",
    tags: ["communication", "leadership"],
    difficulty: "hard",
    attempted: true,
    scores: { relevance: 6.5, structure: 7.0, fluency: 6.8 },
  },
  {
    id: 9,
    question: "Walk me through a decision you had to make with incomplete information.",
    tags: ["problem-solving"],
    difficulty: "hard",
    attempted: false,
  },
  {
    id: 10,
    question: "Describe your ideal work environment and how you contribute to it.",
    tags: ["general"],
    difficulty: "easy",
    attempted: true,
    scores: { relevance: 7.2, structure: 7.5, fluency: 7.0 },
  },
  {
    id: 11,
    question: "What would you do if you discovered a colleague was acting unethically?",
    tags: ["curveball", "communication"],
    difficulty: "hard",
    attempted: false,
  },
  {
    id: 12,
    question: "Tell me about a time you had to persuade someone who was resistant to your idea.",
    tags: ["communication", "leadership"],
    difficulty: "medium",
    attempted: true,
    scores: { relevance: 7.2, structure: 7.8, fluency: 7.5 },
  },
  {
    id: 13,
    question: "How do you ensure your team stays motivated during a long or difficult project?",
    tags: ["leadership", "teamwork"],
    difficulty: "hard",
    attempted: false,
  },
  {
    id: 14,
    question: "Give an example of a time you identified a process improvement and drove it forward.",
    tags: ["problem-solving", "leadership"],
    difficulty: "medium",
    attempted: false,
  },
  {
    id: 15,
    question: "What's the biggest professional risk you've ever taken, and how did it play out?",
    tags: ["curveball", "general"],
    difficulty: "hard",
    attempted: false,
  },
];

const ALL_TAGS = ["leadership", "teamwork", "communication", "problem-solving", "adaptability", "general", "curveball"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Sparkline = ({ data, color = CORAL, width = 56, height = 22 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - 2 - ((v - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(" ");
  const lastX = width;
  const lastY = height - 2 - ((data[data.length - 1] - min) / range) * (height - 4);
  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle cx={lastX} cy={lastY} r="2.8" fill={color} />
    </svg>
  );
};

const TrendBadge = ({ trend }) => {
  const map = {
    up:     { icon: <TrendingUpIcon sx={{ fontSize: 11 }} />, label: "Improving", color: "#1e6e30", bg: "rgba(52,168,83,0.1)" },
    stable: { icon: <TrendingFlatIcon sx={{ fontSize: 11 }} />, label: "Stable", color: MUTED, bg: "rgba(60,32,25,0.06)" },
    down:   { icon: <TrendingDownIcon sx={{ fontSize: 11 }} />, label: "Declining", color: CORAL_INK, bg: CORAL_SOFTER },
  };
  const cfg = map[trend] || map.stable;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderRadius: "20px",
        px: 0.9,
        py: 0.2,
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
};

const ScoreTile = ({ label, data, noData = false }) => (
  <Box
    sx={{
      backgroundColor: PAGE_BG,
      border: `1px solid ${LINE}`,
      borderRadius: "12px",
      p: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 1,
      minWidth: 130,
    }}
  >
    <Typography
      sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}
    >
      {label}
    </Typography>
    {noData ? (
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: MUTED_2 }}>—</Typography>
    ) : (
      <>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: INK, lineHeight: 1 }}>
            {data.avg.toFixed(1)}
          </Typography>
          <Typography sx={{ fontSize: 11, color: MUTED }}>/ 10</Typography>
        </Box>
        <TrendBadge trend={data.trend} />
      </>
    )}
  </Box>
);

const FilterPill = ({ label, active, onClick, color }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: "pointer",
      px: 1.5,
      py: 0.45,
      borderRadius: "20px",
      fontSize: 12,
      fontWeight: 600,
      userSelect: "none",
      transition: "all 120ms ease",
      backgroundColor: active ? (color?.bg || CORAL_SOFTER) : "transparent",
      color: active ? (color?.text || CORAL_INK) : MUTED,
      border: `1px solid ${active ? "transparent" : LINE}`,
      "&:hover": {
        backgroundColor: color?.bg || CORAL_SOFTER,
        color: color?.text || CORAL_INK,
      },
    }}
  >
    {label}
  </Box>
);

const TagPill = ({ label }) => (
  <Box
    sx={{
      px: 1.1,
      py: 0.2,
      borderRadius: "20px",
      fontSize: 10.5,
      fontWeight: 500,
      color: MUTED,
      backgroundColor: "rgba(60,32,25,0.05)",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </Box>
);

const QuestionRow = ({ index, q, onPractice }) => {
  const diffStyle = DIFF[q.difficulty] || DIFF.medium;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        px: 2.5,
        py: 2.25,
        borderRadius: "14px",
        border: `1px solid ${LINE}`,
        backgroundColor: q.attempted ? SURFACE : PAGE_BG,
        transition: "border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          borderColor: "rgba(250,115,91,0.35)",
          boxShadow: "0 4px 20px rgba(252,150,120,0.1)",
        },
      }}
    >
      {/* Number — pinned to top, slight offset to optically align with question text */}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11.5,
          fontWeight: 700,
          backgroundColor: q.attempted ? CORAL : CORAL_SOFTER,
          color: q.attempted ? "#fff" : CORAL_INK,
        }}
      >
        {index}
      </Box>

      {/* Question + tags + scores */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography
          sx={{
            fontSize: 14,
            color: INK_2,
            lineHeight: 1.55,
            mb: 1,
          }}
        >
          {q.question}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mb: q.attempted && q.scores ? 1.5 : 0 }}>
          {q.tags.map((t) => (
            <TagPill key={t} label={t} />
          ))}
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
                <Box
                  key={k}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    pr: 2,
                    mr: i < 2 ? 2 : 0,
                    borderRight: i < 2 ? `1px solid ${LINE}` : "none",
                  }}
                >
                  <Typography sx={{ fontSize: 11.5, color: MUTED, textTransform: "capitalize" }}>
                    {k}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: scoreColor.bg,
                      color: scoreColor.text,
                      borderRadius: "6px",
                      px: 0.85,
                      py: 0.25,
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1.5,
                    }}
                  >
                    {val?.toFixed(1)}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Right side — difficulty + action */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        {/* Difficulty badge */}
        <Box
          sx={{
            px: 1.25,
            py: 0.4,
            borderRadius: "20px",
            fontSize: 11.5,
            fontWeight: 600,
            textTransform: "capitalize",
            backgroundColor: diffStyle.bg,
            color: diffStyle.color,
            display: { xs: "none", sm: "block" },
          }}
        >
          {q.difficulty}
        </Box>

        {/* Practice / Retry button */}
        <Button
          size="small"
          variant={q.attempted ? "text" : "outlined"}
          startIcon={
            q.attempted
              ? <ReplayIcon sx={{ fontSize: "13px !important" }} />
              : <PlayCircleOutlineIcon sx={{ fontSize: "13px !important" }} />
          }
          onClick={() => onPractice(q.id)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 12.5,
            px: 1.75,
            py: 0.7,
            borderRadius: "9px",
            ...(q.attempted
              ? { color: MUTED, "&:hover": { color: CORAL, backgroundColor: CORAL_SOFTER } }
              : {
                  borderColor: "rgba(252,150,120,0.4)",
                  color: CORAL,
                  "&:hover": { borderColor: CORAL, backgroundColor: CORAL_SOFTER },
                }),
          }}
        >
          {q.attempted ? "Retry" : "Practice"}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const QuestionsListPrototype = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("project"); // "project" | "collection"
  const [starred, setStarred] = useState(false);
  const [activeDiffs, setActiveDiffs] = useState([]);
  const [activeTags, setActiveTags] = useState([]);

  const meta = viewMode === "project" ? PROJECT_META : COLLECTION_META;
  const noScoreData = meta.attemptedQs === 0;

  const toggleDiff = (d) =>
    setActiveDiffs((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const toggleTag = (t) =>
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const filtered = ALL_QUESTIONS.filter((q) => {
    const diffOk = activeDiffs.length === 0 || activeDiffs.includes(q.difficulty);
    const tagOk  = activeTags.length === 0 || q.tags.some((t) => activeTags.includes(t));
    return diffOk && tagOk;
  });

  const remaining = ALL_QUESTIONS.filter((q) => !q.attempted).length;
  const pct = (meta.attemptedQs / meta.totalQs) * 100;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">

        {/* ── Top nav ───────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 48px",
            alignItems: "center",
            mb: 3,
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: INK, borderRadius: 2, width: 40, height: 40 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
            {/* Mode toggle — prototype only */}
            <Box
              sx={{
                display: "flex",
                backgroundColor: "rgba(60,32,25,0.06)",
                borderRadius: "10px",
                p: "3px",
              }}
            >
              {[
                { id: "project",    label: "Project view" },
                { id: "collection", label: "Collection view" },
              ].map((opt) => (
                <Box
                  key={opt.id}
                  onClick={() => setViewMode(opt.id)}
                  sx={{
                    cursor: "pointer",
                    px: 1.75,
                    py: 0.6,
                    borderRadius: "7px",
                    fontSize: 12,
                    fontWeight: viewMode === opt.id ? 700 : 500,
                    color: viewMode === opt.id ? INK : MUTED,
                    backgroundColor:
                      viewMode === opt.id ? SURFACE : "transparent",
                    boxShadow:
                      viewMode === opt.id
                        ? `0 1px 4px rgba(60,32,25,0.1), inset 0 0 0 1px ${LINE}`
                        : "none",
                    transition: "all 120ms ease",
                    userSelect: "none",
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Box>
          </Box>
          <Box />
        </Box>

        {/* ── Header card ───────────────────────────────────────────────────── */}
        <Box
          sx={{
            backgroundColor: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: "20px",
            p: { xs: 3, md: "32px 36px" },
            mb: 3,
            boxShadow: "0 18px 36px rgba(252,150,120,0.10)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: { xs: 0, md: 5 },
              flexDirection: { xs: "column", md: "row" },
              alignItems: "flex-start",
            }}
          >
            {/* Left — identity + progress */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Badges row */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
                {viewMode === "project" ? (
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.5,
                      backgroundColor: CORAL_SOFTER, color: CORAL_INK,
                      borderRadius: "20px", px: 1.1, py: 0.3,
                      fontSize: 11, fontWeight: 700,
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 10 }} />
                    Tailored
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.5,
                      backgroundColor: BUTTER_SOFT, color: BUTTER_INK,
                      borderRadius: "20px", px: 1.1, py: 0.3,
                      fontSize: 11, fontWeight: 700,
                    }}
                  >
                    ✦ Curated by Speachy
                  </Box>
                )}
              </Box>

              {/* Name + action */}
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
                <Typography
                  component="h1"
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontSize: { xs: 24, md: 30 },
                    fontWeight: 700,
                    color: INK,
                    lineHeight: 1.15,
                    mr: 2,
                  }}
                >
                  {meta.name}
                </Typography>

                {/* Action button */}
                {viewMode === "project" ? (
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 12.5,
                      color: MUTED,
                      borderRadius: "9px",
                      border: `1px solid ${LINE}`,
                      px: 1.5,
                      py: 0.6,
                      flexShrink: 0,
                      "&:hover": { borderColor: CORAL, color: CORAL, backgroundColor: CORAL_SOFTER },
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <IconButton
                    onClick={() => setStarred((s) => !s)}
                    sx={{
                      color: starred ? "#e6a817" : MUTED,
                      borderRadius: "9px",
                      border: `1px solid ${starred ? "rgba(230,168,23,0.3)" : LINE}`,
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      "&:hover": {
                        backgroundColor: "rgba(230,168,23,0.08)",
                        color: "#e6a817",
                        borderColor: "rgba(230,168,23,0.3)",
                      },
                    }}
                  >
                    {starred ? (
                      <StarRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <StarBorderRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                )}
              </Box>

              {/* Subtitle + experience level */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: 14, color: MUTED }}>
                  {meta.subtitle}
                </Typography>
                {viewMode === "project" && meta.experience && (
                  <Box
                    sx={{
                      backgroundColor: "rgba(60,32,25,0.06)",
                      color: INK_2,
                      borderRadius: "20px",
                      px: 1.1,
                      py: 0.2,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {meta.experience}
                  </Box>
                )}
              </Box>

              {/* Owner + updated */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Typography sx={{ fontSize: 12, color: MUTED_2 }}>
                  {viewMode === "project" ? "Your project" : "By Speachy"}
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: MUTED_2 }} />
                <Typography sx={{ fontSize: 12, color: MUTED_2 }}>
                  Updated {meta.updatedAt}
                </Typography>
              </Box>

              {/* Progress bar */}
              <Box sx={{ mb: 0.75 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: 12.5, color: INK_2, fontWeight: 500 }}>
                    {meta.attemptedQs} of {meta.totalQs} attempted
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: CORAL, fontWeight: 700 }}>
                    {Math.round(pct)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: CORAL_SOFTER,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: CORAL,
                      width: `${pct}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </Box>
              </Box>

            </Box>

            {/* Right — score tiles */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1.25,
                mt: { xs: 3.5, md: 0 },
                flexShrink: 0,
                width: { md: "auto" },
                minWidth: { md: 360 },
              }}
            >
              <ScoreTile label="Relevance" data={meta.scores.relevance} noData={noScoreData} />
              <ScoreTile label="Structure" data={meta.scores.structure} noData={noScoreData} />
              <ScoreTile label="Fluency"   data={meta.scores.fluency}   noData={noScoreData} />
            </Box>
          </Box>
        </Box>

        {/* ── Filter strip ──────────────────────────────────────────────────── */}
        <Box sx={{ mb: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>

          {/* Row 1: Difficulty */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500, minWidth: 64 }}>
              Difficulty
            </Typography>
            {["easy", "medium", "hard"].map((d) => (
              <FilterPill
                key={d}
                label={d}
                active={activeDiffs.includes(d)}
                onClick={() => toggleDiff(d)}
                color={DIFF[d] ? { bg: DIFF[d].bg, text: DIFF[d].color } : undefined}
              />
            ))}
            {activeDiffs.length > 0 && (
              <Box
                onClick={() => setActiveDiffs([])}
                sx={{
                  cursor: "pointer",
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: MUTED_2,
                  px: 1,
                  py: 0.3,
                  borderRadius: "20px",
                  userSelect: "none",
                  "&:hover": { color: MUTED },
                  transition: "color 120ms ease",
                }}
              >
                clear ×
              </Box>
            )}
          </Box>

          {/* Row 2: Topic */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500, minWidth: 64 }}>
              Topic
            </Typography>
            {ALL_TAGS.map((t) => (
              <FilterPill
                key={t}
                label={t}
                active={activeTags.includes(t)}
                onClick={() => toggleTag(t)}
              />
            ))}
            {activeTags.length > 0 && (
              <Box
                onClick={() => setActiveTags([])}
                sx={{
                  cursor: "pointer",
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: MUTED_2,
                  px: 1,
                  py: 0.3,
                  borderRadius: "20px",
                  userSelect: "none",
                  "&:hover": { color: MUTED },
                  transition: "color 120ms ease",
                }}
              >
                clear ×
              </Box>
            )}
          </Box>

        </Box>

        {/* ── Questions section ─────────────────────────────────────────────── */}
        <Box
          sx={{
            backgroundColor: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: "20px",
            p: { xs: 3, md: "28px 32px" },
            boxShadow: "0 18px 36px rgba(252,150,120,0.08)",
          }}
        >
          {/* Section header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>
              Questions
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: MUTED }}>
              {filtered.length === ALL_QUESTIONS.length
                ? `${ALL_QUESTIONS.length} total · ${remaining} remaining`
                : `${filtered.length} shown · ${ALL_QUESTIONS.length} total`}
            </Typography>
          </Box>

          {/* Question rows */}
          {filtered.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {filtered.map((q, i) => (
                <QuestionRow
                  key={q.id}
                  index={i + 1}
                  q={q}
                  onPractice={(id) => console.log("Practice question", id)}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: "center", color: MUTED, fontSize: 14 }}>
              No questions match the selected filters.
            </Box>
          )}
        </Box>

        {/* Prototype label */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography sx={{ fontSize: 11, color: MUTED_2, fontStyle: "italic" }}>
            Prototype · dummy data · toggle between Project and Collection view above
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

export default QuestionsListPrototype;
