import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { cloudinary } from "../lib/cloudinary.js";

export const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please log in to view your profile." });
  }

  return res.status(200).json({ success: true, user: req.user.toJSON() });
};


export const updateUserProfile = async (req, res) => {
  try {
    // protectRoute must run before this controller so req.user is available.
    if (!req.user?._id) {
      return res.status(401).json({ message: "Please log in to update your profile." });
    }

    // These are the editable personal information fields shown in ProfileSettings.jsx.
    const fields = ["firstName", "lastName", "email", "phone", "country", "state"];
    const updates = {};

    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;

      if (typeof req.body[field] !== "string") {
        return res.status(400).json({ message: `${field} must be text.` });
      }

      updates[field] = req.body[field].trim();
    }

    if (Object.keys(updates).length === 0 && !req.file) {
      return res.status(400).json({ message: "Provide at least one profile field to update." });
    }

    if (updates.firstName !== undefined && (!updates.firstName || updates.firstName.length > 80)) {
      return res.status(400).json({ message: "First name is required and must be 80 characters or fewer." });
    }

    if (updates.lastName !== undefined && (!updates.lastName || updates.lastName.length > 80)) {
      return res.status(400).json({ message: "Last name is required and must be 80 characters or fewer." });
    }

    if (updates.email !== undefined) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      updates.email = updates.email.toLowerCase();

      if (updates.email.length > 254 || !emailPattern.test(updates.email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
      }
    }

    if (updates.phone !== undefined && updates.phone.length > 32) {
      return res.status(400).json({ message: "Phone number must be 32 characters or fewer." });
    }

    if (updates.country !== undefined && updates.country.length > 100) {
      return res.status(400).json({ message: "Country must be 100 characters or fewer." });
    }

    if (updates.state !== undefined && updates.state.length > 100) {
      return res.status(400).json({ message: "State or province must be 100 characters or fewer." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (updates.email !== undefined) {
      const emailInUse = await User.findOne({
        email: updates.email,
        _id: { $ne: user._id },
      });

      if (emailInUse) {
        return res.status(409).json({ message: "That email address is already in use." });
      }
    }

    // Multer uses memoryStorage, so upload the in-memory buffer to Cloudinary.
    if (req.file) {
      const photoUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "assets-zenith/profile-photos", resource_type: "image" },
          (error, result) => error ? reject(error) : resolve(result),
        );
        stream.end(req.file.buffer);
      });
      user.profilePhotoUrl = photoUpload.secure_url;
    }

    // Only the allow-listed profile fields above are copied onto the user.
    Object.assign(user, updates);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toJSON(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "That email address is already in use." });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: "Some profile details are invalid." });
    }

    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Unable to update your profile right now." });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to change your password." });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" || !currentPassword ||
      typeof newPassword !== "string" || !newPassword ||
      typeof confirmPassword !== "string" || !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters long.",
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Choose a new password that differs from your current password.",
      });
    }

    const user = await User.findById(req.user._id).select("+passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to change your password right now.",
    });
  }
};
