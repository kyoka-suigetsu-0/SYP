import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();
// generate token
export const generateToken = (id, expiresIn = "30d") => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresIn })
}

// verify token
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

