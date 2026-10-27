import express from "express";
import {
  approveDeposit,
  approveWithdrawal,
  createDepositRequest,
  createWithdrawalRequest,
  getDepositHistory,
  getMyTransactions,
  getPendingDeposits,
  getPendingWithdrawals,
  getWithdrawalHistory,
  rejectDeposit,
  rejectWithdrawal,
} from "../controllers/transaction.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { allowRoles } from "../middleware/rbac.js";
import { getDepositPaymentInstructions } from "../controllers/paymentInstruction.controller.js";

const router = express.Router();


router.post("/deposits", protectRoute, createDepositRequest);
router.get("/deposits", protectRoute, getDepositHistory);
router.get("/", protectRoute, getMyTransactions);
router.get("/payment-instructions", protectRoute, getDepositPaymentInstructions);
router.post("/withdrawals", protectRoute, createWithdrawalRequest);
router.get("/withdrawals", protectRoute, getWithdrawalHistory);
router.get("/admin/deposits/pending", protectRoute, allowRoles("admin"), getPendingDeposits);
router.patch("/admin/deposits/:id/approve", protectRoute, allowRoles("admin"), approveDeposit);
router.patch("/admin/deposits/:id/reject", protectRoute, allowRoles("admin"), rejectDeposit);
router.get("/admin/withdrawals/pending", protectRoute, allowRoles("admin"), getPendingWithdrawals);
router.patch("/admin/withdrawals/:id/approve", protectRoute, allowRoles("admin"), approveWithdrawal);
router.patch("/admin/withdrawals/:id/reject", protectRoute, allowRoles("admin"), rejectWithdrawal);

export default router;
