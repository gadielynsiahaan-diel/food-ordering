// ==========================================
// RATING
// ==========================================

const token =
localStorage.getItem("token");

const params =
new URLSearchParams(location.search);

const orderId =
params.get("order");

let rating = 0;

const stars =
document.querySelectorAll(".stars i");

stars.forEach(star=>{

    star.addEventListener(

        "click",

        ()=>{

            rating =
            Number(

                star.dataset.value

            );

            stars.forEach(s=>{

                if(

                    Number(s.dataset.value)<=rating

                ){

                    s.classList.add("active");

                }

                else{

                    s.classList.remove("active");

                }

            });

        }

    );

});

document

.getElementById("ratingForm")

.addEventListener(

"submit",

async function(e){

    e.preventDefault();

    if(rating===0){

        alert(

            "Silakan pilih rating."

        );

        return;

    }

    const komentar=

    document

    .getElementById("komentar")

    .value;

    try{

        const response=

        await fetch(

            `${API_URL}/review`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:token

                },

                body:JSON.stringify({

                    order_id:orderId,

                    rating,

                    komentar

                })

            }

        );

        const result=

        await response.json();

        if(!response.ok){

            throw new Error(

                result.message

            );

        }

        alert(

            "Terima kasih atas ulasan Anda."

        );

        window.location.href=

        "aktivitas.html";

    }

    catch(err){

        alert(

            err.message

        );

    }

});