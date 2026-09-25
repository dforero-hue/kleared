export type Lang = "en" | "es";

export const t = {
  tagline: { en: "Everyone makes it home.", es: "Todos a casa." },
  start: { en: "Start orientation", es: "Comenzar orientación" },
  verifyCert: { en: "Verify a certificate", es: "Verificar un certificado" },
  heroA: { en: "Every worker.", es: "Cada trabajador." },
  heroB: { en: "Every site.", es: "Cada obra." },
  heroC: { en: "Every language.", es: "Cada idioma." },
  heroSub: {
    en: "Complete your site safety orientation on your phone and get a verified digital certificate — before you touch a tool.",
    es: "Complete su orientación de seguridad desde su teléfono y reciba un certificado digital verificado — antes de tocar una herramienta.",
  },
  chooseSite: { en: "Select your jobsite", es: "Seleccione su obra" },
  chooseSiteSub: {
    en: "Pick the General Contractor and project you are working on.",
    es: "Elija el Contratista General y el proyecto donde va a trabajar.",
  },
  loadingSites: { en: "Loading jobsites…", es: "Cargando obras…" },
  yourInfo: { en: "Your information", es: "Su información" },
  fullName: { en: "Full name", es: "Nombre completo" },
  company: { en: "Your company (subcontractor)", es: "Su empresa (subcontratista)" },
  phone: { en: "Phone number", es: "Número de teléfono" },
  trade: { en: "Trade / job", es: "Oficio / trabajo" },
  continue: { en: "Continue", es: "Continuar" },
  back: { en: "Back", es: "Atrás" },
  next: { en: "Next", es: "Siguiente" },
  required: { en: "All fields are required.", es: "Todos los campos son obligatorios." },
  module: { en: "Module", es: "Módulo" },
  of: { en: "of", es: "de" },
  siteNotes: { en: "Site-specific rules from your GC", es: "Reglas específicas de la obra de su contratista" },
  quizTitle: { en: "Safety check", es: "Comprobación de seguridad" },
  quizSub: {
    en: "Answer 5 questions. You need 4 correct to pass. You can retry.",
    es: "Responda 5 preguntas. Necesita 4 correctas para aprobar. Puede volver a intentarlo.",
  },
  submitAnswers: { en: "Check my answers", es: "Revisar mis respuestas" },
  passed: { en: "Passed", es: "Aprobado" },
  failedTitle: { en: "Not quite — let's try again", es: "Casi — intentemos de nuevo" },
  failedSub: {
    en: "Review the highlighted questions and resubmit. Safety first.",
    es: "Revise las preguntas marcadas y vuelva a enviar. La seguridad es primero.",
  },
  retry: { en: "Try again", es: "Intentar de nuevo" },
  signTitle: { en: "Sign to confirm", es: "Firme para confirmar" },
  signSub: {
    en: "By signing, I confirm I completed this orientation, understood it, and agree to follow all site safety rules.",
    es: "Al firmar, confirmo que completé esta orientación, la entendí, y acepto seguir todas las reglas de seguridad de la obra.",
  },
  clear: { en: "Clear", es: "Borrar" },
  finish: { en: "Get my certificate", es: "Obtener mi certificado" },
  signFirst: { en: "Please sign in the box above.", es: "Por favor firme en el cuadro de arriba." },
  submitting: { en: "Creating your certificate…", es: "Creando su certificado…" },
  certTitle: { en: "You're Kleared.", es: "Está Kleared." },
  certSub: {
    en: "Show this screen or the QR code at the gate. A copy was logged with your GC.",
    es: "Muestre esta pantalla o el código QR en el portón. Se registró una copia con su contratista.",
  },
  certId: { en: "Certificate ID", es: "ID del certificado" },
  validThru: { en: "Valid through", es: "Válido hasta" },
  issued: { en: "Issued", es: "Emitido" },
  screenshotTip: {
    en: "Take a screenshot of this card and keep it on your phone.",
    es: "Tome una captura de pantalla de esta tarjeta y guárdela en su teléfono.",
  },
  demoBanner: {
    en: "Demo mode — certificates are not being saved. Connect the backend in config.ts.",
    es: "Modo demo — los certificados no se están guardando. Conecte el backend en config.ts.",
  },
  verifyTitle: { en: "Certificate verification", es: "Verificación de certificado" },
  verifyEnter: { en: "Enter a certificate ID", es: "Ingrese un ID de certificado" },
  verify: { en: "Verify", es: "Verificar" },
  verifying: { en: "Checking…", es: "Verificando…" },
  valid: { en: "VALID", es: "VÁLIDO" },
  expired: { en: "EXPIRED", es: "VENCIDO" },
  notFound: { en: "NOT FOUND", es: "NO ENCONTRADO" },
  notFoundSub: {
    en: "No orientation record matches this ID. Do not allow site access based on this certificate.",
    es: "Ningún registro coincide con este ID. No permita acceso a la obra con este certificado.",
  },
  worker: { en: "Worker", es: "Trabajador" },
  gcSite: { en: "GC / Site", es: "Contratista / Obra" },
  home: { en: "Home", es: "Inicio" },
  errNetwork: {
    en: "Couldn't reach the server. Check your signal and try again.",
    es: "No se pudo conectar al servidor. Revise su señal e intente de nuevo.",
  },

  /* ---- photo step ---- */
  photoTitle: { en: "Take your photo", es: "Tome su foto" },
  photoSub: {
    en: "This photo goes on your certificate so the gate can confirm it's you. Face the camera in good light.",
    es: "Esta foto va en su certificado para que en el portón confirmen que es usted. Mire a la cámara con buena luz.",
  },
  photoTake: { en: "Take photo", es: "Tomar foto" },
  photoRetake: { en: "Retake", es: "Repetir" },
  photoUse: { en: "Use this photo", es: "Usar esta foto" },
  photoUpload: { en: "Upload a photo instead", es: "Subir una foto" },
  photoStartCam: { en: "Turn on camera", es: "Encender cámara" },
  photoNeeded: { en: "Please add a photo to continue.", es: "Agregue una foto para continuar." },
  photoNoCam: {
    en: "Camera unavailable — use the upload button below.",
    es: "Cámara no disponible — use el botón de subir abajo.",
  },
  photoLabel: { en: "Photo", es: "Foto" },

  /* ---- admin portal ---- */
  adminLink: { en: "GC / Admin sign-in", es: "Acceso Contratista / Admin" },
  adminTitle: { en: "Jobsite admin", es: "Administración de obras" },
  adminSub: {
    en: "Sign in to add or retire your jobsites — no spreadsheet, no waiting.",
    es: "Inicie sesión para agregar o retirar sus obras — sin hojas de cálculo, sin esperas.",
  },
  adminCode: { en: "Access code", es: "Código de acceso" },
  adminSignIn: { en: "Sign in", es: "Entrar" },
  adminSigningIn: { en: "Signing in…", es: "Entrando…" },
  adminBadCode: { en: "That code wasn't recognized.", es: "Ese código no fue reconocido." },
  adminSignOut: { en: "Sign out", es: "Salir" },
  adminYourSites: { en: "Your jobsites", es: "Sus obras" },
  adminAllSites: { en: "All jobsites (owner)", es: "Todas las obras (dueño)" },
  adminAddSite: { en: "Add a jobsite", es: "Agregar obra" },
  adminEditSite: { en: "Edit jobsite", es: "Editar obra" },
  adminNoSites: {
    en: "No jobsites yet. Add your first one below.",
    es: "Aún no hay obras. Agregue la primera abajo.",
  },
  adminSiteName: { en: "Project / site name", es: "Nombre del proyecto / obra" },
  adminGcName: { en: "GC / company name", es: "Nombre del contratista / empresa" },
  adminSiteCode: { en: "Site code", es: "Código de obra" },
  adminSiteCodeHint: {
    en: "Short unique code (e.g. RVR01). Leave blank to auto-generate.",
    es: "Código corto único (ej. RVR01). Déjelo vacío para generarlo.",
  },
  adminNotesEn: { en: "Site rules — English", es: "Reglas de la obra — Inglés" },
  adminNotesEs: { en: "Site rules — Spanish", es: "Reglas de la obra — Español" },
  adminActive: { en: "Active (workers can select it)", es: "Activa (los trabajadores pueden elegirla)" },
  adminSave: { en: "Save jobsite", es: "Guardar obra" },
  adminSaving: { en: "Saving…", es: "Guardando…" },
  adminCancel: { en: "Cancel", es: "Cancelar" },
  adminEdit: { en: "Edit", es: "Editar" },
  adminActiveTag: { en: "Active", es: "Activa" },
  adminInactiveTag: { en: "Retired", es: "Retirada" },
  adminActivate: { en: "Reactivate", es: "Reactivar" },
  adminRetire: { en: "Retire", es: "Retirar" },
  adminSaved: { en: "Saved.", es: "Guardado." },
  adminDemoNote: {
    en: "Demo mode — changes are not saved. Live codes live in your Sheet.",
    es: "Modo demo — los cambios no se guardan. Los códigos activos están en su hoja de cálculo.",
  },

  /* ---- certificate downloads ---- */
  certDownloadPdf: { en: "Download PDF", es: "Descargar PDF" },
  certDownloadImg: { en: "Save image", es: "Guardar imagen" },
  certPrint: { en: "Print", es: "Imprimir" },
  certPreparing: { en: "Preparing…", es: "Preparando…" },
  certDocTitle: {
    en: "Certificate of Safety Orientation",
    es: "Certificado de Orientación de Seguridad",
  },
  certVerifyHint: { en: "Scan to verify", es: "Escanee para verificar" },
  // Shown ONLY in demo mode (kleared.com/?demo=1). A demo run never saves a record,
  // so the on-screen cert and the downloaded file are marked so they can't be
  // mistaken for a real clearance.
  demoCertBanner: {
    en: "DEMO — this is not a real certificate. Nothing was saved and it won't verify.",
    es: "DEMO — este no es un certificado real. No se guardó nada y no se puede verificar.",
  },
  demoWatermark: { en: "DEMO — NOT VALID", es: "DEMO — NO VÁLIDO" },
  certDownloadErr: {
    en: "Couldn't build the file. Try “Save image”, or screenshot the card.",
    es: "No se pudo generar el archivo. Use “Guardar imagen” o tome una captura.",
  },

  /* ---- custom GC modules ---- */
  gcModuleTag: { en: "From your GC", es: "De su contratista" },
  adminFullProgram: {
    en: "This GC delivers its own complete orientation",
    es: "Este GC entrega su propia orientación completa",
  },
  adminFullProgramHint: {
    en: "On: the modules below ARE the orientation and replace Kleared's 5 core safety modules. Off: they're shown as extras after the core modules.",
    es: "Activado: los módulos de abajo SON la orientación y reemplazan los 5 módulos básicos de Kleared. Desactivado: se muestran como extras después de los módulos básicos.",
  },
  adminBigProgramHint: {
    en: "This is a large imported program. Editing it here page-by-page is fine, but for big rewrites ask your Kleared admin.",
    es: "Este es un programa importado grande. Editarlo aquí página por página está bien, pero para cambios grandes consulte a su administrador de Kleared.",
  },
  adminModulesTitle: { en: "Custom orientation modules", es: "Módulos de orientación personalizados" },
  adminModulesHint: {
    en: "Extra training pages your workers see after the 5 core safety modules. Optional — leave empty if the site rules above are enough.",
    es: "Páginas de capacitación adicionales que sus trabajadores ven después de los 5 módulos básicos. Opcional — déjelo vacío si las reglas de arriba bastan.",
  },
  adminModuleTitleEn: { en: "Module title — English", es: "Título del módulo — Inglés" },
  adminModuleTitleEs: { en: "Module title — Spanish", es: "Título del módulo — Español" },
  adminModulePointsEn: {
    en: "Points — English (one per line)",
    es: "Puntos — Inglés (uno por línea)",
  },
  adminModulePointsEs: {
    en: "Points — Spanish (one per line)",
    es: "Puntos — Español (uno por línea)",
  },
  adminAddModule: { en: "+ Add module", es: "+ Agregar módulo" },
  adminRemoveModule: { en: "Remove", es: "Quitar" },

  /* ---- pricing / billing ---- */
  pricingLink: { en: "Pricing", es: "Precios" },
  pricingTitle: { en: "Simple, honest pricing", es: "Precios simples y honestos" },
  pricingSub: {
    en: "One plan. Unlimited workers and jobsites. Cancel anytime.",
    es: "Un plan. Trabajadores y obras ilimitados. Cancele cuando quiera.",
  },
  pricingPerMonth: { en: "/mo", es: "/mes" },
  pricingFeatures: {
    en: [
      "Unlimited workers and jobsites",
      "Bilingual orientation (EN / ES)",
      "Photo-ID + QR-verified certificates",
      "GC self-serve admin portal",
      "Custom modules per jobsite",
      "Email + spreadsheet logging",
    ],
    es: [
      "Trabajadores y obras ilimitados",
      "Orientación bilingüe (EN / ES)",
      "Certificados con foto y verificación QR",
      "Portal de administración para el contratista",
      "Módulos personalizados por obra",
      "Registro por correo y hoja de cálculo",
    ],
  },
  pricingCta: { en: "Subscribe", es: "Suscribirse" },
  pricingRedirecting: { en: "Opening secure checkout…", es: "Abriendo pago seguro…" },
  pricingSecure: {
    en: "Secure payment by Stripe. No card details are entered or stored in this app.",
    es: "Pago seguro con Stripe. No se ingresan ni guardan datos de tarjeta en esta app.",
  },
  pricingNotConfigured: {
    en: "Billing isn't switched on yet. Add your Stripe keys to go live — see the setup guide.",
    es: "La facturación aún no está activada. Agregue sus claves de Stripe para activarla.",
  },
  pricingSignInFirst: {
    en: "Sign in to the GC portal first, then subscribe from there.",
    es: "Inicie sesión en el portal primero, luego suscríbase desde ahí.",
  },
  pricingGoToPortal: { en: "Go to GC sign-in", es: "Ir al acceso del portal" },

  /* ---- billing status (admin) ---- */
  billingActive: { en: "Subscription active", es: "Suscripción activa" },
  billingTrial: { en: "Free trial", es: "Prueba gratis" },
  billingPastDue: { en: "Payment past due", es: "Pago vencido" },
  billingInactive: { en: "No active subscription", es: "Sin suscripción activa" },
  billingSince: { en: "since", es: "desde" },
  billingSubscribe: { en: "Subscribe", es: "Suscribirse" },
  billingManage: { en: "Manage billing", es: "Administrar facturación" },
  billingComingSoon: {
    en: "Billing setup pending — you have full access in the meantime.",
    es: "Configuración de facturación pendiente — mientras tanto tiene acceso completo.",
  },

  /* ---- consent + privacy ---- */
  consentText: {
    en: "I am 18 or older. I agree that Division One Safety, LLC may collect my name, phone, employer, trade, photo, and signature to create my safety certificate and share it with the general contractor for this jobsite. I understand my name, employer, general contractor, jobsite, and certificate dates can be seen by anyone who has my certificate ID. I give this consent freely, before my photo and signature are taken.",
    es: "Soy mayor de 18 años. Autorizo a Division One Safety, LLC a recopilar mi nombre, teléfono, empleador, oficio, foto y firma para crear mi certificado de seguridad y compartirlo con el contratista general de esta obra. Entiendo que mi nombre, empleador, contratista general, obra y fechas del certificado pueden ser vistos por cualquier persona que tenga el número de mi certificado. Doy este consentimiento de forma voluntaria, antes de que se tomen mi foto y mi firma.",
  },
  consentReadFull: { en: "Read the full Privacy Notice", es: "Leer el Aviso de Privacidad completo" },
  consentRequired: {
    en: "Please read and check the consent box to continue.",
    es: "Lea y marque la casilla de consentimiento para continuar.",
  },
  privacyLink: { en: "Privacy Notice", es: "Aviso de Privacidad" },
  privacyBack: { en: "Back", es: "Atrás" },
  photoConsentNote: {
    en: "Your photo appears on your own certificate and is shared with your general contractor. It is NOT shown to people who only look up your certificate ID.",
    es: "Su foto aparece en su propio certificado y se comparte con su contratista general. NO se muestra a quienes solo consultan el número de su certificado.",
  },
  startAnother: { en: "Start a new orientation", es: "Iniciar una nueva orientación" },
};

/* ================= privacy notice ================= */

export interface NoticeSection {
  h: string;      // heading
  p: string[];    // paragraphs and/or bullet lines (a line starting with "• " renders as a bullet)
}

// Plain-language, worker-readable privacy notice. Written to the strictest US
// standard (Illinois BIPA-style) because workers may be in any state. This is a
// solid DRAFT — have a lawyer review it, especially the biometric-photo parts,
// and fill in ORG.mailingAddress / ORG.privacyEmail in config.ts.
export const NOTICE: Record<Lang, { title: string; intro: string; sections: NoticeSection[]; footer: string }> = {
  en: {
    title: "Kleared Privacy Notice",
    intro:
      "This page explains, in plain language, what Kleared collects from you during your safety orientation, why, who can see it, how long we keep it, and the choices you have. Please read it before you agree.",
    sections: [
      {
        h: "1. Who collects your information",
        p: [
          "Division One Safety, LLC, a Tennessee company (\"we\", \"us\"), operates Kleared and controls the information collected here.",
          "Questions or requests: privacy@divisiononesafety.com.",
        ],
      },
      {
        h: "2. What we collect from you",
        p: [
          "• Your full name, phone number, employer (subcontractor), and trade",
          "• Your preferred language (English or Spanish)",
          "• A selfie photo of your face",
          "• Your signature",
          "• Your quiz score, the jobsite you selected, and the date and time",
        ],
      },
      {
        h: "3. Your photo and signature",
        p: [
          "Your face photo may count as \"biometric information\" under some state laws, so we treat it carefully.",
          "We use your photo only to put it on your certificate and to help confirm your identity. We do NOT use facial recognition or face-scanning technology on it. We do NOT sell, rent, trade, or make money from your photo or signature, and we do not use them to train any software.",
        ],
      },
      {
        h: "4. Why we collect it",
        p: [
          "To create your safety-orientation certificate and to keep a record that you completed the orientation for a jobsite.",
        ],
      },
      {
        h: "5. Who can look up your certificate",
        p: [
          "Your certificate can be checked by anyone who has your certificate ID (for example, by scanning the QR code on your certificate). They will see your name, employer, general contractor, jobsite, and the certificate dates.",
          "Your PHOTO is NOT shown to someone who only looks up your certificate ID. Your photo appears on your own certificate (the copy on your phone) and is shared with the general contractor for your jobsite.",
        ],
      },
      {
        h: "6. Who else gets your information",
        p: [
          "• The general contractor whose jobsite you are entering (for site access and safety records)",
          "• Google LLC (Google Sheets / Apps Script) and Vercel Inc. (web hosting), who store and run the app for us on U.S. systems and may not use your information for their own purposes",
        ],
      },
      {
        h: "7. How long we keep it",
        p: [
          "Your certificate is valid for 1 year.",
          "We keep your orientation record (name, employer, trade, jobsite, quiz score, signature, and dates) for as long as your certificate is valid plus about 5 years, to meet safety-recordkeeping and legal needs, and then we delete it.",
          "We delete your PHOTO sooner — within 1 year after your certificate expires, and we never keep your photo longer than 3 years after your last activity with us.",
        ],
      },
      {
        h: "8. How we protect your information",
        p: [
          "We use encryption in transit (HTTPS), storage on Google's secured systems, and access limited to authorized Division One Safety staff. No system is perfectly secure. If a breach affects your information, we will notify you and any required authorities without unreasonable delay.",
        ],
      },
      {
        h: "9. Your choices and rights",
        p: [
          "You can ask us to show you, correct, or delete your information, and to stop using your photo and signature. Depending on your state, you may also have the right to appeal if we deny a request.",
          "To make a request, email privacy@divisiononesafety.com. We will respond within 45 days (we may need up to 45 more days and will tell you if so). If we deny your request, you may ask us to reconsider by replying to our response. Deleting your record may cancel your certificate.",
        ],
      },
      {
        h: "10. If you don't want to agree",
        p: [
          "You don't have to agree. If you don't, you may not be able to finish this orientation for this jobsite. Talk to your employer, the general contractor, or contact us with any questions.",
        ],
      },
      {
        h: "11. Age",
        p: [
          "Kleared is only for people 18 or older. We do not knowingly collect information from anyone under 18. If we learn we have, we delete it.",
        ],
      },
      {
        h: "12. Changes to this notice",
        p: [
          "We may update this notice. When we do, we change the version and date below. Your consent record shows which version you agreed to.",
        ],
      },
    ],
    footer: "This is a plain-language summary provided in good faith and is not legal advice.",
  },
  es: {
    title: "Aviso de Privacidad de Kleared",
    intro:
      "Esta página explica, en lenguaje sencillo, qué recopila Kleared durante su orientación de seguridad, por qué, quién puede verlo, cuánto tiempo lo guardamos y las opciones que usted tiene. Léala antes de aceptar.",
    sections: [
      {
        h: "1. Quién recopila su información",
        p: [
          "Division One Safety, LLC, una empresa de Tennessee (\"nosotros\"), opera Kleared y controla la información que se recopila aquí.",
          "Preguntas o solicitudes: privacy@divisiononesafety.com.",
        ],
      },
      {
        h: "2. Qué recopilamos de usted",
        p: [
          "• Su nombre completo, número de teléfono, empleador (subcontratista) y oficio",
          "• Su idioma preferido (inglés o español)",
          "• Una foto (selfie) de su cara",
          "• Su firma",
          "• Su puntaje del examen, la obra que seleccionó, y la fecha y hora",
        ],
      },
      {
        h: "3. Su foto y su firma",
        p: [
          "Su foto de la cara puede considerarse \"información biométrica\" bajo algunas leyes estatales, por eso la tratamos con cuidado.",
          "Usamos su foto solo para ponerla en su certificado y ayudar a confirmar su identidad. NO usamos reconocimiento facial ni tecnología de escaneo de rostro. NO vendemos, alquilamos, intercambiamos ni ganamos dinero con su foto o firma, y no las usamos para entrenar ningún software.",
        ],
      },
      {
        h: "4. Por qué la recopilamos",
        p: [
          "Para crear su certificado de orientación de seguridad y mantener un registro de que completó la orientación para una obra.",
        ],
      },
      {
        h: "5. Quién puede consultar su certificado",
        p: [
          "Su certificado puede ser verificado por cualquier persona que tenga el número de su certificado (por ejemplo, escaneando el código QR de su certificado). Verán su nombre, empleador, contratista general, obra y las fechas del certificado.",
          "Su FOTO NO se muestra a quien solo consulta el número de su certificado. Su foto aparece en su propio certificado (la copia en su teléfono) y se comparte con el contratista general de su obra.",
        ],
      },
      {
        h: "6. Quién más recibe su información",
        p: [
          "• El contratista general de la obra a la que ingresa (para acceso a la obra y registros de seguridad)",
          "• Google LLC (Google Sheets / Apps Script) y Vercel Inc. (alojamiento web), que almacenan y ejecutan la aplicación para nosotros en sistemas de EE. UU. y no pueden usar su información para sus propios fines",
        ],
      },
      {
        h: "7. Cuánto tiempo la guardamos",
        p: [
          "Su certificado es válido por 1 año.",
          "Guardamos su registro de orientación (nombre, empleador, oficio, obra, puntaje, firma y fechas) mientras su certificado sea válido más aproximadamente 5 años, para cumplir con obligaciones de registro de seguridad y legales, y luego lo eliminamos.",
          "Eliminamos su FOTO antes — dentro de 1 año después de que venza su certificado, y nunca guardamos su foto por más de 3 años después de su última actividad con nosotros.",
        ],
      },
      {
        h: "8. Cómo protegemos su información",
        p: [
          "Usamos cifrado en tránsito (HTTPS), almacenamiento en los sistemas seguros de Google, y acceso limitado al personal autorizado de Division One Safety. Ningún sistema es perfectamente seguro. Si una filtración afecta su información, se lo notificaremos a usted y a las autoridades requeridas sin demora irrazonable.",
        ],
      },
      {
        h: "9. Sus opciones y derechos",
        p: [
          "Puede pedirnos ver, corregir o eliminar su información, y dejar de usar su foto y firma. Según su estado, también puede tener derecho a apelar si negamos una solicitud.",
          "Para hacer una solicitud, escriba a privacy@divisiononesafety.com. Responderemos dentro de 45 días (podríamos necesitar hasta 45 días más y se lo avisaremos). Si negamos su solicitud, puede pedirnos que la reconsideremos respondiendo a nuestra respuesta. Eliminar su registro puede cancelar su certificado.",
        ],
      },
      {
        h: "10. Si no desea aceptar",
        p: [
          "No está obligado a aceptar. Si no acepta, es posible que no pueda terminar esta orientación para esta obra. Hable con su empleador, el contratista general, o contáctenos con cualquier pregunta.",
        ],
      },
      {
        h: "11. Edad",
        p: [
          "Kleared es solo para personas de 18 años o más. No recopilamos a sabiendas información de menores de 18 años. Si nos enteramos de que lo hicimos, la eliminamos.",
        ],
      },
      {
        h: "12. Cambios a este aviso",
        p: [
          "Podemos actualizar este aviso. Cuando lo hagamos, cambiaremos la versión y la fecha de abajo. Su registro de consentimiento muestra qué versión aceptó.",
        ],
      },
    ],
    footer: "Este es un resumen en lenguaje sencillo proporcionado de buena fe y no constituye asesoría legal.",
  },
};

export interface Module {
  icon: string;
  title: Record<Lang, string>;
  points: Record<Lang, string[]>;
}

export const MODULES: Module[] = [
  {
    icon: "🦺",
    title: { en: "PPE — wear it, every time", es: "EPP — úselo, siempre" },
    points: {
      en: [
        "Hard hat, hi-vis vest, safety glasses, and work boots are the minimum on every active site.",
        "Task-specific PPE (gloves, hearing protection, face shield, harness) is required where posted or directed.",
        "Damaged PPE gets replaced — never taped, never 'good enough.' Ask your foreman for a replacement.",
      ],
      es: [
        "Casco, chaleco reflectante, lentes de seguridad y botas de trabajo son lo mínimo en toda obra activa.",
        "EPP específico de la tarea (guantes, protección auditiva, careta, arnés) es obligatorio donde esté indicado.",
        "El EPP dañado se reemplaza — nunca con cinta, nunca 'así está bien.' Pida un reemplazo a su capataz.",
      ],
    },
  },
  {
    icon: "🪜",
    title: { en: "Fall protection", es: "Protección contra caídas" },
    points: {
      en: [
        "In construction, fall protection is required at 6 feet or more above a lower level.",
        "Inspect your harness and lanyard before each use. Tie off to an approved anchor point — not to guardrails or conduit.",
        "Never remove or step over guardrails, hole covers, or warning lines. If a cover is missing, report it immediately.",
      ],
      es: [
        "En construcción, la protección contra caídas es obligatoria a 6 pies (1.8 m) o más sobre un nivel inferior.",
        "Inspeccione su arnés y línea de vida antes de cada uso. Ánclese solo a un punto de anclaje aprobado — no a barandales ni tuberías.",
        "Nunca quite ni pase sobre barandales, cubiertas de huecos o líneas de advertencia. Si falta una cubierta, repórtelo de inmediato.",
      ],
    },
  },
  {
    icon: "⚠️",
    title: { en: "Hazard communication", es: "Comunicación de peligros" },
    points: {
      en: [
        "You have the right to know what chemicals you work around. Safety Data Sheets (SDS) are available on site — ask where.",
        "Read container labels. Never use an unlabeled container, and never put chemicals in food or drink bottles.",
        "Signs, tags, and barricade tape are there for a reason. Red/danger means do not enter without authorization.",
      ],
      es: [
        "Usted tiene derecho a saber con qué químicos trabaja. Las Hojas de Datos de Seguridad (SDS) están disponibles en la obra — pregunte dónde.",
        "Lea las etiquetas de los envases. Nunca use un envase sin etiqueta, y nunca ponga químicos en botellas de comida o bebida.",
        "Los letreros, etiquetas y cinta de barricada están por una razón. Rojo/peligro significa no entrar sin autorización.",
      ],
    },
  },
  {
    icon: "🚨",
    title: { en: "Emergencies & reporting", es: "Emergencias y reportes" },
    points: {
      en: [
        "Know your muster point and the site emergency number before you start work. If you don't know them — ask today.",
        "Report ALL injuries and near misses to your foreman the same day, no matter how small.",
        "If you see something unsafe, you have the authority to stop work and speak up. No one gets in trouble for stopping unsafe work.",
      ],
      es: [
        "Conozca su punto de reunión y el número de emergencia de la obra antes de empezar. Si no los sabe — pregunte hoy.",
        "Reporte TODAS las lesiones y casi-accidentes a su capataz el mismo día, por pequeños que sean.",
        "Si ve algo inseguro, tiene la autoridad de parar el trabajo y hablar. Nadie se mete en problemas por detener trabajo inseguro.",
      ],
    },
  },
  {
    icon: "🏗️",
    title: { en: "General site rules", es: "Reglas generales de la obra" },
    points: {
      en: [
        "No drugs or alcohol on site — zero tolerance. Impairment gets people killed.",
        "Housekeeping is safety: keep walkways clear, stack materials safely, and clean your area before you leave.",
        "Only trained and authorized operators use equipment — forklifts, telehandlers, MEWPs, and power tools included.",
      ],
      es: [
        "Cero drogas y alcohol en la obra — tolerancia cero. Trabajar bajo influencia mata.",
        "El orden y la limpieza son seguridad: mantenga los pasillos despejados, apile materiales de forma segura y limpie su área antes de irse.",
        "Solo operadores capacitados y autorizados usan equipo — incluyendo montacargas, telehandlers, plataformas elevadoras y herramientas eléctricas.",
      ],
    },
  },
];

export interface QuizQ {
  q: Record<Lang, string>;
  options: Record<Lang, string[]>;
  answer: number;
}

export const QUIZ: QuizQ[] = [
  {
    q: {
      en: "At what height is fall protection required in construction?",
      es: "¿A qué altura es obligatoria la protección contra caídas en construcción?",
    },
    options: {
      en: ["6 feet or more", "10 feet or more", "Only on roofs", "Only above 20 feet"],
      es: ["6 pies (1.8 m) o más", "10 pies o más", "Solo en techos", "Solo arriba de 20 pies"],
    },
    answer: 0,
  },
  {
    q: {
      en: "Your safety glasses are cracked. What do you do?",
      es: "Sus lentes de seguridad están quebrados. ¿Qué hace?",
    },
    options: {
      en: [
        "Tape them and keep working",
        "Work without them until lunch",
        "Ask your foreman for a replacement before continuing",
        "Borrow sunglasses from a coworker",
      ],
      es: [
        "Los pega con cinta y sigue trabajando",
        "Trabaja sin ellos hasta el almuerzo",
        "Pide un reemplazo a su capataz antes de continuar",
        "Pide prestados lentes de sol a un compañero",
      ],
    },
    answer: 2,
  },
  {
    q: {
      en: "You find a chemical in an unlabeled container. What's the rule?",
      es: "Encuentra un químico en un envase sin etiqueta. ¿Cuál es la regla?",
    },
    options: {
      en: [
        "Smell it to identify it",
        "Never use it — report it and check the SDS",
        "Use it if it looks like water",
        "Pour it out and reuse the container",
      ],
      es: [
        "Olerlo para identificarlo",
        "Nunca usarlo — repórtelo y consulte la SDS",
        "Usarlo si parece agua",
        "Vaciarlo y reusar el envase",
      ],
    },
    answer: 1,
  },
  {
    q: {
      en: "When do you report an injury or near miss?",
      es: "¿Cuándo reporta una lesión o casi-accidente?",
    },
    options: {
      en: [
        "Only if it needs stitches",
        "At the end of the week",
        "The same day, no matter how small",
        "Only if someone saw it",
      ],
      es: [
        "Solo si necesita puntadas",
        "Al final de la semana",
        "El mismo día, por pequeño que sea",
        "Solo si alguien lo vio",
      ],
    },
    answer: 2,
  },
  {
    q: {
      en: "You see a coworker doing something that could get them hurt. What can you do?",
      es: "Ve a un compañero haciendo algo que podría lastimarlo. ¿Qué puede hacer?",
    },
    options: {
      en: [
        "Nothing — it's not your job",
        "Stop the work and speak up — you have that authority",
        "Wait until the safety meeting on Friday",
        "Record a video first",
      ],
      es: [
        "Nada — no es su trabajo",
        "Parar el trabajo y hablar — usted tiene esa autoridad",
        "Esperar hasta la reunión de seguridad del viernes",
        "Grabar un video primero",
      ],
    },
    answer: 1,
  },
];
