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

    if (!name || !email || !phone || !company || !message) {
        return res.status(400).json({ status: 'failed', response: 'All fields are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'failed', response: 'Invalid email format.' });
    }

    try {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,  // 
          port: process.env.MAIL_PORT || 587,
          secure: process.env.MAIL_PORT == 465, // 
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.MAIL_USER,
          to: process.env.MAIL_USER,
          subject: `Karken Company Contact from ${name}`,
          html: `
          <div style="background: #fffbe9; font-family: 'Segoe UI', Arial, sans-serif; color: #222; padding: 0; margin: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #fffbe9; padding: 0; margin: 0;">
              <tr>
                <td align="center" style="padding: 40px 0 20px 0;">
                  <img src="https://karkencompany.lt/assets/hero-nigerian-food-Cy9PSjBa.jpg" alt="Karken Company" style="max-width: 180px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                </td>
              </tr>
              <tr>
                <td align="center">
                  <h2 style="color: #1e3a34; margin-bottom: 8px; font-size: 2rem;">Nauja užklausa iš Karken Company svetainės</h2>
                  <p style="color: #4b3c1a; font-size: 1.1rem; margin-top: 0;">Gavote naują žinutę iš kontaktų formos.</p>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(30,58,52,0.07); padding: 32px 24px; margin: 24px auto; min-width: 320px; max-width: 420px;">
                    <tr><td style="padding: 8px 0;"><strong style="color: #1e3a34;">Vardas:</strong> ${name}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong style="color: #1e3a34;">El. paštas:</strong> ${email}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong style="color: #1e3a34;">Telefonas:</strong> ${phone}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong style="color: #1e3a34;">Įmonė:</strong> ${company}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong style="color: #1e3a34;">Žinutė:</strong><br><span style="color: #4b3c1a;">${message}</span></td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 24px 0 8px 0; color: #bfa14a; font-size: 0.95rem;">
                  Karken Company, UAB &bull; Smolensko g. 10-95, Vilnius, LT-04312<br>
                  <a href="mailto:hello@karkencompany.lt" style="color: #bfa14a; text-decoration: underline;">hello@karkencompany.lt</a> &bull; +370 604 87253
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom: 24px; color: #bfa14a; font-size: 0.85rem;">
                  © 2026 Karken Company. Visos teisės saugomos.
                </td>
              </tr>
            </table>
          </div>
        `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ status: 'success', response: 'Message sent successfully' });

    } catch (error) { 
        return res.status(500).json({ status: 'failed', response: `Mailer Error: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
