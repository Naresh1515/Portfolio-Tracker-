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
 * 6. Paste that URL into the app's Reports → Cloud Sync → Google Sheets field, on every device.
 */

const SHEET_NAME = 'SyncData';

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

function doGet(e) {
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
