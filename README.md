# ВІСК — інтернет-магазин (статика + заявки в Telegram)

Каркас на чистому HTML/CSS/JS. Сторінки товарів генеруються build-скриптом
з одного файлу `data/products.json`. **Оплата онлайн зараз вимкнена** —
покупець залишає заявку (товари + контакти), вона одразу летить вам у
Telegram, а оплату й доставку ви узгоджуєте з клієнтом самі.

## Структура

```
data/products.json         — ЄДИНЕ джерело даних: товари, варіанти, ціни, тексти
templates/product.template.html — шаблон сторінки товару
build.js                    — генерує product/*.html, js/products-data.js, sitemap.xml, каталог на index.html
index.html                  — головна (каталог вставляється build-скриптом)
product/*.html               — згенеровані сторінки товарів (не редагуйте вручну!)
cart.html                    — кошик (localStorage, підтримує варіанти)
checkout.html                 — форма заявки → відправка в Telegram
success.html                  — сторінка подяки після відправки заявки
css/styles.css                — усі стилі
js/products-data.js           — АВТОГЕНЕРУЄТЬСЯ, не редагувати вручну
js/cart.js                     — логіка кошика (ключ рядка: "productId__variantId")
js/main.js                     — вибір діаметра, кнопка "в кошик", мобільне меню
netlify/functions/send-order.js  — приймає заявку з форми, шле в Telegram
netlify/functions/_telegram.js    — спільний хелпер відправки в Telegram
netlify.toml                   — build command = "node build.js"
```

## 1. Як додати новий товар (до 20 позицій)

Відкрийте `data/products.json` і додайте новий об'єкт у масив `products`:

```json
{
  "id": "svicha-tsytrus",
  "name": "Свічка «Цитрус і м'ята»",
  "shortDescription": "Бадьорий літній аромат",
  "description": "Повний опис для сторінки товару...",
  "metaDescription": "Опис для Google (до 155 символів)...",
  "composition": "100% соєвий віск",
  "wick": "дерев'яний, потріскує при горінні",
  "variants": [
    {
      "id": "6",
      "label": "6 см",
      "price": 270,
      "volume": "120 мл",
      "burnTime": "до 20 годин"
    },
    {
      "id": "8",
      "label": "8 см",
      "price": 330,
      "volume": "220 мл",
      "burnTime": "до 40 годин"
    }
  ]
}
```

Потім запустіть `node build.js` — створить сторінку товару, картку на
головній, запис у `js/products-data.js` і `sitemap.xml`. На Netlify це
відбувається автоматично при кожному деплої.

## 2. Деплой на Netlify

1. Залийте папку в репозиторій на GitHub.
2. netlify.com → Add new site → Import from Git.
3. Build command і Publish directory вже задані в `netlify.toml`.
4. Site settings → Environment variables → додайте `TELEGRAM_BOT_TOKEN`
   і `TELEGRAM_CHAT_ID` (див. пункт 3).
5. Після деплою замініть `https://example-vosk-shop.netlify.app` у
   `data/products.json` (поле `siteUrl`) на ваш реальний домен і
   запустіть `node build.js` ще раз.

## 3. Налаштування Telegram-бота

const token = "7891353623:AAHcw3UdOk4BgEoiB3HaIr4x0UhcDsJAXUs";
const chatId = "-1002333743964";

1. У Telegram напишіть **@BotFather** → `/newbot` → отримаєте токен
   виду `123456:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` → це `TELEGRAM_BOT_TOKEN`.
2. Напишіть своєму новому боту будь-яке повідомлення (наприклад "привіт").
3. Відкрийте в браузері:
   `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
   і знайдіть у відповіді `"chat":{"id": 123456789, ...}` — це число
   і є `TELEGRAM_CHAT_ID`.
4. Додайте обидва значення в Netlify (Site settings → Environment variables).
5. Якщо хочете отримувати заявки в групу, а не в особисті — додайте
   бота в групу і візьміть `chat_id` групи тим самим способом.

Після натискання «Надіслати замовлення» покупач одразу бачить сторінку
подяки, а вам у Telegram приходить повідомлення зі складом замовлення,
діаметрами, сумою і контактами.

## 4. Як повернути оплату онлайн пізніше

Коли будете готові підключити оплату (LiqPay/Stripe/WayForPay):

- Додайте нову serverless-функцію на кшталт `netlify/functions/liqpay-create.js`,
  яка генерує платіжну форму й одразу перед редиректом викликає
  `sendTelegramMessage(...)` із `_telegram.js` (це вже готовий хелпер).
- У `checkout.html` замініть виклик `/.netlify/functions/send-order` на
  виклик функції оплати і редирект на сторінку платіжного провайдера
  замість прямого переходу на `/success.html`.

## 5. Чому це має добре ранжуватись у Google

- Кожен товар — окрема статична сторінка зі своїм `<title>`,
  `meta description` і `JSON-LD` (`Product` + `AggregateOffer`).
- Валідна семантика, один `h1` на сторінці, `sitemap.xml` + `robots.txt`.
- Жодного JS-фреймворку — швидкий рендер, легко тримати Core Web Vitals
  у зеленій зоні. `lang="uk"` на всіх сторінках.

## 6. Доступність і адаптивність

- Мобільне меню — робочий гамбургер з `aria-expanded`, закриття по Esc.
- Контраст кольорів перевірено за WCAG (мінімум 4.5:1 для тексту).
- Skip-link, `aria-live` на кошику й формі, підписані поля вводу
  з `autocomplete`.

## 7. Перевірка перед публікацією

- HTML: https://validator.w3.org/
- Структуровані дані: https://search.google.com/test/rich-results
- Після деплою додайте сайт у Google Search Console і надішліть sitemap.xml.
