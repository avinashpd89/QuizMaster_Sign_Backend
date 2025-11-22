import {
    signupService,
    loginService,
    verifyEmailService,
    refreshTokenService,
    forgotPasswordService,
    confirmForgotPasswordService,
    resendCodeService
} from "../services/auth.service.js";

/* ----------------------------- SIGNUP ------------------------------ */
export const signup = async (req, res) => {
    try {
        const { preferred_username, phone_number, email, name, password, confirmPassword } = req.body;

        if (!preferred_username || !phone_number || !email || !name || !password || !confirmPassword)
            return res.status(400).json({ message: "All fields required" });

        if (password !== confirmPassword)
            return res.status(400).json({ message: "Passwords do not match" });

        try {
            const result = await signupService(req.body);
            res.status(200).json({ message: "Signup successful, verify email", result });
        } catch (error) {
            if (error.message.includes("already exists")) {
                return res.status(400).json({ message: "Email or username already exists" });
            }
            throw error;
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ------------------------ VERIFY EMAIL ------------------------------ */
export const verifyEmail = async (req, res) => {
  try {
    const { username, code, password } = req.body;

    if (!username || !code || !password)
      return res.status(400).json({ message: "Username, code, and password required" });

    const result = await verifyEmailService(username, code, password);

    res.status(200).json({ message: "Email verified and logged in", ...result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ------------------------------- LOGIN ------------------------------- */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username & Password required" });

    try {
      const result = await loginService(username, password);
      res.status(200).json({
        message: "Login successful",
        tokens: {
          accessToken: result.AuthenticationResult.AccessToken,
          refreshToken: result.AuthenticationResult.RefreshToken,
          idToken: result.AuthenticationResult.IdToken,
          expiresIn: result.AuthenticationResult.ExpiresIn
        }
      });
    } catch (error) {
      // Cognito throws if email not verified
      if (error.name === "UserNotConfirmedException") {
        return res.status(403).json({ message: "Please verify your email before logging in" });
      }
      throw error;
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* --------------------------- REFRESH TOKEN --------------------------- */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken, username } = req.body;

        if (!refreshToken || !username)
            return res.status(400).json({ message: "refreshToken and username required" });

        const result = await refreshTokenService(refreshToken, username);
        res.status(200).json({ message: "Token refreshed", result });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* --------------------------- FORGOT PASSWORD -------------------------- */
export const forgotPassword = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username)
            return res.status(400).json({ message: "Username required" });

        const result = await forgotPasswordService(username);
        res.status(200).json({ message: "OTP sent to email", result });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* --------------------- CONFIRM FORGOT PASSWORD ----------------------- */
export const confirmForgotPassword = async (req, res) => {
    try {
        const { username, code, newPassword } = req.body;

        if (!username || !code || !newPassword)
            return res.status(400).json({ message: "All fields required" });

        const result = await confirmForgotPasswordService(username, code, newPassword);
        res.status(200).json({ message: "Password changed successfully", result });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* --------------------------- RESEND CODE ----------------------------- */
export const resendCode = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    const result = await resendCodeService(username);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

