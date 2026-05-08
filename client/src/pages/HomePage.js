import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PrepareForRoleDialog from "../components/PrepareForRoleDialog.js";
import BuildCustomSetDialog from "../components/BuildCustomSetDialog.js";
import {
  Typography,
  Container,
  Box,
  Chip,
  Grid,
  Backdrop,
  CircularProgress,
  Stack,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import PaymentsService from "../services/payments-service.js";
import { AppContext } from "../components/AppContext.js";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CreateIcon from "@mui/icons-material/Create";
import StreakCalendar from "../components/StreakCalendar";
import StreakService from "../services/streak-service.js";
import SessionService from "../services/session-service.js";
import ProjectService from "../services/project-service.js";
import AttemptService from "../services/attempt-service.js";

const FETCH_INTERVAL_MS = 5 * 60 * 1000;
const PAGE_BG = "#fff4ef";
const SURFACE_BG = "#ffffff";
const SURFACE_BORDER = "1px solid rgba(252, 150, 120, 0.12)";
const SURFACE_SHADOW = "0 18px 36px rgba(252, 150, 120, 0.15)";
const HEADING_COLOR = "#2f170f";
const BODY_COLOR = "rgba(60,32,25,0.78)";
const MUTED_COLOR = "rgba(60,32,25,0.45)";
const CORAL = "#FA735B";
const CORAL_INK = "#C85A3E";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const LINE = "rgba(252,150,120,0.12)";
const BUTTER_SOFT = "rgba(232,200,124,0.25)";
const BUTTER_INK = "#8b6a1f";

const MemoizedStreakCalendar = React.memo(StreakCalendar);

const KIND_CONFIG = {
  tailored: {
    label: "Tailored",
    bg: CORAL_SOFTER,
    color: CORAL_INK,
    icon: <AutoAwesomeIcon sx={{ fontSize: 14 }} />,
  },
  custom: {
    label: "Custom",
    bg: BUTTER_SOFT,
    color: BUTTER_INK,
    icon: <CreateIcon sx={{ fontSize: 14 }} />,
  },
  collection: {
    label: "Curated",
    bg: "rgba(82,130,255,0.08)",
    color: "#2a4bcc",
    icon: <AutoStoriesIcon sx={{ fontSize: 14 }} />,
  },
};

const HomePage = () => {
  const auth = getAuth();
  const { setState } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeDates, setActiveDates] = useState([]);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  const [practicedCounts, setPracticedCounts] = useState({});
  const [prepareOpen, setPrepareOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  const entitlementsFetchRef = useRef(0);
  const streakFetchRef = useRef(0);
  const sessionsFetchRef = useRef(0);
  const userId = auth.currentUser?.uid;

  // ── helpers ──────────────────────────────────────────────────────────────────
  const ymd = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const addDays = (date, delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    return d;
  };
  const computeRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = addDays(today, -7 * 7);
    return { from: ymd(addDays(start, -start.getDay())), to: ymd(today) };
  };
  const computeWeekRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceMonday = (today.getDay() + 6) % 7;
    return { from: ymd(addDays(today, -daysSinceMonday)), to: ymd(today) };
  };

  const { from: weekFrom, to: weekTo } = useMemo(computeWeekRange, []);
  const activeDaysCount = useMemo(
    () => activeDates.filter((d) => d >= weekFrom && d <= weekTo).length,
    [activeDates, weekFrom, weekTo],
  );

  const firstName = auth.currentUser?.displayName?.split(" ")[0] || "there";
  const getTimeBasedGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // ── data fetching ─────────────────────────────────────────────────────────────
  const getUserEntitlements = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    const now = Date.now();
    if (now - entitlementsFetchRef.current < FETCH_INTERVAL_MS) {
      setLoading(false);
      return;
    }
    entitlementsFetchRef.current = now;
    try {
      const response = await PaymentsService.fetchActiveEntitlements(uid);
      const entitlements = response.data.entitlements || [];
      setState((prev) => ({
        ...prev,
        isImpromptuSpeakingEnabled: entitlements.some(
          (e) => e.lookup_key === "impromptu_speaking_01",
        ),
        isInterviewPracticeEnabled: entitlements.some(
          (e) => e.lookup_key === "interview_practice_01",
        ),
      }));
    } catch (e) {
      console.error("Error fetching entitlements:", e);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   getUserEntitlements();
  // }, [userId]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const now = Date.now();
    if (now - streakFetchRef.current < FETCH_INTERVAL_MS) return;
    streakFetchRef.current = now;
    const { from, to } = computeRange();
    StreakService.activity(from, to)
      .then((data) =>
        setActiveDates(Array.isArray(data.dates) ? data.dates : []),
      )
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const now = Date.now();
    if (now - sessionsFetchRef.current < FETCH_INTERVAL_MS) return;
    sessionsFetchRef.current = now;
    SessionService.stats(weekFrom, weekTo)
      .then((data) =>
        setSessionsCount(
          data?.rangeSessions !== undefined
            ? Number(data.rangeSessions)
            : Number(data?.totalSessions) || 0,
        ),
      )
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!auth.currentUser) return;
    Promise.all([ProjectService.getAll(), AttemptService.getSummaries()])
      .then(([projects, summaries]) => {
        setRecentProjects(projects.slice(0, 6));
        const counts = {};
        for (const s of summaries) {
          if (s.projectId) counts[s.projectId] = (counts[s.projectId] || 0) + 1;
        }
        setPracticedCounts(counts);
      })
      .catch(() => {});
  }, [userId]);

  // ── navigation ────────────────────────────────────────────────────────────────
  const openProject = (project) => {
    if (project.kind === "collection") {
      navigate("/interview/questions", {
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
      });
    } else {
      navigate("/interview/questions", {
        state: { project, questions: project.questions, mode: "project" },
      });
    }
  };

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: PAGE_BG,
        py: { xs: 4, md: 6 },
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={2}>
          {/* ── Section 1: Greeting + Streak ─────────────────────────────── */}
          <Grid container spacing={2} alignItems="stretch">
            {/* Left: greeting + stats */}
            <Grid item xs={12} md={7}>
              <Box sx={{ py: { xs: 0, md: 1 } }}>
                <Chip
                  label="This week"
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: CORAL,
                    color: "#fff",
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    fontSize: 12,
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 500,
                    color: HEADING_COLOR,
                    lineHeight: 1.15,
                    mb: 1,
                  }}
                >
                  {getTimeBasedGreeting()},{" "}
                  {firstName.charAt(0).toUpperCase() + firstName.slice(1)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14.5,
                    color: BODY_COLOR,
                    lineHeight: 1.6,
                    mb: 3.5,
                  }}
                >
                  Ready to take your interviewing skills to the next level?
                  Let's make today another step forward.
                </Typography>

                {/* Stat tiles */}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  {[
                    {
                      icon: (
                        <TrackChangesIcon sx={{ fontSize: 18, color: CORAL }} />
                      ),
                      value: sessionsCount,
                      label: "Sessions this week",
                    },
                    {
                      icon: (
                        <CalendarMonthIcon
                          sx={{ fontSize: 18, color: CORAL }}
                        />
                      ),
                      value: activeDaysCount,
                      label: "Days practised",
                    },
                  ].map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{
                        flex: 1,
                        backgroundColor: SURFACE_BG,
                        border: SURFACE_BORDER,
                        borderRadius: "14px",
                        px: 2,
                        py: 1.75,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: "8px",
                            backgroundColor: "rgba(250,115,91,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: HEADING_COLOR,
                            lineHeight: 1,
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: MUTED_COLOR,
                          letterSpacing: 0.4,
                          textTransform: "uppercase",
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right: streak calendar */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: "18px",
                  p: "20px 24px",
                  backgroundColor: SURFACE_BG,
                  border: SURFACE_BORDER,
                  boxShadow: SURFACE_SHADOW,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: MUTED_COLOR,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  Your practice streak
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <MemoizedStreakCalendar
                    title=""
                    activeDates={activeDates}
                    showLegend
                    highlightCurrentStreak
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* ── Section 2: Entry cards ───────────────────────────────────── */}
          <Grid container spacing={2}>
            {/* Prepare for a role */}
            <Grid item xs={12} md={4}>
              <Box
                onClick={() => setPrepareOpen(true)}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: SURFACE_BG,
                  border: SURFACE_BORDER,
                  borderRadius: "18px",
                  p: "22px 22px 18px",
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 22px 40px rgba(252,150,120,0.2)",
                  },
                }}
              >
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
                  sx={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: HEADING_COLOR,
                    mb: 0.75,
                  }}
                >
                  Prepare for a role
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: BODY_COLOR,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  Drop in a company &amp; role — we'll generate a set tailored
                  to the exact bar they'll hold you to.
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
            </Grid>

            {/* Build your own set */}
            <Grid item xs={12} md={4}>
              <Box
                onClick={() => setCustomOpen(true)}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "#fff9f7",
                  backgroundImage:
                    "radial-gradient(circle, rgba(200,90,62,0.14) 1px, transparent 1.2px)",
                  backgroundSize: "14px 14px",
                  border: SURFACE_BORDER,
                  borderRadius: "18px",
                  p: "22px 22px 18px",
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 22px 40px rgba(232,200,124,0.25)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    backgroundColor: SURFACE_BG,
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
                  sx={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: HEADING_COLOR,
                    mb: 0.75,
                  }}
                >
                  Build your own set
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: BODY_COLOR,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
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
            </Grid>

            {/* Explore collections */}
            <Grid item xs={12} md={4}>
              <Box
                onClick={() => navigate("/interview/collections")}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "#2f170f",
                  borderRadius: "18px",
                  p: "22px 22px 18px",
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 22px 40px rgba(47,23,15,0.35)",
                  },
                }}
              >
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
                  Ready to practise
                </Box>
                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#fff",
                    mb: 0.75,
                  }}
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
                  Professionally authored question sets for common interview
                  roles.
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
            </Grid>
          </Grid>

          {/* ── Section 3: Recent Projects ───────────────────────────────── */}
          <Grid container spacing={2}>
            {/* Recent projects — full width */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: "18px",
                  p: "28px 28px 24px",
                  backgroundColor: SURFACE_BG,
                  border: SURFACE_BORDER,
                  boxShadow: SURFACE_SHADOW,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: MUTED_COLOR,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Recent projects
                    {recentProjects.length > 0
                      ? ` · ${recentProjects.length} saved`
                      : ""}
                  </Typography>
                  {recentProjects.length > 0 && (
                    <Typography
                      onClick={() => navigate("/projects")}
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: MUTED_COLOR,
                        cursor: "pointer",
                        "&:hover": { color: CORAL },
                        transition: "color 120ms ease",
                      }}
                    >
                      View all
                    </Typography>
                  )}
                </Box>

                {recentProjects.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <Typography
                      sx={{ fontSize: 13.5, color: MUTED_COLOR, mb: 1.5 }}
                    >
                      No saved projects yet.
                    </Typography>
                    {/* <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setPrepareOpen(true)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 12.5,
                        borderColor: LINE,
                        color: HEADING_COLOR,
                        borderRadius: "9px",
                        "&:hover": {
                          borderColor: CORAL,
                          color: CORAL,
                          backgroundColor: CORAL_SOFTER,
                        },
                      }}
                    >
                      Start a project
                    </Button> */}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {recentProjects.map((project, i) => {
                      const kind = KIND_CONFIG[project.kind];
                      const isLast = i === recentProjects.length - 1;
                      return (
                        <Box
                          key={project.id}
                          onClick={() => openProject(project)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            py: 1.75,
                            borderBottom: isLast ? "none" : `1px solid ${LINE}`,
                            cursor: "pointer",
                            "&:hover": { "& .project-name": { color: CORAL } },
                            transition: "all 120ms ease",
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              backgroundColor: kind?.bg || CORAL_SOFTER,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              color: kind?.color || CORAL_INK,
                            }}
                          >
                            {kind?.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              className="project-name"
                              sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: HEADING_COLOR,
                                lineHeight: 1.3,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                transition: "color 120ms ease",
                              }}
                            >
                              {project.kind === "collection"
                                ? project.name
                                : project.companyName || project.name}
                            </Typography>
                            <Typography
                              sx={{ fontSize: 12, color: MUTED_COLOR, mt: 0.2 }}
                            >
                              {project.kind === "collection"
                                ? `By ${project.author || "Speachy"} · ${practicedCounts[project.id] || 0}/${project.questions?.length || 0} practised`
                                : `${project.jobRole || ""}${project.jobRole ? " · " : ""}${practicedCounts[project.id] || 0}/${project.questions?.length || 0} practised`}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.4,
                              backgroundColor: kind?.bg || CORAL_SOFTER,
                              color: kind?.color || CORAL_INK,
                              borderRadius: "20px",
                              px: 1.1,
                              py: 0.3,
                              fontSize: 10.5,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {kind?.label || "Project"}
                          </Box>
                          <ChevronRightIcon
                            sx={{
                              fontSize: 16,
                              color: MUTED_COLOR,
                              flexShrink: 0,
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <PrepareForRoleDialog
        open={prepareOpen}
        onClose={() => setPrepareOpen(false)}
      />
      <BuildCustomSetDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
      />
    </Box>
  );
};

export default HomePage;
