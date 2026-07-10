// =====================================
// LAPORAN PENJUALAN
// =====================================

const token = localStorage.getItem("token");

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

const body = document.getElementById("laporanBody");

// =====================================
// LOAD LAPORAN
// =====================================

async function loadLaporan() {

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

        renderLaporan(

            result.orders

        );

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

// =====================================
// RENDER
// =====================================

function renderLaporan(data) {

    body.innerHTML = "";

    let totalPendapatan = 0;

    let selesai = 0;

    document.getElementById(

        "totalPesanan"

    ).innerHTML = data.length;

    data.forEach(item => {

        totalPendapatan +=

            Number(item.total);

        if (

            item.status === "Selesai"

        ) {

            selesai++;

        }

        const tanggal =

            new Date(

                item.created_at

            ).toLocaleDateString(

                "id-ID"

            );

        body.innerHTML += `

        <tr>

            <td>

                ${item.kode_order}

            </td>

            <td>

                ${tanggal}

            </td>

            <td>

                ${item.status}

            </td>

            <td>

                Rp${Number(item.total).toLocaleString("id-ID")}

            </td>

        </tr>

        `;

    });

    document.getElementById(

        "totalPendapatan"

    ).innerHTML =

        "Rp" +

        totalPendapatan.toLocaleString(

            "id-ID"

        );

    document.getElementById(

        "pesananSelesai"

    ).innerHTML = selesai;

}

// =====================================

loadLaporan();

// =====================================

console.log(

    "Laporan Penjual Loaded"

);