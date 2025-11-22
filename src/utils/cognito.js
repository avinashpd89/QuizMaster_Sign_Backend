import crypto from "crypto";
import {
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";
dotenv.config();

export const cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
});

export const generateSecretHash = (username) => {
    const hmac = crypto.createHmac("sha256", process.env.COGNITO_CLIENT_SECRET);
    hmac.update(username + process.env.COGNITO_CLIENT_ID);
    return hmac.digest("base64");
};
