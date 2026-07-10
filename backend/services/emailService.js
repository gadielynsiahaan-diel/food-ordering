const nodemailer = require("nodemailer");

// ======================================
// EMAIL TRANSPORTER
// ======================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});

// ======================================
// SEND EMAIL
// ======================================

exports.sendEmail = async (

    to,

    subject,

    html

) => {

    try {

        await transporter.sendMail({

            from: `"Teras LA Food Ordering" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html

        });

        console.log(

            `Email berhasil dikirim ke ${to}`

        );

    } catch (err) {

        console.error(

            "Gagal mengirim email:",

            err.message

        );

        throw err;

    }

};

// ======================================
// EMAIL REGISTER
// ======================================

exports.sendWelcomeEmail = async (

    nama,

    email

) => {

    const subject =

        "Selamat Datang di Teras LA 🎉";

    const html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

</head>

<body
style="
font-family:Poppins,Arial,sans-serif;
background:#f5f5f5;
padding:30px;
">

<div
style="
max-width:600px;
margin:auto;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 5px 20px rgba(0,0,0,.1);
">

<div
style="
background:#0F4C81;
padding:25px;
text-align:center;
">

<h1
style="
color:white;
margin:0;
">

TERAS LA

</h1>

<p
style="
color:white;
margin-top:8px;
">

Food Ordering

</p>

</div>

<div
style="
padding:35px;
">

<h2>

Halo ${nama} 👋

</h2>

<p>

Selamat!

Akun Anda berhasil dibuat.

</p>

<p>

Terima kasih telah bergabung bersama

<b>Teras LA Food Ordering</b>.

</p>

<p>

Sekarang Anda sudah dapat melakukan login
dan mulai memesan makanan favorit Anda.

</p>

<hr>

<p
style="
font-size:13px;
color:#888;
">

Email ini dikirim otomatis oleh sistem.

Mohon tidak membalas email ini.

</p>

</div>

</div>

</body>

</html>

`;

    return exports.sendEmail(

        email,

        subject,

        html

    );

};

// ======================================
// EMAIL LOGIN
// ======================================

exports.sendLoginEmail = async (

    nama,

    email

) => {

    const subject =

        "Login Berhasil";

    const html = `

<h2>

Halo ${nama}

</h2>

<p>

Akun Anda berhasil login ke

<b>Teras LA Food Ordering</b>.

</p>

<p>

Jika ini bukan Anda,

silakan segera ubah password akun.

</p>

`;

    return exports.sendEmail(

        email,

        subject,

        html

    );

};

// ======================================
// EMAIL PESANAN BARU
// ======================================

exports.sendOrderEmail = async (

    sellerEmail,

    sellerName,

    kodeOrder,

    buyerName

) => {

    const subject =

        "Pesanan Baru";

    const html = `

<h2>

Halo ${sellerName}

</h2>

<p>

Ada pesanan baru.

</p>

<p>

<b>Kode Order :</b>

${kodeOrder}

</p>

<p>

<b>Pembeli :</b>

${buyerName}

</p>

<p>

Silakan buka dashboard penjual
untuk memproses pesanan.

</p>

`;

    return exports.sendEmail(

        sellerEmail,

        subject,

        html

    );

};

// ======================================
// EMAIL STATUS PESANAN
// ======================================

exports.sendStatusEmail = async (

    buyerEmail,

    buyerName,

    status

) => {

    const subject =

        "Update Status Pesanan";

    const html = `

<h2>

Halo ${buyerName}

</h2>

<p>

Status pesanan Anda telah berubah menjadi

<b>

${status}

</b>

</p>

<p>

Terima kasih telah menggunakan
Teras LA Food Ordering.

</p>

`;

    return exports.sendEmail(

        buyerEmail,

        subject,

        html

    );

};