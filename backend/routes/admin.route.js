import express from "express";
import { closeAdminUser, createAdminUserInvestment, fundUserWallet, getAdminDashboardSummary, getAdminInvestmentPlans, getAdminTransactions, getAdminUserDetails, getAdminUsers, updateAdminUserStatus } from "../controllers/admin.controller.js";
import { getDepositPaymentInstructions, updateDepositPaymentInstructions } from "../controllers/paymentInstruction.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { allowRoles } from "../middleware/rbac.js";
import { getPendingIdentityVerifications, reviewIdentityVerification } from "../controllers/verification.controller.js";

const router = express.Router();

router.use(protectRoute, allowRoles("admin"));

router.get("/dashboard-summary", getAdminDashboardSummary);
router.get("/users/:userId/investment-plans", getAdminInvestmentPlans);
router.get("/users", getAdminUsers);
router.get("/users/:userId", getAdminUserDetails);
router.patch("/users/:userId/status", updateAdminUserStatus);
router.delete("/users/:userId", closeAdminUser);
router.get("/verifications/pending", getPendingIdentityVerifications);
router.patch("/verifications/:userId/:decision", reviewIdentityVerification);
router.get("/transactions", getAdminTransactions);
router.get("/payment-instructions", getDepositPaymentInstructions);
router.put("/payment-instructions/:method", updateDepositPaymentInstructions);
router.post("/users/:userId/wallet/fund", fundUserWallet);
router.post("/users/:userId/investments", createAdminUserInvestment);

export default router;
