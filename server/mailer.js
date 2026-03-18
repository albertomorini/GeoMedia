process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const nodemailer = require('nodemailer');
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config.json"))

var transporter = nodemailer.createTransport(config.EMAIL.SMTP);

async function send_email_otp(recipient, data) {
    try {
        var mailOptions = {
            from: {
                name: 'GeoMedia app',
                address: 'albmor.dev@gmail.com'
            },
            to: recipient,
            subject: "GeoMedia app - OTP",
            attachments: []
        };

        // mailOptions.attachments.push({
        //     filename: PDF_Name,
        //     path: PDF_Path
        // })

        let htmlBody = fs.readFileSync("./email_body.html", 'utf-8')
        htmlBody = htmlBody?.replaceAll("$USERNAME", data?.USERNAME)
        htmlBody = htmlBody?.replaceAll("$OTP", data?.OTP)

        mailOptions.html = htmlBody;
        let x = await transporter.sendMail(mailOptions);
        console.log(x);

        return [true, x.response]

    } catch (error) {
        return [false, error]
    }
}

module.exports = {
    send_email_otp
}