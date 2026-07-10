const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const paymentController = require("../controllers/paymentController");

// ======================================
// PAYMENT ROUTES
// Base URL : /api/payment
// ======================================

// ======================================
// CREATE PAYMENT
// POST /api/payment
// ======================================

router.post(

    "/",

    auth,

    paymentController.createPayment

);

// ======================================
// GET PAYMENT BY ORDER
// GET /api/payment/order/:orderId
// ======================================

router.get(

    "/order/:orderId",

    auth,

    paymentController.getPayment

);

// ======================================
// MY PAYMENT HISTORY
// GET /api/payment/my
// ======================================

router.get(

    "/my",

    auth,

    paymentController.getMyPayments

);

// ======================================
// SELLER PAYMENT HISTORY
// GET /api/payment/seller
// ======================================

router.get(

    "/seller",

    auth,

    paymentController.getSellerPayments

);

// ======================================
// VERIFY PAYMENT
// PUT /api/payment/:id/verify
// ======================================

router.put(

    "/:id/verify",

    auth,

    paymentController.verifyPayment

);

// ======================================
// EXPORT
// ======================================

module.exports = router;