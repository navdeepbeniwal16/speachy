import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CreateIcon from "@mui/icons-material/Create";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { AppContext } from "../components/AppContext.js";
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
const BUTTER_SOFT = "rgba(232,200,124,0.25)";
const BUTTER_INK = "#8b6a1f";

const TYPE_CONFIG = {
  interview: {
    label: "Interview",
    bg: CORAL_SOFTER,
    color: CORAL_INK,
    icon: <AutoAwesomeIcon sx={{ fontSize: 10 }} />,
  },
  warmup: {
    label: "Warm-up",
    bg: BUTTER_SOFT,
    color: BUTTER_INK,
    icon: null,
  },
  presentation: {
    label: "Presentation",
    bg: "rgba(82,130,255,0.08)",
    color: "#2a4bcc",
    icon: null,
  },
};

const KIND_CONFIG = {
  tailored: {
    label: "Tailored",
    bg: CORAL_SOFTER,
    color: CORAL_INK,
    icon: <AutoAwesomeIcon sx={{ fontSize: 10 }} />,
  },
  custom: {
    label: "Custom",
    bg: BUTTER_SOFT,
    color: BUTTER_INK,
    icon: <CreateIcon sx={{ fontSize: 10 }} />,
  },
};

const KindBadge = ({ kind }) => {
  const cfg = KIND_CONFIG[kind];
  if (!cfg) return null;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderRadius: "20px",
        px: 1.1,
        py: 0.3,
        fontSize: 10.5,
        fontWeight: 700,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ProjectService.getAll();
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
      state: { project, questions: project.questions, mode: "project" },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAGE_BG, py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md">

        {/* Top nav */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 48px",
            alignItems: "center",
            mb: 3,
          }}
        >
          <IconButton
            onClick={() => navigate("/")}
            sx={{ color: INK, borderRadius: 2, width: 40, height: 40 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography
            align="center"
            sx={{ fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: 0.3 }}
          >
            Projects
          </Typography>
          <Box />
        </Box>

        {/* Page heading */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: "Georgia, serif",
                fontSize: { xs: 22, md: 26 },
                fontWeight: 500,
                color: INK,
                lineHeight: 1.25,
              }}
            >
              Your projects
            </Typography>
            {!loading && projects.length > 0 && (
              <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.5 }}>
                {projects.length} saved
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/interview")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              px: 2.5,
              py: 1,
              borderRadius: "10px",
              backgroundColor: CORAL,
              boxShadow: "0px 8px 18px -6px rgba(250,115,91,0.6)",
              "&:hover": { backgroundColor: CORAL_INK },
            }}
          >
            + New project
          </Button>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} sx={{ color: CORAL }} />
          </Box>
        ) : projects.length === 0 ? (
          <Box
            sx={{
              backgroundColor: SURFACE,
              border: `1px solid ${LINE}`,
              borderRadius: "18px",
              p: "48px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <FolderOpenOutlinedIcon sx={{ fontSize: 40, color: MUTED }} />
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: INK }}>
              No saved projects yet
            </Typography>
            <Typography
              sx={{
                fontSize: 13.5,
                color: INK_2,
                textAlign: "center",
                maxWidth: 380,
                lineHeight: 1.6,
              }}
            >
              Create a tailored or custom question set from the Interview Prep page — it'll appear here.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate("/interview")}
              sx={{
                mt: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                borderColor: "rgba(252,150,120,0.4)",
                color: CORAL,
                borderRadius: "10px",
                "&:hover": { borderColor: CORAL, backgroundColor: CORAL_SOFTER },
              }}
            >
              Go to Interview Prep
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2,
            }}
          >
            {projects.map((project) => {
              const total = project.questions?.length || 0;
              const done = project.practicedCount || 0;
              const pct = total > 0 ? done / total : 0;
              const createdDate = project.createdAt
                ? new Date(project.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <Box
                  key={project.id}
                  onClick={() => openProject(project)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: SURFACE,
                    border: `1px solid ${LINE}`,
                    borderRadius: "14px",
                    p: "18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 18px 32px rgba(252,150,120,0.18)",
                    },
                  }}
                >
                  {/* Kind badge */}
                  <KindBadge kind={project.kind} />

                  {/* Company / role — fixed height so cards align even without a role */}
                  <Box sx={{ minHeight: 42 }}>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: 15, color: INK, lineHeight: 1.3 }}
                    >
                      {project.companyName || project.name}
                    </Typography>
                    {project.jobRole && (
                      <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.25 }}>
                        {project.jobRole}
                      </Typography>
                    )}
                  </Box>

                  {/* Progress bar */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography sx={{ fontSize: 11.5, color: INK_2 }}>
                        {done} of {total} practised
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: MUTED }}>
                        {createdDate}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: CORAL_SOFTER,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          borderRadius: 2,
                          backgroundColor: CORAL,
                          width: `${pct * 100}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* CTA */}
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: MUTED,
                      "&:hover": { color: CORAL },
                    }}
                  >
                    {done > 0 ? "Continue practising →" : "Open project →"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProjectsPage;
