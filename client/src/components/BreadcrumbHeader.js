import React from "react";
import { Box, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useNavigate } from "react-router-dom";

const INK   = "#2f170f";
const MUTED = "rgba(60,32,25,0.45)";

const BreadcrumbHeader = ({
  parentLabel,
  parentPath,
  currentLabel,
  onBack,
  right,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    navigate(parentPath);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
        minHeight: 36,
      }}
    >
      {/* Left: chevron + parent / current */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0, minWidth: 0, flex: 1 }}
      >
        <ChevronLeftIcon
          onClick={handleBack}
          sx={{
            fontSize: 20,
            color: MUTED,
            cursor: "pointer",
            flexShrink: 0,
            mr: 0.25,
            "&:hover": { color: INK },
            transition: "color 120ms ease",
          }}
        />
        <Typography
          onClick={handleBack}
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: MUTED,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": { color: INK },
            transition: "color 120ms ease",
          }}
        >
          {parentLabel}
        </Typography>
        {currentLabel && (
          <>
            <Typography sx={{ fontSize: 13, color: MUTED, mx: 0.75, flexShrink: 0 }}>
              /
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: INK,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentLabel}
            </Typography>
          </>
        )}
      </Box>

      {/* Right: optional content */}
      {right && (
        <Box sx={{ flexShrink: 0, ml: 2, display: "flex", alignItems: "center" }}>
          {right}
        </Box>
      )}
    </Box>
  );
};

export default BreadcrumbHeader;
