const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Define the sendMail function
module.exports.sendMail = (email, subject, html) => {
  console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
  console.log(email);

  // Create a transporter object using Gmail as the service
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the mail options
  const mailOptions = {
    from: `Zing M3P <khanhhs11vtt@gmail.com>`,
    to: email,
    subject: subject,
    html: html,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
