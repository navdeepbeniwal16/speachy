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

const tiers = [
  {
    title: "Free",
    price: "0",
    description: [
      "Unlimited AI-Generated Summaries",
      "10 Detailed Feedback",
      "5 Expert’s Feedback",
    ],
    buttonText: "Sign up for free",
    buttonVariant: "outlined",
    priceId: null,
  },
  {
    title: "Basic",
    subheader: "Recommended",
    price: "9.99",
    description: [
      "Unlimited AI-Generated Summaries",
      "Unlimited Detailed Feedback",
      "Unlimited Expert’s Feedback",
    ],
    buttonText: "Upgrade",
    buttonVariant: "contained",
    priceId: "price_1PeXUIRrj73Jjf7AefX0rkrr",
  },
];

const Pricing = () => {
  const handleButtonClick = async (tier) => {
    if (tier.title === "Basic") {
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
          Our Plans
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enjoy our free plan or boost your progress with our Basic plan.
          <br />
          Choose what suits you best!
        </Typography>
      </Box>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        {tiers.map((tier) => (
          <Grid
            item
            key={tier.title}
            xs={12}
            sm={tier.title === "Enterprise" ? 12 : 6}
            md={5}
          >
            <Card
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                background:
                  tier.title === "Basic"
                    ? "linear-gradient(#FF9100, #EF6C00)"
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
                    color: tier.title === "Basic" ? "grey.100" : "",
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
                    color: tier.title === "Basic" ? "grey.50" : undefined,
                  }}
                >
                  <Typography component="h3" variant="h2">
                    ${tier.price}
                  </Typography>
                  {tier.originalPrice && tier.originalPrice !== tier.price && (
                    <Typography
                      component="h3"
                      variant="h6"
                      sx={{
                        textDecoration: "line-through",
                        color: "white.500",
                        marginLeft: 1,
                      }}
                    >
                      ${tier.originalPrice}
                    </Typography>
                  )}
                  <Typography component="h3" variant="h6">
                    &nbsp; monthly
                  </Typography>
                </Box>
                <Divider
                  sx={{
                    my: 2,
                    opacity: 0.2,
                    borderColor: "grey.500",
                  }}
                />
                {tier.description.map((line) => (
                  <Box
                    key={line}
                    sx={{
                      py: 1,
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        width: 20,
                        color: tier.title === "Basic" ? "white" : "#FF6D00",
                      }}
                    />
                    <Typography
                      component="text"
                      variant="subtitle2"
                      sx={{
                        color: tier.title === "Basic" ? "grey.200" : undefined,
                      }}
                    >
                      {line}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
              <CardActions>
                {tier.title === "Basic" && (
                  <Button
                    fullWidth
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
