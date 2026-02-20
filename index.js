import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'failed', response: 'Method not allowed' });
    }

    const { name, email, phone, company, message } = req.body; 

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ status: 'failed', response: 'Name, email, and message are required fields' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'failed', response: 'Invalid email format.' });
    }

    try {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT || 587,
          secure: process.env.MAIL_PORT == 465,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"Karken Company Website" <${process.env.MAIL_USER}>`,
          to: process.env.MAIL_USER,
          replyTo: email,
          subject: `New Contact Form Submission from ${name} | Karken Company`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Contact Form Submission</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="min-width: 100%; background-color: #f4f4f4;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <!-- Main Container -->
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #1e3a34; padding: 30px 30px; border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 500; letter-spacing: -0.3px;">New Contact Form Submission</h1>
                          <p style="margin: 8px 0 0 0; color: #bfa14a; font-size: 15px;">You've received a new message from your website</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 30px;">
                          
                          <!-- Submission Date -->
                          <p style="margin: 0 0 25px 0; color: #888888; font-size: 14px; border-bottom: 1px solid #eeeeee; padding-bottom: 15px;">
                            Received: ${new Date().toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          
                          <!-- Contact Details -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                            <tr>
                              <td style="padding: 0 0 10px 0;">
                                <h2 style="margin: 0; color: #1e3a34; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Information</h2>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Name:</td>
                                    <td style="color: #333333; font-size: 14px; font-weight: 500;">${name}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Email:</td>
                                    <td style="color: #333333; font-size: 14px;">
                                      <a href="mailto:${email}" style="color: #bfa14a; text-decoration: none;">${email}</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ${phone && phone !== 'Not provided' ? `
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Phone:</td>
                                    <td style="color: #333333; font-size: 14px;">${phone}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                            ${company && company !== 'Not provided' ? `
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Company:</td>
                                    <td style="color: #333333; font-size: 14px;">${company}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                          
                          <!-- Message -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 15px 0 10px 0;">
                                <h2 style="margin: 0; color: #1e3a34; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message</h2>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #f9f9f9; padding: 20px; border-radius: 4px;">
                                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Reply Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding: 30px 0 15px 0;">
                                <a href="mailto:${email}?subject=Re: Karken Company Inquiry" style="display: inline-block; background-color: #bfa14a; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 15px;">Reply to ${name.split(' ')[0]}</a>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #eaeaea;">
                          <table width="100%">
                            <tr>
                              <td style="color: #666666; font-size: 13px; line-height: 1.5;">
                                <strong style="color: #1e3a34; display: block; margin-bottom: 5px;">Karken Company, UAB</strong>
                                Smolensko g. 10-95<br>
                                Vilnius, LT-04312<br>
                                Lithuania
                              </td>
                              <td align="right" style="color: #666666; font-size: 13px;">
                                <a href="mailto:hello@karkencompany.lt" style="color: #bfa14a; text-decoration: none; display: block; margin-bottom: 3px;">hello@karkencompany.lt</a>
                                <span style="color: #999999;">+370 604 87253</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                    </table>
                    
                    <!-- Legal Note -->
                    <table width="600" style="max-width: 600px; width: 100%; margin-top: 15px;">
                      <tr>
                        <td style="padding: 10px; text-align: center; color: #aaaaaa; font-size: 12px;">
                          Company code: 306200112 • VAT: LT100014619511<br>
                          This email was sent from the contact form on karkencompany.lt
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
          text: `
NEW CONTACT FORM SUBMISSION
============================
Received: ${new Date().toLocaleString()}

CONTACT INFORMATION
-------------------
Name: ${name}
Email: ${email}
${phone && phone !== 'Not provided' ? `Phone: ${phone}` : ''}
${company && company !== 'Not provided' ? `Company: ${company}` : ''}

MESSAGE
-------
${message}

---
This message was sent from the contact form on karkencompany.lt

Karken Company, UAB
Smolensko g. 10-95, Vilnius, LT-04312
Email: hello@karkencompany.lt | Tel: +370 604 87253
Reg. code: 306200112 | VAT: LT100014619511
          `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ status: 'success', response: 'Message sent successfully' });

    } catch (error) { 
        console.error('Email error:', error);
        return res.status(500).json({ status: 'failed', response: `Mailer Error: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});