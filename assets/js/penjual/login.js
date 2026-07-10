// =====================================
// LOGIN PENJUAL
// =====================================

const form = document.getElementById("loginForm");

const btnLogin = document.getElementById("btnLogin");

// =====================================
// LOGIN
// =====================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("password")
        .value;

    if (!email || !password) {

        alert("Email dan password wajib diisi.");

        return;

    }

    btnLogin.disabled = true;

    btnLogin.innerHTML = "Sedang Login...";

    try {

        const response = await fetch(

            `${API_URL}/auth/login`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email,

                    password

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.message ||

                "Login gagal."

            );

        }

        // ==========================
        // VALIDASI ROLE
        // ==========================

        if (result.user.role !== "seller") {

            throw new Error(

                "Akun ini bukan akun penjual."

            );

        }

        // ==========================
        // SIMPAN DATA LOGIN
        // ==========================

        localStorage.setItem(

            "token",

            result.token

        );

        localStorage.setItem(

            "user",

            JSON.stringify(result.user)

        );

        alert("Login berhasil.");

        // ==========================
        // REDIRECT
        // ==========================

        window.location.href = "./dashboard.html";

    }

    catch (err) {

        console.error(err);

        alert(

            err.message ||

            "Tidak dapat terhubung ke server."

        );

    }

    finally {

        btnLogin.disabled = false;

        btnLogin.innerHTML = "Masuk";

    }

});