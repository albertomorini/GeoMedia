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
        let htmlBody = fs.readFileSync("./email_body.html", 'utf-8')
        htmlBody = htmlBody?.replaceAll("$USERNAME", data?.USERNAME)
        htmlBody = htmlBody?.replaceAll("$OTP", data?.OTP.toString())

        mailOptions.html = htmlBody;
        let x = await transporter.sendMail(mailOptions);

        return [true, x.response]

    } catch (error) {
        console.log(error)
        return [false, error]
    }
}


send_email_otp("morini99@icloud.com",{"USERNAME":"hey","OTP":"05050"})

module.exports = {
    send_email_otp
}