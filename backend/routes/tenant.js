const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const upload = require("../middleware/upload");

const tenantController = require("../controllers/tenantController");

// ======================================
// CREATE TENANT
// ======================================

router.post(

    "/",

    auth,

    upload.fields([

        {

            name: "logo",

            maxCount: 1

        },

        {

            name: "banner",

            maxCount: 1

        }

    ]),

    tenantController.createTenant

);

// ======================================
// GET MY TENANT
// ======================================

router.get(

    "/me",

    auth,

    tenantController.getMyTenant

);

// ======================================
// UPDATE TENANT
// ======================================

router.put(

    "/:id",

    auth,

    upload.fields([

        {

            name: "logo",

            maxCount: 1

        },

        {

            name: "banner",

            maxCount: 1

        }

    ]),

    tenantController.updateTenant

);

// ======================================
// GET TENANT BY ID
// ======================================

router.get(

    "/:id",

    tenantController.getTenantById

);

// ======================================
// GET ALL TENANT
// ======================================

router.get(

    "/",

    tenantController.getAllTenant

);

module.exports = router;