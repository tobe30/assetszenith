import express from "express";
import { changeUserPassword, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { createDepositRequest, getDepositHistory } from "../controllers/transaction.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import upload, { verificationUpload } from "../lib/multer.js";
import { getMyVerification, submitIdentityVerification } from "../controllers/verification.controller.js";

const router = express.Router();

const parseVerificationDocument = (req, res, next) => verificationUpload.single("document")(req, res, (error) => {
  if (error) return res.status(400).json({ success: false, message: error.message || "Unable to process the uploaded document." });
  next();
});

router.get("/profile", protectRoute, getUserProfile);
router.patch("/profile", protectRoute, upload.single("profilePhoto"), updateUserProfile);
router.patch("/change-password", protectRoute, changeUserPassword);
router.get("/verification", protectRoute, getMyVerification);
router.post("/verification", protectRoute, parseVerificationDocument, submitIdentityVerification);
router.post("/deposits", protectRoute, createDepositRequest);
router.get("/deposits", protectRoute, getDepositHistory);

export default router;
