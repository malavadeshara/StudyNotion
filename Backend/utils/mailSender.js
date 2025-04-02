const nodemailer = require("modemailer");

const mailSender = async(email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from: "StudyNotion || Next Big Thing || Future of Edtech",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });
        console.log(info);
        return info;
    } catch(err) {
        console.log(err.message);
    }
}

module.exports = mailSender;