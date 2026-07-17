/* ==========================================
   PROFILE PEMBELI
========================================== */

const token = localStorage.getItem("token");

const profileImage =
document.getElementById("profileImage");

const namaUser =
document.getElementById("namaUser");

const emailUser =
document.getElementById("emailUser");

const editBtn =
document.getElementById("editBtn");

const logoutBtn =
document.getElementById("logoutBtn");

/* ==========================================
   URL GAMBAR
========================================== */

function getImageUrl(path){

    if(!path){
        return "";
    }

    if(path.startsWith("http")){
        return path;
    }

    return API_URL + path;

}

/* ==========================================
   BELUM LOGIN
========================================== */

if (!token) {

    namaUser.innerHTML =
    "Guest";

    emailUser.innerHTML =
    "Belum Login";

    editBtn.innerHTML =
    "Login";

    logoutBtn.style.display =
    "none";

    profileImage.style.display =
    "none";

}
else{

    loadProfile();

}

/* ==========================================
   LOAD PROFILE
========================================== */

async function loadProfile(){

    try{

        const response = await fetch(

            `${API_URL}/auth/profile`,

            {

                headers:{

                    Authorization:token

                }

            }

        );

        const result =
        await response.json();

        if(!response.ok){

            throw new Error(

                result.message

            );

        }

        namaUser.innerHTML =
        result.user.nama;

        emailUser.innerHTML =
        result.user.email;

        editBtn.innerHTML =
        "Edit Profile";

        logoutBtn.style.display =
        "block";

        profileImage.style.display =
        "block";

        if(result.user.foto){

             profileImage.src =
         
             getImageUrl(result.user.foto);
         
         }

        localStorage.setItem(

            "user",

            JSON.stringify(

                result.user

            )

        );

    }

    catch(err){

        console.error(err);

        alert(

            "Gagal memuat profile."

        );

    }

}

/* ==========================================
   EDIT PROFILE
========================================== */

editBtn.addEventListener(

    "click",

    function(){

        if(!token){

            window.location.href=

            "login.html";

            return;

        }

        window.location.href=

        "edit-profile.html";

    }

);

/* ==========================================
   LOGOUT
========================================== */

logoutBtn.addEventListener(

    "click",

    function(){

        if(

            !confirm(

                "Yakin ingin logout?"

            )

        ){

            return;

        }

        localStorage.removeItem(

            "token"

        );

        localStorage.removeItem(

            "user"

        );

        localStorage.removeItem(

            "cart"

        );

        alert(

            "Logout berhasil."

        );

        window.location.href=

        "../index.html";

    }

);

/* ==========================================
   DEBUG
========================================== */

console.log(

    "Profile Pembeli Loaded"

);
