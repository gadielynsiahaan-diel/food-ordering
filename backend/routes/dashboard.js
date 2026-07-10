const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const dashboardController = require("../controllers/dashboardController");

// ======================================
// DASHBOARD PENJUAL
// GET /api/dashboard
// ======================================

router.get(

    "/",

    auth,

    dashboardController.getDashboard

);

// ======================================

module.exports = router;