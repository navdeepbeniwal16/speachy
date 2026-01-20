import React, { useMemo } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";

// Simple GitHub-style streak calendar for the last 8 weeks (56 days)
// Props:
// - activeDates: array of YYYY-MM-DD strings marking days with at least one session
// - title: optional heading
// - showLegend: boolean to display color legend
// - highlightCurrentStreak: boolean to emphasize the ongoing streak cells

function formatYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function computeCurrentStreak(activeSet) {
  let streak = 0;
  let day = new Date();
  // normalize to local midnight for consistency
  day.setHours(0, 0, 0, 0);

  // If today isn't active but yesterday is, streak should still count up to yesterday
  // However, for a "current" streak UX, many apps only count if today is active.
  // For scaffolding, we count up to yesterday if today is inactive.
  let cursor = formatYMD(day);
  if (!activeSet.has(cursor)) {
    day = addDays(day, -1);
  }

  while (true) {
    const key = formatYMD(day);
    if (activeSet.has(key)) {
      streak += 1;
      day = addDays(day, -1);
    } else {
      break;
    }
  }
  return streak;
}

const WEEKS = 8;
const INACTIVE_COLOR = { bg: "#f1e7e0", border: "#e2d3ca" };
const ACTIVE_COLOR = { bg: "#ffd9c6", border: "#ffc3a8" };
const CURRENT_COLOR = { bg: "#ff9b6c", border: "#ff9b6c" };

const StreakCalendar = ({
  activeDates = [],
  title = "Your Streak",
  showLegend = true,
  highlightCurrentStreak = true,
}) => {
  const activeSet = useMemo(() => new Set(activeDates), [activeDates]);

  // Responsive sizing
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const cell = upMd ? 14 : upSm ? 12 : 10;
  const gap = upMd ? 4 : 3;

  // Gradient text style used for the streak display
  const gradientTextSx = {
    background: "linear-gradient(90deg, #FA735B 0%, #FF8E53 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
  };

  const { days, currentStreak, currentStreakKeys } = useMemo(() => {
    // Build a matrix of the last 8 weeks (rightmost column is the current week)
    // We'll render columns from left (older) to right (newest)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Align start to the beginning of the week (Sun) of (today - (WEEKS-1) weeks)
    const start = addDays(today, -7 * (WEEKS - 1));
    const startWeekday = start.getDay(); // 0 Sun - 6 Sat
    const gridStart = addDays(start, -startWeekday);

    const daysArr = [];
    for (let i = 0; i < 7 * WEEKS; i++) {
      const d = addDays(gridStart, i);
      const key = formatYMD(d);
      daysArr.push({ date: d, key, active: activeSet.has(key) });
    }

    // Compute current streak and which keys are in it for highlighting
    const streak = computeCurrentStreak(activeSet);
    const streakKeys = new Set();
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    let cursorKey = formatYMD(cursor);
    if (!activeSet.has(cursorKey)) cursor = addDays(cursor, -1);
    for (let i = 0; i < streak; i++) {
      streakKeys.add(formatYMD(cursor));
      cursor = addDays(cursor, -1);
    }

    return { days: daysArr, currentStreak: streak, currentStreakKeys: streakKeys };
  }, [activeSet]);

  const getColor = (isActive, isCurrentStreak) => {
    if (!isActive) return INACTIVE_COLOR;
    if (highlightCurrentStreak && isCurrentStreak) return CURRENT_COLOR;
    return ACTIVE_COLOR;
  };

  return (
    <Box>
      {/* Title on the left, large streak on the right (no pill) */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", rowGap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#222" }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexGrow: 1, justifyContent: "flex-end", flexWrap: "wrap" }} title={`${currentStreak} day streak`}>
          <WhatshotIcon sx={{ fontSize: upMd ? 42 : upSm ? 36 : 30, color: "#ff6a33" }} />
          <Typography
            variant={upMd ? "h3" : upSm ? "h4" : "h5"}
            sx={{ fontWeight: 800, lineHeight: 1, ...gradientTextSx }}
          >
            {currentStreak}
          </Typography>
          <Typography variant="caption" sx={{ ml: 0.5, ...gradientTextSx }}>
            day{currentStreak === 1 ? "" : "s"} streak
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex" }}>
        {/* Weekday labels */}
        <Box sx={{ mr: 1, display: "grid", gridTemplateRows: `repeat(7, ${cell}px)`, rowGap: `${gap}px` }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="caption" sx={{ color: "#777" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
              </Typography>
            </Box>
          ))}
        </Box>
        {/* Grid: fill by columns (weeks), 7 rows (days Sun-Sat) */}
        <Box
          sx={{
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: `repeat(7, ${cell}px)`,
            gridTemplateColumns: `repeat(${WEEKS}, ${cell}px)`,
            columnGap: `${gap}px`,
            rowGap: `${gap}px`,
          }}
        >
          {days.map((d) => {
            const isCurrent = currentStreakKeys.has(d.key);
            const { bg, border } = getColor(d.active, isCurrent);
            const title = `${d.key}${d.active ? " • active" : ""}`;
            return (
              <Box
                key={d.key}
                title={title}
                sx={{
                  width: cell,
                  height: cell,
                  borderRadius: 3,
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  boxSizing: "border-box",
                }}
              />
            );
          })}
        </Box>
      </Box>
      {/* Legend below the grid */}
      {showLegend && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 3, background: INACTIVE_COLOR.bg, border: `1px solid ${INACTIVE_COLOR.border}` }} />
            <Typography variant="caption" sx={{ color: "#777" }}>No activity</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 3, background: ACTIVE_COLOR.bg, border: `1px solid ${ACTIVE_COLOR.border}` }} />
            <Typography variant="caption" sx={{ color: "#777" }}>Active day</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 3, background: CURRENT_COLOR.bg, border: `1px solid ${CURRENT_COLOR.border}` }} />
            <Typography variant="caption" sx={{ color: "#777" }}>Current streak</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StreakCalendar;
