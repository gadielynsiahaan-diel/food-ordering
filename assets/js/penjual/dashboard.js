// =====================================
// DASHBOARD PENJUAL
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

const sellerName =
document.getElementById("sellerName");

const tenantName =
document.getElementById("tenantName");

const emptyTenant =
document.getElementById("emptyTenant");

const dashboardMenu =
document.getElementById("dashboardMenu");

const totalMenu =
document.getElementById("totalMenu");

const pendapatanHari =
document.getElementById("pendapatanHari");

const pesananBaru =
document.getElementById("pesananBaru");

const ratingTenant =
document.getElementById("ratingTenant");

const profileImage =
document.querySelector(".profile");

// =====================================
// USER
// =====================================

sellerName.innerHTML =

`Halo, ${user.nama} 👋`;

if (

    profileImage &&

    user.foto

) {

    profileImage.src =
    getImageUrl(user.foto);

}

// =====================================
// START
// =====================================

window.addEventListener(

    "load",

    async () => {

        await loadTenant();

        await loadDashboard();

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

        if (

            response.status === 404

        ) {

            showEmptyTenant();

            return;

        }

        const result = await response.json();

        if (!response.ok) {

            showEmptyTenant();

            return;

        }

        const tenant =

            result.tenant ||

            result;

        tenantName.innerHTML =

            tenant.nama;

        emptyTenant.style.display =

            "none";

        dashboardMenu.style.display =

            "block";

    }

    catch (err) {

        console.error(err);

        showEmptyTenant();

    }

}

// =====================================
// LOAD DASHBOARD
// =====================================

async function loadDashboard() {

    try {

        const response = await fetch(

            `${API_URL}/dashboard`,

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

        const data =

            result.dashboard;

        pendapatanHari.innerHTML =

            "Rp" +

            Number(data.pendapatan)

            .toLocaleString("id-ID");

        pesananBaru.innerHTML =

            data.pesananBaru;

        totalMenu.innerHTML =

            data.totalMenu;

        ratingTenant.innerHTML =

            Number(data.rating)

            .toFixed(1);

    }

    catch (err) {

        console.error(err);

        pendapatanHari.innerHTML =

            "Rp0";

        pesananBaru.innerHTML =

            "0";

        totalMenu.innerHTML =

            "0";

        ratingTenant.innerHTML =

            "0.0";

    }

}

// =====================================
// EMPTY TENANT
// =====================================

function showEmptyTenant() {

    tenantName.innerHTML =

        "Belum memiliki tenant";

    emptyTenant.style.display =

        "block";

    dashboardMenu.style.display =

        "none";

    totalMenu.innerHTML =

        "0";

    pendapatanHari.innerHTML =

        "Rp0";

    pesananBaru.innerHTML =

        "0";

    ratingTenant.innerHTML =

        "0.0";

}

// =====================================
// REFRESH
// =====================================

async function refreshDashboard() {

    await loadTenant();

    await loadDashboard();

}

// =====================================
// BUTTON TENANT
// =====================================

const btnBuatTenant =

document.querySelector(

    "#emptyTenant a"

);

if (btnBuatTenant) {

    btnBuatTenant.addEventListener(

        "click",

        function () {

            window.location.href =

            "tenant.html";

        }

    );

}

// =====================================
// AUTO REFRESH
// =====================================

window.addEventListener(

    "focus",

    function () {

        refreshDashboard();

    }

);

// =====================================

console.log(

    "Dashboard Penjual Loaded"

);

console.log(

    "User Login:",

    user

);
