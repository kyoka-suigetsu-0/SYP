import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createUser, findUserByEmail, findUserById } from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";
import { validateEmail, validatePassword, validateRequiredFields } from "../utils/validator.js";
import { generateToken } from "../utils/jwtUtils.js";


// registering new user
export const registerUser = async (req, res) => {
    try {

        const { name, email, password, phone, role } = req.body;

        // validate required fields
        const { isValid } = validateRequiredFields(req.body, [
            "name",
            "email",
            "password",
            "phone",
            "role"
        ])
        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields")
        }

        // validate password
        const { isPasswordValid, message } = validatePassword(password);
        if (!isPasswordValid) {
            return sendError(res, 400, message)
        }

        // validate email
        const isValidEmail = validateEmail(email);
        if (!isValidEmail) {
            return sendError(res, 400, "Invalid Email")
        }

        // check if user exists
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return sendError(res, 400, "User already exists")
        }

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user
        const { insertId } = await createUser(
            name,
            email,
            hashedPassword,
            phone,
            role
        )

        const newUser = await findUserById(insertId)

        return sendSuccess(res, 201, "User created", newUser)

    } catch (error) {
        console.error("Registration failed: " + error)
        return sendError(res, 500, "Internal server error")
    }
}


// logging in the user
export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // validate the required fields
        const { isValid } = validateRequiredFields(req.body, [
            "email",
            "password"
        ]);
        if (!isValid) {
            return sendError(res, 400, "Please fill required fields")
        }

        // find the user
        const user = await findUserByEmail(email);
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 401, "Invalid credentials");
        }

        // create token 
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // prepare data without password
        const { password: _, ...userData } = user;

        return sendSuccess(res, 200, "Login Successful", {
            user: userData,
            token
        })

    } catch (error) {
        console.error("Login failed: " + error)
        return sendError(res, 500, "Internal Server Error")
    }
}
