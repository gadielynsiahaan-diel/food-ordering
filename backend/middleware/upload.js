const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        let folder = "tenant";

        if (file.fieldname === "gambar") {
            folder = "menu";
        }

        if (file.fieldname === "foto") {
            folder = "profile";
        }

        if (
            file.fieldname === "logo" ||
            file.fieldname === "banner"
        ) {
            folder = "tenant";
        }

        return {
            folder: `food-ordering/${folder}`,
            allowed_formats: ["jpg", "jpeg", "png", "webp"]
        };
    }
});

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

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
