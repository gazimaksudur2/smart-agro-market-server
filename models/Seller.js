import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
	{
		// User-related properties
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
		address: {
			street: String,
			city: String,
			state: String,
			zip: String,
			country: { type: String, default: "Bangladesh" },
		},
		fullAddress: {
			type: String,
			trim: true,
		},

		// Application-specific properties
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

		// Seller-specific properties
		businessName: {
			type: String,
			required: true,
			trim: true,
		},
		businessType: {
			type: String,
			enum: ["farm", "cooperative", "distributor", "retailer", "processor"],
			required: true,
		},
		businessLicense: {
			licenseNumber: String,
			issuedBy: String,
			validUntil: Date,
			documentUrl: String,
		},
		farmDetails: {
			farmSize: Number, // in acres
			farmLocation: {
				latitude: Number,
				longitude: Number,
				address: String,
			},
			cropTypes: [String],
			organicCertified: { type: Boolean, default: false },
			certificationDetails: {
				certifyingBody: String,
				certificateNumber: String,
				validUntil: Date,
				documentUrl: String,
			},
		},
		bankDetails: {
			accountHolderName: String,
			bankName: String,
			accountNumber: String,
			routingNumber: String,
			branchName: String,
		},
		taxInfo: {
			taxId: String,
			vatRegistration: String,
		},

		// Status and verification
		isActive: {
			type: Boolean,
			default: true,
		},
		verified: {
			type: Boolean,
			default: true, // Approved applications are verified
		},
		verificationLevel: {
			type: String,
			enum: ["basic", "standard", "premium"],
			default: "basic",
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
		approvalNotes: {
			type: String,
		},

		// Performance metrics
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

		// Admin management tracking
		lastModified: {
			type: Date,
			default: Date.now,
		},
		lastModifiedBy: {
			type: String,
			ref: "User",
		},
		adminHistory: [
			{
				adminId: {
					type: String,
					ref: "User",
					required: true,
				},
				action: {
					type: String,
					enum: [
						"suspended",
						"activated",
						"edited",
						"verified",
						"verification_level_changed",
						"deleted",
						"performance_updated",
					],
					required: true,
				},
				timestamp: {
					type: Date,
					default: Date.now,
					required: true,
				},
				details: {
					reason: String,
					adminEmail: String,
					previousStatus: String,
					previousVerificationLevel: String,
					newVerificationLevel: String,
					updatedFields: [String],
					editReason: String,
				},
			},
		],
	},
	{ timestamps: true }
);

// Indexes for efficient queries
sellerSchema.index({ userId: 1 });
sellerSchema.index({ email: 1 });
sellerSchema.index({ isActive: 1 });
sellerSchema.index({ verified: 1 });
sellerSchema.index({
	"operationalArea.region": 1,
	"operationalArea.district": 1,
});
sellerSchema.index({ businessType: 1 });
sellerSchema.index({ verificationLevel: 1 });
sellerSchema.index({ "rating.average": -1 });
sellerSchema.index({ totalSales: -1 });
sellerSchema.index({ createdAt: -1 });

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
