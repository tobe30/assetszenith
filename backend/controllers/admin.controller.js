import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Investment from "../models/Investment.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { INVESTMENT_PLANS } from "../lib/investmentPlans.js";
import { emailUserNotification } from "../lib/emailNotifications.js";

export const getAdminDashboardSummary = async (_req, res) => {
  try {
    const [
      registeredUsers,
      walletBalances,
      activeInvestments,
      pendingDeposits,
      pendingWithdrawals,
      recentUsers,
      latestDeposits,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Wallet.aggregate([
        { $group: { _id: "$currency", total: { $sum: "$walletBalance" } } },
        { $sort: { _id: 1 } },
      ]),
      Investment.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$currency", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Transaction.countDocuments({ type: "deposit", status: "pending" }),
      Transaction.countDocuments({ type: "withdrawal", status: "pending" }),
      User.find({ role: "user" })
        .select("firstName lastName email status createdAt")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
      Transaction.find({ type: "deposit" })
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      summary: { registeredUsers, walletBalances, activeInvestments, pendingDeposits, pendingWithdrawals },
      recentUsers,
      latestDeposits,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error loading admin dashboard summary:", error);
    return res.status(500).json({ success: false, message: "Unable to load dashboard data right now." });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
    const filter = { role: "user" };

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchPattern = new RegExp(safeSearch, "i");
      filter.$or = [
        { firstName: searchPattern },
        { lastName: searchPattern },
        { email: searchPattern },
      ];
      if (mongoose.isValidObjectId(search)) filter.$or.push({ _id: search });
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("firstName lastName email status role currency createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const wallets = await Wallet.find({ user: { $in: users.map((user) => user._id) } }).lean();
    const walletsByUser = new Map(wallets.map((wallet) => [String(wallet.user), wallet]));

    return res.status(200).json({
      success: true,
      users: users.map((user) => {
        const wallet = walletsByUser.get(String(user._id));
        return {
          ...user,
          wallet: {
            currency: user.currency,
            walletBalance: wallet?.walletBalance ?? 0,
            reservedBalance: wallet?.reservedBalance ?? 0,
            portfolioBalance: wallet?.portfolioBalance ?? 0,
            totalBonus: wallet?.totalBonus ?? 0,
            totalWithdrawals: wallet?.totalWithdrawals ?? 0,
          },
        };
      }),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error loading admin users:", error);
    return res.status(500).json({ success: false, message: "Unable to load users right now." });
  }
};

export const getAdminInvestmentPlans = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
    const user = await User.findById(req.params.userId).select("role currency").lean();
    if (!user || user.role !== "user") {
      return res.status(404).json({ success: false, message: "Customer account not found." });
    }

    return res.status(200).json({
      success: true,
      plans: INVESTMENT_PLANS.map((plan) => ({ ...plan, currency: user.currency })),
    });
  } catch (error) {
    console.error("Error loading admin investment plans:", error);
    return res.status(500).json({ success: false, message: "Unable to load investment plans right now." });
  }
};

export const getAdminTransactions = async (req, res) => {
  try {
    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const filter = {};

    if (req.query.userId) {
      if (!mongoose.isValidObjectId(req.query.userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
      }
      filter.user = req.query.userId;
    }

    if (req.query.type) {
      const validTypes = ["deposit", "withdrawal", "investment", "bonus", "transfer", "admin_adjustment"];
      if (!validTypes.includes(req.query.type)) {
        return res.status(400).json({ success: false, message: "Invalid transaction type." });
      }
      filter.type = req.query.type;
    }

    if (req.query.status) {
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: "Invalid transaction status." });
      }
      filter.status = req.query.status;
    }

    if (req.query.adjustmentTarget) {
      const validTargets = ["wallet", "portfolio"];
      if (!validTargets.includes(req.query.adjustmentTarget)) {
        return res.status(400).json({ success: false, message: "Invalid adjustment target." });
      }
      filter.adjustmentTarget = req.query.adjustmentTarget;
    }

    if (req.query.from || req.query.to) {
      const createdAt = {};
      if (req.query.from) {
        const fromDate = new Date(req.query.from);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid start date." });
        }
        createdAt.$gte = fromDate;
      }
      if (req.query.to) {
        const toDate = new Date(req.query.to);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid end date." });
        }
        createdAt.$lte = toDate;
      }
      filter.createdAt = createdAt;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("user", "firstName lastName email")
        .populate("reviewedBy", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error loading admin transactions:", error);
    return res.status(500).json({ success: false, message: "Unable to load transactions right now." });
  }
};

export const fundUserWallet = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  const { amount, note = "", idempotencyKey } = req.body || {};
  const amountText = typeof amount === "number" ? String(amount) : amount;
  if (
    typeof amountText !== "string" ||
    !/^\d+(?:\.\d{1,2})?$/.test(amountText) ||
    !Number.isFinite(Number(amountText)) ||
    Number(amountText) < 0.01
  ) {
    return res.status(400).json({ success: false, message: "Enter a valid amount with up to two decimal places." });
  }

  if (typeof note !== "string" || note.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Admin note must be 500 characters or fewer." });
  }

  if (typeof idempotencyKey !== "string" || idempotencyKey.trim().length < 8 || idempotencyKey.trim().length > 100) {
    return res.status(400).json({ success: false, message: "Provide a unique idempotencyKey (8 to 100 characters)." });
  }

  const parsedAmount = Number(amountText);
  const normalizedKey = idempotencyKey.trim();
  let session;
  let fundingTransaction = null;
  let wallet = null;
  let userNotFound = false;

  try {
    const existingTransaction = await Transaction.findOne({ idempotencyKey: normalizedKey });
    if (existingTransaction) {
      const sameRequest = String(existingTransaction.user) === req.params.userId &&
        existingTransaction.amount === parsedAmount && existingTransaction.adjustmentTarget === "wallet";
      return res.status(sameRequest ? 200 : 409).json({
        success: sameRequest,
        message: sameRequest ? "This wallet funding was already applied." : "That idempotencyKey was already used for a different adjustment.",
        ...(sameRequest ? { transaction: existingTransaction } : {}),
      });
    }

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const user = await User.findById(req.params.userId).select("currency").session(session);
      if (!user) {
        userNotFound = true;
        return;
      }

      wallet = await Wallet.findOneAndUpdate(
        { user: user._id, currency: user.currency },
        {
          $inc: { walletBalance: parsedAmount },
          $setOnInsert: { user: user._id, currency: user.currency },
        },
        { upsert: true, new: true, runValidators: true, session },
      );

      [fundingTransaction] = await Transaction.create(
        [{
          user: user._id,
          type: "admin_adjustment",
          amount: parsedAmount,
          currency: user.currency,
          paymentMethod: "Admin adjustment",
          status: "approved",
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          reviewNote: note.trim(),
          adjustmentTarget: "wallet",
          idempotencyKey: normalizedKey,
          description: note.trim() || "Admin funded wallet.",
        }],
        { session },
      );
    });

    if (userNotFound) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    await emailUserNotification(req.params.userId, {
      subject: "Your wallet was funded · Assets Zenith",
      heading: "Wallet balance updated",
      message: "An administrator added funds to your wallet.",
      details: [
        ["Amount added", `${fundingTransaction.currency} ${fundingTransaction.amount.toFixed(2)}`],
        ["Note", fundingTransaction.reviewNote || "—"],
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Wallet funded successfully.",
      wallet,
      transaction: fundingTransaction,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const priorTransaction = await Transaction.findOne({ idempotencyKey: normalizedKey });
      if (priorTransaction) {
        const sameRequest = String(priorTransaction.user) === req.params.userId &&
          priorTransaction.amount === parsedAmount && priorTransaction.adjustmentTarget === "wallet";
        return res.status(sameRequest ? 200 : 409).json({
          success: sameRequest,
          message: sameRequest ? "This wallet funding was already applied." : "That idempotencyKey was already used for a different adjustment.",
          ...(sameRequest ? { transaction: priorTransaction } : {}),
        });
      }
    }

    console.error("Error funding user wallet:", error);
    return res.status(500).json({ success: false, message: "Unable to fund this wallet right now." });
  } finally {
    if (session) await session.endSession();
  }
};

export const createAdminUserInvestment = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  const { planCode, amount, note = "", idempotencyKey } = req.body || {};
  const plan = INVESTMENT_PLANS.find((item) => item.code === planCode);
  if (!plan) {
    return res.status(400).json({ success: false, message: "Choose a valid investment plan." });
  }

  const amountText = typeof amount === "number" ? String(amount) : amount;
  if (
    typeof amountText !== "string" ||
    !/^\d+(?:\.\d{1,2})?$/.test(amountText) ||
    !Number.isFinite(Number(amountText)) ||
    Number(amountText) < plan.minimum
  ) {
    return res.status(400).json({ success: false, message: `Enter a valid amount of at least ${plan.minimum}.` });
  }
  if (plan.maximum !== null && Number(amountText) > plan.maximum) {
    return res.status(400).json({ success: false, message: `${plan.name} allows investments up to ${plan.maximum}.` });
  }

  if (typeof note !== "string" || note.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Admin note must be 500 characters or fewer." });
  }

  if (typeof idempotencyKey !== "string" || idempotencyKey.trim().length < 8 || idempotencyKey.trim().length > 100) {
    return res.status(400).json({ success: false, message: "Provide a unique idempotencyKey (8 to 100 characters)." });
  }

  const parsedAmount = Number(amountText);
  const normalizedKey = idempotencyKey.trim();
  const sameInvestmentRequest = async (transaction) => {
    if (
      !transaction ||
      transaction.type !== "investment" ||
      String(transaction.user) !== req.params.userId ||
      transaction.amount !== parsedAmount
    ) return false;
    const investment = await Investment.findOne({ transaction: transaction._id }).select("planCode").lean();
    return investment?.planCode === plan.code;
  };

  let session;
  let investment = null;
  let transaction = null;
  let wallet = null;
  let userNotFound = false;
  let insufficientBalance = false;

  try {
    const existingTransaction = await Transaction.findOne({ idempotencyKey: normalizedKey });
    if (existingTransaction) {
      const sameRequest = await sameInvestmentRequest(existingTransaction);
      return res.status(sameRequest ? 200 : 409).json({
        success: sameRequest,
        message: sameRequest ? "This investment was already created." : "That idempotencyKey was already used for a different action.",
        ...(sameRequest ? { transaction: existingTransaction, investment: await Investment.findOne({ transaction: existingTransaction._id }).lean() } : {}),
      });
    }

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const user = await User.findById(req.params.userId).select("role currency").session(session);
      if (!user || user.role !== "user") {
        userNotFound = true;
        return;
      }

      wallet = await Wallet.findOneAndUpdate(
        { user: user._id, currency: user.currency, walletBalance: { $gte: parsedAmount } },
        {
          $inc: { walletBalance: -parsedAmount, portfolioBalance: parsedAmount },
        },
        { new: true, runValidators: true, session },
      );

      if (!wallet) {
        insufficientBalance = true;
        return;
      }

      const startedAt = new Date();
      [transaction] = await Transaction.create(
        [{
          user: user._id,
          type: "investment",
          amount: parsedAmount,
          currency: user.currency,
          paymentMethod: "Wallet balance",
          status: "approved",
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          reviewNote: note.trim(),
          idempotencyKey: normalizedKey,
          description: note.trim() || `Admin created a ${plan.name} investment.`,
        }],
        { session },
      );

      [investment] = await Investment.create(
        [{
          user: user._id,
          transaction: transaction._id,
          planCode: plan.code,
          planName: plan.name,
          amount: parsedAmount,
          currency: user.currency,
          roiPercent: plan.roiPercent,
          intervalHours: plan.intervalHours,
          intervalLabel: plan.intervalLabel,
          status: "active",
          startedAt,
          nextPayoutAt: new Date(startedAt.getTime() + plan.intervalHours * 60 * 60 * 1000),
        }],
        { session },
      );
    });

    if (userNotFound) {
      return res.status(404).json({ success: false, message: "Customer account not found." });
    }
    if (insufficientBalance) {
      return res.status(409).json({ success: false, message: "The customer's available wallet balance is insufficient." });
    }

    await emailUserNotification(req.params.userId, {
      subject: "An investment was added to your account · Assets Zenith",
      heading: "Investment started",
      message: "An administrator created an investment using your wallet balance.",
      details: [
        ["Plan", investment.planName],
        ["Amount", `${investment.currency} ${investment.amount.toFixed(2)}`],
        ["Return schedule", `${investment.roiPercent}% ${investment.intervalLabel}`],
        ["Note", note.trim() || "—"],
      ],
    });

    return res.status(201).json({
      success: true,
      message: `${plan.name} investment created successfully.`,
      investment,
      transaction,
      wallet,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const priorTransaction = await Transaction.findOne({ idempotencyKey: normalizedKey });
      if (priorTransaction) {
        const sameRequest = await sameInvestmentRequest(priorTransaction);
        return res.status(sameRequest ? 200 : 409).json({
          success: sameRequest,
          message: sameRequest ? "This investment was already created." : "That idempotencyKey was already used for a different action.",
          ...(sameRequest ? { transaction: priorTransaction, investment: await Investment.findOne({ transaction: priorTransaction._id }).lean() } : {}),
        });
      }
    }

    console.error("Error creating admin investment:", error);
    return res.status(500).json({ success: false, message: "Unable to create this investment right now. No wallet balance was changed." });
  } finally {
    if (session) await session.endSession();
  }
};
