const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const reviewController = require("../controllers/reviewController");

// ======================================
// REVIEW ROUTES
// Base URL : /api/review
// ======================================

// ======================================
// CREATE REVIEW
// POST /api/review
// ======================================

router.post(

    "/",

    auth,

    reviewController.createReview

);

// ======================================
// GET REVIEW BY ORDER
// GET /api/review/:orderId
// ======================================

router.get(

    "/:orderId",

    auth,

    reviewController.getReviewByOrder

);

// ======================================
// EXPORT
// ======================================

module.exports = router;