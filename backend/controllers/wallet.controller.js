import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

export const getWalletSummary = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Please log in to view your wallet." });
    }

    const user = await User.findById(req.user._id).select("currency").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const wallet = await Wallet.findOne({ user: req.user._id, currency: user.currency }).lean();

    return res.status(200).json({
      success: true,
      wallet: {
        currency: user.currency,
        walletBalance: wallet?.walletBalance ?? 0,
        reservedBalance: wallet?.reservedBalance ?? 0,
        portfolioBalance: wallet?.portfolioBalance ?? 0,
        totalBonus: wallet?.totalBonus ?? 0,
        totalWithdrawals: wallet?.totalWithdrawals ?? 0,
      },
    });
  } catch (error) {
    console.error("Error loading wallet summary:", error);
    return res.status(500).json({ success: false, message: "Unable to load your wallet right now." });
  }
};
