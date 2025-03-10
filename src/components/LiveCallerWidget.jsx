import React, { useState, useEffect } from "react";
import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";

const LiveCallerWidget = ({ onChatButtonClick }) => {
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [isChatActive, setIsChatActive] = useState(false);

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const [dateInputValue, setDateInputValue] = useState(todayDate);

  const validateDateInput = (e) => {
    const selectedDate = new Date(e.target.value);

    if (selectedDate < today) {
      toast.error("ძველი თარიღის არჩევა შეუძლებელია");
      setDateInputValue(todayDate);
      return;
    }

    setDateInputValue(e.target.value);
  };

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      setIsChatActive(currentHour >= 9 && currentHour < 20);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {isChatActive ? (
        <Card
          sx={{
            backgroundColor: "#1E2A4A",
            color: "white",
            padding: 3,
            borderRadius: "12px",
            textAlign: "center",
            width: "90%",
            maxWidth: 400,
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            გამარჯობა,
          </Typography>
          <Typography variant="body2">
            გჭირდებათ დახმარება? მოგვწერეთ!
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FFC107",
              color: "black",
              mt: 2,
              borderRadius: "20px",
              textTransform: "none",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={onChatButtonClick}
          >
            ონლაინ ჩატი
          </Button>
        </Card>
      ) : (
        <Card
          sx={{
            backgroundColor: "#1E2A4A",
            color: "white",
            padding: 3,
            borderRadius: "12px",
            textAlign: "center",
            width: "90%",
            maxWidth: 400,
            mb: 2,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            ონლაინ ჩატი არ არის ხელმისაწვდომი
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            სამუშაო საათები
          </Typography>
          <Typography variant="body2">ორშ - პარ:</Typography>
          <Typography variant="body2">09⁰⁰ - 17⁰⁰</Typography>
        </Card>
      )}

      {/* Call Request Form */}
      <Card
        sx={{ width: "90%", maxWidth: 400, padding: 3, borderRadius: "12px" }}
      >
        <Typography variant="h6" gutterBottom>
          გადმორეკვის სერვისი
        </Typography>
        <Typography variant="body2" color="text.secondary">
          აირჩიეთ დღე და საათი როდესაც გსურთ კონსულტანტი დაგიკავშირდეთ.
        </Typography>

        {/* Date Selection */}
        <Typography sx={{ mt: 2 }}>თარიღი</Typography>
        <TextField
          fullWidth
          type="date"
          value={dateInputValue}
          onChange={validateDateInput}
          sx={{ mt: 1 }}
        />
        <Typography sx={{ mt: 2 }}>საათი</Typography>
        <TextField
          fullWidth
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          sx={{ mt: 1 }}
          min={todayDate}
        />

        {/* Phone Number */}
        <Typography sx={{ mt: 2 }}>თქვენი ნომერი</Typography>
        <Box display="flex" alignItems="center" mt={1}>
          <TextField
            fullWidth
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="555 12 34 56"
          />
        </Box>

        {/* Submit Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2, borderRadius: "20px" }}
          startIcon={<SendIcon />}
        >
          გადმორეკვა
        </Button>
      </Card>
    </Box>
  );
};

export default LiveCallerWidget;