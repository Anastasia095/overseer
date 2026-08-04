import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { authApi } from "../api/auth";
import { setToken } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      setToken(token);
      const isDispatcher =
        user.roles.includes("dispatcher") && !user.roles.includes("admin") && !user.roles.includes("hr");
      navigate(isDispatcher ? "/dispatcher" : "/hr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Overseer
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Fleet Location Dashboard
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              size="small"
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              size="small"
              sx={{ mb: 3 }}
              required
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" align="center" sx={{ display: "block", mt: 2 }}>
            Demo: admin@ / hr@ / dispatcher@overseer.dev — password123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
