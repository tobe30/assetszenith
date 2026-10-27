import mongoose from "mongoose";

const CURRENCIES = ["USD", "EUR", "CNY", "JPY", "GBP", "AUD", "TRY"];

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    currency: { type: String, enum: CURRENCIES, required: true },
    walletBalance: { type: Number, min: 0, default: 0 },
    reservedBalance: { type: Number, min: 0, default: 0 },
    portfolioBalance: { type: Number, min: 0, default: 0 },
    totalBonus: { type: Number, min: 0, default: 0 },
    totalWithdrawals: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true },
);

WalletSchema.index({ user: 1, currency: 1 }, { unique: true });

export default mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
