import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

const PaymentCancel = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            padding: 15,
          }}
        >
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            Oh no! It looks like the payment didn’t go through. 😢 No worries,
            you can head back to home and try again{" "}
            <Button onClick={() => navigate("/")} color="warning">
              <HomeIcon /> Home
            </Button>{" "}
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default PaymentCancel;
