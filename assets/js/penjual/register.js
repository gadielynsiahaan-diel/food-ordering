// =====================================
// REGISTER PENJUAL
// =====================================

const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {

        alert("Konfirmasi password tidak sesuai.");

        return;

    }

    try {

        const response = await fetch(`${API_URL}/auth/register`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                nama,

                email,

                password,

                role: "seller"

            })

        });

        const result = await response.json();

        if (response.ok) {

            alert(result.message);

            window.location.href = "login.html";

        } else {

            alert(result.message);

        }

    } catch (error) {

        console.error(error);

        alert("Tidak dapat terhubung ke server.");

    }

});