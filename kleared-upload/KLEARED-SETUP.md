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
- **"This GC delivers its own complete orientation" toggle:** in the jobsite editor. When ON, that GC's modules **replace** Kleared's 5 core safety modules (the whole orientation is theirs) instead of being tacked on after them. It's a checkbox in the editor, and it's stored in column **H** ("Full Program", `YES`/`NO`) of the Sites tab. Leave it OFF for a normal GC who just wants a few extra pages.
- Codes are lightweight access — treat them like a door code, rotate if one leaks (set that row's Active to `NO`).

### Adding a GC that brings their own full orientation (e.g. Jones Bros)

Some GCs (like **Jones Bros Contractors**) want to run their *entire* new-hire safety orientation through Kleared — a full slide deck, not just a few extra pages. Those programs are too big to type into the portal by hand (Jones Bros' is 60 bilingual modules from a 65-slide deck), so they're loaded with a one-click import script. They can also carry their **own quiz** that replaces the generic 5 questions.

**Show it to Jones Bros first (no deploy needed):** once the frontend is pushed, open **`kleared.com/?demo=1`** on your phone. That forces demo mode — the **Jones Bros Contractors (Demo)** jobsite appears at the top of the list, and you can walk their whole orientation + their own quiz end-to-end. Nothing you do in `?demo=1` saves a real certificate, so it's a safe sandbox to demo. (Your real workers never see it — it only appears with the `?demo=1` link.)

**When they're ready to go live — to add them:**
1. In the Apps Script editor, add a new file (the **+** next to *Files* → *Script*), name it `JonesBros`, and paste in everything from **JonesBros.gs**.
2. Make sure the updated **Code.gs** is in place and you've run **`setup`** once (it adds the new "Full Program" and "Quiz" columns).
3. In the function dropdown pick **`importJonesBros`** → **Run**. It creates the Jones Bros GC + a jobsite, turns on full-program mode, loads all 60 orientation modules (EN + ES) plus their 5-question Jones Bros quiz, and adds a portal login code (`JONESBROS`) so Jones Bros can manage their own jobsites.
4. **Deploy → Manage deployments → pencil → New version → Deploy** so the change goes live.
5. Text Jones Bros their portal code (`JONESBROS`) and their jobsite is live. Workers who pick that jobsite get the full Jones Bros orientation and quiz instead of the generic ones.

> Behind the scenes, big programs are gzip-compressed into the single Sheet cell automatically, so they fit Google's 50,000-character-per-cell limit. The GC-specific quiz lives in a "Quiz" column and needs at least 80% correct to pass (4 of 5). To add a *different* GC's deck later, send me the file and I'll generate the same kind of one-click importer.

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

## Privacy & consent (important — read this)

Kleared collects workers' **photos and signatures**, which can trigger strict state biometric-privacy laws (e.g. Illinois BIPA). The app now ships a bilingual **Privacy Notice** (`kleared.com/#/privacy`) and a **consent checkbox** the worker must tick *before* their photo/signature are captured; each consent is logged (version + language) in the **Orientations** tab.

**Before you rely on it, do these five things:**
1. **Have a lawyer skim the notice.** It's a solid, specific draft written to the strictest standard — but a quick legal review is worth it given the biometric angle. The text lives in `src/content.ts` (the `NOTICE` object, English + Spanish).
2. **Create and monitor `privacy@divisiononesafety.com`** — the notice tells workers to email it for access/deletion requests. Change the address in `src/config.ts` (`ORG.privacyEmail`) if you prefer another.
3. **(Optional) Add your mailing address** in `src/config.ts` (`ORG.mailingAddress`). Left as-is, the notice simply uses email only.
4. **Schedule the retention cleanup** so the "we delete your photo" promise is actually kept: Apps Script editor → **Triggers** (clock icon) → **Add Trigger** → function **`purgeExpiredData_`**, event source **Time-driven**, **Day timer** (e.g. 2–3am). It deletes each worker's photo 1 year after their cert expires and the whole record after 5 years.
5. **Bump `NOTICE_VERSION`** in `src/config.ts` whenever you change the notice wording, so each worker's consent record shows exactly what they agreed to.

**Design choice you can flip:** the public certificate-verification page no longer shows the worker's **photo** to anonymous lookups (it still shows valid/name/employer/GC/jobsite/dates; the photo still rides on the worker's own certificate and goes to the GC). This is a big privacy-risk reduction. To show the photo publicly again, set `PUBLIC_VERIFY_SHOW_PHOTO = true` at the top of `Code.gs` — but the better path, if gate staff need the photo, is to gate it behind a GC login (ask and I'll build it).

## Certificate integrity (be realistic)

Every certificate is verified **against your live records** — the QR/ID looks the worker up in your Orientations tab, so a "certificate" that isn't in your sheet doesn't verify. The backend now also refuses to write a row unless it's a **real, active jobsite**, with a **real signature**, and a **passing quiz score** — so a cert only ever reflects a genuinely completed, passing orientation, even if someone tampers with the app.

**What this does NOT do:** because the app has no worker logins (workers are anonymous crew on their own phones), a technically-skilled person could still script a passing submission. But note what that actually produces — **a real, timestamped, auditable row in your sheet**, not an undetectable fake. It's data you can see and delete, not a forged PDF that passes verification while being absent from your records. For a small operation this residual risk is low; the practical mitigations are (a) spot-checking the Orientations log and (b) a "revoke a certificate" feature (easy to add later) so you can invalidate anything suspicious. Truly preventing it would require per-worker or per-GC logins — a bigger change worth doing only if a GC demands it.

## What's built

✅ Bilingual worker orientation (5 core modules + GC site-specific rules)
✅ **Per-GC custom modules** — GCs add their own EN/ES training pages from the portal
✅ **Full-program GCs** — a GC (e.g. Jones Bros) can deliver their *entire* orientation deck through Kleared, replacing the generic core modules (large decks are one-click imported and auto-compressed)
✅ 5-question quiz, 4 to pass, unlimited retries
✅ Signature capture + **worker photo** on the cert & Verify screen (camera, upload fallback)
✅ QR-verified digital certificate, 1-year validity
✅ **Downloadable / printable certificate** — one-tap PDF, image, or print
✅ Email notifications + Sheet logging
✅ **GC self-serve admin portal** — add/retire jobsites and custom modules with an access code
✅ **Stripe billing** (optional) — subscribe / manage via Stripe-hosted checkout & portal
✅ **Bilingual privacy notice + pre-capture consent** (logged as a legal record) and a scheduled retention/deletion job
✅ Demo mode for showing GCs before the backend is connected

**Recently hardened (Sept 2026):** verification lookups now scale to tens of thousands of records; concurrent submissions are locked so rows can't collide; cert IDs lengthened so they're not guessable; public verification no longer exposes the worker's photo.

🔜 Later ideas: worker-facing "my certificates" history, GC analytics dashboard, SMS reminders.

**Config knobs** (top of `src/config.ts`): `PHOTO_ENABLED`, `PHOTO_MAX_PX`, `PHOTO_JPEG_QUALITY`, `QUIZ_PASS_SCORE`, `CERT_VALID_DAYS`, `STRIPE_ENABLED`, `PLAN`, and the demo sites/admin codes.
