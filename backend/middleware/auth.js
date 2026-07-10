const jwt = require("jsonwebtoken");

// ======================================
// AUTH MIDDLEWARE
// ======================================

module.exports = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Authorization token tidak ditemukan."

            });

        }

        // ======================================
        // SUPPORT
        // Authorization: Bearer TOKEN
        // Authorization: TOKEN
        // ======================================

        let token = authHeader;

        if (authHeader.startsWith("Bearer ")) {

            token = authHeader.substring(7);

        }

        if (!token) {

            return res.status(401).json({

                success: false,

                message: "Token tidak valid."

            });

        }

        if (!process.env.JWT_SECRET) {

            return res.status(500).json({

                success: false,

                message: "JWT_SECRET belum dikonfigurasi."

            });

        }

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        req.user = {

            id: decoded.id,

            nama: decoded.nama,

            email: decoded.email,

            role: decoded.role

        };

        next();

    }

    catch (err) {

        console.warn("JWT Error :", err.message);

        if (err.name === "TokenExpiredError") {

            return res.status(401).json({

                success: false,

                message: "Token telah kedaluwarsa."

            });

        }

        if (err.name === "JsonWebTokenError") {

            return res.status(401).json({

                success: false,

                message: "Token tidak valid."

            });

        }

        return res.status(401).json({

            success: false,

            message: "Autentikasi gagal."

        });

    }

};