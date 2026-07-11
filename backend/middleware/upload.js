const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ======================================
// STORAGE CLOUDINARY
// ======================================

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        let folder = "food-ordering/tenant";

        if (file.fieldname === "gambar") {
            folder = "food-ordering/menu";
        }

        if (file.fieldname === "foto") {
            folder = "food-ordering/profile";
        }

        return {
            folder,
            allowed_formats: ["jpg", "jpeg", "png", "webp"]
        };
    }
});

// ======================================
// FILTER
// ======================================

const fileFilter = (req, file, cb) => {

    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File harus berupa JPG, PNG atau WEBP."), false);
    }

};

// ======================================
// EXPORT
// ======================================

module.exports = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});
