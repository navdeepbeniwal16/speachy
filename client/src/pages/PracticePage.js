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
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const PracticePage = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#fff4ef", minHeight: "100vh" }}>
      <Container
        maxWidth="lg"
        sx={{ mt: 0, pt: { xs: 4, md: 6 }, pb: 6, fontFamily: "Roboto" }}
      >
        <Box sx={{ textAlign: "start", mb: 2 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "rgba(36, 20, 14, 0.9)" }}
          >
            Practice your skills
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: "rgba(60,32,25,0.72)" }}
          >
            Build your skills and gain feedback in the speaking arena!
          </Typography>
        </Box>

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
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    px: 4,
                    py: 1,
                    textTransform: "none",
                    backgroundColor: "#FA735B",
                    background:
                      "linear-gradient(90deg, #FF8E53 20%, #FA735B 90%)",
                    "&:hover": {
                      filter: "brightness(0.95)",
                    },
                  }}
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
                  sx={{
                    // background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
                    color: "#fff",
                    fontWeight: "bold",
                    px: 4,
                    py: 1,

                    textTransform: "none",
                    backgroundColor: "#FA735B",
                    background:
                      "linear-gradient(90deg, #FF8E53 20%, #FA735B 90%)",
                    "&:hover": {
                      filter: "brightness(0.95)",
                    },
                  }}
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
