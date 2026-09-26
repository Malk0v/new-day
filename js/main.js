(function () {
  "use strict";

  // ======================================================================
  // 0. LOAD DATA
  // Products and shop settings live in separate JSON files so they can be
  // edited without touching any code. See data/products.json and
  // data/config.json.
  // ======================================================================
  Promise.all([
    fetch("data/products.json").then(function (r) { return r.json(); }),
    fetch("data/config.json").then(function (r) { return r.json(); })
  ])
    .then(function (results) {
      init(results[0], results[1]);
    })
    .catch(function (err) {
      console.error("Не удалось загрузить данные магазина:", err);
      var root = document.getElementById("products-root");
      if (root) {
        root.innerHTML =
          '<p style="color:var(--text-secondary)">Не удалось загрузить каталог. ' +
          'Если вы открыли файл напрямую (file://) — запустите локальный сервер ' +
          '(например <code>python3 -m http.server</code>) и откройте сайт через http://localhost.</p>';
      }
    });

  function init(PRODUCTS, CONFIG) {
    document.getElementById("brand-name").textContent = CONFIG.shopName;
    document.getElementById("footer-brand").textContent = CONFIG.shopName;
    document.getElementById("year").textContent = new Date().getFullYear();
    var CURRENCY = CONFIG.currency;

    // Products that already exist as plain static HTML in index.html
    // (for search-engine indexability without running JS). Keep this in
    // sync with the "static-card-N" elements in the markup.
    var STATIC_CARD_IDS = [7, 8];

    // ====================================================================
    // 1. ICONS (fallback visuals when a product photo fails to load)
    // ====================================================================
    function meshIconSVG() {
      var rings = [40, 28, 16];
      var s = "var(--text)";
      var svg = '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">';
      svg += '<circle cx="60" cy="60" r="52" stroke="' + s + '" stroke-width="2.5"/>';
      rings.forEach(function (r) {
        svg += '<circle cx="60" cy="60" r="' + r + '" stroke="' + s + '" stroke-width="1" opacity="0.55"/>';
      });
      for (var i = 0; i < 8; i++) {
        var a = (Math.PI * 2 * i) / 8;
        var x2 = 60 + 52 * Math.cos(a), y2 = 60 + 52 * Math.sin(a);
        svg += '<line x1="60" y1="60" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + s + '" stroke-width="1" opacity="0.55"/>';
      }
      return svg + '</svg>';
    }

    function hookIconSVG() {
      var s = "var(--text)";
      return '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<path d="M55 18v34c0 16 24 16 24 32 0 10-8 17-18 17-7 0-13-3-16-8" stroke="' + s + '" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="55" cy="18" r="5" fill="var(--accent)"/>' +
        '</svg>';
    }

    function coneIconSVG() {
      var s = "var(--text)";
      return '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<path d="M60 16 L94 92 L26 92 Z" stroke="' + s + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<ellipse cx="60" cy="92" rx="34" ry="8" stroke="var(--accent)" stroke-width="2"/>' +
        '<ellipse cx="60" cy="60" rx="17" ry="4" stroke="' + s + '" stroke-width="1.2" opacity="0.5"/>' +
        '</svg>';
    }

    function panIconSVG() {
      var s = "var(--text)";
      return '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<circle cx="52" cy="60" r="34" stroke="' + s + '" stroke-width="3"/>' +
        '<circle cx="52" cy="60" r="22" stroke="' + s + '" stroke-width="1.2" opacity="0.5"/>' +
        '<path d="M82 52 L106 40" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>' +
        '</svg>';
    }

    function caseIconSVG() {
      var s = "var(--text)";
      return '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<path d="M34 40c0-10 8-18 18-18h16c10 0 18 8 18 18" stroke="' + s + '" stroke-width="3" fill="none"/>' +
        '<rect x="26" y="40" width="68" height="58" rx="8" stroke="' + s + '" stroke-width="3"/>' +
        '<line x1="26" y1="58" x2="94" y2="58" stroke="var(--accent)" stroke-width="2" opacity="0.7"/>' +
        '</svg>';
    }

    function setIconSVG() {
      var s = "var(--text)";
      var items = [[38, 38], [82, 38], [38, 82], [82, 82]];
      var svg = '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">';
      items.forEach(function (p, idx) {
        svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="16" stroke="' + (idx === 0 ? "var(--accent)" : s) + '" stroke-width="2.5"/>';
      });
      return svg + '</svg>';
    }

    function genericIconSVG() {
      var s = "var(--text)";
      return '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<rect x="24" y="30" width="72" height="60" rx="6" stroke="' + s + '" stroke-width="2.5"/>' +
        '<path d="M24 46h72" stroke="' + s + '" stroke-width="1.4" opacity="0.5"/>' +
        '<circle cx="60" cy="68" r="10" stroke="var(--accent)" stroke-width="2"/>' +
        '</svg>';
    }

    function categoryIconSVG(category) {
      var c = (category || "").toLowerCase();
      if (c.indexOf("сітк") !== -1 || c.indexOf("сетк") !== -1) return meshIconSVG();
      if (c.indexOf("гак") !== -1) return hookIconSVG();
      if (c.indexOf("сковор") !== -1) return panIconSVG();
      if (c.indexOf("чохол") !== -1 || c.indexOf("чехол") !== -1) return caseIconSVG();
      if (c.indexOf("набір") !== -1 || c.indexOf("набор") !== -1) return setIconSVG();
      if (c.indexOf("насад") !== -1 || c.indexOf("конус") !== -1) return coneIconSVG();
      return genericIconSVG();
    }
    window.__categoryIcon = categoryIconSVG; // used by the inline onerror on static HTML cards

    // Simple single-photo visual (used for the compact cart thumbnail, where
    // a carousel would be overkill). Falls back to a category icon on error.
    function buildVisual(product, className) {
      var box = document.createElement("div");
      box.className = className;
      var images = (product.images && product.images.length) ? product.images : [];
      if (images.length === 0) {
        box.innerHTML = categoryIconSVG(product.category);
        return box;
      }
      var img = document.createElement("img");
      img.src = images[0];
      img.alt = product.name;
      img.loading = "lazy";
      img.addEventListener("error", function () {
        box.innerHTML = categoryIconSVG(product.category);
      });
      box.appendChild(img);
      return box;
    }

    // Builds a photo carousel: arrows + dot indicators (only when there's
    // more than one photo), touch swipe, and true lazy loading — a slide's
    // <img src> is only set the first time that slide becomes active,
    // instead of downloading every photo up front.
    function buildCarousel(product, className) {
      var wrap = document.createElement("div");
      wrap.className = className + " carousel";

      var images = (product.images && product.images.length) ? product.images : [];
      if (images.length === 0) {
        wrap.innerHTML = categoryIconSVG(product.category);
        return wrap;
      }

      var track = document.createElement("div");
      track.className = "carousel-track";
      wrap.appendChild(track);

      var slides = [];
      images.forEach(function (src, i) {
        var slide = document.createElement("div");
        slide.className = "carousel-slide" + (i === 0 ? " active" : "");
        var img = document.createElement("img");
        img.alt = product.name + (images.length > 1 ? " — фото " + (i + 1) : "");
        img.loading = "lazy";
        if (i === 0) {
          img.src = src; // first slide loads right away, it's the one visible on render
        } else {
          img.dataset.src = src; // rest load on demand, see goTo()
        }
        img.addEventListener("error", function () {
          slide.innerHTML = categoryIconSVG(product.category);
        });
        slide.appendChild(img);
        track.appendChild(slide);
        slides.push(slide);
      });

      var current = 0;
      var dotsWrap = null;

      function goTo(index) {
        index = (index + images.length) % images.length;
        slides[current].classList.remove("active");
        slides[index].classList.add("active");
        var img = slides[index].querySelector("img");
        if (img && img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
        current = index;
        if (dotsWrap) {
          dotsWrap.querySelectorAll(".dot").forEach(function (d, di) {
            d.classList.toggle("active", di === current);
          });
        }
      }

      if (images.length > 1) {
        var prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "carousel-arrow prev";
        prevBtn.setAttribute("aria-label", "Предыдущее фото");
        prevBtn.innerHTML = "‹";
        prevBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          goTo(current - 1);
        });

        var nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "carousel-arrow next";
        nextBtn.setAttribute("aria-label", "Следующее фото");
        nextBtn.innerHTML = "›";
        nextBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          goTo(current + 1);
        });

        wrap.appendChild(prevBtn);
        wrap.appendChild(nextBtn);

        dotsWrap = document.createElement("div");
        dotsWrap.className = "carousel-dots";
        images.forEach(function (_, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "dot" + (i === 0 ? " active" : "");
          dot.setAttribute("aria-label", "Фото " + (i + 1));
          dot.addEventListener("click", function (e) {
            e.stopPropagation();
            goTo(i);
          });
          dotsWrap.appendChild(dot);
        });
        wrap.appendChild(dotsWrap);

        var touchStartX = null;
        wrap.addEventListener("touchstart", function (e) {
          touchStartX = e.touches[0].clientX;
        }, { passive: true });
        wrap.addEventListener("touchend", function (e) {
          if (touchStartX === null) return;
          var dx = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(dx) > 30) {
            dx < 0 ? goTo(current + 1) : goTo(current - 1);
          }
          touchStartX = null;
        }, { passive: true });
      }

      return wrap;
    }

    // ====================================================================
    // 2. HELPERS
    // ====================================================================
    function formatPrice(n) {
      return n.toLocaleString("ru-RU") + " " + CURRENCY;
    }

    function findVariant(productId, diameter) {
      var product = PRODUCTS.filter(function (p) { return p.id === productId; })[0];
      if (!product) return null;
      var variant = product.options.filter(function (o) { return o.diameter === diameter; })[0];
      return { product: product, variant: variant };
    }

    function minPrice(product) {
      return product.options.reduce(function (min, o) { return o.price < min ? o.price : min; }, product.options[0].price);
    }

    // ====================================================================
    // 3. CATALOG RENDER
    // ====================================================================
    var root = document.getElementById("products-root");
    var pdSelectedDiameter = {};

    PRODUCTS.forEach(function (product) {
      pdSelectedDiameter[product.id] = product.options[0].diameter;

      if (STATIC_CARD_IDS.indexOf(product.id) !== -1) {
        var staticCard = document.getElementById("static-card-" + product.id);
        if (staticCard) {
          staticCard.setAttribute("aria-haspopup", "dialog");
          wireCardOpen(staticCard, product.id);
          // Progressive enhancement: replace the static <img> with a full
          // carousel once JS has run (only matters once a static product
          // gets more than one photo in data/products.json — see PROMPT.md §8)
          var staticVisual = staticCard.querySelector(".product-visual");
          if (staticVisual && product.images && product.images.length > 1) {
            staticVisual.replaceWith(buildCarousel(product, "product-visual"));
          }
        }
        return;
      }

      // Cards are <div role="button"> rather than <button> — a native
      // <button> cannot contain the carousel's own prev/next/dot <button>
      // elements (nested interactive controls are invalid HTML).
      var card = document.createElement("div");
      card.className = "product-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-haspopup", "dialog");
      card.dataset.category = product.category;
      card.dataset.productId = product.id;

      card.appendChild(buildCarousel(product, "product-visual"));

      var nameEl = document.createElement("h3");
      nameEl.className = "product-name";
      nameEl.textContent = product.name;
      card.appendChild(nameEl);

      var teaserEl = document.createElement("p");
      teaserEl.className = "product-teaser";
      teaserEl.textContent = product.description;
      card.appendChild(teaserEl);

      var priceRow = document.createElement("div");
      priceRow.className = "product-price-range";
      priceRow.innerHTML =
        '<span class="price-from"><span class="from-label">от</span>' + formatPrice(minPrice(product)) + '</span>' +
        '<span class="open-hint">Выбрать вариант →</span>';
      card.appendChild(priceRow);

      wireCardOpen(card, product.id);

      root.appendChild(card);
    });

    // Click + keyboard (Enter/Space) activation for a div[role=button] card.
    // Clicks that originate on a carousel arrow/dot are stopped from
    // bubbling up inside buildCarousel(), so they never reach this handler.
    function wireCardOpen(el, productId) {
      el.addEventListener("click", function () {
        openProductModal(productId);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          openProductModal(productId);
        }
      });
    }

    // ====================================================================
    // 4. SEARCH & CATEGORY FILTER (categories are generated from the data,
    //    so adding a new category in products.json shows up automatically)
    // ====================================================================
    (function () {
      var searchInput = document.getElementById("catalog-search");
      var filterWrap = document.getElementById("catalog-filters");
      var emptyState = document.getElementById("catalog-empty");
      var activeCategory = "all";

      var categories = [];
      PRODUCTS.forEach(function (p) {
        if (categories.indexOf(p.category) === -1) categories.push(p.category);
      });

      var allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "filter-pill active";
      allBtn.dataset.cat = "all";
      allBtn.textContent = "Все";
      filterWrap.appendChild(allBtn);

      categories.forEach(function (cat) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filter-pill";
        btn.dataset.cat = cat;
        btn.textContent = cat;
        filterWrap.appendChild(btn);
      });

      function applyFilter() {
        var query = searchInput.value.trim().toLowerCase();
        var cards = root.querySelectorAll(".product-card");
        var visibleCount = 0;

        cards.forEach(function (card) {
          var category = card.dataset.category || "";
          var text = card.textContent.toLowerCase();
          var matchesCategory = activeCategory === "all" || category === activeCategory;
          var matchesQuery = query === "" || text.indexOf(query) !== -1;
          var visible = matchesCategory && matchesQuery;
          card.style.display = visible ? "" : "none";
          if (visible) visibleCount++;
        });

        emptyState.hidden = visibleCount !== 0;
      }

      searchInput.addEventListener("input", applyFilter);

      filterWrap.querySelectorAll(".filter-pill").forEach(function (btn) {
        btn.addEventListener("click", function () {
          activeCategory = btn.dataset.cat;
          filterWrap.querySelectorAll(".filter-pill").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          applyFilter();
        });
      });
    })();

    // ====================================================================
    // 5. PRODUCT DETAIL MODAL
    // ====================================================================
    var productModalOverlay = document.getElementById("product-modal-overlay");
    var productModalBody = document.getElementById("product-modal-body");
    var productModalTitle = document.getElementById("product-modal-title");

    function openProductModal(productId) {
      var product = PRODUCTS.filter(function (p) { return p.id === productId; })[0];
      if (!product) return;
      productModalTitle.textContent = product.name;
      renderProductModalBody(product);
      productModalOverlay.classList.add("open");
      overlay.classList.add("open");
    }

    function closeProductModal() {
      productModalOverlay.classList.remove("open");
      if (!anyLayerOpen()) overlay.classList.remove("open");
    }
    document.getElementById("product-modal-close").addEventListener("click", closeProductModal);

    function renderProductModalBody(product) {
      var diam = pdSelectedDiameter[product.id];

      productModalBody.innerHTML = "";
      productModalBody.appendChild(buildCarousel(product, "pd-visual"));

      var descEl = document.createElement("p");
      descEl.className = "pd-desc";
      descEl.textContent = product.description;
      productModalBody.appendChild(descEl);

      var fieldLabel = document.createElement("span");
      fieldLabel.className = "field-label";
      fieldLabel.textContent = "Вариант";
      productModalBody.appendChild(fieldLabel);

      var pillWrap = document.createElement("div");
      pillWrap.className = "diam-select";
      pillWrap.setAttribute("role", "group");
      pillWrap.setAttribute("aria-label", "Выбор варианта");
      productModalBody.appendChild(pillWrap);

      var priceRow = document.createElement("div");
      priceRow.className = "pd-price-row";
      priceRow.innerHTML = '<span class="pd-price" id="pd-price"></span><span class="price-note">за штуку</span>';
      productModalBody.appendChild(priceRow);

      var addBtn = document.createElement("button");
      addBtn.className = "btn btn-primary";
      addBtn.id = "pd-add-btn";
      addBtn.textContent = "Добавить в корзину";
      productModalBody.appendChild(addBtn);

      var addedNote = document.createElement("p");
      addedNote.className = "pd-added-note";
      addedNote.id = "pd-added-note";
      productModalBody.appendChild(addedNote);

      product.options.forEach(function (o) {
        var pill = document.createElement("button");
        pill.type = "button";
        pill.className = "diam-pill" + (o.diameter === diam ? " active" : "");
        pill.textContent = o.diameter;
        pill.setAttribute("aria-pressed", o.diameter === diam ? "true" : "false");
        pill.addEventListener("click", function () {
          pdSelectedDiameter[product.id] = o.diameter;
          pillWrap.querySelectorAll(".diam-pill").forEach(function (p) {
            p.classList.remove("active");
            p.setAttribute("aria-pressed", "false");
          });
          pill.classList.add("active");
          pill.setAttribute("aria-pressed", "true");
          updatePdPrice(product);
          addedNote.textContent = "";
        });
        pillWrap.appendChild(pill);
      });

      updatePdPrice(product);

      addBtn.addEventListener("click", function () {
        addToCart(product.id, pdSelectedDiameter[product.id]);
        addedNote.textContent = "Добавлено — " + pdSelectedDiameter[product.id];
      });

      function updatePdPrice(p) {
        var found = findVariant(p.id, pdSelectedDiameter[p.id]);
        if (found && found.variant) {
          document.getElementById("pd-price").textContent = formatPrice(found.variant.price);
        }
      }
    }

    // ====================================================================
    // 6. CART
    // ====================================================================
    var cart = [];
    var STORAGE_KEY = "tandyr_cart_v1";
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) cart = JSON.parse(saved);
    } catch (e) { cart = []; }

    function persistCart() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
    }

    function addToCart(productId, diameter) {
      var existing = cart.filter(function (i) { return i.productId === productId && i.diameter === diameter; })[0];
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ productId: productId, diameter: diameter, qty: 1 });
      }
      persistCart();
      renderCart();
    }

    function changeQty(productId, diameter, delta) {
      var item = cart.filter(function (i) { return i.productId === productId && i.diameter === diameter; })[0];
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(function (i) { return i !== item; });
      }
      persistCart();
      renderCart();
    }

    function removeItem(productId, diameter) {
      cart = cart.filter(function (i) { return !(i.productId === productId && i.diameter === diameter); });
      persistCart();
      renderCart();
    }

    function cartTotal() {
      var total = 0;
      cart.forEach(function (i) {
        var found = findVariant(i.productId, i.diameter);
        if (found && found.variant) total += found.variant.price * i.qty;
      });
      return total;
    }

    function cartCount() {
      return cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
    }

    function renderCart() {
      var body = document.getElementById("drawer-body");
      var foot = document.getElementById("drawer-foot");
      var countEl = document.getElementById("cart-count");

      var count = cartCount();
      if (count > 0) {
        countEl.style.display = "flex";
        countEl.textContent = count;
      } else {
        countEl.style.display = "none";
      }

      if (cart.length === 0) {
        body.innerHTML = '<div class="empty-cart">Корзина пуста.<br>Добавьте товар из каталога.</div>';
        foot.style.display = "none";
        return;
      }

      foot.style.display = "block";
      body.innerHTML = "";
      cart.forEach(function (item) {
        var found = findVariant(item.productId, item.diameter);
        if (!found || !found.variant) return;
        var row = document.createElement("div");
        row.className = "cart-item";

        var infoDiv = document.createElement("div");
        infoDiv.className = "cart-item-info";
        infoDiv.innerHTML =
          '<p class="cart-item-name">' + found.product.name + '</p>' +
          '<p class="cart-item-meta">' + item.diameter + '</p>' +
          '<div class="cart-item-row">' +
            '<div class="qty-control">' +
              '<button data-act="minus" aria-label="Уменьшить">−</button>' +
              '<span class="qty-val">' + item.qty + '</span>' +
              '<button data-act="plus" aria-label="Увеличить">+</button>' +
            '</div>' +
            '<span class="cart-item-price">' + formatPrice(found.variant.price * item.qty) + '</span>' +
          '</div>' +
          '<button class="remove-link" data-act="remove">Удалить</button>';

        row.appendChild(buildVisual(found.product, "cart-item-visual"));
        row.appendChild(infoDiv);

        row.querySelector('[data-act="minus"]').addEventListener("click", function () {
          changeQty(item.productId, item.diameter, -1);
        });
        row.querySelector('[data-act="plus"]').addEventListener("click", function () {
          changeQty(item.productId, item.diameter, 1);
        });
        row.querySelector('[data-act="remove"]').addEventListener("click", function () {
          removeItem(item.productId, item.diameter);
        });

        body.appendChild(row);
      });

      document.getElementById("cart-total").textContent = formatPrice(cartTotal());
    }

    // ====================================================================
    // 7. DRAWER / MODAL LAYERING
    // ====================================================================
    var overlay = document.getElementById("overlay");
    var drawer = document.getElementById("drawer");
    var modalOverlay = document.getElementById("modal-overlay");
    var modalBody = document.getElementById("modal-body");
    var modalTitle = document.getElementById("modal-title");

    function anyLayerOpen() {
      return drawer.classList.contains("open") ||
        modalOverlay.classList.contains("open") ||
        productModalOverlay.classList.contains("open");
    }
    function openDrawer() {
      overlay.classList.add("open");
      drawer.classList.add("open");
    }
    function closeDrawer() {
      drawer.classList.remove("open");
      if (!anyLayerOpen()) overlay.classList.remove("open");
    }
    document.getElementById("cart-toggle").addEventListener("click", openDrawer);
    document.getElementById("drawer-close").addEventListener("click", closeDrawer);
    overlay.addEventListener("click", function () {
      closeDrawer();
      closeModal();
      closeProductModal();
    });

    function openModal() {
      modalOverlay.classList.add("open");
      overlay.classList.add("open");
    }
    function closeModal() {
      modalOverlay.classList.remove("open");
      if (!anyLayerOpen()) overlay.classList.remove("open");
    }
    document.getElementById("modal-close").addEventListener("click", closeModal);

    document.getElementById("checkout-btn").addEventListener("click", function () {
      if (cart.length === 0) return;
      renderCheckoutForm();
      closeDrawer();
      openModal();
    });

    // ====================================================================
    // 8. CHECKOUT
    // ====================================================================
    function renderCheckoutForm() {
      modalTitle.textContent = "Оформление заказа";

      var summaryRows = cart.map(function (item) {
        var found = findVariant(item.productId, item.diameter);
        if (!found || !found.variant) return "";
        return '<div class="order-summary-row"><span>' + found.product.name + ', ' + item.diameter + ' × ' + item.qty + '</span><span>' + formatPrice(found.variant.price * item.qty) + '</span></div>';
      }).join("");

      modalBody.innerHTML =
        '<div class="order-summary">' +
          summaryRows +
          '<div class="order-summary-row total"><span>Итого</span><span>' + formatPrice(cartTotal()) + '</span></div>' +
        '</div>' +
        '<form id="checkout-form" novalidate>' +
          '<div class="form-field" data-field="name">' +
            '<label for="f-name">Имя</label>' +
            '<input id="f-name" type="text" autocomplete="name" placeholder="Как к вам обращаться">' +
            '<span class="form-error">Введите имя</span>' +
          '</div>' +
          '<div class="form-field" data-field="phone">' +
            '<label for="f-phone">Телефон</label>' +
            '<input id="f-phone" type="tel" autocomplete="tel" placeholder="+380 __ ___ __ __">' +
            '<span class="form-error">Введите корректный номер телефона</span>' +
          '</div>' +
          '<div class="form-field" data-field="city">' +
            '<label for="f-city">Город и отделение Новой почты</label>' +
            '<input id="f-city" type="text" placeholder="Напр.: Одесса, отделение №5">' +
            '<span class="form-error">Укажите город и отделение</span>' +
          '</div>' +
          '<div class="form-field" data-field="comment">' +
            '<label for="f-comment">Комментарий (необязательно)</label>' +
            '<textarea id="f-comment" placeholder="Пожелания к заказу"></textarea>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary">Подтвердить заказ</button>' +
        '</form>';

      var form = document.getElementById("checkout-form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var nameEl = document.getElementById("f-name");
        var phoneEl = document.getElementById("f-phone");
        var cityEl = document.getElementById("f-city");

        var valid = true;
        function setInvalid(el, isInvalid) {
          var field = el.closest(".form-field");
          field.classList.toggle("invalid", isInvalid);
          if (isInvalid) valid = false;
        }

        setInvalid(nameEl, nameEl.value.trim().length < 2);
        var phoneDigits = phoneEl.value.replace(/\D/g, "");
        setInvalid(phoneEl, phoneDigits.length < 9);
        setInvalid(cityEl, cityEl.value.trim().length < 3);

        if (!valid) return;

        var orderNumber = "TS-" + Date.now().toString().slice(-6);
        var order = {
          number: orderNumber,
          items: cart,
          total: cartTotal(),
          name: nameEl.value.trim(),
          phone: phoneEl.value.trim(),
          city: cityEl.value.trim(),
          comment: document.getElementById("f-comment").value.trim(),
          date: new Date().toISOString()
        };

        try {
          var orders = JSON.parse(localStorage.getItem("tandyr_orders_v1") || "[]");
          orders.push(order);
          localStorage.setItem("tandyr_orders_v1", JSON.stringify(orders));
        } catch (err) {}

        sendOrderToTelegram(order);
        sendOrderToSheets(order);

        cart = [];
        persistCart();
        renderCart();
        renderSuccess(order);
      });
    }

    // ====================================================================
    // 9. NOTIFICATIONS (Telegram + Google Sheets)
    // ====================================================================
    function sendOrderToTelegram(order) {
      var tg = CONFIG.telegram;
      if (!tg || !tg.botToken || !tg.chatId) return;

      var lines = [];
      lines.push("🔥 Новый заказ " + order.number);
      lines.push("");
      order.items.forEach(function (item) {
        var found = findVariant(item.productId, item.diameter);
        if (!found || !found.variant) return;
        lines.push("• " + found.product.name + " (" + item.diameter + ") × " + item.qty + " — " + formatPrice(found.variant.price * item.qty));
      });
      lines.push("");
      lines.push("Итого: " + formatPrice(order.total));
      lines.push("");
      lines.push("Имя: " + order.name);
      lines.push("Телефон: " + order.phone);
      lines.push("Город/отделение: " + order.city);
      if (order.comment) lines.push("Комментарий: " + order.comment);

      var url = "https://api.telegram.org/bot" + tg.botToken + "/sendMessage";
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tg.chatId, text: lines.join("\n") })
      }).catch(function (err) {
        console.warn("Telegram notify failed:", err);
      });
    }

    function sendOrderToSheets(order) {
      var sh = CONFIG.sheets;
      if (!sh || !sh.webhookUrl) return; // not configured yet — see google-sheets-webhook.gs

      var itemsText = order.items.map(function (item) {
        var found = findVariant(item.productId, item.diameter);
        if (!found || !found.variant) return "";
        return found.product.name + " (" + item.diameter + ") × " + item.qty;
      }).filter(Boolean).join("; ");

      fetch(sh.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // avoids an extra CORS preflight to Apps Script
        body: JSON.stringify({
          secret: sh.secret,
          orderNumber: order.number,
          name: order.name,
          phone: order.phone,
          city: order.city,
          comment: order.comment,
          items: itemsText,
          total: order.total
        })
      }).catch(function (err) {
        console.warn("Google Sheets notify failed:", err);
      });
    }

    function renderSuccess(order) {
      modalTitle.textContent = "Заказ принят";
      modalBody.innerHTML =
        '<div class="success-view">' +
          '<svg class="success-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/><path d="M8 12.5l2.6 2.6L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<h3>Спасибо, ' + escapeHtml(order.name) + '!</h3>' +
          '<p>Заказ №' + order.number + ' на сумму ' + formatPrice(order.total) + ' принят. Мы свяжемся с вами по номеру ' + escapeHtml(order.phone) + ' для подтверждения деталей и оплаты.</p>' +
          '<button class="btn btn-secondary" id="close-success">Закрыть</button>' +
        '</div>';
      document.getElementById("close-success").addEventListener("click", closeModal);
    }

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    // ====================================================================
    // 10. SEO: JSON-LD structured data (generated once data is available)
    // ====================================================================
    var itemListElements = [];
    PRODUCTS.forEach(function (product) {
      product.options.forEach(function (v) {
        itemListElements.push({
          "@type": "Product",
          "name": product.name + " — " + v.diameter,
          "description": product.description,
          "sku": product.id + "-" + v.diameter,
          "offers": {
            "@type": "Offer",
            "priceCurrency": "UAH",
            "price": v.price,
            "availability": "https://schema.org/InStock"
          }
        });
      });
    });
    var ldJson = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": CONFIG.shopName + " — каталог",
      "itemListElement": itemListElements.map(function (item, idx) {
        return { "@type": "ListItem", "position": idx + 1, "item": item };
      })
    };
    var ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.textContent = JSON.stringify(ldJson);
    document.head.appendChild(ldScript);

    var orgLdJson = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": CONFIG.shopName,
      "telephone": CONFIG.phone,
      "areaServed": "UA",
      "makesOffer": PRODUCTS.map(function (p) { return { "@type": "Offer", "itemOffered": { "@type": "Product", "name": p.name } }; })
    };
    var orgLdScript = document.createElement("script");
    orgLdScript.type = "application/ld+json";
    orgLdScript.textContent = JSON.stringify(orgLdJson);
    document.head.appendChild(orgLdScript);

    // ====================================================================
    // 11. INIT
    // ====================================================================
    renderCart();
  }
})();
