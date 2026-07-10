// ==========================================
// KERANJANG PEMBELI
// ==========================================

const token = localStorage.getItem("token");

if (!token) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "login.html";

}

const container =
document.getElementById("cartContainer");

const total =
document.getElementById("totalHarga");

let cart = [];

// ==========================================
// URL GAMBAR
// ==========================================

function getImage(path){

    if(!path){

        return "../assets/img/logo.png";

    }

    if(path.startsWith("http")){

        return path;

    }

    return "http://localhost:3000"+path;

}

// ==========================================
// LOAD CART
// ==========================================

async function loadCart(){

    try{

        const response = await fetch(

            `${API_URL}/cart`,

            {

                method:"GET",

                headers:{

                    Authorization:token

                }

            }

        );

        const result = await response.json();

        console.log("Response Cart :", result);

        if(!response.ok){

            throw new Error(

                result.message ||

                "Gagal memuat keranjang."

            );

        }

        // ==========================
        // SUPPORT 2 FORMAT RESPONSE
        // ==========================

        if(Array.isArray(result)){

            cart = result;

        }

        else if(Array.isArray(result.cart)){

            cart = result.cart;

        }

        else{

            cart = [];

        }

        renderCart();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}

// ==========================================
// RENDER CART
// ==========================================

function renderCart(){

    container.innerHTML="";

    let totalHarga=0;

    if(cart.length===0){

        container.innerHTML=`

        <div class="empty-cart">

            <h2>

                🛒 Keranjang Masih Kosong

            </h2>

            <p>

                Silakan pilih menu terlebih dahulu.

            </p>

            <a

            href="dashboard.html"

            class="btn-back">

                Kembali Belanja

            </a>

        </div>

        `;

        total.innerHTML="Rp0";

        return;

    }

    cart.forEach(item=>{

        totalHarga +=

        Number(item.harga) *

        Number(item.qty);

        container.innerHTML +=`

        <div class="cart-item">

            <img

            src="${getImage(item.gambar)}"

            alt="${item.nama}">

            <div class="cart-info">

                <h3>

                    ${item.nama}

                </h3>

                <p class="price">

                    Rp${Number(item.harga).toLocaleString("id-ID")}

                </p>

                <div class="qty">

                    <button

                    onclick="kurang(${item.id},${item.qty})">

                        -

                    </button>

                    <span>

                        ${item.qty}

                    </span>

                    <button

                    onclick="tambah(${item.id},${item.qty})">

                        +

                    </button>

                </div>

                <textarea

                onchange="ubahCatatan(${item.id},this.value)"

                placeholder="Tambahkan catatan...">${item.catatan||""}</textarea>

                <button

                class="btn-delete"

                onclick="hapusItem(${item.id})">

                    Hapus

                </button>

            </div>

        </div>

        `;

    });

    total.innerHTML=

    "Rp"+

    totalHarga.toLocaleString("id-ID");

}

// ==========================================
// UPDATE CART
// ==========================================

async function updateCart(id,qty,catatan=""){

    try{

        await fetch(

            `${API_URL}/cart/${id}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:token

                },

                body:JSON.stringify({

                    qty,

                    catatan

                })

            }

        );

        loadCart();

    }

    catch(err){

        console.error(err);

    }

}

// ==========================================
// TAMBAH
// ==========================================

function tambah(id,qty){

    updateCart(

        id,

        qty+1

    );

}

// ==========================================
// KURANG
// ==========================================

function kurang(id,qty){

    if(qty<=1){

        return;

    }

    updateCart(

        id,

        qty-1

    );

}

// ==========================================
// CATATAN
// ==========================================

function ubahCatatan(id,value){

    const item=

    cart.find(

        c=>c.id==id

    );

    if(!item){

        return;

    }

    updateCart(

        id,

        item.qty,

        value

    );

}

// ==========================================
// HAPUS
// ==========================================

async function hapusItem(id){

    if(

        !confirm(

            "Hapus menu ini?"

        )

    ){

        return;

    }

    try{

        await fetch(

            `${API_URL}/cart/${id}`,

            {

                method:"DELETE",

                headers:{

                    Authorization:token

                }

            }

        );

        loadCart();

    }

    catch(err){

        console.error(err);

    }

}

// ==========================================
// CHECKOUT
// ==========================================

document

.getElementById("checkoutBtn")

.addEventListener(

    "click",

    ()=>{

        if(cart.length===0){

            alert(

                "Keranjang masih kosong."

            );

            return;

        }

        window.location.href=

        "checkout.html";

    }

);

// ==========================================
// START
// ==========================================

loadCart();

console.log("Keranjang Loaded");