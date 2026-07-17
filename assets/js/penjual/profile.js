// ======================================
// PROFILE PENJUAL
// ======================================

const token = localStorage.getItem("token");

const profileImage =
document.getElementById("profileImage");

const sellerName =
document.getElementById("sellerName");

const sellerEmail =
document.getElementById("sellerEmail");

// ======================================
// CEK LOGIN
// ======================================

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

function getImageUrl(path){

    if(!path) return "";

    if(path.startsWith("http")){
        return path;
    }

    return API_URL + path;

}

// ======================================
// LOAD PROFILE
// ======================================

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

                result.message ||

                "Gagal memuat profile."

            );

        }

        sellerName.innerHTML =
            result.user.nama;

        sellerEmail.innerHTML =
            result.user.email;

        // ======================================
        // FOTO PROFILE
        // ======================================

        if (

            result.user.foto &&

            result.user.foto !== ""

        ) {

            profileImage.src =
            getImageUrl(result.user.foto);

        }

        else {

            profileImage.removeAttribute("src");

        }

        // ======================================
        // UPDATE LOCAL STORAGE
        // ======================================

        localStorage.setItem(

            "user",

            JSON.stringify(result.user)

        );

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

// ======================================
// EDIT PROFILE
// ======================================

document

.getElementById("editBtn")

.addEventListener(

    "click",

    function () {

        window.location.href =

            "edit-profile.html";

    }

);

// ======================================
// LOGOUT
// ======================================

document

.getElementById("logoutBtn")

.addEventListener(

    "click",

    function () {

        if (

            confirm("Yakin ingin logout?")

        ) {

            localStorage.clear();

            window.location.href =

                "login.html";

        }

    }

);

// ======================================
// DEBUG
// ======================================

console.log(

    "Profile Penjual Loaded"

);
