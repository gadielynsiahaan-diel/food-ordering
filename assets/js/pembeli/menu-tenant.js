// =====================================
// MENU TENANT PEMBELI
// =====================================

const params = new URLSearchParams(window.location.search);

const tenantId = params.get("id");

const menuContainer = document.getElementById("menuContainer");

let semuaMenu = [];

// =====================================
// URL GAMBAR
// =====================================

function getImage(path){

    if(!path){

        return "../assets/img/logo.png";

    }

    if(path.startsWith("http")){

        return path;

    }

    return "https://food-ordering-seven-rho.vercel.app"+path;

}

// =====================================
// LOAD
// =====================================

window.onload = async ()=>{

    await loadTenant();

    await loadMenu();

    searchMenu();

};

// =====================================
// LOAD TENANT
// =====================================

async function loadTenant(){

    try{

        const response = await fetch(

            `${API_URL}/tenant`

        );

        const tenants = await response.json();

        const tenant = tenants.find(

            item=>item.id==tenantId

        );

        if(!tenant){

            alert("Tenant tidak ditemukan.");

            window.location.href="dashboard.html";

            return;

        }

        document.getElementById("tenantTitle").innerHTML=

        tenant.nama;

        document.getElementById("tenantLogo").src=

        getImage(tenant.logo);

        document.getElementById("jamOperasional").innerHTML=

        `• ${tenant.jam_buka} - ${tenant.jam_tutup}`;

    }

    catch(err){

        console.log(err);

    }

}

// =====================================
// LOAD MENU
// =====================================

async function loadMenu(){

    try{

        const response = await fetch(

            `${API_URL}/menu/tenant/${tenantId}`

        );

        semuaMenu = await response.json();

        tampilMenu(semuaMenu);

    }

    catch(err){

        console.log(err);

    }

}

// =====================================
// RENDER MENU
// =====================================

function tampilMenu(data){

    menuContainer.innerHTML="";

    if(data.length===0){

        menuContainer.innerHTML=`

        <div class="empty-menu">

            <h2>Menu belum tersedia.</h2>

        </div>

        `;

        return;

    }

    data.forEach(item=>{

        menuContainer.innerHTML+=`

        <div class="menu-card">

            <img

            src="${getImage(item.gambar)}"

            alt="${item.nama}">

            <div class="menu-body">

                <h3>

                    ${item.nama}

                </h3>

                <p class="harga">

                    Rp${Number(item.harga).toLocaleString("id-ID")}

                </p>

                <p>

                    ${item.deskripsi}

                </p>

                <p>

                    Stok : ${item.stok}

                </p>

                <button

                class="btn-add"

                ${item.status==="Habis"?"disabled":""}

                onclick="tambahKeranjang(${item.id})">

                ${item.status==="Habis"

                ?"Menu Habis"

                :"Tambah"}

                </button>

            </div>

        </div>

        `;

    });

}

// =====================================
// SEARCH
// =====================================

function searchMenu(){

    document

    .getElementById("searchMenu")

    .addEventListener(

        "keyup",

        function(){

            const keyword=

            this.value.toLowerCase();

            const hasil=

            semuaMenu.filter(item=>

                item.nama

                .toLowerCase()

                .includes(keyword)

            );

            tampilMenu(hasil);

        }

    );

}

// =====================================
// CART
// =====================================

async function tambahKeranjang(id){

    const token = localStorage.getItem("token");

    if(!token){

        alert("Silakan login terlebih dahulu.");

        window.location.href = "login.html";

        return;

    }

    try{

        const response = await fetch(

            `${API_URL}/cart`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    "Authorization":token

                },

                body:JSON.stringify({

                    menu_id:id,

                    qty:1,

                    catatan:""

                })

            }

        );

        const result = await response.json();

        if(!response.ok){

            throw new Error(

                result.message ||

                "Gagal menambahkan ke keranjang."

            );

        }

        const item = semuaMenu.find(

            menu => menu.id == id

        );

        alert(

            item.nama +

            " berhasil ditambahkan ke keranjang."

        );

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}
