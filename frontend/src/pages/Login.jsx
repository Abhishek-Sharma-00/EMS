import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import "@/styles/Auth.css";
import logo from "../assets/EventUs-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Login failed";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="homepage-navbar">
        <div className="nav-left">
          <img src={logo} alt="Eventus" className="nav-logo" />
          <h1 className="nav-title">EventUS</h1>
        </div>

        <div className="nav-links">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="ghost" onClick={() => navigate("/events")}>
            Events
          </Button>
          <Button variant="ghost" onClick={() => navigate("/about")}>
            About Us
          </Button>

          {user ? (
            <div className="profile-dropdown-wrapper">
              <div className="profile-info" onClick={() => setOpen(!open)}>
                <div className="profile-text">
                  <span className="profile-name">{user.name || "User"}</span>

                  {/* ADMIN BADGE */}
                  {user.role === "admin" && (
                    <span className="user-badge">Admin</span>
                  )}
                  {user.role === "attendee" && (
                    <span className="user-badge">Attendee</span>
                  )}
                </div>
              </div>

              {/* DROPDOWN MENU */}
              {open && (
                <div className="dropdown-menu">
                  <p
                    onClick={() =>
                      navigate(user.role === "admin" ? "/admin" : "/attendee")
                    }
                  >
                    Dashboard
                  </p>
                  <p onClick={() => navigate("/profile")}>Manage Profile</p>
                  <hr />
                  <p className="logout-btn" onClick={logout}>
                    Logout
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/register")}>Register</Button>
            </>
          )}
        </div>
      </nav>

      <div className="auth-container">
        <Card className="auth-card" data-testid="login-card">
          <CardHeader>
            <CardTitle className="auth-title" data-testid="login-title">
              Welcome Back
            </CardTitle>
            <p className="auth-subtitle" data-testid="login-subtitle">
              Login to your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                />
              </div>
              <div className="form-field">
                <Label htmlFor="password">Password</Label>
                <div className="password-input-wrapper">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="login-password-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="auth-button"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="auth-footer">
              <p data-testid="login-register-link">
                Don't have an account?{" "}
                <Link to="/register" className="auth-link">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
