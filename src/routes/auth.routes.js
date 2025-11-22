import express from "express";
import {
    signup,
    login,
    verifyEmail,
    refreshToken,
    forgotPassword,
    confirmForgotPassword,
    resendCode 
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/confirm-forgot-password", confirmForgotPassword);
router.post("/resend-code", resendCode);

export default router;
