// ============================================================
// KLEARED CONFIG — this is the ONLY file you need to edit.
// ============================================================
//
// 1. Deploy the Apps Script backend (Code.gs) as a Web App
//    (Execute as: Me / Who has access: Anyone)
// 2. Paste the deployment URL below. It must end in /exec
//    ⚠️ Paste the SCRIPT URL — not the Google Sheet URL.
//
// Leave it as "" and the app runs in DEMO MODE (sample sites,
// certificates are not saved). Good for showing GCs the flow.
// ============================================================

export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQoMn3F1ED4gV49WNyU04EvIRM9JtEjP-0VBV221oRc4TKrf1-fIEKBQpqcuO2XMAD0A/exec";

// Certificate validity in days (365 = 1 year)
export const CERT_VALID_DAYS = 365;

// Quiz: how many correct answers (out of 5) to pass
export const QUIZ_PASS_SCORE = 4;

// Worker photo captured during orientation and printed on the certificate.
// Set to false to remove the photo step entirely.
export const PHOTO_ENABLED = true;
// The captured photo is downscaled to this many pixels on its long edge and
// saved as a JPEG, keeping the base64 payload comfortably under a Google
// Sheet cell's 50,000-character limit (~400px q0.7 ≈ 20–35 KB).
export const PHOTO_MAX_PX = 400;
export const PHOTO_JPEG_QUALITY = 0.7;

// Demo sites shown when SCRIPT_URL is empty. `active: false` sites are hidden
// from workers but visible in the admin portal (so you can see the toggle work).
// `modules` are the GC's own custom orientation pages (shown after the 5 core
// safety modules) — this is the per-GC content beyond the short notes field.
export const DEMO_SITES = [
  {
    code: "DEMO1",
    gc: "Summit Builders (Demo)",
    site: "Riverside Tower — Nashville, TN",
    active: true,
    notesEn: "Hard hat, hi-vis vest, and safety glasses required at all times past the gate. Check in at the trailer before entering the work area.",
    notesEs: "Casco, chaleco reflectante y lentes de seguridad requeridos en todo momento después del portón. Regístrese en el tráiler antes de entrar al área de trabajo.",
    modules: [
      {
        titleEn: "Summit Builders — Site access & badging",
        titleEs: "Summit Builders — Acceso y credencial",
        pointsEn: [
          "Badge in at the north gate every morning — no badge, no entry.",
          "Visitor and delivery drivers must be escorted at all times.",
          "Parking is in Lot B only. The fire lane on the east side stays clear.",
        ],
        pointsEs: [
          "Registre su credencial en el portón norte cada mañana — sin credencial, no hay entrada.",
          "Los visitantes y conductores de entregas deben ir acompañados en todo momento.",
          "Estacione solo en el Lote B. El carril de bomberos del lado este debe permanecer despejado.",
        ],
      },
    ],
  },
  {
    code: "DEMO2",
    gc: "Apex Construction (Demo)",
    site: "Medical Office Building — Franklin, TN",
    active: true,
    notesEn: "Active crane operations this month. Stay clear of marked swing zones.",
    notesEs: "Operaciones de grúa activas este mes. Manténgase fuera de las zonas de giro marcadas.",
    modules: [],
  },
  {
    code: "DEMO3",
    gc: "Summit Builders (Demo)",
    site: "Parking Structure C — Retired",
    active: false,
    notesEn: "This project has wrapped. Orientation closed.",
    notesEs: "Este proyecto ha terminado. Orientación cerrada.",
    modules: [],
  },
];

// ---- Admin portal (GC self-serve) --------------------------------------
// Each GC gets a login code. In DEMO mode these codes work against the demo
// data above. In LIVE mode, codes live in the "Admins" tab of your Sheet and
// the MASTER_ADMIN_CODE is set at the top of Code.gs.
//   • A GC code only sees/edits that GC's own jobsites.
//   • The master code (owner) sees and edits every site.
export const DEMO_ADMINS: { code: string; gc: string }[] = [
  { code: "SUMMIT", gc: "Summit Builders (Demo)" },
  { code: "APEX", gc: "Apex Construction (Demo)" },
];
// Owner/master code for DEMO mode only — sees all GCs. This is intentionally a
// throwaway demo value and is NOT your real owner code. Your real master code
// lives server-side (Code.gs / Script Properties) and is never shipped here.
export const DEMO_MASTER_CODE = "DEMO-OWNER";

// ---- Billing (Stripe) --------------------------------------------------
// The subscription plan shown on the Pricing screen and in the admin portal.
// Real charging happens on Stripe's hosted Checkout page — no card details are
// ever entered in this app. Turn STRIPE_ENABLED on only AFTER you've added your
// Stripe keys to the Apps Script Script Properties (see KLEARED-SETUP.md).
export const STRIPE_ENABLED = false;
export const PLAN = {
  name: "Kleared Pro",
  price: "$49",
  interval: "mo", // shown as "/mo"
};
