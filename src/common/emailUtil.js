const hbs = require('nodemailer-express-handlebars');
const MailConfig = require('../config/email');

const smtpTransport = MailConfig.SMTPTransport

const emailUtil = {
  sendEmail: (to, subject, template, contextBody, callback) => {
    MailConfig.ViewOption(smtpTransport, hbs);

    const mailOptions = {
      from: 'SSA Admin <no-reply-autobots@basf.com>',
      to,
      subject,
      template,
      context: contextBody
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
      console.log(error);
      if (error) {
          callback(JSON.stringify(error), null);
      } else {
        callback(null, info);
      }
    });;

  },
  sendMultipleEmail: (mailList, subject, template, contextBody, callback) => {
    MailConfig.ViewOption(smtpTransport, hbs);
  
    const promises = [];
    for (let i = 0; i < mailList.length; i+= 1) {
        promises.push(new Promise( (resolve, reject) => {
          smtpTransport.sendMail({
                from: 'SSA Admin <no-reply-autobots@basf.com>',
                to: mailList[i].emailAddress,
                subject,
                template,
                context: {
                    userName: mailList[i].userName,
                    isInternalUser: mailList[i].isInternalUser,
                    data: contextBody
                }
            }, (err, info) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(info)
                }
            });
        }));
    }
    Promise.all(promises).then((infos) => { callback(null, infos) }, (err) => { callback(err) });
  }
} 


module.exports = emailUtil;