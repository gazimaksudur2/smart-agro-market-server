import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import jwtRoutes from "./routes/jwtRoutes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";

// Import DB connection
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: ["*", "http://localhost:5173", "http://localhost:5000"], // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/users", authRoutes);
app.use("/agents", agentRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/jwt", jwtRoutes);

// Base route
app.get("/", (req, res) => {
	res.send("Smart Agro Market API is running...");
});

// JWT route at home for quick testing
app.post("/", async (req, res) => {
	try {
		const { userId, email, role } = req.body;

		if (!userId || !email) {
			return res.status(400).json({
				success: false,
				message: "User ID and email are required",
			});
		}

		// Generate JWT
		const token = jwt.sign(
			{ id: userId, email, role: role || "consumer" },
			process.env.JWT_SECRET || "smart_agro_connect_jwt_super_secret_key",
			{ expiresIn: "1d" }
		);

		// Set cookie options
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 24 * 60 * 60 * 1000, // 1 day
			sameSite: "strict",
			path: "/",
		};

		// Set JWT as a cookie
		res.cookie("jwt", token, cookieOptions);

		res.status(200).json({
			success: true,
			message: "Token generated and stored in cookie",
			user: { id: userId, email, role: role || "consumer" },
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, "0.0.0.0", () => {
	console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.log(`Error: ${err.message}`);
	// Close server & exit process
	process.exit(1);
});
