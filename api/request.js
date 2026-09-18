const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const requestLogPath = path.join(__dirname, '..', 'request');
const whatsappLogPath = path.join(__dirname, '..', 'whatsapp-orders.txt');
const defaultOwnerWhatsApp = '919995122274';

function readRequestLog() {
  if (!globalThis.__vishahRequests) globalThis.__vishahRequests = [];
  if (!fs.existsSync(requestLogPath)) return globalThis.__vishahRequests;
  try {
    const raw = fs.readFileSync(requestLogPath, 'utf8').trim();
    globalThis.__vishahRequests = raw ? JSON.parse(raw) : globalThis.__vishahRequests;
    return globalThis.__vishahRequests;
  } catch {
    return globalThis.__vishahRequests;
  }
}

function writeRequestLog(entries) {
  globalThis.__vishahRequests = entries;
  try {
    fs.writeFileSync(requestLogPath, JSON.stringify(entries, null, 2));
  } catch {}
}

function createApprovalToken(order) {
  const payload = Buffer.from(JSON.stringify({
    id: order.id,
    customer: order.customer,
    items: order.items,
    total: order.total,
    payment: order.payment,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString('base64url');
  const secret = process.env.APPROVAL_SECRET || 'change-this-approval-secret';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function buildWhatsAppMessages(order, approvalUrl) {
  const customerName = order.customer?.name || 'Customer';
  const address = [order.customer?.address, order.customer?.city, order.customer?.state, order.customer?.pincode]
    .filter(Boolean)
    .join(', ');
  const itemSummary = order.items.map(item => `${item.name} (${item.size})`).join(', ');
  const total = Number(order.total || 0).toLocaleString('en-IN');

  const buyerMessage = `Hello ${customerName}, your order has been successfully placed at Vishah Design. Order ID: ${order.id}. Product(s): ${itemSummary}. Total: ₹${total}. Delivery address: ${address}. Payment: ${order.payment || 'Cash on delivery'}. Thank you for shopping with us.`;
  const ownerMessage = `New order request from ${customerName}. Order ID: ${order.id}. Product(s): ${itemSummary}. Address: ${address}. Contact: ${order.customer?.phone || 'Not provided'}. Email: ${order.customer?.email || 'Not provided'}. Payment: ${order.payment || 'Cash on delivery'}. Total: ₹${total}. Approve this request and send the buyer confirmation here: ${approvalUrl}`;

  return { buyerMessage, ownerMessage };
}

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
      const order = {
        id: orderId,
        ...payload,
        orderedAt: new Date().toISOString(),
        status: 'Pending owner approval',
        payment: payload.payment || 'Cash on delivery'
      };

      const approvalToken = createApprovalToken(order);
      const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
      const approvalUrl = `${siteUrl}/approve.html?token=${encodeURIComponent(approvalToken)}`;

      const entries = readRequestLog();
      entries.push(order);
      writeRequestLog(entries);

      const { buyerMessage, ownerMessage } = buildWhatsAppMessages(order, approvalUrl);
      try {
        fs.writeFileSync(whatsappLogPath, `BUYER MESSAGE\n${buyerMessage}\n\nBUSINESS OWNER MESSAGE\n${ownerMessage}\n`, 'utf8');
      } catch {}

      return res.status(201).json({
        id: orderId,
        message: 'Your order request has been sent for owner approval.',
        buyerWhatsapp: buyerMessage,
        ownerWhatsapp: ownerMessage,
        ownerPhone: process.env.OWNER_WHATSAPP || defaultOwnerWhatsApp,
        ownerWhatsappUrl: `https://wa.me/${process.env.OWNER_WHATSAPP || defaultOwnerWhatsApp}?text=${encodeURIComponent(ownerMessage)}`,
        approvalUrl
      });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid request body.' });
    }
  });
};
