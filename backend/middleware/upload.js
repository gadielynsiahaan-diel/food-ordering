const multer = require("multer");

const path = require("path");

const fs = require("fs");

// ======================================
// STORAGE
// ======================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        let folder = "tenant";

        // ======================================
        // FOTO MENU
        // ======================================

        if (

            file.fieldname === "gambar"

        ) {

            folder = "menu";

        }

        // ======================================
        // FOTO PROFILE
        // ======================================

        if (

            file.fieldname === "foto"

        ) {

            folder = "profile";

        }

        // ======================================
        // TENANT
        // ======================================

        if (

            file.fieldname === "logo" ||

            file.fieldname === "banner"

        ) {

            folder = "tenant";

        }

        const uploadPath = path.join(

            __dirname,

            `../uploads/${folder}`

        );

        if (

            !fs.existsSync(uploadPath)

        ) {

            fs.mkdirSync(

                uploadPath,

                {

                    recursive: true

                }

            );

        }

        cb(

            null,

            uploadPath

        );

    },

    // ======================================
    // NAMA FILE
    // ======================================

    filename: function (

        req,

        file,

        cb

    ) {

        const ext =

            path.extname(

                file.originalname

            );

        const filename =

            Date.now() +

            "-" +

            Math.round(

                Math.random() *

                1000000000

            ) +

            ext;

        cb(

            null,

            filename

        );

    }

});

// ======================================
// FILTER
// ======================================

const fileFilter = (

    req,

    file,

    cb

) => {

    const allowed = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];

    if (

        allowed.includes(

            file.mimetype

        )

    ) {

        cb(

            null,

            true

        );

    }

    else {

        cb(

            new Error(

                "File harus berupa JPG, PNG atau WEBP."

            ),

            false

        );

    }

};

// ======================================
// EXPORT
// ======================================

module.exports = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:

            5 *

            1024 *

            1024

    }

});