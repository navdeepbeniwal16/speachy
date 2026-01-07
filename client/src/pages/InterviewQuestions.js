import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  List,
  ListItemButton,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  FormLabel,
  RadioGroup,
  Radio,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const NAV_ICON_SX = { color: "#2f170f", borderRadius: 2 };

const InterviewQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state.questions;
  const companyName = location.state.companyName;
  const jobRole = location.state.jobRole;
  const jobDescription = location.state.jobDescription;
  const industry = location.state.industry;
  const requiredExperience = location.state.requiredExperience;

  const [selectedDifficulties, setSelectedDifficulties] = React.useState([
    "easy",
    "medium",
    "hard",
  ]);
  const [questionSource, setQuestionSource] = React.useState("all"); // 'all', 'ai', 'curated'

  const handleDifficultyChange = (event) => {
    const { value, checked } = event.target;
    setSelectedDifficulties((prev) =>
      checked ? [...prev, value] : prev.filter((d) => d !== value)
    );
  };

  const handleSourceChange = (event, newSource) => {
    if (newSource !== null) setQuestionSource(newSource);
  };

  // Filtering logic
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
        questions: questions,
        questionId: questionId,
        companyName: companyName,
        jobRole: jobRole,
        jobDescription: jobDescription,
        industry: industry,
        requiredExperience: requiredExperience,
      },
    });
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
        // border: "1px solid",
        // borderColor: "#ff8350",
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
        // style={{ borderColor: "#ff8350" }}
        // style={{ borderColor: "red" }}
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

            <Box></Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "right",
              }}
            >
              {questionObj.tags.map((tag) => {
                return (
                  <Chip
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
                );
              })}
            </Box>
          </Box>
        </CardContent>
        <Box
          sx={{
            marginRight: 2,
          }}
        >
          <ArrowForwardIosIcon
            sx={{ height: "22px", width: "22px" }}
            style={{ color: "#FA735B" }}
          />
        </Box>
      </Card>
    </ListItemButton>
  ));

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={() => navigate("/interview")} sx={NAV_ICON_SX}>
          <ArrowBackIcon></ArrowBackIcon>
        </IconButton>
        <Typography variant="h6" gutterBottom>
          Practice Questions
        </Typography>
        <Typography></Typography>
      </Box>

      {/* Filters Section */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          mb: 3,
          py: 2,
          background: "#fff",
          // borderRadius: "16px", // match dashboard
          boxShadow: "0 2px 8px rgba(250, 115, 91, 0.04)",
          border: "1px solid #f0e6e1",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 3,
          justifyContent: { xs: "flex-start", sm: "space-between" },
          borderRadius: 2,
          // border: "1px solid #f0f0f0",
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
  );
};

export default InterviewQuestions;
