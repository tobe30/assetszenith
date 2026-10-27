import express from "express"
import { Register, disableTwoFactor, enableTwoFactor, forgotPassword, login, logout, resetPassword, startTwoFactorDisable, startTwoFactorSetup, verifyTwoFactorLogin } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/protectRoute.js"
import { allowRoles } from "../middleware/rbac.js"

const router = express.Router()

router.post("/register", Register)
router.post("/login", login)
router.post("/login/verify-code", verifyTwoFactorLogin)
router.post("/logout", logout)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/2fa/setup", protectRoute, startTwoFactorSetup)
router.post("/2fa/enable", protectRoute, enableTwoFactor)
router.post("/2fa/disable/request", protectRoute, startTwoFactorDisable)
router.post("/2fa/disable", protectRoute, disableTwoFactor)


//check if user os logged in 
router.get("/me", protectRoute, (req, res)=>{
    res.status(200).json({ success: true, user: req.user});
})

// admin-only route example
router.get("/admin", protectRoute, allowRoles("admin"), (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router
