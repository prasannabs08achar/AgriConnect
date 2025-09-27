import asyncHandler from "../utils/asyncHandler.utils.js"
import { User } from "../models/User.model.js";
import {ApiResponse} from '../utils/apiResponse.js'
import { ApiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return {
            accessToken, refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "Error occoured while generating token")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    // console.log(req.body);

    if ([name, email, password,role].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
      email
    });


    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }


   

    const user = await User.create({
        name,
        email,
        password,
        role

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating a user");
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User Registered Successfully")
    );


});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password} = req.body;
    // console.log(req.body);

    if (!email) {
        throw new ApiError(400, "Username or Email must be required");
    }
    const user = await User.findOne({
        email
    })
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Password is not valid");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false // Set to false for development
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200, {
            user: loggedInUser, accessToken, refreshToken
        },
            "User logged in Successfully"
        )
    )


})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        })
    const options = {
        httpOnly: true,
        secure: false // Set to false for development
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out succesfully "))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incommingRefreshToken) {
        throw new ApiError(401, "unauthorized access")
    }
    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret');

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Not a valid token")
        }
        const options = {
            httpOnly: true,
            secure: false // Set to false for development
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(200, {
            accessToken, refreshToken: newRefreshToken,
        }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(400, error?.message || "Refresh Access token failed")
    }


})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(401, "User not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Give proper password")
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed succesfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Get User data successfully"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const {name, email } = req.body
    if (!name || !email) {
        throw new ApiError(400, "Fields must be required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            name,
            email
        }
    }, { new: true }).select("-password")
    return res.status(200).json(
        new ApiResponse(200, user, "Account updated successfully")
    )
})


export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails}
