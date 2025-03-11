import React from "react";
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import PropTypes from "prop-types";
import "./InputForm.scss";

const InputForm = ({ value, setValue, getResponse, error, loading, charLimit }) => {
  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        getResponse();
      }}
      sx={{ width: "100%", display: "flex", alignItems: "center" }}
      className="chat-input-form"
    >
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="დაწერეთ შეტყობინება..."
        variant="outlined"
        size="medium"
        fullWidth
        error={!!error}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <Button
              color="primary"
              disabled={loading || !value || value.length > charLimit}
              type="submit"
              className="send-button"
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            </Button>
          ),
        }}
      />
      
      <Typography 
        variant="caption" 
        color={value.length > charLimit ? "error" : "textSecondary"}
        sx={{ position: "absolute", right: 48, bottom: 8, fontSize: "0.7rem" }}
      >
        {value.length}/{charLimit}
      </Typography>
    </Box>
  );
};

InputForm.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  getResponse: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
  charLimit: PropTypes.number
};

InputForm.defaultProps = {
  charLimit: 500
};

export default InputForm;