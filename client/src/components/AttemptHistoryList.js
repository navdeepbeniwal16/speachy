import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SpeedIcon from "@mui/icons-material/Speed";
import AttemptService from "../services/attempt-service.js";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const CORAL        = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK    = "#C85A3E";
const PAGE_BG      = "#fff4ef";
const SURFACE      = "#ffffff";
const LINE         = "rgba(252,150,120,0.12)";
const INK          = "#2f170f";
const INK_2        = "rgba(60,32,25,0.78)";
const MUTED        = "rgba(60,32,25,0.45)";
const MUTED_2      = "rgba(60,32,25,0.28)";

const scoreBarColor = (score) => {
  if (score >= 8) return { color: "#4caf50", track: "rgba(76,175,80,0.12)" };
  if (score >= 5) return { color: "#f5a623", track: "rgba(245,166,35,0.12)" };
  return            { color: "#f44336", track: "rgba(244,67,54,0.12)" };
};

const fmtDur = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
};

const fmtDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
};

// ─── Trend chart ───────────────────────────────────────────────────────────────
// attempts must be sorted chronologically (oldest → newest); shows last 5 only

const DIM_CONFIG = [
  { key: "relevance",    label: "Relevance"    },
  { key: "structure",    label: "Structure"    },
  { key: "authenticity", label: "Authenticity" },
];

const CHART_COLOR = "rgba(250,115,91,0.45)";
const CHART_FILL  = "rgba(250,115,91,0.08)";

const MiniChart = ({ attempts, dimKey, label }) => {
  const color = CHART_COLOR;
  const fill  = CHART_FILL;
  const W = 200, H = 78;
  const PAD = { top: 22, right: 10, bottom: 4, left: 10 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = attempts.length;

  const xOf  = (i)     => PAD.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const yOf  = (score) => PAD.top + chartH - ((score ?? 0) / 10) * chartH;
  const botY = PAD.top + chartH;

  const pts     = attempts.map((a, i) => [xOf(i), yOf(a.scores?.[dimKey] ?? 0)]);
  const linePts = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPts = [...pts, [xOf(n - 1), botY], [xOf(0), botY]].map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 9.5, fontWeight: 700, color, letterSpacing: 0.7, textTransform: "uppercase", mb: 0.5 }}>
        {label}
      </Typography>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} aria-hidden="true">
        {/* Shaded area */}
        <polygon points={areaPts} fill={fill} />
        {/* Line */}
        <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots + score labels */}
        {pts.map(([x, y], i) => {
          const score = attempts[i].scores?.[dimKey];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={color} />
              {score != null && (
                <text x={x} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                  {score % 1 === 0 ? score.toFixed(0) : score.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

const TrendChart = ({ attempts }) => {
  // Need at least 2 points for a trend
  if (attempts.length < 2) return null;
  // Show only the 5 most recent
  const recent = attempts.slice(-5);

  return (
    <Box sx={{ px: 3, pt: 2, pb: 2, borderBottom: `1px solid ${LINE}` }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 0.4, textTransform: "uppercase", mb: 1.5 }}>
        Recent trend
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {DIM_CONFIG.map(({ key, label }) => (
          <MiniChart key={key} attempts={recent} dimKey={key} label={label} />
        ))}
      </Box>
    </Box>
  );
};

// ─── Attempt row ───────────────────────────────────────────────────────────────
const AttemptRow = ({ attempt, isLast, onClick }) => {
  const { scores, speechStats, attemptedAt } = attempt;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 3, py: 1.75,
        borderBottom: isLast ? "none" : `1px solid ${LINE}`,
        cursor: "pointer",
        transition: "background-color 100ms ease",
        "&:hover": { backgroundColor: "rgba(250,115,91,0.03)" },
      }}
    >
      {/* Date */}
      <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500, flexShrink: 0, minWidth: 84 }}>
        {fmtDate(attemptedAt)}
      </Typography>

      {/* Duration chip */}
      {speechStats?.duration != null && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, flexShrink: 0 }}>
          <ScheduleIcon sx={{ fontSize: 12, color: MUTED_2 }} />
          <Typography sx={{ fontSize: 12, color: MUTED_2 }}>{fmtDur(speechStats.duration)}</Typography>
        </Box>
      )}

      {/* Score badges */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", ml: "auto", flexShrink: 0 }}>
        {["relevance", "structure", "authenticity"].map((k) => {
          const score = scores?.[k];
          if (score == null) return null;
          const { color } = scoreBarColor(score);
          return (
            <Box key={k} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 9.5, color: MUTED, textTransform: "capitalize", lineHeight: 1.2 }}>
                {k.slice(0, 3)}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.2 }}>
                {score.toFixed(1)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <ChevronRightIcon sx={{ fontSize: 15, color: MUTED_2, flexShrink: 0 }} />
    </Box>
  );
};

// ─── Attempt detail modal ──────────────────────────────────────────────────────
const AttemptDetailModal = ({ attempt, onClose }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => { setShowTranscript(false); }, [attempt]);

  if (!attempt) return null;

  const { scores, speechStats, overview, tip, dimensions, transcript, attemptedAt, inputMode } = attempt;
  const summaryKeys = ["relevance", "structure", "authenticity"];

  const avgScore = scores
    ? summaryKeys.reduce((s, k) => s + (scores[k] ?? 0), 0) / summaryKeys.length
    : null;

  const scoreColor =
    avgScore == null  ? { bg: CORAL_SOFTER,              text: CORAL_INK }
    : avgScore >= 8   ? { bg: "rgba(52,168,83,0.12)",    text: "#1a6b31" }
    : avgScore >= 6   ? { bg: "rgba(251,188,4,0.14)",    text: "#7a5500" }
    :                   { bg: CORAL_SOFTER,              text: CORAL_INK };

  const isVoice  = inputMode === "voice" || speechStats?.duration != null;
  const paceLabel = speechStats?.wpm == null ? null
    : speechStats.wpm < 120 ? "Slow"
    : speechStats.wpm < 180 ? "Good"
    : "Fast";

  return (
    <Dialog
      open={!!attempt}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: "20px", backgroundColor: PAGE_BG, maxHeight: "90vh" } }}
    >
      {/* Header — identical to DetailedFeedbackModal */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3.5, py: 2.5,
        borderBottom: `1px solid ${LINE}`,
        backgroundColor: SURFACE,
        flexShrink: 0,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: CORAL }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>Detailed Feedback</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: MUTED }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3.5, py: 3 }}>
        {/* Date label */}
        <Typography sx={{ fontSize: 12, color: MUTED_2, fontWeight: 500, mb: 1.5 }}>
          {fmtDateTime(attemptedAt)}
        </Typography>

        {/* Summary + score badge */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
          {overview && (
            <Typography sx={{ fontSize: 14, color: INK_2, lineHeight: 1.65, flex: 1 }}>
              {overview}
            </Typography>
          )}
          {avgScore != null && (
            <Box sx={{ backgroundColor: scoreColor.bg, color: scoreColor.text, borderRadius: "10px", px: 1.75, py: 0.75, textAlign: "center", flexShrink: 0 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "inherit" }}>{avgScore.toFixed(1)}</Typography>
              <Typography sx={{ fontSize: 10, color: "inherit", opacity: 0.8 }}>avg /10</Typography>
            </Box>
          )}
        </Box>

        {/* Tip card */}
        {tip && (
          <Box sx={{ backgroundColor: "rgba(232,200,124,0.20)", border: "1px solid rgba(232,200,124,0.4)", borderRadius: "12px", px: 2, py: 1.5, mb: 3, display: "flex", alignItems: "flex-start", gap: 1 }}>
            <BoltIcon sx={{ fontSize: 16, color: "#8b6a1f", flexShrink: 0, mt: 0.25 }} />
            <Typography sx={{ fontSize: 13.5, color: "#5a3f00", lineHeight: 1.6 }}>{tip}</Typography>
          </Box>
        )}

        {/* Stats tiles (voice only) */}
        {isVoice && (
          <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mb: 3 }}>
            {fmtDur(speechStats?.duration) && (
              <Box sx={{ flex: 1, minWidth: 80, backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px", p: "12px 16px", textAlign: "center" }}>
                <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>
                  <ScheduleIcon sx={{ fontSize: 11 }} /> Duration
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: INK }}>{fmtDur(speechStats.duration)}</Typography>
              </Box>
            )}
            {speechStats?.wpm != null && (
              <Box sx={{ flex: 1, minWidth: 80, backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px", p: "12px 16px", textAlign: "center" }}>
                <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>
                  <SpeedIcon sx={{ fontSize: 11 }} /> Pace
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: INK }}>
                  {speechStats.wpm} <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>wpm</span>
                </Typography>
                <Typography sx={{ fontSize: 11, color: MUTED }}>{paceLabel}</Typography>
              </Box>
            )}
            {speechStats?.fillerCount != null && (
              <Box sx={{ flex: 1, minWidth: 80, backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px", p: "12px 16px", textAlign: "center" }}>
                <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5 }}>Fillers</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: speechStats.fillerCount > 5 ? CORAL_INK : INK }}>
                  {speechStats.fillerCount}
                </Typography>
                <Typography sx={{ fontSize: 11, color: MUTED }}>
                  {speechStats.fillerCount <= 2 ? "Great" : speechStats.fillerCount <= 5 ? "Okay" : "Too many"}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Aspect breakdown */}
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, mb: 1.5 }}>
          Aspect breakdown
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: transcript ? 3 : 0 }}>
          {summaryKeys.map((key) => {
            const score = scores?.[key];
            if (score == null) return null;
            const { color, track } = scoreBarColor(score);
            const ways = dimensions?.[key]?.waysToImprove || [];
            return (
              <Box key={key} sx={{ backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px", p: "16px 20px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, textTransform: "capitalize" }}>{key}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color }}>
                    {score.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>/10</span>
                  </Typography>
                </Box>
                <Box sx={{ height: 5, borderRadius: 3, backgroundColor: track, overflow: "hidden", mb: ways.length ? 1.25 : 0 }}>
                  <Box sx={{ height: "100%", borderRadius: 3, backgroundColor: color, width: `${(score / 10) * 100}%`, transition: "width 0.5s ease" }} />
                </Box>
                {ways.map((w, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: i < ways.length - 1 ? 0.5 : 0 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: color, flexShrink: 0, mt: "7px" }} />
                    <Typography sx={{ fontSize: 13, color: INK_2, lineHeight: 1.6 }}>{w}</Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>

        {/* Transcript */}
        {transcript && (
          <Box>
            <Box
              onClick={() => setShowTranscript((v) => !v)}
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 1, cursor: "pointer", color: CORAL, fontSize: 13, fontWeight: 600, "&:hover": { opacity: 0.75 }, transition: "opacity 120ms ease" }}
            >
              {showTranscript ? "Hide transcript" : "Show transcript"}
            </Box>
            {showTranscript && (
              <Box sx={{ mt: 1.5, backgroundColor: SURFACE, border: `1px solid ${LINE}`, borderRadius: "12px", p: "16px 20px" }}>
                <Typography sx={{ fontSize: 13.5, color: INK_2, lineHeight: 1.8, fontStyle: "italic" }}>
                  "{transcript}"
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Main export ───────────────────────────────────────────────────────────────
// Props:
//   questionKey  — required, stable identifier for this question
//   refreshKey   — bump to re-fetch after a new save
//   limit        — max rows to show (omit for all); enables "View all" link
//   questionText — passed through to the history detail page
//   sourceName   — passed through to the history detail page
//   sx           — forwarded to outer Box
const AttemptHistoryList = ({ questionKey, refreshKey, limit, questionText, sourceName, sx }) => {
  const navigate = useNavigate();
  const [attempts, setAttempts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    if (!questionKey) return;
    setLoading(true);
    AttemptService.getByQuestion(questionKey)
      .then(setAttempts)
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, [questionKey, refreshKey]);

  if (loading || attempts.length === 0) return null;

  // Chart needs oldest → newest; list shows newest first
  const chronological  = [...attempts].reverse();
  const displayAttempts = limit ? attempts.slice(0, limit) : attempts;
  const hasMore        = limit != null && attempts.length > limit;

  const handleViewAll = () => {
    navigate("/history/question", {
      state: { questionKey, questionText: questionText || "", sourceName: sourceName || null },
    });
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: SURFACE,
          border: `1px solid ${LINE}`,
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 18px 36px rgba(252,150,120,0.10)",
          ...sx,
        }}
      >
        {/* Section header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: `1px solid ${LINE}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK }}>Past attempts</Typography>
            <Box sx={{ backgroundColor: CORAL_SOFTER, color: CORAL_INK, borderRadius: "20px", px: 1, py: 0.2, fontSize: 11, fontWeight: 700 }}>
              {attempts.length}
            </Box>
          </Box>
        </Box>

        {/* Trend chart — only when ≥ 2 attempts */}
        <TrendChart attempts={chronological} />

        {/* Attempt rows */}
        {displayAttempts.map((attempt, i) => (
          <AttemptRow
            key={attempt.id}
            attempt={attempt}
            isLast={i === displayAttempts.length - 1 && !hasMore}
            onClick={() => setSelectedAttempt(attempt)}
          />
        ))}

        {/* View all link */}
        {hasMore && (
          <Box
            onClick={handleViewAll}
            sx={{
              px: 3, py: 1.5,
              borderTop: `1px solid ${LINE}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background-color 100ms ease",
              "&:hover": { backgroundColor: CORAL_SOFTER },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: CORAL }}>
              View all {attempts.length} attempts
            </Typography>
          </Box>
        )}
      </Box>

      <AttemptDetailModal
        attempt={selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
      />
    </>
  );
};

export default AttemptHistoryList;
