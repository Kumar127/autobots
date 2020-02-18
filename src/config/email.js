const nodemailer = require('nodemailer');

/* GMAIL SMTP CONFIG
module.exports.GmailTransport = nodemailer.createTransport({
    service: '',
    host: '',
    secure: '',
    port: '',
    auth: {
        user: '',
        pass: ''
    }
});
*/

/* DEFAULT SMTP CONFIG */
module.exports.SMTPTransport = nodemailer.createTransport({
    host: process.env.SMTP_SERVICE_HOST,
    port: process.env.SMTP_SERVICE_PORT,
});

module.exports.ViewOption = (transport, hbs) => {
    transport.use('compile', hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'src/views/email/',
            layoutsDir: 'src/views/email/',
          },
        viewPath: 'src/views/email/',
        extName: '.hbs'
    }));
}   