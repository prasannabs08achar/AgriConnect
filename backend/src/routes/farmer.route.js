import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addCrop,updateCrop,deleteCrop,getFarmerOrders } from "../controllers/farmers.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route('/add-crop').post(verifyJWT,upload.array("images"),addCrop);
router.route('/update-crop/:id').post(verifyJWT,upload.array("images"),updateCrop);
router.route('/delete-crop/:id').delete(verifyJWT,deleteCrop);
router.route('/get-farmer-orders').get(verifyJWT,getFarmerOrders);
export default router
