/**
 * Ledger Terminal — Google Sheets sync backend.
 *
 * SETUP:
 * 1. Open (or create) a Google Sheet.
 * 2. Extensions → Apps Script.
 * 3. Delete any starter code, paste this entire file.
 * 4. Deploy → New deployment → type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, authorize when prompted, then copy the URL ending in /exec.
 * 6. Paste that URL into the app's Reports → Cloud Sync → Google Sheets field.
 *
 * LIVE PRICE (LTP) SETUP — this is what makes Target/Stop-Loss/Entry signals
 * update automatically in the app:
 * 1. The first "Pull Live Prices" call from the app auto-creates a tab named
 *    "LTP" in your sheet with columns Symbol | LTP.
 * 2. In column A, list every symbol exactly as it appears in the app
 *    (e.g. INFY, TCS, RELIANCE).
 * 3. In column B, next to each symbol, use a GOOGLEFINANCE formula so the
 *    price updates live, e.g.:  =GOOGLEFINANCE("NSE:"&A2,"price")
 *    (swap NSE for BSE, or use a plain ticker, depending on your symbols.)
 * 4. In the app, click "Pull Live Prices" (or turn on auto-refresh) — it reads
 *    this LTP tab and updates matching symbols in Open Positions and
 *    Opportunities, which recalculates entry/target/stop-loss signals.
 */

const SHEET_NAME = 'SyncData';
const LTP_SHEET_NAME = 'LTP';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange('A1').setValue('{}');
    sheet.getRange('B1').setValue(0);
  }
  return sheet;
}

function getLtpSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(LTP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(LTP_SHEET_NAME);
    sheet.getRange('A1:B1').setValues([['Symbol', 'LTP']]);
    sheet.getRange('A2').setValue('EXAMPLE');
    sheet.getRange('B2').setFormula('=GOOGLEFINANCE("NSE:"&A2,"price")');
  }
  return sheet;
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'ltp') {
    const sheet = getLtpSheet_();
    const values = sheet.getDataRange().getValues();
    const map = {};
    for (let i = 1; i < values.length; i++) {
      const sym = values[i][0];
      const price = values[i][1];
      if (sym && price !== '' && !isNaN(price)) {
        map[String(sym).toUpperCase().trim()] = Number(price);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true, ltp: map })).setMimeType(ContentService.MimeType.JSON);
  }
  const sheet = getSheet_();
  const payload = sheet.getRange('A1').getValue() || '{}';
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const body = e.postData && e.postData.contents ? e.postData.contents : '{}';
    // validate it's real JSON before writing
    JSON.parse(body);
    sheet.getRange('A1').setValue(body);
    sheet.getRange('B1').setValue(Date.now());
    return ContentService.createTextOutput(JSON.stringify({ok: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok: false, error: err.message})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
