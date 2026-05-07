import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import BreadcrumbHeader from "../components/BreadcrumbHeader.js";
import AttemptHistoryList from "../components/AttemptHistoryList.js";

const PAGE_BG = "#fff4ef";
const SURFACE = "#ffffff";
const LINE    = "rgba(252,150,120,0.12)";
const INK     = "#2f170f";
const MUTED   = "rgba(60,32,25,0.45)";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK    = "#C85A3E";

const QuestionHistoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { questionKey, questionText, sourceName } = location.state || {};

  // Guard: redirect if no questionKey in state
  useEffect(() => {
    if (!questionKey) navigate("/history");
  }, [questionKey, navigate]);

  if (!questionKey) return null;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md">
        <BreadcrumbHeader
          parentLabel="History"
          parentPath="/history"
          currentLabel="Question"
        />

        {/* Question card */}
        <Box
          sx={{
            backgroundColor: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: "18px",
            p: { xs: 3, md: "28px 32px" },
            mb: 3,
            boxShadow: "0 18px 36px rgba(252,150,120,0.10)",
          }}
        >
          {sourceName && (
            <Box
              sx={{
                display: "inline-flex", alignItems: "center",
                backgroundColor: CORAL_SOFTER, color: CORAL_INK,
                borderRadius: "20px", px: 1.25, py: 0.3,
                fontSize: 11, fontWeight: 700, mb: 1.5,
              }}
            >
              {sourceName}
            </Box>
          )}
          <Typography
            sx={{
              fontFamily: "Georgia, serif",
              fontSize: { xs: 16, md: 18 },
              color: INK,
              lineHeight: 1.65,
            }}
          >
            {questionText}
          </Typography>
        </Box>

        {/* Full attempt history */}
        <AttemptHistoryList questionKey={questionKey} />

        {/* Fallback if no attempts (shouldn't normally happen from HistoryPage) */}
        <Box sx={{ textAlign: "center", pt: 4, display: "none" }}>
          <Typography sx={{ fontSize: 14, color: MUTED }}>No attempts recorded for this question.</Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default QuestionHistoryPage;
