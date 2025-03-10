import React from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const InputForm = ({ value, setValue, getResponse, error, loading, charLimit }) => {
  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        getResponse();
      }}
      sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="თქვენი შეკითხვა"
        variant="outlined"
        multiline
        rows={4}
        error={!!error}
        helperText={error}
        disabled={loading}
        fullWidth
      />
      <Typography 
        variant="caption" 
        align="right"
        color={value.length > charLimit ? "error" : "textSecondary"}
      >
        {value.length}/{charLimit}
      </Typography>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading || !value || value.length > charLimit}
      >
        {loading ? "მოთხოვნის გაგზავნა..." : "გაგზავნა"}
      </Button>
    </Box>
  );
};

InputForm.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  getResponse: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
  charLimit: PropTypes.number,
};

InputForm.defaultProps = {
  charLimit: 500
};

export default InputForm;