/**
 * Скрипт для приёма заказов с сайта и записи их в Google Таблицу.
 *
 * КАК ПОДКЛЮЧИТЬ:
 * 1. Создайте новую Google Таблицу (sheets.google.com).
 *    В первой строке сделайте заголовки:
 *    Дата | Номер заказа | Имя | Телефон | Город/отделение | Комментарий | Товары | Сумма
 *
 * 2. В таблице: Расширения → Apps Script.
 *    Удалите весь код-заготовку и вставьте вместо него этот файл целиком.
 *
 * 3. Замените SECRET_KEY ниже на свою собственную строку (любые буквы/цифры) —
 *    это защита от того, чтобы кто-то посторонний, узнав ссылку скрипта,
 *    мог слать в вашу таблицу мусорные записи.
 *
 * 4. Разверните скрипт: Развернуть → Новое развёртывание →
 *    тип "Веб-приложение" → Execute as: "Me" → Who has access: "Anyone" → Развернуть.
 *    Google попросит подтвердить разрешения — это нормально, скрипт работает только с вашей таблицей.
 *
 * 5. Скопируйте полученный URL веб-приложения (заканчивается на /exec) —
 *    вставьте его и тот же SECRET_KEY в файл сайта, в блок <script id="sheets-config">.
 *
 * 6. Если позже меняете код скрипта — каждый раз делайте "Новое развёртывание"
 *    (или "Управление развёртываниями" → редактировать), иначе изменения не применятся к рабочей ссылке.
 */

var SECRET_KEY = "1FqkGbJrlVwbMEK_vlwebccyTdee2_icP2mCOAQau1tacVRiSbJsKgTOm";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.secret !== SECRET_KEY) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "invalid secret" }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(),
      data.orderNumber || "",
      data.name || "",
      data.phone || "",
      data.city || "",
      data.comment || "",
      data.items || "",
      data.total || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
