import express from "express";
import {
	generateToken,
	verifyToken,
	clearToken,
} from "../controllers/jwtController.js";

const router = express.Router();

// POST /jwt/token - Generate and save JWT in a cookie
router.post("/token", generateToken);

// GET /jwt/verify - Verify the JWT stored in a cookie
router.get("/verify", verifyToken);

// GET /jwt/clear - Clear the JWT cookie (logout)
router.post("/clear", clearToken);

export default router;
