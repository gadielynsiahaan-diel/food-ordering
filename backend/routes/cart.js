const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const cartController = require("../controllers/cartController");

// ======================================
// CART ROUTES
// Base URL : /api/cart
// ======================================

// ======================================
// GET CART
// GET /api/cart
// ======================================

router.get(

    "/",

    auth,

    cartController.getCart

);

// ======================================
// ADD TO CART
// POST /api/cart
// ======================================

router.post(

    "/",

    auth,

    cartController.addCart

);

// ======================================
// UPDATE CART
// PUT /api/cart/:id
// ======================================

router.put(

    "/:id",

    auth,

    cartController.updateCart

);

// ======================================
// DELETE CART ITEM
// DELETE /api/cart/:id
// ======================================

router.delete(

    "/:id",

    auth,

    cartController.deleteCart

);

// ======================================
// CLEAR CART
// DELETE /api/cart
// ======================================

router.delete(

    "/",

    auth,

    cartController.clearCart

);

// ======================================
// EXPORT
// ======================================

module.exports = router;