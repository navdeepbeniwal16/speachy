import React from "react";
import {
  Box,
  CssBaseline,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryGroup,
  VictoryScatter,
  VictoryTheme,
} from "victory";
import InfoIcon from "@mui/icons-material/Info";

const QuestionProgressView = ({ seriesData }) => {
  const maxEntries = 5; // Reserve space for 5 entries
  const xSlots = Array.from({ length: maxEntries }, (_, i) => i); // Fixed slots [0, 1, 2, 3, 4]

  return (
    <Card elevation={0} sx={{ borderRadius: 2, p: 1 }}>
      <CssBaseline />
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          User Progress Overview
          <Tooltip
            title="Shows progress across different areas over recent attempts"
            sx={{
              pl: 1,
            }}
          >
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>

        <Stack
          spacing={2}
          divider={<Divider variant="middle" sx={{ padding: 1 }} />}
        >
          {seriesData.map((s, i) => (
            <Box key={s.name} sx={{ padding: 1, height: "250px" }}>
              <Typography variant="subtitle1" gutterBottom>
                {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
              </Typography>
              <VictoryChart
                theme={VictoryTheme.clean}
                height={200}
                padding={{ top: 20, left: 50, right: 30, bottom: 40 }}
              >
                <VictoryAxis
                  tickValues={xSlots}
                  tickFormat={(x) =>
                    s.attemptDateTime.slice(-maxEntries)[x] || ""
                  }
                  style={{
                    tickLabels: { fontSize: 8, angle: -45 },
                    ticks: { stroke: "#757575", size: 4 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickValues={[4, 6, 8]}
                  tickFormat={(value) =>
                    value >= 8
                      ? "Excelling"
                      : value >= 6
                      ? "Progressing"
                      : value >= 4
                      ? "On Track"
                      : ""
                  }
                  style={{
                    axis: { stroke: "transparent" },
                    tickLabels: { fontSize: 8 },
                    grid: { stroke: "#e0e0e0", strokeDasharray: "3,3" },
                  }}
                />
                <VictoryGroup
                  data={s.data
                    .slice(-maxEntries)
                    .map((d, idx) => ({ x: idx, y: d }))}
                >
                  <VictoryLine
                    style={{
                      data: {
                        stroke: VictoryTheme.material.palette.qualitative[i],
                        strokeWidth: 1.5,
                      },
                    }}
                  />
                  <VictoryScatter
                    size={2}
                    style={{
                      data: {
                        fill: VictoryTheme.material.palette.qualitative[i],
                      },
                    }}
                  />
                </VictoryGroup>
              </VictoryChart>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuestionProgressView;
