const orders = globalThis.__vishahOrders || (globalThis.__vishahOrders = []);

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
      const payload = body ? JSON.parse(body) : {};
      const { customer, items } = payload;

      if (!customer?.name || !customer?.email || !items?.length) {
        return res.status(400).json({ message: 'Please complete your details and bag.' });
      }

      const orderId = `VIS-${Date.now().toString().slice(-6)}`;
      orders.push({
        id: orderId,
        ...payload,
        status: 'New — cash on delivery',
        orderedAt: new Date().toISOString()
      });

      return res.status(201).json({ id: orderId, message: 'Your order has been placed.' });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid order payload.' });
    }
  });
};
