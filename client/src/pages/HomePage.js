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
    <Container maxWidth="md" sx={{ mt: 4, pt: 4, fontFamily: "Roboto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Welcome to <span style={{ color: "darkorange" }}>Speachy</span>
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Speachy helps you level up your speaking skills for all kinds of
        scenarios. Dive into fun practice sessions, get awesome feedback, and
        gain the confidence to shine in any real-life interaction!
      </Typography>

      <Box id="interview-section" sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          Please click the button to go to the Interview Home page
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/interview")}
        >
          Interview Home
        </Button>
      </Box>

      {loading ? (
        <Box></Box>
      ) : (
        !isOnPremiumPlan && (
          <Container sx={{ mt: 4, mb: 4 }}>
            <Paper
              elevation={1}
              sx={{ p: 4, textAlign: "center", backgroundColor: "#f7f9fc" }}
            >
              <Box id="free-trial" sx={{ py: 3 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ color: "#3f51b5", fontWeight: "bold" }}
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
                  color="primary"
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

      <Box id="feedback" sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
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
