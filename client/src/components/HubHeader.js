import React from "react";
import { Box, Typography } from "@mui/material";

const INK  = "#2f170f";
const MUTED = "rgba(60,32,25,0.45)";

const HubHeader = ({ title, subtitle, action }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: "Georgia, serif",
          fontSize: { xs: 26, md: 30 },
          fontWeight: 500,
          color: INK,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      {action && <Box sx={{ flexShrink: 0, mt: 0.5 }}>{action}</Box>}
    </Box>
    {subtitle && (
      <Typography sx={{ fontSize: 14, color: MUTED, mt: 0.75, lineHeight: 1.6 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default HubHeader;
