import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { AppContext } from "../components/AppContext.js";
import InterviewService from "../services/interview-service.js";

const PAGE_BG = "#fff4ef";
const SURFACE_BG = "#ffffff";
const SURFACE_BORDER = "1px solid rgba(252,150,120,0.12)";
const SURFACE_SHADOW = "0 18px 36px rgba(252,150,120,0.15)";
const HEADING_COLOR = "#2f170f";
const BODY_COLOR = "rgba(60,32,25,0.78)";
const MUTED_COLOR = "rgba(60,32,25,0.45)";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await InterviewService.getProjects();
        setProjects(data);
      } catch (error) {
        showSnackbar("error", "Could not load your projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const openProject = (project) => {
    navigate("/interview/questions", {
      state: {
        questions: project.questions,
        companyName: project.companyName,
        jobRole: project.jobRole,
        jobDescription: project.jobDescription,
        industry: project.industry,
        requiredExperience: project.requiredExperience,
        additionalNotes: project.additionalNotes,
        mode: "project",
      },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 6, md: 8 } }}>
      <Container maxWidth="xl">

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{ color: HEADING_COLOR, borderRadius: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: HEADING_COLOR }}>
            Your Projects
          </Typography>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={32} sx={{ color: "#FA735B" }} />
          </Box>
        ) : projects.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
              gap: 2,
            }}
          >
            <FolderOpenOutlinedIcon sx={{ fontSize: 48, color: MUTED_COLOR }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: HEADING_COLOR }}>
              No projects yet
            </Typography>
            <Typography variant="body2" sx={{ color: MUTED_COLOR, textAlign: "center", maxWidth: 400 }}>
              Generate a question set from the Interview Prep page and save it as a project to see it here.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Paper
                  elevation={0}
                  onClick={() => openProject(project)}
                  sx={{
                    cursor: "pointer",
                    px: 3,
                    py: 3,
                    borderRadius: 4,
                    border: SURFACE_BORDER,
                    backgroundColor: SURFACE_BG,
                    boxShadow: SURFACE_SHADOW,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 120ms ease, border-color 120ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "rgba(250,115,91,0.4)",
                    },
                  }}
                >
                  {/* Project name */}
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: HEADING_COLOR, mb: 0.5 }}
                  >
                    {project.name}
                  </Typography>

                  {/* Company / Role */}
                  {(project.companyName || project.jobRole) && (
                    <Typography variant="body2" sx={{ color: BODY_COLOR, mb: 1.5 }}>
                      {[project.companyName, project.jobRole].filter(Boolean).join(" — ")}
                    </Typography>
                  )}

                  {/* Chips */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: "auto", pb: 2 }}>
                    {project.requiredExperience && (
                      <Chip
                        label={project.requiredExperience}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(250,115,91,0.1)",
                          color: "#FA735B",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                    {project.industry && (
                      <Chip
                        label={project.industry}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(60,32,25,0.06)",
                          color: BODY_COLOR,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                    <Chip
                      label={`${project.questions?.length ?? 0} questions`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(60,32,25,0.06)",
                        color: BODY_COLOR,
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>

                  {/* Date */}
                  <Typography variant="caption" sx={{ color: MUTED_COLOR }}>
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ProjectsPage;
