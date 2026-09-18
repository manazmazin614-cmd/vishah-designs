const businessPhone = '919999999999';

const productCatalog = {
  'Noor Lehenga Set': {
    name: 'Noor Lehenga Set',
    category: 'Lehenga',
    occasion: 'Festive',
    price: 18500,
    size: 'XS',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 6,
    color: 'Rosewood',
    colors: ['Rosewood', 'Champagne', 'Saffron'],
    badge: 'New',
    images: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85'
    ],
    description: 'A rosewood lehenga with a soft drape, artisanal details, and refined festive elegance.',
    fabric: 'Handwoven silk blend',
    embroidery: 'Thread work and subtle sequin detailing',
    fit: 'Tailored waist with soft flare',
    care: 'Dry clean only. Store folded with tissue paper.',
    dispatch: 'Ships in 24-48 hours',
    measurements: 'Waist 30-34 in',
    related: ['Aarohi Saree', 'Meher Kurta Set'],
    rating: 4.9,
    reviews: 124,
    available: true,
    shipping: 'Complimentary shipping on orders above ₹5,000'
  },
  'Meher Kurta Set': {
    name: 'Meher Kurta Set',
    category: 'Kurta Set',
    occasion: 'Evening',
    price: 9800,
    size: 'S',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 3,
    color: 'Dusty Rose',
    colors: ['Dusty Rose', 'Ivory', 'Sage'],
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85'
    ],
    description: 'An easy, elevated set designed for celebrations that feel effortless and graceful.',
    fabric: 'Cotton-silk blend',
    embroidery: 'Minimal thread work with clean finishing',
    fit: 'Relaxed straight silhouette',
    care: 'Gentle hand wash or dry clean',
    dispatch: 'Ships in 24 hours',
    measurements: 'Model height 5\'6\" and wears size M',
    related: ['Noor Lehenga Set', 'Aarohi Saree'],
    rating: 4.8,
    reviews: 98,
    available: true,
    shipping: 'Free delivery on metro orders above ₹3,500'
  },
  'Aarohi Saree': {
    name: 'Aarohi Saree',
    category: 'Saree',
    occasion: 'Wedding',
    price: 14200,
    size: 'Free size',
    sizes: ['Free size', 'S', 'M', 'L'],
    stock: 8,
    color: 'Champagne',
    colors: ['Champagne', 'Pearl', 'Blush'],
    badge: 'Only a few left',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85'
    ],
    description: 'Champagne-gold drape with understated shimmer and a fluid silhouette made for grand moments.',
    fabric: 'Casted silk georgette',
    embroidery: 'Delicate shimmer weave with hand-finished border',
    fit: 'Flowing, fluid drape',
    care: 'Dry clean recommended',
    dispatch: 'Ships in 48 hours',
    measurements: 'Falls 5.5m with drape',
    related: ['Noor Lehenga Set', 'Meher Kurta Set'],
    rating: 5,
    reviews: 151,
    available: true,
    shipping: 'Express delivery available in select cities'
  }
};

const cartKey = 'vishahCart';
const wishlistKey = 'vishahWishlist';
const recentKey = 'vishahRecent';

function formatCurrency(value) {
  return '₹' + Number(value).toLocaleString('en-IN');
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(cartKey, JSON.stringify(items));
  updateHeaderCartCount();
}

function updateHeaderCartCount() {
  const cart = readCart();
  const countElements = document.querySelectorAll('#headerCartCount, #bagCount');
  countElements.forEach(el => {
    el.textContent = String(cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0));
  });
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(wishlistKey) || '[]');
  } catch {
    return [];
  }
}

function updateWishlist(name, isSaved) {
  const wishlist = getWishlist();
  const next = isSaved ? [...new Set([...wishlist, name])] : wishlist.filter(item => item !== name);
  localStorage.setItem(wishlistKey, JSON.stringify(next));
}

function addRecentView(name) {
  const recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
  const next = [name, ...recent.filter(item => item !== name)].slice(0, 4);
  localStorage.setItem(recentKey, JSON.stringify(next));
}

function addToCart(productName, selectedSize = 'M', quantity = 1) {
  const cart = readCart();
  const match = cart.find(item => item.name === productName && item.size === selectedSize);
  if (match) {
    match.quantity += quantity;
  } else {
    cart.push({ name: productName, size: selectedSize, quantity, price: productCatalog[productName].price });
  }
  writeCart(cart);
  return cart;
}

function removeCartItem(index) {
  const cart = readCart();
  cart.splice(index, 1);
  writeCart(cart);
  if (document.body.dataset.page === 'cart') renderCartPage();
}

function changeCartQty(index, delta) {
  const cart = readCart();
  const item = cart[index];
  if (!item) return;
  item.quantity = Math.max(1, Number(item.quantity || 1) + delta);
  writeCart(cart);
  if (document.body.dataset.page === 'cart') renderCartPage();
}

function getCartSummary() {
  const cart = readCart();
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);
  const shipping = subtotal > 5000 ? 0 : 499;
  const discount = localStorage.getItem('vishahPromo') === 'VISHAH10' ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + shipping - discount);
  return { subtotal, shipping, discount, total, cart };
}

function renderShopPage() {
  const grid = document.querySelector('#shopGrid');
  if (!grid) return;

  const categoryFilter = document.querySelector('#categoryFilter');
  const occasionFilter = document.querySelector('#occasionFilter');
  const sizeFilter = document.querySelector('#sizeFilter');
  const colorFilter = document.querySelector('#colorFilter');
  const sortFilter = document.querySelector('#sortFilter');
  const searchInput = document.querySelector('#shopSearch');

  const applyFilters = () => {
    const categoryValue = categoryFilter?.value || 'all';
    const occasionValue = occasionFilter?.value || 'all';
    const sizeValue = sizeFilter?.value || 'all';
    const colorValue = colorFilter?.value || 'all';
    const sortValue = sortFilter?.value || 'newest';
    const searchValue = (searchInput?.value || '').toLowerCase();

    let items = Object.values(productCatalog);
    items = items.filter(product => {
      const matchesCategory = categoryValue === 'all' || product.category === categoryValue;
      const matchesOccasion = occasionValue === 'all' || product.occasion === occasionValue;
      const matchesSize = sizeValue === 'all' || product.sizes.includes(sizeValue);
      const matchesColor = colorValue === 'all' || product.colors.includes(colorValue);
      const matchesSearch = !searchValue || [product.name, product.category, product.occasion, product.color].join(' ').toLowerCase().includes(searchValue);
      return matchesCategory && matchesOccasion && matchesSize && matchesColor && matchesSearch;
    });

    if (sortValue === 'price-low') items.sort((a, b) => a.price - b.price);
    if (sortValue === 'price-high') items.sort((a, b) => b.price - a.price);
    if (sortValue === 'bestseller') items.sort((a, b) => b.rating - a.rating);

    const wishlist = getWishlist();
    grid.innerHTML = items.map(product => {
      const saved = wishlist.includes(product.name);
      return `
        <article class="product-card">
          <button class="wishlist-toggle ${saved ? 'saved' : ''}" data-name="${product.name}" aria-label="Wishlist">${saved ? '♥' : '♡'}</button>
          <div class="card-image-wrap">
            <img src="${product.images[0]}" alt="${product.name}" />
            <span class="badge">${product.badge}</span>
          </div>
          <div class="product-copy">
            <div class="product-head"><h3>${product.name}</h3><span>${formatCurrency(product.price)}</span></div>
            <p>${product.category} • ${product.color}</p>
            <div class="product-actions-inline">
              <a href="product.html?name=${encodeURIComponent(product.name)}" class="button small">View details</a>
              <button class="button small secondary add-card" data-name="${product.name}" type="button">Add to bag</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.wishlist-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const name = button.dataset.name;
        const saved = getWishlist().includes(name);
        updateWishlist(name, !saved);
        applyFilters();
      });
    });

    grid.querySelectorAll('.add-card').forEach(button => {
      button.addEventListener('click', () => {
        const name = button.dataset.name;
        addToCart(name, productCatalog[name].sizes[0], 1);
        window.location.href = 'cart.html';
      });
    });
  };

  [categoryFilter, occasionFilter, sizeFilter, colorFilter, sortFilter].forEach(el => el?.addEventListener('change', applyFilters));
  searchInput?.addEventListener('input', applyFilters);
  applyFilters();
}

function renderProductPage() {
  const target = document.querySelector('#productDetailLayout');
  if (!target) return;
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const product = name ? productCatalog[name] : Object.values(productCatalog)[0];
  if (!product) {
    target.innerHTML = '<p>Product not found.</p>';
    return;
  }

  addRecentView(product.name);
  const wishlist = getWishlist();
  const saved = wishlist.includes(product.name);

  target.innerHTML = `
    <div class="product-gallery">
      <div class="gallery-main"><img src="${product.images[0]}" alt="${product.name}" /></div>
      <div class="gallery-thumbs">
        ${product.images.map((image, index) => `<button type="button" class="thumb ${index === 0 ? 'active' : ''}" data-image="${image}"><img src="${image}" alt="${product.name} view ${index + 1}" /></button>`).join('')}
      </div>
    </div>
    <div class="product-detail-copy">
      <p class="eyebrow">${product.badge}</p>
      <h1>${product.name}</h1>
      <div class="price-row"><span class="price">${formatCurrency(product.price)}</span><span class="stock-tag">${product.stock > 0 ? 'In stock' : 'Sold out'}</span></div>
      <p class="rating-line">★★★★★ ${product.rating} • ${product.reviews} reviews</p>
      <p class="product-description">${product.description}</p>

      <div class="size-section">
        <div class="section-label-row"><span>Size</span><a href="size-guide.html">Size guide</a></div>
        <div class="size-pills">
          ${product.sizes.map(size => `<button type="button" class="size-pill ${size === product.size ? 'selected' : ''}" data-size="${size}">${size}</button>`).join('')}
        </div>
      </div>

      <div class="purchase-actions">
        <button type="button" class="button add-product" data-name="${product.name}">Add to bag</button>
        <button type="button" class="button secondary wishlist-product ${saved ? 'saved' : ''}" data-name="${product.name}">${saved ? 'Saved' : 'Wishlist'}</button>
      </div>

      <div class="product-meta-grid">
        <div><strong>Fabric</strong><span>${product.fabric}</span></div>
        <div><strong>Embroidery</strong><span>${product.embroidery}</span></div>
        <div><strong>Fit</strong><span>${product.fit}</span></div>
        <div><strong>Care</strong><span>${product.care}</span></div>
        <div><strong>Dispatch</strong><span>${product.dispatch}</span></div>
        <div><strong>Model</strong><span>${product.measurements}</span></div>
      </div>

      <div class="meta-boxes">
        <div><strong>Availability</strong><p>${product.stock > 0 ? `${product.stock} pieces available` : 'Currently unavailable'}</p></div>
        <div><strong>Shipping & returns</strong><p>${product.shipping}</p></div>
      </div>
    </div>
    <div class="related-block">
      <h2>Related products</h2>
      <div class="related-grid">
        ${product.related.map(itemName => {
          const item = productCatalog[itemName];
          return `
            <a href="product.html?name=${encodeURIComponent(itemName)}" class="related-card">
              <img src="${item.images[0]}" alt="${itemName}" />
              <div><strong>${itemName}</strong><span>${formatCurrency(item.price)}</span></div>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `;

  const detailThumbs = target.querySelectorAll('.thumb');
  detailThumbs.forEach(button => {
    button.addEventListener('click', () => {
      const image = button.dataset.image;
      target.querySelector('.gallery-main img').src = image;
      detailThumbs.forEach(item => item.classList.toggle('active', item === button));
    });
  });

  target.querySelectorAll('.size-pill').forEach(button => {
    button.addEventListener('click', () => {
      target.querySelectorAll('.size-pill').forEach(item => item.classList.toggle('selected', item === button));
    });
  });

  target.querySelector('.add-product')?.addEventListener('click', () => {
    const selected = target.querySelector('.size-pill.selected')?.dataset.size || product.sizes[0];
    addToCart(product.name, selected, 1);
    window.location.href = 'cart.html';
  });

  target.querySelector('.wishlist-product')?.addEventListener('click', () => {
    const name = product.name;
    const saved = getWishlist().includes(name);
    updateWishlist(name, !saved);
    renderProductPage();
  });
}

function renderCartPage() {
  const cartItems = document.querySelector('#cartItemsPage');
  if (!cartItems) return;
  const items = readCart();
  if (!items.length) {
    cartItems.innerHTML = '<div class="empty-cart"><p>Your bag is empty.</p><a href="shop.html" class="button">Continue shopping</a></div>';
    document.querySelector('#cartSubtotal').textContent = formatCurrency(0);
    document.querySelector('#cartDelivery').textContent = formatCurrency(0);
    document.querySelector('#cartDiscount').textContent = '-₹0';
    document.querySelector('#cartTotal').textContent = formatCurrency(0);
    return;
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);
  const shipping = subtotal > 5000 ? 0 : 499;
  const discount = localStorage.getItem('vishahPromo') === 'VISHAH10' ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  document.querySelector('#cartSubtotal').textContent = formatCurrency(subtotal);
  document.querySelector('#cartDelivery').textContent = formatCurrency(shipping);
  document.querySelector('#cartDiscount').textContent = `-₹${Number(discount).toLocaleString('en-IN')}`;
  document.querySelector('#cartTotal').textContent = formatCurrency(total);

  cartItems.innerHTML = items.map((item, index) => `
    <div class="cart-item">
      <img src="${productCatalog[item.name].images[0]}" alt="${item.name}" />
      <div class="cart-item-copy">
        <h3>${item.name}</h3>
        <p>${item.size} • ${formatCurrency(item.price)}</p>
        <div class="quantity-controls">
          <button type="button" data-index="${index}" data-delta="-1">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-index="${index}" data-delta="1">+</button>
        </div>
      </div>
      <button type="button" class="remove-item" data-index="${index}">Remove</button>
    </div>
  `).join('');

  cartItems.querySelectorAll('[data-delta]').forEach(button => {
    button.addEventListener('click', () => changeCartQty(Number(button.dataset.index), Number(button.dataset.delta)));
  });

  cartItems.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => removeCartItem(Number(button.dataset.index)));
  });

  const promoForm = document.querySelector('.discount-form');
  promoForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = promoForm.querySelector('input');
    localStorage.setItem('vishahPromo', input.value.trim() === 'VISHAH10' ? 'VISHAH10' : 'NONE');
    renderCartPage();
  });
}

function renderCheckoutPage() {
  const form = document.querySelector('#checkoutFormPage');
  if (!form) return;
  const { subtotal, shipping, discount, total } = getCartSummary();
  document.querySelector('#checkoutItemsTotal').textContent = formatCurrency(subtotal);
  document.querySelector('#checkoutShipping').textContent = formatCurrency(shipping);
  document.querySelector('#checkoutGrandTotal').textContent = formatCurrency(total);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const customer = Object.fromEntries(new FormData(form));
    const cart = readCart();
    if (!cart.length) return;

    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, items: cart, total, payment: 'Cash on delivery' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not place the order.');
      if (result.ownerWhatsappUrl) window.open(result.ownerWhatsappUrl, '_blank', 'noopener');
      localStorage.removeItem(cartKey);
      form.innerHTML = `<div class="success-box"><h3>Request ready.</h3><p>Your order request ${result.id} is waiting for owner approval. Send the request to Vishah on WhatsApp, then the owner can approve it and send your confirmation.</p><a class="button wide" href="${result.ownerWhatsappUrl || '#'}" target="_blank" rel="noreferrer">SEND REQUEST TO OWNER ON WHATSAPP ↗</a></div>`;
      updateHeaderCartCount();
    } catch (error) {
      const message = document.createElement('p');
      message.className = 'error-message';
      message.textContent = error.message || 'Something went wrong.';
      form.appendChild(message);
    }
  });
}

function renderJournalArticle() {
  const article = document.querySelector('#articleDetail');
  if (!article) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'ready';

  const articles = {
    'ready': {
      title: 'The art of getting ready',
      category: 'People • 04.18.26',
      text: 'The best festive looks start with one strong idea: let the outfit feel easy, not overworked. Choose a silhouette that flatters your movement, then add texture and jewellery deliberately. A polished look is built through rhythm, not excess.'
    },
    'embroidery': {
      title: 'From sketch to hand embroidery',
      category: 'Craft • 03.29.26',
      text: 'Hand-finished details take time because they create personality. Every stitch is planned to sit in dialogue with the fabric, giving the garment a story without adding noise.'
    },
    'guest-list': {
      title: 'The guest list edit',
      category: 'Occasions • 03.12.26',
      text: 'Every event needs a dress that feels intentional. Our edit is designed to move seamlessly from intimate dinner celebrations to larger wedding moments, with comfort built in.'
    }
  };

  const entry = articles[id] || articles.ready;
  article.innerHTML = `
    <p class="eyebrow">${entry.category}</p>
    <h1>${entry.title}</h1>
    <p>${entry.text}</p>
    <p>At Vishah, we believe modern occasion dressing should feel luminous and effortless. The most memorable pieces are the ones that help you feel like yourself, just more elevated.</p>
    <a href="journal.html" class="button secondary">Back to journal</a>
  `;
}

function handleNewsletter() {
  const form = document.querySelector('.newsletter form');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const emailField = form.querySelector('input');
    const email = emailField.value.trim();
    const status = document.createElement('p');
    status.className = 'form-status';
    if (!email || !email.includes('@')) {
      status.textContent = 'Please enter a valid email.';
      form.appendChild(status);
      return;
    }
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      status.textContent = result.message || 'You’re on the list.';
      form.appendChild(status);
      form.reset();
    } catch (error) {
      status.textContent = 'Something went wrong. Please try again.';
      form.appendChild(status);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  updateHeaderCartCount();
  if (document.body.dataset.page === 'shop') renderShopPage();
  if (document.body.dataset.page === 'product') renderProductPage();
  if (document.body.dataset.page === 'cart') renderCartPage();
  if (document.body.dataset.page === 'checkout') renderCheckoutPage();
  if (document.body.dataset.page === 'journal-article') renderJournalArticle();
  handleNewsletter();
});
