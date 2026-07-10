const mysql = require("mysql2/promise");

const fs = require("fs");

const path = require("path");

// =====================================
// SSL CERTIFICATE
// =====================================

const sslPath = path.join(

    __dirname,

    "isrgrootx1.pem"

);

// =====================================
// DATABASE POOL
// =====================================

const pool = mysql.createPool({

    host: process.env.DB_HOST,

    port: Number(process.env.DB_PORT),

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    enableKeepAlive: true,

    decimalNumbers: true,

    ssl: {

        ca: fs.existsSync(sslPath)

            ? fs.readFileSync(sslPath)

            : undefined,

        rejectUnauthorized: true

    }

});

// =====================================
// TEST CONNECTION
// =====================================

(async () => {

    try {

        const conn = await pool.getConnection();

        console.log("");

        console.log("===================================");

        console.log("✅ Database Connected");

        console.log(`📦 ${process.env.DB_NAME}`);

        console.log(`🌐 ${process.env.DB_HOST}`);

        console.log("===================================");

        console.log("");

        conn.release();

    } catch (err) {

        console.log("");

        console.log("===================================");

        console.log("❌ Database Connection Failed");

        console.log(err.message);

        console.log("===================================");

        console.log("");

    }

})();

// =====================================
// EXPORT
// =====================================

module.exports = pool;