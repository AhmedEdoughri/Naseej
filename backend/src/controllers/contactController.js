const nodemailer = require("nodemailer");

exports.sendMessage = async (req, res) => {
  const { name, email, phone, message } = req.body; // Add phone here

  // Updated validation: check for name, message, and EITHER email OR phone
  if (!name || (!email && !phone) || !message) {
    return res.status(400).json({
      message:
        "Please provide your name, message, and either an email or phone number.",
    });
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Updated email template to include the phone number
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    subject: `New Contact Message from ${name}`,
    html: `
      <h2>New Message from Naseej Contact Form</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email || "Not provided"}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <hr>
      <h3>Message:</h3>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
};
