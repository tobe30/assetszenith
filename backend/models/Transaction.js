import mongoose from "mongoose";

const CURRENCIES = ["USD", "EUR", "CNY", "JPY", "GBP", "AUD", "TRY"];
const PAYMENT_METHODS = [
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
  // Retained for existing transaction records and clients.
  "Bank transfer",
  "Credit or debit card",
  "USDT",
  "Wallet balance",
  "Admin adjustment",
];

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "investment", "bonus", "transfer", "admin_adjustment"],
      required: true,
      default: "deposit",
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, enum: CURRENCIES, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    payoutDestination: { type: String, trim: true, maxlength: 255, default: "" },
    payoutEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
    beneficiaryAccountNumber: { type: String, trim: true, maxlength: 100, default: "" },
    beneficiaryAccountName: { type: String, trim: true, maxlength: 150, default: "" },
    beneficiaryEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
    beneficiaryPhoneNumber: { type: String, trim: true, maxlength: 40, default: "" },
    beneficiaryBankName: { type: String, trim: true, maxlength: 150, default: "" },
    bankSwiftCode: { type: String, trim: true, maxlength: 30, default: "" },
    bankIBAN: { type: String, trim: true, maxlength: 34, default: "" },
    routingNumber: { type: String, trim: true, maxlength: 50, default: "" },
    bankAddress: { type: String, trim: true, maxlength: 255, default: "" },
    bankStateProvince: { type: String, trim: true, maxlength: 100, default: "" },
    bankCity: { type: String, trim: true, maxlength: 100, default: "" },
    bankPostZipCode: { type: String, trim: true, maxlength: 30, default: "" },
    bankCountry: { type: String, trim: true, maxlength: 100, default: "" },
    paymentStatus: {
      type: String,
      enum: ["not_sent", "sent"],
      required: true,
      default: "not_sent",
    },
    paymentDate: { type: Date, default: null },
    reference: { type: String, trim: true, maxlength: 120, default: "" },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, maxlength: 500, default: "" },
    adjustmentTarget: { type: String, enum: ["wallet", "portfolio"], default: null },
    idempotencyKey: { type: String, trim: true, maxlength: 100, unique: true, sparse: true },
  },
  { timestamps: true },
);

TransactionSchema.index({ user: 1, type: 1, createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
