/* ========================================= */
/* DASHBOARD PEMBELI */
/* ========================================= */

const tenantContainer =
document.getElementById("tenantContainer");

const popularContainer =
document.getElementById("popularContainer");

let tenants = [];

/* ========================================= */
/* LOAD DATA */
/* ========================================= */

window.onload = async () => {

    await loadTenant();

    loadPopular();

    searchTenant();

};

/* ========================================= */
/* GET TENANT */
/* ========================================= */

async function loadTenant() {

    try {

        const response = await fetch(

            `${API_URL}/tenant`

        );

        tenants = await response.json();

        tenantContainer.innerHTML = "";

        tenants.forEach(item => {

            tenantContainer.innerHTML +=

                cardTenant(item);

        });

    }

    catch (err) {

        console.error(err);

    }

}

/* ========================================= */
/* TENANT POPULER */
/* ========================================= */

function loadPopular() {

    popularContainer.innerHTML = "";

    const popular = tenants.filter(item =>

        Number(item.rating || 0) >= 4.8

    );

    popular.forEach(item => {

        popularContainer.innerHTML +=

            cardTenant(item);

    });

}

/* ========================================= */
/* CARD TENANT */
/* ========================================= */

function cardTenant(item) {

    const logo =

        item.logo && item.logo !== ""

        ? "https://food-ordering-seven-rho.vercel.app" + item.logo

        : "";

    return `

    <div class="tenant-card">

        <div class="tenant-image">

            <img

                src="${logo}"

                alt="${item.nama}"

                onerror="this.style.display='none'"

            >

            <span class="status ${item.status}">

                ${item.status === "open" ? "Buka" : "Tutup"}

            </span>

        </div>

        <div class="tenant-body">

            <h3>

                ${item.nama}

            </h3>

            <div class="tenant-meta">

                <span>

                    ⭐ ${item.rating ?? "0.0"}

                </span>

            </div>

            <p>

                ${item.kategori}

            </p>

            <a

                href="menu-tenant.html?id=${item.id}"

                class="btn-menu"

            >

                Lihat Menu

            </a>

        </div>

    </div>

    `;

}

/* ========================================= */
/* SEARCH */
/* ========================================= */

function searchTenant() {

    const input =

        document.getElementById("searchInput");

    input.addEventListener(

        "keyup",

        () => {

            const keyword =

                input.value.toLowerCase();

            const hasil = tenants.filter(item =>

                item.nama.toLowerCase().includes(keyword)

                ||

                item.kategori.toLowerCase().includes(keyword)

            );

            tenantContainer.innerHTML = "";

            hasil.forEach(item => {

                tenantContainer.innerHTML +=

                    cardTenant(item);

            });

        }

    );

}

/* ========================================= */
/* PROFILE BUYER */
/* ========================================= */

const user =

JSON.parse(

localStorage.getItem("user")

);

const profile =

document.getElementById("profileImage");

if (

    profile &&

    user &&

    user.foto

) {

    profile.src =

        "https://food-ordering-seven-rho.vercel.app" +

        user.foto;

}

/* ========================================= */
/* DEBUG */
/* ========================================= */

console.log(

    "Dashboard Pembeli Loaded"

);
