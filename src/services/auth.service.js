import {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { cognito } from "../utils/cognito.js";
import { generateSecretHash } from "../utils/generateSecretHash.js";

/* ------------------------------------ SIGNUP ------------------------------------ */
export const signupService = async (data) => {
  const { preferred_username, phone_number, email, name, password } = data;

  try {
    return await cognito.send(
      new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        SecretHash: generateSecretHash(preferred_username),
        Username: preferred_username,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name },
          { Name: "phone_number", Value: phone_number },
          { Name: "preferred_username", Value: preferred_username },
        ],
      })
    );
  } catch (error) {
    if (error.name === "UsernameExistsException") {
      throw new Error("Email or username already exists");
    }
    throw new Error(error.message || "Signup failed");
  }
};


/* -------------------------------- VERIFY EMAIL + AUTO LOGIN --------------------------------- */
export const verifyEmailService = async (username, code, password) => {
  try {
    // 1️⃣ Confirm Email
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        SecretHash: generateSecretHash(username),
        Username: username,
        ConfirmationCode: code,
      })
    );

    // 2️⃣ Auto login after verification
    const loginResponse = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          SECRET_HASH: generateSecretHash(username),
        },
      })
    );

    const tokens = {
      accessToken: loginResponse.AuthenticationResult.AccessToken,
      refreshToken: loginResponse.AuthenticationResult.RefreshToken,
      idToken: loginResponse.AuthenticationResult.IdToken,
      expiresIn: loginResponse.AuthenticationResult.ExpiresIn,
    };

    // 3️⃣ Fetch verified email
    const userInfo = await cognito.send(
      new GetUserCommand({
        AccessToken: tokens.accessToken,
      })
    );

    const emailAttr = userInfo.UserAttributes.find(
      (attr) => attr.Name === "email"
    );

    return {
      message: "Email verified",
      tokens,
      user: {
        username,
        email: emailAttr ? emailAttr.Value : null,
      },
    };
  } catch (error) {
    console.error("❌ Verify Email Error:", error);
    throw new Error(error.message || "Email verification failed");
  }
};

/* -------------------------------------- LOGIN ----------------------------------- */
export const loginService = async (username, password) => {
  return await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: generateSecretHash(username),
      },
    })
  );
};

/* ---------------------------------- REFRESH TOKEN ------------------------------- */
export const refreshTokenService = async (refreshToken, username) => {
  return await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: generateSecretHash(username),
      },
    })
  );
};

/* ---------------------------------- FORGOT PASSWORD ----------------------------- */
export const forgotPasswordService = async (username) => {
  return await cognito.send(
    new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      SecretHash: generateSecretHash(username),
      Username: username,
    })
  );
};

/* ------------------------------- CONFIRM FORGOT PASSWORD ------------------------ */
export const confirmForgotPasswordService = async (
  username,
  code,
  newPassword
) => {
  return await cognito.send(
    new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      SecretHash: generateSecretHash(username),
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
    })
  );
};

/* -------------------------------- RESEND VERIFICATION CODE --------------------------- */
export const resendCodeService = async (username) => {
  try {
    const response = await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        SecretHash: generateSecretHash(username),
        Username: username,
      })
    );

    return {
      message: "Verification code resent",
      codeDeliveryDetails: response.CodeDeliveryDetails,
    };
  } catch (error) {
    console.error("❌ Resend Code Error:", error);
    throw new Error(error.message || "Failed to resend verification code");
  }
};