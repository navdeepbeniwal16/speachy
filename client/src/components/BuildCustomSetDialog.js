import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogActions as MuiDialogActions,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import WorkIcon from "@mui/icons-material/Work";
import { AppContext } from "./AppContext.js";
import ProjectService from "../services/project-service.js";

const CORAL = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const CORAL_INK = "#C85A3E";
const PAGE_BG = "#fff4ef";
const SURFACE = "#ffffff";
const LINE = "rgba(252,150,120,0.12)";
const INK = "#2f170f";
const INK_2 = "rgba(60,32,25,0.78)";
const MUTED = "rgba(60,32,25,0.45)";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(252, 150, 120, 0.35)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(252, 150, 120, 0.6)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: CORAL,
      borderWidth: "1px",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: CORAL },
};

const orangeInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: SURFACE,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(252, 150, 120, 0.35)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(252, 150, 120, 0.6)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: CORAL,
      borderWidth: "1px",
    },
  },
  "& .MuiInputBase-input": {
    color: INK_2,
    fontSize: "0.95rem",
    lineHeight: 1.7,
  },
  "& .MuiInputBase-input::placeholder": { color: "rgba(60,32,25,0.35)" },
};

const primaryButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  px: 3.5,
  py: 1.4,
  borderRadius: 2,
  backgroundColor: CORAL,
  boxShadow:
    "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
  "&:hover": {
    backgroundColor: "#f8643f",
    boxShadow:
      "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
  },
};

const suggestionPrompts = [
  "Tell me about a conflict you resolved on your team.",
  "Describe a time you had to push back on a stakeholder.",
  "Walk me through a decision you later regretted.",
];

const BuildCustomSetDialog = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const [companyName, setCompanyName] = useState("");
  const [jobRole, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("entry");
  const [jobDescription, setJobDescription] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [saveAsProject, setSaveAsProject] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const [saveCustomDialogOpen, setSaveCustomDialogOpen] = useState(false);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  const handleAddCustomQuestion = () => {
    const trimmed = customQuestionInput.trim();
    if (!trimmed) return;
    setCustomQuestions((prev) => [
      ...prev,
      {
        question: trimmed,
        tags: [],
        difficultyLevel: "medium",
        isAIGenerated: false,
        isCustom: true,
      },
    ]);
    setCustomQuestionInput("");
  };

  const handleRemoveCustomQuestion = (index) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartCustomPractice = () => {
    if (customQuestions.length === 0) return;
    if (saveAsProject) {
      setCustomProjectName(
        companyName && jobRole ? `${companyName} — ${jobRole}` : "",
      );
      setSaveCustomDialogOpen(true);
      return;
    }
    navigate("/interview/questions", {
      state: {
        questions: customQuestions,
        companyName: companyName || "",
        jobRole: jobRole || "",
        jobDescription: jobDescription || "",
        industry: industry || "",
        requiredExperience: experience || "",
      },
    });
  };

  const handleSaveCustomProject = async () => {
    if (!customProjectName.trim() || customQuestions.length === 0) return;
    setIsSavingCustom(true);
    try {
      const saved = await ProjectService.save(
        customProjectName.trim(),
        customQuestions,
        {
          kind: "custom",
          companyName: companyName || null,
          jobRole: jobRole || null,
          jobDescription: jobDescription || null,
          industry: industry || null,
          requiredExperience: experience || null,
          additionalNotes: null,
        },
      );
      setSaveCustomDialogOpen(false);
      onClose();
      if (saved?.projectId) {
        navigate("/interview/questions", {
          state: {
            project: {
              id: saved.projectId,
              name: customProjectName.trim(),
              questions: customQuestions,
              kind: "custom",
              companyName: companyName || null,
              jobRole: jobRole || null,
              jobDescription: jobDescription || null,
              industry: industry || null,
              requiredExperience: experience || null,
              additionalNotes: null,
              practicedCount: 0,
            },
            questions: customQuestions,
            mode: "project",
          },
        });
      }
    } catch {
      showSnackbar("error", "Failed to save project. Please try again.");
    } finally {
      setIsSavingCustom(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: PAGE_BG,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, position: "relative" }}>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ position: "absolute", top: 14, right: 14, color: MUTED }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{ fontSize: 20, fontWeight: 700, color: INK, mb: 0.75, pr: 4 }}
          >
            Write the questions you want to practise
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: INK_2,
              lineHeight: 1.6,
              maxWidth: 420,
            }}
          >
            Add any number of behavioural questions.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: LINE }} />

        <DialogContent sx={{ px: 3.5, py: 3, backgroundColor: PAGE_BG }}>
          {/* Collapsible job context */}
          <Box
            sx={{
              border: `1px solid ${LINE}`,
              borderRadius: "12px",
              mb: 2.5,
              overflow: "hidden",
              backgroundColor: SURFACE,
            }}
          >
            <Box
              onClick={() => setContextOpen((v) => !v)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 1.5,
                cursor: "pointer",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <WorkIcon sx={{ fontSize: 15, color: MUTED }} />
                Job context{" "}
                <span style={{ color: MUTED, fontSize: 12, fontWeight: 400 }}>
                  (optional — improves feedback relevance)
                </span>
              </Typography>
              <ExpandMoreIcon
                sx={{
                  color: MUTED,
                  fontSize: 18,
                  transition: "transform 200ms ease",
                  transform: contextOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Box>
            {contextOpen && (
              <Box
                sx={{ px: 2.5, pb: 2.5, pt: 2, borderTop: `1px solid ${LINE}` }}
              >
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Company"
                      autoComplete="off"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Role"
                      autoComplete="off"
                      value={jobRole}
                      onChange={(e) => setRole(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      SelectProps={{ displayEmpty: true }}
                      sx={{
                        ...inputSx,
                        "& .MuiSelect-select": {
                          color: experience ? INK_2 : "rgba(60,32,25,0.35)",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <span style={{ color: "rgba(60,32,25,0.35)" }}>
                          Experience level
                        </span>
                      </MenuItem>
                      {[
                        { value: "entry", label: "Entry (0–2 yrs)" },
                        { value: "mid", label: "Mid (2–5 yrs)" },
                        { value: "senior", label: "Senior (5–9 yrs)" },
                        { value: "staff", label: "Staff+ (9+ yrs)" },
                      ].map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Industry"
                      autoComplete="off"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Job description — optional"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Additional notes — optional"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

          {/* Question textarea */}
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="e.g. Tell me about a time you resolved a conflict in your team."
            value={customQuestionInput}
            onChange={(e) => setCustomQuestionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddCustomQuestion();
              }
            }}
            sx={orangeInputSx}
          />

          {/* Hint row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
              mb: 2.5,
            }}
          >
            <Typography sx={{ fontSize: 12, color: MUTED }}>
              Press Enter to add quickly
            </Typography>
            <Button
              size="small"
              disabled={!customQuestionInput.trim()}
              onClick={handleAddCustomQuestion}
              startIcon={
                <Box
                  component="span"
                  sx={{ fontSize: 16, lineHeight: 1, fontWeight: 400 }}
                >
                  +
                </Box>
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                color: customQuestionInput.trim() ? CORAL_INK : MUTED,
                px: 1,
                minWidth: 0,
                "&:hover": { backgroundColor: CORAL_SOFTER },
              }}
            >
              Add question
            </Button>
          </Box>

          {/* Suggestion prompts */}
          <Box sx={{ mb: customQuestions.length > 0 ? 2.5 : 0 }}>
            <Typography
              sx={{
                fontSize: 10.5,
                color: CORAL_INK,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                mb: 1.25,
              }}
            >
              Need a nudge?
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {suggestionPrompts.map((prompt) => (
                <Box
                  key={prompt}
                  onClick={() => setCustomQuestionInput(prompt)}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: 13,
                    color: INK_2,
                    backgroundColor: SURFACE,
                    border: `1px solid ${LINE}`,
                    borderRadius: "20px",
                    px: 1.75,
                    py: 0.6,
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    "&:hover": {
                      borderColor: CORAL,
                      backgroundColor: CORAL_SOFTER,
                      color: CORAL_INK,
                    },
                    transition: "all 120ms ease",
                  }}
                >
                  <span style={{ color: CORAL, fontWeight: 600 }}>+</span>{" "}
                  {prompt}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Questions list */}
          {customQuestions.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    color: CORAL,
                    fontWeight: 700,
                    letterSpacing: 1.1,
                    textTransform: "uppercase",
                  }}
                >
                  Your Practice Set ({customQuestions.length})
                </Typography>
                <Box
                  onClick={() => setCustomQuestions([])}
                  sx={{
                    fontSize: 11.5,
                    color: MUTED,
                    cursor: "pointer",
                    "&:hover": { color: CORAL_INK },
                    transition: "color 120ms ease",
                  }}
                >
                  Clear all
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {customQuestions.map((q, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.25,
                      borderRadius: "10px",
                      border: `1px solid ${LINE}`,
                      backgroundColor: SURFACE,
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: CORAL_SOFTER,
                        color: CORAL_INK,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10.5,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: 13,
                        color: INK_2,
                        lineHeight: 1.5,
                      }}
                    >
                      {q.question}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveCustomQuestion(i)}
                      sx={{
                        color: MUTED,
                        flexShrink: 0,
                        "&:hover": {
                          color: "#e04028",
                          bgcolor: "rgba(224,64,40,0.08)",
                        },
                        transition: "all 0.15s ease",
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${LINE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: PAGE_BG,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              cursor: "pointer",
            }}
            onClick={() => setSaveAsProject((v) => !v)}
          >
            <Checkbox
              checked={saveAsProject}
              size="small"
              disableRipple
              sx={{
                p: 0.5,
                color: MUTED,
                "&.Mui-checked": { color: CORAL },
                pointerEvents: "none",
              }}
            />
            <BookmarkBorderIcon sx={{ fontSize: 15, color: MUTED, mr: 0.5 }} />
            <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
              Save as project
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            disabled={customQuestions.length === 0}
            onClick={handleStartCustomPractice}
            startIcon={
              customQuestions.length > 0 ? (
                <PlayCircleOutlineIcon sx={{ fontSize: "15px !important" }} />
              ) : null
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              py: 1.2,
              px: 2.5,
              borderRadius: "10px",
              fontSize: 13,
              backgroundColor: customQuestions.length > 0 ? CORAL : undefined,
              boxShadow:
                customQuestions.length > 0
                  ? "0px 12px 24px -12px rgba(250,115,91,0.7)"
                  : "none",
              "&:hover": {
                backgroundColor: CORAL_INK,
                boxShadow: "0px 14px 26px -12px rgba(250,115,91,0.8)",
              },
            }}
          >
            {customQuestions.length === 0
              ? "Add at least one question to start"
              : `Start practising`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save as Project nested dialog */}
      <Dialog
        open={saveCustomDialogOpen}
        onClose={() => setSaveCustomDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", px: 1, py: 0.5 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, color: INK, pb: 0.5, fontSize: 16 }}
        >
          Save as Project
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: 13.5, color: INK_2, mb: 2, lineHeight: 1.6 }}
          >
            Give this question set a name so you can revisit and practice from
            it later.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Project name"
            value={customProjectName}
            onChange={(e) => setCustomProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                customProjectName.trim() &&
                !isSavingCustom
              )
                handleSaveCustomProject();
            }}
            sx={inputSx}
          />
        </DialogContent>
        <MuiDialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setSaveCustomDialogOpen(false)}
            sx={{ textTransform: "none", color: MUTED }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!customProjectName.trim() || isSavingCustom}
            onClick={handleSaveCustomProject}
            sx={{ ...primaryButtonSx, py: 1, px: 2.5 }}
          >
            {isSavingCustom ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Save"
            )}
          </Button>
        </MuiDialogActions>
      </Dialog>
    </>
  );
};

export default BuildCustomSetDialog;
