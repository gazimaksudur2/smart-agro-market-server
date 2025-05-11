import express from "express";
import {
	createReview,
	getProductReviews,
} from "../controllers/reviewController.js";
import { verifyJWT, verifyRole } from "../middleware/auth.js";

const router = express.Router();

// POST /reviews – consumer posts review after delivery
router.post("/", verifyJWT, verifyRole(["consumer"]), createReview);

// GET /reviews/product/:id – fetch all reviews for a product
router.get("/product/:id", getProductReviews);

export default router;
