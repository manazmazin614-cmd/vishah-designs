const bag = [];
const bagPanel = document.querySelector('#bag');
const checkoutPanel = document.querySelector('#checkout');
const overlay = document.querySelector('#overlay');
const bagItems = document.querySelector('#bagItems');
const count = document.querySelector('#bagCount');
const subtotal = document.querySelector('#subtotal');
const productDetail = document.querySelector('#productDetail');
const detailTitle = document.querySelector('#detailTitle');
const detailPrice = document.querySelector('#detailPrice');
const detailImage = document.querySelector('#detailImage');
const detailDescription = document.querySelector('#detailDescription');
const detailSizes = document.querySelector('#detailSizes');
const addToBagButton = document.querySelector('#addSelectedToBag');
const businessPhone = '919999999999';

const productCatalog = {
  'Noor Lehenga Set': { price: 18500, sizes: ['XS', 'S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=85', description: 'A rosewood lehenga with a soft drape, artisanal details, and refined festive elegance.' },
  'Meher Kurta Set': { price: 9800, sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=85', description: 'An easy, elevated set designed for celebrations that feel effortless and graceful.' },
  'Aarohi Saree': { price: 14200, sizes: ['Free size', 'S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85', description: 'Champagne-gold drape with understated shimmer and a fluid silhouette made for grand moments.' }
};

let selectedProduct = null;
let selectedSize = null;

fetch('/api/products')
  .then(response => response.json())
  .then(products => {
    products.forEach(product => {
      if (!productCatalog[product.name]) return;
      productCatalog[product.name].price = product.price;
      if (product.sizes?.length) productCatalog[product.name].sizes = product.sizes;
    });
  })
  .catch(() => {});

function formatCurrency(value) {
  return '₹' + Number(value).toLocaleString('en-IN');
}

function renderBag() {
  count.textContent = bag.length;
  const total = bag.reduce((sum, item) => sum + Number(item.price), 0);
  subtotal.textContent = formatCurrency(total);
  document.querySelector('#checkoutTotal').textContent = formatCurrency(total);
  bagItems.innerHTML = bag.length
    ? bag.map((item, i) => `<div class="bag-item"><span>${item.name}<br><small>${item.size} • ${formatCurrency(item.price)}</small></span><button data-index="${i}">REMOVE</button></div>`).join('')
    : '<p>Your bag is empty.</p>';
  bagItems.querySelectorAll('button').forEach(button => button.onclick = () => { bag.splice(Number(button.dataset.index), 1); renderBag(); });
}

function toggleBag(show) {
  bagPanel.classList.toggle('open', show);
  overlay.classList.toggle('open', show);
  bagPanel.setAttribute('aria-hidden', !show);
}

function toggleCheckout(show) {
  checkoutPanel.classList.toggle('open', show);
  overlay.classList.toggle('open', show);
  checkoutPanel.setAttribute('aria-hidden', !show);
}

function toggleProductDetail(show) {
  productDetail.classList.toggle('open', show);
  overlay.classList.toggle('open', show);
  productDetail.setAttribute('aria-hidden', !show);
}

function openProductDetail(productName) {
  const product = productCatalog[productName];
  if (!product) return;
  selectedProduct = productName;
  selectedSize = product.sizes[0];
  detailTitle.textContent = productName;
  detailPrice.textContent = formatCurrency(product.price);
  detailImage.src = product.image;
  detailDescription.textContent = product.description;
  detailSizes.innerHTML = product.sizes.map(size => `<button type="button" class="size-option${size === selectedSize ? ' selected' : ''}" data-size="${size}">${size}</button>`).join('');
  detailSizes.querySelectorAll('.size-option').forEach(button => {
    button.onclick = () => {
      selectedSize = button.dataset.size;
      detailSizes.querySelectorAll('.size-option').forEach(item => item.classList.toggle('selected', item.dataset.size === selectedSize));
    };
  });
  toggleProductDetail(true);
}

function addSelectedProductToBag() {
  if (!selectedProduct || !selectedSize) return;
  const item = { name: selectedProduct, size: selectedSize, price: productCatalog[selectedProduct].price };
  bag.push(item);
  renderBag();
  toggleProductDetail(false);
  toggleBag(true);
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function openWhatsApp(phone, message) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) return;
  const link = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(link, '_blank');
}

document.querySelectorAll('.quick-add').forEach(button => button.onclick = () => openProductDetail(button.dataset.product));
document.querySelectorAll('.view-product').forEach(button => button.onclick = () => openProductDetail(button.dataset.product));
document.querySelector('#bagButton').onclick = () => toggleBag(true);
document.querySelector('#closeBag').onclick = () => toggleBag(false);
document.querySelector('#closeProductDetail').onclick = () => toggleProductDetail(false);
document.querySelector('#addSelectedToBag').onclick = addSelectedProductToBag;
document.querySelector('#checkoutButton').onclick = () => { if (!bag.length) return; toggleBag(false); toggleCheckout(true); };
document.querySelector('#closeCheckout').onclick = () => toggleCheckout(false);
overlay.onclick = () => { toggleBag(false); toggleCheckout(false); toggleProductDetail(false); };

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
  const total = bag.reduce((sum, item) => sum + Number(item.price), 0);
  const products = bag.map(item => ({ name: item.name, size: item.size, price: item.price }));
  const button = form.querySelector('button');
  button.textContent = 'PLACING ORDER…'; button.disabled = true;
  try {
    const response = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, items: products, total, payment: 'Cash on delivery' }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Could not place order');

    const buyerMessage = result.buyerWhatsapp;
    const ownerMessage = result.ownerWhatsapp;
    openWhatsApp(customer.phone, buyerMessage);
    openWhatsApp(businessPhone, ownerMessage);

    form.innerHTML = `<h2>Thank you.</h2><p class="checkout-note">Your order <strong>${result.id}</strong> has been placed. We’ll contact you shortly to confirm delivery.</p>`;
    bag.length = 0; renderBag();
  } catch (error) {
    button.textContent = error.message || 'TRY AGAIN'; button.disabled = false;
  }
};
