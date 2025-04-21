import React, { useContext, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getAuth, updateProfile } from "firebase/auth";
import { AppContext } from "../components/AppContext";
import { useNavigate } from "react-router-dom";
import SnackbarAlert from "../components/SnackbarAlert";

const UserProfilePage = () => {
  const { state, setState } = useContext(AppContext);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const avatarSeeds = ["NB", "GR", "AK", "ZZ", "SH", "PS", "EM", "CK"];
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [fullName, setFullName] = useState(user?.displayName || "");

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  const triggerSnackbar = (type, message) => {
    setSnackbarOpen(false); // reset if open
    setTimeout(() => {
      setSnackbarType(type);
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    }, 100);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (user?.photoURL) {
      const index = avatarSeeds.findIndex(
        (seed) =>
          user.photoURL ===
          `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`
      );
      if (index !== -1) setSelectedAvatar(index);
    }
  }, [user]);

  const updateUserDetails = async () => {
    const avatarURL = `https://api.dicebear.com/9.x/identicon/svg?seed=${avatarSeeds[selectedAvatar]}`;

    try {
      await updateProfile(user, {
        displayName: fullName,
        photoURL: avatarURL,
      });

      console.log("User profile updated.");
      triggerSnackbar("success", "Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      triggerSnackbar("error", "Failed to update profile.");
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setState((prevState) => ({
        ...prevState,
        isImpromptuSpeakingEnabled: false,
        isInterviewPracticeEnabled: false,
      }));
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pt: 4, pb: 4, fontFamily: "Roboto" }}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          // p: { xs: 2, md: 4 },
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Your profile
        </Typography>

        <Typography variant="subtitle1" mb={1} sx={{ fontWeight: "bold" }}>
          Avatar
        </Typography>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          {avatarSeeds.map((seed, index) => (
            <Avatar
              key={index}
              src={`https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`}
              sx={{
                width: 56,
                height: 56,
                cursor: "pointer",
                border:
                  selectedAvatar === index
                    ? "2px solid #ff7a18"
                    : "2px solid transparent",
              }}
              onClick={() => setSelectedAvatar(index)}
            />
          ))}
        </Box>

        <Box maxWidth="400px" mb={2}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
            Full Name
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            variant="outlined"
          />
        </Box>

        <Box maxWidth="400px" mb={3}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
            Email Address
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={user?.email}
            variant="outlined"
            disabled
          />
        </Box>

        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
            color: "#fff",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 2,
            px: 4,
            py: 1.5,
            width: "fit-content",
          }}
          onClick={updateUserDetails}
        >
          Update details
        </Button>

        <Box position="relative" mt={6}>
          <Divider />
        </Box>

        <Box mt={4} maxWidth="500px">
          {[
            "Upgrade your plan", // TODO: Include this for paid versions
            "Forgot your password?",
            "Delete your account",
          ].map((label, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "#fff",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>{label}</Typography>
              <ArrowForwardIosIcon
                sx={{ height: "22px", width: "22px" }}
                style={{ color: "#FA735B" }}
              />
            </Paper>
          ))}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: "#fff",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={signOut}
          >
            <Typography>Sign Out</Typography>
            <ArrowForwardIosIcon
              sx={{ height: "22px", width: "22px" }}
              style={{ color: "#FA735B" }}
            />
          </Paper>
        </Box>

        <SnackbarAlert
          alertType={snackbarType}
          alertMessage={snackbarMessage}
          isOpen={snackbarOpen}
          onClose={handleSnackbarClose}
        />
      </Box>
    </Container>
  );
};

export default UserProfilePage;
