// A small backend with no extra packages. Start it with: npm start
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const rootFolder = __dirname;
const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data));
}

function readBody(request) {
  return new Promise(resolve => {
    let body = '';
    request.on('data', chunk => body += chunk);
    request.on('end', () => resolve(body));
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  // Product data lives in products.json so it is easy to edit.
  if (url.pathname === '/api/products' && request.method === 'GET') {
    const products = JSON.parse(fs.readFileSync(path.join(rootFolder, 'products.json'), 'utf8'));
    return sendJson(response, 200, products);
  }

  // Newsletter sign-ups are saved locally in subscribers.json.
  if (url.pathname === '/api/newsletter' && request.method === 'POST') {
    const data = JSON.parse(await readBody(request) || '{}');
    if (!data.email || !data.email.includes('@')) return sendJson(response, 400, { message: 'Please enter a valid email.' });
    const file = path.join(rootFolder, 'subscribers.json');
    const subscribers = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    subscribers.push({ email: data.email, joinedAt: new Date().toISOString() });
    fs.writeFileSync(file, JSON.stringify(subscribers, null, 2));
    return sendJson(response, 201, { message: 'You are on the list.' });
  }

  if (url.pathname === '/api/orders' && request.method === 'POST') {
    const order = JSON.parse(await readBody(request) || '{}');
    if (!order.customer?.name || !order.customer?.email || !order.items?.length) return sendJson(response, 400, { message: 'Please complete your details and bag.' });
    const file = path.join(rootFolder, 'orders.json');
    const orders = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const orderId = `VIS-${Date.now().toString().slice(-6)}`;
    orders.push({ id: orderId, ...order, status: 'New — cash on delivery', orderedAt: new Date().toISOString() });
    fs.writeFileSync(file, JSON.stringify(orders, null, 2));
    return sendJson(response, 201, { id: orderId, message: 'Your order has been placed.' });
  }

  // Serve the frontend files.
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(rootFolder, filePath);
  if (!filePath.startsWith(rootFolder)) return response.end('Not found');
  fs.readFile(filePath, (error, content) => {
    if (error) { response.writeHead(404); return response.end('Page not found'); }
    const type = mimeTypes[path.extname(filePath)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type });
    response.end(content);
  });
});

server.listen(PORT, () => console.log(`Vishah Design is running at http://localhost:${PORT}`));
