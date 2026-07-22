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
  certDownloadErr: {
    en: "Couldn't build the file. Try “Save image”, or screenshot the card.",
    es: "No se pudo generar el archivo. Use “Guardar imagen” o tome una captura.",
  },

  /* ---- custom GC modules ---- */
  gcModuleTag: { en: "From your GC", es: "De su contratista" },
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
