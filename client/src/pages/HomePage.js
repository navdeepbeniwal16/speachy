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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Pricing from "../components/Pricing.js";
import PaymentsService from "../services/payments-service.js";
import { AppContext } from "../components/AppContext.js";

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

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, pt: 4, pb: 8, px: 8, fontFamily: "Roboto" }}
    >
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <Typography variant="h2" gutterBottom>
          Welcome{" "}
          <span style={{ color: "darkorange", fontWeight: "bold" }}>
            {auth.currentUser.displayName.split(" ")[0]}
          </span>
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }} gutterBottom>
          Speachy helps you level up your speaking skills for all kinds of
          scenarios. Dive into fun practice sessions, get awesome feedback, and
          gain the confidence to shine in any real-life interaction!
        </Typography>
      </Box>

      <Box id="interview-section" sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          sx={{ textAlign: "center", mb: 4 }}
          gutterBottom
        >
          What are we working on today?
        </Typography>

        <Grid id="catalogue" container spacing={4}>
          <Grid item xs={12} sm={6} md={1}></Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Card
              variant="elevation"
              sx={{
                display: "flex",
                flexDirection: "row",
                minHeight: "110px",
                maxHeight: "130px",
              }}
            >
              <CardActionArea
                disabled={!state.isImpromptuSpeakingEnabled}
                onClick={navigateToImpromptSpeakingPracticePage}
                sx={{ display: "flex", width: "100%" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography gutterBottom variant="h5" component="div">
                    🎤 Impromptu Speaking
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Boost your impromptu speaking with practice and feedback!
                  </Typography>
                  {!state.isImpromptuSpeakingEnabled && (
                    <Typography
                      variant="subtitle2"
                      color="text.primary"
                      sx={{ textAlign: "center", margin: 1 }}
                    >
                      🔒 This is a paid feature
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Card
              variant="elevation"
              sx={{
                display: "flex",
                flexDirection: "row",
                minHeight: "110px",
                maxHeight: "130px",
              }}
            >
              <CardActionArea
                disabled={!state.isInterviewPracticeEnabled}
                onClick={() => navigate("/interview")}
                sx={{ display: "flex", width: "100%" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography gutterBottom variant="h5" component="div">
                    👔 Job Interview Preparation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ace your interviews with practice questions and response
                    analysis!
                  </Typography>
                  {!state.isImpromptuSpeakingEnabled && (
                    <Typography
                      variant="subtitle2"
                      color="text.primary"
                      sx={{ textAlign: "center", margin: 1 }}
                    >
                      🔒 This is a paid feature
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={1}></Grid>
        </Grid>
      </Box>

      {!loading && !state.isImpromptuSpeakingEnabled && <Pricing></Pricing>}

      <Box
        id="feedback"
        sx={{
          pt: { xs: 4, sm: 8 },
          pb: { xs: 8, sm: 12 },
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Feedback
        </Typography>
        <Typography variant="body1">
          Got any feedback for us? If so, please contact us at{" "}
          <Link color="inherit" href="mailto:speachyapp@gmail.com">
            speachyapp@gmail.com
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
