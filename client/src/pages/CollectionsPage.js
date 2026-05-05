import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { AppContext } from "../components/AppContext.js";
import BreadcrumbHeader from "../components/BreadcrumbHeader.js";
import CollectionsService from "../services/collections-service.js";

const CORAL = "#FA735B";
const CORAL_INK = "#C85A3E";
const CORAL_SOFTER = "rgba(250,115,91,0.08)";
const PAGE_BG = "#fff4ef";
const SURFACE = "#ffffff";
const LINE = "rgba(252,150,120,0.12)";
const INK = "#2f170f";
const INK_2 = "rgba(60,32,25,0.78)";
const MUTED = "rgba(60,32,25,0.45)";
const SHADOW = "0 4px 16px rgba(252,150,120,0.10)";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(AppContext);

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await CollectionsService.getAll();
        setCollections(data);
      } catch {
        showSnackbar("error", "Could not load collections. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const openCollection = async (col) => {
    if (loadingId) return;
    setLoadingId(col.id);
    try {
      const { collection, questions } = await CollectionsService.getQuestions(
        col.id,
      );
      navigate("/interview/questions", {
        state: { mode: "collection", collection, questions, from: "collections" },
      });
    } catch {
      showSnackbar("error", "Could not load questions. Please try again.");
      setLoadingId(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: PAGE_BG,
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="md">
        <BreadcrumbHeader
          parentLabel="Interview Hub"
          parentPath="/interview"
          currentLabel="Collections"
        />

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress size={36} sx={{ color: CORAL }} />
          </Box>
        )}

        {/* Empty state */}
        {!loading && collections.length === 0 && (
          <Box sx={{ textAlign: "center", pt: 8 }}>
            <Typography sx={{ fontSize: 14, color: MUTED }}>
              No collections available yet. Check back soon.
            </Typography>
          </Box>
        )}

        {/* Collection cards */}
        {!loading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {collections.map((col) => {
              const isThisLoading = loadingId === col.id;
              return (
                <Box
                  key={col.id}
                  onClick={() => openCollection(col)}
                  sx={{
                    backgroundColor: SURFACE,
                    border: `1px solid ${LINE}`,
                    borderRadius: "16px",
                    p: "22px 24px",
                    boxShadow: SHADOW,
                    cursor: loadingId ? "default" : "pointer",
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:hover": loadingId
                      ? {}
                      : {
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px rgba(252,150,120,0.18)",
                        },
                    opacity: loadingId && !isThisLoading ? 0.5 : 1,
                  }}
                >
                  {/* Header row: badge + question count */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.25,
                    }}
                  >
                    {/* Curated by Speachy badge */}
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        backgroundColor: CORAL_SOFTER,
                        color: CORAL_INK,
                        borderRadius: "20px",
                        px: 1.25,
                        py: 0.3,
                        fontSize: 10.5,
                        fontWeight: 700,
                      }}
                    >
                      <AutoStoriesIcon sx={{ fontSize: 11 }} />
                      Curated by Speachy
                    </Box>

                    {/* Question count */}
                    {isThisLoading ? (
                      <CircularProgress size={16} sx={{ color: CORAL }} />
                    ) : (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: MUTED,
                          fontSize: 12,
                        }}
                      >
                        <FormatListBulletedIcon sx={{ fontSize: 13 }} />
                        {col.questionCount} questions
                      </Box>
                    )}
                  </Box>

                  {/* Collection name */}
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: INK,
                      mb: 0.75,
                      lineHeight: 1.3,
                    }}
                  >
                    {col.name}
                  </Typography>

                  {/* Description */}
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      color: INK_2,
                      lineHeight: 1.65,
                      mb: col.tags?.length > 0 ? 1.5 : 0,
                    }}
                  >
                    {col.description}
                  </Typography>

                  {/* Tag pills */}
                  {col.tags?.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {col.tags.map((tag) => (
                        <Box
                          key={tag}
                          sx={{
                            px: 1.25,
                            py: 0.3,
                            borderRadius: "20px",
                            fontSize: 11.5,
                            fontWeight: 500,
                            color: MUTED,
                            backgroundColor: "rgba(60,32,25,0.05)",
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CollectionsPage;
