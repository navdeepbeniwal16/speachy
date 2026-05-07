import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import { AppContext } from "./AppContext.js";
import InterviewService from "../services/interview-service.js";
import ProjectService from "../services/project-service.js";

const CORAL       = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK   = "#C85A3E";
const PAGE_BG     = "#fff4ef";
const SURFACE     = "#ffffff";
const LINE        = "rgba(252,150,120,0.12)";
const INK         = "#2f170f";
const INK_2       = "rgba(60,32,25,0.78)";
const MUTED       = "rgba(60,32,25,0.45)";
const MUTED_2     = "rgba(60,32,25,0.3)";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(252, 150, 120, 0.35)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(252, 150, 120, 0.6)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: CORAL, borderWidth: "1px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: CORAL },
};

const primaryButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  px: 3.5,
  py: 1.4,
  borderRadius: 2,
  backgroundColor: CORAL,
  boxShadow: "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
  "&:hover": {
    backgroundColor: "#f8643f",
    boxShadow: "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
  },
};

const experienceOptions = [
  { value: "entry",  label: "Entry",  sub: "0–2 yrs" },
  { value: "mid",    label: "Mid",    sub: "2–5 yrs" },
  { value: "senior", label: "Senior", sub: "5–9 yrs" },
  { value: "staff",  label: "Staff+", sub: "9+ yrs"  },
];

const PrepareForRoleDialog = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const [companyName, setCompanyName]             = useState("");
  const [jobRole, setRole]                        = useState("");
  const [industry, setIndustry]                   = useState("");
  const [experience, setExperience]               = useState("entry");
  const [jobDescription, setJobDescription]       = useState("");
  const [additionalNotes, setAdditionalNotes]     = useState("");
  const [questionCount, setQuestionCount]         = useState(10);
  const [isUploading, setIsUploading]             = useState(false);
  const [isCompanyProvided, setIsCompanyProvided] = useState(true);
  const [isRoleProvided, setIsRoleProvided]       = useState(true);

  const handleClose = () => {
    setIsCompanyProvided(true);
    setIsRoleProvided(true);
    onClose();
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setIsCompanyProvided(true);
    setIsRoleProvided(true);
    if (!companyName || !jobRole) {
      if (!companyName) setIsCompanyProvided(false);
      if (!jobRole)     setIsRoleProvided(false);
      return;
    }
    setIsUploading(true);
    try {
      const questions = await InterviewService.fetchBehaviouralQuestions(
        companyName, jobRole, jobDescription, industry, experience, additionalNotes, questionCount,
      );

      const projectName = companyName && jobRole
        ? `${companyName} — ${jobRole}`
        : companyName || jobRole || "Interview Prep";

      let savedProjectId = null;
      try {
        const saved = await ProjectService.save(projectName, questions, {
          kind: "tailored",
          companyName: companyName || null,
          jobRole: jobRole || null,
          jobDescription: jobDescription || null,
          industry: industry || null,
          requiredExperience: experience || null,
          additionalNotes: additionalNotes || null,
        });
        savedProjectId = saved?.projectId || null;
      } catch (_) {
        // non-blocking — save failure should not prevent navigation
      }

      onClose();

      if (savedProjectId) {
        navigate("/interview/questions", {
          state: {
            project: {
              id: savedProjectId,
              name: projectName,
              questions,
              kind: "tailored",
              companyName: companyName || null,
              jobRole: jobRole || null,
              jobDescription: jobDescription || null,
              industry: industry || null,
              requiredExperience: experience || null,
              additionalNotes: additionalNotes || null,
              practicedCount: 0,
            },
            questions,
            mode: "project",
          },
        });
      } else {
        navigate("/interview/questions", {
          state: {
            questions,
            companyName,
            jobRole,
            jobDescription,
            industry,
            requiredExperience: experience,
            additionalNotes,
            mode: "ai",
          },
        });
      }
    } catch (error) {
      showSnackbar("error", error?.userMessage || "Unable to generate questions right now. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden", backgroundColor: PAGE_BG } }}
    >
      {/* Header */}
      <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, position: "relative" }}>
        <IconButton size="small" onClick={handleClose} sx={{ position: "absolute", top: 14, right: 14, color: MUTED }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: INK, mb: 0.75, pr: 4 }}>
          Tell us about the role
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: INK_2, lineHeight: 1.6, maxWidth: 420 }}>
          The more context you give, the sharper the questions. You can always edit the set after.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: LINE }} />

      <DialogContent sx={{ px: 3.5, py: 3, backgroundColor: PAGE_BG }}>
        <Box component="form" onSubmit={handleUpload} noValidate>
          <Grid container spacing={2.5}>
            {/* Company */}
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 0.6 }}>
                Company <span style={{ color: CORAL }}>*</span>
              </Typography>
              <TextField
                size="small" fullWidth autoComplete="off" autoFocus
                placeholder="e.g. Atlassian"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], backgroundColor: SURFACE } }}
              />
              {!isCompanyProvided && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  Company name is required
                </Typography>
              )}
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 0.6 }}>
                Role <span style={{ color: CORAL }}>*</span>
              </Typography>
              <TextField
                size="small" fullWidth autoComplete="off"
                placeholder="e.g. Senior Software Engineer"
                value={jobRole}
                onChange={(e) => setRole(e.target.value)}
                sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], backgroundColor: SURFACE } }}
              />
              {!isRoleProvided && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  Role is required
                </Typography>
              )}
            </Grid>

            {/* Experience */}
            <Grid item xs={12}>
              <Typography sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 0.75 }}>
                Experience level <span style={{ color: CORAL }}>*</span>
              </Typography>
              <Box sx={{ backgroundColor: "rgba(60,32,25,0.06)", borderRadius: "10px", p: "4px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                {experienceOptions.map((opt) => (
                  <Box
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    sx={{
                      cursor: "pointer", py: 1, px: 1, borderRadius: "7px", textAlign: "center",
                      backgroundColor: experience === opt.value ? SURFACE : "transparent",
                      boxShadow: experience === opt.value ? `0 1px 4px rgba(60,32,25,0.1), inset 0 0 0 1px ${LINE}` : "none",
                      transition: "background-color 120ms ease, box-shadow 120ms ease",
                      userSelect: "none",
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: experience === opt.value ? 700 : 500, color: experience === opt.value ? INK : MUTED, lineHeight: 1 }}>
                      {opt.label}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: MUTED_2, mt: 0.3 }}>{opt.sub}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Industry */}
            <Grid item xs={12}>
              <Typography component="div" sx={{ fontSize: 13, fontWeight: 500, mb: 0.6 }}>
                <span style={{ color: INK }}>Industry</span>{" "}
                <span style={{ color: MUTED }}>- optional</span>
              </Typography>
              <TextField
                size="small" fullWidth autoComplete="off"
                placeholder="e.g. Fintech, SaaS, Travel"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], backgroundColor: SURFACE } }}
              />
            </Grid>

            {/* Job description */}
            <Grid item xs={12}>
              <Typography component="div" sx={{ fontSize: 13, fontWeight: 500, mb: 0.6 }}>
                <span style={{ color: INK }}>Job description</span>{" "}
                <span style={{ color: MUTED }}>- optional</span>
              </Typography>
              <TextField
                size="small" fullWidth multiline rows={4}
                placeholder="Paste the job description, or describe what the role involves..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], backgroundColor: SURFACE } }}
              />
            </Grid>

            {/* Additional notes */}
            <Grid item xs={12}>
              <Typography component="div" sx={{ fontSize: 13, fontWeight: 500, mb: 0.6 }}>
                <span style={{ color: INK }}>Additional notes</span>{" "}
                <span style={{ color: MUTED }}>— optional</span>
              </Typography>
              <TextField
                size="small" fullWidth multiline rows={3}
                placeholder="e.g. Focus on leadership and conflict resolution"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], backgroundColor: SURFACE } }}
              />
            </Grid>

            {/* Question count slider */}
            <Grid item xs={12}>
              <Typography sx={{ fontSize: 13, color: INK, fontWeight: 500, mb: 1.25 }}>
                Number of questions
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Slider
                  value={questionCount}
                  onChange={(_, v) => setQuestionCount(v)}
                  min={5} max={30} step={1}
                  sx={{
                    flex: 1, color: CORAL,
                    "& .MuiSlider-thumb": { width: 18, height: 18, "&:hover": { boxShadow: `0 0 0 6px ${CORAL_SOFTER}` } },
                    "& .MuiSlider-track": { height: 4, borderRadius: 2 },
                    "& .MuiSlider-rail": { height: 4, borderRadius: 2, backgroundColor: CORAL_SOFTER },
                  }}
                />
                <Box sx={{ backgroundColor: CORAL_SOFTER, color: CORAL_INK, borderRadius: "20px", px: 1.75, py: 0.6, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {questionCount} qs
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3.5, py: 2.5, borderTop: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: PAGE_BG }}>
        <Typography sx={{ fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 0.75 }}>
          <BookmarkBorderIcon sx={{ fontSize: 14 }} />
          Saved automatically as a project
        </Typography>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={isUploading}
          startIcon={isUploading ? null : <AutoAwesomeIcon sx={{ fontSize: "14px !important" }} />}
          sx={{ ...primaryButtonSx, py: 1.1, px: 2.5, fontSize: 13.5 }}
        >
          {isUploading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrepareForRoleDialog;
