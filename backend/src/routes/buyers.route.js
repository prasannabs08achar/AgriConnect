import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { searchCrops,searchNearByCrops,placeOrder,getBuyerOrdersHistory,getOrdersWithDistance,cancelOrder } from "../controllers/buyers.controller.js";
const router = Router();

router.route('/search-crops').get(verifyJWT, searchCrops);
router.route('/search-nearby-crops').get(verifyJWT, searchNearByCrops);
router.route('/place-order').post(verifyJWT,placeOrder);
router.route('/get-buyer-orders-history').get(verifyJWT,getBuyerOrdersHistory);
router.route('/get-orders-with-distance/:id').get(verifyJWT,getOrdersWithDistance);
router.route('/cancel-order/:orderId').post(verifyJWT,cancelOrder);
export default router
