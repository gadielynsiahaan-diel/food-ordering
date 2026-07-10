const db = require("../config/db");

// ======================================
// GET CART
// ======================================

exports.getCart = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT

                carts.id,

                carts.qty,

                carts.harga,

                (carts.qty * carts.harga) AS subtotal,

                carts.catatan,

                menus.id AS menu_id,

                menus.nama,

                menus.gambar,

                menus.stok,

                tenants.id AS tenant_id,

                tenants.nama AS tenant

            FROM carts

            INNER JOIN menus

                ON carts.menu_id = menus.id

            INNER JOIN tenants

                ON menus.tenant_id = tenants.id

            WHERE carts.user_id=?

            ORDER BY carts.id DESC`,

            [

                req.user.id

            ]

        );

        return res.status(200).json({

            success: true,

            cart: rows

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
// ADD CART
// ======================================

exports.addCart = async (req, res) => {

    try {

        let {

            menu_id,

            qty,

            catatan

        } = req.body;

        qty = Number(qty);

        // ======================================
        // VALIDASI
        // ======================================

        if (!menu_id) {

            return res.status(400).json({

                success: false,

                message: "Menu belum dipilih."

            });

        }

        if (isNaN(qty) || qty <= 0) {

            return res.status(400).json({

                success: false,

                message: "Jumlah tidak valid."

            });

        }

        // ======================================
        // CEK MENU
        // ======================================

        const [menu] = await db.query(

            `SELECT

                id,

                nama,

                harga,

                stok,

                status

            FROM menus

            WHERE id=?`,

            [

                menu_id

            ]

        );

        if (menu.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Menu tidak ditemukan."

            });

        }

        if (menu[0].status !== "Tersedia") {

            return res.status(400).json({

                success: false,

                message: "Menu sedang tidak tersedia."

            });

        }

        // ======================================
        // CEK CART
        // ======================================

        const [cart] = await db.query(

            `SELECT

                id,

                qty

            FROM carts

            WHERE

                user_id=?

            AND

                menu_id=?`,

            [

                req.user.id,

                menu_id

            ]

        );

        // ======================================
        // SUDAH ADA DI CART
        // ======================================

        if (cart.length > 0) {

            const totalQty = cart[0].qty + qty;

            if (totalQty > menu[0].stok) {

                return res.status(400).json({

                    success: false,

                    message: "Jumlah melebihi stok yang tersedia."

                });

            }

            await db.query(

                `UPDATE carts

                SET

                    qty=?,

                    catatan=?

                WHERE

                    id=?

                AND

                    user_id=?`,

                [

                    totalQty,

                    catatan || "",

                    cart[0].id,

                    req.user.id

                ]

            );

        }

        // ======================================
        // BELUM ADA DI CART
        // ======================================

        else {

            if (qty > menu[0].stok) {

                return res.status(400).json({

                    success: false,

                    message: "Stok tidak mencukupi."

                });

            }

            await db.query(

                `INSERT INTO carts

                (

                    user_id,

                    menu_id,

                    qty,

                    harga,

                    catatan

                )

                VALUES

                (?,?,?,?,?)`,

                [

                    req.user.id,

                    menu_id,

                    qty,

                    menu[0].harga,

                    catatan ? catatan.trim() : ""

                ]

            );

        }

        return res.status(200).json({

            success: true,

            message: "Menu berhasil ditambahkan ke keranjang."

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
// UPDATE CART
// ======================================

exports.updateCart = async (req, res) => {

    try {

        let {

            qty,

            catatan

        } = req.body;

        qty = Number(qty);

        // ======================================
        // VALIDASI
        // ======================================

        if (isNaN(qty) || qty <= 0) {

            return res.status(400).json({

                success: false,

                message: "Jumlah tidak valid."

            });

        }

        // ======================================
        // CEK CART
        // ======================================

        const [cart] = await db.query(

            `SELECT

                id,

                menu_id

            FROM carts

            WHERE

                id=?

            AND

                user_id=?`,

            [

                req.params.id,

                req.user.id

            ]

        );

        if (cart.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Item keranjang tidak ditemukan."

            });

        }

        // ======================================
        // CEK MENU
        // ======================================

        const [menu] = await db.query(

            `SELECT

                stok,

                status

            FROM menus

            WHERE id=?`,

            [

                cart[0].menu_id

            ]

        );

        if (menu.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Menu tidak ditemukan."

            });

        }

        if (menu[0].status !== "Tersedia") {

            return res.status(400).json({

                success: false,

                message: "Menu sedang tidak tersedia."

            });

        }

        if (qty > menu[0].stok) {

            return res.status(400).json({

                success: false,

                message: "Jumlah melebihi stok yang tersedia."

            });

        }

        // ======================================
        // UPDATE CART
        // ======================================

        await db.query(

            `UPDATE carts

            SET

                qty=?,

                catatan=?

            WHERE

                id=?

            AND

                user_id=?`,

            [

                qty,

                catatan ? catatan.trim() : "",

                req.params.id,

                req.user.id

            ]

        );

        return res.status(200).json({

            success: true,

            message: "Keranjang berhasil diperbarui."

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
// DELETE CART
// ======================================

exports.deleteCart = async (req, res) => {

    try {

        const [result] = await db.query(

            `DELETE FROM carts

            WHERE

                id=?

            AND

                user_id=?`,

            [

                req.params.id,

                req.user.id

            ]

        );

        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: "Item tidak ditemukan."

            });

        }

        return res.json({

            success: true,

            message: "Item berhasil dihapus."

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
// CLEAR CART
// ======================================

exports.clearCart = async (req, res) => {

    try {

        await db.query(

            "DELETE FROM carts WHERE user_id=?",

            [

                req.user.id

            ]

        );

        return res.json({

            success: true,

            message: "Keranjang berhasil dikosongkan."

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Server Error."

        });

    }

};