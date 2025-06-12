import express from "express";
import {
	submitApplication,
	getMyApplications,
	getApplicationById,
	getAllApplications,
	approveApplication,
	rejectApplication,
	bulkApplicationAction,
	getApplicationStatistics,
	updateApplicationStatus,
	addApplicationNote,
	getAgentApplications,
	getAgentOperationalArea,
	getAgentApplicationStatistics,
} from "../controllers/applicationController.js";
import { verifyJWT, verifyRole } from "../middleware/auth.js"; // Assuming verifyRole is your admin/role check middleware

const router = express.Router();

// Admin only middleware
const adminOnly = verifyRole(["admin"]);
const adminOrAgentRoles = verifyRole(["admin", "agent"]);
const agentOnly = verifyRole(["agent"]);
const adminOrReviewerRoles = ["admin", "reviewer"];

// Public/User Routes
router.post("/", verifyJWT, submitApplication);
router.get("/my-applications", verifyJWT, getMyApplications);

// Agent-Specific Routes (specific routes first)
router.get("/agent/applications", verifyJWT, agentOnly, getAgentApplications);
router.get(
	"/agent/operational-area",
	verifyJWT,
	agentOnly,
	getAgentOperationalArea
);
router.get(
	"/agent/statistics",
	verifyJWT,
	agentOnly,
	getAgentApplicationStatistics
);

// Admin/Agent Routes (specific routes first)
router.get(
	"/all-applications",
	verifyJWT,
	adminOrAgentRoles,
	getAllApplications
);
router.get("/statistics", verifyJWT, adminOnly, getApplicationStatistics);
router.patch("/bulk-action", verifyJWT, adminOnly, bulkApplicationAction);

// HIGH PRIORITY: Action endpoints (with exact patterns)
router.patch("/:id/approve", verifyJWT, adminOnly, approveApplication);
router.patch("/:id/reject", verifyJWT, adminOnly, rejectApplication);

// Legacy endpoints (keep for backward compatibility)
router.put(
	"/:id/status",
	verifyJWT,
	verifyRole(adminOrReviewerRoles),
	updateApplicationStatus
);
router.post(
	"/:id/notes",
	verifyJWT,
	verifyRole(adminOrReviewerRoles),
	addApplicationNote
);

// Dynamic routes last
router.get("/:id", verifyJWT, getApplicationById);

export default router;
