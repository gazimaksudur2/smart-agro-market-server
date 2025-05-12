import express from "express";
import {
	register,
	login,
	logout,
	getProfile,
	updateRole,
	getAllAgents,
	getAgentByRegion,
} from "../controllers/authController.js";
import { verifyJWT, verifyRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes
// POST /users/register – register user
router.post("/register", register);

// POST /users/login – login via Firebase JWT
router.post("/login", login);

// GET /users/logout - logout user
router.get("/logout", logout);

// Protected routes
// GET /users/profile – get profile (protected)
router.get("/profile", verifyJWT, getProfile);

// PATCH /users/role – admin assigns/updates role
router.patch("/role", verifyJWT, verifyRole(["admin"]), updateRole);

// GET /users/agents – list all approved agents
router.get("/agents", getAllAgents);

// GET /users/agents/:region – get agent by region
router.get("/agents/:region", getAgentByRegion);

export default router;
