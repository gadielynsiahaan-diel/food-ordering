// =====================================
// PESANAN PENJUAL
// =====================================

const token = localStorage.getItem("token");

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

const container = document.getElementById("orderContainer");

// =====================================
// LOAD ORDER
// =====================================

async function loadPesanan() {

    try {

        const response = await fetch(

            `${API_URL}/order/seller`,

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

                "Gagal mengambil data."

            );

        }

        renderPesanan(result.orders);

    }

    catch (err) {

        console.error(err);

        container.innerHTML = `

            <h3>

                Gagal memuat pesanan.

            </h3>

        `;

    }

}

// =====================================
// RENDER
// =====================================

function renderPesanan(pesanan) {

    container.innerHTML = "";

    if (pesanan.length === 0) {

        container.innerHTML = `

            <h3>

                Belum ada pesanan.

            </h3>

        `;

        return;

    }

    pesanan.forEach((item) => {

        const tanggal = new Date(item.created_at)
            .toLocaleString("id-ID");

        let tombol = "";

        // ===============================
        // TOMBOL BERDASARKAN STATUS
        // ===============================

        if (item.status === "Pending") {

            tombol = `

                <button

                    class="proses"

                    onclick="ubahStatus(${item.id},'Diproses')">

                    Proses

                </button>

            `;

        }

        else if (item.status === "Diproses") {

            tombol = `

                <button

                    class="antar"

                    onclick="ubahStatus(${item.id},'Siap Diantar')">

                    Siap Diantar

                </button>

            `;

        }

        else if (item.status === "Siap Diantar") {

            tombol = `

                <button

                    class="selesai"

                    onclick="ubahStatus(${item.id},'Selesai')">

                    Selesai

                </button>

            `;

        }

        else {

            tombol = `

                <button

                    class="disabled"

                    disabled>

                    ✔ Pesanan Selesai

                </button>

            `;

        }

        container.innerHTML += `

        <div class="order-card">

            <h3>

                ${item.kode_order}

            </h3>

            <p>

                <b>Pembeli :</b>

                ${item.pembeli}

            </p>

            <p>

                <b>Nomor Meja :</b>

                ${item.nomor_meja}

            </p>

            <p>

                <b>Tanggal :</b>

                ${tanggal}

            </p>

            <p>

                <b>Total :</b>

                Rp${Number(item.total).toLocaleString("id-ID")}

            </p>

            <p>

                <b>Metode Pembayaran :</b>

                ${item.metode_pembayaran}

            </p>

            <p>

                <b>Catatan :</b>

                ${item.catatan || "-"}

            </p>

            <p>

                <b>Status :</b>

                <strong>${item.status}</strong>

            </p>

            <div class="action">

                ${tombol}

            </div>

        </div>

        `;

    });

}

// =====================================
// UPDATE STATUS
// =====================================

async function ubahStatus(id, status) {

    try {

        const response = await fetch(

            `${API_URL}/order/${id}/status`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: token

                },

                body: JSON.stringify({

                    status

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.message

            );

        }

        alert("Status berhasil diperbarui.");

        loadPesanan();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

// =====================================
// START
// =====================================

loadPesanan();