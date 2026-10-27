import mongoose from "mongoose";

const CURRENCIES = ["USD", "EUR", "CNY", "JPY", "GBP", "AUD", "TRY"];

const UserSchema = new mongoose.Schema(
  {
    // Identity and contact details collected during signup and profile setup.
    firstName: { type: String, trim: true, required: true, maxlength: 80 },
    lastName: { type: String, trim: true, required: true, maxlength: 80 },
    username: { type: String, trim: true, lowercase: true, maxlength: 40, unique: true, sparse: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
      index: true,
    },
    phone: { type: String, trim: true, maxlength: 32, default: "" },
    country: { type: String, trim: true, maxlength: 100, default: "" },
    state: { type: String, trim: true, maxlength: 100, default: "" },
    profilePhotoUrl: { type: String, trim: true, default: "" },

    // Store only a server-generated password hash, never the signup password.
    passwordHash: { type: String, required: true, select: false },
    passwordResetTokenHash: { type: String, select: false, default: undefined },
    passwordResetExpires: { type: Date, select: false, default: undefined },

    // The account currency is selected at signup and is used for account balances.
    currency: { type: String, enum: CURRENCIES, required: true, default: "USD" },

    // Access control and account lifecycle.
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    status: {
      type: String,
      enum: ["active", "pending", "suspended", "closed"],
      default: "active",
      required: true,
    },
    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    termsAcceptedAt: { type: Date, default: null },

    // Referral and account-protection settings.
    referralCode: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorLoginCodeHash: { type: String, select: false, default: undefined },
    twoFactorLoginTokenHash: { type: String, select: false, default: undefined },
    twoFactorLoginExpires: { type: Date, select: false, default: undefined },
    twoFactorLoginAttempts: { type: Number, select: false, default: 0 },
    twoFactorSetupCodeHash: { type: String, select: false, default: undefined },
    twoFactorSetupExpires: { type: Date, select: false, default: undefined },
    twoFactorSetupAttempts: { type: Number, select: false, default: 0 },
    twoFactorDisableCodeHash: { type: String, select: false, default: undefined },
    twoFactorDisableExpires: { type: Date, select: false, default: undefined },
    twoFactorDisableAttempts: { type: Number, select: false, default: 0 },
    verificationStatus: {
      type: String,
      enum: ["not_started", "pending", "verified", "rejected"],
      default: "not_started",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, returned) {
        delete returned.passwordHash;
        delete returned.passwordResetTokenHash;
        delete returned.passwordResetExpires;
        delete returned.twoFactorLoginCodeHash;
        delete returned.twoFactorLoginTokenHash;
        delete returned.twoFactorLoginExpires;
        delete returned.twoFactorLoginAttempts;
        delete returned.twoFactorSetupCodeHash;
        delete returned.twoFactorSetupExpires;
        delete returned.twoFactorSetupAttempts;
        delete returned.twoFactorDisableCodeHash;
        delete returned.twoFactorDisableExpires;
        delete returned.twoFactorDisableAttempts;
        delete returned.__v;
        return returned;
      },
    },
  },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
