import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
	{
		// Basic user information
		userId: {
			type: String,
			ref: "User",
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			trim: true,
		},
		profilePicture: {
			type: String,
			default: "https://i.ibb.co/MBtjqXQ/no-avatar.gif",
		},
		fullAddress: {
			type: String,
			trim: true,
		},

		// Application reference
		applicationId: {
			type: String,
			ref: "Application",
			required: true,
		},
		operationalArea: {
			region: { type: String, required: true },
			district: { type: String, required: true },
		},
		formData: {
			type: mongoose.Schema.Types.Mixed, // Original application form data
			required: true,
		},

		// Essential business information
		businessName: {
			type: String,
			required: true,
			trim: true,
		},
		businessType: {
			type: String,
			enum: ["farm", "cooperative", "distributor", "retailer"],
			required: true,
		},

		// Simplified farm details
		farmDetails: {
			farmSize: Number, // in acres
			cropTypes: [String],
			organicCertified: { type: Boolean, default: false },
		},

		// Basic bank details for payments
		bankDetails: {
			accountHolderName: String,
			bankName: String,
			accountNumber: String,
		},

		// Status and verification
		isActive: {
			type: Boolean,
			default: true,
		},
		verified: {
			type: Boolean,
			default: false,
		},

		// Application approval details
		approvedBy: {
			type: String,
			ref: "User",
			required: true,
		},
		approvedAt: {
			type: Date,
			required: true,
		},

		// Basic performance metrics
		totalProducts: {
			type: Number,
			default: 0,
		},
		totalSales: {
			type: Number,
			default: 0,
		},
		rating: {
			average: { type: Number, default: 0, min: 0, max: 5 },
			count: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);

// Essential indexes only
sellerSchema.index({ userId: 1 });
sellerSchema.index({ email: 1 });
sellerSchema.index({ isActive: 1 });
sellerSchema.index({ verified: 1 });
sellerSchema.index({ "operationalArea.region": 1 });
sellerSchema.index({ "operationalArea.district": 1 });

// Pre-save middleware to ensure userId is a string
sellerSchema.pre("save", function (next) {
	if (this.userId && typeof this.userId !== "string") {
		this.userId = this.userId.toString();
	}
	next();
});

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
