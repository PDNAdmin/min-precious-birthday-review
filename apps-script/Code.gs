/**
 * Review site backend: Google Sheet + email.
 * Setup steps are in SETUP.md.
 */
const NOTIFY_EMAIL = "";            // where new-response alerts go (Precious and/or you)
const REVEAL_KEY = "change-this-secret"; // used by reveal.html?key=...
const CELEBRANT = "Precious";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === "request") {
      appendRow_("Requests", {
        submittedAt: data.submittedAt, name: data.name, email: data.email,
        whatsapp: data.whatsapp, for: data.for, source: data.source,
      });
      notify_(`New "create your own" request: ${data.name}`,
        `${data.name}\n${data.email}\n${data.whatsapp || ""}\nFor: ${data.for}\nFrom: ${data.source}`);
    } else {
      const row = Object.assign({
        submittedAt: data.submittedAt,
        name: data.anonymous ? "Anonymous" : data.name,
        relationship: data.relationship,
      }, data.answers || {});
      appendRow_("Responses", row);
      notify_(`New review for ${CELEBRANT} (${row.relationship})`,
        `From: ${row.name}\nRelationship: ${row.relationship}\n\nOpen the sheet to read it. Or don't, and save it for the camera.`);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Used by reveal.html: GET ?key=SECRET
function doGet(e) {
  if (!e.parameter || e.parameter.key !== REVEAL_KEY) return json_({ ok: false, error: "nope" });
  const sh = SpreadsheetApp.getActive().getSheetByName("Responses");
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, responses: [] });
  const [head, ...rows] = sh.getDataRange().getValues();
  const responses = rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
  return json_({ ok: true, responses });
}

/** Adds a row, creating the sheet and any new header columns as needed. */
function appendRow_(sheetName, obj) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  let head = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  const missing = Object.keys(obj).filter((k) => head.indexOf(k) === -1);
  if (missing.length) {
    sh.getRange(1, head.length + 1, 1, missing.length).setValues([missing]).setFontWeight("bold");
    head = head.concat(missing);
    sh.setFrozenRows(1);
  }
  sh.appendRow(head.map((h) => (obj[h] === undefined ? "" : obj[h])));
}

function notify_(subject, body) {
  if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once by hand to make sure email permission is granted. */
function testSetup() {
  appendRow_("Responses", { submittedAt: new Date().toISOString(), name: "Test", relationship: "Test", kind: 10 });
  notify_("Review site: setup works", "If you can read this, the script is wired up. Delete the test row.");
}
