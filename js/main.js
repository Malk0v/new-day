function formatUAH(amount) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(amount);
}

document.addEventListener("DOMContentLoaded", () => {
  // Мобільне меню (гамбургер) — доступне з клавіатури, закривається по Esc
  // і кліку поза меню, керує aria-expanded для скрінрідерів.
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.getElementById("main-nav");
  const navScrim = document.querySelector(".nav-scrim");

  function setNavOpen(open) {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
    mainNav.setAttribute("data-open", String(open));
    if (navScrim) navScrim.setAttribute("data-open", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });
    if (navScrim) navScrim.addEventListener("click", () => setNavOpen(false));
    mainNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setNavOpen(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });
  }

  // Сторінка товару: перемикання ціни/об'єму при виборі діаметра
  const variantSelect = document.querySelector("[data-variant-select]");
  const priceDisplay = document.querySelector("[data-price-display]");
  const metaDisplay = document.querySelector("[data-variant-meta]");

  function syncVariantDisplay() {
    if (!variantSelect) return;
    const opt = variantSelect.selectedOptions[0];
    if (priceDisplay) priceDisplay.textContent = `${opt.dataset.price} ₴`;
    if (metaDisplay) metaDisplay.textContent = opt.dataset.meta;
  }

  if (variantSelect) {
    variantSelect.addEventListener("change", syncVariantDisplay);
    syncVariantDisplay();
  }

  // Кнопка «Додати в кошик»
  const addBtn = document.querySelector("[data-product-id]");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const productId = addBtn.getAttribute("data-product-id");
      const variantId = variantSelect ? variantSelect.value : null;
      const qtyInput = document.querySelector("[data-qty-input]");
      const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
      cartAdd(productId, variantId, qty);
      addBtn.textContent = "Додано ✓";
      setTimeout(() => (addBtn.textContent = "Додати в кошик"), 1600);
    });
  }
});
