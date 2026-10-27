import express from "express";
import { getWalletSummary } from "../controllers/wallet.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/summary", protectRoute, getWalletSummary);

export default router;
