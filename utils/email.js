const nodemailer = require('nodemailer');

// 1) Create a Transporter
const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    //Activatate in gmail "less secure app" option
  });

  //   2) Define the email options
  const mailOptions = {
    from: 'Hiren Patel <hirenlineshbhaipatel@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  //   3) send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
