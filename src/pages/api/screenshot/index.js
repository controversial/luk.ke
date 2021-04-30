export default function routeHandler(req, res) {
  res.status(400).json({ error: 'path is required' });
}
