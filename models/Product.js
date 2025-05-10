import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		cropType: {
			type: String,
			required: true,
			trim: true,
		},
		images: {
			type: [String],
			required: true,
			validate: [(val) => val.length > 0, "At least one image is required"],
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		unit: {
			type: String,
			required: true,
			enum: ["kg", "ton", "quintal", "piece"],
		},
		minimumOrderQuantity: {
			type: Number,
			required: true,
			min: 1,
		},
		availableStock: {
			type: Number,
			required: true,
			min: 0,
		},
		harvestDate: {
			type: Date,
			required: true,
		},
		sellerInfo: {
			sellerId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			sellerName: String,
			sellerEmail: String,
			sellerPhone: String,
		},
		region: {
			type: String,
			required: true,
		},
		district: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "sold_out"],
			default: "pending",
		},
		quality: {
			type: String,
			enum: ["A", "B", "C"],
			required: true,
		},
		tags: {
			type: [String],
			default: [],
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		approvedBy: {
			agentId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			approvedAt: Date,
		},
		averageRating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
	},
	{ timestamps: true }
);

// Indexing for faster search performance
productSchema.index({ cropType: 1 });
productSchema.index({ region: 1 });
productSchema.index({ district: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });

export default mongoose.model("Product", productSchema);
