import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import "@/styles/Auth.css";
import logo from "../assets/EventUs-logo.png";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("attendee");
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const validateEmailDomain = (email) => {
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
      "protonmail.com",
      "live.com",
    ];

    const emailParts = email.split("@");
    if (emailParts.length !== 2) return false;

    const domain = emailParts[1].toLowerCase();
    return allowedDomains.includes(domain);
  };

  const validateInputs = () => {
    // NAME
    if (!/^[A-Za-z\s]{3,30}$/.test(name)) {
      toast.error("Name must be 3–30 letters only");
      return false;
    }

    // EMAIL BASIC CHECK
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      toast.error("Invalid email format.");
      return false;
    }

    // EMAIL DOMAIN CHECK
    if (!validateEmailDomain(email)) {
      toast.error(
        "Only valid email providers allowed (Gmail, Yahoo, Outlook, Hotmail, iCloud, Live, ProtonMail)."
      );
      return false;
    }

    // PHONE
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }

    // PASSWORD VALIDATION (separate errors)
    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter (A-Z).");
      return false;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter (a-z).");
      return false;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number (0-9).");
      return false;
    }

    if (!/[@$!%*?&#]/.test(password)) {
      toast.error(
        "Password must contain at least one special character (@$!%*?&#)."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);

    try {
      await register(name, email, phone, password, role);
      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Registration failed";

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
                  <p onClick={() => navigate("/admin/profile")}>Settings</p>
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
        <Card className="auth-card" data-testid="register-card">
          <CardHeader>
            <CardTitle className="auth-title" data-testid="register-title">
              Create Account
            </CardTitle>
            <p className="auth-subtitle" data-testid="register-subtitle">
              Register to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="register-name-input"
                />
              </div>
              <div className="form-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="register-email-input"
                />
              </div>
              <div className="form-field">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  data-testid="register-phone-input"
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
                    minLength={6}
                    data-testid="register-password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="register-password-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-field">
                <Label>Register as</Label>
                <RadioGroup
                  value={role}
                  onValueChange={setRole}
                  data-testid="register-role-group"
                >
                  <div className="radio-item">
                    <RadioGroupItem
                      value="attendee"
                      id="attendee"
                      data-testid="register-role-attendee"
                    />
                    <Label htmlFor="attendee" className="radio-label">
                      Attendee
                    </Label>
                  </div>
                  <div className="radio-item">
                    <RadioGroupItem
                      value="admin"
                      id="admin"
                      data-testid="register-role-admin"
                    />
                    <Label htmlFor="admin" className="radio-label">
                      Admin
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <Button
                type="submit"
                className="auth-button"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
            <div className="auth-footer">
              <p data-testid="register-login-link">
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
