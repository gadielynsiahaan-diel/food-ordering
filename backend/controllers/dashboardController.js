const db = require("../config/db");

// ======================================
// DASHBOARD PENJUAL
// ======================================

exports.getDashboard = async (req, res) => {

    try {

        if (req.user.role !== "seller") {

            return res.status(403).json({

                success: false,

                message: "Akses ditolak."

            });

        }

        // ======================================
        // TENANT
        // ======================================

        const [tenant] = await db.query(

            `SELECT id
             FROM tenants
             WHERE user_id=?`,

            [req.user.id]

        );

        if (tenant.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Tenant tidak ditemukan."

            });

        }

        const tenantId = tenant[0].id;

        // ======================================
        // PENDAPATAN HARI INI
        // ======================================

        const [pendapatan] = await db.query(

            `SELECT
                COALESCE(SUM(total),0) total
            FROM orders
            WHERE tenant_id=?
            AND DATE(created_at)=CURDATE()
            AND status='Selesai'`,

            [tenantId]

        );

        // ======================================
        // PESANAN BARU
        // ======================================

        const [pesanan] = await db.query(

            `SELECT COUNT(*) total
             FROM orders
             WHERE tenant_id=?
             AND status IN
             ('Pending','Diproses','Siap Diantar')`,

            [tenantId]

        );

        // ======================================
        // TOTAL MENU
        // ======================================

        const [menu] = await db.query(

            `SELECT COUNT(*) total
             FROM menus
             WHERE tenant_id=?`,

            [tenantId]

        );

        // ======================================
        // RATING
        // ======================================

        const [rating] = await db.query(

            `SELECT
                ROUND(AVG(rating),1) rating
            FROM reviews
            WHERE tenant_id=?`,

            [tenantId]

        );

        return res.json({

            success: true,

            dashboard: {

                pendapatan:

                    pendapatan[0].total,

                pesananBaru:

                    pesanan[0].total,

                totalMenu:

                    menu[0].total,

                rating:

                    rating[0].rating || 0

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