import { Box, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div>
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <Typography variant="h6">
            Thanks for subscribing! 🎉 Now, let's head back to{" "}
            <Link to="/">Home</Link>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default PaymentSuccess;
