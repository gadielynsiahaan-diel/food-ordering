const db = require("../config/db");

const fs = require("fs");

const path = require("path");

// ======================================
// DEFAULT IMAGE
// ======================================

const DEFAULT_LOGO =
"/uploads/tenant/default-logo.png";

const DEFAULT_BANNER =
"/uploads/tenant/default-banner.jpg";

// ======================================
// DELETE FILE
// ======================================

const deleteFile = (filePath) => {

    try {

        if (!filePath) return;

        // jangan hapus gambar default
        if (
            filePath.includes("default-logo") ||
            filePath.includes("default-banner")
        ) {
            return;
        }

        const fullPath = path.join(
            __dirname,
            "..",
            filePath
        );

        if (fs.existsSync(fullPath)) {

            fs.unlinkSync(fullPath);

        }

    } catch (err) {

        console.log("Gagal menghapus file:", err.message);

    }

};

// ======================================
// CREATE TENANT
// ======================================

exports.createTenant = async (req, res) => {

    try {

        // ======================================
        // HANYA SELLER
        // ======================================

        if (req.user.role !== "seller") {

            return res.status(403).json({

                success: false,

                message: "Hanya penjual yang dapat membuat tenant."

            });

        }

        let {

            nama,

            kategori,

            deskripsi,

            jam_buka,

            jam_tutup,

            status

        } = req.body;

        // ======================================
        // VALIDASI FILE UPLOAD
        // ======================================

        const allowedMimeTypes = [

            "image/png",

            "image/jpeg",

            "image/jpg",

            "image/webp"

        ];

        const maxFileSize = 5 * 1024 * 1024;

        // Logo
        if (

            req.files &&

            req.files.logo &&

            req.files.logo.length > 0

        ) {

            const file = req.files.logo[0];

            if (

                !allowedMimeTypes.includes(file.mimetype)

            ) {

                return res.status(400).json({

                    success: false,

                    message: "Logo harus berupa PNG, JPG, JPEG, atau WEBP."

                });

            }

            if (

                file.size > maxFileSize

            ) {

                return res.status(400).json({

                    success: false,

                    message: "Ukuran logo maksimal 5 MB."

                });

            }

        }

        // Banner
        if (

            req.files &&

            req.files.banner &&

            req.files.banner.length > 0

        ) {

            const file = req.files.banner[0];

            if (

                !allowedMimeTypes.includes(file.mimetype)

            ) {

                return res.status(400).json({

                    success: false,

                    message: "Banner harus berupa PNG, JPG, JPEG, atau WEBP."

                });

            }

            if (

                file.size > maxFileSize

            ) {

                return res.status(400).json({

                    success: false,

                    message: "Ukuran banner maksimal 5 MB."

                });

            }

        }

        // ======================================
        // VALIDASI INPUT
        // ======================================

        if (

            !nama ||

            !kategori ||

            !jam_buka ||

            !jam_tutup ||

            !status

        ) {

            return res.status(400).json({

                success: false,

                message: "Semua data wajib diisi."

            });

        }

        nama = nama.trim();

        kategori = kategori.trim();

        deskripsi = deskripsi ? deskripsi.trim() : "";

        if (nama.length < 3) {

            return res.status(400).json({

                success: false,

                message: "Nama tenant minimal 3 karakter."

            });

        }

        if (jam_buka >= jam_tutup) {

            return res.status(400).json({

                success: false,

                message: "Jam tutup harus lebih besar dari jam buka."

            });

        }

        const statusValid = [

            "open",

            "close"

        ];

        if (!statusValid.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Status tenant tidak valid."

            });

        }

        // ======================================
        // CEK SUDAH PUNYA TENANT
        // ======================================

        const [cekTenant] = await db.query(

            `SELECT id
             FROM tenants
             WHERE user_id=?`,

            [

                req.user.id

            ]

        );

        if (cekTenant.length > 0) {

            return res.status(400).json({

                success: false,

                message: "Anda sudah memiliki tenant."

            });

        }

        // ======================================
        // CEK NAMA TENANT
        // ======================================

        const [cekNama] = await db.query(

            `SELECT id
             FROM tenants
             WHERE LOWER(nama)=LOWER(?)`,

            [

                nama

            ]

        );

        if (cekNama.length > 0) {

            return res.status(400).json({

                success: false,

                message: "Nama tenant sudah digunakan."

            });

        }

        // ======================================
        // UPLOAD LOGO
        // ======================================

        let logo = DEFAULT_LOGO;

        if (

            req.files &&

            req.files.logo &&

            req.files.logo.length > 0

        ) {

            logo = req.files.logo[0].path;

        }

        // ======================================
        // UPLOAD BANNER
        // ======================================

        let banner = DEFAULT_BANNER;

        if (

            req.files &&

            req.files.banner &&

            req.files.banner.length > 0

        ) {

            banner = req.files.banner[0].path;

        }

        // ======================================
        // INSERT DATABASE
        // ======================================

        let result;

        try {

            [result] = await db.query(

                `INSERT INTO tenants

                (

                    user_id,

                    nama,

                    kategori,

                    deskripsi,

                    logo,

                    banner,

                    jam_buka,

                    jam_tutup,

                    status

                )

                VALUES

                (?,?,?,?,?,?,?,?,?)`,

                [

                    req.user.id,

                    nama,

                    kategori,

                    deskripsi,

                    logo,

                    banner,

                    jam_buka,

                    jam_tutup,

                    status

                ]

            );

        }

        catch (dbError) {

            // ======================================
            // ROLLBACK FILE
            // ======================================

            if (

                logo !== DEFAULT_LOGO

            ) {

                deleteFile(logo);

            }

            if (

                banner !== DEFAULT_BANNER

            ) {

                deleteFile(banner);

            }

            throw dbError;

        };

        return res.status(201).json({

            success: true,

            message: "Tenant berhasil dibuat.",

            tenant: {

                id: result.insertId,

                nama,

                kategori,

                logo,

                banner,

                status

            }

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
// GET MY TENANT
// ======================================

exports.getMyTenant = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT

                id,

                user_id,

                nama,

                kategori,

                deskripsi,

                logo,

                banner,

                jam_buka,

                jam_tutup,

                estimasi_waktu,

                minimal_pesanan,

                rating,

                total_review,

                status,

                created_at,

                updated_at

            FROM tenants

            WHERE user_id = ?

            LIMIT 1`,

            [

                req.user.id

            ]

        );

        // ==========================
        // BELUM PUNYA TENANT
        // ==========================

        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Tenant belum dibuat."

            });

        }

        // ==========================
        // BERHASIL
        // ==========================

        return res.status(200).json({

            success: true,

            tenant: rows[0]

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
// GET TENANT BY ID
// ======================================

exports.getTenantById = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT

                id,

                nama,

                kategori,

                deskripsi,

                logo,

                banner,

                jam_buka,

                jam_tutup,

                estimasi_waktu,

                minimal_pesanan,

                rating,

                total_review,

                status

            FROM tenants

            WHERE id=?`,

            [

                req.params.id

            ]

        );

        if (rows.length === 0) {

            return res.status(404).json({

                success:false,

                message:"Tenant tidak ditemukan."

            });

        }

        return res.json(rows[0]);

    }

    catch(err){

        console.error(err);

        return res.status(500).json({

            success:false,

            message:"Server Error."

        });

    }

};

// ======================================
// UPDATE TENANT
// ======================================

exports.updateTenant = async (req, res) => {

    try {

        // ======================================
        // HANYA SELLER
        // ======================================

        if (req.user.role !== "seller") {

            return res.status(403).json({

                success: false,

                message: "Hanya penjual yang dapat mengubah tenant."

            });

        }

        let {

            nama,

            kategori,

            deskripsi,

            jam_buka,

            jam_tutup,

            status

        } = req.body;

        // ======================================
        // VALIDASI INPUT
        // ======================================

        if (

            !nama ||

            !kategori ||

            !jam_buka ||

            !jam_tutup ||

            !status

        ) {

            return res.status(400).json({

                success: false,

                message: "Semua data wajib diisi."

            });

        }

        nama = nama.trim();

        kategori = kategori.trim();

        deskripsi = deskripsi ? deskripsi.trim() : "";

        if (nama.length < 3) {

            return res.status(400).json({

                success: false,

                message: "Nama tenant minimal 3 karakter."

            });

        }

        // ======================================
        // VALIDASI JAM
        // ======================================

        if (jam_buka >= jam_tutup) {

            return res.status(400).json({

                success: false,

                message: "Jam tutup harus lebih besar dari jam buka."

            });

        }

        // ======================================
        // VALIDASI STATUS
        // ======================================

        const statusValid = [

            "open",

            "close"

        ];

        if (!statusValid.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Status tenant tidak valid."

            });

        }

        // ======================================
        // CEK TENANT MILIK USER
        // ======================================

        const [tenant] = await db.query(

            `SELECT

                id,

                logo,

                banner

            FROM tenants

            WHERE id=?

            AND user_id=?`,

            [

                req.params.id,

                req.user.id

            ]

        );

        if (tenant.length === 0) {

            return res.status(403).json({

                success: false,

                message: "Anda tidak memiliki akses."

            });

        }

        // ======================================
        // DATA LAMA
        // ======================================

        let logo = tenant[0].logo;

        let banner = tenant[0].banner;

        // ======================================
        // SIMPAN FILE LAMA
        // ======================================

        const oldLogo = logo;

        const oldBanner = banner;

        // ======================================
        // UPLOAD LOGO BARU
        // ======================================

        if (

            req.files &&

            req.files.logo &&

            req.files.logo.length > 0

        ) {

            logo =
                req.files.logo[0].path;

        }

        // ======================================
        // UPLOAD BANNER BARU
        // ======================================

        if (

            req.files &&

            req.files.banner &&

            req.files.banner.length > 0

        ) {

            banner =
                req.files.banner[0].path;

        }

        // ======================================
        // CEK DUPLIKAT NAMA
        // ======================================

        const [cekNama] = await db.query(

            `SELECT id

            FROM tenants

            WHERE LOWER(nama)=LOWER(?)

            AND id<>?`,

            [

                nama,

                req.params.id

            ]

        );

        if (cekNama.length > 0) {

            return res.status(400).json({

                success: false,

                message: "Nama tenant sudah digunakan."

            });

        }

        // ======================================
        // UPDATE TENANT
        // ======================================

        try {

            await db.query(

                `UPDATE tenants

                SET

                    nama=?,

                    kategori=?,

                    deskripsi=?,

                    logo=?,

                    banner=?,

                    jam_buka=?,

                    jam_tutup=?,

                    status=?,

                    updated_at=NOW()

                WHERE

                    id=?`,

                [

                    nama,

                    kategori,

                    deskripsi,

                    logo,

                    banner,

                    jam_buka,

                    jam_tutup,

                    status,

                    req.params.id

                ]

            );

        }

        catch (dbError) {

            // ======================================
            // ROLLBACK FILE BARU
            // ======================================

            if (

                logo !== oldLogo

            ) {

                deleteFile(logo);

            }

            if (

                banner !== oldBanner

            ) {

                deleteFile(banner);

            }

            throw dbError;

        };

        // ======================================
        // HAPUS FILE LAMA
        // ======================================

        if (

            logo !== oldLogo

        ) {

            deleteFile(oldLogo);

        }

        if (

            banner !== oldBanner

        ) {

            deleteFile(oldBanner);

        }

        return res.json({

            success: true,

            message: "Tenant berhasil diperbarui.",

            tenant: {

                id: Number(req.params.id),

                nama,

                kategori,

                deskripsi,

                logo,

                banner,

                jam_buka,

                jam_tutup,

                status

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
// GET ALL TENANT
// ======================================

exports.getAllTenant = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT

                id,

                nama,

                kategori,

                deskripsi,

                logo,

                banner,

                jam_buka,

                jam_tutup,

                estimasi_waktu,

                minimal_pesanan,

                rating,

                total_review,

                status

            FROM tenants

            ORDER BY nama ASC`

        );

        return res.json(rows);

    }

    catch(err){

        console.error(err);

        return res.status(500).json({

            success:false,

            message:"Server Error."

        });

    }

};
