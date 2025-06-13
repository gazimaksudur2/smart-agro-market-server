import express from "express";
import {
	addProduct,
	getAllProducts,
	searchProducts,
	getProductById,
	getCropTypes,
	getProductsBySeller,
	approveProduct,
	deleteProduct,
	// Agent routes
	getAgentPendingProducts,
	getAgentProductStatistics,
	rejectProduct,
	getAgentOperationalAreaProducts,
	// Admin routes
	getAdminAllProducts,
	getAdminProductStatistics,
	adminApproveProduct,
	adminRejectProduct,
	bulkProductAction,
	getProductAnalytics,
} from "../controllers/productController.js";
import { verifyJWT, verifyRole, verifyUserEmail } from "../middleware/auth.js";

const router = express.Router();

// Admin and agent middleware
const adminOnly = verifyRole(["admin"]);
const agentOnly = verifyRole(["agent"]);
const adminOrAgentRoles = verifyRole(["admin", "agent"]);

// ============================
// PUBLIC ROUTES (Specific routes first)
// ============================

// GET /products – get all approved listings
router.get("/", getAllProducts);

// GET /products/search – filtered search (by region/type/price)
router.get("/search", searchProducts);

// GET /products/crop-types – get available crop types
router.get("/crop-types", getCropTypes);

// ============================
// AGENT ROUTES
// ============================

// GET /products/agent/pending - Get products pending approval in agent's region
router.get("/agent/pending", verifyJWT, agentOnly, getAgentPendingProducts);

// GET /products/agent/statistics - Get agent's product statistics
router.get(
	"/agent/statistics",
	verifyJWT,
	agentOnly,
	getAgentProductStatistics
);

// GET /products/agent/operational-area - Get agent's operational area products
router.get(
	"/agent/operational-area",
	verifyJWT,
	agentOnly,
	getAgentOperationalAreaProducts
);

// ============================
// ADMIN ROUTES
// ============================

// GET /products/admin/all - Get all products (any status) for admin
router.get("/admin/all", verifyJWT, adminOnly, getAdminAllProducts);

// GET /products/admin/statistics - Get comprehensive product statistics
router.get(
	"/admin/statistics",
	verifyJWT,
	adminOnly,
	getAdminProductStatistics
);

// GET /products/admin/analytics - Product analytics for dashboard
router.get("/admin/analytics", verifyJWT, adminOnly, getProductAnalytics);

// ============================
// PROTECTED ROUTES
// ============================

// GET /products/seller/:email – get seller's products
router.get("/seller/:email", verifyJWT, verifyUserEmail, getProductsBySeller);

// POST /products/add-product – seller adds product (agentVerified required)
router.post("/add-product", verifyJWT, verifyRole(["seller"]), addProduct);

// PATCH /products/approve/:id – agent approves product
router.patch("/approve/:id", verifyJWT, agentOnly, approveProduct);

// PATCH /products/reject/:id - Reject product (Agent only)
router.patch("/reject/:id", verifyJWT, agentOnly, rejectProduct);

// PATCH /products/admin/approve/:id - Admin approve product
router.patch("/admin/approve/:id", verifyJWT, adminOnly, adminApproveProduct);

// PATCH /products/admin/reject/:id - Admin reject product
router.patch("/admin/reject/:id", verifyJWT, adminOnly, adminRejectProduct);

// PATCH /products/bulk-action - Bulk approve/reject products
router.patch("/bulk-action", verifyJWT, adminOnly, bulkProductAction);

// DELETE /products/:id – seller deletes their product
router.delete("/:id", verifyJWT, deleteProduct);

// ============================
// DYNAMIC ROUTES (Must be last)
// ============================

// GET /products/:id – product details (keep this after all specific routes)
router.get("/:id", getProductById);

export default router;
