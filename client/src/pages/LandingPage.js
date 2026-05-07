import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CreateIcon from "@mui/icons-material/Create";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import CheckIcon from "@mui/icons-material/Check";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// ─── Design tokens ────────────────────────────────────────────────────────────
const PAGE_BG = "#fff4ef";
const SURFACE_BG = "#ffffff";
const CORAL = "#FA735B";
const CORAL_INK = "#C85A3E";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const BUTTER_SOFT = "rgba(232,200,124,0.25)";
const BUTTER_INK = "#8b6a1f";
const HEADING_COLOR = "#2f170f";
const BODY_COLOR = "rgba(60,32,25,0.78)";
const MUTED_COLOR = "rgba(60,32,25,0.45)";
const LINE = "rgba(252,150,120,0.12)";

const SERIF = "Georgia, serif";

// ─── Navbar ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Progress", href: "#progress" },
];

function Navbar() {
  return (
    <Box
      component="nav"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(255,244,239,0.92)",
        backdropFilter: "blur(16px)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 3, md: 6 },
          py: 1.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/assets/Speachy_Logo_Full_SVG.svg"
            alt="Speachy"
            style={{ height: 36, width: "auto" }}
          />
        </Link>

        <Stack
          direction="row"
          spacing={0}
          alignItems="center"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Button
              key={label}
              component="a"
              href={href}
              sx={{
                color: BODY_COLOR,
                fontWeight: 500,
                fontSize: 14,
                textTransform: "none",
                px: 2,
                borderRadius: "50px",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                  color: HEADING_COLOR,
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component={Link}
            to="/signin"
            sx={{
              color: BODY_COLOR,
              fontWeight: 500,
              fontSize: 14,
              textTransform: "none",
              borderRadius: "50px",
              px: 2,
              display: { xs: "none", sm: "inline-flex" },
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
                color: HEADING_COLOR,
              },
            }}
          >
            Sign in
          </Button>
          <Button
            component={Link}
            to="/signup"
            variant="contained"
            sx={{
              backgroundColor: CORAL,
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              textTransform: "none",
              borderRadius: "50px",
              px: 2.75,
              py: 0.9,
              boxShadow: "none",
              "&:hover": { backgroundColor: CORAL_INK, boxShadow: "none" },
            }}
          >
            Get Started
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

// ─── Mock "Prepare for a Role" card ──────────────────────────────────────────
function MockPrepareCard() {
  const fieldStyle = {
    border: "1px solid rgba(0,0,0,0.09)",
    borderRadius: "10px",
    px: 1.75,
    py: 1.15,
    backgroundColor: "#fafafa",
  };

  return (
    <Box sx={{ position: "relative", width: { xs: "100%", md: 440 } }}>
      {/* Main card */}
      <Box
        sx={{
          backgroundColor: SURFACE_BG,
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.10)",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 15.5,
                fontWeight: 700,
                color: HEADING_COLOR,
                mb: 0.3,
              }}
            >
              Prepare for a Role
            </Typography>
            <Typography
              sx={{ fontSize: 12.5, color: MUTED_COLOR, fontWeight: 400 }}
            >
              AI-tailored questions, just for you
            </Typography>
          </Box>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: CORAL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: 300,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            +
          </Box>
        </Box>

        {/* Form fields */}
        <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
          <Box sx={{ mb: 1.75 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: MUTED_COLOR,
                mb: 0.7,
                letterSpacing: 0.1,
              }}
            >
              Company
            </Typography>
            <Box sx={fieldStyle}>
              <Typography
                sx={{ fontSize: 14, fontWeight: 500, color: HEADING_COLOR }}
              >
                Atlassian
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 1.75 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: MUTED_COLOR,
                mb: 0.7,
                letterSpacing: 0.1,
              }}
            >
              Role
            </Typography>
            <Box sx={fieldStyle}>
              <Typography
                sx={{ fontSize: 14, fontWeight: 500, color: HEADING_COLOR }}
              >
                Staff Software Engineer
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} mb={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: MUTED_COLOR,
                  mb: 0.7,
                  letterSpacing: 0.1,
                }}
              >
                Experience
              </Typography>
              <Box sx={fieldStyle}>
                <Typography
                  sx={{ fontSize: 13.5, fontWeight: 500, color: HEADING_COLOR }}
                >
                  Staff+ (9+ yr)
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: MUTED_COLOR,
                  mb: 0.7,
                  letterSpacing: 0.1,
                }}
              >
                Questions
              </Typography>
              <Box sx={fieldStyle}>
                <Typography
                  sx={{ fontSize: 13.5, fontWeight: 500, color: HEADING_COLOR }}
                >
                  15 questions
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Box
            sx={{
              backgroundColor: CORAL,
              borderRadius: "10px",
              py: 1.5,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: "#fff" }}>
              Generate My Questions →
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Floating: Overall Score (top-right) */}
      <Box
        sx={{
          position: "absolute",
          top: -18,
          right: -24,
          backgroundColor: SURFACE_BG,
          borderRadius: "14px",
          px: 2,
          py: 1.5,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          minWidth: 130,
          display: { xs: "none", lg: "block" },
        }}
      >
        <Typography
          sx={{ fontSize: 10.5, fontWeight: 500, color: MUTED_COLOR, mb: 0.6 }}
        >
          Overall Score
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.4} mb={0.85}>
          <Typography
            sx={{
              fontFamily: SERIF,
              fontSize: 30,
              fontWeight: 700,
              color: HEADING_COLOR,
              lineHeight: 1,
            }}
          >
            8.4
          </Typography>
          <Typography
            sx={{ fontSize: 13, color: MUTED_COLOR, fontWeight: 400 }}
          >
            /10
          </Typography>
        </Stack>
        <Box
          sx={{
            height: 4,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "84%",
              height: "100%",
              backgroundColor: "#4caf50",
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>

      {/* Floating: Sample Question (bottom-left) */}
      <Box
        sx={{
          position: "absolute",
          bottom: -65,
          left: -20,
          backgroundColor: SURFACE_BG,
          borderRadius: "14px",
          px: 2,
          py: 1.5,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          maxWidth: 210,
          display: { xs: "none", lg: "block" },
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: CORAL,
            mb: 0.6,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Sample Question
        </Typography>
        <Typography
          sx={{
            fontSize: 12.5,
            color: BODY_COLOR,
            lineHeight: 1.55,
            fontStyle: "italic",
          }}
        >
          "Tell me about a time you led a cross-team initiative..."
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Score ring (SVG donut) ───────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const size = 84;
  const cx = size / 2;
  const r = 32;
  const strokeW = 7;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 10) * circumference;
  const trackColor = `${color}22`;

  return (
    <Box
      sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeW}
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      {/* Score label */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: SERIF,
            fontSize: 22,
            fontWeight: 700,
            color: "#fff8f5",
            lineHeight: 1,
          }}
        >
          {score}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            color: "rgba(255,200,175,0.50)",
            fontWeight: 400,
            mt: 0.25,
          }}
        >
          /10
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Mock streak calendar ─────────────────────────────────────────────────────
function MockStreakCalendar() {
  // Heat levels 0–1: builds denser toward recent weeks
  const heatPattern = [
    [0, 0.2, 0, 0.4, 0.7, 0, 1],
    [0.3, 0, 0.6, 0.8, 0, 0.35, 1],
    [0, 0.5, 0.9, 0.4, 0.75, 0, 1],
    [0.55, 0.8, 0.3, 0.85, 0.75, 0, 1],
    [0.8, 0.2, 0.75, 0.75, 0.8, 1, 1],
    [0.2, 0.75, 0.5, 0.75, 0.5, 1, 0],
    [0.2, 0.6, 0.2, 0, 0, 1, 0],
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {heatPattern.map((week, wi) => (
        <Box key={wi} sx={{ display: "flex", gap: "6px" }}>
          {week.map((level, di) => (
            <Box
              key={di}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor:
                  level > 0
                    ? `rgba(250,115,91,${Math.max(0.18, level)})`
                    : "rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

// ─── Mock score graph ─────────────────────────────────────────────────────────
function MockScoreGraph() {
  const scores = [4.6, 5.2, 5.8, 6.5, 7.0, 7.5, 8.1, 8.7];
  const vw = 560;
  const vh = 140;
  const padX = 8;
  const padY = 20;
  const minV = 3.5;
  const maxV = 10;

  const toX = (i) => padX + (i / (scores.length - 1)) * (vw - padX * 2);
  const toY = (v) => vh - padY - ((v - minV) / (maxV - minV)) * (vh - padY * 2);

  const pts = scores.map((v, i) => [toX(i), toY(v)]);

  // Smooth cubic bezier through points
  let linePath = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2;
    linePath += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${vh} L ${pts[0][0]},${vh} Z`;

  const [endX, endY] = pts[pts.length - 1];
  const [startX, startY] = pts[0];

  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <svg
        width="100%"
        viewBox={`0 0 ${vw} ${vh}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FA735B" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#FA735B" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Subtle start marker */}
        <circle cx={startX} cy={startY} r="4" fill="rgba(250,115,91,0.35)" />
        {/* Area fill */}
        <path d={areaPath} fill="url(#scoreAreaGrad)" />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#FA735B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        <circle cx={endX} cy={endY} r="5.5" fill="#FA735B" />
        {/* Score label pill */}
        <rect
          x={endX - 20}
          y={endY - 30}
          width={40}
          height={22}
          rx="7"
          fill="#FA735B"
        />
        <text
          x={endX}
          y={endY - 14}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="white"
          fontFamily="Georgia, serif"
        >
          8.7
        </text>
      </svg>
    </Box>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, bg, sx = {}, id }) {
  return (
    <Box
      id={id}
      sx={{ backgroundColor: bg || PAGE_BG, py: { xs: 8, md: 11 }, ...sx }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 3, md: 6 } }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <Box sx={{ backgroundColor: PAGE_BG, minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 8, md: 11 },
          pb: { xs: 12, md: 16 },
        }}
      >
        {/* Warm radial glow behind the mock card */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: "-5%",
            transform: "translateY(-50%)",
            width: { xs: 400, md: 700 },
            height: { xs: 400, md: 700 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(250,115,91,0.13) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            px: { xs: 3, md: 6 },
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "5fr 6fr" },
              gap: { xs: 8, md: 8 },
              alignItems: "center",
            }}
          >
            {/* Left: copy */}
            <Box>
              {/* Badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: SURFACE_BG,
                  borderRadius: "50px",
                  px: 2,
                  py: 0.75,
                  mb: 3.5,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: CORAL,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: CORAL,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  AI Interview Preparation
                </Typography>
              </Box>

              {/* Headline */}
              <Typography
                variant="h1"
                sx={{
                  fontFamily: SERIF,
                  fontWeight: 800,
                  fontSize: { xs: 42, sm: 54, md: 60 },
                  color: HEADING_COLOR,
                  lineHeight: 1.1,
                  mb: 2.5,
                  letterSpacing: "-1px",
                }}
              >
                Master your{" "}
                <Box component="span" sx={{ color: CORAL }}>
                  Narrative
                </Box>
                {", "}
                bring your best self.
              </Typography>

              {/* Subtext */}
              <Typography
                sx={{
                  fontSize: { xs: 16, md: 17 },
                  color: BODY_COLOR,
                  lineHeight: 1.75,
                  mb: 4.5,
                  maxWidth: 460,
                }}
              >
                Practice interviews with the AI powered coach. Get scored on
                what matters, see where you shine, and know exactly what to
                sharpen.
              </Typography>
            </Box>

            {/* Right: mock UI */}
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
                pl: { xs: 0, lg: 4 },
                pr: { xs: 0, lg: 2 },
                pt: 3,
                pb: 3,
              }}
            >
              <MockPrepareCard />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Three ways to practice ────────────────────────────────────────────── */}
      <Section id="features" bg={SURFACE_BG}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: CORAL,
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            textAlign: "center",
          }}
        >
          Three Ways to Practice
        </Typography>
        <Typography
          sx={{
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: { xs: 30, md: 42 },
            color: HEADING_COLOR,
            mb: 1.5,
            textAlign: "center",
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
          }}
        >
          Pick your way to get started
        </Typography>
        <Typography
          sx={{
            fontSize: 16,
            color: BODY_COLOR,
            textAlign: "center",
            mb: { xs: 5, md: 7 },
            maxWidth: 460,
            mx: "auto",
            lineHeight: 1.7,
          }}
        >
          Whether you want AI to do the work or prefer to stay in control —
          there's a mode for you.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 2.5,
          }}
        >
          {[
            {
              icon: <AutoAwesomeIcon sx={{ fontSize: 22, color: CORAL_INK }} />,
              badge: "AI-Tailored",
              badgeBg: CORAL_SOFTER,
              badgeColor: CORAL_INK,
              title: "Questions tailored for your role",
              body: "Tell us the company and the role. The AI generates questions most likely to appear during the interview.",
              accent: CORAL,
            },
            {
              icon: <CreateIcon sx={{ fontSize: 22, color: BUTTER_INK }} />,
              badge: "Custom",
              badgeBg: BUTTER_SOFT,
              badgeColor: BUTTER_INK,
              title: "Practise what you want",
              body: "Add your own questions bank. Bring a list from a job posting, a friend's tips, or your own research.",
              accent: BUTTER_INK,
            },
            {
              icon: <AutoStoriesIcon sx={{ fontSize: 22, color: "#2a4bcc" }} />,
              badge: "Curated",
              badgeBg: "rgba(82,130,255,0.08)",
              badgeColor: "#2a4bcc",
              title: "Start with curated collections",
              body: "Browse question sets we've put together for various roles. Pick one and start immediately. No setup needed.",
              accent: "#2a4bcc",
            },
          ].map(({ icon, badge, badgeBg, badgeColor, title, body }) => (
            <Box
              key={badge}
              sx={{
                backgroundColor: SURFACE_BG,
                borderRadius: "20px",
                p: { xs: 3, md: 3.5 },
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                transition: "box-shadow 160ms ease, transform 160ms ease",
                "&:hover": {
                  boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                  transform: "translateY(-3px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: badgeBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                }}
              >
                {icon}
              </Box>
              <Chip
                label={badge}
                size="small"
                sx={{
                  mb: 1.5,
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
              <Typography
                sx={{
                  fontFamily: SERIF,
                  fontSize: 19,
                  fontWeight: 700,
                  color: HEADING_COLOR,
                  mb: 1,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{ fontSize: 14, color: BODY_COLOR, lineHeight: 1.7 }}
              >
                {body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Section>

      {/* ── Scoring & Feedback ───────────────────────────────────────────────── */}
      <Section id="how-it-works" bg="#1e0d07">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 6, md: 10 },
            alignItems: "center",
          }}
        >
          {/* Left: mock question + answer card */}
          <Box sx={{ position: "relative", pb: 5 }}>
            <Box
              sx={{
                backgroundColor: SURFACE_BG,
                borderRadius: "20px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
                p: 3,
              }}
            >
              {/* Question label */}
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: CORAL,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  mb: 1.25,
                }}
              >
                Question
              </Typography>

              {/* Question text */}
              <Typography
                sx={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  fontWeight: 600,
                  color: HEADING_COLOR,
                  lineHeight: 1.5,
                  mb: 2.5,
                }}
              >
                "Tell me about a time you had to lead a team through a difficult
                decision."
              </Typography>

              {/* Answer box */}
              <Box
                sx={{
                  backgroundColor: "rgba(0,0,0,0.035)",
                  borderRadius: "12px",
                  px: 2.25,
                  py: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13.5,
                    color: BODY_COLOR,
                    lineHeight: 1.7,
                  }}
                >
                  In my previous role, our team was split on whether to delay
                  the launch or ship with known bugs. I gathered everyone's
                  concerns, mapped the risk matrix, and facilitated a structured
                  decision — we delayed by one sprint, shipped cleanly, and it
                  became a model for future releases...
                </Typography>
              </Box>
            </Box>

            {/* Floating AI Coach Tip */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 16,
                backgroundColor: SURFACE_BG,
                borderRadius: "16px",
                px: 2.25,
                py: 1.75,
                boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
                maxWidth: 260,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: CORAL,
                  mb: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                AI Coach Tip
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: BODY_COLOR,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                "Lead with the specific outcome — quantify the impact to boost
                your Structure score."
              </Typography>
            </Box>
          </Box>

          {/* Right: copy + score rings */}
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: CORAL,
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Scoring &amp; Feedback
            </Typography>
            <Typography
              sx={{
                fontFamily: SERIF,
                fontWeight: 800,
                fontSize: { xs: 30, md: 38 },
                color: "#fff8f5",
                lineHeight: 1.15,
                mb: 2,
                letterSpacing: "-0.5px",
              }}
            >
              Know exactly where you stand, and what to work on
            </Typography>
            <Typography
              sx={{
                fontSize: 15.5,
                color: "rgba(255,200,175,0.65)",
                lineHeight: 1.7,
                mb: 4.5,
                maxWidth: 420,
              }}
            >
              Every answer is scored across three dimensions that interviewers
              actually care about.
            </Typography>

            {/* Dimension rows */}
            <Stack spacing={3.5}>
              {[
                {
                  label: "Relevance",
                  score: 8.7,
                  color: "#4caf50",
                  desc: "How directly your answer addresses what was asked.",
                },
                {
                  label: "Structure",
                  score: 7.2,
                  color: CORAL,
                  desc: "Clarity, logical flow, and use of frameworks like STAR.",
                },
                {
                  label: "Authenticity",
                  score: 9.1,
                  color: "#4caf50",
                  desc: "Your personal voice and stories over rehearsed templates.",
                },
              ].map(({ label, score, color, desc }) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={2.5}
                  alignItems="center"
                >
                  <ScoreRing score={score} color={color} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#fff8f5",
                        mb: 0.4,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        color: "rgba(255,200,175,0.60)",
                        lineHeight: 1.6,
                      }}
                    >
                      {desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Section>

      {/* ── Progress tracking ─────────────────────────────────────────────────── */}
      <Section id="progress">
        {/* Centered header */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: CORAL,
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Track Your Growth
          </Typography>
          <Typography
            sx={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: { xs: 32, md: 44 },
              color: HEADING_COLOR,
              lineHeight: 1.15,
              mb: 2,
              letterSpacing: "-0.5px",
            }}
          >
            Every session makes you sharper
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              color: BODY_COLOR,
              lineHeight: 1.7,
              maxWidth: 520,
              mx: "auto",
            }}
          >
            Speachy tracks your progression, builds your streak, and shows you
            how far you've come.
          </Typography>
        </Box>

        {/* ── Row 1: Streak + This Week ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
            gap: 2.5,
            mb: 2.5,
          }}
        >
          {/* Practice Streak card */}
          <Box
            sx={{
              backgroundColor: SURFACE_BG,
              borderRadius: "20px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              p: { xs: 3, md: 3.5 },
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" mb={0.75}>
              <WhatshotIcon sx={{ fontSize: 17, color: CORAL }} />
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: HEADING_COLOR }}
              >
                Practice Streak
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="baseline" spacing={1} mb={3}>
              <Typography
                sx={{
                  fontFamily: SERIF,
                  fontSize: 42,
                  fontWeight: 800,
                  color: HEADING_COLOR,
                  lineHeight: 1,
                }}
              >
                8
              </Typography>
              <Typography
                sx={{ fontSize: 14, color: MUTED_COLOR, fontWeight: 400 }}
              >
                days in a row
              </Typography>
            </Stack>
            <MockStreakCalendar />
          </Box>

          {/* This Week card */}
          <Box
            sx={{
              backgroundColor: SURFACE_BG,
              borderRadius: "20px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              p: { xs: 3, md: 3.5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" mb={3}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: CORAL }} />
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: HEADING_COLOR }}
              >
                This Week
              </Typography>
            </Stack>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: SERIF,
                    fontSize: 52,
                    fontWeight: 800,
                    color: HEADING_COLOR,
                    lineHeight: 1,
                  }}
                >
                  12
                </Typography>
                <Typography sx={{ fontSize: 14, color: MUTED_COLOR, mt: 0.5 }}>
                  Questions practiced
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: SERIF,
                    fontSize: 52,
                    fontWeight: 800,
                    color: HEADING_COLOR,
                    lineHeight: 1,
                  }}
                >
                  5
                </Typography>
                <Typography sx={{ fontSize: 14, color: MUTED_COLOR, mt: 0.5 }}>
                  Days active
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Row 2: Projects + Score graph ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 3fr" },
            gap: 2.5,
          }}
        >
          {/* Projects card */}
          <Box
            sx={{
              backgroundColor: SURFACE_BG,
              borderRadius: "20px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              p: { xs: 3, md: 3.5 },
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" mb={2.5}>
              <FolderOpenOutlinedIcon sx={{ fontSize: 17, color: CORAL }} />
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: HEADING_COLOR }}
              >
                Projects
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {[
                {
                  name: "Atlassian — Staff Eng",
                  kind: "Tailored",
                  kindColor: CORAL_INK,
                  kindBg: CORAL_SOFTER,
                  progress: 72,
                },
                {
                  name: "Leadership Questions",
                  kind: "Curated",
                  kindColor: "#2a4bcc",
                  kindBg: "rgba(82,130,255,0.08)",
                  progress: 40,
                },
                {
                  name: "My Custom Set",
                  kind: "Custom",
                  kindColor: BUTTER_INK,
                  kindBg: BUTTER_SOFT,
                  progress: 18,
                },
              ].map(({ name, kind, kindColor, kindBg, progress }) => (
                <Box key={name}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.85}
                  >
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: HEADING_COLOR,
                        lineHeight: 1.3,
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: kindColor,
                        backgroundColor: kindBg,
                        px: 0.9,
                        py: 0.25,
                        borderRadius: "6px",
                        flexShrink: 0,
                        ml: 1,
                      }}
                    >
                      {kind}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 5,
                      borderRadius: "10px",
                      backgroundColor: "rgba(0,0,0,0.06)",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${progress}%`,
                        height: "100%",
                        backgroundColor: CORAL,
                        borderRadius: "10px",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Score graph card */}
          <Box
            sx={{
              backgroundColor: SURFACE_BG,
              borderRadius: "20px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              p: { xs: 3, md: 3.5 },
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" mb={0.5}>
              <TrendingUpIcon sx={{ fontSize: 17, color: CORAL }} />
              <Box>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: HEADING_COLOR }}
                >
                  Score over time
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: MUTED_COLOR }}>
                  Average across sessions
                </Typography>
              </Box>
            </Stack>
            <MockScoreGraph />
          </Box>
        </Box>
      </Section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <Section sx={{ backgroundColor: SURFACE_BG }}>
        <Box
          sx={{
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: SERIF,
              fontSize: { xs: 30, md: 44 },
              fontWeight: 800,
              color: HEADING_COLOR,
              mb: 2,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
            }}
          >
            Your next interview is
            <br />
            closer than you think.
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              color: BODY_COLOR,
              mb: 4.5,
              maxWidth: 380,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Start practising today — no payment needed.
          </Typography>
          <Button
            component={Link}
            to="/signup"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: CORAL,
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              textTransform: "none",
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              boxShadow: "none",
              "&:hover": { backgroundColor: CORAL_INK, boxShadow: "none" },
            }}
          >
            Start Practicing Free →
          </Button>
        </Box>
      </Section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          backgroundColor: "#1e0d07",
          overflow: "hidden",
          pt: { xs: 7, md: 9 },
          pb: { xs: 5, md: 7 },
        }}
      >
        {/* Ghost "SPEACHY" background text */}
        <Typography
          aria-hidden="true"
          sx={{
            position: "absolute",
            bottom: "-8%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: { xs: "28vw", md: "19vw" },
            fontFamily: SERIF,
            fontWeight: 800,
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(255,220,200,0.07)",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          SPEACHY
        </Typography>

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            maxWidth: 1100,
            mx: "auto",
            px: { xs: 3, md: 6 },
          }}
        >
          {/* Top: logo + tagline */}
          <Box sx={{ mb: { xs: 5, md: 7 } }}>
            <Typography
              sx={{
                fontFamily: SERIF,
                fontSize: { xs: 26, md: 30 },
                fontWeight: 700,
                color: "#fff8f5",
                mb: 1.5,
                letterSpacing: "-0.3px",
              }}
            >
              Speachy
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 14, md: 15 },
                color: "rgba(255,200,175,0.55)",
                lineHeight: 1.65,
                maxWidth: 360,
              }}
            >
              Your official AI-powered interview coaching partner.
            </Typography>
          </Box>

          {/* Bottom bar */}
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              pt: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography
              sx={{ fontSize: 12.5, color: "rgba(255,200,175,0.35)" }}
            >
              © {new Date().getFullYear()} Speachy
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "rgba(255,200,175,0.35)",
                fontStyle: "italic",
              }}
            >
              Built with care, shipped with intention.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
