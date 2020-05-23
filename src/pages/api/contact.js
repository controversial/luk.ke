import sgMail from '@sendgrid/mail';
import { isEmail } from 'helpers/email';

import Prismic from 'prismic-javascript';
import Api from 'helpers/prismic';

import { delay } from 'helpers/motion';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


if (process.env.DISABLE_EMAIL === 'true') {
  console.warn('Note: contact form emails will be suppressed due to the presence of the DISABLE_EMAIL flag');
}


const targetEmail = new Promise((resolve) => {
  const address = Api
    .then((api) => api.query(Prismic.Predicates.at('document.type', 'contact')))
    .then(({ results }) => results[0].data)
    .then((data) => data.contact_form_address)
    .catch(() => 'luke@deentaylor.com');

  resolve(address);
});

const message = async ({ name, email, message: body }) => ({
  to: await targetEmail,
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
  if (!isEmail(req.body.email)) return res.status(400).json({ error: "'email' is invalid" });
  if (!req.body.message) return res.status(400).json({ error: "'message' is required" });

  try {
    if (process.env.DISABLE_EMAIL !== 'true') {
      await sgMail.send(await message(req.body));
    } else await delay(300);
  } catch (e) {
    return res.status(500).json({ error: e?.response?.body || e.message || e });
  }

  return res.json({ message: 'Sent successfully' });
};
