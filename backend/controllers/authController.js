const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");

// ======================================
// REGISTER
// ======================================

exports.register = async (req, res) => {

    try {

        let {
            nama,
            email,
            password,
            role
        } = req.body;

        // ======================================
        // VALIDASI INPUT
        // ======================================

        if (!nama || !email || !password || !role) {

            return res.status(400).json({
                success: false,
                message: "Semua data wajib diisi."
            });

        }

        nama = nama.trim();
        email = email.trim().toLowerCase();
        password = password.trim();

        // ======================================
        // VALIDASI NAMA
        // ======================================

        if (nama.length < 3) {

            return res.status(400).json({
                success: false,
                message: "Nama minimal 3 karakter."
            });

        }

        // ======================================
        // VALIDASI EMAIL
        // ======================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message: "Format email tidak valid."
            });

        }

        // ======================================
        // VALIDASI PASSWORD
        // ======================================

        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter."
            });

        }

        // ======================================
        // VALIDASI ROLE
        // ======================================

        const roleValid = [
            "buyer",
            "seller"
        ];

        if (!roleValid.includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Role tidak valid."
            });

        }

        // ======================================
        // CEK EMAIL
        // ======================================

        const [cekUser] = await db.query(
            `SELECT id
            FROM users
            WHERE email=?`,
            [email]
        );

        if (cekUser.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar."
            });

        }

        // ======================================
        // HASH PASSWORD
        // ======================================

        const hashPassword =
            await bcrypt.hash(password, 10);

        // ======================================
        // SIMPAN USER
        // ======================================

        const [result] = await db.query(
            `INSERT INTO users
            (
                nama,
                email,
                password,
                role
            )
            VALUES
            (?,?,?,?)`,
            [
                nama,
                email,
                hashPassword,
                role
            ]
        );

        // ======================================
        // KIRIM EMAIL
        // ======================================

        try {

            await emailService.sendWelcomeEmail(
                nama,
                email
            );

            console.log("✅ Email berhasil dikirim ke", email);

        } catch (emailError) {

            console.log("❌ Gagal kirim email");

            console.error(emailError);

        }

        // ======================================
        // RESPONSE
        // ======================================

        return res.status(201).json({

            success: true,

            message: "Registrasi berhasil.",

            user: {

                id: result.insertId,

                nama,

                email,

                role

            }

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Terjadi kesalahan pada server."

        });

    }

};

// ======================================
// LOGIN
// ======================================

exports.login = async (req, res) => {

    try {

        let {
            email,
            password
        } = req.body;

        // ======================================
        // VALIDASI INPUT
        // ======================================

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email dan password wajib diisi."

            });

        }

        email = email.trim().toLowerCase();

        password = password.trim();

        // ======================================
        // CEK JWT SECRET
        // ======================================

        if (!process.env.JWT_SECRET) {

            return res.status(500).json({

                success: false,

                message: "JWT Secret belum dikonfigurasi."

            });

        }

        // ======================================
        // CARI USER
        // ======================================

        const [rows] = await db.query(

            `SELECT

                id,

                nama,

                email,

                password,

                role,

                foto

            FROM users

            WHERE email=?`,

            [email]

        );

        if (rows.length === 0) {

            return res.status(400).json({

                success: false,

                message: "Email tidak ditemukan."

            });

        }

        const user = rows[0];

        // ======================================
        // CEK PASSWORD
        // ======================================

        const cocok = await bcrypt.compare(

            password,

            user.password

        );

        if (!cocok) {

            return res.status(400).json({

                success: false,

                message: "Password salah."

            });

        }

        // ======================================
        // GENERATE JWT
        // ======================================

        const token = jwt.sign(

            {

                id: user.id,

                role: user.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        // ======================================
        // RESPONSE
        // ======================================

        return res.status(200).json({

            success: true,

            message: "Login berhasil.",

            token,

            user: {

                id: user.id,

                nama: user.nama,

                email: user.email,

                role: user.role,

                foto: user.foto || null

            }

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Terjadi kesalahan pada server."

        });

    }

};

// ======================================
// GET PROFILE
// ======================================

exports.getProfile = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT

                id,

                nama,

                email,

                role,

                foto

            FROM users

            WHERE id=?`,

            [

                req.user.id

            ]

        );

        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "User tidak ditemukan."

            });

        }

        return res.status(200).json({

            success: true,

            user: rows[0]

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Terjadi kesalahan pada server."

        });

    }

};

// ======================================
// UPDATE PROFILE
// ======================================

exports.updateProfile = async (req, res) => {

    try {

        let {

            nama,

            email,

            password

        } = req.body;

        nama = (nama || "").trim();

        email = (email || "").trim().toLowerCase();

        // ===============================
        // VALIDASI
        // ===============================

        if (!nama || !email) {

            return res.status(400).json({

                success: false,

                message: "Nama dan email wajib diisi."

            });

        }

        // ===============================
        // FOTO
        // ===============================

        let foto = null;

        if (req.file) {

            foto =

                "/uploads/profile/" +

                req.file.filename;

        }

        // ===============================
        // EMAIL SUDAH DIPAKAI?
        // ===============================

        const [cekEmail] = await db.query(

            `SELECT id

            FROM users

            WHERE email=?

            AND id<>?`,

            [

                email,

                req.user.id

            ]

        );

        if (cekEmail.length > 0) {

            return res.status(400).json({

                success: false,

                message: "Email sudah digunakan."

            });

        }

        // ===============================
        // PASSWORD
        // ===============================

        let query =

            `UPDATE users

            SET

            nama=?,

            email=?`;

        let params = [

            nama,

            email

        ];

        if (

            password &&

            password.trim() !== ""

        ) {

            const hash =

                await bcrypt.hash(

                    password,

                    10

                );

            query +=

                ", password=?";

            params.push(hash);

        }

        if (foto) {

            query +=

                ", foto=?";

            params.push(foto);

        }

        query +=

            " WHERE id=?";

        params.push(req.user.id);

        await db.query(

            query,

            params

        );

        const [rows] = await db.query(

            `SELECT

                id,

                nama,

                email,

                role,

                foto

            FROM users

            WHERE id=?`,

            [

                req.user.id

            ]

        );

        return res.status(200).json({

            success: true,

            message: "Profile berhasil diperbarui.",

            user: rows[0]

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Terjadi kesalahan pada server."

        });

    }

};