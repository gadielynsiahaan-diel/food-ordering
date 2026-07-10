// =====================================
// KELOLA TENANT
// =====================================

const form = document.getElementById("tenantForm");

const token = localStorage.getItem("token");

let tenantId = null;

// =====================================
// API
// =====================================

const BASE_URL = API_URL.replace("/api", "");

// =====================================
// LOGIN
// =====================================

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

// =====================================
// ELEMENT
// =====================================

const namaTenant =

document.getElementById("namaTenant");

const kategori =

document.getElementById("kategori");

const deskripsi =

document.getElementById("deskripsi");

const jamBuka =

document.getElementById("jamBuka");

const jamTutup =

document.getElementById("jamTutup");

const status =

document.getElementById("status");

const logo =

document.getElementById("logo");

const banner =

document.getElementById("banner");

const previewLogo =

document.getElementById("previewLogo");

const previewBanner =

document.getElementById("previewBanner");

const btnSimpan =

document.getElementById("btnSimpan");

// =====================================
// VALIDASI FILE
// =====================================

const MAX_SIZE =

5 * 1024 * 1024;

const ALLOWED_TYPES = [

    "image/png",

    "image/jpeg",

    "image/jpg",

    "image/webp"

];

// =====================================
// PREVIEW LOGO
// =====================================

logo.addEventListener(

    "change",

    function () {

        const file =

        this.files[0];

        if (!file) return;

        if (

            !ALLOWED_TYPES.includes(

                file.type

            )

        ) {

            alert(

                "Logo harus berupa PNG, JPG, JPEG atau WEBP."

            );

            this.value = "";

            return;

        }

        if (

            file.size >

            MAX_SIZE

        ) {

            alert(

                "Ukuran logo maksimal 5 MB."

            );

            this.value = "";

            return;

        }

        previewLogo.src =

        URL.createObjectURL(file);

    }

);

// =====================================
// PREVIEW BANNER
// =====================================

banner.addEventListener(

    "change",

    function () {

        const file =

        this.files[0];

        if (!file) return;

        if (

            !ALLOWED_TYPES.includes(

                file.type

            )

        ) {

            alert(

                "Banner harus berupa PNG, JPG, JPEG atau WEBP."

            );

            this.value = "";

            return;

        }

        if (

            file.size >

            MAX_SIZE

        ) {

            alert(

                "Ukuran banner maksimal 5 MB."

            );

            this.value = "";

            return;

        }

        previewBanner.src =

        URL.createObjectURL(file);

    }

);

// =====================================
// LOAD TENANT
// =====================================

async function loadTenant() {

    try {

        const response = await fetch(

            `${API_URL}/tenant/me`,

            {

                headers: {

                    Authorization: token

                }

            }

        );

        if (!response.ok) {

            return;

        }

        const result = await response.json();

        const tenant = result.tenant || result;

        if (!tenant) {

            return;

        }

        tenantId = tenant.id;

        namaTenant.value = tenant.nama || "";

        kategori.value = tenant.kategori || "";

        deskripsi.value = tenant.deskripsi || "";

        jamBuka.value = tenant.jam_buka || "";

        jamTutup.value = tenant.jam_tutup || "";

        status.value = tenant.status || "Aktif";

        if (tenant.logo && tenant.logo !== "") {

            previewLogo.src = BASE_URL + tenant.logo;

        }

        if (tenant.banner && tenant.banner !== "") {

            previewBanner.src = BASE_URL + tenant.banner;

        }

        btnSimpan.innerHTML = "Update Tenant";

    }

    catch (err) {

        console.error(err);

    }

}

loadTenant();

// =====================================
// SIMPAN / UPDATE TENANT
// =====================================

form.addEventListener(

    "submit",

    async function (e) {

        e.preventDefault();

        // ===============================
        // VALIDASI
        // ===============================

        if (namaTenant.value.trim() === "") {

            alert("Nama tenant wajib diisi.");

            namaTenant.focus();

            return;

        }

        if (jamBuka.value >= jamTutup.value) {

            alert("Jam tutup harus lebih besar dari jam buka.");

            jamTutup.focus();

            return;

        }

        // ===============================
        // LOADING
        // ===============================

        btnSimpan.disabled = true;

        btnSimpan.innerHTML =

            "Menyimpan...";

        try {

            const formData =

                new FormData();

            // ===============================
            // TEXT
            // ===============================

            formData.append(

                "nama",

                namaTenant.value.trim()

            );

            formData.append(

                "kategori",

                kategori.value

            );

            formData.append(

                "deskripsi",

                deskripsi.value.trim()

            );

            formData.append(

                "jam_buka",

                jamBuka.value

            );

            formData.append(

                "jam_tutup",

                jamTutup.value

            );

            formData.append(

                "status",

                status.value

            );

            // ===============================
            // LOGO
            // ===============================

            if (

                logo.files.length > 0

            ) {

                formData.append(

                    "logo",

                    logo.files[0]

                );

            }

            // ===============================
            // BANNER
            // ===============================

            if (

                banner.files.length > 0

            ) {

                formData.append(

                    "banner",

                    banner.files[0]

                );

            }

            let response;

            // ===============================
            // UPDATE
            // ===============================

            if (tenantId) {

                response =

                    await fetch(

                        `${API_URL}/tenant/${tenantId}`,

                        {

                            method: "PUT",

                            headers: {

                                Authorization: token

                            },

                            body: formData

                        }

                    );

            }

            // ===============================
            // CREATE
            // ===============================

            else {

                response =

                    await fetch(

                        `${API_URL}/tenant`,

                        {

                            method: "POST",

                            headers: {

                                Authorization: token

                            },

                            body: formData

                        }

                    );

            }

            const result =

                await response.json();

            // ===============================
            // ERROR
            // ===============================

            if (!response.ok) {

                throw new Error(

                    result.message ||

                    "Terjadi kesalahan."

                );

            }

            // ===============================
            // SUCCESS
            // ===============================

            alert(

                result.message

            );

            window.location.href =

                "dashboard.html";

        }

        catch (err) {

            console.error(err);

            alert(

                err.message ||

                "Gagal terhubung ke server."

            );

        }

        finally {

            btnSimpan.disabled = false;

            btnSimpan.innerHTML =

                tenantId

                ?

                "Update Tenant"

                :

                "Simpan Tenant";

        }

    }
);

// =====================================
// VALIDASI JAM
// =====================================

jamBuka.addEventListener("change", validateTime);

jamTutup.addEventListener("change", validateTime);

function validateTime() {

    if (

        jamBuka.value &&

        jamTutup.value &&

        jamBuka.value >= jamTutup.value

    ) {

        alert(

            "Jam tutup harus lebih besar dari jam buka."

        );

        jamTutup.value = "";

        jamTutup.focus();

    }

}

// =====================================
// TRIM INPUT
// =====================================

namaTenant.addEventListener(

    "blur",

    () => {

        namaTenant.value =

            namaTenant.value.trim();

    }

);

// =====================================
// DEFAULT IMAGE
// =====================================

previewLogo.onerror = null;
previewBanner.onerror = null;

// =====================================
// RESET FORM
// =====================================

function resetForm() {

    form.reset();

    tenantId = null;

    previewLogo.src =

        "../assets/img/default-tenant.jpg";

    previewBanner.src =

        "../assets/img/banner1.jpg";

    btnSimpan.innerHTML =

        "Simpan Tenant";

}

// =====================================
// PAGE READY
// =====================================

window.addEventListener(

    "load",

    () => {

        console.log(

            "Kelola Tenant Loaded"

        );

    }

);