import { createHash, randomBytes, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import sendEmail from "../config/nodemailer.js";

// Hash the password before it is stored. The original password is never saved.
const hashPassword = (password) => bcrypt.hash(password, 10);

// Compare a login password with the salt and hash saved during registration.
const passwordMatches = async (password, savedPassword) => {
  if (typeof savedPassword !== "string" || !savedPassword) return false;
  return bcrypt.compare(password, savedPassword);
};

const clearLoginCode = (user) => {
    user.twoFactorLoginCodeHash = undefined;
    user.twoFactorLoginTokenHash = undefined;
    user.twoFactorLoginExpires = undefined;
    user.twoFactorLoginAttempts = 0;
};

const createEmailCode = () => String(randomInt(100000, 1000000));

const sendTwoFactorCode = async (user, code, purpose) => {
    const isLogin = purpose === "login";
    const isDisable = purpose === "disable";
    const title = isLogin ? "Your sign-in verification code" : isDisable ? "Confirm two-factor authentication change" : "Confirm two-factor authentication setup";
    const message = isLogin
        ? "Enter this code to finish signing in to your Assets Zenith account."
        : isDisable
            ? "Enter this code in your account security settings to turn off email two-factor authentication."
            : "Enter this code in your account security settings to enable email two-factor authentication.";
    const body = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#20262a;line-height:1.6"><h1 style="font-size:22px">${title}</h1><p>${message}</p><p style="margin:24px 0;padding:16px;background:#f4f7f4;border-radius:10px;text-align:center;font-size:30px;font-weight:700;letter-spacing:8px;color:#16852d">${code}</p><p>This code expires in 10 minutes and can only be used once. If you did not request it, you can ignore this email.</p><p style="font-size:12px;color:#687179">Assets Zenith will never ask you to share this code.</p></div>`;
    await sendEmail({ to: user.email, subject: `${title} | Assets Zenith`, body, senderName: "Assets Zenith" });
};

const setLoginCookie = (res, user) => {
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
};

const maskedEmail = (email) => {
    const [name, domain] = email.split("@");
    return `${name.slice(0, 1)}${"*".repeat(Math.max(2, name.length - 1))}@${domain}`;
};

export const Register = async (req, res) => {
  // These names match the fields on the frontend signup form.
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword,
    country,
    state,
    phone,
    currency = "USD",
    termsAccepted,
  } = req.body;

  try {
    if (!firstName || !lastName || !username || !email || !country || !password || !confirmPassword) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }

    if (
      typeof firstName !== "string" || typeof lastName !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" || typeof country !== "string" ||
      typeof currency !== "string" || typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({ message: "Please check the signup details and try again." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9._]{3,40}$/.test(normalizedUsername)) {
      return res.status(400).json({ message: "Username must be 3 to 40 characters using letters, numbers, periods, or underscores." });
    }

    if (
      firstName.length > 80 || lastName.length > 80 || country.length > 100 ||
      (typeof state === "string" && state.length > 100) ||
      (typeof phone === "string" && phone.length > 32)
    ) {
      return res.status(400).json({ message: "One or more fields are too long." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Your passwords do not match." });
    }

    if (!["USD", "EUR", "CNY", "JPY", "GBP", "AUD", "TRY"].includes(currency.toUpperCase())) {
      return res.status(400).json({ message: "Please choose a supported account currency." });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({ message: "Please accept the terms and privacy notice." });
    }

    // Check first to return a clear message; the duplicate-key check below
    // also handles two signup requests arriving at nearly the same time.
    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: normalizedUsername },
      ],
    });
    if (existingUser) {
      return res.status(409).json({ message: "That email or username is already in use." });
    }

    const passwordHash = await hashPassword(password);

    // Mongoose supplies account defaults (role, status, balances and verification state).
    const newUser = await User.create({
      firstName,
      lastName,
      username: normalizedUsername,
      email,
      phone,
      country,
      state,
      currency: currency.toUpperCase(),
      passwordHash,
      termsAcceptedAt: new Date(),
      referralCode: `AZ${randomBytes(6).toString("hex").toUpperCase()}`,
    });

    await Wallet.create({ user: newUser._id, currency: newUser.currency });

    // toJSON on the User schema removes passwordHash before the response is sent.

    const token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt",token,{
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // prevent xss attacks
            sameSite: "strict",//prevent CSRF attacks
            secure: process.env.NODE_ENV=== "production"
        })

    return res.status(201).json({
      success: true,
      message: "Your account has been created successfully.",
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "That email or username is already in use." });
    }
    res.status(500).json({ message: "Internal Server Error"});
  }
};

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash +twoFactorLoginCodeHash +twoFactorLoginTokenHash +twoFactorLoginExpires +twoFactorLoginAttempts");
        if (!user) return res.status(401).json({ message: "Invalid email or password." });

        const isPasswordCorrect = await passwordMatches(password, user.passwordHash);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password." });

        if (user.status !== "active") {
            return res.status(403).json({ message: "This account is not currently active." });
        }

        if (user.twoFactorEnabled) {
            const code = createEmailCode();
            const challengeToken = randomBytes(32).toString("hex");
            user.twoFactorLoginCodeHash = await bcrypt.hash(code, 10);
            user.twoFactorLoginTokenHash = createHash("sha256").update(challengeToken).digest("hex");
            user.twoFactorLoginExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.twoFactorLoginAttempts = 0;
            await user.save();

            try {
                await sendTwoFactorCode(user, code, "login");
            } catch (emailError) {
                clearLoginCode(user);
                await user.save();
                console.error("Could not send two-factor login code:", emailError);
                return res.status(503).json({ message: "We could not email your verification code. Please try logging in again." });
            }

            return res.status(200).json({
                success: true,
                requiresTwoFactor: true,
                challengeToken,
                emailHint: maskedEmail(user.email),
                message: "A sign-in code has been sent to your email address.",
            });
        }

        user.lastLoginAt = new Date();
        await user.save();
        setLoginCookie(res, user);
        return res.status(200).json({ success: true, user: user.toJSON() });
    } catch (error) {
        console.error("Error in login controller:", error);
        return res.status(500).json({ message: "Unable to log in right now. Please try again later." });
    }
}

export async function verifyTwoFactorLogin(req, res) {
    const { challengeToken, code } = req.body || {};
    if (typeof challengeToken !== "string" || !/^[a-f0-9]{64}$/i.test(challengeToken) || typeof code !== "string" || !/^\d{6}$/.test(code)) {
        return res.status(400).json({ success: false, message: "Enter the six-digit code from your email." });
    }

    try {
        const tokenHash = createHash("sha256").update(challengeToken).digest("hex");
        const user = await User.findOne({
            twoFactorLoginTokenHash: tokenHash,
            twoFactorLoginExpires: { $gt: new Date() },
            twoFactorEnabled: true,
            status: "active",
        }).select("+twoFactorLoginCodeHash +twoFactorLoginTokenHash +twoFactorLoginExpires +twoFactorLoginAttempts");

        if (!user) return res.status(401).json({ success: false, message: "This sign-in code has expired. Log in again to request a new one." });

        if (user.twoFactorLoginAttempts >= 5) {
            clearLoginCode(user);
            await user.save();
            return res.status(429).json({ success: false, message: "Too many incorrect codes. Log in again to request a new code." });
        }

        const codeMatches = await bcrypt.compare(code, user.twoFactorLoginCodeHash || "");
        if (!codeMatches) {
            user.twoFactorLoginAttempts += 1;
            const attemptsLeft = Math.max(0, 5 - user.twoFactorLoginAttempts);
            if (!attemptsLeft) clearLoginCode(user);
            await user.save();
            return res.status(attemptsLeft ? 401 : 429).json({
                success: false,
                message: attemptsLeft ? `That code is incorrect. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.` : "Too many incorrect codes. Log in again to request a new code.",
            });
        }

        clearLoginCode(user);
        user.lastLoginAt = new Date();
        await user.save();
        setLoginCookie(res, user);
        return res.status(200).json({ success: true, user: user.toJSON() });
    } catch (error) {
        console.error("Two-factor login verification error:", error);
        return res.status(500).json({ success: false, message: "Unable to verify your code right now. Please try again." });
    }
}

export async function startTwoFactorSetup(req, res) {
    try {
        if (req.user.twoFactorEnabled) {
            return res.status(400).json({ success: false, message: "Two-factor authentication is already enabled." });
        }

        const code = createEmailCode();
        req.user.twoFactorSetupCodeHash = await bcrypt.hash(code, 10);
        req.user.twoFactorSetupExpires = new Date(Date.now() + 10 * 60 * 1000);
        req.user.twoFactorSetupAttempts = 0;
        await req.user.save();

        try {
            await sendTwoFactorCode(req.user, code, "setup");
        } catch (emailError) {
            req.user.twoFactorSetupCodeHash = undefined;
            req.user.twoFactorSetupExpires = undefined;
            req.user.twoFactorSetupAttempts = 0;
            await req.user.save();
            console.error("Could not send two-factor setup code:", emailError);
            return res.status(503).json({ success: false, message: "We could not email your verification code. Please try again." });
        }

        return res.status(200).json({ success: true, emailHint: maskedEmail(req.user.email), message: "A setup code has been sent to your email address." });
    } catch (error) {
        console.error("Two-factor setup error:", error);
        return res.status(500).json({ success: false, message: "Unable to start two-factor setup right now." });
    }
}

export async function enableTwoFactor(req, res) {
    const { code } = req.body || {};
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
        return res.status(400).json({ success: false, message: "Enter the six-digit code from your email." });
    }

    try {
        const user = await User.findById(req.user._id).select("+twoFactorSetupCodeHash +twoFactorSetupExpires +twoFactorSetupAttempts");
        if (!user || user.twoFactorEnabled || !user.twoFactorSetupExpires || user.twoFactorSetupExpires <= new Date()) {
            return res.status(400).json({ success: false, message: "This setup code has expired. Start setup again." });
        }

        if (user.twoFactorSetupAttempts >= 5) {
            user.twoFactorSetupCodeHash = undefined;
            user.twoFactorSetupExpires = undefined;
            user.twoFactorSetupAttempts = 0;
            await user.save();
            return res.status(429).json({ success: false, message: "Too many incorrect codes. Start setup again." });
        }

        const codeMatches = await bcrypt.compare(code, user.twoFactorSetupCodeHash || "");
        if (!codeMatches) {
            user.twoFactorSetupAttempts += 1;
            const attemptsLeft = Math.max(0, 5 - user.twoFactorSetupAttempts);
            if (!attemptsLeft) {
                user.twoFactorSetupCodeHash = undefined;
                user.twoFactorSetupExpires = undefined;
                user.twoFactorSetupAttempts = 0;
            }
            await user.save();
            return res.status(attemptsLeft ? 401 : 429).json({ success: false, message: attemptsLeft ? `That code is incorrect. ${attemptsLeft} attempts remaining.` : "Too many incorrect codes. Start setup again." });
        }

        user.twoFactorEnabled = true;
        user.twoFactorSetupCodeHash = undefined;
        user.twoFactorSetupExpires = undefined;
        user.twoFactorSetupAttempts = 0;
        await user.save();
        return res.status(200).json({ success: true, user: user.toJSON(), message: "Email two-factor authentication is now enabled." });
    } catch (error) {
        console.error("Two-factor activation error:", error);
        return res.status(500).json({ success: false, message: "Unable to enable two-factor authentication right now." });
    }
}

export async function startTwoFactorDisable(req, res) {
    const { password } = req.body || {};
    if (typeof password !== "string" || !password) {
        return res.status(400).json({ success: false, message: "Enter your current password to continue." });
    }

    try {
        const user = await User.findById(req.user._id).select("+passwordHash +twoFactorDisableCodeHash +twoFactorDisableExpires +twoFactorDisableAttempts");
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ success: false, message: "Two-factor authentication is not enabled." });
        }

        if (!(await passwordMatches(password, user.passwordHash))) {
            return res.status(401).json({ success: false, message: "Your password is incorrect." });
        }

        const code = createEmailCode();
        user.twoFactorDisableCodeHash = await bcrypt.hash(code, 10);
        user.twoFactorDisableExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.twoFactorDisableAttempts = 0;
        await user.save();

        try {
            await sendTwoFactorCode(user, code, "disable");
        } catch (emailError) {
            user.twoFactorDisableCodeHash = undefined;
            user.twoFactorDisableExpires = undefined;
            user.twoFactorDisableAttempts = 0;
            await user.save();
            console.error("Could not send two-factor disable code:", emailError);
            return res.status(503).json({ success: false, message: "We could not email your verification code. Please try again." });
        }

        return res.status(200).json({ success: true, emailHint: maskedEmail(user.email), message: "A confirmation code has been sent to your email address." });
    } catch (error) {
        console.error("Two-factor disable request error:", error);
        return res.status(500).json({ success: false, message: "Unable to start the two-factor change right now." });
    }
}

export async function disableTwoFactor(req, res) {
    const { code } = req.body || {};
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
        return res.status(400).json({ success: false, message: "Enter the six-digit code from your email." });
    }

    try {
        const user = await User.findById(req.user._id).select("+twoFactorDisableCodeHash +twoFactorDisableExpires +twoFactorDisableAttempts +twoFactorLoginCodeHash +twoFactorLoginTokenHash +twoFactorLoginExpires +twoFactorLoginAttempts");
        if (!user || !user.twoFactorEnabled || !user.twoFactorDisableExpires || user.twoFactorDisableExpires <= new Date()) {
            return res.status(400).json({ success: false, message: "This confirmation code has expired. Start again." });
        }

        const clearDisableCode = () => {
            user.twoFactorDisableCodeHash = undefined;
            user.twoFactorDisableExpires = undefined;
            user.twoFactorDisableAttempts = 0;
        };

        if (user.twoFactorDisableAttempts >= 5) {
            clearDisableCode();
            await user.save();
            return res.status(429).json({ success: false, message: "Too many incorrect codes. Start again." });
        }

        const codeMatches = await bcrypt.compare(code, user.twoFactorDisableCodeHash || "");
        if (!codeMatches) {
            user.twoFactorDisableAttempts += 1;
            const attemptsLeft = Math.max(0, 5 - user.twoFactorDisableAttempts);
            if (!attemptsLeft) clearDisableCode();
            await user.save();
            return res.status(attemptsLeft ? 401 : 429).json({ success: false, message: attemptsLeft ? `That code is incorrect. ${attemptsLeft} attempts remaining.` : "Too many incorrect codes. Start again." });
        }

        user.twoFactorEnabled = false;
        clearDisableCode();
        clearLoginCode(user);
        await user.save();
        return res.status(200).json({ success: true, user: user.toJSON(), message: "Email two-factor authentication is now disabled." });
    } catch (error) {
        console.error("Two-factor disable verification error:", error);
        return res.status(500).json({ success: false, message: "Unable to disable two-factor authentication right now." });
    }
}

export function logout(_req, res) {
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
    return res.status(200).json({ success: true, message: "Logout successful." });
}

export async function forgotPassword(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const genericMessage = "If an account exists for that email, password reset instructions will be sent shortly.";

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ success: true, message: genericMessage });
        }

        const resetToken = randomBytes(32).toString("hex");
        user.passwordResetTokenHash = createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
        const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
        const body = `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#20262a;line-height:1.6">
            <h1 style="font-size:24px;margin-bottom:12px">Reset your Assets Zenith password</h1>
            <p>We received a request to reset the password for your account. Use the button below to choose a new password.</p>
            <p style="margin:28px 0"><a href="${resetLink}" style="display:inline-block;padding:13px 20px;background:#1caf35;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Reset password</a></p>
            <p>This link expires in 15 minutes and can only be used once. If you didn’t request this, you can ignore this email.</p>
            <p style="font-size:12px;color:#687179;word-break:break-all">If the button doesn’t work, copy this link:<br>${resetLink}</p>
          </div>`;

        await sendEmail({
            to: user.email,
            subject: "Reset your Assets Zenith password",
            body,
            senderName: "Assets Zenith",
        });

        return res.status(200).json({ success: true, message: genericMessage });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ success: false, message: "Unable to send password reset instructions right now." });
    }
}

export async function resetPassword(req, res) {
    const { token, newPassword, confirmPassword } = req.body || {};
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(400).json({ success: false, message: "This password reset link is invalid or has expired. Request a new link." });
    }

    if (typeof newPassword !== "string" || typeof confirmPassword !== "string" || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "Enter and confirm your new password." });
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
        return res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters." });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Your passwords do not match." });
    }

    try {
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetTokenHash: tokenHash,
            passwordResetExpires: { $gt: new Date() },
        }).select("+passwordHash +passwordResetTokenHash +passwordResetExpires");

        if (!user) {
            return res.status(400).json({ success: false, message: "This password reset link is invalid or has expired. Request a new link." });
        }

        user.passwordHash = await hashPassword(newPassword);
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Your password has been reset. You can now log in with your new password." });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ success: false, message: "Unable to reset your password right now." });
    }
}
