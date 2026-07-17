const multer = require("multer");

const cloudinary = require("../config/cloudinary");

const {

    CloudinaryStorage

} = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({

    cloudinary,

    params: async (req, file) => {

        let folder = "food-ordering";

        if(file.fieldname==="gambar"){

            folder = "menu";

        }

        if(file.fieldname==="logo"){

            folder = "tenant";

        }

        if(file.fieldname==="banner"){

            folder = "tenant";

        }

        if(file.fieldname==="foto"){

            folder = "profile";

        }

        return {

            folder,

            allowed_formats:[

                "jpg",

                "jpeg",

                "png",

                "webp"

            ]

        };

    }

});


module.exports = multer({

    storage,

    limits:{

        fileSize:5*1024*1024

    }

});
