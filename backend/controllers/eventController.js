import Event from "../models/Event.js";
import Attendee from "../models/Registration.js";

// GET ALL EVENTS
export const getEvents = async (req, res) => {
  const events = await Event.find();
  res.json(events);
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE EVENT
export const createEvent = async (req, res) => {
  const event = await Event.create(req.body);
  res.json(event);
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId || eventId === "undefined") {
      return res.status(400).json({ error: "Invalid or missing event ID" });
    }

    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Attendee Registration
export const deleteRegistration = async (req, res) => {
  try {
    const attendeeId = req.params.id;

    const attendee = await Attendee.findById(attendeeId);
    if (!attendee) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const eventId = attendee.eventId;

    await Attendee.findByIdAndDelete(attendeeId);

    if (eventId) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { currentRegistrations: -1 },
      });
    }

    res.json({
      message: "Registration deleted and event updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
