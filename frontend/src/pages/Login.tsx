import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"hr" | "dispatcher" | null>(null);

  const handleLogin = () => {
    if (role === "hr") navigate("/hr");
    if (role === "dispatcher") navigate("/dispatcher");
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

          <TextField
            fullWidth
            label="Email"
            placeholder="you@company.com"
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            size="small"
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Role (demo)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <Button
              variant={role === "hr" ? "contained" : "outlined"}
              onClick={() => setRole("hr")}
              fullWidth
            >
              HR
            </Button>
            <Button
              variant={role === "dispatcher" ? "contained" : "outlined"}
              onClick={() => setRole("dispatcher")}
              fullWidth
            >
              Dispatcher
            </Button>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!role}
            onClick={handleLogin}
          >
            Sign In as {role === "hr" ? "HR" : role === "dispatcher" ? "Dispatcher" : ""}
          </Button>

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
            Demo credentials — no real auth implemented yet
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
