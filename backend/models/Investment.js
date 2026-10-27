import mongoose from "mongoose";

const CURRENCIES = ["USD", "EUR", "CNY", "JPY", "GBP", "AUD", "TRY"];
const PLAN_CODES = ["standard", "premium", "ultimate", "platinum", "premium-gold"];

const InvestmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true, unique: true },
    planCode: { type: String, enum: PLAN_CODES, required: true },
    planName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, enum: CURRENCIES, required: true },
    roiPercent: { type: Number, required: true, min: 0 },
    intervalHours: { type: Number, required: true, min: 1 },
    intervalLabel: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active", required: true, index: true },
    startedAt: { type: Date, required: true, default: Date.now },
    nextPayoutAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

InvestmentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Investment || mongoose.model("Investment", InvestmentSchema);
