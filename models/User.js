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
		profilePicture: {
			type: String,
			default: "https://i.ibb.co/MBtjqXQ/no-avatar.gif",
		},
		region: {
			type: String,
			required: function () {
				return this.role === "agent";
			},
		},
		verified: {
			type: Boolean,
			default: function () {
				return this.role === "admin" ? true : false;
			},
		},
		warehouseAddress: {
			type: String,
			required: function () {
				return this.role === "agent";
			},
		},
		createdAt: {
			type: Date,
			default: Date.now,
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
