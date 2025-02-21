// utils/mailSender.js
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: title,
            html: body,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error("Failed to send email");
    }
};



const generateWelcomeEmailTemplate = (userName) => {
    const mainColor = "#336a86";
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our System</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: ${mainColor};
                margin-bottom: 10px;
            }
            .tagline {
                font-size: 18px;
                color: #666;
                margin-top: 0;
            }
            .content {
                color: #333;
                line-height: 1.6;
            }
            .welcome-message {
                font-size: 24px;
                color: ${mainColor};
                margin-bottom: 20px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 14px;
            }
            .footer a {
                color: ${mainColor};
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="logo">Easier</h1>
                <p class="tagline">Simplifying your life</p>
            </div>
            <div class="content">
                <p class="welcome-message">Welcome, ${userName}!</p>
                <p>We're thrilled to have you join our system. Our goal is to make your experience as seamless and enjoyable as possible.</p>
                <p>If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!</p>
                <p>Thank you for choosing Easier. We look forward to serving you.</p>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Easier Team</p>
                <p><a href="https://eassier.com">Visit our website</a> for more information.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { mailSender, generateWelcomeEmailTemplate };
