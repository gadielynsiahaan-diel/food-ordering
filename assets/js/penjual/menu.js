// ======================================
// MENU PENJUAL
// ======================================

const token = localStorage.getItem("token");

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

// ======================================
// CONFIG
// ======================================

const form = document.getElementById("menuForm");

const menuList = document.getElementById("menuList");

const btnMenu = document.getElementById("btnMenu");

const fotoMenu = document.getElementById("fotoMenu");

const previewFoto = document.getElementById("previewFoto");

let tenant = null;

let editId = null;

// ======================================
// VALIDASI FILE
// ======================================

const MAX_SIZE =

5 * 1024 * 1024;

const ALLOWED_TYPES = [

    "image/jpeg",

    "image/jpg",

    "image/png",

    "image/webp"

];

// ======================================
// PREVIEW FOTO
// ======================================

fotoMenu.addEventListener(

    "change",

    function () {

        const file = this.files[0];

        if (!file) {

            previewFoto.src = "";

            previewFoto.style.display = "none";

            return;

        }

        if (

            !ALLOWED_TYPES.includes(

                file.type

            )

        ) {

            alert(

                "Foto harus JPG, PNG atau WEBP."

            );

            this.value = "";

            previewFoto.style.display = "none";

            return;

        }

        if (

            file.size >

            MAX_SIZE

        ) {

            alert(

                "Ukuran maksimal 5 MB."

            );

            this.value = "";

            previewFoto.style.display = "none";

            return;

        }

        previewFoto.src =

            URL.createObjectURL(file);

        previewFoto.style.display =

            "block";

    }

);

// ======================================
// LOAD TENANT
// ======================================

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

            alert(

                "Silakan buat tenant terlebih dahulu."

            );

            window.location.href =

                "tenant.html";

            return;

        }

        const result =

            await response.json();

        tenant =

            result.tenant || result;

        loadMenu();

    }

    catch (err) {

        console.error(err);

        alert(

            "Gagal mengambil data tenant."

        );

    }

}

// ======================================
// LOAD MENU
// ======================================

async function loadMenu() {

    try {

        const response = await fetch(

            `${API_URL}/menu/my`,

            {

                headers: {

                    Authorization: token

                }

            }

        );

        const result =

            await response.json();

        if (!response.ok) {

            throw new Error(

                result.message

            );

        }

        renderMenu(

            result.menus || result

        );

    }

    catch (err) {

        console.error(err);

    }

}

// ======================================
// SIMPAN / UPDATE MENU
// ======================================

form.addEventListener(

    "submit",

    async function (e) {

        e.preventDefault();

        btnMenu.disabled = true;

        btnMenu.innerHTML =

            "Menyimpan...";

        try {

            const formData =

                new FormData();

            formData.append(

                "nama",

                document.getElementById("namaMenu").value.trim()

            );

            formData.append(

                "harga",

                document.getElementById("hargaMenu").value

            );

            formData.append(

                "kategori",

                document.getElementById("kategoriMenu").value

            );

            formData.append(

                "deskripsi",

                document.getElementById("deskripsiMenu").value.trim()

            );

            formData.append(

                "stok",

                document.getElementById("stokMenu").value

            );

            formData.append(

                "status",

                document.getElementById("statusMenu").value

            );

            if (

                fotoMenu.files.length > 0

            ) {

                formData.append(

                    "gambar",

                    fotoMenu.files[0]

                );

            }

            let response;

            if (editId) {

                response = await fetch(

                    `${API_URL}/menu/${editId}`,

                    {

                        method: "PUT",

                        headers: {

                            Authorization: token

                        },

                        body: formData

                    }

                );

            }

            else {

                response = await fetch(

                    `${API_URL}/menu`,

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

            if (!response.ok) {

                throw new Error(

                    result.message

                );

            }

            alert(result.message);

            resetForm();

            loadMenu();

        }

        catch (err) {

            console.error(err);

            alert(err.message);

        }

        finally {

            btnMenu.disabled = false;

        }

    }

);

// ======================================
// RENDER MENU
// ======================================

function renderMenu(data) {

    menuList.innerHTML = "";

    if (!data || data.length === 0) {

        menuList.innerHTML = `

            <p style="text-align:center">

                Belum ada menu.

            </p>

        `;

        return;

    }

    data.forEach(item => {

        menuList.innerHTML += `

        <div class="menu-item">

            <img

                class="menu-image"

                src="${item.gambar || ""}"

                alt="${item.nama}">

            <div class="menu-content">

                <h3>

                    ${item.nama}

                </h3>

                <p>

                    Rp ${Number(item.harga).toLocaleString("id-ID")}

                </p>

                <p>

                    ${item.kategori}

                </p>

                <p>

                    Stok : ${item.stok}

                </p>

                <p>

                    Status :

                    <b>${item.status}</b>

                </p>

            </div>

            <div class="menu-action">

                <button

                    class="edit"

                    onclick="editMenu(${item.id})">

                    Edit

                </button>

                <button

                    class="delete"

                    onclick="hapusMenu(${item.id})">

                    Hapus

                </button>

            </div>

        </div>

        `;

    });

}

// ======================================
// EDIT MENU
// ======================================

async function editMenu(id) {

    try {

        const response = await fetch(

            `${API_URL}/menu/${id}`,

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

        const item =

            result.menu || result;

        editId = item.id;

        document.getElementById("namaMenu").value = item.nama;

        document.getElementById("hargaMenu").value = item.harga;

        document.getElementById("kategoriMenu").value = item.kategori;

        document.getElementById("deskripsiMenu").value = item.deskripsi;

        document.getElementById("stokMenu").value = item.stok;

        document.getElementById("statusMenu").value = item.status;

        if (item.gambar) {

            previewFoto.src =
                item.gambar;

            previewFoto.style.display =

                "block";

        }

        else {

            previewFoto.src = "";

            previewFoto.style.display =

                "none";

        }

        btnMenu.innerHTML =

            "Update Menu";

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

// ======================================
// HAPUS MENU
// ======================================

async function hapusMenu(id) {

    if (

        !confirm(

            "Yakin ingin menghapus menu ini?"

        )

    ) {

        return;

    }

    try {

        const response = await fetch(

            `${API_URL}/menu/${id}`,

            {

                method: "DELETE",

                headers: {

                    Authorization: token

                }

            }

        );

        const result =

            await response.json();

        if (!response.ok) {

            throw new Error(

                result.message

            );

        }

        alert(

            result.message

        );

        loadMenu();

    }

    catch (err) {

        console.error(err);

        alert(

            err.message

        );

    }

}

// ======================================
// RESET FORM
// ======================================

function resetForm() {

    form.reset();

    editId = null;

    previewFoto.src = "";

    previewFoto.style.display = "none";

    btnMenu.innerHTML = "Tambah Menu";

}

// ======================================
// REFRESH MENU
// ======================================

async function refreshMenu() {

    await loadMenu();

}

// ======================================
// AUTO REFRESH
// ======================================

window.addEventListener(

    "focus",

    function () {

        refreshMenu();

    }

);

// ======================================
// LOAD PERTAMA
// ======================================

loadTenant();

// ======================================
// DEBUG
// ======================================

console.log(

    "Menu Penjual Loaded"

);

console.log(

    "Token :",

    token

);

// ======================================
// START
// ======================================

loadTenant();
