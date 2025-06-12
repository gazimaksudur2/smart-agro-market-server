import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
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

		// Admin-specific properties
		adminId: {
			type: String,
			unique: true,
			required: true, // Auto-generated admin ID
		},
		adminLevel: {
			type: String,
			enum: ["junior", "senior", "manager", "super-admin"],
			default: "junior",
		},
		permissions: {
			users: {
				view: { type: Boolean, default: true },
				create: { type: Boolean, default: false },
				edit: { type: Boolean, default: false },
				delete: { type: Boolean, default: false },
				suspend: { type: Boolean, default: false },
			},
			applications: {
				view: { type: Boolean, default: true },
				review: { type: Boolean, default: true },
				approve: { type: Boolean, default: false },
				reject: { type: Boolean, default: false },
				bulk_action: { type: Boolean, default: false },
			},
			sellers: {
				view: { type: Boolean, default: true },
				edit: { type: Boolean, default: false },
				suspend: { type: Boolean, default: false },
				verify: { type: Boolean, default: false },
			},
			agents: {
				view: { type: Boolean, default: true },
				edit: { type: Boolean, default: false },
				assign: { type: Boolean, default: false },
				suspend: { type: Boolean, default: false },
			},
			products: {
				view: { type: Boolean, default: true },
				approve: { type: Boolean, default: false },
				reject: { type: Boolean, default: false },
				edit: { type: Boolean, default: false },
			},
			orders: {
				view: { type: Boolean, default: true },
				manage: { type: Boolean, default: false },
				refund: { type: Boolean, default: false },
			},
			reports: {
				view: { type: Boolean, default: true },
				generate: { type: Boolean, default: false },
				export: { type: Boolean, default: false },
			},
			system: {
				settings: { type: Boolean, default: false },
				maintenance: { type: Boolean, default: false },
				backup: { type: Boolean, default: false },
			},
		},
		department: {
			type: String,
			enum: [
				"operations",
				"quality_assurance",
				"customer_service",
				"finance",
				"technical",
				"management",
			],
			required: true,
		},
		qualifications: {
			education: {
				degree: String,
				institution: String,
				graduationYear: Number,
				fieldOfStudy: String,
			},
			certifications: [
				{
					name: String,
					issuedBy: String,
					issuedDate: Date,
					validUntil: Date,
					certificateUrl: String,
				},
			],
			experience: {
				totalYears: { type: Number, required: true },
				previousRoles: [
					{
						position: String,
						company: String,
						duration: String,
						responsibilities: String,
					},
				],
			},
		},

		// Performance tracking
		performance: {
			totalApplicationsHandled: { type: Number, default: 0 },
			applicationsApproved: { type: Number, default: 0 },
			applicationsRejected: { type: Number, default: 0 },
			averageProcessingTime: { type: Number, default: 0 }, // in hours
			usersManaged: { type: Number, default: 0 },
			reportsGenerated: { type: Number, default: 0 },
			systemActions: { type: Number, default: 0 },
		},

		// Access and security
		lastLogin: {
			type: Date,
		},
		loginHistory: [
			{
				loginTime: { type: Date, default: Date.now },
				ipAddress: String,
				userAgent: String,
				location: String,
				loginStatus: {
					type: String,
					enum: ["success", "failed", "blocked"],
					default: "success",
				},
			},
		],
		twoFactorAuth: {
			enabled: { type: Boolean, default: false },
			method: {
				type: String,
				enum: ["sms", "email", "authenticator"],
			},
			backupCodes: [String],
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
		canLogin: {
			type: Boolean,
			default: true,
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

		// Activity tracking
		recentActions: [
			{
				action: String,
				targetType: {
					type: String,
					enum: [
						"user",
						"application",
						"seller",
						"agent",
						"product",
						"order",
						"system",
					],
				},
				targetId: String,
				details: String,
				timestamp: { type: Date, default: Date.now },
				ipAddress: String,
			},
		],

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
						"permissions_updated",
						"level_changed",
						"department_changed",
						"deleted",
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
					previousLevel: String,
					newLevel: String,
					previousDepartment: String,
					newDepartment: String,
					permissionsChanged: [String],
					updatedFields: [String],
					editReason: String,
				},
			},
		],
	},
	{ timestamps: true }
);

// Indexes for efficient queries
adminSchema.index({ userId: 1 });
adminSchema.index({ adminId: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ verified: 1 });
adminSchema.index({ canLogin: 1 });
adminSchema.index({ adminLevel: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({
	"operationalArea.region": 1,
	"operationalArea.district": 1,
});
adminSchema.index({ lastLogin: -1 });
adminSchema.index({ createdAt: -1 });
adminSchema.index({ "performance.totalApplicationsHandled": -1 });

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
