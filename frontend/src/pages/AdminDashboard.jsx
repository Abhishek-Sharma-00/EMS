import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import "@/styles/AdminDashboard.css";
import logo from "../assets/EventUs-logo.png";

const API = "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    category: "",
    image: "",
    currentRegistrations: 0,
    maxRegistrations: 50,
  });

  // Fetch Events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations(res.data);
    } catch (err) {
      toast.error("Failed to load registrations");
    }
  };

  // Create / Update Event
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editingEvent) {
        await axios.put(`${API}/events/${editingEvent._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event updated successfully");
      } else {
        await axios.post(`${API}/events`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Operation failed");
    }
  };

  // Delete Event
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Delete failed");
    }
  };

  // Edit Event
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      category: event.category,
      image: event.image,
      currentRegistrations: event.currentRegistrations || 0,
      maxRegistrations: event.maxRegistrations || 50,
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      category: "",
      image: "",
      currentRegistrations: 0,
      maxRegistrations: 50,
    });
  };

  //Delete event registered attendees
  const handleDeleteRegistration = async (regId) => {
    if (!window.confirm("Are you sure you want to delete this registration?"))
      return;
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API}/admin/registrations/${regId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Registration deleted successfully");
      setRegistrations((prev) => prev.filter((item) => item._id !== regId));
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Delete failed");
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

      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>

        {/* ADMIN ACTIONS */}
        <div className="admin-actions">
          <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  fetchRegistrations();
                  setIsRegDialogOpen(true);
                }}
                className="mr-3"
              >
                View Registered Users
              </Button>
            </DialogTrigger>

            {/* Registrations Dialog */}
            <DialogContent className="admin-dialog" aria-describedby="">
              <DialogHeader>
                <DialogTitle>Registered Users List</DialogTitle>
              </DialogHeader>

              <div className="registrations-table">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Phone</th>
                      <th className="p-2 border">Event</th>
                      <th className="p-2 border">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r._id}>
                        <td className="p-2 border">{r.userId?.name}</td>
                        <td className="p-2 border">{r.userId?.email}</td>
                        <td className="p-2 border">
                          {r.userId?.phone || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {r.eventId?.title || "Event Deleted"}
                        </td>
                        <td className="p-2 border text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRegistration(r._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Event Button */}
          <Dialog
            className="event-dialog"
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Create New Event</Button>
            </DialogTrigger>

            {/* Dialog Form */}
            <DialogContent className="admin-dialog">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </DialogTitle>
                <DialogDescription>
                  Please fill out the required fields below.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-field">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <Label>Location *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <Label>Category *</Label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Social">Social</option>
                    <option value="Music">Music</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <Label>Current Registrations *</Label>
                  <Input
                    type="number"
                    value={formData.currentRegistrations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentRegistrations: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <Label>Max Registrations *</Label>
                  <Input
                    type="number"
                    value={formData.maxRegistrations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRegistrations: Number(e.target.value),
                      })
                    }
                    required
                    min="1"
                  />
                </div>

                <div className="form-field">
                  <Label>Image URL</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-field">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                  />
                </div>

                <Button type="submit" className="submit-button">
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading UI */}
        {loading && <div className="loading-state">Loading events...</div>}

        {error && (
          <div className="error-state">
            <h2 style={{ color: "red" }}>Failed to load events</h2>
            <p>Your backend might not be running.</p>
            <Button onClick={fetchEvents}>Retry</Button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            No events yet. Create your first event!
          </div>
        )}

        {/* Events List */}
        {!loading && !error && events.length > 0 && (
          <div className="events-table">
            {events.map((event) => (
              <Card key={event._id} className="event-row">
                <CardContent className="event-row-content">
                  <div className="event-info">
                    <h3 className="event-row-title">{event.title}</h3>

                    <p className="event-row-meta">
                      {event.currentRegistrations || 0} /{" "}
                      {event.maxRegistrations || 50} <span>Attendee</span>
                    </p>

                    <p className="event-row-meta">
                      {event.category} •{" "}
                      {new Date(event.date).toLocaleDateString()} •{" "}
                      {new Date(`2000-01-01T${event.time}`).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                      • {event.location}
                    </p>
                  </div>

                  <div className="event-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </Button>
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
