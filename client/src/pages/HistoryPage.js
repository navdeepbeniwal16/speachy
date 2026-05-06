import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { AppContext } from "../components/AppContext.js";
import BreadcrumbHeader from "../components/BreadcrumbHeader.js";
import AttemptService from "../services/attempt-service.js";

const CORAL       = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK   = "#C85A3E";
const PAGE_BG     = "#fff4ef";
const SURFACE     = "#ffffff";
const LINE        = "rgba(252,150,120,0.12)";
const INK         = "#2f170f";
const INK_2       = "rgba(60,32,25,0.78)";
const MUTED       = "rgba(60,32,25,0.45)";

const scoreBarColor = (score) => {
  if (score >= 8) return "#4caf50";
  if (score >= 5) return "#f5a623";
  return            "#f44336";
};

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    AttemptService.getSummaries()
      .then(setSummaries)
      .catch(() => showSnackbar("error", "Could not load history. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const openQuestion = (summary) => {
    navigate("/history/question", {
      state: {
        questionKey:  summary.questionKey,
        questionText: summary.questionText,
        sourceName:   summary.sourceName,
      },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md">
        <BreadcrumbHeader
          parentLabel="Home"
          parentPath="/"
          currentLabel="History"
        />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress size={36} sx={{ color: CORAL }} />
          </Box>
        )}

        {!loading && summaries.length === 0 && (
          <Box sx={{ textAlign: "center", pt: 8 }}>
            <HistoryIcon sx={{ fontSize: 44, color: MUTED, mb: 2 }} />
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: INK, mb: 1 }}>
              No attempts yet
            </Typography>
            <Typography sx={{ fontSize: 14, color: MUTED }}>
              Complete an interview practice session to see your history here.
            </Typography>
          </Box>
        )}

        {!loading && summaries.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {summaries.map((summary) => (
              <Box
                key={summary.questionKey}
                onClick={() => openQuestion(summary)}
                sx={{
                  backgroundColor: SURFACE,
                  border: `1px solid ${LINE}`,
                  borderRadius: "16px",
                  p: "20px 24px",
                  cursor: "pointer",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(252,150,120,0.14)",
                  },
                }}
              >
                {/* Top row: source pill + date */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25, gap: 2 }}>
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center",
                      backgroundColor: CORAL_SOFTER, color: CORAL_INK,
                      borderRadius: "20px", px: 1.25, py: 0.3,
                      fontSize: 11, fontWeight: 700,
                      maxWidth: "60%", overflow: "hidden",
                      whiteSpace: "nowrap", textOverflow: "ellipsis",
                    }}
                  >
                    {summary.sourceName || "—"}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: MUTED, flexShrink: 0 }}>
                    {fmtDate(summary.latestAttemptedAt)}
                  </Typography>
                </Box>

                {/* Question text */}
                <Typography
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontSize: { xs: 14, md: 15 },
                    color: INK,
                    lineHeight: 1.55,
                    mb: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {summary.questionText}
                </Typography>

                {/* Score badges */}
                <Box sx={{ display: "flex", gap: 2.5, alignItems: "center" }}>
                  {["relevance", "structure", "authenticity"].map((k) => {
                    const score = summary.latestScores?.[k];
                    if (score == null) return null;
                    const color = scoreBarColor(score);
                    return (
                      <Box key={k} sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography sx={{ fontSize: 11, color: MUTED, textTransform: "capitalize" }}>{k.slice(0, 3)}</Typography>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color }}>{score.toFixed(1)}</Typography>
                      </Box>
                    );
                  })}
                  {summary.attemptCount > 1 && (
                    <Typography sx={{ fontSize: 11.5, color: MUTED, ml: "auto" }}>
                      {summary.attemptCount} attempts
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HistoryPage;
