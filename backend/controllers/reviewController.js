exports.createReview = async (req, res) => {

    try {

        // HANYA BUYER
        if (req.user.role !== "buyer") {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak."
            });
        }

        const userId = req.user.id;

        const {
            order_id,
            rating,
            komentar = ""
        } = req.body;

        // VALIDASI
        if (!order_id || !rating) {
            return res.status(400).json({
                success: false,
                message: "Data review belum lengkap."
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating harus 1 - 5."
            });
        }

        // CEK ORDER
        const [order] = await db.query(
            `
            SELECT
                id,
                tenant_id,
                status
            FROM orders
            WHERE id = ?
            AND user_id = ?
            `,
            [
                order_id,
                userId
            ]
        );

        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pesanan tidak ditemukan."
            });
        }

        // HARUS SELESAI
        if (order[0].status !== "Selesai") {
            return res.status(400).json({
                success: false,
                message: "Pesanan belum selesai."
            });
        }

        // SUDAH REVIEW?
        const [review] = await db.query(
            `
            SELECT id
            FROM reviews
            WHERE order_id = ?
            `,
            [order_id]
        );

        if (review.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Pesanan ini sudah diberi review."
            });
        }

        // INSERT REVIEW
        await db.query(
            `
            INSERT INTO reviews
            (
                user_id,
                tenant_id,
                order_id,
                rating,
                komentar
            )
            VALUES (?,?,?,?,?)
            `,
            [
                userId,
                order[0].tenant_id,
                order_id,
                rating,
                komentar
            ]
        );

        // =================================================
        // HITUNG ULANG RATING TENANT
        // =================================================

        const tenantId = order[0].tenant_id;

        const [rows] = await db.query(
            `
            SELECT
                ROUND(AVG(rating),1) AS rating,
                COUNT(*) AS total_review
            FROM reviews
            WHERE tenant_id = ?
            `,
            [tenantId]
        );

        const avgRating = rows[0].rating || 0;
        const totalReview = rows[0].total_review || 0;

        // UPDATE TENANTS
        await db.query(
            `
            UPDATE tenants
            SET
                rating = ?,
                total_review = ?
            WHERE id = ?
            `,
            [
                avgRating,
                totalReview,
                tenantId
            ]
        );

        // DEBUG
        console.log("Tenant ID :", tenantId);
        console.log("Rating :", avgRating);
        console.log("Total Review :", totalReview);

        return res.status(201).json({
            success: true,
            message: "Review berhasil dikirim."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server."
        });

    }

};
