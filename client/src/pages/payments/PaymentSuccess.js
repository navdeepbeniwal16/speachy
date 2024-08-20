import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PaymentsIcon from "@mui/icons-material/Payments";
import HomeIcon from "@mui/icons-material/Home";
import { getAuth } from "firebase/auth";
import PaymentsService from "../../services/payments-service";

const PaymentSuccess = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const navigateToCustomerPaymentPortal = async () => {
    try {
      const userUID = auth.currentUser.uid; // Fetch current user uid
      const response = await PaymentsService.createCustomerPaymentPortal(
        userUID
      );

      // Redirect to customer-portal url returned by stripe
      const { url } = response.data;
      window.location.href = url;
    } catch (error) {
      console.error("Error navigating to customer payment portal:", error);
    }
  };

  return (
    <div>
      <Container>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            Thanks for subscribing! 🎉 <br></br>Now, you can head back to{" "}
            <Button onClick={() => navigate("/")} color="warning">
              <HomeIcon /> Home
            </Button>{" "}
          </Typography>
          <Typography sx={{ textAlign: "center" }}>or</Typography>
          <Typography variant="h6">
            Navigate to{" "}
            <Button onClick={navigateToCustomerPaymentPortal} color="warning">
              <PaymentsIcon /> Payments
            </Button>{" "}
            to manage your subscriptions.
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default PaymentSuccess;
