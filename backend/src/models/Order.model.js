import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    buyerLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: { type: [Number], required: true },
    },
    farmerLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: { type: [Number], required: true },
    },
},{timestamps:true});
orderSchema.index({ buyerLocation: "2dsphere" });
orderSchema.index({ farmerLocation: "2dsphere" });
export const Order = mongoose.model("Order", orderSchema);
export default Order; 
