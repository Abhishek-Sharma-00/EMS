import React, { useEffect, useState } from "react";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../api/userApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import "../styles/UpdateProfile.css";

const UpdateProfile = () => {
  const [usera, setUsera] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

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

  const validateProfile = () => {
    // NAME
    if (!/^[A-Za-z\s]{3,30}$/.test(form.name)) {
      toast.error("Name must be 3–30 characters and contain only letters.");
      return false;
    }

    // EMAIL BASIC CHECK
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
      toast.error("Invalid email format.");
      return false;
    }

    // EMAIL DOMAIN CHECK
    if (!validateEmailDomain(form.email)) {
      toast.error(
        "Only valid email providers allowed (Gmail, Yahoo, Outlook, Hotmail, iCloud, Live, ProtonMail)."
      );
      return false;
    }

    // PHONE
    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return false;
    }

    return true;
  };

  const loadProfile = async () => {
    try {
      const res = await fetchProfile();
      setUsera(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;
    try {
      await updateProfile(form);
      toast.success("Profile updated successfully!");
      setEditMode(false);
      loadProfile();
    } catch (err) {
      toast.error("Update failed");
      console.log(err);
    }
  };

  const validatePasswordChange = () => {
    const { oldPassword, newPassword } = passwords;

    if (!oldPassword) {
      toast.error("Enter your old password.");
      return false;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must include at least one uppercase letter.");
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("Password must include at least one lowercase letter.");
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error("Password must include at least one number.");
      return false;
    }

    if (!/[@$!%*?&#]/.test(newPassword)) {
      toast.error("Password must include at least one special character.");
      return false;
    }

    return true;
  };

  const updatePass = async () => {
    if (!validatePasswordChange()) return;
    try {
      await changePassword(passwords);
      toast.success("Password updated successfully!");
      setPasswordMode(false);
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed");
    }
  };

  const deleteAcc = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      await deleteAccount();
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
  };

  if (!usera) return <h2>Loading...</h2>;

  return (
    <div className="main">
      <div className="back-btn">
        <Button
          variant="ghost"
          onClick={() =>
            navigate(usera.role === "admin" ? "/admin" : "/attendee")
          }
          className="back-to"
          data-testid="back-events-btn"
        >
          <ArrowLeft className="ml-2 h-5 w-5" />
          Back to Dashboard
        </Button>
      </div>
      <div className="profile-container">
        <h1>Update Your Profile</h1>

        {!editMode && !passwordMode && (
          <>
            <p>
              <strong>Name:</strong> {usera.name}
            </p>
            <p>
              <strong>Email:</strong> {usera.email}
            </p>
            <p>
              <strong>Role:</strong> {usera.role}
            </p>

            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
            <button
              className="password-btn"
              onClick={() => setPasswordMode(true)}
            >
              Change Password
            </button>
            <button className="delete-btn" onClick={deleteAcc}>
              Delete Account
            </button>
          </>
        )}

        {editMode && (
          <div className="edit-box">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <button onClick={saveProfile}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        )}

        {passwordMode && (
          <div className="edit-box">
            <input
              type="password"
              placeholder="Old Password"
              value={passwords.oldPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, oldPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />

            <button onClick={updatePass}>Update Password</button>
            <button onClick={() => setPasswordMode(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateProfile;
