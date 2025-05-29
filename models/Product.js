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
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: [
        "gram",
        "kg",
        "quintal",
        "liter",
        "piece",
        "dozen",
        "bundle",
        "feet",
      ],
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
    harvestedOn: {
      type: Date,
      required: true,
    },
    sellerInfo: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      operationalArea: {
        region: { type: String, required: true },
        district: { type: String, required: true },
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold_out"],
      default: "pending",
    },
    quality: {
      type: String,
      enum: ["A", "B", "C", "D"],
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

// Useful indexes
productSchema.index({ cropType: 1 });
productSchema.index({ "sellerInfo.region": 1 });
productSchema.index({ "sellerInfo.district": 1 });
productSchema.index({ status: 1 });
productSchema.index({ pricePerUnit: 1 });

export default mongoose.model("Product", productSchema);
