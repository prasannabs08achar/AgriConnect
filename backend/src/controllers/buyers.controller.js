import { Crop } from "../models/Crop.model.js";
import Order from "../models/Order.model.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const searchCrops = asyncHandler(async (req, res) => {
    console.log('Search crops request received:', req.query);
    const { name, category, minPrice, maxPrice } = req.query;

    let query = {};

   
    if (name) {
        query.name = { $regex: new RegExp(name.trim(), "i") };
    }

  
    if (category) {
        query.category = { $regex: new RegExp(category.trim(), "i") };
    }


    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    console.log("Search query:", query);
    const crops = await Crop.find(query);
    console.log("Found crops:", crops.length);

    return res.status(200).json(new ApiResponse(200, crops, "Crops fetched successfully"));
});

const searchNearByCrops=asyncHandler(async(req,res)=>{
    const { lat, lng, maxDistance } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ success: false, message: "lat and lng are required" });
    }
    const distance = maxDistance ? Number(maxDistance) : 50000;//in meters
    const crops = await Crop.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                $maxDistance: distance
            }
        }
    }).populate("farmer","name location phone")
    return res.status(200).json(new ApiResponse(200,crops,"Crops fetched successfully"))
})

const placeOrder = asyncHandler(async (req, res) => {
    console.log(req.body);
    
    const { cropId, quantity} = req.body;

    if (!cropId || !quantity) {
        throw new ApiError(400, "Crop id and quantity are required");
    }
    let buyerLocation, farmerLocation;
    try {
        buyerLocation = JSON.parse(req.body.buyerLocation);
    } catch (err) {
        throw new ApiError(400, "Invalid location format. Must be a JSON object with type and coordinates.");
    }
    try {
        farmerLocation = JSON.parse(req.body.farmerLocation);
    } catch (err) {
        throw new ApiError(400, "Invalid location format. Must be a JSON object with type and coordinates.");
    }
    const crop = await Crop.findById(cropId);
    if (!crop) {
        throw new ApiError(404, "Crop is not available");
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
        throw new ApiError(400, "Quantity must be a positive number");
    }
    if (qty > crop.quantity) {
        throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    // Reduce the crop quantity after successful validation
    const newQuantity = crop.quantity - qty;
    if (newQuantity < 0) {
        throw new ApiError(400, "Insufficient stock available");
    }
    
    crop.quantity = newQuantity;
    await crop.save();
    
    console.log(`Crop ${crop.name} quantity reduced from ${crop.quantity + qty} to ${crop.quantity}`);

    const order = await Order.create({
        crop: crop._id,
        quantity: qty,
        buyer: req.user._id,
        price: crop.price * qty,
        buyerLocation,
        farmerLocation
    });

    return res.status(200).json(new ApiResponse(200, order, "Order placed successfully"));
});


const getBuyerOrdersHistory=asyncHandler(async(req,res)=>{
    const orders=await Order.find({buyer:req.user._id}).populate({
        path:"crop",
        populate:{
            path:"farmer",
            select:"name phone location"
        }
    })
    return res.status(200).json(new ApiResponse(200,orders,"Orders fetched successfully"))
})

const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId).populate('crop');
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    
    // Check if the order belongs to the buyer
    if (order.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "Unauthorized to cancel this order");
    }
    
    // Check if order can be cancelled (e.g., not already completed)
    if (order.status === 'completed') {
        throw new ApiError(400, "Cannot cancel completed order");
    }
    
    // Restore the quantity to the crop
    const crop = order.crop;
    crop.quantity = crop.quantity + order.quantity;
    await crop.save();
    
    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();
    
    console.log(`Order ${orderId} cancelled. Crop ${crop.name} quantity restored from ${crop.quantity - order.quantity} to ${crop.quantity}`);
    
    return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

const getOrdersWithDistance=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    const order=await Order.findById(id).populate("crop","name price").populate("buyer","name location").populate("crop.farmer","name phone location")
    if(!order){
        throw new ApiError(404,"Order not found")
    }
    const[buyerLng,buyerLat]=order.buyerLocation.coordinates;
    const[farmerLng,farmerLat]=order.farmerLocation.coordinates;
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    const distance = calculateDistance(buyerLat, buyerLng, farmerLat, farmerLng);
    return res.status(200).json(new ApiResponse(200,{order,distance:`${distance.toFixed(2)} km}`},"Order details fetched successfully"))
})

export {searchCrops,searchNearByCrops,placeOrder,getBuyerOrdersHistory,getOrdersWithDistance,cancelOrder}