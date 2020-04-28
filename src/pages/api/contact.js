export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST please' });
  return res.json({ message: 'Sent successfully' });
};
