import mongoose from "mongoose";
import Investment from "../models/Investment.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { INVESTMENT_PLANS } from "../lib/investmentPlans.js";
import { emailAdminNotification } from "../lib/emailNotifications.js";

export const getInvestmentPlans = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to view investment plans." });
    }

    const user = await User.findById(req.user._id).select("currency").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const plans = INVESTMENT_PLANS.map((plan) => ({ ...plan, currency: user.currency }));
    return res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error("Error loading investment plans:", error);
    return res.status(500).json({ success: false, message: "Unable to load investment plans right now." });
  }
};

export const createInvestment = async (req, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ success: false, message: "Please log in to start an investment." });
  }

  const { planCode, amount } = req.body || {};
  const plan = INVESTMENT_PLANS.find((item) => item.code === planCode);
  if (!plan) {
    return res.status(400).json({ success: false, message: "Choose a valid investment plan." });
  }

  const amountText = typeof amount === "number" ? String(amount) : amount;
  if (typeof amountText !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(amountText)) {
    return res.status(400).json({ success: false, message: "Enter a valid amount with up to two decimal places." });
  }

  const parsedAmount = Number(amountText);
  if (!Number.isFinite(parsedAmount) || parsedAmount < plan.minimum) {
    return res.status(400).json({
      success: false,
      message: `${plan.name} requires a minimum investment of ${plan.minimum}.`,
    });
  }
  if (plan.maximum !== null && parsedAmount > plan.maximum) {
    return res.status(400).json({
      success: false,
      message: `${plan.name} allows investments up to ${plan.maximum}.`,
    });
  }

  let session;
  let investment = null;
  let insufficientBalance = false;

  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const user = await User.findById(req.user._id).select("currency").session(session);
      if (!user) throw new Error("User account not found.");

      const wallet = await Wallet.findOneAndUpdate(
        { user: user._id, currency: user.currency, walletBalance: { $gte: parsedAmount } },
        {
          $inc: {
            walletBalance: -parsedAmount,
            portfolioBalance: parsedAmount,
          },
        },
        { new: true, runValidators: true, session },
      );

      if (!wallet) {
        insufficientBalance = true;
        return;
      }

      const [transaction] = await Transaction.create(
        [{
          user: user._id,
          type: "investment",
          amount: parsedAmount,
          currency: user.currency,
          paymentMethod: "Wallet balance",
          status: "approved",
          description: `${plan.name} investment opened.`,
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
          startedAt: new Date(),
          nextPayoutAt: new Date(Date.now() + plan.intervalHours * 60 * 60 * 1000),
        }],
        { session },
      );
    });

    if (insufficientBalance) {
      return res.status(409).json({ success: false, message: "Your available wallet balance is insufficient." });
    }

    await emailAdminNotification({
      subject: "New user investment · Assets Zenith",
      heading: "A user started an investment",
      message: "A new investment was created from the user’s wallet balance.",
      details: [
        ["User", `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.email],
        ["Email", req.user.email],
        ["Plan", plan.name],
        ["Amount", `${investment.currency} ${investment.amount.toFixed(2)}`],
        ["Return schedule", `${plan.roiPercent}% ${plan.intervalLabel}`],
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Investment started successfully.",
      investment,
    });
  } catch (error) {
    console.error("Error creating investment:", error);
    return res.status(500).json({ success: false, message: "Unable to start this investment right now. No wallet balance was changed." });
  } finally {
    if (session) await session.endSession();
  }
};

export const getMyInvestments = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to view your investments." });
    }

    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const filter = { user: req.user._id };

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Investment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      investments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error loading investments:", error);
    return res.status(500).json({ success: false, message: "Unable to load your investments right now." });
  }
};
