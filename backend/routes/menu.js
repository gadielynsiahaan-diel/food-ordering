const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const upload = require("../middleware/upload");

const menuController = require("../controllers/menuController");

// ======================================
// MENU ROUTES
// Base URL : /api/menu
// ======================================

// ======================================
// MENU PEMBELI
// GET /api/menu/tenant/:tenantId
// ======================================

router.get(

    "/tenant/:tenantId",

    menuController.getMenuByTenant

);

// ======================================
// CREATE MENU
// POST /api/menu
// ======================================

router.post(

    "/",

    auth,

    (req,res,next)=>{

        console.log("====== ROUTE ======");

        console.log(req.headers["content-type"]);

        next();

    },

    upload.single("gambar"),

    menuController.createMenu

);

// ======================================
// GET MY MENU
// GET /api/menu/my
// ======================================

router.get(

    "/my",

    auth,

    menuController.getMyMenu

);

// ======================================
// GET MENU BY ID
// GET /api/menu/:id
// ======================================

router.get(

    "/:id",

    auth,

    menuController.getMenuById

);

// ======================================
// UPDATE MENU
// PUT /api/menu/:id
// ======================================

router.put(

    "/:id",

    auth,

    upload.single("gambar"),

    menuController.updateMenu

);

// ======================================
// DELETE MENU
// DELETE /api/menu/:id
// ======================================

router.delete(

    "/:id",

    auth,

    menuController.deleteMenu

);

// ======================================
// EXPORT
// ======================================

module.exports = router;