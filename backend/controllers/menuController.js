const db = require("../config/db");

// ======================================
// CREATE MENU
// ======================================

exports.createMenu = async (req, res) => {

    console.log("====== CONTROLLER ======");

    console.log(req.body);

    console.log(req.file);

    try {

        // ======================================
        // HANYA SELLER
        // ======================================

        if (req.user.role !== "seller") {

            return res.status(403).json({

                success: false,

                message: "Hanya penjual yang dapat menambahkan menu."

            });

        }

        let {

            nama,

            harga,

            kategori,

            deskripsi,

            stok,

            status

        } = req.body;

        // ======================================
        // VALIDASI
        // ======================================

        if (

            !nama ||

            !kategori ||

            harga == null ||

            stok == null ||

            !status

        ) {

            return res.status(400).json({

                success: false,

                message: "Semua data wajib diisi."

            });

        }

        nama = nama.trim();

        kategori = kategori.trim();

        deskripsi = deskripsi

            ? deskripsi.trim()

            : "";

        harga = Number(harga);

        stok = Number(stok);

        if (nama.length < 3) {

            return res.status(400).json({

                success: false,

                message: "Nama menu minimal 3 karakter."

            });

        }

        if (

            isNaN(harga) ||

            harga <= 0

        ) {

            return res.status(400).json({

                success: false,

                message: "Harga tidak valid."

            });

        }

        if (

            isNaN(stok) ||

            stok < 0

        ) {

            return res.status(400).json({

                success: false,

                message: "Stok tidak valid."

            });

        }

        // ======================================
        // STATUS
        // ======================================

        const statusValid = [

            "Tersedia",

            "Habis"

        ];

        if (

            !statusValid.includes(status)

        ) {

            return res.status(400).json({

                success: false,

                message: "Status menu tidak valid."

            });

        }

        // ======================================
        // CARI TENANT
        // ======================================

        const [tenant] = await db.query(

            `SELECT id

            FROM tenants

            WHERE user_id=?`,

            [

                req.user.id

            ]

        );

        if (

            tenant.length === 0

        ) {

            return res.status(404).json({

                success: false,

                message: "Silakan buat tenant terlebih dahulu."

            });

        }

        // ======================================
        // CEK DUPLIKAT
        // ======================================

        const [cekMenu] = await db.query(

            `SELECT id

            FROM menus

            WHERE

                tenant_id=?

            AND

                LOWER(nama)=LOWER(?)`,

            [

                tenant[0].id,

                nama

            ]

        );

        if (

            cekMenu.length > 0

        ) {

            return res.status(400).json({

                success: false,

                message: "Nama menu sudah digunakan."

            });

        }

        // ======================================
        // FOTO MENU
        // ======================================

        let gambar =

            "/uploads/default-menu.jpg";

        if (

            req.file

        ) {

            gambar = req.file.path;

        }

        // ======================================
        // INSERT MENU
        // ======================================

        const [result] = await db.query(

            `INSERT INTO menus

            (

                tenant_id,

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

                status

            )

            VALUES

            (?,?,?,?,?,?,?,?)`,

            [

                tenant[0].id,

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

                status

            ]

        );

        return res.status(201).json({

            success: true,

            message: "Menu berhasil ditambahkan.",

            menu: {

                id: result.insertId,

                tenant_id: tenant[0].id,

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

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
// GET MENU SAYA
// ======================================

exports.getMyMenu = async (req, res) => {

    try {

        const [tenant] = await db.query(

            "SELECT id FROM tenants WHERE user_id=?",

            [

                req.user.id

            ]

        );

        if (tenant.length === 0) {

            return res.json([]);

        }

        const [rows] = await db.query(

            `SELECT

                id,

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

                status,

                is_recommend,

                created_at

            FROM menus

            WHERE tenant_id=?

            ORDER BY id DESC`,

            [

                tenant[0].id

            ]

        );

        return res.json(rows);

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Server Error."

        });

    }

};

// ======================================
// GET MENU BY ID
// ======================================

exports.getMenuById = async (req, res) => {

    try {

        // ======================================
        // HANYA SELLER
        // ======================================

        if (req.user.role !== "seller") {

            return res.status(403).json({

                success: false,

                message: "Akses ditolak."

            });

        }

        // ======================================
        // CARI TENANT
        // ======================================

        const [tenant] = await db.query(

            `SELECT id

            FROM tenants

            WHERE user_id=?`,

            [

                req.user.id

            ]

        );

        if (tenant.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Tenant tidak ditemukan."

            });

        }

        // ======================================
        // AMBIL MENU
        // ======================================

        const [rows] = await db.query(

            `SELECT

                id,

                tenant_id,

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

                status,

                is_recommend,

                created_at

            FROM menus

            WHERE

                id=?

            AND

                tenant_id=?`,

            [

                req.params.id,

                tenant[0].id

            ]

        );

        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Menu tidak ditemukan."

            });

        }

        return res.status(200).json({

            success: true,

            menu: rows[0]

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
// UPDATE MENU
// ======================================

exports.updateMenu = async (req, res) => {

    try {

        // ======================================
        // HANYA SELLER
        // ======================================

        if (req.user.role !== "seller") {

            return res.status(403).json({

                success: false,

                message: "Hanya penjual yang dapat mengubah menu."

            });

        }

        const menuId = Number(req.params.id);

        if (!menuId) {

            return res.status(400).json({

                success: false,

                message: "ID menu tidak valid."

            });

        }

        let {

            nama,

            kategori,

            harga,

            deskripsi,

            stok,

            status

        } = req.body;

        if (

            !nama ||

            !kategori ||

            harga == null ||

            stok == null ||

            !status

        ) {

            return res.status(400).json({

                success: false,

                message: "Semua data wajib diisi."

            });

        }

        nama = nama.trim();

        kategori = kategori.trim();

        deskripsi = deskripsi

            ? deskripsi.trim()

            : "";

        harga = Number(harga);

        stok = Number(stok);

        // ======================================
        // CEK TENANT
        // ======================================

        const [tenant] = await db.query(

            `SELECT id

            FROM tenants

            WHERE user_id=?`,

            [

                req.user.id

            ]

        );

        if (tenant.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Tenant tidak ditemukan."

            });

        }

        // ======================================
        // CEK MENU
        // ======================================

        const [menu] = await db.query(

            `SELECT *

            FROM menus

            WHERE

                id=?

            AND

                tenant_id=?`,

            [

                menuId,

                tenant[0].id

            ]

        );

        if (menu.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Menu tidak ditemukan."

            });

        }

        // ======================================
        // FOTO MENU
        // ======================================

        let gambar =

            menu[0].gambar;

        if (

            req.file

        ) {

            gambar =

                "/uploads/menu/" +

                req.file.filename;

        }

        // ======================================
        // UPDATE
        // ======================================

        await db.query(

            `UPDATE menus

            SET

                nama=?,

                kategori=?,

                harga=?,

                deskripsi=?,

                gambar=?,

                stok=?,

                status=?

            WHERE id=?`,

            [

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

                status,

                menuId

            ]

        );

        return res.status(200).json({

            success: true,

            message: "Menu berhasil diperbarui.",

            menu: {

                id: menuId,

                tenant_id: tenant[0].id,

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

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
// DELETE MENU
// ======================================

exports.deleteMenu = async (req, res) => {

    try {

        const [tenant] = await db.query(

            "SELECT id FROM tenants WHERE user_id=?",

            [

                req.user.id

            ]

        );

        if (tenant.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Tenant tidak ditemukan."

            });

        }

        const [result] = await db.query(

            `DELETE FROM menus

            WHERE

                id=?

            AND

                tenant_id=?`,

            [

                req.params.id,

                tenant[0].id

            ]

        );

        if (result.affectedRows === 0) {

            return res.status(403).json({

                success: false,

                message: "Anda tidak memiliki akses."

            });

        }

        return res.json({

            success: true,

            message: "Menu berhasil dihapus."

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Server Error."

        });

    }

};

// ======================================
// MENU UNTUK PEMBELI
// ======================================

exports.getMenuByTenant = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT

                id,

                nama,

                kategori,

                harga,

                deskripsi,

                gambar,

                stok,

                status,

                is_recommend

            FROM menus

            WHERE

                tenant_id=?

            AND

                status='Tersedia'

            ORDER BY nama ASC`,

            [

                req.params.tenantId

            ]

        );

        return res.json(rows);

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Server Error."

        });

    }

};
