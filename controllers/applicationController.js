import Application from "../models/applicationModel.js";
import User from "../models/User.js"; // Assuming User model path

// Submit a new application
export const submitApplication = async (req, res) => {
	try {
		const { applicationType, applicantId } = req.body;

		const previousApplication = await Application.findOne({
			applicantId: applicantId,
			applicationType: applicationType,
		});

		if (previousApplication) {
			if (previousApplication?.status === "approved") {
				return res
					.status(400)
					.json({ success: false, message: "Application already approved" });
			} else if (previousApplication?.status === "rejected") {
				return res
					.status(400)
					.json({ success: false, message: "Application already rejected" });
			} else if (previousApplication?.status === "in-review") {
				return res
					.status(400)
					.json({ success: false, message: "Application already in review" });
			}
			return res
				.status(400)
				.json({
					success: false,
					message:
						"Your Application is pending. Don't make duplicate applications.",
				});
		}

		const newApplication = new Application({
			...req.body,
		});

		await newApplication.save();
		res.status(201).json({
			success: true,
			message: "Application submitted successfully!",
			application: newApplication,
		});
	} catch (error) {
		console.error("Error submitting application:", error);
		res.status(500).json({
			success: false,
			message: "Server error while submitting application.",
			error: error.message,
		});
	}
};

// Get all applications for the logged-in user
export const getMyApplications = async (req, res) => {
	try {
		const applications = await Application.find({
			applicantId: req.decoded.id,
		}).sort({ createdAt: -1 });
		res.json({ success: true, applications });
	} catch (error) {
		console.error("Error fetching user applications:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching applications.",
			error: error.message,
		});
	}
};

// Get a specific application by ID (user must own it or be admin)
export const getApplicationById = async (req, res) => {
	try {
		const application = await Application.findById(req.params.id);
		if (!application) {
			return res
				.status(404)
				.json({ success: false, message: "Application not found." });
		}

		// Check if the logged-in user is the owner or an admin
		if (
			application.applicantId !== req.decoded.id &&
			req.decoded.role !== "admin"
		) {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to view this application.",
			});
		}
		res.json({ success: true, application });
	} catch (error) {
		console.error("Error fetching application by ID:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error.", error: error.message });
	}
};

// Get all applications (for admins/reviewers)
export const getAllApplications = async (req, res) => {
	try {
		const { status, type, page = 1, limit = 10 } = req.query;
		const query = {};
		if (status) query.status = status;
		if (type) query.applicationType = type;

		const applications = await Application.find(query)
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();

		const count = await Application.countDocuments(query);

		res.json({
			success: true,
			applications,
			totalPages: Math.ceil(count / limit),
			currentPage: parseInt(page),
			totalApplications: count,
		});
	} catch (error) {
		console.error("Error fetching all applications:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error.", error: error.message });
	}
};

// Update application status (for admins/reviewers)
export const updateApplicationStatus = async (req, res) => {
	try {
		const { status, reviewNotes } = req.body;
		const reviewerId = req.decoded.id;

		if (!["pending", "approved", "rejected", "in-review"].includes(status)) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid status value." });
		}

		const application = await Application.findById(req.params.id);
		if (!application) {
			return res
				.status(404)
				.json({ success: false, message: "Application not found." });
		}

		application.status = status;

		// Add review metadata
		application.reviewedAt = new Date();
		application.reviewedBy = reviewerId;
		if (reviewNotes) {
			application.reviewNotes = reviewNotes;
		}

		// If approved, update user role
		if (status === "approved") {
			const userToUpdate = await User.findById(application.applicantId);
			if (userToUpdate) {
				let newRole = userToUpdate.role;
				if (application.applicationType === "seller-application")
					newRole = "seller";
				else if (application.applicationType === "agent-application")
					newRole = "agent";
				else if (application.applicationType === "admin-application")
					newRole = "admin";

				userToUpdate.role = newRole;

				// If agent application, also update region based on operationalArea
				if (application.applicationType === "agent-application") {
					userToUpdate.region = application.operationalArea.region;
					userToUpdate.district = application.operationalArea.district;
				}

				await userToUpdate.save();
				console.log(
					`Application ${application._id} approved. User ${application.applicantId} role updated to ${newRole}.`
				);
			}
		}

		await application.save();
		res.json({
			success: true,
			message: "Application status updated.",
			application,
		});
	} catch (error) {
		console.error("Error updating application status:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error.", error: error.message });
	}
};

// Add a note to an application (for admins/reviewers)
export const addApplicationNote = async (req, res) => {
	try {
		const { noteText } = req.body;
		const application = await Application.findById(req.params.id);

		if (!application) {
			return res
				.status(404)
				.json({ success: false, message: "Application not found." });
		}
		if (!noteText) {
			return res
				.status(400)
				.json({ success: false, message: "Note text is required." });
		}

		// Add note to formData or create a notes array
		if (!application.reviewNotes) {
			application.reviewNotes = noteText;
		} else {
			application.reviewNotes += `\n${new Date().toISOString()}: ${noteText}`;
		}

		await application.save();
		res.json({
			success: true,
			message: "Note added successfully.",
			application,
		});
	} catch (error) {
		console.error("Error adding note to application:", error);
		res.status(500).json({
			success: false,
			message: "Server error while adding note.",
			error: error.message,
		});
	}
};
