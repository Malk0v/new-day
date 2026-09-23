/**
 * Кошик на localStorage. Ключ рядка — "productId__variantId"
 * (наприклад "svicha-lavanda__8"), бо один товар тепер може бути
 * в кошику одразу в кількох діаметрах.
 * Формат зберігання: { "svicha-lavanda__8": 2, "svicha-vanil__6": 1 }
 */
const CART_KEY = "visk_cart";

function cartKey(productId, variantId) {
  return `${productId}__${variantId}`;
}

function cartParseKey(key) {
  const [productId, variantId] = key.split("__");
  return { productId, variantId };
}

function cartRead() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function cartWrite(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function cartAdd(productId, variantId, qty) {
  const cart = cartRead();
  const key = cartKey(productId, variantId);
  cart[key] = (cart[key] || 0) + qty;
  cartWrite(cart);
}

function cartSetQty(key, qty) {
  const cart = cartRead();
  if (qty <= 0) {
    delete cart[key];
  } else {
    cart[key] = qty;
  }
  cartWrite(cart);
}

function cartRemove(key) {
  const cart = cartRead();
  delete cart[key];
  cartWrite(cart);
}

function cartVariant(productId, variantId) {
  const product = PRODUCTS[productId];
  return product ? product.variants[variantId] : null;
}

function cartLines() {
  const cart = cartRead();
  const lines = [];
  for (const key in cart) {
    const { productId, variantId } = cartParseKey(key);
    const variant = cartVariant(productId, variantId);
    if (!PRODUCTS[productId] || !variant) continue;
    lines.push({
      key,
      productId,
      variantId,
      qty: cart[key],
      product: PRODUCTS[productId],
      variant,
      lineTotal: variant.price * cart[key],
    });
  }
  return lines;
}

function cartCount() {
  return cartLines().reduce((sum, l) => sum + l.qty, 0);
}

function cartTotal() {
  return cartLines().reduce((sum, l) => sum + l.lineTotal, 0);
}

function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    const count = cartCount();
    el.textContent = count > 0 ? `(${count})` : "";
  });
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
