// ==========================================
// CHECKOUT PEMBELI
// ==========================================

const token = localStorage.getItem("token");

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

const form =
document.getElementById("checkoutForm");

let cart = [];

// ==========================================
// LOAD CART
// ==========================================

async function loadCart() {

    try {

        const response = await fetch(

            `${API_URL}/cart`,

            {

                method: "GET",

                headers: {

                    Authorization: token

                }

            }

        );

        const result = await response.json();

        console.log("Response Checkout :", result);

        if (!response.ok) {

            throw new Error(

                result.message ||

                "Gagal memuat keranjang."

            );

        }

        cart = result.cart || [];

        hitungTotal();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

// ==========================================
// HITUNG TOTAL
// ==========================================

function hitungTotal() {

    let totalHarga = 0;

    cart.forEach(item => {

        totalHarga +=

            Number(item.harga) *

            Number(item.qty);

    });

    document.getElementById(

        "totalHarga"

    ).innerHTML =

        "Rp" +

        totalHarga.toLocaleString("id-ID");

}

// ==========================================
// CHECKOUT
// ==========================================

form.addEventListener(

    "submit",

    async function (e) {

        e.preventDefault();

        if (cart.length === 0) {

            alert("Keranjang masih kosong.");

            return;

        }

        const namaPemesan =

            document

            .getElementById("namaPemesan")

            .value

            .trim();

        const nomorMeja =

            document

            .getElementById("nomorMeja")

            .value;

        const metodePembayaran =

            document

            .getElementById("metodePembayaran")

            .value;

        const catatan =

            document

            .getElementById("catatan")

            .value;

        try {

            const response = await fetch(

                `${API_URL}/order`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: token

                    },

                    body: JSON.stringify({

                        nama_pemesan: namaPemesan,

                        nomor_meja: nomorMeja,

                        metode_pembayaran: metodePembayaran,

                        catatan,

                        items: cart

                    })

                }

            );

            const result = await response.json();

            console.log("Checkout :", result);

            if (!response.ok) {

                throw new Error(

                    result.message ||

                    "Checkout gagal."

                );

            }

            // ==================================
            // KOSONGKAN CART DI DATABASE
            // ==================================

            await fetch(

                `${API_URL}/cart`,

                {

                    method: "DELETE",

                    headers: {

                        Authorization: token

                    }

                }

            );

            alert(

                "Pesanan berhasil dibuat."

            );

            window.location.href =

                "aktivitas.html";

        }

        catch (err) {

            console.error(err);

            alert(err.message);

        }

    }

);

// ==========================================
// START
// ==========================================

loadCart();

console.log("Checkout Loaded");