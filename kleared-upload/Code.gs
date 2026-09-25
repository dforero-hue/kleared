/**
 * KLEARED — Backend (Google Apps Script)
 * Division One Safety, LLC
 *
 * SETUP:
 * 1. Create a Google Sheet named "Kleared Data"
 * 2. SHEET_ID below = the long ID from the sheet URL (BARE ID ONLY).
 * 3. Extensions → Apps Script → paste this file → Save
 * 4. Function dropdown → `setup` → Run → approve permissions
 * 5. Deploy → New deployment → Web app (Execute as: Me / Who has access: Anyone)
 * 6. Copy the /exec URL into src/config.ts
 *
 * Tabs auto-created on first run:
 *   Sites        — jobsites (incl. per-GC custom orientation modules, column G)
 *   Admins       — GC self-serve login codes
 *   Orientations — completed orientations (incl. worker photo)
 *   Billing      — Stripe subscription status per GC
 *
 * ⚠️ Upgrading from an earlier version? Run `setup` again to add new tabs,
 *    then Deploy → Manage deployments → pencil → New version → Deploy.
 *
 * STRIPE (optional — see KLEARED-SETUP.md): add these under
 * Project Settings → Script properties. Leave blank to keep billing off.
 *   STRIPE_SECRET_KEY     sk_live_... (or sk_test_...)
 *   STRIPE_PRICE_ID       price_...  (your recurring price)
 *   STRIPE_WEBHOOK_TOKEN  any random string; put it in the webhook URL as
 *                         ...\/exec?src=stripe&token=THAT_STRING
 */

const SHEET_ID = "19s-pIcsFy8tWyo-mO38ko5gNz29HBWgJnuMi-ZH0dJQ";
const NOTIFY_EMAILS = "dforero@divisiononesafety.com, admin@divisiononesafety.com";
const CERT_VALID_DAYS = 365;

// Owner/master admin code — sees and edits EVERY GC's jobsites.
// Set your PRIVATE code either here OR (preferred) under Project Settings →
// Script properties as MASTER_ADMIN_CODE. While BOTH are blank, master login is
// DISABLED. Never reuse the throwaway demo code from src/config.ts.
const MASTER_ADMIN_CODE = "";

// Orientations columns (1-based).
const PHOTO_COL = 15;
const CONSENT_COL = 16; // "YES"/"NO" · then Notice Version (17) · Consent Lang (18)
// Sites column (1-based) that holds the custom-modules JSON.
const MODULES_COL = 7;
// Sites column (1-based) for the "full program" flag ("YES"/"NO"). When YES, this
// GC delivers its OWN complete orientation (e.g. an uploaded slide deck turned
// into modules), so the worker sees those modules INSTEAD of the 5 generic core
// safety modules. Blank/NO = the modules are shown as extras AFTER the core ones.
const FULLPROG_COL = 8;
// Sites column (1-based) for a GC-specific quiz (JSON). When present it replaces
// the default 5-question quiz for that jobsite. Compressed like the modules cell.
const QUIZ_COL = 9;
const MAX_QUIZ = 20; // max quiz questions kept per site
// Max custom modules kept per site. A GC's full uploaded program can be long
// (e.g. Jones Bros' 60-page orientation), so this is generous. The modules JSON
// is gzip-compressed into the cell when large (see encodeModules_), so a big
// program still fits a single Google Sheet cell's 50,000-character limit.
const MAX_MODULES = 150;

// Whether the PUBLIC certificate-verification page returns the worker's photo.
// Default FALSE: a stranger who has (or guesses) a cert ID sees name/employer/
// jobsite/dates but NOT the worker's face. The photo still rides on the worker's
// own certificate and is shared with the GC. Set true only if you gate the
// verify page behind a login. See KLEARED-SETUP.md (privacy).
const PUBLIC_VERIFY_SHOW_PHOTO = false;

// Passing quiz score (out of the quiz total). The SERVER re-checks this, so a
// certificate is only ever written for a genuinely PASSING orientation — even if
// the client was tampered with. Keep in sync with QUIZ_PASS_SCORE in src/config.ts.
// NOTE: this is an integrity check, not forgery-proofing — the /exec endpoint is
// public, so it cannot by itself prove a human completed the orientation. See the
// "Certificate integrity" note in KLEARED-SETUP.md.
const QUIZ_PASS_SCORE = 4;
// Length of the DEFAULT quiz (used for sites without their own GC quiz). Keep in
// sync with the QUIZ array in src/content.ts. The server uses this to verify the
// score's denominator, so a tampered client can't shrink it to pass more easily.
const DEFAULT_QUIZ_LEN = 5;

/* ---------------- setup helpers ---------------- */

function getSheets_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  let sites = ss.getSheetByName("Sites");
  if (!sites) {
    sites = ss.insertSheet("Sites");
    sites.appendRow(["SiteCode", "GC Name", "Site Name", "Active", "Notes EN", "Notes ES",
      "Custom Modules (JSON)", "Full Program", "Quiz (JSON)"]);
    sites.appendRow(["ABC01", "Example GC, Inc.", "Example Project — Nashville, TN", "YES",
      "Check in at the trailer before entering the work area.",
      "Regístrese en el tráiler antes de entrar al área de trabajo.", "", "NO", ""]);
    sites.setFrozenRows(1);
  }
  // Migrate an OLDER Sites tab (created before the "Full Program" / "Quiz" columns)
  // so they exist and are labeled. Runs harmlessly once, then no-ops.
  if (sites.getMaxColumns() < QUIZ_COL) {
    sites.insertColumnsAfter(sites.getMaxColumns(), QUIZ_COL - sites.getMaxColumns());
  }
  if (String(sites.getRange(1, FULLPROG_COL).getValue()) !== "Full Program") {
    sites.getRange(1, FULLPROG_COL).setValue("Full Program");
  }
  if (String(sites.getRange(1, QUIZ_COL).getValue()) !== "Quiz (JSON)") {
    sites.getRange(1, QUIZ_COL).setValue("Quiz (JSON)");
  }

  let admins = ss.getSheetByName("Admins");
  if (!admins) {
    admins = ss.insertSheet("Admins");
    admins.appendRow(["Code", "GC Name", "Active"]);
    admins.appendRow(["EXAMPLE", "Example GC, Inc.", "YES"]);
    admins.setFrozenRows(1);
  }

  let log = ss.getSheetByName("Orientations");
  if (!log) {
    log = ss.insertSheet("Orientations");
    log.appendRow(["Timestamp", "Cert ID", "Name", "Company", "Phone", "Trade", "Language",
      "Site Code", "GC", "Site", "Quiz Score", "Issued", "Expires",
      "Signature (base64 PNG)", "Photo (base64 JPEG)",
      "Consent", "Notice Version", "Consent Lang"]);
    log.setFrozenRows(1);
  }
  // Migrate an OLDER Orientations tab (created before the consent columns) so the
  // 3 consent columns exist and are labeled. Runs harmlessly once, then no-ops.
  if (log.getMaxColumns() < CONSENT_COL + 2) {
    log.insertColumnsAfter(log.getMaxColumns(), CONSENT_COL + 2 - log.getMaxColumns());
  }
  if (String(log.getRange(1, CONSENT_COL).getValue()) !== "Consent") {
    log.getRange(1, CONSENT_COL, 1, 3).setValues([["Consent", "Notice Version", "Consent Lang"]]);
  }

  let billing = ss.getSheetByName("Billing");
  if (!billing) {
    billing = ss.insertSheet("Billing");
    billing.appendRow(["GC Name", "Stripe Customer", "Subscription", "Status", "Updated"]);
    billing.setFrozenRows(1);
  }

  return { sites: sites, admins: admins, log: log, billing: billing };
}

/** Run this once from the editor to create the tabs and authorize the script. */
function setup() {
  getSheets_();
  Logger.log("Kleared tabs ready (Sites, Admins, Orientations, Billing).");
}

/* ---------------- web endpoints ---------------- */

function doGet(e) {
  const action = (e.parameter.action || "").toLowerCase();
  if (action === "sites") return json_(listSites_());
  if (action === "verify") return json_(verify_(e.parameter.id || ""));
  return json_({ ok: true, service: "Kleared backend" });
}

function doPost(e) {
  try {
    // Stripe posts its webhook events here; route by the URL's ?src=stripe.
    if (e.parameter && e.parameter.src === "stripe") return handleStripeWebhook_(e);

    const p = JSON.parse(e.postData.contents);
    const op = (p.op || "orientation");
    if (op === "adminSites") return json_(adminSitesResponse_(p.code));
    if (op === "saveSite") return json_(adminSave_(p.code, p.site));
    if (op === "setActive") return json_(adminSetActive_(p.code, p.siteCode, p.active));
    if (op === "createCheckout") return json_(createCheckoutSession_(p.code, p.returnUrl));
    if (op === "billingPortal") return json_(billingPortalSession_(p.code, p.returnUrl));
    return json_(logOrientation_(p));
  } catch (err) {
    return json_({ error: String(err) });
  }
}

/* ---------------- worker logic ---------------- */

function logOrientation_(p) {
  // Server-side integrity checks: only write a certificate for a real, active
  // jobsite, with a real signature, and a PASSING quiz score — so the record
  // reflects a genuinely completed, passing orientation even if the client was
  // tampered with. (This is NOT forgery-proofing; the endpoint is public.)
  if (!p.name || !isRealSignature_(p.signature)) return { error: "missing_fields" };
  const srow = siteRow_(p.siteCode);
  if (!srow) return { error: "bad_site" };
  if (!quizPassed_(p.score, siteQuizLen_(srow))) return { error: "quiz_failed" };

  const now = new Date();
  const expires = new Date(now.getTime() + CERT_VALID_DAYS * 24 * 60 * 60 * 1000);
  const certId = makeCertId_(now);

  // Serialize the append so two workers submitting at the same instant can't
  // interleave/clobber rows. The lock covers ONLY the write; the slow email is
  // sent afterward so submissions don't queue behind each other's emails.
  withLock_(function () {
    const { log } = getSheets_();
    const base = [
      now, certId, p.name, p.company, "'" + p.phone, p.trade, p.lang,
      p.siteCode, p.gc, p.site, p.score, now, expires, p.signature || "",
    ];
    const tail = [p.consent ? "YES" : "NO", p.consentVersion || "", p.consentLang || ""];
    try {
      // ONE atomic append including the photo (col 15), so the photo is always
      // on THIS worker's row — no getLastRow() lookup that could race a
      // concurrent submission if the lock wasn't acquired.
      log.appendRow(base.concat([p.photo || ""], tail));
    } catch (bigPhotoErr) {
      // A too-large photo would otherwise fail the whole append — record the
      // orientation without the photo rather than lose it.
      Logger.log("Append with photo failed, saving without photo: " + bigPhotoErr);
      log.appendRow(base.concat([""], tail));
    }
    SpreadsheetApp.flush();
  });

  sendNotification_(certId, p, now, expires);

  return { certId: certId, issued: now.toISOString(), expires: expires.toISOString() };
}

/**
 * Enforces the published retention schedule (privacy notice sections on retention).
 * Deletes each worker's PHOTO + SIGNATURE 1 year after their certificate expires,
 * and deletes the whole orientation record 5 years after expiry.
 *
 * ⚠️ Run this on a schedule so the retention promise is actually kept:
 *   Apps Script editor → Triggers (clock icon) → Add Trigger →
 *   function: purgeExpiredData_ · event source: Time-driven · Day timer (e.g. 2am).
 */
function purgeExpiredData_() {
  withLock_(function () {
    const { log } = getSheets_();
    const lastRow = log.getLastRow();
    if (lastRow < 2) return;
    const now = new Date().getTime();
    const YEAR = 365 * 24 * 60 * 60 * 1000;
    const photoCutoff = now - 1 * YEAR;   // photo/signature deleted 1yr after cert expiry
    const recordCutoff = now - 5 * YEAR;  // whole record deleted 5yr after cert expiry

    const expires = log.getRange(2, 13, lastRow - 1, 1).getValues(); // Expires column only
    const MAX_OPS = 400; // cap writes per run so we never approach the 6-min limit
    let photosCleared = 0, rowsDeleted = 0, ops = 0, deferred = 0;
    // Walk bottom-up so row deletions don't shift rows we haven't processed yet.
    for (let i = expires.length - 1; i >= 0; i--) {
      const raw = expires[i][0];
      if (!raw) continue;
      const exp = new Date(raw).getTime();
      if (isNaN(exp)) continue;
      if (exp >= photoCutoff) continue; // nothing due yet for this row
      if (ops >= MAX_OPS) { deferred++; continue; }
      const rowNum = i + 2;
      if (exp < recordCutoff) {
        log.deleteRow(rowNum); rowsDeleted++; ops++;
      } else if (log.getRange(rowNum, PHOTO_COL).getValue()) {
        // Delete only the PHOTO — the signature stays with the record.
        log.getRange(rowNum, PHOTO_COL).setValue("");
        photosCleared++; ops++;
      }
    }
    Logger.log("Purge: cleared " + photosCleared + " photos, deleted " + rowsDeleted +
      " records" + (deferred ? " (" + deferred + " rows deferred to the next run)" : "") + ".");
  });
}

function listSites_() {
  const { sites } = getSheets_();
  const rows = sites.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || String(r[3]).toUpperCase() !== "YES") continue;
    out.push({
      code: String(r[0]),
      gc: String(r[1]),
      site: String(r[2]),
      notesEn: String(r[4] || ""),
      notesEs: String(r[5] || ""),
      modules: parseModules_(r[MODULES_COL - 1]),
      fullProgram: String(r[FULLPROG_COL - 1]).toUpperCase() === "YES",
      quiz: parseQuiz_(r[QUIZ_COL - 1]),
    });
  }
  return { sites: out };
}

function verify_(id) {
  if (!id) return { status: "not_found" };
  const { log } = getSheets_();
  const target = String(id).trim();
  const lastRow = log.getLastRow();
  if (lastRow < 2) return { status: "not_found" };

  // Targeted lookup: search ONLY the Cert ID column (B) with a TextFinder, then
  // read the single matching row. The old code pulled getDataRange() — every
  // row including every base64 photo/signature — on every QR scan, which is
  // hundreds of MB (and a timeout) once there are thousands of orientations.
  const idColumn = log.getRange(2, 2, lastRow - 1, 1); // B2:B<last>
  const matches = idColumn.createTextFinder(target).matchEntireCell(true).matchCase(false).findAll();
  if (!matches || !matches.length) return { status: "not_found" };

  // If an ID somehow repeats, use the most recent (highest) row.
  let rowNum = 0;
  for (let i = 0; i < matches.length; i++) rowNum = Math.max(rowNum, matches[i].getRow());

  const r = log.getRange(rowNum, 1, 1, PHOTO_COL).getValues()[0];
  const expires = new Date(r[12]);
  return {
    status: expires >= new Date() ? "valid" : "expired",
    name: String(r[2]),
    company: String(r[3]),
    gc: String(r[8]),
    site: String(r[9]),
    issued: new Date(r[11]).toISOString(),
    expires: expires.toISOString(),
    photo: PUBLIC_VERIFY_SHOW_PHOTO ? String(r[PHOTO_COL - 1] || "") : "",
  };
}

/* ---------------- admin (GC self-serve) ---------------- */

function adminAuth_(code) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return { ok: false };
  // Master code comes from Script Properties first, then the constant. Blank = disabled.
  const master = String(prop_("MASTER_ADMIN_CODE") || MASTER_ADMIN_CODE || "").trim().toUpperCase();
  if (master && c === master) {
    return { ok: true, gc: "*", master: true };
  }
  const { admins } = getSheets_();
  const rows = admins.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toUpperCase() === c &&
        String(rows[i][2]).toUpperCase() !== "NO") {
      return { ok: true, gc: String(rows[i][1]), master: false };
    }
  }
  return { ok: false };
}

function adminSitesResponse_(code) {
  const auth = adminAuth_(code);
  if (!auth.ok) return { ok: false, gc: "", master: false, sites: [] };
  return {
    ok: true,
    gc: auth.gc,
    master: auth.master,
    sites: listSitesForAdmin_(auth),
    subscription: auth.master ? null : getSubscriptionForGc_(auth.gc),
  };
}

function listSitesForAdmin_(auth) {
  const { sites } = getSheets_();
  const rows = sites.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    if (!auth.master && String(r[1]) !== auth.gc) continue;
    out.push({
      code: String(r[0]),
      gc: String(r[1]),
      site: String(r[2]),
      active: String(r[3]).toUpperCase() === "YES",
      notesEn: String(r[4] || ""),
      notesEs: String(r[5] || ""),
      modules: parseModules_(r[MODULES_COL - 1]),
      fullProgram: String(r[FULLPROG_COL - 1]).toUpperCase() === "YES",
      quiz: parseQuiz_(r[QUIZ_COL - 1]),
    });
  }
  return out;
}

function adminSave_(code, site) {
  const auth = adminAuth_(code);
  if (!auth.ok) return { ok: false, error: "unauthorized" };
  if (!site || !String(site.site || "").trim()) return { ok: false, error: "missing site name" };

  // Lock the whole read-modify-write so a concurrent save can't clobber a row.
  return withLock_(function () {
    const { sites } = getSheets_();
    const gc = auth.master ? (String(site.gc || "").trim() || "Owner") : auth.gc;
    let sc = String(site.code || "").trim().toUpperCase();
    const active = site.active === false ? "NO" : "YES";
    const rows = sites.getDataRange().getValues();

    let rowIdx = -1;
    if (sc) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim().toUpperCase() === sc) { rowIdx = i + 1; break; }
      }
    }
    if (rowIdx > 0 && !auth.master && String(rows[rowIdx - 1][1]) !== auth.gc) {
      return { ok: false, error: "unauthorized" };
    }
    if (!sc) sc = genSiteCode_(String(site.site), rows);
    const existing = rowIdx > 0 ? rows[rowIdx - 1] : null;

    // The "full program" fields (modules, fullProgram, quiz) are expensive to
    // recreate — a GC's whole uploaded orientation. So each is overwritten ONLY
    // when the caller actually sent it; if omitted (e.g. a trimmed/older client),
    // preserve whatever's already in the row so an unrelated save can't wipe an
    // imported program. Notes/active/name are always sent by the app, so they use
    // the plain "" default.
    let modules, modulesCell;
    if (site.modules === undefined) {
      modulesCell = existing ? existing[MODULES_COL - 1] : "";
      modules = parseModules_(modulesCell);
    } else {
      modules = serverCleanModules_(site.modules);
      modulesCell = encodeModules_(modules);
    }

    let fullProgram;
    if (site.fullProgram === undefined) {
      fullProgram = !!existing && String(existing[FULLPROG_COL - 1]).toUpperCase() === "YES";
    } else {
      fullProgram = site.fullProgram === true || String(site.fullProgram).toUpperCase() === "YES";
    }

    let quiz, quizCell;
    if (site.quiz === undefined) {
      quizCell = existing ? existing[QUIZ_COL - 1] : "";
      quiz = parseQuiz_(quizCell);
    } else {
      quiz = serverCleanQuiz_(site.quiz);
      quizCell = encodeCell_(JSON.stringify(quiz));
    }

    const values = [sc, gc, String(site.site).trim(), active,
      String(site.notesEn || "").trim(), String(site.notesEs || "").trim(),
      modulesCell, fullProgram ? "YES" : "NO", quizCell];
    if (rowIdx > 0) sites.getRange(rowIdx, 1, 1, QUIZ_COL).setValues([values]);
    else sites.appendRow(values);
    SpreadsheetApp.flush();

    return {
      ok: true,
      site: {
        code: sc, gc: gc, site: values[2], active: active === "YES",
        notesEn: values[4], notesEs: values[5], modules: modules,
        fullProgram: fullProgram, quiz: quiz,
      },
    };
  });
}

function adminSetActive_(code, siteCode, active) {
  const auth = adminAuth_(code);
  if (!auth.ok) return { ok: false };
  return withLock_(function () {
    const { sites } = getSheets_();
    const rows = sites.getDataRange().getValues();
    const sc = String(siteCode || "").trim().toUpperCase();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim().toUpperCase() === sc) {
        if (!auth.master && String(rows[i][1]) !== auth.gc) return { ok: false };
        sites.getRange(i + 1, 4).setValue(active ? "YES" : "NO");
        return { ok: true };
      }
    }
    return { ok: false };
  });
}

function genSiteCode_(name, rows) {
  const base = (String(name).replace(/[^A-Za-z]/g, "").toUpperCase() + "SITE").slice(0, 3);
  const existing = {};
  for (let i = 1; i < rows.length; i++) existing[String(rows[i][0]).toUpperCase()] = true;
  let code;
  do { code = base + Math.floor(Math.random() * 90 + 10); } while (existing[code]);
  return code;
}

/* ---- custom module helpers ---- */

// A single Google Sheet cell holds at most 50,000 characters. A GC's full
// uploaded program (dozens of bilingual modules) can exceed that as plain JSON,
// so when the JSON is large we store it gzip-compressed + base64 behind a "gz:"
// marker. Small module sets stay plain JSON, so old rows keep working unchanged.
const CELL_GZ_PREFIX = "gz:";
const CELL_GZ_THRESHOLD = 45000; // compress once the plain JSON passes this many chars

// Encode any JSON string into a cell, gzip-compressing (+ base64, behind a "gz:"
// marker) once it's large. decodeCell_ reverses it; a plain-JSON cell (no marker)
// is returned as-is, so pre-existing rows keep working unchanged.
function encodeCell_(jsonStr) {
  const s = String(jsonStr || "");
  if (s.length <= CELL_GZ_THRESHOLD) return s;
  const bytes = Utilities.gzip(Utilities.newBlob(s, "application/json")).getBytes();
  return CELL_GZ_PREFIX + Utilities.base64Encode(bytes);
}
function decodeCell_(cell) {
  let s = String(cell || "");
  if (s.indexOf(CELL_GZ_PREFIX) === 0) {
    const bytes = Utilities.base64Decode(s.substring(CELL_GZ_PREFIX.length));
    s = Utilities.ungzip(Utilities.newBlob(bytes, "application/x-gzip")).getDataAsString();
  }
  return s;
}

function encodeModules_(modules) {
  return encodeCell_(JSON.stringify(modules || []));
}

function parseModules_(cell) {
  if (!cell) return [];
  try {
    const arr = JSON.parse(decodeCell_(cell));
    return Array.isArray(arr) ? serverCleanModules_(arr) : [];
  } catch (err) {
    return [];
  }
}

function encodeQuiz_(quiz) {
  return encodeCell_(JSON.stringify(serverCleanQuiz_(quiz)));
}

function parseQuiz_(cell) {
  if (!cell) return [];
  try {
    const arr = JSON.parse(decodeCell_(cell));
    return Array.isArray(arr) ? serverCleanQuiz_(arr) : [];
  } catch (err) {
    return [];
  }
}

// Keep only well-formed quiz questions: bilingual prompt, matching 2+ options in
// both languages, and an answer index that points at a real option.
function serverCleanQuiz_(quiz) {
  if (!Array.isArray(quiz)) return [];
  const clean = [];
  for (let i = 0; i < quiz.length && i < MAX_QUIZ; i++) {
    const q = quiz[i] || {};
    const prompt = q.q || {};
    const opts = q.options || {};
    const en = (Array.isArray(opts.en) ? opts.en : []).map(function (o) { return String(o); });
    const es = (Array.isArray(opts.es) ? opts.es : []).map(function (o) { return String(o); });
    const ans = q.answer;
    if (!String(prompt.en || "").trim() || !String(prompt.es || "").trim()) continue;
    if (en.length < 2 || en.length !== es.length) continue;
    // Answer must be a real INTEGER option index in range. Check the RAW type (not
    // Number(ans)) so null/false/[] — which coerce to a valid-looking 0 and would
    // silently make option 0 the key — are rejected, along with a fractional value
    // (1.5) that no integer selection could ever match (which would lock every
    // worker out of that site).
    if (typeof ans !== "number" || !Number.isInteger(ans) || ans < 0 || ans >= en.length) continue;
    clean.push({
      q: { en: String(prompt.en), es: String(prompt.es) },
      options: { en: en, es: es },
      answer: ans,
    });
  }
  return clean;
}

function serverCleanModules_(mods) {
  if (!Array.isArray(mods)) return [];
  const clean = [];
  for (let i = 0; i < mods.length && i < MAX_MODULES; i++) {
    const m = mods[i] || {};
    const pointsEn = (Array.isArray(m.pointsEn) ? m.pointsEn : []).map(function (p) { return String(p).trim(); }).filter(Boolean);
    const pointsEs = (Array.isArray(m.pointsEs) ? m.pointsEs : []).map(function (p) { return String(p).trim(); }).filter(Boolean);
    const item = {
      titleEn: String(m.titleEn || "").trim(),
      titleEs: String(m.titleEs || "").trim(),
      pointsEn: pointsEn,
      pointsEs: pointsEs,
    };
    // Keep only modules workers will actually see: a title AND at least one point.
    if ((item.titleEn || item.titleEs) && (pointsEn.length || pointsEs.length)) clean.push(item);
  }
  return clean;
}

/* ---------------- billing (Stripe) ---------------- */

function prop_(key) {
  return PropertiesService.getScriptProperties().getProperty(key) || "";
}
function stripeSecret_() { return prop_("STRIPE_SECRET_KEY"); }
function stripePriceId_() { return prop_("STRIPE_PRICE_ID"); }
function stripeWebhookToken_() { return prop_("STRIPE_WEBHOOK_TOKEN"); }
function stripeConfigured_() { return !!(stripeSecret_() && stripePriceId_()); }

function stripeApi_(method, path, params) {
  const key = stripeSecret_();
  if (!key) return null;
  const options = {
    method: method,
    headers: { Authorization: "Bearer " + key },
    muteHttpExceptions: true,
  };
  if (params) options.payload = params; // form-encoded by Apps Script
  const resp = UrlFetchApp.fetch("https://api.stripe.com/v1/" + path, options);
  const text = resp.getContentText() || "{}";
  let body;
  try { body = JSON.parse(text); } catch (err) { body = {}; }
  if (resp.getResponseCode() >= 300) Logger.log("Stripe " + resp.getResponseCode() + ": " + text);
  return body;
}

function sanitizeReturn_(url) {
  // If you set APP_BASE_URL in Script Properties, redirects are LOCKED to your
  // own domain and any client-supplied target is ignored (prevents open redirect).
  const base = String(prop_("APP_BASE_URL") || "").trim();
  if (base) return base.indexOf("#") >= 0 ? base : base.replace(/\/+$/, "") + "/#/admin";
  const u = String(url || "");
  return /^https?:\/\//i.test(u) ? u : "https://kleared.com/#/admin";
}

function createCheckoutSession_(code, returnUrl) {
  const auth = adminAuth_(code);
  if (!auth.ok) return { error: "unauthorized" };
  if (!stripeConfigured_()) return { error: "not_configured" };
  const gc = auth.master ? "Owner" : auth.gc;
  // Never start a second subscription if one is already live — send them to the
  // billing portal to manage the existing one instead (prevents double-billing).
  const current = getSubscriptionForGc_(gc);
  if (current && (current.status === "active" || current.status === "trialing" || current.status === "past_due")) {
    return billingPortalSession_(code, returnUrl);
  }
  const back = sanitizeReturn_(returnUrl);
  const params = {
    "mode": "subscription",
    "line_items[0][price]": stripePriceId_(),
    "line_items[0][quantity]": "1",
    "success_url": back,
    "cancel_url": back,
    "client_reference_id": gc,
    "metadata[gc]": gc,
    "subscription_data[metadata][gc]": gc,
  };
  const existing = getBillingRow_(gc);
  if (existing && existing.customerId) params["customer"] = existing.customerId;
  const session = stripeApi_("post", "checkout/sessions", params);
  if (session && session.url) return { url: session.url };
  return { error: "stripe_error" };
}

function billingPortalSession_(code, returnUrl) {
  const auth = adminAuth_(code);
  if (!auth.ok) return { error: "unauthorized" };
  if (!stripeConfigured_()) return { error: "not_configured" };
  const gc = auth.master ? "Owner" : auth.gc;
  const row = getBillingRow_(gc);
  if (!row || !row.customerId) return { error: "no_customer" };
  const portal = stripeApi_("post", "billing_portal/sessions", {
    "customer": row.customerId,
    "return_url": sanitizeReturn_(returnUrl),
  });
  if (portal && portal.url) return { url: portal.url };
  return { error: "stripe_error" };
}

/**
 * Apps Script can't read the Stripe-Signature header, so we (a) gate on a
 * shared token in the webhook URL and (b) never trust the POST body — we take
 * only the object id from it and RE-FETCH the real object from Stripe with our
 * secret key. A spoofed event can't survive the re-fetch.
 */
function handleStripeWebhook_(e) {
  const token = stripeWebhookToken_();
  // Fail closed: the shared URL token must be set AND match. A missing token
  // rejects the request rather than silently disabling the check.
  if (!token || e.parameter.token !== token) return json_({ ok: false });
  if (!stripeConfigured_()) return json_({ received: true });

  let event;
  try { event = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false }); }
  const type = String(event.type || "");
  try {
    if (type === "checkout.session.completed") {
      const sessionId = event.data.object.id;
      const session = stripeApi_("get", "checkout/sessions/" + sessionId, null);
      if (session && session.id) {
        const gc = (session.metadata && session.metadata.gc) || session.client_reference_id || "";
        let status = "active";
        if (session.subscription) {
          const sub = stripeApi_("get", "subscriptions/" + session.subscription, null);
          if (sub && sub.status) status = sub.status;
        }
        upsertBilling_(gc, session.customer, session.subscription, status);
      }
    } else if (type.indexOf("customer.subscription.") === 0) {
      const subId = event.data.object.id;
      const sub = stripeApi_("get", "subscriptions/" + subId, null);
      if (sub && sub.id) {
        const gc = (sub.metadata && sub.metadata.gc) || "";
        const status = type === "customer.subscription.deleted" ? "canceled" : sub.status;
        upsertBilling_(gc, sub.customer, sub.id, status);
      }
    }
  } catch (err) {
    Logger.log("Webhook error: " + err);
  }
  return json_({ received: true });
}

function getBillingRow_(gc) {
  if (!gc) return null;
  const { billing } = getSheets_();
  const rows = billing.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === String(gc)) {
      return {
        gc: String(rows[i][0]),
        customerId: String(rows[i][1] || ""),
        subId: String(rows[i][2] || ""),
        status: String(rows[i][3] || ""),
        updated: rows[i][4],
      };
    }
  }
  return null;
}

function getSubscriptionForGc_(gc) {
  const row = getBillingRow_(gc);
  if (!row) return null;
  const status = String(row.status || "").toLowerCase();
  const active = status === "active" || status === "trialing";
  return {
    active: active,
    status: status || "none",
    since: active && row.updated ? new Date(row.updated).toISOString() : undefined,
  };
}

function upsertBilling_(gc, customerId, subId, status) {
  withLock_(function () {
    const { billing } = getSheets_();
    const rows = billing.getDataRange().getValues();
    const now = new Date();
    let rowIdx = -1;
    for (let i = 1; i < rows.length; i++) {
      if ((customerId && String(rows[i][1]) === String(customerId)) ||
          (gc && String(rows[i][0]) === String(gc))) { rowIdx = i + 1; break; }
    }
    const gcName = gc || (rowIdx > 0 ? rows[rowIdx - 1][0] : "");
    const values = [gcName, customerId || "", subId || "", status || "", now];
    if (rowIdx > 0) billing.getRange(rowIdx, 1, 1, 5).setValues([values]);
    else billing.appendRow(values);
    SpreadsheetApp.flush();
  });
}

/* ---------------- integrity checks ---------------- */

// Confirm the submitted siteCode is a real jobsite in the Sites tab (keeps junk
// rows out; not an anti-forgery control since site codes are public).
// Find a jobsite row by its code (targeted TextFinder on column A). Returns the
// full row values (A..QUIZ_COL) or null.
function siteRow_(code) {
  if (!code) return null;
  const { sites } = getSheets_();
  const last = sites.getLastRow();
  if (last < 2) return null;
  const finder = sites.getRange(2, 1, last - 1, 1)
    .createTextFinder(String(code)).matchEntireCell(true).matchCase(false);
  const cell = finder.findNext();
  if (!cell) return null;
  return sites.getRange(cell.getRow(), 1, 1, QUIZ_COL).getValues()[0];
}

function validSite_(code) {
  return !!siteRow_(code);
}

// The number of questions the jobsite's quiz actually has: its own GC quiz length,
// or the default when it has none. Used to validate the submitted score.
function siteQuizLen_(row) {
  if (!row) return DEFAULT_QUIZ_LEN;
  const q = parseQuiz_(row[QUIZ_COL - 1]);
  return q.length > 0 ? q.length : DEFAULT_QUIZ_LEN;
}

// A drawn signature is a base64 PNG data URL. Require the data-URL prefix and a
// non-trivial length so a submit with signature:"x" or an empty data URL is
// rejected. A real signature canvas is always thousands of chars, so this never
// false-rejects a genuine (even minimal) signature.
function isRealSignature_(sig) {
  return typeof sig === "string" && sig.indexOf("data:image/") === 0 && sig.length > 100;
}

// Parse a "X/Y" score string and require at least 80% correct (matching the
// client's pass threshold). For the default 5-question quiz that's 4/5, the same
// as QUIZ_PASS_SCORE; a GC-specific quiz of any length uses the same 80% rule.
// `expectedTotal` is the jobsite's real quiz length: the client-reported Y must
// match it (so a tampered client can't submit "1/1" to shrink the denominator),
// and X can't exceed Y.
function quizPassed_(score, expectedTotal) {
  const m = String(score || "").match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) return false;
  const got = Number(m[1]);
  const total = Number(m[2]);
  if (total < 1 || got > total) return false;
  if (expectedTotal && total !== expectedTotal) return false;
  const need = Math.max(1, Math.ceil(total * 0.8));
  return got >= need;
}

/* ---------------- util ---------------- */

// Run fn() holding the script lock, so concurrent requests can't interleave a
// read-modify-write on the same sheet. If the lock can't be acquired we still
// run (better to record the orientation than lose it) but log the contention.
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  let held = false;
  try { lock.waitLock(15000); held = true; } catch (e) { Logger.log("Lock not acquired: " + e); }
  try {
    return fn();
  } finally {
    if (held) lock.releaseLock();
  }
}

function makeCertId_(d) {
  const ymd = Utilities.formatDate(d, "America/Chicago", "yyyyMMdd");
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  // 6 random chars (was 4): ~730 million combos/day, so cert IDs are not
  // practically guessable/enumerable and daily collisions are near-zero.
  let rand = "";
  for (let i = 0; i < 6; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
  return "KLR-" + ymd + "-" + rand;
}

function sendNotification_(certId, p, issued, expires) {
  try {
    const subject = "✅ Kleared: " + p.name + " — " + p.gc;
    const body =
      "New orientation completed.\n\n" +
      "Worker: " + p.name + " (" + p.company + " — " + p.trade + ")\n" +
      "Phone: " + p.phone + "\n" +
      "Language: " + p.lang.toUpperCase() + "\n" +
      "GC / Site: " + p.gc + " · " + p.site + "\n" +
      "Quiz: " + p.score + "\n" +
      "Cert ID: " + certId + "\n" +
      "Valid: " + Utilities.formatDate(issued, "America/Chicago", "MMM d, yyyy") +
      " → " + Utilities.formatDate(expires, "America/Chicago", "MMM d, yyyy") + "\n";
    MailApp.sendEmail(NOTIFY_EMAILS, subject, body);
  } catch (err) {
    Logger.log("Email failed: " + err);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
