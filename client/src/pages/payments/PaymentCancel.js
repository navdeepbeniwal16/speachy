import { Box, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const PaymentCancel = () => {
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
            let's head back to try again or explore more options at{" "}
            <Link to="/">Home</Link>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default PaymentCancel;
