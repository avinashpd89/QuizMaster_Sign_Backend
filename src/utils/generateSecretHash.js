import crypto from "crypto";

export const generateSecretHash = (username) => {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    return crypto
        .createHmac("SHA256", clientSecret)
        .update(username + clientId)
        .digest("base64");
};
