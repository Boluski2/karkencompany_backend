import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/', async (req, res) => {
  const { name, email, phone, company, message } = req.body;

  // ✅ Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      status: 'failed',
      response: 'Name, email, and message are required fields'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'failed',
      response: 'Invalid email format.'
    });
  }

  try {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;font-family:Arial;background:#f4f4f4;">
  <table width="100%" style="background:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" style="background:#fff;border-radius:8px;">
          
          <tr>
            <td style="background:#1e3a34;padding:30px;color:#fff;">
              <h1>New Contact Form Submission</h1>
              <p>You've received a new message from your website</p>
            </td>
          </tr>

          <tr>
            <td style="padding:30px;">
              <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>

              <h3>Contact Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone && phone !== 'Not provided' ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              ${company && company !== 'Not provided' ? `<p><strong>Company:</strong> ${company}</p>` : ''}

              <h3>Message</h3>
              <p>${message}</p>

              <br/>

              <a href="mailto:${email}" 
                 style="background:#bfa14a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
                 Reply to ${name.split(' ')[0]}
              </a>
            </td>
          </tr>

          <tr>
            <td style="background:#f8f8f8;padding:20px;font-size:12px;">
              Karken Company, UAB<br/>
              Vilnius, Lithuania
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const { data, error } = await resend.emails.send({
      from: 'Karken Company <noreply@karkencompany.lt>',
      to: [process.env.RECIPIENT_EMAIL],
      reply_to: email,
      subject: `New Contact Form Submission from ${name} | Karken Company`,
      html: htmlTemplate,
      text: `
NEW CONTACT FORM SUBMISSION

Name: ${name}
Email: ${email}
${phone && phone !== 'Not provided' ? `Phone: ${phone}` : ''}
${company && company !== 'Not provided' ? `Company: ${company}` : ''}

Message:
${message}
      `
    });

    if (error) {
      console.error(error);
      return res.status(500).json({
        status: 'failed',
        response: error.message
      });
    }

    return res.status(200).json({
      status: 'success',
      response: 'Message sent successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'failed',
      response: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});