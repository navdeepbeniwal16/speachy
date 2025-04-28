import React from "react";
import {
  ListItemButton,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const QuestionsList = ({ questions }) => {
  return (
    <div>
      {questions.map((questionObj, index) => (
        <ListItemButton
          key={index}
          component="div"
          sx={{
            margin: "0px",
            // borderRadius: "10px"
          }}
          divider
          disablePadding
          // Navigation logic can be added here later
        >
          <Card
            variant="none"
            elevation={0}
            sx={{
              width: "100%",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 0,
            }}
          >
            <CardContent>
              <Typography variant="body2">
                {questionObj.questionText}
              </Typography>
            </CardContent>
            <Box sx={{ marginRight: 2 }}>
              <ArrowForwardIosIcon
                sx={{ height: "22px", width: "22px" }}
                style={{ color: "#BBBBBB" }}
              />
            </Box>
          </Card>
        </ListItemButton>
      ))}
    </div>
  );
};

export default QuestionsList;
