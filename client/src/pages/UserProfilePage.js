import React, { useContext, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
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
import BreadcrumbHeader from "../components/BreadcrumbHeader.js";
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
          `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`,
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

  const LINE = "rgba(252,150,120,0.12)";
  const INK = "#2f170f";
  const INK_2 = "rgba(60,32,25,0.78)";
  const MUTED = "rgba(60,32,25,0.45)";
  const CORAL = "#FA735B";
  const SURFACE_SHADOW = "0 18px 36px rgba(252,150,120,0.10)";
  const labelSx = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: MUTED,
    mb: 1,
  };
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252,150,120,0.35)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(252,150,120,0.6)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: CORAL,
        borderWidth: "1px",
      },
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff4ef",
        minHeight: "100vh",
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="md">
        <BreadcrumbHeader
          parentLabel="Home"
          parentPath="/home"
          currentLabel="Profile"
        />
        <HubHeader title="Profile" />

        {/* Details card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "18px",
            backgroundColor: "#fff",
            border: `1px solid ${LINE}`,
            boxShadow: SURFACE_SHADOW,
            mb: 3,
          }}
        >
          <Typography sx={labelSx}>Avatar</Typography>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={3}
            flexWrap="wrap"
          >
            {avatarSeeds.map((seed, index) => (
              <Avatar
                key={index}
                src={`https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`}
                sx={{
                  width: 52,
                  height: 52,
                  cursor: "pointer",
                  border:
                    selectedAvatar === index
                      ? `2px solid ${CORAL}`
                      : "2px solid transparent",
                  transition: "border-color 120ms ease",
                }}
                onClick={() => setSelectedAvatar(index)}
              />
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
              mb: 3,
            }}
          >
            <Box>
              <Typography sx={labelSx}>Full Name</Typography>
              <TextField
                fullWidth
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                variant="outlined"
                sx={inputSx}
              />
            </Box>
            <Box>
              <Typography sx={labelSx}>Email Address</Typography>
              <TextField
                fullWidth
                size="small"
                value={user?.email}
                variant="outlined"
                disabled
                sx={inputSx}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            sx={{ ...primaryButtonSx, width: "fit-content" }}
            onClick={updateUserDetails}
          >
            Update details
          </Button>
        </Paper>

        {/* Account actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            maxWidth: 480,
          }}
        >
          {[
            { label: "Delete your account", onClick: openDeleteAccountDialog },
            { label: "Sign out", onClick: openSignOutDialog },
          ].map(({ label, onClick }) => (
            <Paper
              key={label}
              elevation={0}
              onClick={onClick}
              sx={{
                p: "14px 20px",
                borderRadius: "14px",
                backgroundColor: "#fff",
                border: `1px solid ${LINE}`,
                boxShadow: "0 2px 8px rgba(252,150,120,0.06)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition:
                  "background-color 120ms ease, box-shadow 120ms ease",
                "&:hover": {
                  backgroundColor: "#fff4ef",
                  boxShadow: "0 4px 16px rgba(252,150,120,0.12)",
                },
              }}
            >
              <Typography sx={{ fontSize: 14, color: INK_2, fontWeight: 500 }}>
                {label}
              </Typography>
              <ArrowForwardIosIcon sx={{ fontSize: 14, color: MUTED }} />
            </Paper>
          ))}
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
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", lineHeight: 1.6 }}
            >
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
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", lineHeight: 1.6 }}
            >
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
      </Container>
    </Box>
  );
};

export default UserProfilePage;
