/* =========================================
   REGISTER PEMBELI
========================================= */

const form = document.getElementById("registerForm");

const nama = document.getElementById("nama");

const email = document.getElementById("email");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

/* =========================================
   SUBMIT
========================================= */

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    if (password.value !== confirmPassword.value) {

        alert("Konfirmasi password tidak sama.");

        return;

    }

    try {

        const response = await fetch(

            `${API_URL}/auth/register`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    nama: nama.value,

                    email: email.value,

                    password: password.value,

                    role: "buyer"

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            alert(result.message);

            return;

        }

        alert("Registrasi berhasil. Silakan login.");

        window.location.href = "login.html";

    }

    catch (err) {

        console.error(err);

        alert("Server tidak dapat dihubungi.");

    }

});

/* =========================================
   DEBUG
========================================= */

console.log("Register Pembeli Loaded");