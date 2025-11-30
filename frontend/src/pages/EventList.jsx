import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import "@/styles/EventList.css";
import logo from "../assets/EventUs-logo.png";
const API = "https://ems-backend-mwmg.onrender.com/api";

const categories = [
  "All",
  "Conference",
  "Workshop",
  "Meeting",
  "Social",
  "Music",
  "Education",
  "Other",
];

export default function EventList() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [category, search]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(false);

    try {
      const params = {};
      if (category !== "All") {
        params.category = category;
      }
      if (search.trim() !== "") {
        params.search = search.trim().toLowerCase();
      }

      const response = await axios.get(`${API}/events`, { params });
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(true);
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

      <div className="event-list-container">
        <div className="event-list-header">
          <h1 className="page-title" data-testid="event-list-title">
            All Events
          </h1>
        </div>

        <div className="filters-section">
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            data-testid="event-search-input"
          />

          <Select
            value={category}
            onValueChange={(value) => setCategory(value)}
          >
            <SelectTrigger
              className="category-select"
              data-testid="event-category-select"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  data-testid={`category-option-${cat}`}
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="loading-state" data-testid="loading-state">
            Loading events...
          </div>
        )}

        {error && (
          <div
            className="error-state"
            data-testid="error-state"
            style={{ textAlign: "center", padding: "30px" }}
          >
            <h2 style={{ color: "red" }}>Failed to load events</h2>
            <p>Your backend might not be running.</p>
            <Button onClick={fetchEvents} data-testid="retry-button">
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state" data-testid="empty-state">
            <p>No events found</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map((event) => (
              <Card
                key={event._id}
                className="event-card"
                onClick={() => navigate(`/events/${event._id}`)}
                data-testid={`event-card-${event._id}`}
              >
                {event.image && (
                  <div className="event-image">
                    <img src={event.image} alt={event.title} />
                  </div>
                )}

                <CardContent className="event-card-content">
                  <h3
                    className="event-title"
                    data-testid={`event-title-${event._id}`}
                  >
                    {event.title}
                  </h3>

                  <span
                    className="event-category"
                    data-testid={`event-category-${event._id}`}
                  >
                    {event.category}
                  </span>

                  <p
                    className="event-description"
                    data-testid={`event-description-${event._id}`}
                  >
                    {event.description}
                  </p>

                  <div className="event-meta">
                    <p
                      className="event-date"
                      data-testid={`event-date-${event._id}`}
                    >
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </p>

                    <p
                      className="event-time"
                      data-testid={`event-time-${event._id}`}
                    >
                      <Clock className="h-4 w-4" />
                      {new Date(`2000-01-01T${event.time}`).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </p>

                    <p
                      className="event-location"
                      data-testid={`event-location-${event._id}`}
                    >
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </p>

                    <p className="event-attendee">
                      <Users className="h-4 w-4" />
                      {event.currentRegistrations || 0} /{" "}
                      {event.maxRegistrations || 50}
                      <span>Attendees</span>
                    </p>
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
