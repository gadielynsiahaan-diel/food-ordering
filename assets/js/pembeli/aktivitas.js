// ==========================================
// AKTIVITAS PEMBELI
// ==========================================

const token = localStorage.getItem("token");

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

const container = document.getElementById("activityContainer");

// ==========================================
// LOAD ORDER
// ==========================================

async function loadAktivitas() {

    try {

        const response = await fetch(

            `${API_URL}/order/my`,

            {

                headers: {

                    Authorization: token

                }

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.message ||

                "Gagal memuat aktivitas."

            );

        }

        await renderAktivitas(result.orders);

    }

    catch (err) {

        console.error(err);

        alert("Gagal memuat aktivitas.");

    }

}

// ==========================================
// RENDER
// ==========================================

async function renderAktivitas(data) {

    container.innerHTML = "";

    if (data.length === 0) {

        container.innerHTML = `

        <div class="empty-cart">

            <h2>

                Belum Ada Pesanan

            </h2>

            <p>

                Silakan lakukan pemesanan terlebih dahulu.

            </p>

            <a

                href="dashboard.html"

                class="btn-back">

                Pesan Sekarang

            </a>

        </div>

        `;

        return;

    }

    for (const item of data) {

        let warna = "";

        switch (item.status) {

            case "Pending":

                warna = "menunggu";

                break;

            case "Diproses":

                warna = "diproses";

                break;

            case "Siap Diantar":

                warna = "siap";

                break;

            case "Selesai":

                warna = "selesai";

                break;

            default:

                warna = "menunggu";

        }

        // =====================================
        // CEK SUDAH REVIEW?
        // =====================================

        let tombolRating = "";

        if (item.status === "Selesai") {

            try {

                const response = await fetch(

                    `${API_URL}/review/${item.id}`,

                    {

                        headers: {

                            Authorization: token

                        }

                    }

                );

                if (response.ok) {

                    tombolRating = `

                    <button

                        class="btn-rated"

                        disabled>

                        ⭐ Sudah Dinilai

                    </button>

                    `;

                }

                else {

                    tombolRating = `

                    <a

                        href="rating.html?order=${item.id}"

                        class="btn-rating">

                        ⭐ Beri Rating

                    </a>

                    `;

                }

            }

            catch (err) {

                console.error(err);

                tombolRating = `

                <a

                    href="rating.html?order=${item.id}"

                    class="btn-rating">

                    ⭐ Beri Rating

                </a>

                `;

            }

        }

        container.innerHTML += `

        <div class="activity-card">

            <h3>

                ${item.kode_order}

            </h3>

            <p>

                <b>Tanggal :</b>

                ${new Date(item.created_at).toLocaleString("id-ID")}

            </p>

            <p>

                <b>Nomor Meja :</b>

                ${item.nomor_meja}

            </p>

            <p>

                <b>Metode Pembayaran :</b>

                ${item.metode_pembayaran}

            </p>

            <p>

                <b>Total :</b>

                Rp${Number(item.total).toLocaleString("id-ID")}

            </p>

            <p>

                <b>Status :</b>

                <span class="status ${warna}">

                    ${item.status}

                </span>

            </p>

            ${tombolRating}

        </div>

        `;

    }

}

// ==========================================
// START
// ==========================================

loadAktivitas();

console.log("Aktivitas Loaded");