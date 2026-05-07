import React from "react";
import {
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Button,
  CardHeader,
} from "@mui/material";
import HubHeader from "../components/HubHeader.js";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const PracticePage = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const primaryButtonSx = {
    textTransform: "none",
    fontWeight: 600,
    px: 3.5,
    py: 1.4,
    borderRadius: 2,
    backgroundColor: "#FA735B",
    boxShadow:
      "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
    "&:hover": {
      backgroundColor: "#f8643f",
      boxShadow:
        "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
    },
  };

  return (
    <Box sx={{ backgroundColor: "#fff4ef", minHeight: "100vh" }}>
      <Container
        maxWidth="lg"
        sx={{ mt: 0, pt: { xs: 4, md: 6 }, pb: 6, fontFamily: "Roboto" }}
      >
        <HubHeader
          title="Practice"
          subtitle="Build your skills and gain feedback in the speaking arena."
        />

        <Grid container spacing={4} justifyContent="flex-start" mt={4}>
          <Grid item xs={12} sm={6} md={5}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #f0e6e1",
                borderRadius: 2,
                padding: 2,
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(250, 115, 91, 0.06)",
              }}
            >
              <CardHeader
                title={
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(36, 20, 14, 0.9)", textAlign: "center" }}
                  >
                    Impromptu Speaking
                  </Typography>
                }
              />

              <CardMedia
                component="img"
                image={process.env.PUBLIC_URL + "/assets/impromptu_speaking.png"}
                alt="Impromptu Speaking"
                sx={{ height: 250, objectFit: "scale-down" }}
              />
              <CardActions sx={{ justifyContent: "center", p: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/imprompt")}
                  sx={primaryButtonSx}
                >
                  Get started
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={5}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #f0e6e1",
                borderRadius: 2,
                padding: 2,
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(250, 115, 91, 0.06)",
              }}
            >
              <CardHeader
                title={
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(36, 20, 14, 0.9)", textAlign: "center" }}
                  >
                    Job Interview
                  </Typography>
                }
              />
              <CardMedia
                component="img"
                image={process.env.PUBLIC_URL + "/assets/job_interview.png"}
                alt="Impromptu Speaking"
                sx={{ height: 250, objectFit: "scale-down" }}
              />
              <CardActions sx={{ justifyContent: "center", p: 2 }}>
                <Button
                  variant="contained"
                  elevation={0}
                  onClick={() => navigate("/interview")}
                  sx={primaryButtonSx}
                >
                  Start preparing
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PracticePage;
