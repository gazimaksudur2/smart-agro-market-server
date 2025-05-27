import express from "express";
import {
	submitApplication,
	getMyApplications,
	getApplicationById,
	getAllApplications,
	updateApplicationStatus,
	addApplicationNote,
} from "../controllers/applicationController.js";
import { verifyJWT, verifyRole } from "../middleware/auth.js"; // Assuming verifyRole is your admin/role check middleware

const router = express.Router();

// User Routes
router.post("/", verifyJWT, submitApplication);
router.get("/my-applications", verifyJWT, getMyApplications);
router.get("/:id", verifyJWT, getApplicationById);

// Admin/Reviewer Routes (Protected by verifyRole - e.g., ['admin', 'reviewer'])
const adminOrReviewerRoles = ["admin", "reviewer"]; // Define roles that can manage applications

router.get(
	"/",
	verifyJWT,
	verifyRole(adminOrReviewerRoles),
	getAllApplications
);
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

// Example for a route that might be admin only for deletion
// router.delete('/:id', verifyJWT, verifyRole(['admin']), deleteApplication);

export default router;
