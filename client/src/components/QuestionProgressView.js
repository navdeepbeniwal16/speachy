import React from "react";
import {
  Box,
  CssBaseline,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryGroup,
  VictoryScatter,
  VictoryTheme,
  VictoryLegend,
} from "victory";
import _ from "lodash";
import InfoIcon from "@mui/icons-material/Info";

const QuestionProgressView = () => {
  const series = [
    {
      name: "Relevance",
      data: [
        5.191, 4.339, 7.988, 8.508, 7.256, 9.505, 7.614, 6.219, 4.197, 9.452,
        7.281,
      ],
      attemptDateTime: [
        "2:10 pm",
        "2:14 pm",
        "2:17 pm",
        "2:26 pm",
        "2:31 pm",
        "2:34 pm",
        "2:40 pm",
        "2:42 pm",
        "2:48 pm",
        "2:53 pm",
      ],
    },
    {
      name: "Structure",
      data: [
        3.967, 5.265, 6.201, 7.801, 9.694, 8.214, 9.973, 5.25, 8.816, 8.413,
        8.413,
      ],
      attemptDateTime: [
        "2:10 pm",
        "2:14 pm",
        "2:17 pm",
        "2:26 pm",
        "2:31 pm",
        "2:34 pm",
        "2:40 pm",
        "2:42 pm",
        "2:48 pm",
        "2:53 pm",
      ],
    },
    {
      name: "Sentiment",
      data: [
        3.051, 5.067, 3.918, 4.821, 8.775, 6.268, 8.559, 9.159, 7.346, 9.915,
        4.633,
      ],
      attemptDateTime: [
        "2:10 pm",
        "2:14 pm",
        "2:17 pm",
        "2:26 pm",
        "2:31 pm",
        "2:34 pm",
        "2:40 pm",
        "2:42 pm",
        "2:48 pm",
        "2:53 pm",
      ],
    },
    {
      name: "Authenticity",
      data: [
        8.736, 9.029, 6.383, 6.608, 6.464, 4.679, 6.917, 6.792, 9.274, 6.181,
        4.367,
      ],
      attemptDateTime: [
        "2:10 pm",
        "2:14 pm",
        "2:17 pm",
        "2:26 pm",
        "2:31 pm",
        "2:34 pm",
        "2:40 pm",
        "2:42 pm",
        "2:48 pm",
        "2:53 pm",
      ],
    },
  ];

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

        <Box
          sx={{
            padding: 1,
          }}
        >
          <VictoryChart
            theme={VictoryTheme.clean}
            padding={{ top: 60, left: 70, right: 50, bottom: 40 }}
          >
            <VictoryAxis
              tickValues={series[0].attemptDateTime}
              style={{
                tickLabels: { fontSize: 8, angle: -45 },
                ticks: { stroke: "#757575", size: 5 },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickValues={_.range(0, 12, 3)}
              tickFormat={(value) =>
                value >= 8
                  ? "Excelling"
                  : value >= 5
                  ? "Progressing"
                  : value >= 3
                  ? "On Track"
                  : ""
              }
              style={{
                axis: { stroke: "transparent" },
                tickLabels: { fontSize: 10 },
                grid: { stroke: "#e0e0e0", strokeDasharray: "3,3" },
              }}
            />
            {series.map((s, i) => (
              <VictoryGroup
                key={s.name}
                data={s.data.map((d, idx) => ({ x: idx, y: d }))}
                colorScale="qualitative"
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
                  size={2.5}
                  style={{
                    data: {
                      fill: VictoryTheme.material.palette.qualitative[i],
                    },
                  }}
                />
              </VictoryGroup>
            ))}
            <VictoryLegend
              orientation="horizontal"
              gutter={20}
              data={series.map((s, i) => ({
                name: s.name,
                symbol: {
                  fill: VictoryTheme.material.palette.qualitative[i],
                  type: "circle",
                },
              }))}
              style={{
                labels: { fontSize: 10 },
                border: { stroke: "none" },
              }}
            />
          </VictoryChart>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuestionProgressView;
