import React from "react";
import { Card, Typography } from "@mui/material";
import "./ResponseDisplay.scss";

const ResponseDisplay = ({ response }) => {
  return (
    response && (
      <Card className="response-card">
        <Typography variant="h6" className="response-title">
          პასუხი:
        </Typography>
        <Typography variant="body1" className="response-text">
          {response}
        </Typography>
      </Card>
    )
  );
};

export default ResponseDisplay;