import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const DARK_BG = "#1e0d07";
const PAGE_BG = "#fff4ef";
const CORAL = "#FA735B";
const CORAL_INK = "#C85A3E";
const HEADING = "#2f170f";
const BODY = "rgba(60,32,25,0.78)";
const MUTED = "rgba(60,32,25,0.45)";
const SERIF = "Georgia, serif";

const PANEL_MUTED = "rgba(255,200,175,0.50)";
const PANEL_WHITE = "#fff8f5";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    "& fieldset": { borderColor: "rgba(0,0,0,0.09)" },
    "&:hover fieldset": { borderColor: "rgba(250,115,91,0.40)" },
    "&.Mui-focused fieldset": { borderColor: CORAL, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { color: MUTED },
  "& .MuiInputLabel-root.Mui-focused": { color: CORAL },
};

const SignIn = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [snackError, setSnackError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {
      email: /\S+@\S+\.\S+/.test(email) ? "" : "Enter a valid email address",
      password:
        password.length > 6 ? "" : "Password must be at least 6 characters",
    };
    setErrors(e);
    return Object.values(e).every((v) => v === "");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      const code =
        err.code || (err.message.match(/\(auth\/([^)]+)\)/) || [])[1];
      const map = {
        "auth/invalid-email": "That email address doesn't look right.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/user-not-found": "No account found with that email.",
        "auth/wrong-password": "Incorrect password — please try again.",
        "auth/invalid-credential":
          "Couldn't sign you in. Check your email and password.",
      };
      setSnackError(map[code] || "Something went wrong. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* ── Left panel ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          width: "44%",
          minHeight: "100vh",
          backgroundColor: DARK_BG,
          position: "relative",
          overflow: "hidden",
          p: { md: 5, lg: 6 },
        }}
      >
        {/* Ghost text */}
        <Typography
          aria-hidden="true"
          sx={{
            position: "absolute",
            bottom: "-4%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "20vw",
            fontFamily: SERIF,
            fontWeight: 800,
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(255,220,200,0.07)",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          SPEACHY
        </Typography>

        {/* Logo */}
        <Box sx={{ position: "relative", zIndex: 1, mb: "auto" }}>
          <Link to="/">
            <img
              src="/assets/Speachy_Logo_Full_SVG.svg"
              alt="Speachy"
              style={{
                height: 36,
                width: "auto",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            />
          </Link>
        </Box>

        {/* Centre copy */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: "auto",
            mb: "auto",
            py: 6,
          }}
        >
          {/* Label */}
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: CORAL,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: CORAL,
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              AI Interview Preparation
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: { md: 34, lg: 40 },
              color: PANEL_WHITE,
              lineHeight: 1.1,
              mb: 2,
              letterSpacing: "-0.5px",
            }}
          >
            Good to see
            <br />
            you back.
          </Typography>

          <Typography
            sx={{
              fontSize: 15,
              color: PANEL_MUTED,
              lineHeight: 1.75,
              maxWidth: 300,
            }}
          >
            Your progress is right where you left it. Keep the streak going.
          </Typography>
        </Box>

        {/* Bottom divider */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            pt: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "rgba(255,200,175,0.28)",
              fontStyle: "italic",
            }}
          >
            Built with care, shipped with intention.
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: PAGE_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: { xs: 3, sm: 5 },
          py: 6,
          position: "relative",
        }}
      >
        {isSigningIn && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 3,
              backgroundColor: "rgba(250,115,91,0.10)",
              "& .MuiLinearProgress-bar": { backgroundColor: CORAL },
            }}
          />
        )}

        <Box sx={{ width: "100%", maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              mb: 5,
              textAlign: "center",
            }}
          >
            <Link to="/">
              <img
                src="/assets/Speachy_Logo_Full_SVG.svg"
                alt="Speachy"
                style={{ height: 30, width: "auto" }}
              />
            </Link>
          </Box>

          <Typography
            sx={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 30,
              color: HEADING,
              letterSpacing: "-0.4px",
              mb: 0.75,
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{ fontSize: 15, color: MUTED, mb: 4, lineHeight: 1.6 }}
          >
            Sign in to continue practising.
          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              sx={fieldSx}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      size="small"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: "right", mt: 0.75, mb: 0.5 }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: 13,
                  color: CORAL,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: CORAL,
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                textTransform: "none",
                borderRadius: "50px",
                py: 1.5,
                mt: 2,
                mb: 2.5,
                boxShadow: "none",
                "&:hover": { backgroundColor: CORAL_INK, boxShadow: "none" },
              }}
            >
              Sign in
            </Button>

            <Typography sx={{ fontSize: 14, textAlign: "center", color: BODY }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: CORAL,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Sign up free
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!snackError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={4000}
        onClose={() => setSnackError("")}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {snackError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignIn;
