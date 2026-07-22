import {
  SCRIPT_URL, DEMO_SITES, DEMO_ADMINS, DEMO_MASTER_CODE, CERT_VALID_DAYS, STRIPE_ENABLED,
} from "./config";

/** A GC's own custom orientation page, shown after the 5 core safety modules. */
export interface CustomModule {
  titleEn: string;
  titleEs: string;
  pointsEn: string[];
  pointsEs: string[];
}

export interface Site {
  code: string;
  gc: string;
  site: string;
  notesEn: string;
  notesEs: string;
  active?: boolean;
  modules?: CustomModule[];
}

export interface OrientationPayload {
  name: string;
  company: string;
  phone: string;
  trade: string;
  lang: string;
  siteCode: string;
  gc: string;
  site: string;
  score: string;
  signature: string; // data URL
  photo: string; // data URL (JPEG) or ""
}

export interface CertResult {
  certId: string;
  issued: string; // ISO date
  expires: string; // ISO date
}

export interface VerifyResult {
  status: "valid" | "expired" | "not_found";
  name?: string;
  company?: string;
  gc?: string;
  site?: string;
  issued?: string;
  expires?: string;
  photo?: string; // data URL or ""
}

/* ---- admin (GC self-serve) ---- */

export interface AdminSite {
  code: string;
  gc: string;
  site: string;
  active: boolean;
  notesEn: string;
  notesEs: string;
  modules: CustomModule[];
}

export interface Subscription {
  active: boolean;
  status: string; // active | trialing | past_due | canceled | none
  since?: string; // ISO
}

export interface AdminAuth {
  ok: boolean;
  gc: string; // GC name, or "*" for the owner/master code
  master: boolean;
}

export interface AdminSitesResult extends AdminAuth {
  sites: AdminSite[];
  subscription?: Subscription;
}

export const isDemo = () => !SCRIPT_URL;

/* ---- shared transport ---- */
// text/plain avoids a CORS preflight, which Apps Script can't answer.
async function postJson(body: unknown): Promise<any> {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("request failed");
  return res.json();
}

/* ================= worker-facing ================= */

export async function fetchSites(): Promise<Site[]> {
  if (isDemo()) return demoSites.filter((s) => s.active).map(stripAdmin);
  const res = await fetch(`${SCRIPT_URL}?action=sites`);
  if (!res.ok) throw new Error("sites fetch failed");
  const data = await res.json();
  return data.sites as Site[];
}

export async function submitOrientation(p: OrientationPayload): Promise<CertResult> {
  if (isDemo()) {
    const issued = new Date();
    const expires = new Date(issued.getTime() + CERT_VALID_DAYS * 86400000);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const ymd = issued.toISOString().slice(0, 10).replace(/-/g, "");
    return {
      certId: `KLR-${ymd}-${rand}`,
      issued: issued.toISOString(),
      expires: expires.toISOString(),
    };
  }
  const data = await postJson({ op: "orientation", ...p });
  if (!data.certId) throw new Error(data.error || "submit failed");
  return data as CertResult;
}

export async function verifyCert(id: string): Promise<VerifyResult> {
  if (isDemo()) {
    return { status: "not_found" };
  }
  const res = await fetch(`${SCRIPT_URL}?action=verify&id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("verify failed");
  return (await res.json()) as VerifyResult;
}

/* ================= admin-facing ================= */

export async function adminSites(code: string): Promise<AdminSitesResult> {
  if (isDemo()) {
    const auth = demoAuth(code);
    if (!auth) return { ok: false, gc: "", master: false, sites: [] };
    const sites = auth.master ? demoSites : demoSites.filter((s) => s.gc === auth.gc);
    return { ...auth, sites: sites.map(cloneSite) };
  }
  return (await postJson({ op: "adminSites", code })) as AdminSitesResult;
}

export async function saveSite(
  code: string,
  site: AdminSite
): Promise<{ ok: boolean; site?: AdminSite; error?: string }> {
  if (isDemo()) {
    const auth = demoAuth(code);
    if (!auth) return { ok: false, error: "bad code" };
    const gc = auth.master ? site.gc.trim() || "Owner" : auth.gc;
    const sc = (site.code || "").trim().toUpperCase() || genCode(site.site);
    const clean: AdminSite = {
      code: sc,
      gc,
      site: site.site.trim(),
      active: site.active,
      notesEn: site.notesEn.trim(),
      notesEs: site.notesEs.trim(),
      modules: cleanModules(site.modules),
    };
    const idx = demoSites.findIndex((s) => s.code.toUpperCase() === sc);
    if (idx >= 0) demoSites[idx] = clean;
    else demoSites.push(clean);
    return { ok: true, site: clean };
  }
  return await postJson({ op: "saveSite", code, site: { ...site, modules: cleanModules(site.modules) } });
}

export async function setSiteActive(
  code: string,
  siteCode: string,
  active: boolean
): Promise<{ ok: boolean }> {
  if (isDemo()) {
    const auth = demoAuth(code);
    if (!auth) return { ok: false };
    const s = demoSites.find(
      (x) => x.code.toUpperCase() === siteCode.toUpperCase() && (auth.master || x.gc === auth.gc)
    );
    if (s) s.active = active;
    return { ok: true };
  }
  return await postJson({ op: "setActive", code, siteCode, active });
}

/* ================= billing (Stripe) ================= */

// Redirect targets for Stripe Checkout / Billing Portal. Both go through the
// backend, which holds the secret key — no card data touches this app.
export async function startCheckout(code: string): Promise<{ url?: string; error?: string }> {
  if (isDemo() || !STRIPE_ENABLED) return { error: "not_configured" };
  return await postJson({ op: "createCheckout", code, returnUrl: appReturnUrl() });
}

export async function manageBilling(code: string): Promise<{ url?: string; error?: string }> {
  if (isDemo() || !STRIPE_ENABLED) return { error: "not_configured" };
  return await postJson({ op: "billingPortal", code, returnUrl: appReturnUrl() });
}

const appReturnUrl = () => window.location.origin + window.location.pathname + "#/admin";

/* ---- demo helpers ---- */

// A mutable in-memory copy so admin edits persist for the session in demo mode.
let demoSites: AdminSite[] = DEMO_SITES.map((s) => ({ ...s, modules: cleanModules(s.modules) }));

const cloneSite = (s: AdminSite): AdminSite => ({ ...s, modules: s.modules.map((m) => ({ ...m })) });

const stripAdmin = (s: AdminSite): Site => ({
  code: s.code,
  gc: s.gc,
  site: s.site,
  notesEn: s.notesEn,
  notesEs: s.notesEs,
  modules: s.modules.map((m) => ({ ...m })),
});

function cleanModules(mods: CustomModule[] | undefined): CustomModule[] {
  if (!Array.isArray(mods)) return [];
  return mods
    .map((m) => ({
      titleEn: (m.titleEn || "").trim(),
      titleEs: (m.titleEs || "").trim(),
      pointsEn: (m.pointsEn || []).map((p) => p.trim()).filter(Boolean),
      pointsEs: (m.pointsEs || []).map((p) => p.trim()).filter(Boolean),
    }))
    // Keep only modules that will actually render for workers: a title AND at
    // least one point. This matches the worker-flow filter, so nothing is ever
    // "saved but hidden".
    .filter((m) => (m.titleEn || m.titleEs) && (m.pointsEn.length || m.pointsEs.length));
}

function demoAuth(code: string): AdminAuth | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  if (c === DEMO_MASTER_CODE.toUpperCase()) return { ok: true, gc: "*", master: true };
  const a = DEMO_ADMINS.find((x) => x.code.toUpperCase() === c);
  return a ? { ok: true, gc: a.gc, master: false } : null;
}

function genCode(name: string): string {
  const letters = (name.replace(/[^A-Za-z]/g, "").toUpperCase() + "SITE").slice(0, 3);
  const n = Math.floor(Math.random() * 90 + 10);
  return letters + n;
}
