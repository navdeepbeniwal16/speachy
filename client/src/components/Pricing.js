import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PaymentsService from "../services/payments-service";
import { getAuth } from "firebase/auth";

const REACT_APP_ENV = process.env.REACT_APP_ENV;

const tiers = [
  {
    title: "Get Started",
    subheader: "Recommended",
    price: "9.99",
    description: [
      {
        heading: "Unlimited AI-Generated Summaries",
        subheading:
          "Get personalized summaries to track your progress and focus on key areas.",
      },
      {
        heading: "Unlimited Detailed Feedback",
        subheading:
          "Receive in-depth feedback on your communication skills to ensure continuous improvement.",
      },
      {
        heading: "Unlimited Expert’s Feedback",
        subheading:
          "Get expert insights and advice to refine your techniques and boost your confidence.",
      },
    ],
    buttonText: "Go To Checkout",
    buttonVariant: "contained",
    priceId:
      REACT_APP_ENV === "production"
        ? "price_1PpssHRrj73Jjf7Aw8KAO8hA"
        : "price_1PeXUIRrj73Jjf7AefX0rkrr",
  },
];

const Pricing = () => {
  const handleButtonClick = async (tier) => {
    if (tier.title === "Get Started") {
      if (!tier.priceId) {
        console.log("priceId not found for tier :", tier);
        return;
      }
      const auth = getAuth();
      const userUID = auth.currentUser.uid;
      const priceId = tier.priceId;
      const data = await PaymentsService.createCheckoutSession(
        priceId,
        userUID
      );

      // Redirect to url returned by stripe
      const { url } = data;
      window.location.href = url;
    }
  };

  return (
    <Container
      id="pricing"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
        }}
      >
        <Typography component="h2" variant="h4" color="text.primary">
          Our Price
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join our platform to get the best feedback and guidance on your
          communication journey. <br></br>Start today!
        </Typography>
      </Box>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        {tiers.map((tier) => (
          <Grid
            item
            key={tier.title}
            xs={12}
            sm={tier.title === "Enterprise" ? 12 : 6}
            md={10}
          >
            <Card
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                background:
                  tier.title === "Get Started"
                    ? "linear-gradient(#FF9100, #EF7C00)"
                    : undefined,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: tier.title === "Get Started" ? "grey.100" : "",
                  }}
                >
                  <Typography component="h3" variant="h6">
                    {tier.title}
                  </Typography>
                  {tier.title === "Basic" && (
                    <Chip
                      icon={<AutoAwesomeIcon />}
                      label={tier.subheader}
                      size="small"
                      sx={{
                        background: "#fff",
                      }}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    color: tier.title === "Get Started" ? "grey.50" : undefined,
                  }}
                >
                  <Typography component="h3" variant="h2">
                    ${tier.price}
                  </Typography>
                  <Typography component="h3" variant="h6">
                    &nbsp; monthly
                  </Typography>
                </Box>
                <Divider
                  sx={{
                    my: 2,
                    opacity: 0.2,
                    borderColor: "#fff",
                  }}
                />
                {tier.description.map((line) => (
                  <Box
                    key={line}
                    sx={{
                      py: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <CheckCircleRoundedIcon
                        sx={{
                          width: 20,
                          color:
                            tier.title === "Get Started" ? "white" : "#FF6D00",
                        }}
                      />
                      <Typography
                        component="text"
                        variant="subtitle1"
                        sx={{
                          color:
                            tier.title === "Get Started"
                              ? "grey.200"
                              : undefined,
                        }}
                      >
                        <strong>{line.heading}</strong>
                      </Typography>
                    </Box>

                    <Typography
                      component="text"
                      variant="subtitle2"
                      sx={{
                        color:
                          tier.title === "Get Started" ? "grey.200" : undefined,
                      }}
                    >
                      {line.subheading}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                {tier.title === "Get Started" && (
                  <Button
                    variant="outlined"
                    color="warning"
                    component="a"
                    onClick={() => handleButtonClick(tier)}
                    target="_blank"
                    sx={{
                      bgcolor: "#fff",
                      border: "1px solid #fff",
                      color: "#FF6D00",
                      "&:hover": {
                        bgcolor: "#EEEEEE",
                        border: "1px solid #EEEEEE",
                      },
                    }}
                  >
                    {tier.buttonText}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Pricing;
