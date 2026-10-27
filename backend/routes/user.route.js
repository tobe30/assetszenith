import express from "express";
import { changeUserPassword, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { createDepositRequest, getDepositHistory } from "../controllers/transaction.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import upload from "../lib/multer.js";

const router = express.Router();

router.get("/profile", protectRoute, getUserProfile);
router.patch("/profile", protectRoute, upload.single("profilePhoto"), updateUserProfile);
router.patch("/change-password", protectRoute, changeUserPassword);
router.post("/deposits", protectRoute, createDepositRequest);
router.get("/deposits", protectRoute, getDepositHistory);

export default router;
