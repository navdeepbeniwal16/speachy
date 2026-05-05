import React, { useContext, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { deleteUser, getAuth, updateProfile } from "firebase/auth";
import { AppContext } from "../components/AppContext";
import HubHeader from "../components/HubHeader.js";
import { useNavigate } from "react-router-dom";
import SnackbarAlert from "../components/SnackbarAlert";

const UserProfilePage = () => {
  const { state, setState } = useContext(AppContext);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const primaryButtonSx = {
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
  };

  const avatarSeeds = ["NB", "GR", "AK", "ZZ", "SH", "PS", "EM", "CK", "LL"];
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [fullName, setFullName] = useState(user?.displayName || "");

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      await deleteUser(user);
      setState((prevState) => ({
        ...prevState,
        isImpromptuSpeakingEnabled: false,
        isInterviewPracticeEnabled: false,
      }));
      navigate("/");
    } catch (error) {
      const requiresRecentLogin =
        error?.code === "auth/requires-recent-login" ||
        error?.code === "auth/user-token-expired";
      const message = requiresRecentLogin
        ? "Please sign in again to delete your account."
        : "Unable to delete your account right now. Please try again.";
      triggerSnackbar("error", message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const openSignOutDialog = () => {
    setSignOutDialogOpen(true);
  };

  const closeSignOutDialog = () => {
    setSignOutDialogOpen(false);
  };

  const confirmSignOut = async () => {
    setSignOutDialogOpen(false);
    await signOut();
  };

  const openDeleteAccountDialog = () => {
    setDeleteAccountDialogOpen(true);
  };

  const closeDeleteAccountDialog = () => {
    setDeleteAccountDialogOpen(false);
  };

  const confirmDeleteAccount = async () => {
    setDeleteAccountDialogOpen(false);
    await handleDeleteAccount();
  };

  return (
    <Box sx={{ backgroundColor: "#fff4ef", minHeight: "100vh" }}>
      <Container
        maxWidth="lg"
        sx={{ mt: 0, pt: { xs: 4, md: 6 }, pb: 6, fontFamily: "Roboto" }}
      >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          // p: { xs: 2, md: 4 },
        }}
      >
        <HubHeader title="Profile" />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            backgroundColor: "#fff",
            border: "1px solid #f0e6e1",
            boxShadow: "0 2px 8px rgba(250, 115, 91, 0.06)",
          }}
        >
          <Typography
            variant="subtitle2"
            mb={1.5}
            sx={{
              fontWeight: 700,
              letterSpacing: 0.2,
              textTransform: "uppercase",
              color: "rgba(60,32,25,0.72)",
            }}
          >
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

          <Box maxWidth="400px" mb={2.5}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.2,
                textTransform: "uppercase",
                color: "rgba(60,32,25,0.72)",
              }}
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
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.2,
                textTransform: "uppercase",
                color: "rgba(60,32,25,0.72)",
              }}
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
            sx={{ ...primaryButtonSx, width: "fit-content" }}
            onClick={updateUserDetails}
          >
            Update details
          </Button>
        </Paper>

        <Box position="relative" mt={6}>
          <Divider />
        </Box>

        <Box mt={4} maxWidth="500px">
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: "#fff",
              border: "1px solid #f0e6e1",
              boxShadow: "0 1px 4px rgba(250, 115, 91, 0.04)",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#fff4ef",
              },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={openDeleteAccountDialog}
          >
            <Typography>Delete your account</Typography>
            <ArrowForwardIosIcon
              sx={{ height: "22px", width: "22px" }}
              style={{ color: "#FA735B" }}
            />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: "#fff",
              border: "1px solid #f0e6e1",
              boxShadow: "0 1px 4px rgba(250, 115, 91, 0.04)",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#fff4ef",
              },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={openSignOutDialog}
          >
            <Typography>Sign Out</Typography>
            <ArrowForwardIosIcon
              sx={{ height: "22px", width: "22px" }}
              style={{ color: "#FA735B" }}
            />
          </Paper>
        </Box>

        <Dialog
          open={signOutDialogOpen}
          onClose={closeSignOutDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#fff",
              borderBottom: "1px solid #f0e6e1",
              fontWeight: "bold",
              py: 2.2,
            }}
          >
            Sign out of Speachy?
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
              Are you sure you want to sign out of your account?
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              p: 3,
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              onClick={closeSignOutDialog}
              variant="outlined"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 3,
                px: 3.5,
                py: 1,
                minWidth: 120,
                borderColor: "#e1cfc6",
                color: "#5c4033",
                "&:hover": {
                  borderColor: "#d4bfb5",
                  backgroundColor: "#fff4ef",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSignOut}
              variant="contained"
              color="warning"
              sx={{ ...primaryButtonSx, minWidth: 140 }}
            >
              Sign out
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteAccountDialogOpen}
          onClose={closeDeleteAccountDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#fff",
              borderBottom: "1px solid #f0e6e1",
              fontWeight: "bold",
              py: 2.2,
            }}
          >
            Delete your account?
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
              This action permanently deletes your account and cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              p: 3,
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              onClick={closeDeleteAccountDialog}
              variant="outlined"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 3,
                px: 3.5,
                py: 1,
                minWidth: 120,
                borderColor: "#e1cfc6",
                color: "#5c4033",
                "&:hover": {
                  borderColor: "#d4bfb5",
                  backgroundColor: "#fff4ef",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAccount}
              variant="contained"
              sx={{
                ...primaryButtonSx,
                minWidth: 160,
                backgroundColor: "#E4573D",
                boxShadow:
                  "0px 12px 24px -12px rgba(228,87,61,0.6), 0px 10px 18px -14px rgba(49,30,20,0.35)",
                "&:hover": {
                  backgroundColor: "#d64d36",
                  boxShadow:
                    "0px 14px 26px -12px rgba(228,87,61,0.7), 0px 12px 18px -14px rgba(49,30,20,0.35)",
                },
              }}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? "Deleting..." : "Delete account"}
            </Button>
          </DialogActions>
        </Dialog>

        <SnackbarAlert
          alertType={snackbarType}
          alertMessage={snackbarMessage}
          isOpen={snackbarOpen}
          onClose={handleSnackbarClose}
        />
      </Box>
      </Container>
    </Box>
  );
};

export default UserProfilePage;
