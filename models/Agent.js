import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
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

		// Agent-specific properties
		agentId: {
			type: String,
			unique: true,
			required: true, // Auto-generated agent ID
		},
		specialization: {
			type: [String],
			enum: [
				"crops",
				"livestock",
				"aquaculture",
				"forestry",
				"organic",
				"technology",
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
		languagesSpoken: [String],
		availability: {
			schedule: {
				type: String,
				enum: ["full-time", "part-time", "flexible", "weekends-only"],
				default: "full-time",
			},
			workingHours: {
				start: String, // e.g., "09:00"
				end: String, // e.g., "17:00"
			},
			workingDays: [String], // ["monday", "tuesday", etc.]
		},

		// Performance tracking
		performance: {
			totalApplicationsReviewed: { type: Number, default: 0 },
			applicationsApproved: { type: Number, default: 0 },
			applicationsRejected: { type: Number, default: 0 },
			averageReviewTime: { type: Number, default: 0 }, // in hours
			efficiency: { type: Number, default: 0 }, // percentage
		},
		rating: {
			average: { type: Number, default: 0, min: 0, max: 5 },
			count: { type: Number, default: 0 },
			reviews: [
				{
					reviewerId: { type: String, ref: "User" },
					rating: { type: Number, min: 1, max: 5 },
					comment: String,
					createdAt: { type: Date, default: Date.now },
				},
			],
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
		agentLevel: {
			type: String,
			enum: ["junior", "senior", "lead", "specialist"],
			default: "junior",
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

		// Workload management
		assignedApplications: [
			{
				applicationId: { type: String, ref: "Application" },
				assignedAt: Date,
				status: {
					type: String,
					enum: ["assigned", "in-progress", "completed"],
					default: "assigned",
				},
			},
		],
		maxDailyApplications: {
			type: Number,
			default: 10,
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
						"level_changed",
						"workload_updated",
						"specialization_updated",
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
					updatedFields: [String],
					editReason: String,
				},
			},
		],
	},
	{ timestamps: true }
);

// Indexes for efficient queries
agentSchema.index({ userId: 1 });
agentSchema.index({ agentId: 1 });
agentSchema.index({ email: 1 });
agentSchema.index({ isActive: 1 });
agentSchema.index({ verified: 1 });
agentSchema.index({
	"operationalArea.region": 1,
	"operationalArea.district": 1,
});
agentSchema.index({ specialization: 1 });
agentSchema.index({ agentLevel: 1 });
agentSchema.index({ "performance.efficiency": -1 });
agentSchema.index({ "rating.average": -1 });
agentSchema.index({ createdAt: -1 });
agentSchema.index({ "assignedApplications.status": 1 });

const Agent = mongoose.model("Agent", agentSchema);
export default Agent;
