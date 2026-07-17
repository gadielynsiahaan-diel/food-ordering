/* ==========================================
   EDIT PROFILE PEMBELI
========================================== */

const token = localStorage.getItem("token");

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

// ==========================================
// ELEMENT
// ==========================================

const form = document.getElementById("profileForm");

const nama = document.getElementById("nama");

const email = document.getElementById("email");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const foto = document.getElementById("foto");

const previewImage = document.getElementById("previewImage");

// ==========================================
// URL GAMBAR
// ==========================================

function getImageUrl(path){

    if(!path){
        return "";
    }

    if(path.startsWith("http")){
        return path;
    }

    return API_URL + path;

}

// ==========================================
// LOAD PROFILE
// ==========================================

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

        const result = await response.json();

        if(!response.ok){

            throw new Error(result.message);

        }

        nama.value = result.user.nama;

        email.value = result.user.email;

        if(result.user.foto){

             previewImage.src =
         
             getImageUrl(result.user.foto);
         
         }

    }

    catch(err){

        console.error(err);

        alert("Gagal memuat profile.");

    }

}

loadProfile();

// ==========================================
// PREVIEW FOTO
// ==========================================

foto.addEventListener(

    "change",

    function(){

        const file =

        this.files[0];

        if(file){

            previewImage.src =

            URL.createObjectURL(file);

        }

    }

);

// ==========================================
// SIMPAN
// ==========================================

form.addEventListener(

    "submit",

    async function(e){

        e.preventDefault();

        if(

            password.value !==

            confirmPassword.value

        ){

            alert(

                "Konfirmasi password tidak sama."

            );

            return;

        }

        try{

            const formData =

            new FormData();

            formData.append(

                "nama",

                nama.value

            );

            formData.append(

                "email",

                email.value

            );

            if(

                password.value.trim()

                !==""

            ){

                formData.append(

                    "password",

                    password.value

                );

            }

            if(

                foto.files.length>0

            ){

                formData.append(

                    "foto",

                    foto.files[0]

                );

            }

            const response =

            await fetch(

                `${API_URL}/auth/profile`,

                {

                    method:"PUT",

                    headers:{

                        Authorization:token

                    },

                    body:formData

                }

            );

            const result =

            await response.json();

            if(!response.ok){

                alert(result.message);

                return;

            }

            localStorage.setItem(

                "user",

                JSON.stringify(

                    result.user

                )

            );

            alert(

                "Profile berhasil diperbarui."

            );

            window.location.href=

            "profile.html";

        }

        catch(err){

            console.error(err);

            alert(

                "Terjadi kesalahan."

            );

        }

    }

);

console.log(

    "Edit Profile Pembeli Loaded"

);
