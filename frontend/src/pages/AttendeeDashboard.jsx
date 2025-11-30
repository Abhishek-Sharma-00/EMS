import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import "@/styles/AttendeeDashboard.css";
import logo from "../assets/EventUs-logo.png";

const API = "https://ems-backend-mwmg.onrender.com/api";

export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    fetchRegisteredEvents();
  }, [user]);

  const fetchRegisteredEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/registrations/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegisteredEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const unregisterEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/registrations/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRegisteredEvents((prev) =>
        prev.filter((event) => event._id !== eventId)
      );

      alert("Unregistered successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to unregister");
    }
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
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
      <div className="dashboard-container">
        <h2 className="dashboard-title">My Registered Events</h2>

        {registeredEvents.length === 0 ? (
          <p className="no-events">No registered events found.</p>
        ) : (
          <div className="events-grid">
            {registeredEvents.map((event) => (
              <Card key={event._id} className="event-card">
                <CardContent className="event-row-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-date">
                    {event.date} • {event.category} •{" "}
                    {new Date(`2000-01-01T${event.time}`).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}{" "}
                    • {event.location}
                  </p>
                  <div className="event-action">
                    <button
                      className="unregister-btn"
                      onClick={() => unregisterEvent(event._id)}
                    >
                      Unregister
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
