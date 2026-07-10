/* ========================================= */
/* TERAS LA */
/* MAIN SCRIPT */
/* ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Food Ordering Teras LA Ready 🚀");

    animationCard();

    buttonEffect();

});

/* ========================================= */
/* CARD ANIMATION */
/* ========================================= */

function animationCard(){

    const cards = document.querySelectorAll(".role-card");

    cards.forEach(card=>{

        card.addEventListener("mouseenter",()=>{

            card.style.transform="translateY(-12px) scale(1.02)";

        });

        card.addEventListener("mouseleave",()=>{

            card.style.transform="translateY(0) scale(1)";

        });

    });

}

/* ========================================= */
/* BUTTON EFFECT */
/* ========================================= */

function buttonEffect(){

    const buttons=document.querySelectorAll(".btn-pembeli,.btn-penjual");

    buttons.forEach(button=>{

        button.addEventListener("click",()=>{

            button.innerHTML="Loading...";

        });

    });

}