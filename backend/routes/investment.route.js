import express from "express";
import {
  createInvestment,
  getInvestmentPlans,
  getMyInvestments,
} from "../controllers/investment.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/plans", protectRoute, getInvestmentPlans);
router.post("/create", protectRoute, createInvestment);
router.get("/", protectRoute, getMyInvestments);

export default router;
