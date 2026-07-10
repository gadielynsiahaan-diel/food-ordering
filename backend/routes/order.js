const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const orderController = require("../controllers/orderController");

// ======================================
// ORDER ROUTES
// Base URL : /api/order
// ======================================

// ======================================
// CREATE ORDER
// POST /api/order
// ======================================

router.post(

    "/",

    auth,

    orderController.createOrder

);

// ======================================
// PEMBELI
// ======================================

// GET /api/order/my

router.get(

    "/my",

    auth,

    orderController.getMyOrders

);

// GET /api/order/detail/:id

router.get(

    "/detail/:id",

    auth,

    orderController.getOrderDetail

);

// ======================================
// PENJUAL
// ======================================

// GET /api/order/seller

router.get(

    "/seller",

    auth,

    orderController.getSellerOrders

);

// GET /api/order/seller/:id

router.get(

    "/seller/:id",

    auth,

    orderController.getSellerOrderDetail

);

// PUT /api/order/:id/status

router.put(

    "/:id/status",

    auth,

    orderController.updateOrderStatus

);

// ======================================
// EXPORT
// ======================================

module.exports = router;