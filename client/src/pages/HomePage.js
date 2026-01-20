import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Typography,
  Container,
  Box,
  Grid,
  Backdrop,
  CircularProgress,
  Stack,
  Chip,
  Paper,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import PaymentsService from "../services/payments-service.js";
import { AppContext } from "../components/AppContext.js";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import MicIcon from "@mui/icons-material/Mic";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// Streak calendar view (scaffold)
import StreakCalendar from "../components/StreakCalendar";
import StreakService from "../services/streak-service.js";
import SessionService from "../services/session-service.js";

const FETCH_INTERVAL_MS = 5 * 60 * 1000; // avoid refetching more than once every 5 minutes
const PAGE_BG = "#fff4ef";
const SURFACE_BG = "#ffffff";
const SURFACE_BORDER = "1px solid rgba(252, 150, 120, 0.12)";
const SURFACE_SHADOW = "0 18px 36px rgba(252, 150, 120, 0.15)";
const HEADING_COLOR = "#2f170f";
const BODY_COLOR = "rgba(60,32,25,0.78)";
const MUTED_COLOR = "rgba(60,32,25,0.45)";

const MemoizedStreakCalendar = React.memo(StreakCalendar);

const StatHighlights = React.memo(({ stats }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={4}
    sx={{ mb: { xs: 2, md: 0 } }}
  >
    {stats.map((item) => (
      <Stack key={item.label} direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffe3d6",
            color: "#f46a32",
            transform: "translateY(-2px)",
          }}
        >
          {item.icon}
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: HEADING_COLOR,
              fontWeight: 700,
              mb: 0.2,
              lineHeight: 1.1,
            }}
          >
            {item.value}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: BODY_COLOR, lineHeight: 1.2 }}
          >
            {item.label}
          </Typography>
        </Box>
      </Stack>
    ))}
  </Stack>
));

const HomePage = () => {
  const auth = getAuth();
  const { setState } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const entitlementsFetchRef = useRef(0);
  const streakFetchRef = useRef(0);
  const sessionsFetchRef = useRef(0);

  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;

  const getUserEntitlements = async () => {
    const currentUserUID = auth.currentUser?.uid;

    if (currentUserUID) {
      const now = Date.now();
      if (now - entitlementsFetchRef.current < FETCH_INTERVAL_MS) {
        setLoading(false);
        return;
      }
      entitlementsFetchRef.current = now;
      try {
        const response =
          await PaymentsService.fetchActiveEntitlements(currentUserUID);
        const data = response.data;
        if (data.entitlements === undefined || data.entitlements === null) {
          throw new Error("Entitlements not found");
        }

        const entitlements = data.entitlements;
        let isImpromptuSpeakingEnabled = false;
        let isInterviewPracticeEnabled = false;

        for (const entitlement of entitlements) {
          if (entitlement.lookup_key === "impromptu_speaking_01") {
            isImpromptuSpeakingEnabled = true;
          }
          if (entitlement.lookup_key === "interview_practice_01") {
            isInterviewPracticeEnabled = true;
          }
        }

        setState((prevState) => ({
          ...prevState,
          isImpromptuSpeakingEnabled,
          isInterviewPracticeEnabled,
        }));
      } catch (error) {
        console.error("Error fetching/assigning entitlements: ", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      getUserEntitlements();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const navigateToImpromptSpeakingPracticePage = () => {
    navigate("/imprompt");
  };

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Streak calendar data
  const [activeDates, setActiveDates] = useState([]);
  const [sessionsCount, setSessionsCount] = useState(0);
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
    // Align grid start to Sunday for 8 weeks back
    const start = addDays(today, -7 * (8 - 1));
    const gridStart = addDays(start, -start.getDay()); // move back to Sun
    return { from: ymd(gridStart), to: ymd(today) };
  };

  const computeWeekRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    const monday = addDays(today, -daysSinceMonday);
    return { from: ymd(monday), to: ymd(today) };
  };
  const totalPracticeHours = 12; // placeholder until analytics service lands
  const { from: weekFrom, to: weekTo } = useMemo(computeWeekRange, []);
  const activeDaysCount = useMemo(
    () =>
      activeDates.filter((date) => date >= weekFrom && date <= weekTo).length,
    [activeDates, weekFrom, weekTo],
  );
  const statHighlightsData = useMemo(
    () => [
      {
        icon: <TrackChangesIcon sx={{ fontSize: 28 }} />,
        label: "Sessions completed",
        value: sessionsCount,
      },
      {
        icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />,
        label: "Active practice days",
        value: activeDaysCount,
      },
      // {
      //   icon: <AccessTimeIcon sx={{ fontSize: 28 }} />,
      //   label: "Total time spoken",
      //   value: `${totalPracticeHours}h`,
      // },
    ],
    [sessionsCount, activeDaysCount],
  );

  useEffect(() => {
    const loadActivity = async () => {
      if (!auth.currentUser) return;
      const now = Date.now();
      if (now - streakFetchRef.current < FETCH_INTERVAL_MS) return;
      streakFetchRef.current = now;
      try {
        const { from, to } = computeRange();
        const data = await StreakService.activity(from, to);
        setActiveDates(Array.isArray(data.dates) ? data.dates : []);
      } catch (e) {
        console.warn("Failed to fetch streak activity:", e);
      }
    };
    loadActivity();
  }, [userId]);

  useEffect(() => {
    const loadSessionsStats = async () => {
      if (!auth.currentUser) return;
      const now = Date.now();
      if (now - sessionsFetchRef.current < FETCH_INTERVAL_MS) return;
      sessionsFetchRef.current = now;
      try {
        const data = await SessionService.stats(weekFrom, weekTo);
        const weeklySessions =
          data?.rangeSessions !== undefined
            ? Number(data.rangeSessions)
            : Number(data?.totalSessions) || 0;
        setSessionsCount(weeklySessions);
      } catch (e) {
        console.warn("Failed to fetch sessions stats:", e);
      }
    };
    loadSessionsStats();
  }, [userId]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: PAGE_BG,
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          spacing={{ xs: 4, md: 5 }}
          sx={{
            px: { xs: 0, md: 2 },
          }}
        >
          {/* Hero / Greeting */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: SURFACE_BG,
              borderRadius: 4,
              px: { xs: 3, md: 4 },
              py: { xs: 4, md: 5 },
              border: SURFACE_BORDER,
              boxShadow: SURFACE_SHADOW,
            }}
          >
            <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch">
              <Grid item xs={12} md={7}>
                <Stack spacing={2.5} sx={{ height: "100%" }}>
                  <Chip
                    label="Daily progress"
                    color="warning"
                    sx={{
                      alignSelf: "flex-start",
                      backgroundColor: "#FA735B",
                      color: "#fff",
                      fontWeight: 600,
                      letterSpacing: 0.3,
                    }}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: HEADING_COLOR,
                      lineHeight: 1.1,
                    }}
                  >
                    {getTimeBasedGreeting()},{" "}
                    {(auth.currentUser?.displayName?.split(" ")[0] || "Speaker")
                      .charAt(0)
                      .toUpperCase() +
                      (
                        auth.currentUser?.displayName?.split(" ")[0] ||
                        "Speaker"
                      ).slice(1)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: BODY_COLOR,
                      fontWeight: 400,
                    }}
                  >
                    Ready to take your communication skills to the next level?
                    Let's make today another step forward in your speaking
                    journey.
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: MUTED_COLOR,
                      fontWeight: 600,
                      letterSpacing: 0.2,
                      textTransform: "uppercase",
                    }}
                  >
                    Weekly stats
                  </Typography>
                  <StatHighlights stats={statHighlightsData} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    px: 3,
                    py: 3,
                    backgroundColor: SURFACE_BG,
                    border: SURFACE_BORDER,
                    boxShadow: SURFACE_SHADOW,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: BODY_COLOR, fontWeight: 600, mb: 1 }}
                  >
                    Your practice streak
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: HEADING_COLOR, fontWeight: 600, mb: 2 }}
                  >
                    A quick look at recent activity.
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
          </Paper>

          {/* Main Grid */}
          <Grid container spacing={{ xs: 4, md: 0 }}>
            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 4,
                  px: { xs: 3, md: 4 },
                  pt: { xs: 4, md: 4.5 },
                  pb: { xs: 3, md: 3.5 },
                  backgroundColor: SURFACE_BG,
                  border: SURFACE_BORDER,
                  boxShadow: SURFACE_SHADOW,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 3,
                  margin: 2,
                }}
              >
                <Stack spacing={1.5}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: BODY_COLOR, fontWeight: 600 }}
                  >
                    Recommended next step
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: HEADING_COLOR, fontWeight: 600 }}
                  >
                    Pick up with impromptu warm-ups
                  </Typography>
                  <Typography variant="body2" sx={{ color: BODY_COLOR }}>
                    A focused warm-up to get your voice moving.
                  </Typography>
                </Stack>
                <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                  <Box
                    component="img"
                    src="/assets/impromptu_speaking.png"
                    alt="Impromptu speaking focus"
                    loading="lazy"
                    decoding="async"
                    sx={{
                      width: "100%",
                      maxWidth: 260,
                      maxHeight: 160,
                      objectFit: "contain",
                      mx: { xs: 0, md: "auto" },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={navigateToImpromptSpeakingPracticePage}
                    sx={{
                      alignSelf: "flex-start",
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
                    }}
                  >
                    Resume practice
                  </Button>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 4,
                  px: { xs: 3, md: 4 },
                  pt: { xs: 4, md: 4.5 },
                  pb: { xs: 3, md: 3.5 },
                  backgroundColor: SURFACE_BG,
                  border: SURFACE_BORDER,
                  boxShadow: SURFACE_SHADOW,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2.5,
                  margin: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: HEADING_COLOR, fontWeight: 700, mb: 0.5 }}
                  >
                    What do you want to work on today?
                  </Typography>
                  <Typography variant="body2" sx={{ color: BODY_COLOR }}>
                    Choose a practice lane whenever you're ready.
                  </Typography>
                </Box>
                <List disablePadding sx={{ flexGrow: 1 }}>
                  {[
                    {
                      title: "Job Interviews",
                      description:
                        "Work through targeted questions, capture AI feedback, and refine replies.",
                      iconColor: "rgba(250,115,91,0.95)",
                      icon: (
                        <WorkOutlineIcon
                          sx={{ color: "inherit", fontSize: 24 }}
                        />
                      ),
                      duration: "15-30 min",
                      action: () => navigate("/interview"),
                    },
                    {
                      title: "Impromptu Speaking",
                      description:
                        "Stay comfortable with spontaneous prompts and soft skills drills.",
                      iconColor: "rgba(250,115,91,0.95)",
                      icon: <MicIcon sx={{ color: "inherit", fontSize: 24 }} />,
                      duration: "10-20 min",
                      action: navigateToImpromptSpeakingPracticePage,
                    },
                  ].map((item) => (
                    <ListItem
                      key={item.title}
                      onClick={item.action}
                      sx={{
                        borderRadius: 3,
                        mb: 1.5,
                        px: 2.5,
                        py: 2,
                        backgroundColor: "#fff8f4",
                        border: SURFACE_BORDER,
                        cursor: "pointer",
                        transition:
                          "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: SURFACE_SHADOW,
                          borderColor: "rgba(252, 150, 120, 0.3)",
                        },
                      }}
                      secondaryAction={
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(250,115,91,0.9)",
                              fontWeight: 600,
                            }}
                          >
                            {item.duration}
                          </Typography>
                          <ArrowForwardIosIcon
                            fontSize="small"
                            sx={{ color: MUTED_COLOR }}
                          />
                        </Stack>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: "rgba(250,115,91,0.12)",
                            color: item.iconColor,
                            width: 48,
                            height: 48,
                          }}
                        >
                          {item.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{ color: HEADING_COLOR, fontWeight: 600 }}
                          >
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{ color: BODY_COLOR }}
                          >
                            {item.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default HomePage;
