import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Link,
  Box,
  Button,
  Paper,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { firebaseApp } from "../services/firebase.js";
import Pricing from "../components/Pricing.js";

const HomePage = () => {
  const auth = getAuth();
  const db = getFirestore(firebaseApp);
  const [isOnPremiumPlan, setIsOnPremiumPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const navigate = useNavigate();

  // const availFreeTrial = async () => {
  //   const currentUserUID = auth.currentUser?.uid;
  //   const currentUserEmail = auth.currentUser?.email;

  //   if (currentUserUID) {
  //     try {
  //       const docRef = await addDoc(collection(db, "free-trial"), {
  //         userUID: currentUserUID,
  //         isTrialAvailed: true,
  //         userEmail: currentUserEmail,
  //       });
  //       console.log("Free trial document written with ID: ", docRef.id);
  //       setIsOnPremiumPlan(true);
  //       auth.currentUser.isOnPremiumPlan = true;
  //       setShowSnackbar(true);
  //     } catch (error) {
  //       console.error("Error availing free trial: ", error);
  //     }
  //   }
  // };

  const checkForSubscription = async () => {
    const currentUserUID = auth.currentUser?.uid;

    if (currentUserUID) {
      try {
        const dbQuery = query(
          collection(db, "subscriptions"),
          where("userUID", "==", currentUserUID)
        );
        const querySnapshot = await getDocs(dbQuery);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isOnPremiumPlan) {
            setIsOnPremiumPlan(true);
            auth.currentUser.isOnPremiumPlan = true;
          }
        });
      } catch (error) {
        console.error("Error checking free trial: ", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (auth.currentUser) {
      checkForSubscription();
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
        <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold" }}>
          Welcome to <span style={{ color: "darkorange" }}>Speachy</span>
        </Typography>
        <Typography variant="h5" sx={{ mb: 4 }} gutterBottom>
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
              sx={{ display: "flex", flexDirection: "row", height: "110px" }}
            >
              <CardActionArea
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
                  <Typography variant="body2" color="text.secondary">
                    Boost your impromptu speaking with practice and feedback!
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Card
              variant="elevation"
              sx={{ display: "flex", flexDirection: "row", height: "110px" }}
            >
              <CardActionArea
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
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={1}></Grid>
        </Grid>
      </Box>

      {loading ? <Box></Box> : !isOnPremiumPlan && <Pricing></Pricing>}

      <Box id="feedback" sx={{ mt: 4, pb: 4, textAlign: "center" }}>
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

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        key={"bottom" + "center"}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          🎉 Congratulations! You have successfully availed the free trial!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HomePage;
