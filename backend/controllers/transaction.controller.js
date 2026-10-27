import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { emailAdminNotification, emailUserNotification } from "../lib/emailNotifications.js";

const PAYMENT_METHODS = new Set([
  "Bitcoin",
  "Litecoin",
  "Ethereum",
  "Bitcoin Cash",
  "DASH",
  "Dogecoin",
  "Perfect Money",
  "Bank Transfer",
  "Western Union",
  "Moneygram",
  "Credit Card",
  "Payeer",
  "VeChain",
  "Verus Coin",
  "Tether (USDT) TRC-20",
  // Keep existing labels accepted for transactions already using them.
  "Bank transfer",
  "Credit or debit card",
  "USDT",
]);
const WITHDRAWAL_METHODS = new Set([
  "Bitcoin",
  "Litecoin",
  "Ethereum",
  "Bitcoin Cash",
  "Bank transfer",
  "Payeer",
  "USDT",
]);

const parseMoneyAmount = (amount) => {
  const amountText = typeof amount === "number" ? String(amount) : amount;
  if (typeof amountText !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(amountText)) return null;

  const parsedAmount = Number(amountText);
  return Number.isFinite(parsedAmount) && parsedAmount >= 0.01 ? parsedAmount : null;
};

export const createDepositRequest = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to submit a deposit." });
    }

    const {
      amount,
      paymentMethod,
      paymentStatus = "not_sent",
      paymentDate,
      reference = "",
      description = "",
    } = req.body || {};

    const amountText = typeof amount === "number" ? String(amount) : amount;
    if (typeof amountText !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(amountText)) {
      return res.status(400).json({ success: false, message: "Enter a valid amount with up to two decimal places." });
    }

    const parsedAmount = Number(amountText);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0.01) {
      return res.status(400).json({ success: false, message: "Deposit amount must be at least 0.01." });
    }

    if (typeof paymentMethod !== "string" || !PAYMENT_METHODS.has(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Choose a supported payment method." });
    }

    if (!["not_sent", "sent"].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Choose a valid payment status." });
    }

    if (typeof reference !== "string" || reference.trim().length > 120) {
      return res.status(400).json({ success: false, message: "Reference must be 120 characters or fewer." });
    }

    if (paymentStatus === "sent" && !reference.trim()) {
      return res.status(400).json({ success: false, message: "Add the transfer reference or transaction ID before submitting a payment made request." });
    }

    if (typeof description !== "string" || description.trim().length > 1000) {
      return res.status(400).json({ success: false, message: "Description must be 1,000 characters or fewer." });
    }

    let parsedPaymentDate = null;
    if (paymentDate !== undefined && paymentDate !== "") {
      parsedPaymentDate = new Date(paymentDate);
      if (Number.isNaN(parsedPaymentDate.getTime())) {
        return res.status(400).json({ success: false, message: "Enter a valid payment date." });
      }
      if (parsedPaymentDate.getTime() > Date.now()) {
        return res.status(400).json({ success: false, message: "Payment date cannot be in the future." });
      }
    }

    const user = await User.findById(req.user._id).select("currency");
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const transaction = await Transaction.create({
      user: user._id,
      type: "deposit",
      amount: parsedAmount,
      currency: user.currency,
      paymentMethod,
      paymentStatus,
      paymentDate: parsedPaymentDate,
      reference: reference.trim(),
      description: description.trim(),
      // The user may report payment progress but cannot approve their own deposit.
      status: "pending",
    });

    await emailAdminNotification({
      subject: "New deposit request · Assets Zenith",
      heading: "A user submitted a deposit request",
      message: "A deposit request is waiting for review. The wallet is credited only after an administrator approves it.",
      details: [
        ["User", `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.email],
        ["Email", req.user.email],
        ["Amount", `${user.currency} ${parsedAmount.toFixed(2)}`],
        ["Payment method", paymentMethod],
        ["Payment status", paymentStatus === "sent" ? "User reported payment sent" : "Not reported as sent"],
        ["Reference", reference.trim() || "—"],
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted for review.",
      transaction,
    });
  } catch (error) {
    console.error("Error creating deposit request:", error);
    return res.status(500).json({ success: false, message: "Unable to submit your deposit request right now." });
  }
};

export const getDepositHistory = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to view deposit history." });
    }

    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const filter = { user: req.user._id, type: "deposit" };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error loading deposit history:", error);
    return res.status(500).json({ success: false, message: "Unable to load deposit history right now." });
  }
};

export const getPendingDeposits = async (req, res) => {
  try {
    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const filter = { type: "deposit", status: "pending" };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("user", "firstName lastName email")
        .sort({ createdAt: 1 })
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
    console.error("Error loading pending deposits:", error);
    return res.status(500).json({ success: false, message: "Unable to load pending deposits right now." });
  }
};

export const approveDeposit = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid deposit request ID." });
  }

  const { reviewNote = "" } = req.body || {};
  if (typeof reviewNote !== "string" || reviewNote.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Review note must be 500 characters or fewer." });
  }

  let session;
  let approvedTransaction = null;

  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      approvedTransaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, type: "deposit", status: "pending", paymentStatus: "sent", reference: { $exists: true, $ne: "" } },
        {
          $set: {
            status: "approved",
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            reviewNote: reviewNote.trim(),
          },
        },
        { new: true, runValidators: true, session },
      );

      if (!approvedTransaction) return;

      const walletOwner = await User.findOne({
        _id: approvedTransaction.user,
        currency: approvedTransaction.currency,
      }).session(session);

      if (!walletOwner) {
        throw new Error("The deposit user or currency could not be verified.");
      }

      await Wallet.findOneAndUpdate(
        { user: approvedTransaction.user, currency: approvedTransaction.currency },
        {
          $inc: { walletBalance: approvedTransaction.amount },
          $setOnInsert: {
            user: approvedTransaction.user,
            currency: approvedTransaction.currency,
          },
        },
        { upsert: true, new: true, runValidators: true, session },
      );
    });

    if (!approvedTransaction) {
      const existingDeposit = await Transaction.findOne({ _id: req.params.id, type: "deposit" })
        .select("status paymentStatus reference")
        .lean();
      const paymentNotReported = existingDeposit?.status === "pending"
        && (existingDeposit.paymentStatus !== "sent" || !existingDeposit.reference?.trim());
      return res.status(existingDeposit ? 409 : 404).json({
        success: false,
        message: !existingDeposit
          ? "Deposit request not found."
          : paymentNotReported
            ? "Payment has not been reported with a reference yet. Verify payment before approving."
            : "This deposit request has already been reviewed.",
      });
    }

    await emailUserNotification(approvedTransaction.user, {
      subject: "Your deposit was approved · Assets Zenith",
      heading: "Deposit approved",
      message: "Your deposit request was approved and the wallet balance has been credited.",
      details: [
        ["Amount", `${approvedTransaction.currency} ${approvedTransaction.amount.toFixed(2)}`],
        ["Payment method", approvedTransaction.paymentMethod],
        ["Reference", approvedTransaction.reference || "—"],
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Deposit approved and wallet credited.",
      transaction: approvedTransaction,
    });
  } catch (error) {
    console.error("Error approving deposit:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to approve this deposit right now. No wallet credit was applied.",
    });
  } finally {
    if (session) await session.endSession();
  }
};

export const rejectDeposit = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid deposit request ID." });
    }

    const { reviewNote = "" } = req.body || {};
    if (typeof reviewNote !== "string" || reviewNote.trim().length > 500) {
      return res.status(400).json({ success: false, message: "Review note must be 500 characters or fewer." });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, type: "deposit", status: "pending" },
      {
        $set: {
          status: "rejected",
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          reviewNote: reviewNote.trim(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!transaction) {
      const existingDeposit = await Transaction.exists({ _id: req.params.id, type: "deposit" });
      return res.status(existingDeposit ? 409 : 404).json({
        success: false,
        message: existingDeposit ? "This deposit request has already been reviewed." : "Deposit request not found.",
      });
    }

    await emailUserNotification(transaction.user, {
      subject: "Your deposit request was declined · Assets Zenith",
      heading: "Deposit request declined",
      message: "Your deposit request was not approved. Contact support if you need help with this review.",
      details: [
        ["Amount", `${transaction.currency} ${transaction.amount.toFixed(2)}`],
        ["Payment method", transaction.paymentMethod],
        ["Review note", transaction.reviewNote || "No additional note was provided."],
      ],
    });

    return res.status(200).json({ success: true, message: "Deposit rejected.", transaction });
  } catch (error) {
    console.error("Error rejecting deposit:", error);
    return res.status(500).json({ success: false, message: "Unable to reject this deposit right now." });
  }
};

// withdrawal-related controllers are defined below. They are separate from deposit controllers because they involve reserved balances and different business logic.
export const createWithdrawalRequest = async (req, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ success: false, message: "Please log in to request a withdrawal." });
  }

  const {
    amount,
    paymentMethod,
    payoutDestination,
    payoutEmail = "",
    beneficiaryAccountNumber = "",
    beneficiaryAccountName = "",
    beneficiaryEmail = "",
    beneficiaryPhoneNumber = "",
    beneficiaryBankName = "",
    bankSwiftCode = "",
    bankIBAN = "",
    routingNumber = "",
    bankAddress = "",
    bankStateProvince = "",
    bankCity = "",
    bankPostZipCode = "",
    bankCountry = "",
  } = req.body || {};
  const parsedAmount = parseMoneyAmount(amount);
  if (parsedAmount === null) {
    return res.status(400).json({ success: false, message: "Enter a valid amount with up to two decimal places." });
  }

  if (typeof paymentMethod !== "string" || !WITHDRAWAL_METHODS.has(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Choose a supported withdrawal method." });
  }

  const isBankTransfer = paymentMethod === "Bank transfer";
  const optionalBankFields = {
    bankSwiftCode: [bankSwiftCode, 30],
    bankIBAN: [bankIBAN, 34],
    routingNumber: [routingNumber, 50],
    bankAddress: [bankAddress, 255],
    bankStateProvince: [bankStateProvince, 100],
    bankCity: [bankCity, 100],
    bankPostZipCode: [bankPostZipCode, 30],
  };
  for (const [field, [value, maxLength]] of Object.entries(optionalBankFields)) {
    if (typeof value !== "string" || value.trim().length > maxLength) {
      return res.status(400).json({ success: false, message: `${field} must be ${maxLength} characters or fewer.` });
    }
  }

  let normalizedPayoutDestination = "";
  let normalizedPayoutEmail = "";
  let normalizedBeneficiary = {};
  if (isBankTransfer) {
    const requiredBankFields = {
      beneficiaryAccountNumber: [beneficiaryAccountNumber, 100],
      beneficiaryAccountName: [beneficiaryAccountName, 150],
      beneficiaryEmail: [beneficiaryEmail, 254],
      beneficiaryPhoneNumber: [beneficiaryPhoneNumber, 40],
      beneficiaryBankName: [beneficiaryBankName, 150],
      bankCountry: [bankCountry, 100],
    };
    for (const [field, [value, maxLength]] of Object.entries(requiredBankFields)) {
      if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
        return res.status(400).json({ success: false, message: `${field} is required and must be ${maxLength} characters or fewer.` });
      }
    }
    const email = beneficiaryEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid beneficiary email address." });
    }
    normalizedBeneficiary = Object.fromEntries([
      ...Object.entries(requiredBankFields),
      ...Object.entries(optionalBankFields),
    ].map(([field, [value]]) => [field, field === "beneficiaryEmail" ? email : value.trim()]));
    normalizedPayoutDestination = beneficiaryAccountNumber.trim();
    normalizedPayoutEmail = email;
  } else {
    if (typeof payoutDestination !== "string" || !payoutDestination.trim() || payoutDestination.trim().length > 255) {
      return res.status(400).json({ success: false, message: "Enter a payout destination of 255 characters or fewer." });
    }
    if (typeof payoutEmail !== "string" || payoutEmail.trim().length > 254) {
      return res.status(400).json({ success: false, message: "Payout email must be 254 characters or fewer." });
    }
    normalizedPayoutEmail = payoutEmail.trim().toLowerCase();
    if (normalizedPayoutEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedPayoutEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid payout email address." });
    }
    normalizedPayoutDestination = payoutDestination.trim();
  }

  const session = await mongoose.startSession();
  let withdrawalTransaction = null;
  let insufficientBalance = false;

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(req.user._id).select("currency").session(session);
      if (!user) throw new Error("User account not found.");

      // Wallet documents created before reservedBalance was added need this field initialized.
      await Wallet.updateOne(
        { user: user._id, currency: user.currency, reservedBalance: { $exists: false } },
        { $set: { reservedBalance: 0 } },
        { session },
      );

      const wallet = await Wallet.findOneAndUpdate(
        { user: user._id, currency: user.currency, walletBalance: { $gte: parsedAmount } },
        { $inc: { walletBalance: -parsedAmount, reservedBalance: parsedAmount } },
        { new: true, runValidators: true, session },
      );

      if (!wallet) {
        insufficientBalance = true;
        return;
      }

      [withdrawalTransaction] = await Transaction.create(
        [{
          user: user._id,
          type: "withdrawal",
          amount: parsedAmount,
          currency: user.currency,
          paymentMethod,
          payoutDestination: normalizedPayoutDestination,
          payoutEmail: normalizedPayoutEmail,
          ...normalizedBeneficiary,
          status: "pending",
        }],
        { session },
      );
    });

    if (insufficientBalance) {
      return res.status(409).json({ success: false, message: "Your available wallet balance is insufficient." });
    }

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted. The requested amount is reserved while it is reviewed.",
      transaction: withdrawalTransaction,
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    return res.status(500).json({ success: false, message: "Unable to submit your withdrawal request right now." });
  } finally {
    await session.endSession();
  }
};

export const getWithdrawalHistory = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to view withdrawal history." });
    }

    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const filter = { user: req.user._id, type: "withdrawal" };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error loading withdrawal history:", error);
    return res.status(500).json({ success: false, message: "Unable to load withdrawal history right now." });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to view your transactions." });
    }

    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const filter = { user: req.user._id };
    const validTypes = ["deposit", "withdrawal", "investment", "bonus", "transfer", "admin_adjustment"];
    const type = typeof req.query.type === "string" ? req.query.type.trim() : "";
    if (type && validTypes.includes(type)) filter.type = type;

    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 80) : "";
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchPattern = new RegExp(escapedSearch, "i");
      filter.$or = [
        { paymentMethod: searchPattern },
        { reference: searchPattern },
        { description: searchPattern },
        { payoutDestination: searchPattern },
        { beneficiaryAccountName: searchPattern },
        { beneficiaryBankName: searchPattern },
      ];
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error loading user transactions:", error);
    return res.status(500).json({ success: false, message: "Unable to load your transactions right now." });
  }
};

export const getPendingWithdrawals = async (req, res) => {
  try {
    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
    const filter = { type: "withdrawal", status: "pending" };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("user", "firstName lastName email")
        .sort({ createdAt: 1 })
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
    console.error("Error loading pending withdrawals:", error);
    return res.status(500).json({ success: false, message: "Unable to load pending withdrawals right now." });
  }
};

export const approveWithdrawal = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid withdrawal request ID." });
  }

  const { reviewNote = "" } = req.body || {};
  if (typeof reviewNote !== "string" || reviewNote.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Review note must be 500 characters or fewer." });
  }

  let session;
  let approvedTransaction = null;

  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      approvedTransaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, type: "withdrawal", status: "pending" },
        {
          $set: {
            status: "approved",
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            reviewNote: reviewNote.trim(),
          },
        },
        { new: true, runValidators: true, session },
      );

      if (!approvedTransaction) return;

      const wallet = await Wallet.findOneAndUpdate(
        {
          user: approvedTransaction.user,
          currency: approvedTransaction.currency,
          reservedBalance: { $gte: approvedTransaction.amount },
        },
        { $inc: { reservedBalance: -approvedTransaction.amount, totalWithdrawals: approvedTransaction.amount } },
        { new: true, runValidators: true, session },
      );

      if (!wallet) throw new Error("Reserved withdrawal balance could not be verified.");
    });

    if (!approvedTransaction) {
      const existingWithdrawal = await Transaction.exists({ _id: req.params.id, type: "withdrawal" });
      return res.status(existingWithdrawal ? 409 : 404).json({
        success: false,
        message: existingWithdrawal ? "This withdrawal request has already been reviewed." : "Withdrawal request not found.",
      });
    }

    await emailUserNotification(approvedTransaction.user, {
      subject: "Your withdrawal was approved · Assets Zenith",
      heading: "Withdrawal approved",
      message: "Your withdrawal request was approved and recorded.",
      details: [
        ["Amount", `${approvedTransaction.currency} ${approvedTransaction.amount.toFixed(2)}`],
        ["Method", approvedTransaction.paymentMethod],
        ["Destination", approvedTransaction.payoutDestination || "Bank transfer details on file"],
      ],
    });

    return res.status(200).json({ success: true, message: "Withdrawal approved.", transaction: approvedTransaction });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    return res.status(500).json({ success: false, message: "Unable to approve this withdrawal right now. The balance was not changed." });
  } finally {
    if (session) await session.endSession();
  }
};

export const rejectWithdrawal = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid withdrawal request ID." });
  }

  const { reviewNote = "" } = req.body || {};
  if (typeof reviewNote !== "string" || reviewNote.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Review note must be 500 characters or fewer." });
  }

  const session = await mongoose.startSession();
  let rejectedTransaction = null;

  try {
    await session.withTransaction(async () => {
      rejectedTransaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, type: "withdrawal", status: "pending" },
        {
          $set: {
            status: "rejected",
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            reviewNote: reviewNote.trim(),
          },
        },
        { new: true, runValidators: true, session },
      );

      if (!rejectedTransaction) return;

      const wallet = await Wallet.findOneAndUpdate(
        {
          user: rejectedTransaction.user,
          currency: rejectedTransaction.currency,
          reservedBalance: { $gte: rejectedTransaction.amount },
        },
        { $inc: { walletBalance: rejectedTransaction.amount, reservedBalance: -rejectedTransaction.amount } },
        { new: true, runValidators: true, session },
      );

      if (!wallet) throw new Error("Reserved withdrawal balance could not be verified.");
    });

    if (!rejectedTransaction) {
      const existingWithdrawal = await Transaction.exists({ _id: req.params.id, type: "withdrawal" });
      return res.status(existingWithdrawal ? 409 : 404).json({
        success: false,
        message: existingWithdrawal ? "This withdrawal request has already been reviewed." : "Withdrawal request not found.",
      });
    }

    await emailUserNotification(rejectedTransaction.user, {
      subject: "Your withdrawal request was declined · Assets Zenith",
      heading: "Withdrawal request declined",
      message: "Your withdrawal request was declined and the reserved amount has been returned to your wallet.",
      details: [
        ["Amount", `${rejectedTransaction.currency} ${rejectedTransaction.amount.toFixed(2)}`],
        ["Method", rejectedTransaction.paymentMethod],
        ["Review note", rejectedTransaction.reviewNote || "No additional note was provided."],
      ],
    });

    return res.status(200).json({ success: true, message: "Withdrawal rejected and reserved funds returned to the wallet.", transaction: rejectedTransaction });
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    return res.status(500).json({ success: false, message: "Unable to reject this withdrawal right now. The balance was not changed." });
  } finally {
    await session.endSession();
  }
};
