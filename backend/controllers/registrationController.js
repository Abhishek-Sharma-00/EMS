import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

//Register User
export const registerUser = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ detail: "Event ID missing" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ detail: "Event not found" });

    if (event.currentRegistrations >= event.maxRegistrations) {
      return res.status(400).json({ detail: "Event is fully booked" });
    }

    const registration = await Registration.create({
      eventId,
      userId,
      phone: req.user.phone,
    });

    event.currentRegistrations = (event.currentRegistrations || 0) + 1;
    await event.save();

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      registration,
    });
  } catch (error) {
    res.status(500).json({ detail: "Registration error" });
  }
};

// Fetching Registrations
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("eventId")
      .populate("userId");

    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
};

// GET user’s registered events
export const getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;

    const registrations = await Registration.find({ userId }).populate(
      "eventId"
    );

    const events = registrations.map((r) => r.eventId);

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UNREGISTER
export const unregisterEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const reg = await Registration.findOneAndDelete({ eventId, userId });

    if (!reg) {
      return res.status(404).json({ message: "Registration not found" });
    }

    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentRegistrations: -1 },
    });

    res.json({ message: "Unregistered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
