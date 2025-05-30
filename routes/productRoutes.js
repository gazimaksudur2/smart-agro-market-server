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
} from "../controllers/productController.js";
import { verifyJWT, verifyRole, verifyUserEmail } from "../middleware/auth.js";

const router = express.Router();

// Public routes
// GET /products – get all approved listings
router.get("/", getAllProducts);

// GET /products/search – filtered search (by region/type/price)
router.get("/search", searchProducts);

router.get("/crop-types", getCropTypes);

router.get("/seller/:email", verifyJWT, verifyUserEmail, getProductsBySeller)

// GET /products/:id – product details
router.get("/:id", getProductById);



// Protected routes
// POST /products – seller adds product (agentVerified required)
router.post("/add-product", verifyJWT, verifyRole(["seller"]), addProduct);

// PATCH /products/approve/:id – agent approves product
router.patch("/approve/:id", verifyJWT, verifyRole(["agent"]), approveProduct);

// DELETE /products/:id – seller deletes their product
router.delete("/:id", verifyJWT, deleteProduct);

export default router;
