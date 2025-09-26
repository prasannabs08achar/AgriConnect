import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { searchCrops,searchNearByCrops,placeOrder,getBuyerOrdersHistory,getOrdersWithDistance } from "../controllers/buyers.controller.js";
const router = Router();

router.route('/search-crops').get(searchCrops);
router.route('/search-nearby-crops').get(searchNearByCrops);
router.route('/place-order').post(verifyJWT,placeOrder);
router.route('/get-buyer-orders-history').get(verifyJWT,getBuyerOrdersHistory);
router.route('/get-orders-with-distance/:id').get(verifyJWT,getOrdersWithDistance);
export default router
