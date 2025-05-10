import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		product: {
			productId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
				required: true,
			},
			title: String,
			price: Number,
			unit: String,
			cropType: String,
			image: String,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		totalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		buyer: {
			buyerId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			buyerName: String,
			buyerEmail: String,
			buyerPhone: String,
			buyerRegion: String,
			buyerDistrict: String,
			buyerAddress: String,
		},
		seller: {
			sellerId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			sellerName: String,
			sellerEmail: String,
			sellerPhone: String,
			sellerRegion: String,
			sellerDistrict: String,
		},
		delivery: {
			fee: Number,
			sellerAgentFee: Number,
			buyerAgentFee: Number,
			platformFee: Number,
			totalDeliveryCharge: Number,
			prepaidAmount: Number,
			remainingAmount: Number,
		},
		status: {
			type: String,
			enum: [
				"pending",
				"accepted",
				"packaging",
				"seller_agent_received",
				"on_the_way",
				"buyer_agent_received",
				"ready_for_pickup",
				"delivered",
				"returned",
				"cancelled",
			],
			default: "pending",
		},
		notes: String,
		paymentMethod: {
			type: String,
			enum: ["cash", "stripe", "sslcommerz"],
			default: "cash",
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "prepaid", "completed", "refunded"],
			default: "pending",
		},
		transactionId: String,
		deliveryTimeline: [
			{
				status: String,
				timestamp: {
					type: Date,
					default: Date.now,
				},
				updatedBy: {
					userId: {
						type: mongoose.Schema.Types.ObjectId,
						ref: "User",
					},
					role: String,
					name: String,
				},
				notes: String,
			},
		],
		pickupDeadline: Date,
		autoReturnStatus: {
			shouldReturn: {
				type: Boolean,
				default: false,
			},
			returnDate: Date,
			returnReason: String,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

// Indexing for faster search
orderSchema.index({ "buyer.buyerId": 1 });
orderSchema.index({ "seller.sellerId": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "buyer.buyerRegion": 1 });
orderSchema.index({ "seller.sellerRegion": 1 });
orderSchema.index({ "product.productId": 1 });

export default mongoose.model("Order", orderSchema);
