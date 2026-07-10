require("dotenv").config();

const emailService = require("./services/emailService");

async function testEmail() {

    try {

        await emailService.sendWelcomeEmail(

            "Gadielyn",

            "no011593@gmail.com"

        );

        console.log("Email berhasil dikirim.");

    } catch (err) {

        console.error(err);

    }

}

testEmail();