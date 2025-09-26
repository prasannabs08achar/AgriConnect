import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ["fruit", "vegetable", "grain", "pulse", "spice", "flower", "herb", "other"], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    harvestDate: { type: Date, required: true },
    images: [String],
    description:{type: String, required: true},
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

cropSchema.index({ location: "2dsphere" });
export const Crop = mongoose.model("Crop", cropSchema)

