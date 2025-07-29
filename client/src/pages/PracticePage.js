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
    <Container maxWidth="lg" sx={{ mt: 4, pt: 4, pb: 4, fontFamily: "Roboto" }}>
      <Box sx={{ textAlign: "start", mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Practice your skills
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "gray" }}>
          Build your skills and gain feedback in the speaking arena!
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="flex-start" mt={4}>
        <Grid item xs={12} sm={6} md={5}>
          <Card
            elevation={1}
            sx={{ borderRadius: 2, padding: 2, background: "" }}
          >
            <CardHeader
              title={
                <Typography
                  variant="h6"
                  sx={{ color: "#000", textAlign: "center" }}
                >
                  Impromptu Speaking
                </Typography>
              }
            />

            <CardMedia
              component="img"
              image={process.env.PUBLIC_URL + "/assets/impromptu_speaking.jpeg"}
              alt="Impromptu Speaking"
              sx={{ height: 250, objectFit: "scale-down" }}
            />
            <CardActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate("/imprompt")}
                sx={{
                  background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(90deg, #e7610b, #db2037)",
                  },
                }}
              >
                Get started
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={5}>
          <Card elevation={1} sx={{ borderRadius: 2, padding: 2 }}>
            <CardHeader
              title={
                <Typography
                  variant="h6"
                  sx={{ color: "#000", textAlign: "center" }}
                >
                  Job Interview
                </Typography>
              }
            />
            <CardMedia
              component="img"
              image={process.env.PUBLIC_URL + "/assets/job_interview.jpeg"}
              alt="Impromptu Speaking"
              sx={{ height: 250, objectFit: "scale-down" }}
            />
            <CardActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate("/interview")}
                sx={{
                  background: "linear-gradient(90deg, #ff7a18, #ff3e44)",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(90deg, #e7610b, #db2037)",
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
  );
};

export default PracticePage;
