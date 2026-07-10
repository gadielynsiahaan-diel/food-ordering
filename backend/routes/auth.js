const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const upload = require("../middleware/upload");

const authController = require("../controllers/authController");

// ======================================
// AUTH ROUTES
// Base URL : /api/auth
// ======================================

// ======================================
// REGISTER
// POST /api/auth/register
// ======================================

router.post(

    "/register",

    authController.register

);

// ======================================
// LOGIN
// POST /api/auth/login
// ======================================

router.post(

    "/login",

    authController.login

);

// ======================================
// GET PROFILE
// GET /api/auth/profile
// ======================================

router.get(

    "/profile",

    auth,

    authController.getProfile

);

// ======================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ======================================

router.put(

    "/profile",

    auth,

    upload.single("foto"),

    authController.updateProfile

);

// ======================================
// EXPORT
// ======================================

module.exports = router;