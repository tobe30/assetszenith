import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import { cloudinary } from "../lib/cloudinary.js";
import { emailAdminNotification, emailUserNotification } from "../lib/emailNotifications.js";

const idTypes = new Set(["Passport", "National identity card", "Driver's licence"]);
const allowedExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

const uploadPrivateDocument = (file, userId) => new Promise((resolve, reject) => {
  const extension = file.originalname.split(".").pop()?.toLowerCase() || "";
  if (!allowedExtensions.has(extension)) {
    reject(new Error("Upload a PDF, JPEG, PNG, or WEBP identity document."));
    return;
  }

  const publicId = `assets-zenith/identity-verification/${userId}/${randomUUID()}`;
  const stream = cloudinary.uploader.upload_stream(
    // Cloudinary treats supported PDFs as image assets; keeping both PDFs and
    // photos on the image resource lets us generate one private download flow.
    { public_id: publicId, resource_type: "image", type: "authenticated" },
    (error, result) => error ? reject(error) : resolve({ publicId: result.public_id, extension }),
  );
  stream.end(file.buffer);
});

export const getMyVerification = async (req, res) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({ success: false, message: "Identity verification is available to user accounts only." });
  }

  try {
    const user = await User.findById(req.user._id).select("verificationStatus verificationIdType verificationIssueDate verificationExpiryDate verificationSubmittedAt verificationReviewedAt verificationReviewNote").lean();
    if (!user) return res.status(404).json({ success: false, message: "User account not found." });
    return res.status(200).json({ success: true, verification: user });
  } catch (error) {
    console.error("Error loading identity verification:", error);
    return res.status(500).json({ success: false, message: "Unable to load verification details right now." });
  }
};

export const submitIdentityVerification = async (req, res) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({ success: false, message: "Identity verification is available to user accounts only." });
  }

  const { idType, idNumber, issueDate = "", expiryDate = "" } = req.body || {};
  if (!idTypes.has(idType)) {
    return res.status(400).json({ success: false, message: "Choose a valid identity document type." });
  }
  if (typeof idNumber !== "string" || !idNumber.trim() || idNumber.trim().length > 100) {
    return res.status(400).json({ success: false, message: "Enter a valid ID number (100 characters or fewer)." });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Upload a clear photo or PDF of your identity document." });
  }

  const parsedIssueDate = issueDate ? new Date(issueDate) : null;
  const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
  if ((issueDate && Number.isNaN(parsedIssueDate.getTime())) || (expiryDate && Number.isNaN(parsedExpiryDate.getTime()))) {
    return res.status(400).json({ success: false, message: "Enter valid document dates." });
  }
  if (parsedIssueDate && parsedExpiryDate && parsedExpiryDate <= parsedIssueDate) {
    return res.status(400).json({ success: false, message: "The expiry date must be after the issue date." });
  }
  if (parsedExpiryDate && parsedExpiryDate < new Date()) {
    return res.status(400).json({ success: false, message: "This identity document has expired. Upload a current document." });
  }

  let uploadedDocument;
  try {
    const existingUser = await User.findById(req.user._id).select("verificationStatus +verificationDocumentPublicId");
    if (!existingUser) return res.status(404).json({ success: false, message: "User account not found." });
    if (["pending", "verified"].includes(existingUser.verificationStatus)) {
      return res.status(409).json({ success: false, message: existingUser.verificationStatus === "pending" ? "Your identity documents are already under review." : "Your identity has already been verified." });
    }

    uploadedDocument = await uploadPrivateDocument(req.file, req.user._id);
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, role: "user", status: "active", verificationStatus: { $nin: ["pending", "verified"] } },
      {
        $set: {
          verificationStatus: "pending",
          verificationIdType: idType,
          verificationIdNumber: idNumber.trim(),
          verificationIssueDate: parsedIssueDate,
          verificationExpiryDate: parsedExpiryDate,
          verificationDocumentPublicId: uploadedDocument.publicId,
          verificationDocumentExtension: uploadedDocument.extension,
          verificationSubmittedAt: new Date(),
          verificationReviewedAt: null,
          verificationReviewedBy: null,
          verificationReviewNote: "",
        },
      },
      { new: true, runValidators: true },
    ).select("firstName lastName email verificationStatus verificationSubmittedAt verificationIdType");

    if (!user) {
      await cloudinary.uploader.destroy(uploadedDocument.publicId, { resource_type: "image", type: "authenticated" });
      return res.status(409).json({ success: false, message: "Your verification status changed. Refresh the page and try again." });
    }

    if (existingUser.verificationDocumentPublicId) {
      cloudinary.uploader.destroy(existingUser.verificationDocumentPublicId, { resource_type: "image", type: "authenticated" })
        .catch((error) => console.error("Could not remove replaced verification document:", error));
    }

    await emailAdminNotification({
      subject: "Identity verification needs review · Assets Zenith",
      heading: "New identity verification submitted",
      message: `${user.firstName} ${user.lastName} submitted identity documents for review.`,
      details: [["Email", user.email], ["Document type", user.verificationIdType], ["Submitted", user.verificationSubmittedAt.toLocaleString()]],
    });

    return res.status(201).json({ success: true, message: "Identity documents submitted for review.", verification: user });
  } catch (error) {
    if (uploadedDocument?.publicId) {
      await cloudinary.uploader.destroy(uploadedDocument.publicId, { resource_type: "image", type: "authenticated" }).catch(() => {});
    }
    console.error("Error submitting identity verification:", error);
    return res.status(500).json({ success: false, message: "Unable to submit identity documents right now. Please try again." });
  }
};

export const getPendingIdentityVerifications = async (_req, res) => {
  try {
    const users = await User.find({ role: "user", status: "active", verificationStatus: "pending" })
      .select("firstName lastName email country verificationStatus verificationIdType verificationIssueDate verificationExpiryDate verificationDocumentExtension verificationSubmittedAt +verificationIdNumber +verificationDocumentPublicId")
      .sort({ verificationSubmittedAt: 1 })
      .lean();

    const verifications = users.map((user) => {
      const extension = user.verificationDocumentExtension;
      const documentUrl = user.verificationDocumentPublicId && extension
        ? cloudinary.utils.private_download_url(user.verificationDocumentPublicId, extension, {
            resource_type: "image",
            type: "authenticated",
            expires_at: Math.floor(Date.now() / 1000) + 15 * 60,
          })
        : "";
      const idNumber = user.verificationIdNumber || "";
      return {
        ...user,
        verificationIdNumber: idNumber ? `••••${idNumber.slice(-4)}` : "—",
        documentUrl,
      };
    });

    return res.status(200).json({ success: true, verifications, total: verifications.length });
  } catch (error) {
    console.error("Error loading pending identity verifications:", error);
    return res.status(500).json({ success: false, message: "Unable to load verification requests right now." });
  }
};

export const reviewIdentityVerification = async (req, res) => {
  const { userId, decision } = req.params;
  const { reviewNote = "" } = req.body || {};
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }
  if (!["approve", "reject"].includes(decision)) {
    return res.status(400).json({ success: false, message: "Choose approve or reject." });
  }
  if (typeof reviewNote !== "string" || reviewNote.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Review note must be 500 characters or fewer." });
  }

  try {
    const verificationStatus = decision === "approve" ? "verified" : "rejected";
    const user = await User.findOneAndUpdate(
      { _id: userId, role: "user", verificationStatus: "pending" },
      {
        $set: {
          verificationStatus,
          verificationReviewedAt: new Date(),
          verificationReviewedBy: req.user._id,
          verificationReviewNote: reviewNote.trim(),
        },
      },
      { new: true, runValidators: true },
    ).select("firstName lastName email verificationStatus verificationReviewedAt verificationReviewNote");

    if (!user) {
      return res.status(404).json({ success: false, message: "Pending identity verification not found. It may already have been reviewed." });
    }

    const approved = decision === "approve";
    await emailUserNotification(user._id, {
      subject: `Identity verification ${approved ? "approved" : "reviewed"} · Assets Zenith`,
      heading: approved ? "Identity verification approved" : "Identity verification needs attention",
      message: approved
        ? "Your identity documents have been reviewed and approved."
        : "Your identity documents were not approved. You can review the note below and submit a new document.",
      details: [["Status", approved ? "Verified" : "Rejected"], ["Review note", user.verificationReviewNote || "No additional note was provided."]],
    });

    return res.status(200).json({
      success: true,
      message: `${user.firstName} ${user.lastName}'s identity verification was ${approved ? "approved" : "rejected"}.`,
      verification: user,
    });
  } catch (error) {
    console.error("Error reviewing identity verification:", error);
    return res.status(500).json({ success: false, message: "Unable to review this identity verification right now." });
  }
};
