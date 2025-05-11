import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create a new product
export const createProduct = async (req, res) => {
	try {
		const {
			sellerId,
			name,
			description,
			cropType,
			quantity,
			unit,
			price,
			region,
			harvestDate,
			images,
		} = req.body;

		// Check if seller is verified
		const seller = await User.findById(sellerId);
		if (!seller || !seller.verified) {
			return res.status(403).json({
				success: false,
				message: "Seller must be verified by an agent before posting products",
			});
		}

		// Create new product
		const newProduct = new Product({
			sellerId,
			sellerName: seller.name,
			name,
			description,
			cropType,
			quantity,
			unit,
			price,
			region,
			harvestDate,
			images,
			status: "pending", // Requires agent approval
		});

		await newProduct.save();

		res.status(201).json({
			success: true,
			product: newProduct,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get all approved products
export const getAllProducts = async (req, res) => {
	try {
		const {
			cropType,
			region,
			minPrice,
			maxPrice,
			page = 1,
			limit = 10,
		} = req.query;

		let query = { status: "approved" };

		// Apply filters
		if (cropType) query.cropType = cropType;
		if (region) query.region = region;

		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = parseFloat(minPrice);
			if (maxPrice) query.price.$lte = parseFloat(maxPrice);
		}

		// Pagination
		const options = {
			page: parseInt(page, 10),
			limit: parseInt(limit, 10),
			sort: { createdAt: -1 },
		};

		const products = await Product.find(query)
			.skip((options.page - 1) * options.limit)
			.limit(options.limit)
			.sort(options.sort);

		const total = await Product.countDocuments(query);

		res.status(200).json({
			success: true,
			products,
			totalPages: Math.ceil(total / options.limit),
			currentPage: options.page,
			totalProducts: total,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Search products
export const searchProducts = async (req, res) => {
	try {
		const {
			cropType,
			region,
			minPrice,
			maxPrice,
			page = 1,
			limit = 10,
		} = req.query;

		let query = { status: "approved" };

		// Apply filters
		if (cropType) query.cropType = cropType;
		if (region) query.region = region;

		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = parseFloat(minPrice);
			if (maxPrice) query.price.$lte = parseFloat(maxPrice);
		}

		// Pagination
		const options = {
			page: parseInt(page, 10),
			limit: parseInt(limit, 10),
			sort: { createdAt: -1 },
		};

		const products = await Product.find(query)
			.skip((options.page - 1) * options.limit)
			.limit(options.limit)
			.sort(options.sort);

		const total = await Product.countDocuments(query);

		res.status(200).json({
			success: true,
			products,
			totalPages: Math.ceil(total / options.limit),
			currentPage: options.page,
			totalProducts: total,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get product by ID
export const getProductById = async (req, res) => {
	try {
		const { id } = req.params;

		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		res.status(200).json({
			success: true,
			product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Agent approves product
export const approveProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const agentId = req.decoded.id;

		// Find the product
		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Find the agent
		const agent = await User.findById(agentId);

		// Check if agent is from the same region as the product
		if (agent.region !== product.region) {
			return res.status(403).json({
				success: false,
				message: "Agent can only approve products from their assigned region",
			});
		}

		// Update product status
		product.status = "approved";
		product.approvedBy = agentId;
		product.approvedAt = new Date();

		await product.save();

		res.status(200).json({
			success: true,
			product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Delete product
export const deleteProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.decoded.id;

		// Find the product
		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Check if user is the seller or an admin
		if (
			product.sellerId.toString() !== userId &&
			req.decoded.role !== "admin"
		) {
			return res.status(403).json({
				success: false,
				message: "Not authorized to delete this product",
			});
		}

		await Product.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
