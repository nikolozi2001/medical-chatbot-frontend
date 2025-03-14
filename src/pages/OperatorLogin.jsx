import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { loginOperator } from "../services/authService";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLiveChat } from "../context/LiveChatContext";

const OperatorLogin = () => {
  const navigate = useNavigate();
  const { enableOperatorMode, setOperatorData } = useLiveChat();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });

    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.username.trim() || !credentials.password) {
      setError("Please enter both username/email and password");
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting login form with username:", credentials.username);

      const result = await loginOperator(credentials);
      console.log("Login successful, result:", result);

      if (!result.operator || !result.token) {
        throw new Error("Invalid response from server");
      }

      setOperatorData(result.operator);
      enableOperatorMode();

      navigate("/operator");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Operator Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username or Email"
            name="username"
            autoComplete="username"
            autoFocus
            value={credentials.username}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Log In"}
          </Button>
          <Box display="flex" justifyContent="center">
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link component={RouterLink} to="/operator/signup">
                Sign up
              </Link>
            </Typography>
          </Box>
          <Box mt={2} display="flex" justifyContent="center">
            <Button variant="text" size="small" component={RouterLink} to="/">
              Back to Home
            </Button>
          </Box>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Link component={RouterLink} to="/operator/signup" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
            <Link
              component={RouterLink}
              to="/operator/forgot-password"
              variant="body2"
            >
              {"Forgot password?"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default OperatorLogin;
