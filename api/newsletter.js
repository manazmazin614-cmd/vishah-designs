const subscribers = globalThis.__vishahSubscribers || (globalThis.__vishahSubscribers = []);

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      if (!data.email || !data.email.includes('@')) {
        return res.status(400).json({ message: 'Please enter a valid email.' });
      }

      subscribers.push({ email: data.email, joinedAt: new Date().toISOString() });
      return res.status(201).json({ message: 'You are on the list.' });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid request body.' });
    }
  });
};
