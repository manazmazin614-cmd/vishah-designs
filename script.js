const bag = [];
const bagPanel = document.querySelector('#bag');
const checkoutPanel = document.querySelector('#checkout');
const overlay = document.querySelector('#overlay');
const bagItems = document.querySelector('#bagItems');
const count = document.querySelector('#bagCount');
const subtotal = document.querySelector('#subtotal');
const prices = { 'Noor Lehenga Set': 18500, 'Meher Kurta Set': 9800, 'Aarohi Saree': 14200 };
// Load the editable prices from the simple backend when the website is running.
fetch('/api/products')
  .then(response => response.json())
  .then(products => products.forEach(product => { prices[product.name] = product.price; }))
  .catch(() => {}); // The page also works when index.html is opened directly.
function renderBag() {
  count.textContent = bag.length;
  subtotal.textContent = '₹' + bag.reduce((sum, item) => sum + prices[item], 0).toLocaleString('en-IN');
  document.querySelector('#checkoutTotal').textContent = subtotal.textContent;
  bagItems.innerHTML = bag.length ? bag.map((item, i) => `<div class="bag-item"><span>${item}<br><small>₹${prices[item].toLocaleString('en-IN')}</small></span><button data-index="${i}">REMOVE</button></div>`).join('') : '<p>Your bag is empty.</p>';
  bagItems.querySelectorAll('button').forEach(button => button.onclick = () => { bag.splice(button.dataset.index, 1); renderBag(); });
}
function toggleBag(show) { bagPanel.classList.toggle('open', show); overlay.classList.toggle('open', show); bagPanel.setAttribute('aria-hidden', !show); }
function toggleCheckout(show) { checkoutPanel.classList.toggle('open', show); overlay.classList.toggle('open', show); checkoutPanel.setAttribute('aria-hidden', !show); }
document.querySelectorAll('.quick-add').forEach(button => button.onclick = () => { bag.push(button.dataset.product); renderBag(); toggleBag(true); });
document.querySelector('#bagButton').onclick = () => toggleBag(true);
document.querySelector('#closeBag').onclick = () => toggleBag(false);
document.querySelector('#checkoutButton').onclick = () => { if (!bag.length) return; toggleBag(false); toggleCheckout(true); };
document.querySelector('#closeCheckout').onclick = () => toggleCheckout(false);
overlay.onclick = () => { toggleBag(false); toggleCheckout(false); };
document.querySelector('.newsletter form').onsubmit = async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.querySelector('input').value;
  try {
    const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (!response.ok) throw new Error('Could not subscribe');
    form.innerHTML = '<p style="margin:12px 0;font:11px DM Mono;letter-spacing:.08em">YOU’RE ON THE LIST. WELCOME.</p>';
  } catch {
    form.innerHTML = '<p style="margin:12px 0;font:11px DM Mono;letter-spacing:.08em">THANK YOU FOR YOUR INTEREST.</p>';
  }
};
document.querySelector('#checkoutForm').onsubmit = async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const customer = Object.fromEntries(new FormData(form));
  const total = bag.reduce((sum, item) => sum + prices[item], 0);
  const button = form.querySelector('button');
  button.textContent = 'PLACING ORDER…'; button.disabled = true;
  try {
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, items: bag, total }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    form.innerHTML = `<h2>Thank you.</h2><p class="checkout-note">Your order <strong>${result.id}</strong> has been placed. We’ll contact you shortly to confirm delivery.</p>`;
    bag.length = 0; renderBag();
  } catch (error) { button.textContent = error.message || 'TRY AGAIN'; button.disabled = false; }
};
