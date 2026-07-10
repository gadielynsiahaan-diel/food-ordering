const db = require("../config/db");

// ======================================
// GENERATE KODE ORDER
// ======================================

async function generateKodeOrder() {

    const today = new Date();

    const tahun = today.getFullYear();

    const bulan = String(today.getMonth() + 1).padStart(2, "0");

    const tanggal = String(today.getDate()).padStart(2, "0");

    const prefix = `TRSLA${tahun}${bulan}${tanggal}`;

    const [rows] = await db.query(

        `SELECT kode_order

        FROM orders

        WHERE kode_order LIKE ?

        ORDER BY id DESC

        LIMIT 1`,

        [

            `${prefix}%`

        ]

    );

    if (rows.length === 0) {

        return `${prefix}0001`;

    }

    const nomor = Number(

        rows[0].kode_order.slice(-4)

    ) + 1;

    return prefix + String(nomor).padStart(4, "0");

}

// ======================================
// CREATE ORDER
// ======================================

exports.createOrder = async (req, res) => {

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // ======================================
        // HANYA BUYER
        // ======================================

        if (req.user.role !== "buyer") {

            await connection.rollback();

            connection.release();

            return res.status(403).json({

                success: false,

                message: "Hanya pembeli yang dapat melakukan checkout."

            });

        }

        const userId = req.user.id;

        let {

            nama_pemesan,

            nomor_meja,

            metode_pembayaran = "Cash",

            catatan = ""

        } = req.body;

        // ======================================
        // VALIDASI
        // ======================================

        if (!nomor_meja) {

            await connection.rollback();

            connection.release();

            return res.status(400).json({

                success: false,

                message: "Nomor meja wajib diisi."

            });

        }

        if (!nama_pemesan) {

            await connection.rollback();

            connection.release();

            return res.status(400).json({

                success: false,

                message: "Nama pemesan wajib diisi."

            });

        }

        nomor_meja = String(nomor_meja).trim();

        catatan = catatan ? catatan.trim() : "";

        nama_pemesan = nama_pemesan
            ? nama_pemesan.trim()
            : "";

        // ======================================
        // AMBIL CART
        // ======================================

        console.log("USER LOGIN :", req.user);

        console.log("USER ID :", userId);
        
        const [cart] = await connection.query(

            `SELECT

                carts.id,

                carts.qty,

                carts.harga,

                carts.catatan,

                menus.id AS menu_id,

                menus.nama,

                menus.harga AS harga_menu,

                menus.stok,

                menus.status,

                menus.tenant_id

            FROM carts

            INNER JOIN menus

                ON carts.menu_id = menus.id

            WHERE carts.user_id=?

            ORDER BY menus.tenant_id ASC`,

            [

                userId

            ]

        );

        console.log("ISI CART :", cart);

        if (cart.length === 0) {

            await connection.rollback();

            connection.release();

            return res.status(400).json({

                success: false,

                message: "Keranjang masih kosong."

            });

        }

        // ======================================
        // GROUP BERDASARKAN TENANT
        // ======================================

        const tenantGroups = {};

        for (const item of cart) {

            if (!tenantGroups[item.tenant_id]) {

                tenantGroups[item.tenant_id] = [];

            }

            tenantGroups[item.tenant_id].push(item);

        }

        const orders = [];

        // ======================================
        // PROSES SETIAP TENANT
        // ======================================

        for (const tenantId of Object.keys(tenantGroups)) {

            const items = tenantGroups[tenantId];

            let total = 0;

            for (const item of items) {

                if (item.status !== "Tersedia") {

                    await connection.rollback();

                    connection.release();

                    return res.status(400).json({

                        success: false,

                        message: `${item.nama} sudah tidak tersedia.`

                    });

                }

                if (item.qty > item.stok) {

                    await connection.rollback();

                    connection.release();

                    return res.status(400).json({

                        success: false,

                        message: `Stok ${item.nama} tidak mencukupi.`

                    });

                }

                total += item.qty * Number(item.harga_menu);

            }

            const kodeOrder = await generateKodeOrder();

            // ======================================
            // INSERT ORDER
            // ======================================

            const [order] = await connection.query(

                `INSERT INTO orders
                (
                    kode_order,
                    user_id,
                    tenant_id,
                    nomor_meja,
                    nama_pemesan,
                    total,
                    metode_pembayaran,
                    status,
                    catatan
                )
                VALUES
                (?,?,?,?,?,?,?,?,?)`,

                [

                    kodeOrder,

                    userId,

                    Number(tenantId),

                    nomor_meja,

                    nama_pemesan,

                    total,

                    metode_pembayaran,

                    "Pending",

                    catatan

                ]

            );

            const orderId = order.insertId;

            // ======================================
            // INSERT ORDER ITEMS
            // ======================================

            for (const item of items) {

                const subtotal =

                    item.qty * Number(item.harga_menu);

                await connection.query(

                    `INSERT INTO order_items

                    (

                        order_id,

                        menu_id,

                        nama_menu,

                        qty,

                        harga,

                        subtotal,

                        catatan

                    )

                    VALUES

                    (?,?,?,?,?,?,?)`,

                    [

                        orderId,

                        item.menu_id,

                        item.nama,

                        item.qty,

                        item.harga_menu,

                        subtotal,

                        item.catatan || ""

                    ]

                );

                // ======================================
                // UPDATE STOK
                // ======================================

                await connection.query(

                    `UPDATE menus

                    SET

                        stok = stok - ?

                    WHERE

                        id = ?`,

                    [

                        item.qty,

                        item.menu_id

                    ]

                );

            }

            // ======================================
            // SIMPAN RESPONSE ORDER
            // ======================================

            orders.push({

                id: orderId,

                kode_order: kodeOrder,

                tenant_id: Number(tenantId),

                total,

                status: "Pending"

            });

        }

        // ======================================
        // HAPUS CART
        // ======================================

        await connection.query(

            `DELETE FROM carts

            WHERE user_id=?`,

            [

                userId

            ]

        );

        // ======================================
        // COMMIT
        // ======================================

        await connection.commit();

        connection.release();

        return res.status(201).json({

            success: true,

            message: "Checkout berhasil.",

            total_order: orders.length,

            orders

        });

    } catch (err) {

        await connection.rollback();

        connection.release();

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Terjadi kesalahan pada server."

        });

    }

};

// ======================================
// RIWAYAT ORDER PEMBELI
// ======================================

exports.getMyOrders = async (req, res) => {

    try {

        console.log(req.user);

        if (req.user.role !== "buyer") {

            return res.status(403).json({

                success: false,

                message: "Akses ditolak."

            });

        }

        const [rows] = await db.query(

            `SELECT

                id,

                kode_order,

                nomor_meja,

                total,

                metode_pembayaran,

                status,

                created_at

            FROM orders

            WHERE

                user_id=?

            ORDER BY created_at DESC`,

            [

                req.user.id

            ]

        );

        return res.status(200).json({

            success: true,

            total: rows.length,

            orders: rows

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
// DETAIL ORDER PEMBELI
// ======================================

exports.getOrderDetail = async (req, res) => {

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

        // ======================================
        // AMBIL ORDER
        // ======================================

        const [order] = await db.query(

            `SELECT

                id,

                kode_order,

                nomor_meja,

                total,

                metode_pembayaran,

                status,

                catatan,

                created_at

            FROM orders

            WHERE

                id=?

            AND

                user_id=?`,

            [

                req.params.id,

                req.user.id

            ]

        );

        if (order.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Order tidak ditemukan."

            });

        }

        // ======================================
        // AMBIL ITEM ORDER
        // ======================================

        const [items] = await db.query(

            `SELECT

                order_items.id,

                order_items.menu_id,

                order_items.nama_menu,

                order_items.qty,

                order_items.harga,

                order_items.subtotal,

                order_items.catatan,

                menus.gambar

            FROM order_items

            LEFT JOIN menus

                ON order_items.menu_id = menus.id

            WHERE

                order_items.order_id=?

            ORDER BY order_items.id ASC`,

            [

                req.params.id

            ]

        );

        return res.status(200).json({

            success: true,

            order: order[0],

            items

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
// ORDER PENJUAL
// ======================================

exports.getSellerOrders = async (req, res) => {

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
        // AMBIL SEMUA ORDER
        // ======================================

        const [rows] = await db.query(

            `SELECT

                orders.id,

                orders.kode_order,

                orders.nomor_meja,

                orders.total,

                orders.metode_pembayaran,

                orders.status,

                orders.catatan,

                orders.created_at,

                orders.nama_pemesan AS pembeli

            FROM orders

            INNER JOIN users

                ON orders.user_id = users.id

            WHERE

                orders.tenant_id=?

            ORDER BY

                orders.created_at DESC`,

            [

                tenant[0].id

            ]

        );

        return res.status(200).json({

            success: true,

            total: rows.length,

            orders: rows

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
// DETAIL ORDER PENJUAL
// ======================================

exports.getSellerOrderDetail = async (req, res) => {

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
        // AMBIL ORDER
        // ======================================

        const [order] = await db.query(

            `SELECT

                orders.id,

                orders.kode_order,

                orders.nomor_meja,

                orders.total,

                orders.metode_pembayaran,

                orders.status,

                orders.catatan,

                orders.created_at,

                users.nama AS pembeli

            FROM orders

            INNER JOIN users

                ON orders.user_id = users.id

            WHERE

                orders.id=?

            AND

                orders.tenant_id=?`,

            [

                req.params.id,

                tenant[0].id

            ]

        );

        if (order.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Order tidak ditemukan."

            });

        }

        // ======================================
        // AMBIL ITEM ORDER
        // ======================================

        const [items] = await db.query(

            `SELECT

                id,

                menu_id,

                nama_menu,

                qty,

                harga,

                subtotal,

                catatan

            FROM order_items

            WHERE

                order_id=?

            ORDER BY id ASC`,

            [

                req.params.id

            ]

        );

        return res.status(200).json({

            success: true,

            order: order[0],

            items

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
// UPDATE STATUS ORDER
// ======================================

exports.updateOrderStatus = async (req, res) => {

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

            "Pending",

            "Diproses",

            "Siap Diantar",

            "Selesai",

            "Dibatalkan"

        ];

        if (!statusValid.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Status order tidak valid."

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
        // CEK ORDER
        // ======================================

        const [order] = await db.query(

            `SELECT

                id,

                status

            FROM orders

            WHERE

                id=?

            AND

                tenant_id=?`,

            [

                req.params.id,

                tenant[0].id

            ]

        );

        if (order.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Order tidak ditemukan."

            });

        }

        // ======================================
        // SUDAH STATUS TERSEBUT
        // ======================================

        if (order[0].status === status) {

            return res.status(400).json({

                success: false,

                message: "Status order sudah sama."

            });

        }

        // ======================================
        // UPDATE STATUS
        // ======================================

        await db.query(

            `UPDATE orders

            SET

                status=?

            WHERE

                id=?`,

            [

                status,

                req.params.id

            ]

        );

        return res.status(200).json({

            success: true,

            message: "Status order berhasil diperbarui.",

            order: {

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