// =====================================
// EDIT PROFILE PENJUAL
// =====================================

const token = localStorage.getItem("token");

const user = JSON.parse(

    localStorage.getItem("user")

);

if (!token || !user) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

// =====================================
// ELEMENT
// =====================================

const form = document.getElementById("profileForm");

const nama = document.getElementById("nama");

const email = document.getElementById("email");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const foto = document.getElementById("foto");

const previewFoto = document.getElementById("previewFoto");

const btnSimpan = document.getElementById("btnSimpan");

// =====================================
// DEFAULT PHOTO
// =====================================

previewFoto.src =

"https://ui-avatars.com/api/?name=" +

encodeURIComponent(user.nama) +

"&background=0E5DAA&color=ffffff&size=250";

// =====================================
// LOAD PROFILE
// =====================================

async function loadProfile() {

    try {

        const response = await fetch(

            `${API_URL}/auth/profile`,

            {

                headers: {

                    Authorization: token

                }

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.message

            );

        }

        nama.value = result.user.nama;

        email.value = result.user.email;

        if (result.user.foto) {

            previewFoto.src =

                "http://localhost:3000" +

                result.user.foto;

        }

        else{

            previewFoto.src =

            "https://ui-avatars.com/api/?name="+

            encodeURIComponent(result.user.nama)+

            "&background=0E5DAA&color=ffffff&size=250";

        }

    }

    catch (err) {

        console.error(err);

        alert(

            err.message ||

            "Gagal memuat profile."

        );

    }

}

loadProfile();

// =====================================
// PREVIEW FOTO
// =====================================

foto.addEventListener(

    "change",

    function () {

        if (

            this.files.length === 0

        ) return;

        previewFoto.src =

            URL.createObjectURL(

                this.files[0]

            );

    }

);

// =====================================
// SIMPAN
// =====================================

form.addEventListener(

    "submit",

    async function (e) {

        e.preventDefault();

        if (

            password.value !==

            confirmPassword.value

        ) {

            alert(

                "Konfirmasi password tidak sama."

            );

            return;

        }

        btnSimpan.disabled = true;

        btnSimpan.innerHTML =

            "Menyimpan...";

        try {

            const formData = new FormData();

            formData.append(

                "nama",

                nama.value.trim()

            );

            formData.append(

                "email",

                email.value.trim()

            );

            if (

                password.value.trim() !== ""

            ) {

                formData.append(

                    "password",

                    password.value

                );

            }

            if (

                foto.files.length > 0

            ) {

                formData.append(

                    "foto",

                    foto.files[0]

                );

            }

            const response = await fetch(

                `${API_URL}/auth/profile`,

                {

                    method: "PUT",

                    headers: {

                        Authorization: token

                    },

                    body: formData

                }

            );

            const result =

                await response.json();

            if (!response.ok) {

                throw new Error(

                    result.message

                );

            }

            localStorage.setItem(

                "user",

                JSON.stringify(

                    result.user

                )

            );

            alert(

                result.message

            );

            window.location.href =

                "profile.html";

        }

        catch (err) {

            console.error(err);

            alert(

                err.message ||

                "Terjadi kesalahan."

            );

        }

        finally {

            btnSimpan.disabled = false;

            btnSimpan.innerHTML =

                "Simpan Perubahan";

        }

    }

);