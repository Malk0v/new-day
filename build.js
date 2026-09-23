#!/usr/bin/env node
/**
 * Генерирует из data/products.json:
 *   - product/<id>.html      (по шаблону templates/product.template.html)
 *   - js/products-data.js    (данные для корзины на клиенте)
 *   - sitemap.xml
 *   - каталог на index.html  (между маркерами <!-- CATALOG:START/END -->)
 *
 * Запуск: node build.js
 * На Netlify это же указано как build command в netlify.toml —
 * страницы пересобираются автоматически при каждом деплое.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const { siteUrl, products } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/products.json"), "utf8")
);

function minPrice(product) {
  return Math.min(...product.variants.map((v) => v.price));
}
function maxPrice(product) {
  return Math.max(...product.variants.map((v) => v.price));
}

// ---------- 1. Страницы товаров ----------

const productTemplate = fs.readFileSync(
  path.join(ROOT, "templates/product.template.html"),
  "utf8"
);

fs.mkdirSync(path.join(ROOT, "product"), { recursive: true });

for (const product of products) {
  const variants = product.variants;
  const defaultVariant = variants[0];

  const variantOptions = variants
    .map(
      (v) =>
        `            <option value="${v.id}" data-price="${v.price}" data-meta="${v.volume} · ${v.burnTime}">${v.label} — ${v.price} ₴</option>`
    )
    .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: "ВІСК" },
    offers: {
      "@type": "AggregateOffer",
      url: `${siteUrl}/product/${product.id}.html`,
      priceCurrency: "UAH",
      lowPrice: String(minPrice(product)),
      highPrice: String(maxPrice(product)),
      offerCount: String(variants.length),
      availability: "https://schema.org/InStock",
    },
  };

  const html = productTemplate
    .replaceAll("{{ID}}", product.id)
    .replaceAll("{{NAME}}", product.name)
    .replaceAll("{{DESCRIPTION}}", product.description)
    .replaceAll("{{META_DESCRIPTION}}", product.metaDescription)
    .replaceAll("{{SITE_URL}}", siteUrl)
    .replaceAll("{{MIN_PRICE}}", String(minPrice(product)))
    .replaceAll("{{COMPOSITION}}", product.composition)
    .replaceAll("{{WICK}}", product.wick)
    .replaceAll("{{VARIANT_OPTIONS}}", variantOptions)
    .replaceAll(
      "{{DEFAULT_META}}",
      `${defaultVariant.volume} · ${defaultVariant.burnTime}`
    )
    .replaceAll("{{JSON_LD}}", JSON.stringify(jsonLd, null, 2));

  fs.writeFileSync(path.join(ROOT, "product", `${product.id}.html`), html);
}

console.log(`✓ Сгенерировано ${products.length} страниц товаров`);

// ---------- 2. js/products-data.js ----------

const productsDataJs = `/**
 * АВТОГЕНЕРИРУЕТСЯ из data/products.json скриптом build.js.
 * Не редактируйте вручную — правки перезапишутся при следующей сборке.
 */
const PRODUCTS = ${JSON.stringify(
  Object.fromEntries(
    products.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.name,
        url: `/product/${p.id}.html`,
        variants: Object.fromEntries(
          p.variants.map((v) => [v.id, { label: v.label, price: v.price }])
        ),
      },
    ])
  ),
  null,
  2
)};
`;

fs.writeFileSync(path.join(ROOT, "js/products-data.js"), productsDataJs);
console.log("✓ js/products-data.js обновлён");

// ---------- 3. sitemap.xml ----------

const urls = [
  { loc: `${siteUrl}/`, priority: "1.0", changefreq: "weekly" },
  ...products.map((p) => ({
    loc: `${siteUrl}/product/${p.id}.html`,
    priority: "0.8",
    changefreq: "monthly",
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
console.log("✓ sitemap.xml обновлён");

// ---------- 4. Каталог на index.html ----------

const indexPath = path.join(ROOT, "index.html");
let indexHtml = fs.readFileSync(indexPath, "utf8");

const cards = products
  .map(
    (p) => `          <a class="product-card" href="/product/${p.id}.html">
            <div class="product-card__image" role="img" aria-label="Фото товару: ${p.name}">Фото товару</div>
            <div class="product-card__body">
              <h3>${p.name}</h3>
              <p class="product-card__scent">${p.shortDescription}</p>
              <p class="product-card__price">від ${minPrice(p)} ₴</p>
            </div>
          </a>`
  )
  .join("\n\n");

indexHtml = indexHtml.replace(
  /<!-- CATALOG:START -->[\s\S]*<!-- CATALOG:END -->/,
  `<!-- CATALOG:START -->\n${cards}\n          <!-- CATALOG:END -->`
);

indexHtml = indexHtml.replace(
  /<p>\d+ з \d+ позицій[^<]*<\/p>/,
  `<p>${products.length} з 20 позицій — решту скоро додамо</p>`
);

fs.writeFileSync(indexPath, indexHtml);
console.log("✓ index.html: каталог обновлён");
