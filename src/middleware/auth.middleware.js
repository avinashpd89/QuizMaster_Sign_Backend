import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token)
            return res.status(401).json({ message: "Access token required" });

        const decoded = jwt.decode(token, { complete: true });

        if (!decoded)
            return res.status(401).json({ message: "Invalid token" });

        req.user = decoded.payload;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized", error: error.message });
    }
};
