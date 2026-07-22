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

const SHEET_ID = "PASTE_BARE_SHEET_ID_HERE";
const NOTIFY_EMAILS = "dforero@divisiononesafety.com, admin@divisiononesafety.com";
const CERT_VALID_DAYS = 365;

// Owner/master admin code — sees and edits EVERY GC's jobsites.
// Set your PRIVATE code either here OR (preferred) under Project Settings →
// Script properties as MASTER_ADMIN_CODE. While BOTH are blank, master login is
// DISABLED. Never reuse the throwaway demo code from src/config.ts.
const MASTER_ADMIN_CODE = "";

// Orientations columns (1-based). Photo is the last column.
const PHOTO_COL = 15;
// Sites column (1-based) that holds the custom-modules JSON.
const MODULES_COL = 7;

/* ---------------- setup helpers ---------------- */

function getSheets_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  let sites = ss.getSheetByName("Sites");
  if (!sites) {
    sites = ss.insertSheet("Sites");
    sites.appendRow(["SiteCode", "GC Name", "Site Name", "Active", "Notes EN", "Notes ES", "Custom Modules (JSON)"]);
    sites.appendRow(["ABC01", "Example GC, Inc.", "Example Project — Nashville, TN", "YES",
      "Check in at the trailer before entering the work area.",
      "Regístrese en el tráiler antes de entrar al área de trabajo.", ""]);
    sites.setFrozenRows(1);
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
      "Signature (base64 PNG)", "Photo (base64 JPEG)"]);
    log.setFrozenRows(1);
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
  const { log } = getSheets_();
  const now = new Date();
  const expires = new Date(now.getTime() + CERT_VALID_DAYS * 24 * 60 * 60 * 1000);
  const certId = makeCertId_(now);

  // Append the row WITHOUT the photo first, so an oversized photo can never
  // stop the orientation itself from being recorded.
  log.appendRow([
    now, certId, p.name, p.company, "'" + p.phone, p.trade, p.lang,
    p.siteCode, p.gc, p.site, p.score, now, expires, p.signature || "", "",
  ]);

  if (p.photo) {
    try {
      log.getRange(log.getLastRow(), PHOTO_COL).setValue(p.photo);
    } catch (photoErr) {
      Logger.log("Photo not stored (likely too large): " + photoErr);
    }
  }

  sendNotification_(certId, p, now, expires);

  return { certId: certId, issued: now.toISOString(), expires: expires.toISOString() };
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
    });
  }
  return { sites: out };
}

function verify_(id) {
  if (!id) return { status: "not_found" };
  const { log } = getSheets_();
  const rows = log.getDataRange().getValues();
  const target = String(id).trim().toUpperCase();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][1]).toUpperCase() === target) {
      const expires = new Date(rows[i][12]);
      return {
        status: expires >= new Date() ? "valid" : "expired",
        name: String(rows[i][2]),
        company: String(rows[i][3]),
        gc: String(rows[i][8]),
        site: String(rows[i][9]),
        issued: new Date(rows[i][11]).toISOString(),
        expires: expires.toISOString(),
        photo: String(rows[i][PHOTO_COL - 1] || ""),
      };
    }
  }
  return { status: "not_found" };
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
    });
  }
  return out;
}

function adminSave_(code, site) {
  const auth = adminAuth_(code);
  if (!auth.ok) return { ok: false, error: "unauthorized" };
  if (!site || !String(site.site || "").trim()) return { ok: false, error: "missing site name" };

  const { sites } = getSheets_();
  const gc = auth.master ? (String(site.gc || "").trim() || "Owner") : auth.gc;
  let sc = String(site.code || "").trim().toUpperCase();
  const active = site.active === false ? "NO" : "YES";
  const modules = serverCleanModules_(site.modules);
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

  const values = [sc, gc, String(site.site).trim(), active,
    String(site.notesEn || "").trim(), String(site.notesEs || "").trim(),
    JSON.stringify(modules)];
  if (rowIdx > 0) sites.getRange(rowIdx, 1, 1, MODULES_COL).setValues([values]);
  else sites.appendRow(values);

  return {
    ok: true,
    site: {
      code: sc, gc: gc, site: values[2], active: active === "YES",
      notesEn: values[4], notesEs: values[5], modules: modules,
    },
  };
}

function adminSetActive_(code, siteCode, active) {
  const auth = adminAuth_(code);
  if (!auth.ok) return { ok: false };
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

function parseModules_(cell) {
  if (!cell) return [];
  try {
    const arr = JSON.parse(String(cell));
    return Array.isArray(arr) ? serverCleanModules_(arr) : [];
  } catch (err) {
    return [];
  }
}

function serverCleanModules_(mods) {
  if (!Array.isArray(mods)) return [];
  const clean = [];
  for (let i = 0; i < mods.length && i < 20; i++) {
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
}

/* ---------------- util ---------------- */

function makeCertId_(d) {
  const ymd = Utilities.formatDate(d, "America/Chicago", "yyyyMMdd");
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
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
