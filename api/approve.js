const crypto = require('crypto');

function verifyToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) throw new Error('Invalid approval link.');
  const secret = process.env.APPROVAL_SECRET || 'change-this-approval-secret';
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Invalid approval link.');
  }
  const order = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!order.expiresAt || order.expiresAt < Date.now()) throw new Error('This approval link has expired.');
  return order;
}

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed.' });
  try {
    const order = verifyToken(new URL(req.url, `https://${req.headers.host}`).searchParams.get('token'));
    const customerPhone = String(order.customer?.phone || '').replace(/\D/g, '');
    const itemSummary = order.items.map(item => `${item.name} (${item.size})`).join(', ');
    const buyerMessage = `Hello ${order.customer?.name || 'there'}, your Vishah Design order ${order.id} is confirmed. Product(s): ${itemSummary}. Total: ₹${Number(order.total || 0).toLocaleString('en-IN')}. Payment: ${order.payment || 'Cash on delivery'}. Thank you.`;
    return res.status(200).json({
      orderId: order.id,
      buyerMessage,
      buyerWhatsappUrl: customerPhone ? `https://wa.me/${customerPhone}?text=${encodeURIComponent(buyerMessage)}` : null
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Could not approve this request.' });
  }
};
