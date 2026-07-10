/* ==========================================
   LOGIN PEMBELI
========================================== */

// ==========================================
// ELEMENT
// ==========================================

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

// ==========================================
// CEK CONFIG
// ==========================================

if (typeof API_URL === "undefined") {

    alert("Config API belum dimuat.");
    throw new Error("API_URL is not defined");

}

// ==========================================
// SUDAH LOGIN?
// ==========================================

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (token && user) {

    window.location.href = "dashboard.html";

}

// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

if (togglePassword) {

    togglePassword.addEventListener("click", function () {

        if (password.type === "password") {

            password.type = "text";

            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add("fa-eye-slash");

        } else {

            password.type = "password";

            togglePassword.classList.remove("fa-eye-slash");
            togglePassword.classList.add("fa-eye");

        }

    });

}

// ==========================================
// LOGIN
// ==========================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    try {

        const response = await fetch(

            `${API_URL}/auth/login`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email: email.value.trim(),

                    password: password.value

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            alert(result.message || "Email atau Password salah.");

            return;

        }

        // ======================================
        // HANYA ROLE BUYER
        // ======================================

        if (result.user.role !== "buyer") {

            alert("Silakan login menggunakan akun pembeli.");

            return;

        }

        // ======================================
        // SIMPAN LOGIN
        // ======================================

        localStorage.setItem(

            "token",

            result.token

        );

        localStorage.setItem(

            "user",

            JSON.stringify(result.user)

        );

        alert("Login berhasil.");

        window.location.href = "dashboard.html";

    }

    catch (err) {

        console.error(err);

        alert("Tidak dapat terhubung ke server.");

    }

});

// ==========================================
// DEBUG
// ==========================================

console.log("Login Pembeli Loaded");