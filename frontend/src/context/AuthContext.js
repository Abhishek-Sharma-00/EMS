import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const API = "https://ems-backend-mwmg.onrender.com/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // AUTO LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);

    axios
      .get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);

    if (res.data.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/attendee";
    }

    return res.data;
  };

  // REGISTER
  const register = async (name, email, phone, password, role) => {
    const res = await axios.post(`${API}/auth/register`, {
      name,
      email,
      phone,
      password,
      role,
    });
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);

    if (res.data.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/attendee";
    }

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
