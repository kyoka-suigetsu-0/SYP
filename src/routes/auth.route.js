import express from "express"
import { login, registerUser } from "../controllers/auth.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router()


router.post("/register", registerUser);
router.get("/login", login);

router.post("/profile", verifyUser, (req, res) => {
    res.json({
        message: "protected route",
        user: req.user
    })
})

router.get("/admin/profile", verifyUser, authorizeRoles("admin"), (req, res) => {
    res.json({
        message: "admin protected route",
        user: req.user
    })
})

export default router;