const nodemailer = require('nodemailer');

const sendMail = (email, mailSubject, body) => {

    const mailData = {
        from: {
            name: 'My Blogs',
            address: process.env.NODE_EMAIL
        },
        to: email,
        subject: mailSubject,
        text: body
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODE_EMAIL,
            pass: process.env.NODEMAIL_PASS
        }
    })


    transporter.sendMail(mailData, async (err, info) => {
        if (err) {
            console.log(err);
            return false;
        }
        else {
            console.log("Mail sent")
            return true;
        }
    })

    return true;
}

module.exports = sendMail;