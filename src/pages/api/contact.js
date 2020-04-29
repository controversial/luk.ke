import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const message = ({ name, email, message: body }) => ({
  to: 'luke@deentaylor.com',
  from: {
    name: 'Portfolio Contact Form',
    email: 'contact@luk.ke',
  },
  replyTo: email,
  subject: `Contact form message from ${name}`,
  text: body,
});


export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST please' });

  if (!req.body.name) return res.status(400).json({ error: "'name' is required" });
  if (!req.body.email) return res.status(400).json({ error: "'email' is required" });
  if (!req.body.message) return res.status(400).json({ error: "'message' is required" });

  try {
    await sgMail.send(message(req.body));
  } catch (e) {
    return res.status(500).json({ error: e?.response?.body || e });
  }

  return res.json({ message: 'Sent successfully' });
};
