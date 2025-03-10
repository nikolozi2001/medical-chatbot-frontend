import React, { useRef } from "react";
import { TextField, Button, Box, Typography, IconButton, CircularProgress } from "@mui/material";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import PropTypes from "prop-types";
import "./InputForm.scss";

const InputForm = ({ value, setValue, getResponse, error, loading, charLimit, onFileUpload }) => {
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset the input to allow selecting the same file again
    e.target.value = "";
  };
  
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
        rows={3}
        error={!!error}
        helperText={error}
        disabled={loading}
        fullWidth
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton 
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
          title="ფაილის მიმაგრება"
          color="primary"
        >
          <AttachFileIcon />
        </IconButton>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        
        <Typography 
          variant="caption" 
          color={value.length > charLimit ? "error" : "textSecondary"}
        >
          {value.length}/{charLimit}
        </Typography>
      </Box>
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading || !value || value.length > charLimit}
        endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
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
  onFileUpload: PropTypes.func,
};

InputForm.defaultProps = {
  charLimit: 500,
  onFileUpload: () => {}
};

export default InputForm;