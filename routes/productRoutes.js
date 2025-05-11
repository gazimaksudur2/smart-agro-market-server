import express from "express";
import {
	createProduct,
	getAllProducts,
	searchProducts,
	getProductById,
	approveProduct,
	deleteProduct,
} from "../controllers/productController.js";
import { verifyJWT, verifyRole } from "../middleware/auth.js";

const router = express.Router();

// POST /products – seller creates product (agentVerified required)
router.post("/", verifyJWT, verifyRole(["seller"]), createProduct);

// GET /products – get all approved listings
router.get("/", getAllProducts);

// GET /products/search – filtered search (by region/type/price)
router.get("/search", searchProducts);

// GET /products/:id – product details
router.get("/:id", getProductById);

// PATCH /products/approve/:id – agent approves product
router.patch("/approve/:id", verifyJWT, verifyRole(["agent"]), approveProduct);

// DELETE /products/:id – seller deletes their product
router.delete(
	"/:id",
	verifyJWT,
	verifyRole(["seller", "admin"]),
	deleteProduct
);

export default router;
