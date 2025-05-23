import express from "express";
import {
	createProduct,
	getAllProducts,
	searchProducts,
	getProductById,
	getCropTypes,
	approveProduct,
	deleteProduct,
} from "../controllers/productController.js";
import { verifyJWT, verifyRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes
// GET /products – get all approved listings
router.get("/", getAllProducts);

// GET /products/search – filtered search (by region/type/price)
router.get("/search", searchProducts);

router.get("/crop-types", getCropTypes);

// GET /products/:id – product details
router.get("/:id", getProductById);


// Protected routes
// POST /products – seller creates product (agentVerified required)
router.post("/create-product", verifyJWT, verifyRole(["seller"]), createProduct);

// PATCH /products/approve/:id – agent approves product
router.patch("/approve/:id", verifyJWT, verifyRole(["agent"]), approveProduct);

// DELETE /products/:id – seller deletes their product
router.delete("/:id", verifyJWT, deleteProduct);

export default router;
