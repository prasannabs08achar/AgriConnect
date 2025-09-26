import { User } from "../models/User.model.js";
import {Order} from "../models/Order.model.js";
import {Crop} from "../models/Crop.model.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.js";
import { uploadCloudinary } from "../utils/cloudinary.utils.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addCrop = asyncHandler(async (req, res) => {
    const { name, category, quantity, price, harvestDate, description} = req.body;
    let location;
    try {
        location = JSON.parse(req.body.location);
    } catch (err) {
        throw new ApiError(400, "Invalid location format. Must be a JSON object with type and coordinates.");
    }
    // Validate fields
    if ([name, category, description].some(f => !f?.trim()) || !quantity || !price || !harvestDate) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate images
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "At least one image is required");
    }

    const uploadedImages = [];
    for (const file of req.files) {
        const uploaded = await uploadCloudinary(file.path);
        if (!uploaded?.url) throw new ApiError(500, "Failed to upload image");
        uploadedImages.push(uploaded.url);
    }


    // Create crop
    const crop = await Crop.create({
        name,
        category,
        quantity,
        price,
        harvestDate,
        description,
        location,
        images: uploadedImages,
        farmer: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, crop, "Crop added successfully"));
});


const updateCrop=asyncHandler(async(req,res)=>{
    const crop=await Crop.findById(req.params.id)
    if(!crop){
        throw new ApiError(404,"Crop not found")
    }
    if (crop.farmer.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "Unauthorized Access");
    }
    const { name, category, quantity, price, harvestDate,  description}=req.body
    let location;
    try {
        location = JSON.parse(req.body.location);
    } catch (err) {
        throw new ApiError(400, "Invalid location format. Must be a JSON object with type and coordinates.");
    }
    
    if (req.files && req.files.length > 0) {
        const uploadedImages = [];

        // Loop through all uploaded files
        for (const file of req.files) {
            const uploaded = await uploadCloudinary(file.path);
            if (!uploaded?.url) throw new ApiError(500, "Failed to upload image");
            uploadedImages.push(uploaded.url);
        }

        // Replace old images with new ones
        crop.images = uploadedImages;
    }
    crop.name=name||crop.name
    crop.category=category || crop.category
    crop.quantity=quantity || crop.quantity
    crop.price=price||crop.price
    crop.harvestDate=harvestDate || crop.harvestDate
    crop.description=description || crop.description
    crop.location=location||crop.location
    
    await crop.save()
    return res.status(200).json(new ApiResponse(200,crop,"Crop updated successfully"))

})

const deleteCrop=asyncHandler(async(req,res)=>{
    const crop=await Crop.findById(req.params.id)
    if(!crop){
        throw new ApiError(404,"Crop not found")
    }
    if (crop.farmer.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "Unauthorized Access");
    }
    await crop.deleteOne()
    return res.status(200).json(new ApiResponse(200,"Crop deleted successfully"))
})

// const getFarmerOrders = asyncHandler(async (req, res) => {
//     const orders = await Order.find()
//         .populate({
//             path: "crop",
//             select: "name category price farmer",
//             populate: { path: "farmer", select: "name phone location" }
//         })
//         .populate("buyer", "name phone email");

   
//     const farmerOrders = orders.filter(order =>
//         order.crop?.farmer?._id.toString() === req.user._id.toString()
//     );

//     return res.status(200).json(new ApiResponse(200, farmerOrders, "Orders fetched successfully"));
// });
const getFarmerOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate({
            path: "crop",
            match: { farmer: req.user._id }, // Only crops belonging to this farmer
            select: "name category price farmer",
            populate: { path: "farmer", select: "name phone location" }
        })
        .populate("buyer", "name phone email");

    // Filter out orders where crop did not match (populate with match can result in null)
    const farmerOrders = orders.filter(order => order.crop);

    return res.status(200).json(new ApiResponse(200, farmerOrders, "Orders fetched successfully"));
});



export {addCrop,updateCrop,deleteCrop,getFarmerOrders}
