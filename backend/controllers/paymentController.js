const db = require("../config/db");

// ======================================
// GET PAYMENT BY ORDER
// ======================================

exports.getPayment = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT

                id,

                order_id,

                metode,

                nominal,

                bukti_pembayaran,

                status,

                verified_at,

                created_at

            FROM payments

            WHERE order_id=?`,

            [

                req.params.orderId

            ]

        );

        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Data pembayaran tidak ditemukan."

            });

        }

        return res.status(200).json({

            success: true,

            payment: rows[0]

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
// CREATE PAYMENT
// ======================================

exports.createPayment = async (req, res) => {

    try {

        // ======================================
        // HANYA BUYER
        // ======================================

        if (req.user.role !== "buyer") {

            return res.status(403).json({

                success: false,

                message: "Hanya pembeli yang dapat melakukan pembayaran."

            });

        }

        let {

            order_id,

            metode,

            nominal,

            bukti_pembayaran

        } = req.body;

        // ======================================
        // VALIDASI INPUT
        // ======================================

        if (

            !order_id ||

            !metode ||

            nominal == null

        ) {

            return res.status(400).json({

                success: false,

                message: "Data pembayaran belum lengkap."

            });

        }

        nominal = Number(nominal);

        if (isNaN(nominal) || nominal <= 0) {

            return res.status(400).json({

                success: false,

                message: "Nominal pembayaran tidak valid."

            });

        }

        // ======================================
        // CEK ORDER MILIK USER
        // ======================================

        const [order] = await db.query(

            `SELECT

                id,

                total,

                status

            FROM orders

            WHERE

                id=?

            AND

                user_id=?`,

            [

                order_id,

                req.user.id

            ]

        );

        if (order.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Order tidak ditemukan."

            });

        }

        if (nominal < Number(order[0].total)) {

            return res.status(400).json({

                success: false,

                message: "Nominal pembayaran kurang."

            });

        }

        // ======================================
        // SUDAH PERNAH BAYAR?
        // ======================================

        const [cek] = await db.query(

            `SELECT id

            FROM payments

            WHERE order_id=?`,

            [

                order_id

            ]

        );

        if (cek.length > 0) {

            return res.status(400).json({

                success: false,

                message: "Pembayaran sudah pernah dikirim."

            });

        }

        // ======================================
        // SIMPAN PEMBAYARAN
        // ======================================

        const [result] = await db.query(

            `INSERT INTO payments

            (

                order_id,

                metode,

                nominal,

                bukti_pembayaran,

                status

            )

            VALUES

            (?,?,?,?,?)`,

            [

                order_id,

                metode,

                nominal,

                bukti_pembayaran || null,

                "Menunggu Verifikasi"

            ]

        );

        return res.status(201).json({

            success: true,

            message: "Pembayaran berhasil dikirim.",

            payment: {

                id: result.insertId,

                order_id,

                nominal,

                status: "Menunggu Verifikasi"

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
// VERIFIKASI PEMBAYARAN
// ======================================

exports.verifyPayment = async (req, res) => {

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

        const {

            status

        } = req.body;

        // ======================================
        // VALIDASI STATUS
        // ======================================

        const statusValid = [

            "Berhasil",

            "Ditolak"

        ];

        if (!statusValid.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Status pembayaran tidak valid."

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
        // CEK PAYMENT
        // ======================================

        const [payment] = await db.query(

            `SELECT

                payments.id,

                payments.order_id,

                payments.status,

                orders.tenant_id

            FROM payments

            INNER JOIN orders

                ON payments.order_id = orders.id

            WHERE

                payments.id=?

            AND

                orders.tenant_id=?`,

            [

                req.params.id,

                tenant[0].id

            ]

        );

        if (payment.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Data pembayaran tidak ditemukan."

            });

        }

        // ======================================
        // SUDAH DIVERIFIKASI
        // ======================================

        if (

            payment[0].status === "Berhasil" ||

            payment[0].status === "Ditolak"

        ) {

            return res.status(400).json({

                success: false,

                message: "Pembayaran sudah diverifikasi."

            });

        }

        // ======================================
        // UPDATE PAYMENT
        // ======================================

        await db.query(

            `UPDATE payments

            SET

                status=?,

                verified_at=NOW()

            WHERE id=?`,

            [

                status,

                req.params.id

            ]

        );

        // ======================================
        // UPDATE ORDER
        // ======================================

        if (status === "Berhasil") {

            await db.query(

                `UPDATE orders

                SET

                    status='Diproses'

                WHERE id=?`,

                [

                    payment[0].order_id

                ]

            );

        }

        return res.status(200).json({

            success: true,

            message: "Pembayaran berhasil diverifikasi.",

            payment: {

                id: Number(req.params.id),

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
// RIWAYAT PEMBAYARAN PEMBELI
// ======================================

exports.getMyPayments = async (req, res) => {

    try {

        // ======================================
        // HANYA BUYER
        // ======================================

        if (req.user.role !== "buyer") {

            return res.status(403).json({

                success: false,

                message: "Akses ditolak."

            });

        }

        const [rows] = await db.query(

            `SELECT

                payments.id,

                payments.metode,

                payments.nominal,

                payments.status,

                payments.created_at,

                payments.verified_at,

                orders.id AS order_id,

                orders.kode_order,

                orders.total

            FROM payments

            INNER JOIN orders

                ON payments.order_id = orders.id

            WHERE

                orders.user_id=?

            ORDER BY

                payments.created_at DESC`,

            [

                req.user.id

            ]

        );

        return res.status(200).json({

            success: true,

            total: rows.length,

            payments: rows

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
// SEMUA PEMBAYARAN PENJUAL
// ======================================

exports.getSellerPayments = async (req, res) => {

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
        // AMBIL DATA PEMBAYARAN
        // ======================================

        const [rows] = await db.query(

            `SELECT

                payments.id,

                payments.metode,

                payments.nominal,

                payments.status,

                payments.created_at,

                payments.verified_at,

                orders.id AS order_id,

                orders.kode_order,

                users.nama AS pembeli

            FROM payments

            INNER JOIN orders

                ON payments.order_id = orders.id

            INNER JOIN users

                ON orders.user_id = users.id

            WHERE

                orders.tenant_id=?

            ORDER BY

                payments.created_at DESC`,

            [

                tenant[0].id

            ]

        );

        return res.status(200).json({

            success: true,

            total: rows.length,

            payments: rows

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Terjadi kesalahan pada server."

        });

    }

};