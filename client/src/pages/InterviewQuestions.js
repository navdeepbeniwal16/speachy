import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { AppContext } from "../components/AppContext.js";
import InterviewService from "../services/interview-service.js";

const NAV_ICON_SX = { color: "#2f170f", borderRadius: 2 };

const InterviewQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const {
    questions: initialQuestions,
    companyName,
    jobRole,
    jobDescription,
    industry,
    requiredExperience,
    additionalNotes,
    mode,
  } = location.state;

  const [questions, setQuestions] = useState(initialQuestions);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState(
    companyName && jobRole ? `${companyName} — ${jobRole}` : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDifficulties, setSelectedDifficulties] = useState([
    "easy",
    "medium",
    "hard",
  ]);
  const [questionSource, setQuestionSource] = useState("all");

  const handleDifficultyChange = (event) => {
    const { value, checked } = event.target;
    setSelectedDifficulties((prev) =>
      checked ? [...prev, value] : prev.filter((d) => d !== value)
    );
  };

  const handleSourceChange = (event, newSource) => {
    if (newSource !== null) setQuestionSource(newSource);
  };

  const filteredQuestions = questions.filter((q) => {
    const difficultyMatch = selectedDifficulties.includes(
      q.difficultyLevel.toLowerCase()
    );
    const sourceMatch =
      questionSource === "all" ||
      (questionSource === "ai" && q.isAIGenerated) ||
      (questionSource === "curated" && !q.isAIGenerated);
    return difficultyMatch && sourceMatch;
  });

  const navigateToPracticePage = (questionId) => {
    navigate(`/interview/questions/${questionId}`, {
      state: {
        questions,
        questionId,
        companyName,
        jobRole,
        jobDescription,
        industry,
        requiredExperience,
      },
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await InterviewService.fetchBehaviouralQuestions(
        companyName,
        jobRole,
        jobDescription,
        industry,
        requiredExperience,
        additionalNotes
      );
      setQuestions(refreshed);
    } catch (error) {
      const message =
        error?.userMessage ||
        "Unable to refresh questions right now. Your current set is still here.";
      showSnackbar("error", message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) return;
    setIsSaving(true);
    try {
      await InterviewService.saveProject(projectName.trim(), questions, {
        companyName,
        jobRole,
        jobDescription,
        industry,
        requiredExperience,
        additionalNotes,
      });
      showSnackbar("success", "Project saved!");
      setSaveDialogOpen(false);
    } catch (error) {
      showSnackbar("error", "Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const questionsList = filteredQuestions.map((questionObj, index) => (
    <ListItemButton
      key={index}
      component="div"
      sx={{
        margin: "0px",
        padding: 0,
        marginY: 2,
        borderRadius: "10px",
        border: "1px solid #f9f5f4",
        "&:hover": { border: "1px solid #ff8350" },
      }}
      disablePadding
      onClick={() => navigateToPracticePage(index)}
    >
      <Card
        variant="elevation"
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 1,
        }}
      >
        <CardContent sx={{ width: "96%" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              {questionObj.question}
            </Typography>
            {questionObj.isAIGenerated && (
              <AutoAwesomeIcon
                fontSize="small"
                color="warning"
                sx={{ mt: "2px" }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Chip
              variant="filled"
              size="small"
              label={
                questionObj.difficultyLevel.charAt(0).toUpperCase() +
                questionObj.difficultyLevel.slice(1).toLowerCase()
              }
            />
            <Box />
            <Box sx={{ display: "flex", alignItems: "right" }}>
              {questionObj.tags.map((tag) => (
                <Chip
                  key={tag}
                  variant="outlined"
                  size="small"
                  label={
                    <Typography
                      fontSize={12}
                      fontStyle="italic"
                      color="GrayText"
                    >{`#${tag}`}</Typography>
                  }
                  sx={{ border: "0px" }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
        <Box sx={{ marginRight: 2 }}>
          <ArrowForwardIosIcon
            sx={{ height: "22px", width: "22px" }}
            style={{ color: "#FA735B" }}
          />
        </Box>
      </Card>
    </ListItemButton>
  ));

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff4ef", py: { xs: 4, md: 6 } }}>
      <Container component="main" maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton onClick={() => navigate(-1)} sx={NAV_ICON_SX}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Practice Questions
          </Typography>
          <Typography />
        </Box>

        {/* Action bar — only for AI-generated sets */}
        {mode === "ai" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                isRefreshing ? (
                  <CircularProgress size={14} sx={{ color: "#FA735B" }} />
                ) : (
                  <RefreshIcon />
                )
              }
              disabled={isRefreshing}
              onClick={handleRefresh}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "rgba(252,150,120,0.4)",
                color: "#FA735B",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#FA735B",
                  backgroundColor: "rgba(250,115,91,0.04)",
                },
              }}
            >
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </Button>
            <Button
              variant="contained"
              startIcon={<BookmarkBorderIcon />}
              onClick={() => setSaveDialogOpen(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                backgroundColor: "#FA735B",
                boxShadow: "0px 8px 20px -8px rgba(250,115,91,0.6)",
                "&:hover": {
                  backgroundColor: "#f8643f",
                },
              }}
            >
              Save as Project
            </Button>
          </Box>
        )}

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            mb: 3,
            py: 2,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(250, 115, 91, 0.04)",
            border: "1px solid #f0e6e1",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 3,
            justifyContent: { xs: "flex-start", sm: "space-between" },
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ minWidth: 70, fontWeight: 600, paddingLeft: 2 }}
            >
              Difficulty
            </Typography>
            {["easy", "medium", "hard"].map((diff) => (
              <FormControlLabel
                key={diff}
                control={
                  <Checkbox
                    checked={selectedDifficulties.includes(diff)}
                    onChange={handleDifficultyChange}
                    value={diff}
                    color="warning"
                    sx={{ p: 0.5, "&.Mui-checked": { color: "#FA735B" } }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize", fontWeight: 500 }}
                  >
                    {diff}
                  </Typography>
                }
                sx={{ mr: 2 }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "flex-start", sm: "flex-end" },
              ml: { xs: 0, sm: "auto" },
              mt: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ minWidth: 60, fontWeight: 600 }}
            >
              Source
            </Typography>
            <ToggleButtonGroup
              value={questionSource}
              exclusive
              onChange={handleSourceChange}
              size="small"
              sx={{
                background: "#fff",
                borderRadius: 2,
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                pl: 1.5,
                pr: 1.5,
                py: 0.5,
                "& .MuiToggleButton-root": {
                  border: "none",
                  borderRadius: 2,
                  mx: 0.5,
                  px: 2,
                  color: "text.secondary",
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  "&.Mui-selected": {
                    color: "#FA735B",
                    background: "#fff0ec",
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ToggleButton value="all">ALL</ToggleButton>
              <ToggleButton value="ai">AI-GENERATED</ToggleButton>
              <ToggleButton value="curated">CURATED</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Paper>

        <Box>
          <List>{questionsList}</List>
        </Box>
      </Container>

      {/* Save as Project dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => !isSaving && setSaveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#2f170f" }}>
          Save as Project
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "rgba(60,32,25,0.6)", mb: 2 }}>
            Give this question set a name so you can revisit it and add to it later.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && projectName.trim()) handleSaveProject();
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(252,150,120,0.35)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(252,150,120,0.6)" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FA735B", borderWidth: "1px" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#FA735B" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            disabled={isSaving}
            sx={{ textTransform: "none", color: "rgba(60,32,25,0.5)" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!projectName.trim() || isSaving}
            onClick={handleSaveProject}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: "#FA735B",
              boxShadow: "0px 8px 20px -8px rgba(250,115,91,0.6)",
              "&:hover": { backgroundColor: "#f8643f" },
            }}
          >
            {isSaving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewQuestions;
