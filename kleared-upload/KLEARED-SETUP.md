# Kleared — Launch Guide

Three parts, ~30 minutes total. Do them in order.

---

## Part 1 — Backend (Google Sheet + Apps Script) · ~10 min

1. Go to sheets.google.com → new blank sheet → name it **Kleared Data**
2. Copy the Sheet ID from the URL. The URL looks like:
   `https://docs.google.com/spreadsheets/d/`**`1AbC...xyz`**`/edit`
   ⚠️ **Bare ID only — not the full URL.** (This one has bitten you before.)
3. In the sheet: **Extensions → Apps Script**
4. Delete whatever's in the editor, paste in everything from **Code.gs**
5. At the top of the code, replace `PASTE_BARE_SHEET_ID_HERE` with your Sheet ID.
   Then set `MASTER_ADMIN_CODE` to a private code only you know (or leave it blank in the code and add it under **Project Settings → Script properties** as `MASTER_ADMIN_CODE`). This is your owner login for the GC admin portal — **until you set it, owner login is disabled**, and it should never match the throwaway demo code.
6. Save. In the function dropdown, pick **setup** → click **Run** → approve the permissions. This creates the **Sites**, **Admins**, and **Orientations** tabs automatically.
7. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (not "Anyone within organization" — workers won't be logged into your domain)
8. Copy the URL that ends in **/exec**. That's your backend URL.

Remember: any time you change the script later, you need **Deploy → Manage deployments → pencil → New version → Deploy** or changes won't take effect.

---

## Part 2 — Frontend (your existing GitHub + Vercel) · ~15 min

Your repo is **github.com/dforero-hue/safety-app** and Vercel already auto-deploys it.

1. Open **kleared-app.zip** on your computer and extract it
2. Open `src/config.ts` in any text editor (Notepad works) and paste your /exec URL:
   ```
   export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Go to your GitHub repo → you're going to replace everything:
   - Click into each old file/folder → trash icon → commit. (Or easiest: **Add file → Upload files**, drag ALL extracted files and folders in, and commit — GitHub overwrites files with the same names. Make sure the `src` folder uploads as a folder.)
   - The repo root should end up with: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, and the `src` folder.
4. Commit. Vercel rebuilds automatically (~90 seconds). Check the Deployments tab in Vercel — you want a green "Ready."
5. Open your vercel.app URL on your phone. You should see the Kleared home screen with the EN/ES toggle.

**Test the full loop:** complete an orientation on your phone → check the Orientations tab in the Sheet → check your email → scan the QR on the cert with another phone → it should show ✓ VALID.

---

## Part 3 — Domain · ~5 min

In Vercel: your project → **Settings → Domains → Add** → enter `kleared.com` → follow the DNS instructions it gives you (two records at your registrar). Takes effect within an hour, usually minutes.

---

## Running it day-to-day

- **Add a GC/jobsite (you):** add a row in the **Sites** tab. Code, GC name, site name, `YES` in Active, and site-specific notes in EN + ES. Shows up in the app instantly — no code changes, no redeploy.
- **Add a GC/jobsite (the GC self-serves):** see the admin portal below — GCs can add and retire their own sites without touching the Sheet.
- **Retire a site:** change Active to `NO` (or use the **Retire** button in the portal).
- **Your dashboard is the Sheet.** Every orientation logs there with cert ID, expiry, quiz score, signature, and the worker's **photo** (base64 — paste into a cell viewer or the app's Verify screen to see it). Filter, sort, pivot — same as your inspection forms.
- **Verification:** GC gate staff scan the worker's QR (now shows the worker's photo to confirm identity), or go to your site → Verify a certificate → type the cert ID.
- **The worker's certificate:** at the end, the worker can **Download PDF**, **Save image**, or **Print** their cert — not just screenshot it. The PDF/image is a clean one-page certificate they can text to a GC or keep on file.

## GC self-serve admin portal

Footer of the app → **GC / Admin sign-in** (or go to `yoursite.com/#/admin`).

- **Give a GC access:** add a row in the **Admins** tab — a `Code` (e.g. `SUMMIT24`), the exact `GC Name` (must match how it appears in the Sites tab), and `YES` in Active. Text them the code. They sign in and see/add/retire only *their* jobsites.
- **Your owner login:** the `MASTER_ADMIN_CODE` you set in Code.gs. It sees and edits **every** GC's sites.
- **Custom orientation modules:** when a GC edits a jobsite, they can add their own training pages ("modules") — a title + bullet points in EN and ES — beyond the short site-rules field. Workers see these after the 5 core safety modules, tagged "From your GC." Stored as JSON in column **G** of the Sites tab; you never need to touch that column by hand.
- Codes are lightweight access — treat them like a door code, rotate if one leaks (set that row's Active to `NO`).

---

## Part 4 — Billing (Stripe) · optional, ~15 min

Billing is **off by default** — the app works fully without it. Turn it on once you're ready to charge GCs. Nothing about payments is entered in the app; workers/GCs pay on Stripe's own hosted checkout page.

1. In **Stripe → Product catalog**, create a product (e.g. "Kleared Pro") with a **recurring price** (e.g. $49/month). Copy the **price ID** (`price_...`).
2. In **Apps Script → Project Settings (gear) → Script properties**, add three properties:
   - `STRIPE_SECRET_KEY` → your secret key (`sk_live_...`, or `sk_test_...` while testing)
   - `STRIPE_PRICE_ID` → the `price_...` from step 1
   - `STRIPE_WEBHOOK_TOKEN` → any random string you make up (e.g. `klr_wh_9f3k2`) — **required**: the webhook rejects any request that doesn't carry this exact token.
   - `APP_BASE_URL` *(optional but recommended)* → your live app URL (e.g. `https://kleared.com`). Setting it locks all post-payment redirects to your own domain.
3. In **Stripe → Developers → Webhooks → Add endpoint**, set the URL to your `/exec` URL **plus** `?src=stripe&token=YOUR_WEBHOOK_TOKEN`, and subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   > Apps Script can't read Stripe's signature header, so the backend instead (a) checks that token and (b) re-fetches each event from Stripe with your secret key before trusting it — a spoofed webhook can't mark anyone as paid.
4. Re-deploy the script (**Manage deployments → New version**).
5. In `src/config.ts`, set `export const STRIPE_ENABLED = true;` and adjust `PLAN` (name/price/interval — display only). Commit; Vercel rebuilds.

Now a GC signs in to the portal and sees **Subscribe** (→ Stripe Checkout) or, once subscribed, **Manage billing** (→ Stripe's customer portal). Status lands in the **Billing** tab of your Sheet. Leave `STRIPE_ENABLED = false` to keep the pricing page visible but billing dormant.

---

## What's built

✅ Bilingual worker orientation (5 core modules + GC site-specific rules)
✅ **Per-GC custom modules** — GCs add their own EN/ES training pages from the portal
✅ 5-question quiz, 4 to pass, unlimited retries
✅ Signature capture + **worker photo** on the cert & Verify screen (camera, upload fallback)
✅ QR-verified digital certificate, 1-year validity
✅ **Downloadable / printable certificate** — one-tap PDF, image, or print
✅ Email notifications + Sheet logging
✅ **GC self-serve admin portal** — add/retire jobsites and custom modules with an access code
✅ **Stripe billing** (optional) — subscribe / manage via Stripe-hosted checkout & portal
✅ Demo mode for showing GCs before the backend is connected

🔜 Later ideas: worker-facing "my certificates" history, GC analytics dashboard, SMS reminders.

**Config knobs** (top of `src/config.ts`): `PHOTO_ENABLED`, `PHOTO_MAX_PX`, `PHOTO_JPEG_QUALITY`, `QUIZ_PASS_SCORE`, `CERT_VALID_DAYS`, `STRIPE_ENABLED`, `PLAN`, and the demo sites/admin codes.
