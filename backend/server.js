require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ======================================
// SECURITY
// ======================================

app.disable("x-powered-by");

// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());

app.use(express.json({

    limit: "10mb"

}));

app.use(express.urlencoded({

    extended: true,

    limit: "10mb"

}));

// ======================================
// STATIC
// ======================================

app.use(

    "/uploads",

    express.static(

        path.join(__dirname, "uploads")

    )

);

// ======================================
// ROUTES
// ======================================

app.use("/api/auth", require("./routes/auth"));

app.use("/api/tenant", require("./routes/tenant"));

app.use("/api/menu", require("./routes/menu"));

app.use("/api/cart", require("./routes/cart"));

app.use("/api/order", require("./routes/order"));

app.use("/api/review", require("./routes/review"));

app.use("/api/payment", require("./routes/payment"));

app.use("/api/dashboard", require("./routes/dashboard"));

// ======================================
// ROOT
// ======================================

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message: "🚀 Food Ordering API"

    });

});

// ======================================
// HEALTH CHECK
// ======================================

app.get("/health", (req, res) => {

    res.status(200).json({

        success: true,

        message: "API Running"

    });

});

// ======================================
// 404
// ======================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Endpoint tidak ditemukan."

    });

});

// ======================================
// ERROR
// ======================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Server Error"

    });

});

// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");

    console.log("===================================");

    console.log("🚀 Food Ordering API");

    console.log(`🌐 http://localhost:${PORT}`);

    console.log("===================================");

    console.log("");

});