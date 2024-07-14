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

const HomePage = () => {
  const auth = getAuth();
  const db = getFirestore(firebaseApp);
  const [isOnPremiumPlan, setIsOnPremiumPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const navigate = useNavigate();

  const availFreeTrial = async () => {
    const currentUserUID = auth.currentUser?.uid;
    const currentUserEmail = auth.currentUser?.email;

    if (currentUserUID) {
      try {
        const docRef = await addDoc(collection(db, "free-trial"), {
          userUID: currentUserUID,
          isTrialAvailed: true,
          userEmail: currentUserEmail,
        });
        console.log("Free trial document written with ID: ", docRef.id);
        setIsOnPremiumPlan(true);
        auth.currentUser.isOnPremiumPlan = true;
        setShowSnackbar(true);
      } catch (error) {
        console.error("Error availing free trial: ", error);
      }
    }
  };

  const checkForFreeTrial = async () => {
    const currentUserUID = auth.currentUser?.uid;

    if (currentUserUID) {
      try {
        const dbQuery = query(
          collection(db, "free-trial"),
          where("userUID", "==", currentUserUID)
        );
        const querySnapshot = await getDocs(dbQuery);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isTrialAvailed) {
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
      checkForFreeTrial();
    } else {
      setLoading(false);
    }
  }, [auth.currentUser]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pt: 4, pb: 8, fontFamily: "Roboto" }}>
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
          <Grid item xs={12} sm={6}>
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
                    🎤 Impromptu Speaking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Boost your impromptu speaking with practice and feedback!
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
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
        </Grid>
      </Box>

      {loading ? (
        <Box></Box>
      ) : (
        !isOnPremiumPlan && (
          <Container sx={{ mt: 4, mb: 8 }}>
            <Paper
              elevation={1}
              sx={{ p: 4, textAlign: "center", backgroundColor: "#f7f9fc" }}
            >
              <Box id="free-trial" sx={{ py: 3 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ color: "orange", fontWeight: "bold" }}
                >
                  Enjoy a 3 Months Free Trial
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Unlock your potential and improve your communication skills
                  with Speachy.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Click the button below to avail the free trial.
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  onClick={availFreeTrial}
                  sx={{ mt: 2 }}
                >
                  Get Free Trial
                </Button>
              </Box>
            </Paper>
          </Container>
        )
      )}

      <Box id="feedback" sx={{ mt: 4, pb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Feedback
        </Typography>
        <Typography variant="body1">
          Got any feedback for us? If so, please contact us at{" "}
          <Link color="inherit" href="mailto:navdeepbeniwal16@gmail.com">
            navdeepbeniwal16@gmail.com
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
