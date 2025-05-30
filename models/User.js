import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: false, // Not required for OAuth users
		},
		provider: {
			type: String,
			enum: ["email-pass", "google", "facebook", "github", "twitter"],
			default: "email-pass",
		},
		role: {
			type: String,
			enum: ["admin", "agent", "seller", "consumer"],
			default: "consumer",
		},
		phoneNumber: {
			type: String,
			required: false,
			trim: true,
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
			required: false,
			trim: true,
		},
		profilePicture: {
			type: String,
			default: "https://i.ibb.co/MBtjqXQ/no-avatar.gif",
		},
		operationalArea: {
			type: Object,
			region: { type: String, default: "" },
			district: { type: String, default: "" },
		},
		verified: {
			type: Boolean,
		},
		warehouseAddress: {
			type: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		firebaseUID: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("User", userSchema);
