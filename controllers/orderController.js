import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create order according to documentation
export const createOrder = async (req, res) => {
	try {
		const {
			userId,
			items,
			deliveryDetails,
			totalAmount,
			advancePaymentAmount,
			paymentIntentId,
			status = "pending",
		} = req.body;

		// Validate required fields
		if (!userId || !items || !deliveryDetails || !totalAmount) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields",
			});
		}

		if (!items || items.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No items in order",
			});
		}

		// Generate order number
		const orderCount = await Order.countDocuments();
		const orderNumber = `ORD-${new Date().getFullYear()}-${String(
			orderCount + 1
		).padStart(3, "0")}`;

		// Create new order
		const newOrder = new Order({
			orderNumber,
			userId,
			items,
			deliveryDetails,
			totalAmount,
			advancePaymentAmount: advancePaymentAmount || totalAmount,
			paymentIntentId,
			status,
		});

		await newOrder.save();

		res.status(201).json({
			success: true,
			message: "Order created successfully",
			order: {
				_id: newOrder._id,
				orderNumber: newOrder.orderNumber,
				...newOrder.toObject(),
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get my orders based on role
export const getMyOrders = async (req, res) => {
	try {
		const userId = req.decoded.id;
		const role = req.decoded.role;

		let query = {};

		switch (role) {
			case "consumer":
				query = { consumerId: userId };
				break;
			case "seller":
				// Get seller's products
				const products = await Product.find({ sellerId: userId });
				const productIds = products.map((product) => product._id);

				// Find orders containing these products
				query = { "products.productId": { $in: productIds } };
				break;
			case "agent":
				// Get agent's region
				const agent = await User.findById(userId);

				// Find orders in agent's region
				// This assumes orders have a region field or are linked to products with regions
				// You may need to adjust this based on your actual data model
				const regionalProducts = await Product.find({ region: agent.region });
				const regionalProductIds = regionalProducts.map(
					(product) => product._id
				);

				query = { "products.productId": { $in: regionalProductIds } };
				break;
			case "admin":
				// Admin can see all orders
				break;
			default:
				return res.status(403).json({
					success: false,
					message: "Invalid role",
				});
		}

		const orders = await Order.find(query).sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			orders,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Update order delivery status
export const updateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { deliveryStatus } = req.body;
		const userId = req.decoded.id;
		const role = req.decoded.role;

		// Validate status
		const validStatuses = [
			"packaging",
			"to agent",
			"on the way",
			"reached",
			"delivered",
		];
		if (!validStatuses.includes(deliveryStatus)) {
			return res.status(400).json({
				success: false,
				message: "Invalid delivery status",
			});
		}

		const order = await Order.findById(id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		// Check authorization based on role and status
		if (role === "consumer" && deliveryStatus !== "delivered") {
			return res.status(403).json({
				success: false,
				message: "Consumers can only mark orders as delivered",
			});
		}

		if (
			role === "seller" &&
			!["packaging", "to agent"].includes(deliveryStatus)
		) {
			return res.status(403).json({
				success: false,
				message: "Sellers can only update to packaging or to agent status",
			});
		}

		// Update order status
		order.deliveryStatus = deliveryStatus;

		// If delivered, update completion date
		if (deliveryStatus === "delivered") {
			order.deliveredAt = new Date();
			order.status = "completed";
		}

		await order.save();

		res.status(200).json({
			success: true,
			order,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Return order
export const returnOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.decoded.id;
		const role = req.decoded.role;

		const order = await Order.findById(id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		// Check if order is eligible for return
		if (order.status === "completed" || order.status === "returned") {
			return res.status(400).json({
				success: false,
				message: `Order already ${order.status}`,
			});
		}

		// Only agents or admins can mark orders as returned
		if (role !== "agent" && role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Not authorized to return this order",
			});
		}

		// Update order status
		order.status = "returned";
		order.returnedAt = new Date();

		// Return product quantities to inventory
		for (const item of order.products) {
			const product = await Product.findById(item.productId);
			if (product) {
				product.quantity += item.quantity;
				await product.save();
			}
		}

		await order.save();

		res.status(200).json({
			success: true,
			order,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Complete order
export const completeOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.decoded.id;

		const order = await Order.findById(id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		// Only consumer who placed the order can mark it as delivered
		if (order.consumerId.toString() !== userId) {
			return res.status(403).json({
				success: false,
				message: "Not authorized to complete this order",
			});
		}

		// Update order status
		order.status = "completed";
		order.deliveryStatus = "delivered";
		order.deliveredAt = new Date();

		await order.save();

		res.status(200).json({
			success: true,
			order,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Cancel order
export const cancelOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.decoded.id;
		const role = req.decoded.role;

		const order = await Order.findById(id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		// Check if order can be cancelled (only if it's still in packaging)
		if (order.deliveryStatus !== "packaging") {
			return res.status(400).json({
				success: false,
				message: "Order can only be cancelled before shipment",
			});
		}

		// Check authorization
		if (role === "consumer" && order.consumerId.toString() !== userId) {
			return res.status(403).json({
				success: false,
				message: "Not authorized to cancel this order",
			});
		}

		// Return product quantities to inventory
		for (const item of order.products) {
			const product = await Product.findById(item.productId);
			if (product) {
				product.quantity += item.quantity;
				await product.save();
			}
		}

		// Delete the order
		await Order.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Order cancelled successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
