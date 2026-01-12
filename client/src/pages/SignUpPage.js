import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  Container,
  CssBaseline,
  Stack,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Badge,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { Link } from "react-router-dom";
import { firebaseApp } from "../services/firebase.js";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const logoStyle = {
  width: "100%",
  height: "auto",
  cursor: "pointer",
};

const SignUp = () => {
  const auth = getAuth();
  const db = getFirestore(firebaseApp);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSignUpError, setIsSignUpError] = useState(false);
  const [signUpError, setSignUpError] = useState(true);
  const snackbarVertical = "bottom";
  const snackbarHorizontal = "center";
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [heroPreviewSrc, setHeroPreviewSrc] = useState(
    "/assets/speachy_promo_transparent.png"
  );

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTermsDialogOpen = () => {
    setTermsDialogOpen(true);
  };

  const handleTermsDialogClose = () => {
    setTermsDialogOpen(false);
  };

  const handleDemoDialogOpen = () => {
    setDemoDialogOpen(true);
  };

  const handleDemoDialogClose = () => {
    setDemoDialogOpen(false);
  };

  const validate = () => {
    let tempErrors = {};
    tempErrors.name = name ? "" : "Name is required";
    tempErrors.email = /\S+@\S+\.\S+/.test(email) ? "" : "Email is not valid";
    tempErrors.password =
      password.length > 6 ? "" : "Password must be at least 6 characters long";
    tempErrors.terms = acceptedTerms
      ? ""
      : "You must accept the Terms and Conditions";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      setIsSigningUp(true);
      try {
        // Signup user onto Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log("User is Signed Up:", user);

        // Sending email for verification
        await sendEmailVerification(auth.currentUser);

        // Update user profile
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        console.log("User profile updated!");

        const subscriptionDocSetupResult = await setDoc(
          doc(db, "subscriptions", auth.currentUser.uid),
          {
            email: auth.currentUser.email,
            userUID: auth.currentUser.uid,
          }
        );
        console.log(
          "Subscription document written:",
          subscriptionDocSetupResult
        );
        navigate("/");
      } catch (error) {
        console.error("Error occurred during sign up or profile update:");
        console.log(error);

        handleSignUpError(error);
      } finally {
        setIsSigningUp(false);
      }
    }
  };

  const extractErrorCode = (errorMessage) => {
    const match = errorMessage.match(/\(auth\/([^)]+)\)/);
    return match ? match[1] : null;
  };

  const handleSignUpError = (error) => {
    setIsSignUpError(true);
    const errorCode = error.code ? error.code : extractErrorCode(error.message);
    console.log("Extracted error code:", errorCode);

    switch (errorCode) {
      case "auth/email-already-in-use":
        setSignUpError(
          "The email address is already in use. Please use a different email."
        );
        break;
      case "auth/invalid-email":
        setSignUpError("The email address you entered is not valid.");
        break;
      case "auth/weak-password":
        setSignUpError(
          "The password is too weak. Please choose a stronger password."
        );
        break;
      case "auth/operation-not-allowed":
        setSignUpError(
          "Account creation is currently disabled. Please try again later."
        );
        break;
      default:
        setSignUpError("An unexpected error occurred. Please try again later.");
        break;
    }
  };

  const getEnvironmentLabel = () => {
    const env = process.env.REACT_APP_ENV;
    return env === "local"
      ? "Local"
      : env === "development"
      ? "Development"
      : env === "production"
      ? "Early Access"
      : "Unknown";
  };

  const handleScrollToSignup = () => {
    const signupSection = document.getElementById("signup-form");
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const stepCards = [
    {
      step: "01",
      title: "Speak naturally",
      body: "Answer out loud.",
      image: "/assets/speachy_waveform_step1.svg",
      fallbackImage: "/assets/speachy_step1_waveform.svg",
    },
    {
      step: "02",
      title: "Instant feedback",
      body: "What worked. What to try next.",
      image: "/assets/speachy_step2_feedback_infographic.svg",
      fallbackImage: "/assets/speachy_step2_feedback.svg",
      isHero: true,
    },
    {
      step: "03",
      title: "Track progress",
      body: "Clarity, structure, relevance.",
      image: "/assets/speachy_step3_progress_clean.svg",
      fallbackImage: "/assets/speachy_step3_progress.svg",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff8f5 0%, #ffe4db 40%, #fff9f5 100%)",
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 10 },
      }}
    >
      <CssBaseline />
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          top: -160,
          right: -140,
          background: "rgba(250, 115, 91, 0.18)",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 360,
          bottom: -140,
          left: -120,
          background: "rgba(255, 180, 130, 0.16)",
          filter: "blur(70px)",
        borderRadius: "50%",
      }}
    />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid
          container
          spacing={{ xs: 6, md: 10 }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 3, md: 3.5 }} sx={{ maxWidth: 520 }}>
              <Chip
                label="Early access • Help shape Speachy"
                color="warning"
                sx={{
                  alignSelf: "flex-start",
                  background:
                    "linear-gradient(90deg, rgba(255,142,83,0.9) 0%, rgba(250,115,91,0.9) 100%)",
                  color: "#fff",
                  fontWeight: 600,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "#2d1b16",
                  lineHeight: 1.1,
                }}
              >
                Find your voice with Speachy
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "rgba(55, 34, 26, 0.7)", fontWeight: 400 }}
              >
                Practice speaking out loud. Get feedback that actually helps.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleScrollToSignup}
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    px: 4,
                    py: 1.6,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    background:
                      "linear-gradient(90deg, #FF8E53 0%, #FA735B 100%)",
                    boxShadow:
                      "0px 12px 24px -12px rgba(250, 115, 91, 0.7), 0px 10px 18px -14px rgba(49, 30, 20, 0.35)",
                    "&:hover": { filter: "brightness(0.95)" },
                  }}
                >
                  Start practicing for free
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleDemoDialogOpen}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1.6,
                    color: "rgba(228, 71, 36, 0.94)",
                    borderColor: "rgba(228, 71, 36, 0.4)",
                    "&:hover": {
                      borderColor: "rgba(228, 71, 36, 0.7)",
                      backgroundColor: "rgba(255, 255, 255, 0.4)",
                    },
                  }}
                >
                  Watch 30s demo
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                borderRadius: 4,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                boxShadow:
                  "0px 24px 50px -36px rgba(250, 115, 91, 0.55), 0px 16px 40px -30px rgba(49, 30, 20, 0.2)",
                p: { xs: 1.5, sm: 2.5 },
              }}
            >
              {/* <Box
                sx={{
                  position: "absolute",
                  top: { xs: 18, sm: 22 },
                  left: { xs: 16, sm: 22 },
                  display: { xs: "none", sm: "inline-flex" },
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
                  boxShadow:
                    "0px 12px 26px -18px rgba(250, 115, 91, 0.45)",
                  border: "1px solid rgba(250, 115, 91, 0.16)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "rgba(60, 32, 25, 0.8)",
                }}
              >
                Feedback that feels kind
              </Box> */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: 16, sm: 20 },
                  right: { xs: 16, sm: 22 },
                  display: { xs: "none", sm: "flex" },
                  width: 120,
                  height: 70,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  boxShadow:
                    "0px 16px 30px -20px rgba(250, 115, 91, 0.5)",
                  border: "1px solid rgba(250, 115, 91, 0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.6,
                  px: 1.2,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: "rgba(250, 115, 91, 0.45)",
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: "rgba(250, 115, 91, 0.75)",
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 22,
                    borderRadius: 6,
                    backgroundColor: "rgba(250, 115, 91, 0.35)",
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 34,
                    borderRadius: 6,
                    backgroundColor: "rgba(250, 115, 91, 0.6)",
                  }}
                />
              </Box>
              <Box
                component="img"
                src={heroPreviewSrc}
                alt="Speachy feedback preview"
                onError={() =>
                  setHeroPreviewSrc("/assets/speachy_promo_graphic.svg")
                }
                sx={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 3,
                }}
              />
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: { xs: 6, md: 8 }, position: "relative" }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "rgba(60, 32, 25, 0.75)",
              fontWeight: 600,
              mb: 2.5,
            }}
          >
            How it works
          </Typography>
          <Box
            sx={{
              position: "absolute",
              left: "8%",
              right: "8%",
              top: 132,
              borderTop: "1px dashed rgba(250, 115, 91, 0.22)",
              zIndex: 0,
              display: { xs: "none", md: "block" },
            }}
          />
          <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ position: "relative", zIndex: 1 }}>
            {stepCards.map((step) => (
              <Grid key={step.title} item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    height: "100%",
                    minHeight: step.isHero ? 210 : 190,
                    p: step.isHero ? 3.5 : 3,
                    borderRadius: 3,
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(250, 115, 91, 0.14)",
                    boxShadow:
                      step.isHero
                        ? "0px 22px 44px -26px rgba(250, 115, 91, 0.6)"
                        : "0px 16px 34px -28px rgba(250, 115, 91, 0.55)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transform: step.isHero ? "translateY(-8px)" : "none",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 153, 110, 0.2)",
                      color: "rgba(228, 71, 36, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {step.step}
                  </Box>
                  <Box
                    sx={{
                      width: step.isHero ? 104 : 88,
                      height: step.isHero ? 64 : 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      mt: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={step.image}
                      alt=""
                      aria-hidden="true"
                      onError={(event) => {
                        event.currentTarget.src = step.fallbackImage;
                      }}
                      sx={{ width: "100%", height: "auto" }}
                    />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "#2d1b16", mb: 1 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(55, 34, 26, 0.7)" }}
                  >
                    {step.body}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="text"
            color="warning"
            onClick={handleScrollToSignup}
            sx={{
              mt: 3.5,
              textTransform: "none",
              fontWeight: 600,
              color: "rgba(228, 71, 36, 0.94)",
              alignSelf: "flex-start",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Start practicing for free →
          </Button>
        </Box>
      </Container>
      <Container maxWidth="lg" sx={{ mt: { xs: 10, md: 14 } }}>
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {[
                "Real prompts (interviews + impromptu)",
                "Gentle, specific suggestions",
              ].map((item) => (
                <Grid key={item} item xs={12} sm={6}>
                  <Box
                    sx={{
                      height: "100%",
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid rgba(250, 115, 91, 0.12)",
                      boxShadow:
                        "0px 14px 26px -24px rgba(250, 115, 91, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <CheckCircleRoundedIcon
                      sx={{ color: "rgba(250, 115, 91, 0.9)" }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "rgba(55, 34, 26, 0.85)" }}
                    >
                      {item}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box
              sx={{
                mt: 6,
                p: 2.5,
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow:
                  "0px 20px 45px -28px rgba(250, 115, 91, 0.6), 0px 18px 40px -24px rgba(49, 30, 20, 0.18)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#2d1b16",
                  fontWeight: 600,
                  mb: 1.5,
                }}
              >
                On our immediate roadmap
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[
                  "Mock interviews",
                  "Projects creation",
                  "Tongue twister drills",
                ].map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(250, 115, 91, 0.35)",
                      color: "rgba(55,34,26,0.75)",
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            {isSigningUp && (
              <Box sx={{ width: "100%", mb: 2 }}>
                <LinearProgress
                  color="warning"
                  sx={{
                    height: 6,
                    borderRadius: 3,
                  }}
                />
              </Box>
            )}
            <Paper
              id="signup-form"
              elevation={0}
              sx={{
                backdropFilter: "blur(18px)",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                borderRadius: 4,
                px: { xs: 3, sm: 4 },
                py: { xs: 4, sm: 5 },
                boxShadow:
                  "0px 24px 60px -32px rgba(250, 115, 91, 0.55), 0px 28px 70px -40px rgba(49, 30, 20, 0.25)",
              }}
            >
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Link to="/">
                  <Badge
                    color="warning"
                    badgeContent={getEnvironmentLabel()}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <img
                      src="/assets/Speachy_Logo_Full_SVG.svg"
                      style={logoStyle}
                      alt="Speachy Logo"
                    />
                  </Badge>
                </Link>
              </Box>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#2d1b16",
                    mb: 1,
                  }}
                >
                  Create your Speachy account
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(55, 34, 26, 0.7)" }}
                >
                  Start with free practice sessions and graduate to full
                  insights as you grow.
                </Typography>
              </Box>

              <Box
                component="form"
                sx={{ mt: 1 }}
                noValidate
                onSubmit={handleSubmit}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="off"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    sx: { borderRadius: 2 },
                  }}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    sx: { borderRadius: 2 },
                  }}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontSize: "0.95rem" }}
                    >
                      I agree to the{" "}
                      <Box
                        component="span"
                        sx={{
                          color: "rgba(228, 71, 36, 0.94)",
                          textDecoration: "none",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={handleTermsDialogOpen}
                      >
                        Terms and Conditions
                      </Box>
                    </Typography>
                  }
                  sx={{ mt: 2, mb: 1 }}
                />
                {errors.terms && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ ml: 4, display: "block" }}
                  >
                    {errors.terms}
                  </Typography>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="warning"
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    px: 4,
                    py: 1.8,
                    borderRadius: 3,
                    mt: 3,
                    mb: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    background:
                      "linear-gradient(90deg, #FF8E53 0%, #FA735B 100%)",
                    boxShadow:
                      "0px 12px 24px -12px rgba(250, 115, 91, 0.7), 0px 10px 18px -14px rgba(49, 30, 20, 0.35)",
                    "&:hover": {
                      filter: "brightness(0.95)",
                    },
                  }}
                >
                  <strong>Join the early access</strong>
                </Button>
                <Typography variant="subtitle2" textAlign={"center"}>
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    style={{
                      textDecoration: "none",
                      color: "rgba(228, 71, 36, 0.94)",
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Dialog
        open={demoDialogOpen}
        onClose={handleDemoDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f9f5f4",
            borderBottom: "1px solid #f0e3df",
            fontWeight: 700,
          }}
        >
          30s demo
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: "rgba(55, 34, 26, 0.8)" }}>
            The short demo is on the way. For now, explore the preview and start
            practicing when you're ready.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleDemoDialogClose}
            variant="contained"
            color="warning"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              textTransform: "none",
              boxShadow:
                "0px 12px 24px -12px rgba(250, 115, 91, 0.7), 0px 10px 18px -14px rgba(49, 30, 20, 0.35)",
              background: "linear-gradient(90deg, #FF8E53 0%, #FA735B 100%)",
              "&:hover": {
                filter: "brightness(0.95)",
              },
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
      {isSignUpError && (
        <Snackbar
          open={isSignUpError}
          anchorOrigin={{
            vertical: snackbarVertical,
            horizontal: snackbarHorizontal,
          }}
          key={snackbarVertical + snackbarHorizontal}
          autoHideDuration={3000}
          onClose={() => setIsSignUpError(false)}
        >
          <Alert severity="error" variant="standard" sx={{ width: "100%" }}>
            {signUpError}
          </Alert>
        </Snackbar>
      )}

      {/* Terms and Conditions Dialog */}
      <Dialog
        open={termsDialogOpen}
        onClose={handleTermsDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f9f5f4",
            borderBottom: "1px solid #e0e0e0",
            fontWeight: "bold",
          }}
        >
          Terms and Conditions
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            Welcome to Speachy
          </Typography>

          <Typography variant="body1" paragraph>
            These Terms and Conditions ("Terms") govern your use of the Speachy
            application and services. By accessing or using our service, you
            agree to be bound by these Terms.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By creating an account or using Speachy, you acknowledge that you
            have read, understood, and agree to be bound by these Terms. If you
            do not agree to these Terms, please do not use our service.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            2. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You must notify us immediately of any unauthorized use of
            your account.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            3. Acceptable Use
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to use Speachy only for lawful purposes and in accordance
            with these Terms. You may not use our service to transmit any
            harmful, offensive, or inappropriate content.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            4. Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            Your privacy is important to us. Please review our Privacy Policy,
            which also governs your use of the service, to understand our
            practices regarding the collection and use of your information.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            5. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            The Speachy service and its original content, features, and
            functionality are owned by Speachy and are protected by
            international copyright, trademark, patent, trade secret, and other
            intellectual property laws.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            6. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall Speachy, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential, or punitive damages.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            7. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend your account and bar access to the
            service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            8. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify or replace these Terms at any time.
            If a revision is material, we will provide at least 30 days notice
            prior to any new terms taking effect.
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 3, fontStyle: "italic", color: "text.secondary" }}
          >
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: "#f9f5f4" }}>
          <Button
            onClick={handleTermsDialogClose}
            variant="contained"
            color="warning"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              px: 4,
              py: 1.4,
              borderRadius: 3,
              textTransform: "none",
              boxShadow:
                "0px 12px 24px -12px rgba(250, 115, 91, 0.7), 0px 10px 18px -14px rgba(49, 30, 20, 0.35)",
              background: "linear-gradient(90deg, #FF8E53 0%, #FA735B 100%)",
              "&:hover": {
                filter: "brightness(0.95)",
              },
            }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignUp;
