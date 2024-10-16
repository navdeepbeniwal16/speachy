import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const InterviewQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state.questions;
  const companyName = location.state.companyName;
  const jobRole = location.state.jobRole;
  const jobDescription = location.state.jobDescription;
  const industry = location.state.industry;
  const requiredExperience = location.state.requiredExperience;

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

  const questionsList = questions.map((questionObj, index) => (
    <ListItemButton
      key={index}
      component="div"
      sx={{ margin: "0px", borderRadius: "10px" }}
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
        <CardContent>
          <Typography variant="body2">{questionObj.question}</Typography>
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
        <IconButton onClick={() => navigate("/interview")}>
          <ArrowBackIcon></ArrowBackIcon>
        </IconButton>
        <Typography variant="h6" gutterBottom>
          Practice Questions
        </Typography>
        <Typography></Typography>
      </Box>

      <Box>
        <List>{questionsList}</List>
      </Box>
    </Container>
  );
};

export default InterviewQuestions;
