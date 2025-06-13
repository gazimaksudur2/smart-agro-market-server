import Product from "../models/Product.js";
import User from "../models/User.js";

// Add a new product
export const addProduct = async (req, res) => {
	try {
		const { sellerInfo } = req.body;

		// Check if seller is verified
		const seller = await User.findById(sellerInfo?._id).exec();

		if (!seller) {
			return res.status(403).json({
				success: false,
				message: "User data not found",
			});
		} else if (!seller?.verified) {
			return res.status(403).json({
				success: false,
				message: "Seller is not verified",
			});
		}

		const newProduct = new Product({
			...req.body,
			quality: "D",
			approvedBy: { agentId: null, approvedAt: null },
			averageRating: 0,
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
			district,
			minPrice,
			maxPrice,
			page = 1,
			limit = 10,
		} = req.query;

		let query = { status: "approved" };

		if (cropType) query.cropType = cropType;
		if (region) query["sellerInfo.operationalArea.region"] = region;
		if (district) query["sellerInfo.operationalArea.district"] = district;

		if (minPrice || maxPrice) {
			query.pricePerUnit = {};
			if (minPrice) query.pricePerUnit.$gte = parseFloat(minPrice);
			if (maxPrice) query.pricePerUnit.$lte = parseFloat(maxPrice);
		}

		const maxPriceResult = await Product.aggregate([
			{ $match: { status: "approved" } },
			{ $group: { _id: null, maxPrice: { $max: "$pricePerUnit" } } },
		]);

		const existingMaxPrice =
			maxPriceResult.length > 0 ? maxPriceResult[0].maxPrice : 0;

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
			maxPrice: existingMaxPrice,
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

		if (cropType) query.cropType = cropType;
		if (region) query["sellerInfo.operationalArea.region"] = region;

		if (minPrice || maxPrice) {
			query.pricePerUnit = {};
			if (minPrice) query.pricePerUnit.$gte = parseFloat(minPrice);
			if (maxPrice) query.pricePerUnit.$lte = parseFloat(maxPrice);
		}

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

// Get Seller Products
export const getProductsBySeller = async (req, res) => {
	const { email } = req.params;
	if (!email) {
		return res.status(400).json({
			success: false,
			message: "Missing seller email in URL",
		});
	}
	try {
		const products = await Product.find({ "sellerInfo.email": email }).lean();
		res.status(200).json({
			success: true,
			products,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get crop types
export const getCropTypes = async (req, res) => {
	try {
		const cropTypes = await Product.distinct("cropType", {
			cropType: { $ne: null },
		});
		cropTypes.sort();

		res.status(200).json({
			success: true,
			data: cropTypes,
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

		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const agent = await User.findById(agentId);
		if (agent.region !== product.sellerInfo.operationalArea.region) {
			return res.status(403).json({
				success: false,
				message: "Agent can only approve products from their assigned region",
			});
		}

		product.status = "approved";
		product.approvedBy = {
			agentId,
			approvedAt: new Date(),
		};

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

		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		if (
			product.sellerInfo._id.toString() !== userId &&
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

// ============================
// AGENT-SPECIFIC ROUTES
// ============================

// Get products pending approval in agent's region
export const getAgentPendingProducts = async (req, res) => {
	try {
		const { page = 1, limit = 10, cropType, region, search } = req.query;

		const agentId = req.decoded.id;

		// Get agent's operational area
		const agent = await User.findById(agentId);
		if (!agent) {
			return res.status(404).json({
				success: false,
				message: "Agent not found",
			});
		}

		let query = {
			status: "pending",
			"sellerInfo.operationalArea.region":
				agent.operationalArea?.region || region,
		};

		if (cropType) query.cropType = cropType;
		if (region) query["sellerInfo.operationalArea.region"] = region;
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ cropType: { $regex: search, $options: "i" } },
			];
		}

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

// Get agent's product statistics
export const getAgentProductStatistics = async (req, res) => {
	try {
		const agentId = req.decoded.id;

		// Get agent's operational area
		const agent = await User.findById(agentId);
		if (!agent) {
			return res.status(404).json({
				success: false,
				message: "Agent not found",
			});
		}

		const regionQuery = {
			"sellerInfo.operationalArea.region": agent.operationalArea?.region,
		};

		const [total, pending, approved, rejected] = await Promise.all([
			Product.countDocuments(regionQuery),
			Product.countDocuments({ ...regionQuery, status: "pending" }),
			Product.countDocuments({
				...regionQuery,
				status: "approved",
				"approvedBy.agentId": agentId,
			}),
			Product.countDocuments({ ...regionQuery, status: "rejected" }),
		]);

		res.status(200).json({
			success: true,
			statistics: {
				total,
				pending,
				approved,
				rejected,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Reject product (Agent only)
export const rejectProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const { reason, reviewedBy } = req.body;
		const agentId = reviewedBy || req.decoded.id;

		if (!reason || reason.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: "Reason for rejection is required.",
			});
		}

		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const agent = await User.findById(agentId);
		if (
			agent.operationalArea?.region !==
			product.sellerInfo.operationalArea.region
		) {
			return res.status(403).json({
				success: false,
				message: "Agent can only reject products from their assigned region",
			});
		}

		product.status = "rejected";
		product.statusReason = reason;
		product.lastModified = new Date();
		product.lastModifiedBy = agentId;

		// Add to admin history
		product.adminHistory.push({
			adminId: agentId,
			action: "rejected",
			timestamp: new Date(),
			details: {
				reason: reason,
				adminEmail: agent.email,
				previousStatus: "pending",
			},
		});

		await product.save();

		res.status(200).json({
			success: true,
			message: "Product rejected successfully",
			product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get agent's operational area products
export const getAgentOperationalAreaProducts = async (req, res) => {
	try {
		const { page = 1, limit = 10, status } = req.query;

		const agentId = req.decoded.id;

		// Get agent's operational area
		const agent = await User.findById(agentId);
		if (!agent) {
			return res.status(404).json({
				success: false,
				message: "Agent not found",
			});
		}

		let query = {
			"sellerInfo.operationalArea.region": agent.operationalArea?.region,
		};
		if (status) query.status = status;

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
			operationalArea: {
				region: agent.operationalArea?.region,
				district: agent.operationalArea?.district,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============================
// ADMIN-SPECIFIC ROUTES
// ============================

// Get all products (any status) for admin
export const getAdminAllProducts = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			status,
			cropType,
			region,
			search,
		} = req.query;

		let query = {};

		if (status) query.status = status;
		if (cropType) query.cropType = cropType;
		if (region) query["sellerInfo.operationalArea.region"] = region;
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ cropType: { $regex: search, $options: "i" } },
				{ "sellerInfo.name": { $regex: search, $options: "i" } },
			];
		}

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

// Get comprehensive product statistics for admin
export const getAdminProductStatistics = async (req, res) => {
	try {
		const [total, pending, approved, rejected] = await Promise.all([
			Product.countDocuments(),
			Product.countDocuments({ status: "pending" }),
			Product.countDocuments({ status: "approved" }),
			Product.countDocuments({ status: "rejected" }),
		]);

		// By region statistics
		const byRegionStats = await Product.aggregate([
			{
				$group: {
					_id: "$sellerInfo.operationalArea.region",
					count: { $sum: 1 },
				},
			},
		]);

		// By crop type statistics
		const byCropTypeStats = await Product.aggregate([
			{
				$group: {
					_id: "$cropType",
					count: { $sum: 1 },
				},
			},
		]);

		// By status statistics
		const byStatusStats = await Product.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		res.status(200).json({
			success: true,
			statistics: {
				total,
				pending,
				approved,
				rejected,
				byRegion: byRegionStats.reduce((acc, item) => {
					acc[item._id || "Unknown"] = item.count;
					return acc;
				}, {}),
				byCropType: byCropTypeStats.reduce((acc, item) => {
					acc[item._id || "Unknown"] = item.count;
					return acc;
				}, {}),
				byStatus: byStatusStats.reduce((acc, item) => {
					acc[item._id || "Unknown"] = item.count;
					return acc;
				}, {}),
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Admin approve product
export const adminApproveProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const { reviewedBy } = req.body;
		const adminId = reviewedBy || req.decoded.id;

		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const admin = await User.findById(adminId);

		product.status = "approved";
		product.approvedBy = {
			agentId: adminId,
			approvedAt: new Date(),
		};
		product.lastModified = new Date();
		product.lastModifiedBy = adminId;

		// Add to admin history
		product.adminHistory.push({
			adminId: adminId,
			action: "approved",
			timestamp: new Date(),
			details: {
				adminEmail: admin?.email,
				previousStatus: product.status,
			},
		});

		await product.save();

		res.status(200).json({
			success: true,
			message: "Product approved successfully",
			product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Admin reject product
export const adminRejectProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const { reason, reviewedBy } = req.body;
		const adminId = reviewedBy || req.decoded.id;

		if (!reason || reason.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: "Reason for rejection is required.",
			});
		}

		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const admin = await User.findById(adminId);

		product.status = "rejected";
		product.statusReason = reason;
		product.lastModified = new Date();
		product.lastModifiedBy = adminId;

		// Add to admin history
		product.adminHistory.push({
			adminId: adminId,
			action: "rejected",
			timestamp: new Date(),
			details: {
				reason: reason,
				adminEmail: admin?.email,
				previousStatus: "pending",
			},
		});

		await product.save();

		res.status(200).json({
			success: true,
			message: "Product rejected successfully",
			product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Bulk approve/reject products
export const bulkProductAction = async (req, res) => {
	try {
		const { productIds, action, reason, reviewedBy } = req.body;
		const adminId = reviewedBy || req.decoded.id;

		// Validate input
		if (!Array.isArray(productIds) || productIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Product IDs array is required",
			});
		}

		if (!["approve", "reject"].includes(action)) {
			return res.status(400).json({
				success: false,
				message: "Invalid action. Must be 'approve' or 'reject'",
			});
		}

		if (action === "reject" && (!reason || reason.trim().length === 0)) {
			return res.status(400).json({
				success: false,
				message: "Reason is required for bulk rejection",
			});
		}

		const admin = await User.findById(adminId);
		const results = {
			successful: [],
			failed: [],
			total: productIds.length,
		};

		// Process each product
		for (const productId of productIds) {
			try {
				const product = await Product.findById(productId);
				if (!product) {
					results.failed.push({
						productId: productId,
						error: "Product not found",
					});
					continue;
				}

				// Update product
				product.status = action === "approve" ? "approved" : "rejected";
				product.lastModified = new Date();
				product.lastModifiedBy = adminId;

				if (action === "approve") {
					product.approvedBy = {
						agentId: adminId,
						approvedAt: new Date(),
					};
				} else {
					product.statusReason = reason;
				}

				// Add to admin history
				product.adminHistory.push({
					adminId: adminId,
					action: action === "reject" ? "rejected" : "approved",
					timestamp: new Date(),
					details: {
						reason: action === "reject" ? reason : undefined,
						adminEmail: admin?.email,
						previousStatus: product.status,
					},
				});

				await product.save();
				results.successful.push(productId);
			} catch (error) {
				results.failed.push({
					productId: productId,
					error: error.message,
				});
			}
		}

		res.json({
			success: true,
			message: `Bulk ${action} completed`,
			results,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error while performing bulk action.",
			error: error.message,
		});
	}
};

// Product analytics for dashboard
export const getProductAnalytics = async (req, res) => {
	try {
		const { timeRange = "30d" } = req.query;

		// Calculate date range
		let startDate = new Date();
		switch (timeRange) {
			case "7d":
				startDate.setDate(startDate.getDate() - 7);
				break;
			case "30d":
				startDate.setDate(startDate.getDate() - 30);
				break;
			case "90d":
				startDate.setDate(startDate.getDate() - 90);
				break;
			case "1y":
				startDate.setFullYear(startDate.getFullYear() - 1);
				break;
			default:
				startDate.setDate(startDate.getDate() - 30);
		}

		// Overview statistics
		const [total, pending, approved, rejected, recentProducts] =
			await Promise.all([
				Product.countDocuments(),
				Product.countDocuments({ status: "pending" }),
				Product.countDocuments({ status: "approved" }),
				Product.countDocuments({ status: "rejected" }),
				Product.countDocuments({ createdAt: { $gte: startDate } }),
			]);

		// Trends data - products created over time
		const trendsData = await Product.aggregate([
			{
				$match: { createdAt: { $gte: startDate } },
			},
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
						day: { $dayOfMonth: "$createdAt" },
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
		]);

		// Region performance
		const regionPerformance = await Product.aggregate([
			{
				$group: {
					_id: "$sellerInfo.operationalArea.region",
					total: { $sum: 1 },
					approved: {
						$sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
					},
					pending: {
						$sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
					},
					rejected: {
						$sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
					},
				},
			},
			{
				$project: {
					region: "$_id",
					total: 1,
					approved: 1,
					pending: 1,
					rejected: 1,
					approvalRate: {
						$multiply: [{ $divide: ["$approved", "$total"] }, 100],
					},
				},
			},
		]);

		res.status(200).json({
			success: true,
			analytics: {
				overview: {
					total,
					pending,
					approved,
					rejected,
					recentProducts,
					approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
				},
				trends: trendsData.map((item) => ({
					date: `${item._id.year}-${String(item._id.month).padStart(
						2,
						"0"
					)}-${String(item._id.day).padStart(2, "0")}`,
					count: item.count,
				})),
				regionPerformance: regionPerformance.map((item) => ({
					region: item._id || "Unknown",
					total: item.total,
					approved: item.approved,
					pending: item.pending,
					rejected: item.rejected,
					approvalRate: item.approvalRate?.toFixed(2) || 0,
				})),
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
