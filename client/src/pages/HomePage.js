import React, { useContext, useEffect, useState } from "react";
import {
  Typography,
  Container,
  Link,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Pricing from "../components/Pricing.js";
import PaymentsService from "../services/payments-service.js";
import { AppContext } from "../components/AppContext.js";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import MicIcon from "@mui/icons-material/Mic";
// Streak calendar view (scaffold)
import StreakCalendar from "../components/StreakCalendar";

const HomePage = () => {
  const auth = getAuth();
  const { state, setState } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getUserEntitlements = async () => {
    const currentUserUID = auth.currentUser?.uid;

    if (currentUserUID) {
      try {
        const response = await PaymentsService.fetchActiveEntitlements(
          currentUserUID
        );
        const data = response.data;
        if (data.entitlements === undefined || data.entitlements === null) {
          throw new Error("Entitlements not found");
        }

        const entitlements = data.entitlements;
        let isImpromptuSpeakingEnabled = false;
        let isInterviewPracticeEnabled = false;

        for (const entitlement of entitlements) {
          console.log("Entitlement:", entitlement); // TBR for production
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

        console.log("Entitlement managed locally:", state); // TBR for production
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
  }, [auth.currentUser]);

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

  // Demo data for stats and streak calendar
  // Generate some active dates over the last 8 weeks with a current 5-day streak
  const dateToYMD = (d) => {
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeDates = (() => {
    const set = new Set();
    // Ensure a current 5-day streak (includes today)
    for (let i = 0; i < 5; i++) {
      set.add(dateToYMD(addDays(today, -i)));
    }
    // Sprinkle a few other actives in the last ~40 days
    const offsets = [7, 9, 12, 15, 18, 20, 24, 28, 31, 34, 38, 41, 45];
    offsets.forEach((o) => set.add(dateToYMD(addDays(today, -o))));
    return Array.from(set);
  })();

  const stats = {
    sessions: 23,
    confidence: 8.4,
    time: 12, // hours
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        pt: 4,
        pb: 4,
        fontFamily: "Roboto",
        background: "#faf6f4",
        minHeight: "100vh",
      }}
      disableGutters
    >
      {/* Header Section */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <img
          src={process.env.PUBLIC_URL + "/assets/Speachy_Logo_Full_SVG.svg"}
          alt="Speachy Logo"
          style={{ height: 76, marginBottom: 8 }}
        />
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ fontWeight: 500, mb: 0.5, color: "#333" }}
        >
          {getTimeBasedGreeting()},{" "}
          {(auth.currentUser?.displayName?.split(" ")[0] || "User")
            .charAt(0)
            .toUpperCase() +
            (auth.currentUser?.displayName?.split(" ")[0] || "User").slice(1)}
          !{" "}
          <span role="img" aria-label="wave">
            👋
          </span>
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#757575", mb: 2 }}>
          Ready to enhance your communication skills? Let's make today another
          step forward in your speaking journey.
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
        <Grid item xs={12} sm={4} md={4}>
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2,
              border: "1px solid #f0f0f0",
              p: 3,
              textAlign: "center",
            }}
          >
            <TrackChangesIcon sx={{ color: "#ff8350", fontSize: 36, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#333333" }}>
              {stats.sessions}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#757575", fontWeight: 500 }}
            >
              Sessions Completed
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2,
              border: "1px solid #f0f0f0",
              p: 3,
              textAlign: "center",
            }}
          >
            <PersonIcon sx={{ color: "#ff8350", fontSize: 36, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#333333" }}>
              {stats.confidence}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#757575", fontWeight: 500 }}
            >
              Avg. Communication Score
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2,
              border: "1px solid #f0f0f0",
              p: 3,
              textAlign: "center",
            }}
          >
            <AccessTimeIcon sx={{ color: "#ff8350", fontSize: 36, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#333333" }}>
              {stats.time}h
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#757575", fontWeight: 500 }}
            >
              Total Practice Time
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} justifyContent="center">
        {/* Streak Calendar Section */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2,
              border: "1px solid #f0f0f0",
              p: 3,
              height: "100%",
            }}
          >
            <StreakCalendar
              title="Your Weekly Streak"
              activeDates={activeDates}
              showLegend
              highlightCurrentStreak
            />
            <Typography variant="caption" sx={{ color: "#757575", display: "block", mt: 1 }}>
              Activity over the last 8 weeks
            </Typography>
          </Box>
        </Grid>

        {/* Focus Area Cards Section */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2,
              border: "1px solid #f0f0f0",
              p: 3,
              height: "100%",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#222", mb: 2 }}
            >
              What are you working on today?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    "&:hover": {
                      borderColor: "#ff8350",
                    },
                    p: 2,
                  }}
                  onClick={() => navigate("/interview")}
                >
                  <WorkOutlineIcon
                    sx={{ color: "#ff8350", fontSize: 28, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: "#333333" }}
                    >
                      Job Interview Preparation
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#757575" }}>
                      Practice interview questions and improve your responses
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "#ff8350", fontWeight: 700 }}
                    >
                      15-30 min
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    "&:hover": { borderColor: "#ff8350" },
                    p: 2,
                  }}
                  onClick={navigateToImpromptSpeakingPracticePage}
                >
                  <MicIcon sx={{ color: "#ff8350", fontSize: 28, mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: "#333333" }}
                    >
                      Impromptu Speaking
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#757575" }}>
                      Build confidence in spontaneous communication situations
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "#ff8350", fontWeight: 700 }}
                    >
                      10-20 min
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Loading Backdrop */}
      <div>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
          onClick={() => console.log("Backdrop is closed.")}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </Container>
  );
};

export default HomePage;
