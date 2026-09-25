import { useEffect, useMemo, useState } from "react";
import { t, MODULES, QUIZ, NOTICE, Lang, QuizQ } from "./content";
import {
  fetchSites, submitOrientation, verifyCert,
  adminSites, saveSite, setSiteActive, startCheckout, manageBilling,
  isDemo, Site, CertResult, VerifyResult, AdminSite, AdminSitesResult, CustomModule, Subscription,
} from "./api";
import { PHOTO_ENABLED, STRIPE_ENABLED, PLAN, NOTICE_VERSION, NOTICE_EFFECTIVE, ORG, ROLE_DROPDOWN } from "./config";
import {
  SignaturePad, PhotoCapture, QR, useHashRoute, go,
  CertRenderData, downloadCertPdf, downloadCertImage,
} from "./components";

type Step = "home" | "site" | "info" | "modules" | "quiz" | "photo" | "sign" | "cert";

interface WorkerInfo { name: string; company: string; phone: string; trade: string; }

// A base or GC-custom module, in the shape the worker module screen renders.
interface DisplayModule {
  icon: string;
  title: Record<Lang, string>;
  points: Record<Lang, string[]>;
  custom?: boolean;
}

const fmtDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const route = useHashRoute();

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/" onClick={() => go("/")}>
          <span className="k">K</span>KLEARED
        </a>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "es" ? "on" : ""} onClick={() => setLang("es")}>ES</button>
        </div>
      </header>

      {route.startsWith("/admin") ? (
        <Admin lang={lang} />
      ) : route.startsWith("/verify") ? (
        <Verify lang={lang} initialId={route.split("/")[2] || ""} />
      ) : route.startsWith("/pricing") ? (
        <Pricing lang={lang} />
      ) : route.startsWith("/privacy") ? (
        <Privacy lang={lang} />
      ) : (
        <Flow lang={lang} />
      )}

      <p className="footer-tag">
        <b>KLEARED</b> · {t.tagline[lang]} <span className="dim">· Division One Safety, LLC</span>
      </p>
      <p className="footer-tag" style={{ marginTop: 4 }}>
        <button className="link-admin" onClick={() => go("/privacy")}>{t.privacyLink[lang]}</button>
        <span className="dim"> · </span>
        <button className="link-admin" onClick={() => go("/pricing")}>{t.pricingLink[lang]}</button>
        <span className="dim"> · </span>
        <button className="link-admin" onClick={() => go("/admin")}>{t.adminLink[lang]}</button>
      </p>
    </div>
  );
}

/* ================= worker flow ================= */

function Flow({ lang }: { lang: Lang }) {
  const [step, setStep] = useState<Step>("home");
  const [sites, setSites] = useState<Site[] | null>(null);
  const [siteErr, setSiteErr] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [info, setInfo] = useState<WorkerInfo>({ name: "", company: "", phone: "", trade: "" });
  const [infoErr, setInfoErr] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentErr, setConsentErr] = useState(false);
  const [consentLang, setConsentLang] = useState<Lang>(lang); // language shown when consent was ticked
  const [modIdx, setModIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);
  const [signErr, setSignErr] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoErr, setPhotoErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState(false);
  const [cert, setCert] = useState<CertResult | null>(null);
  const [certBusy, setCertBusy] = useState<"" | "pdf" | "img">("");
  const [certDlErr, setCertDlErr] = useState(false);

  useEffect(() => {
    if (step === "site" && sites === null) {
      fetchSites().then(setSites).catch(() => setSiteErr(true));
    }
  }, [step, sites]);

  // If the worker switches language while on the consent (info) step, un-tick
  // consent so the box they agree to always matches the language on screen.
  useEffect(() => {
    if (step === "info") { setConsent(false); setConsentErr(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Normally: 5 core safety modules + this GC's own custom modules (if any).
  // When the GC delivers a FULL PROGRAM (e.g. an uploaded orientation deck), their
  // modules ARE the orientation, so they replace the core modules (and aren't
  // tagged "from your GC" — the whole thing is theirs).
  const allModules: DisplayModule[] = useMemo(() => {
    const fullProgram = !!site?.fullProgram;
    const custom: DisplayModule[] = (site?.modules || [])
      .filter((m) => (m.titleEn || m.titleEs) && (m.pointsEn.length || m.pointsEs.length))
      .map((m) => ({
        icon: "📋",
        title: { en: m.titleEn || m.titleEs, es: m.titleEs || m.titleEn },
        points: { en: m.pointsEn.length ? m.pointsEn : m.pointsEs, es: m.pointsEs.length ? m.pointsEs : m.pointsEn },
        custom: !fullProgram,
      }));
    return fullProgram && custom.length ? custom : [...MODULES, ...custom];
  }, [site]);

  // The active quiz: a GC's own quiz when they have one, otherwise the default.
  // Pass score is 80% of the questions (5 → 4, matching the default), so a
  // GC-specific quiz of any length uses a sensible threshold.
  const activeQuiz = useMemo(() => (site?.quiz?.length ? site.quiz : QUIZ), [site]);
  const passScore = Math.max(1, Math.ceil(activeQuiz.length * 0.8));

  // Jobsites listed in ROLE_DROPDOWN (e.g. Jones Bros) collect the worker's role
  // from a fixed dropdown and skip the company/trade text fields — the worker is
  // the GC's own employee, so their company is the GC itself.
  const roleOpts = site ? ROLE_DROPDOWN[site.code.toUpperCase()] : undefined;

  // site, info, modules…, quiz, [photo], sign
  const totalSteps = (PHOTO_ENABLED ? 5 : 4) + allModules.length;
  const stepNum = useMemo(() => {
    if (step === "site") return 1;
    if (step === "info") return 2;
    if (step === "modules") return 3 + modIdx;
    if (step === "quiz") return 3 + allModules.length;
    if (step === "photo") return 4 + allModules.length;
    if (step === "sign") return (PHOTO_ENABLED ? 5 : 4) + allModules.length;
    return 0;
  }, [step, modIdx, allModules.length]);

  // Clear ALL per-worker state so the next worker starts clean (shared device /
  // gate kiosk). Keeps the cached `sites` list. Callers set the next step.
  const resetFlow = () => {
    setSite(null);
    setInfo({ name: "", company: "", phone: "", trade: "" });
    setInfoErr(false);
    setConsent(false); setConsentErr(false); setConsentLang(lang);
    setModIdx(0); setScore(0);
    setSignature(null); setSignErr(false);
    setPhoto(null); setPhotoErr(false);
    setSubmitErr(false); setCert(null); setCertBusy(""); setCertDlErr(false);
  };

  const finish = async () => {
    if (!signature) { setSignErr(true); return; }
    if (PHOTO_ENABLED && !photo) { setPhotoErr(true); setStep("photo"); window.scrollTo(0, 0); return; }
    setSubmitting(true);
    setSubmitErr(false);
    try {
      const result = await submitOrientation({
        ...info,
        lang,
        siteCode: site!.code,
        gc: site!.gc,
        site: site!.site,
        score: `${score}/${activeQuiz.length}`,
        signature,
        photo: photo || "",
        consent,
        consentVersion: NOTICE_VERSION,
        consentLang, // the language shown when the box was ticked (not the live toggle)
      });
      setCert(result);
      setStep("cert");
      window.scrollTo(0, 0);
    } catch {
      setSubmitErr(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "home")
    return (
      <>
        <h1 className="display">
          {t.heroA[lang]}<br />
          <span className="y">{t.heroB[lang]}</span><br />
          <span className="dim">{t.heroC[lang]}</span>
        </h1>
        <p className="sub mt">{t.heroSub[lang]}</p>
        {isDemo() && <div className="demo-banner">{t.demoBanner[lang]}</div>}
        <div className="mt">
          <button
            className="btn btn-primary"
            onClick={() => { resetFlow(); setStep("site"); }}
          >
            {t.start[lang]} →
          </button>
          <button className="btn btn-ghost" onClick={() => go("/verify")}>
            {t.verifyCert[lang]}
          </button>
        </div>
      </>
    );

  if (step === "cert" && cert && site)
    return (
      <>
        <h2 className="display">{t.certTitle[lang]}</h2>
        <p className="sub">{t.certSub[lang]}</p>
        {isDemo() && <div className="demo-cert-banner">{t.demoCertBanner[lang]}</div>}
        <div className={`cert${isDemo() ? " cert-demo" : ""}`}>
          <div className="cert-stripe" />
          <div className="cert-body">
            <div className="cert-brand">
              KLEARED <span className="ok">✓ {t.passed[lang].toUpperCase()}</span>
            </div>
            <div className="cert-head">
              {photo && <img className="cert-photo" src={photo} alt="" />}
              <div>
                <div className="cert-name">{info.name}</div>
                <div className="cert-co">{info.company} · {info.trade}</div>
              </div>
            </div>
            <div className="cert-grid">
              <div className="cert-meta">
                <div>
                  <div className="lbl">{t.gcSite[lang]}</div>
                  <div className="val">{site.gc}</div>
                  <div className="val" style={{ color: "#5b6673", fontSize: 13 }}>{site.site}</div>
                </div>
                <div>
                  <div className="lbl">{t.certId[lang]}</div>
                  <div className="val cert-id">{cert.certId}</div>
                </div>
                <div>
                  <div className="lbl">{t.issued[lang]} · {t.validThru[lang]}</div>
                  <div className="val">{fmtDate(cert.issued, lang)} → {fmtDate(cert.expires, lang)}</div>
                </div>
              </div>
              <div className="cert-qr">
                <QR value={`${window.location.origin}${window.location.pathname}#/verify/${cert.certId}`} />
              </div>
            </div>
          </div>
        </div>

        {(() => {
          const certData: CertRenderData = {
            name: info.name, company: info.company, trade: info.trade,
            gc: site.gc, site: site.site, certId: cert.certId,
            issued: fmtDate(cert.issued, lang), expires: fmtDate(cert.expires, lang),
            photo: photo || "",
            verifyUrl: `${window.location.origin}${window.location.pathname}#/verify/${cert.certId}`,
            demo: isDemo(),
            demoLabel: t.demoWatermark[lang],
            labels: {
              docTitle: t.certDocTitle[lang], passed: t.passed[lang], gcSite: t.gcSite[lang],
              certId: t.certId[lang], issuedValid: `${t.issued[lang]} · ${t.validThru[lang]}`,
              verifyHint: t.certVerifyHint[lang], org: "Division One Safety, LLC", tagline: t.tagline[lang],
            },
          };
          const run = async (kind: "pdf" | "img") => {
            setCertBusy(kind); setCertDlErr(false);
            try {
              if (kind === "pdf") await downloadCertPdf(certData, cert.certId);
              else await downloadCertImage(certData, cert.certId);
            } catch { setCertDlErr(true); }
            finally { setCertBusy(""); }
          };
          return (
            <div className="cert-actions no-print">
              <button className="btn btn-primary" disabled={certBusy !== ""} onClick={() => run("pdf")}>
                {certBusy === "pdf" ? t.certPreparing[lang] : `⬇ ${t.certDownloadPdf[lang]}`}
              </button>
              <div className="cert-actions-row">
                <button className="btn btn-ghost" disabled={certBusy !== ""} onClick={() => run("img")}>
                  {certBusy === "img" ? t.certPreparing[lang] : t.certDownloadImg[lang]}
                </button>
                <button className="btn btn-ghost" onClick={() => window.print()}>{t.certPrint[lang]}</button>
              </div>
              {certDlErr && <p className="err">{t.certDownloadErr[lang]}</p>}
            </div>
          );
        })()}

        <p className="sub mt center no-print">📸 {t.screenshotTip[lang]}</p>
        <div className="mt no-print">
          <button className="btn btn-ghost" onClick={() => { resetFlow(); setStep("site"); window.scrollTo(0, 0); }}>
            {t.startAnother[lang]}
          </button>
        </div>
      </>
    );

  return (
    <>
      <div className="progress" aria-hidden>
        <div style={{ width: `${(stepNum / totalSteps) * 100}%` }} />
      </div>
      <span className="progress-label">{stepNum} / {totalSteps}</span>

      {step === "site" && (
        <>
          <h2 className="display mt">{t.chooseSite[lang]}</h2>
          <p className="sub">{t.chooseSiteSub[lang]}</p>
          {siteErr && <p className="err">{t.errNetwork[lang]}</p>}
          {!sites && !siteErr && <p className="sub mt">{t.loadingSites[lang]}</p>}
          {sites?.map((s) => (
            <button key={s.code} className="site-btn" onClick={() => { setSite(s); setModIdx(0); setStep("info"); window.scrollTo(0, 0); }}>
              <div className="gc">{s.gc}</div>
              <div className="st">{s.site}</div>
            </button>
          ))}
        </>
      )}

      {step === "info" && (
        <>
          <h2 className="display mt">{t.yourInfo[lang]}</h2>
          <div className="card">
            {(
              (roleOpts
                ? [
                    ["name", t.fullName[lang], "text"],
                    ["phone", t.phone[lang], "tel"],
                  ]
                : [
                    ["name", t.fullName[lang], "text"],
                    ["company", t.company[lang], "text"],
                    ["phone", t.phone[lang], "tel"],
                    ["trade", t.trade[lang], "text"],
                  ]) as [keyof WorkerInfo, string, string][]
            ).map(([key, label, type]) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  type={type}
                  value={info[key]}
                  onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                  autoComplete={key === "name" ? "name" : key === "phone" ? "tel" : "off"}
                />
              </div>
            ))}
            {roleOpts && (
              <div className="field">
                <label htmlFor="role">{t.role[lang]}</label>
                <select
                  id="role"
                  className="role-select"
                  value={info.trade}
                  onChange={(e) => setInfo({ ...info, trade: e.target.value })}
                >
                  <option value="">{t.roleSelect[lang]}</option>
                  {roleOpts.map((o) => (
                    <option key={o.en} value={o.en}>{lang === "es" ? o.es : o.en}</option>
                  ))}
                </select>
              </div>
            )}
            {infoErr && <p className="err">{t.required[lang]}</p>}
          </div>

          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (e.target.checked) { setConsentErr(false); setConsentLang(lang); }
              }}
            />
            <span>
              {t.consentText[lang]}{" "}
              <button type="button" className="link-admin" onClick={() => go("/privacy")}>
                {t.consentReadFull[lang]}
              </button>
            </span>
          </label>
          {consentErr && <p className="err">{t.consentRequired[lang]}</p>}

          <div className="mt">
            <button
              className="btn btn-primary"
              onClick={() => {
                // Role sites: company is the GC itself (worker is their employee),
                // so require name/phone/role and fill company automatically.
                const eff = roleOpts && site ? { ...info, company: site.gc } : info;
                const missing = roleOpts
                  ? [eff.name, eff.phone, eff.trade].some((v) => !v.trim())
                  : Object.values(eff).some((v) => !v.trim());
                if (missing) { setInfoErr(true); return; }
                if (!consent) { setConsentErr(true); return; }
                if (roleOpts && site && info.company !== site.gc) setInfo(eff);
                setStep("modules"); window.scrollTo(0, 0);
              }}
            >
              {t.continue[lang]} →
            </button>
            <button className="btn btn-ghost" onClick={() => setStep("site")}>{t.back[lang]}</button>
          </div>
        </>
      )}

      {step === "modules" && site && (
        <ModuleScreen
          lang={lang}
          idx={modIdx}
          modules={allModules}
          site={site}
          onBack={() => (modIdx === 0 ? setStep("info") : setModIdx(modIdx - 1))}
          onNext={() => {
            if (modIdx >= allModules.length - 1) setStep("quiz");
            else setModIdx(modIdx + 1);
            window.scrollTo(0, 0);
          }}
        />
      )}

      {step === "quiz" && (
        <Quiz
          lang={lang}
          quiz={activeQuiz}
          passScore={passScore}
          onPass={(s) => { setScore(s); setStep(PHOTO_ENABLED ? "photo" : "sign"); window.scrollTo(0, 0); }}
        />
      )}

      {step === "photo" && (
        <>
          <h2 className="display mt">{t.photoTitle[lang]}</h2>
          <p className="sub">{t.photoSub[lang]}</p>
          <p className="privacy-note">🔒 {t.photoConsentNote[lang]}</p>
          <PhotoCapture
            value={photo}
            onChange={(d) => { setPhoto(d); if (d) setPhotoErr(false); }}
            labels={{
              take: t.photoTake[lang],
              retake: t.photoRetake[lang],
              start: t.photoStartCam[lang],
              upload: t.photoUpload[lang],
              noCam: t.photoNoCam[lang],
            }}
          />
          {photoErr && <p className="err">{t.photoNeeded[lang]}</p>}
          <div className="mt">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!photo) { setPhotoErr(true); return; }
                setStep("sign"); window.scrollTo(0, 0);
              }}
            >
              {t.continue[lang]} →
            </button>
          </div>
        </>
      )}

      {step === "sign" && (
        <>
          <h2 className="display mt">{t.signTitle[lang]}</h2>
          <p className="sub">{t.signSub[lang]}</p>
          <SignaturePad clearLabel={t.clear[lang]} onChange={(d) => { setSignature(d); if (d) setSignErr(false); }} />
          {signErr && <p className="err">{t.signFirst[lang]}</p>}
          {submitErr && <p className="err">{t.errNetwork[lang]}</p>}
          <div className="mt">
            <button className="btn btn-primary" disabled={submitting} onClick={finish}>
              {submitting ? t.submitting[lang] : `${t.finish[lang]} →`}
            </button>
          </div>
        </>
      )}
    </>
  );
}

function ModuleScreen({
  lang, idx, modules, site, onBack, onNext,
}: { lang: Lang; idx: number; modules: DisplayModule[]; site: Site; onBack: () => void; onNext: () => void }) {
  const m = modules[idx];
  const notes = lang === "es" ? site.notesEs : site.notesEn;
  const isLast = idx === modules.length - 1;
  if (!m) return null;
  return (
    <>
      <p className="progress-label mt" style={{ display: "block", marginTop: 20 }}>
        {t.module[lang]} {idx + 1} {t.of[lang]} {modules.length}
      </p>
      <div className="card">
        <div className="mod-icon" aria-hidden>{m.icon}</div>
        {m.custom && <span className="gc-module-tag">★ {t.gcModuleTag[lang]}</span>}
        <h2 className="display">{m.title[lang]}</h2>
        <ul className="mod-points">
          {m.points[lang].map((p, i) => <li key={i}>{p}</li>)}
        </ul>
        {isLast && notes && (
          <div className="gc-notes">
            <span className="tag">⚠ {t.siteNotes[lang]}</span>
            {notes}
          </div>
        )}
      </div>
      <div className="mt">
        <button className="btn btn-primary" onClick={onNext}>{t.next[lang]} →</button>
        <button className="btn btn-ghost" onClick={onBack}>{t.back[lang]}</button>
      </div>
    </>
  );
}

function Quiz({
  lang, quiz, passScore, onPass,
}: { lang: Lang; quiz: QuizQ[]; passScore: number; onPass: (score: number) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const [checked, setChecked] = useState(false);

  const score = answers.filter((a, i) => a === quiz[i].answer).length;
  const allAnswered = answers.every((a) => a !== null);
  const failed = checked && score < passScore;

  const check = () => {
    if (score >= passScore) onPass(score);
    else { setChecked(true); window.scrollTo(0, 0); }
  };

  return (
    <>
      <h2 className="display mt">{failed ? t.failedTitle[lang] : t.quizTitle[lang]}</h2>
      <p className="sub">{failed ? t.failedSub[lang] : t.quizSub[lang]}</p>
      {quiz.map((q, qi) => {
        const miss = checked && answers[qi] !== q.answer;
        return (
          <div className={`card quiz-card${miss ? " miss" : ""}`} key={qi}>
            <p className="quiz-q">{qi + 1}. {q.q[lang]}</p>
            {q.options[lang].map((opt, oi) => (
              <button
                key={oi}
                className={`quiz-opt${answers[qi] === oi ? " sel" : ""}${miss && answers[qi] === oi ? " wrong" : ""}`}
                onClick={() => {
                  const next = [...answers];
                  next[qi] = oi;
                  setAnswers(next);
                  setChecked(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      })}
      <div className="mt">
        <button className="btn btn-primary" disabled={!allAnswered} onClick={check}>
          {failed ? t.retry[lang] : t.submitAnswers[lang]}
        </button>
      </div>
    </>
  );
}

/* ================= verification ================= */

function Verify({ lang, initialId }: { lang: Lang; initialId: string }) {
  const [id, setId] = useState(initialId);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [netErr, setNetErr] = useState(false);

  const run = async (certId: string) => {
    if (!certId.trim()) return;
    setBusy(true); setNetErr(false); setResult(null);
    try {
      setResult(await verifyCert(certId.trim().toUpperCase()));
    } catch {
      setNetErr(true);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (initialId) run(initialId); }, [initialId]);

  return (
    <>
      <h2 className="display">{t.verifyTitle[lang]}</h2>
      <div className="card">
        <div className="field">
          <label htmlFor="certid">{t.verifyEnter[lang]}</label>
          <input
            id="certid"
            value={id}
            placeholder="KLR-20260711-A4F2"
            onChange={(e) => setId(e.target.value)}
            style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
          />
        </div>
        <button className="btn btn-primary" disabled={busy} onClick={() => run(id)}>
          {busy ? t.verifying[lang] : t.verify[lang]}
        </button>
        {netErr && <p className="err">{t.errNetwork[lang]}</p>}
      </div>

      {result && (
        <div className="card">
          <span className={`badge ${result.status}`}>
            {result.status === "valid" ? "✓ " : ""}{t[result.status === "valid" ? "valid" : result.status === "expired" ? "expired" : "notFound"][lang]}
          </span>
          {result.status === "not_found" ? (
            <p className="sub mt">{t.notFoundSub[lang]}</p>
          ) : (
            <div className="mt verify-body">
              {result.photo && (
                <img className="verify-photo" src={result.photo} alt={t.photoLabel[lang]} />
              )}
              <div>
                <p><b>{t.worker[lang]}:</b> {result.name} — {result.company}</p>
                <p><b>{t.gcSite[lang]}:</b> {result.gc} · {result.site}</p>
                <p><b>{t.issued[lang]}:</b> {result.issued && fmtDate(result.issued, lang)}</p>
                <p><b>{t.validThru[lang]}:</b> {result.expires && fmtDate(result.expires, lang)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt">
        <button className="btn btn-ghost" onClick={() => go("/")}>← {t.home[lang]}</button>
      </div>
    </>
  );
}

/* ================= GC self-serve admin ================= */

const blankSite = (gc: string): AdminSite => ({
  code: "", gc, site: "", active: true, notesEn: "", notesEs: "", modules: [], fullProgram: false, quiz: [],
});

function Admin({ lang }: { lang: Lang }) {
  const [code, setCode] = useState("");
  const [auth, setAuth] = useState<AdminSitesResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [badCode, setBadCode] = useState(false);
  const [editing, setEditing] = useState<AdminSite | null>(null);
  const [saved, setSaved] = useState(false);
  const [billBusy, setBillBusy] = useState(false);
  const [billMsg, setBillMsg] = useState<"" | "notconf" | "err">("");

  const load = async (c: string) => {
    if (!c.trim()) return;
    setBusy(true); setBadCode(false);
    try {
      const res = await adminSites(c);
      if (res.ok) setAuth(res);
      else setBadCode(true);
    } catch {
      setBadCode(true);
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    try {
      const res = await adminSites(code);
      if (res.ok) setAuth(res);
    } catch { /* keep current view */ }
  };

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const billingAction = async (kind: "subscribe" | "manage") => {
    setBillBusy(true); setBillMsg("");
    try {
      const res = kind === "subscribe" ? await startCheckout(code) : await manageBilling(code);
      if (res.url) { window.location.href = res.url; return; }
      setBillMsg("notconf");
    } catch {
      setBillMsg("err");
    } finally {
      setBillBusy(false);
    }
  };

  /* --- sign-in --- */
  if (!auth)
    return (
      <>
        <h2 className="display">{t.adminTitle[lang]}</h2>
        <p className="sub">{t.adminSub[lang]}</p>
        {isDemo() && (
          <div className="demo-banner">{t.adminDemoNote[lang]} · SUMMIT · APEX · DEMO-OWNER</div>
        )}
        <div className="card">
          <div className="field">
            <label htmlFor="admincode">{t.adminCode[lang]}</label>
            <input
              id="admincode"
              value={code}
              autoComplete="off"
              autoCapitalize="characters"
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(code); }}
              style={{ fontFamily: "ui-monospace, Menlo, monospace", letterSpacing: "0.08em" }}
            />
          </div>
          <button className="btn btn-primary" disabled={busy || !code.trim()} onClick={() => load(code)}>
            {busy ? t.adminSigningIn[lang] : t.adminSignIn[lang]}
          </button>
          {badCode && <p className="err">{t.adminBadCode[lang]}</p>}
        </div>
        <div className="mt">
          <button className="btn btn-ghost" onClick={() => go("/")}>← {t.home[lang]}</button>
        </div>
      </>
    );

  /* --- dashboard --- */
  return (
    <>
      <div className="admin-head">
        <h2 className="display">{auth.master ? t.adminAllSites[lang] : t.adminYourSites[lang]}</h2>
        <button
          className="link-admin"
          onClick={() => { setAuth(null); setCode(""); setEditing(null); }}
        >
          {t.adminSignOut[lang]}
        </button>
      </div>
      {!auth.master && auth.gc && <p className="sub">{auth.gc}</p>}
      {isDemo() && <div className="demo-banner">{t.adminDemoNote[lang]}</div>}
      {saved && <p className="saved-msg">✓ {t.adminSaved[lang]}</p>}

      {!editing && !auth.master && (
        <BillingBanner
          lang={lang}
          sub={auth.subscription}
          busy={billBusy}
          msg={billMsg}
          onAction={billingAction}
        />
      )}

      {editing ? (
        <SiteEditor
          lang={lang}
          master={auth.master}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await refresh(); flashSaved(); }}
          save={(site) => saveSite(code, site)}
        />
      ) : (
        <>
          {auth.sites.length === 0 && <p className="sub mt">{t.adminNoSites[lang]}</p>}
          {auth.sites.map((s) => (
            <div className="admin-site" key={s.code}>
              <div className="admin-site-main">
                <div className="admin-site-name">{s.site || "—"}</div>
                <div className="admin-site-meta">
                  {auth.master ? `${s.gc} · ` : ""}<span className="mono">{s.code}</span>
                </div>
              </div>
              <span className={`pill ${s.active ? "on" : "off"}`}>
                {s.active ? t.adminActiveTag[lang] : t.adminInactiveTag[lang]}
              </span>
              <div className="admin-site-actions">
                <button
                  className="btn-mini"
                  onClick={() => setEditing({ ...s, modules: s.modules.map((m) => ({ ...m })) })}
                >
                  {t.adminEdit[lang]}
                </button>
                <button
                  className="btn-mini"
                  onClick={async () => { await setSiteActive(code, s.code, !s.active); await refresh(); }}
                >
                  {s.active ? t.adminRetire[lang] : t.adminActivate[lang]}
                </button>
              </div>
            </div>
          ))}
          <button
            className="btn btn-primary mt"
            onClick={() => setEditing(blankSite(auth.master ? "" : auth.gc))}
          >
            + {t.adminAddSite[lang]}
          </button>
          <div className="mt">
            <button className="btn btn-ghost" onClick={() => go("/")}>← {t.home[lang]}</button>
          </div>
        </>
      )}
    </>
  );
}

function SiteEditor({
  lang, master, initial, onCancel, onSaved, save,
}: {
  lang: Lang;
  master: boolean;
  initial: AdminSite;
  onCancel: () => void;
  onSaved: () => void;
  save: (site: AdminSite) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [s, setS] = useState<AdminSite>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(false);
  const isNew = !initial.code;
  const up = (patch: Partial<AdminSite>) => setS((prev) => ({ ...prev, ...patch }));

  const addModule = () =>
    up({ modules: [...s.modules, { titleEn: "", titleEs: "", pointsEn: [], pointsEs: [] }] });
  const removeModule = (i: number) => up({ modules: s.modules.filter((_, x) => x !== i) });
  const updModule = (i: number, patch: Partial<CustomModule>) =>
    up({ modules: s.modules.map((m, x) => (x === i ? { ...m, ...patch } : m)) });

  const submit = async () => {
    if (!s.site.trim() || (master && !s.gc.trim())) { setErr(true); return; }
    setSaving(true); setErr(false);
    try {
      const res = await save(s);
      if (res.ok) onSaved();
      else setErr(true);
    } catch {
      setErr(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3 className="editor-title">{isNew ? t.adminAddSite[lang] : t.adminEditSite[lang]}</h3>
      {master && (
        <div className="field">
          <label>{t.adminGcName[lang]}</label>
          <input value={s.gc} onChange={(e) => up({ gc: e.target.value })} />
        </div>
      )}
      <div className="field">
        <label>{t.adminSiteName[lang]}</label>
        <input value={s.site} onChange={(e) => up({ site: e.target.value })} />
      </div>
      <div className="field">
        <label>{t.adminSiteCode[lang]}</label>
        <input
          value={s.code}
          disabled={!isNew}
          onChange={(e) => up({ code: e.target.value })}
          style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
        />
        {isNew && <p className="hint">{t.adminSiteCodeHint[lang]}</p>}
      </div>
      <div className="field">
        <label>{t.adminNotesEn[lang]}</label>
        <textarea rows={3} value={s.notesEn} onChange={(e) => up({ notesEn: e.target.value })} />
      </div>
      <div className="field">
        <label>{t.adminNotesEs[lang]}</label>
        <textarea rows={3} value={s.notesEs} onChange={(e) => up({ notesEs: e.target.value })} />
      </div>

      <label className="fullprogram-toggle">
        <input
          type="checkbox"
          checked={s.fullProgram}
          onChange={(e) => up({ fullProgram: e.target.checked })}
        />
        <span>
          <strong>{t.adminFullProgram[lang]}</strong>
          <span className="hint" style={{ display: "block", marginTop: 2 }}>{t.adminFullProgramHint[lang]}</span>
        </span>
      </label>

      <div className="modules-editor">
        <div className="editor-title" style={{ fontSize: 15 }}>{t.adminModulesTitle[lang]}</div>
        <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>{t.adminModulesHint[lang]}</p>
        {s.modules.length > 12 && (
          <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>{t.adminBigProgramHint[lang]}</p>
        )}
        {s.modules.map((m, mi) => (
          <div className="module-block" key={mi}>
            <div className="module-block-head">
              <span>{t.module[lang]} {mi + 1}</span>
              <button type="button" className="link-admin" onClick={() => removeModule(mi)}>
                {t.adminRemoveModule[lang]}
              </button>
            </div>
            <div className="field">
              <label>{t.adminModuleTitleEn[lang]}</label>
              <input value={m.titleEn} onChange={(e) => updModule(mi, { titleEn: e.target.value })} />
            </div>
            <div className="field">
              <label>{t.adminModuleTitleEs[lang]}</label>
              <input value={m.titleEs} onChange={(e) => updModule(mi, { titleEs: e.target.value })} />
            </div>
            <div className="field">
              <label>{t.adminModulePointsEn[lang]}</label>
              <textarea rows={3} value={m.pointsEn.join("\n")}
                onChange={(e) => updModule(mi, { pointsEn: e.target.value.split("\n") })} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>{t.adminModulePointsEs[lang]}</label>
              <textarea rows={3} value={m.pointsEs.join("\n")}
                onChange={(e) => updModule(mi, { pointsEs: e.target.value.split("\n") })} />
            </div>
          </div>
        ))}
        <button type="button" className="btn-mini" onClick={addModule}>{t.adminAddModule[lang]}</button>
      </div>

      <label className="check">
        <input type="checkbox" checked={s.active} onChange={(e) => up({ active: e.target.checked })} />
        {t.adminActive[lang]}
      </label>
      {err && <p className="err">{t.required[lang]}</p>}
      <div className="mt">
        <button className="btn btn-primary" disabled={saving} onClick={submit}>
          {saving ? t.adminSaving[lang] : t.adminSave[lang]}
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>{t.adminCancel[lang]}</button>
      </div>
    </div>
  );
}

/* ================= billing ================= */

function BillingBanner({
  lang, sub, busy, msg, onAction,
}: {
  lang: Lang;
  sub?: Subscription;
  busy: boolean;
  msg: "" | "notconf" | "err";
  onAction: (kind: "subscribe" | "manage") => void;
}) {
  // In demo / not-configured mode we keep this friendly and non-blocking.
  if (!STRIPE_ENABLED)
    return (
      <div className="billing-card">
        <span className="pill off">{t.billingInactive[lang]}</span>
        <p className="hint" style={{ margin: 0, flex: 1 }}>{t.billingComingSoon[lang]}</p>
      </div>
    );

  const status = sub?.status || "none";
  const good = status === "active" || status === "trialing"; // paid / in good standing
  // A GC with any live subscription (incl. past_due) should MANAGE it, not start a second one.
  const hasSubscription = good || status === "past_due";
  const statusLabel =
    status === "trialing" ? t.billingTrial[lang]
    : status === "past_due" ? t.billingPastDue[lang]
    : status === "active" ? t.billingActive[lang]
    : t.billingInactive[lang];
  const pillClass = good ? "on" : status === "past_due" ? "warn" : "off";

  return (
    <div className="billing-card">
      <span className={`pill ${pillClass}`}>{good ? "✓ " : ""}{statusLabel}</span>
      {good && sub?.since && (
        <span className="billing-since">{t.billingSince[lang]} {fmtDate(sub.since, lang)}</span>
      )}
      <div className="billing-actions">
        <button
          className="btn-mini"
          disabled={busy}
          onClick={() => onAction(hasSubscription ? "manage" : "subscribe")}
        >
          {busy ? t.pricingRedirecting[lang] : hasSubscription ? t.billingManage[lang] : t.billingSubscribe[lang]}
        </button>
      </div>
      {msg === "notconf" && <p className="hint" style={{ width: "100%" }}>{t.pricingNotConfigured[lang]}</p>}
      {msg === "err" && <p className="err" style={{ width: "100%" }}>{t.errNetwork[lang]}</p>}
    </div>
  );
}

function Pricing({ lang }: { lang: Lang }) {
  return (
    <>
      <h2 className="display">{t.pricingTitle[lang]}</h2>
      <p className="sub">{t.pricingSub[lang]}</p>
      <div className="price-card">
        <div className="price-head">
          <div className="plan-name">{PLAN.name}</div>
          <div className="plan-price">
            {PLAN.price}<span className="plan-int">{t.pricingPerMonth[lang]}</span>
          </div>
        </div>
        <ul className="plan-features">
          {t.pricingFeatures[lang].map((f, i) => <li key={i}>{f}</li>)}
        </ul>
        <button className="btn btn-primary" onClick={() => go("/admin")}>{t.pricingCta[lang]} →</button>
        <p className="sub center pricing-note">{t.pricingSignInFirst[lang]}</p>
        {!STRIPE_ENABLED && <p className="hint center">{t.pricingNotConfigured[lang]}</p>}
        <p className="pricing-secure">🔒 {t.pricingSecure[lang]}</p>
      </div>
      <div className="mt">
        <button className="btn btn-ghost" onClick={() => go("/")}>← {t.home[lang]}</button>
      </div>
    </>
  );
}

/* ================= privacy notice ================= */

function Privacy({ lang }: { lang: Lang }) {
  const n = NOTICE[lang];
  return (
    <>
      <h2 className="display">{n.title}</h2>
      <p className="sub">{n.intro}</p>
      <div className="legal">
        {n.sections.map((s, i) => (
          <section key={i} className="legal-section">
            <h3>{s.h}</h3>
            {s.p.map((line, j) =>
              line.startsWith("• ") ? (
                <p key={j} className="legal-bullet">{line.slice(2)}</p>
              ) : (
                <p key={j}>{line}</p>
              )
            )}
          </section>
        ))}
        <section className="legal-section">
          <h3>{lang === "es" ? "Contacto y versión" : "Contact & version"}</h3>
          <p>{ORG.name} · {ORG.state}</p>
          <p>{ORG.privacyEmail}</p>
          {!ORG.mailingAddress.startsWith("[") && <p>{ORG.mailingAddress}</p>}
          <p className="legal-version">
            {lang === "es" ? "Versión" : "Version"} {NOTICE_VERSION} · {NOTICE_EFFECTIVE}
          </p>
        </section>
        <p className="legal-footer">{n.footer}</p>
      </div>
      <div className="mt">
        <button className="btn btn-ghost" onClick={() => go("/")}>← {t.home[lang]}</button>
      </div>
    </>
  );
}
