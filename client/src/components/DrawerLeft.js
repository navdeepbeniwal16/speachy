import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  CssBaseline,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import HistoryIcon from "@mui/icons-material/History";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMediaQuery } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

// ─── Design tokens ──────────────────────────────────────────────────────────
const CORAL = "#FA735B";
const CORAL_SOFTER = "rgba(250,115,91,0.10)";
const CORAL_INK = "#C85A3E";
const INK = "#2f170f";
const MUTED = "rgba(60,32,25,0.42)";
const LINE = "rgba(252,150,120,0.15)";
const SURFACE = "#ffffff";

const EXPANDED_WIDTH = 196;
const COLLAPSED_WIDTH = 64;
const BANNER_HEIGHT = 20;

const NAV_ITEMS = [
  { label: "Home", icon: <HomeIcon sx={{ fontSize: 20 }} />, path: "/home" },
  {
    label: "Projects",
    icon: <FolderOpenOutlinedIcon sx={{ fontSize: 20 }} />,
    path: "/projects",
  },
  {
    label: "History",
    icon: <HistoryIcon sx={{ fontSize: 20 }} />,
    path: "/history",
  },
  {
    label: "FAQs",
    icon: <HelpOutlineIcon sx={{ fontSize: 20 }} />,
    path: "/faq",
  },
];

const getEnvironmentBanner = () => {
  const env = process.env.REACT_APP_ENV;
  if (env === "local") return { label: "Local", bg: "#b86e00" };
  if (env === "development") return { label: "Development", bg: "#2a7a52" };
  return null;
};

export default function DrawerLeft() {
  const auth = getAuth();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebar_collapsed") === "true",
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  const isActive = (path) => {
    if (path === "/home") return location.pathname === "/home";
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  if (!user) return null;

  const banner = getEnvironmentBanner();
  const width = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const drawerTop = banner ? BANNER_HEIGHT : 0;

  // ── Sidebar content ─────────────────────────────────────────────────────────
  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          px: isCollapsed ? 0 : 2.5,
          flexShrink: 0,
        }}
      >
        <Link to="/home" style={{ display: "flex", alignItems: "center" }}>
          {isCollapsed ? (
            <img
              src="/assets/Speachy_Logo_SVG.svg"
              alt="Speachy"
              style={{ width: 30, height: 30, objectFit: "contain" }}
            />
          ) : (
            <img
              src="/assets/Speachy_Logo_Full_SVG.svg"
              alt="Speachy"
              style={{ width: 120, height: "auto" }}
            />
          )}
        </Link>
      </Box>

      {/* Top divider */}
      <Box
        sx={{
          height: "1px",
          backgroundColor: LINE,
          mx: isCollapsed ? 1.5 : 2,
          mb: 1,
        }}
      />

      {/* Nav items */}
      <Box sx={{ px: 1, flex: 1, pt: 0.5 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Tooltip
              key={item.label}
              title={isCollapsed ? item.label : ""}
              placement="right"
              arrow
            >
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: "10px",
                  mb: 0.5,
                  px: isCollapsed ? 0 : 1.75,
                  py: 1.1,
                  minHeight: 44,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  backgroundColor: active ? CORAL_SOFTER : "transparent",
                  color: active ? CORAL_INK : MUTED,
                  transition: "background-color 120ms ease, color 120ms ease",
                  "&:hover": {
                    backgroundColor: CORAL_SOFTER,
                    color: CORAL_INK,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 1.5,
                    color: "inherit",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? INK : MUTED,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </Box>

      {/* Bottom section */}
      <Box sx={{ px: 1, pb: 2, flexShrink: 0 }}>
        {/* Collapse toggle */}
        <Tooltip
          title={isCollapsed ? "Expand" : "Collapse"}
          placement="right"
          arrow
        >
          <ListItemButton
            onClick={toggleCollapse}
            sx={{
              borderRadius: "10px",
              mb: 1,
              px: isCollapsed ? 0 : 1.75,
              py: 1,
              minHeight: 40,
              justifyContent: isCollapsed ? "center" : "flex-start",
              color: MUTED,
              transition: "background-color 120ms ease, color 120ms ease",
              "&:hover": { backgroundColor: CORAL_SOFTER, color: CORAL_INK },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isCollapsed ? 0 : 1.5,
                color: "inherit",
                justifyContent: "center",
              }}
            >
              {isCollapsed ? (
                <ChevronRightIcon sx={{ fontSize: 20 }} />
              ) : (
                <ChevronLeftIcon sx={{ fontSize: 20 }} />
              )}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary="Collapse"
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: MUTED,
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>

        {/* Divider */}
        <Box sx={{ height: "1px", backgroundColor: LINE, mb: 1.5 }} />

        {/* Profile */}
        <Tooltip
          title={isCollapsed ? user.displayName || "" : ""}
          placement="right"
          arrow
        >
          <ListItemButton
            component={Link}
            to="/profile"
            sx={{
              borderRadius: "10px",
              px: isCollapsed ? 0 : 1.5,
              py: 0.75,
              minHeight: 44,
              justifyContent: isCollapsed ? "center" : "flex-start",
              transition: "background-color 120ms ease",
              "&:hover": { backgroundColor: CORAL_SOFTER },
            }}
          >
            <Avatar
              src={user?.photoURL}
              sx={{
                width: 30,
                height: 30,
                mr: isCollapsed ? 0 : 1.25,
                flexShrink: 0,
              }}
            />
            {!isCollapsed && (
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: INK,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.displayName}
              </Typography>
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // ── Environment banner ───────────────────────────────────────────────────────
  const envBanner = banner && (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: BANNER_HEIGHT,
        zIndex: 1400,
        backgroundColor: banner.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        {banner.label}
      </Typography>
    </Box>
  );

  // ── Desktop permanent drawer ─────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <>
        <CssBaseline />
        {envBanner}
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width,
            flexShrink: 0,
            transition: "width 200ms ease",
            "& .MuiDrawer-paper": {
              top: drawerTop,
              height: `calc(100% - ${drawerTop}px)`,
              width,
              overflowX: "hidden",
              transition: "width 200ms ease",
              boxSizing: "border-box",
              backgroundColor: SURFACE,
              borderRight: `1px solid ${LINE}`,
              boxShadow: "none",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  // ── Mobile temporary drawer ──────────────────────────────────────────────────
  return (
    <>
      <CssBaseline />
      {envBanner}
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          position: "fixed",
          top: drawerTop + 14,
          left: 14,
          zIndex: 1300,
          color: INK,
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            top: drawerTop,
            height: `calc(100% - ${drawerTop}px)`,
            width: EXPANDED_WIDTH,
            backgroundColor: SURFACE,
            borderRight: `1px solid ${LINE}`,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
