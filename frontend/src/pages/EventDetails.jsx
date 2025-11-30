import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import "@/styles/EventDetails.css";
import { ArrowLeft } from "lucide-react";

const API = "http://localhost:5000/api";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API}/events/${id}`);

      if (response.data) {
        setEvent(response.data);
      } else {
        setEvent(null);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setRegistering(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/registrations`,
        { eventId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Registration successful!");
      navigate("/registration-success");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" data-testid="loading-state">
        Loading...
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="event-details-container">
      <Button
        variant="ghost"
        onClick={() => navigate("/events")}
        className="back-button"
        data-testid="back-events-btn"
      >
        <ArrowLeft className="ml-2 h-5 w-5" />
        Back to Events
      </Button>

      <div className="event-details-content">
        <div className="event-info-section">
          {event.image && (
            <div className="event-hero-image">
              <img src={event.image} alt={event.title} />
            </div>
          )}
          <h1 className="event-details-title" data-testid="event-details-title">
            {event.title}
          </h1>
          <span
            className="event-details-category"
            data-testid="event-details-category"
          >
            {event.category}
          </span>
          <p
            className="event-details-description"
            data-testid="event-details-description"
          >
            {event.description}
          </p>
          <div className="event-details-meta">
            <div className="meta-item">
              <span className="meta-label">Date:</span>
              <span className="meta-value" data-testid="event-details-date">
                {new Date(event.date).toLocaleDateString()}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Location:</span>
              <span className="meta-value" data-testid="event-details-location">
                {event.location}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Time:</span>
              <span className="meta-value" data-testid="event-details-time">
                {new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Seats:</span>
              <span className="meta-value" data-testid="event-details-seats">
                {event.currentRegistrations || 0} /{" "}
                {event.maxRegistrations || 50}
              </span>
            </div>
          </div>
        </div>

        {!user ? (
          <Card className="registration-form-card">
            <CardHeader>
              <CardTitle>You must login to register</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/login")}
                className="register-button"
              >
                Login to Register
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="registration-form-card">
            <CardHeader>
              <CardTitle>Register for this Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="registration-form">
                <Button
                  type="submit"
                  className="register-button"
                  disabled={registering}
                >
                  {registering ? "Registering..." : "Register Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
