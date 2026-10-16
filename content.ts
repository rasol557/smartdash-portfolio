/* =====================================================================
   SMARTDESH — هسته‌ی محتوای سایت
   همه‌ی متن‌ها، قیمت‌ها، پروژه‌ها و تنظیمات ظاهری اینجاست.
   پنل مدیریت (#admin) همین ساختار را ویرایش می‌کند.
   ===================================================================== */

export interface Heading {
  eyebrow: string;
  en: string;
  before: string;
  highlight: string;
  after: string;
  sub: string;
}

export interface Service {
  icon: string;
  en: string;
  title: string;
  description: string;
  preset: string;
}

export interface Project {
  id: string;
  enTitle: string;
  faTitle: string;
  category: string;
  url: string;
  urlLabel: string;
  year: string;
  lang: string;
  description: string;
  features: string[];
  tags: string[];
  image: string;
  imageAlt: string;
  accent: "gold" | "violet" | "amber" | "cyan";
}

export interface Step {
  n: string;
  en: string;
  title: string;
  desc: string;
}

export interface Plan {
  name: string;
  en: string;
  price: string;
  unit: string;
  desc: string;
  features: string[];
  featured: boolean;
  preset: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  title: string;
  en: string;
  category: string;
  price: number;
  discountPercent: number;
  offerEnds: string;
  featured: boolean;
  badge: string;
  image: string;
  description: string;
  features: string[];
  deliverables: string;
  demoUrl: string;
}

export interface SupportItem {
  icon: string;
  en: string;
  title: string;
  desc: string;
  price: string;
}

export interface TermStep {
  title: string;
  percent: string;
  desc: string;
}

export interface Terms {
  intro: string;
  steps: TermStep[];
  clauses: string[];
  cardNumber: string;
  cardOwner: string;
  note: string;
}

export interface SalesObjective {
  id: string;
  title: string;
  /** کلمه‌های کلیدی که نشان می‌دهد مشتری به این هدف فکر می‌کند. */
  triggers: string[];
  /** پاسخ آماده برای این هدف - فروشنده هوشمند از کدام مزیت حرف بزند؟ */
  response: string;
  /** پیشنهاد عملی بعد از پاسخ (مثلاً لینک فرم یا واتساپ) */
  nextAction: "form" | "whatsapp" | "phone" | "shop" | "live" | "samples";
  followups: string[];
}

export interface SalesPlaybook {
  /** متن معرفی/خوش‌آمدگویی */
  greeting: string;
  /** لحن گفتگو */
  tone: "حرفه‌ای و صمیمی" | "رسمی و کوتاه" | "دوستانه و پرانرژی";
  /** مزیت‌های اصلی فروش */
  valueProps: string[];
  /** چه چیزی در جلسه اول بپرسم */
  discoveryQuestions: string[];
  /** جواب‌های آماده برای اعتراض‌های رایج */
  objectionHandlers: { objection: string; response: string }[];
  /** جمله برای بستن فروش و دعوت به اقدام */
  closingLine: string;
  /** جمله سمج ولی مؤدبانه برای پیگیری بعد از ۲۴ ساعت */
  followUpAfter24h: string;
  /** برای مشتری سرد که هنوز آماده نیست */
  coldLeadNurture: string;
  /** برای بعد از اولین خرید */
  afterSaleCare: string;
  /** فروش بعدی پیشنهادی */
  upsell: string;
  /** آیا فعال باشد؟ */
  enabled: boolean;
  /** متن دکمه شناور */
  fabLabel: string;
  /** عنوان پنجره */
  windowTitle: string;
  /** پیشنهاد اولیه برای شروع گفتگو */
  openingOffer: string;
  /** سناریوهای تشخیص نیاز - همه محرک‌ها در یک لیست */
  objectives: SalesObjective[];
  /** لیست پروژه‌های زنده برای اشاره */
  liveWork: { title: string; url: string; what: string }[];
  /** تستیمونیال‌های اعتمادساز */
  socialProof: { text: string; source?: string }[];
  /** پلن‌های قیمت‌گذاری برای بحث */
  pricingPitches: { budget: string; pitch: string }[];
  /** خدمات ویژه‌ای که در بحث فروش تأکید کنم */
  signatureServices: string[];
  /** سؤالات متداولی که مشتری می‌پرسد با جواب */
  faq: { q: string; a: string }[];
  /** راهنمای فروش آپ‌سل برای مشتری فعلی */
  upsellTriggers: { signal: string; suggestion: string }[];
}

export interface PaymentSettings {
  enabled: boolean;
  merchantId: string;
  requestEndpoint: string;
  sandbox: boolean;
  fallbackEnabled: boolean;
  fallbackNote: string;
}

export interface SiteContent {
  version: number;
  brand: {
    first: string;
    second: string;
    pageTitle: string;
    metaDescription: string;
    loaderText: string;
  };
  contact: {
    name: string;
    role: string;
    phoneDisplay: string;
    phoneRaw: string;
    whatsapp: string;
    whatsappLabel: string;
  };
  nav: { label: string; href: string }[];
  navCta: string;
  hero: {
    badge: string;
    line1: string;
    line2: string;
    line3: string;
    sub: string;
    primaryBtn: string;
    whatsappBtn: string;
    whatsappMsg: string;
    stats: { value: number; suffix: string; label: string }[];
    liveLabel: string;
    chipLive: string;
    chipEn: string;
    chipFa: string;
  };
  marquee: string[];
  headings: {
    services: Heading;
    products: Heading;
    work: Heading;
    about: Heading;
    process: Heading;
    pricing: Heading;
    support: Heading;
    terms: Heading;
    faq: Heading;
  };
  services: Service[];
  productCategories: ProductCategory[];
  products: Product[];
  shopNote: string;
  support: SupportItem[];
  terms: Terms;
  payment: PaymentSettings;
  sales: SalesPlaybook;
  projects: Project[];
  workNote: string;
  about: {
    avatar: string;
    bio: string;
    skills: string[];
    points: { t: string; d: string }[];
    whatsappMsg: string;
  };
  steps: Step[];
  plans: Plan[];
  faqs: Faq[];
  final: {
    eyebrow: string;
    before: string;
    highlight: string;
    after: string;
    sub: string;
    whatsappBtn: string;
    formBtn: string;
    whatsappMsg: string;
  };
  footer: {
    about: string;
    quickTitle: string;
    worksTitle: string;
    contactTitle: string;
    copyright: string;
    made: string;
  };
  form: {
    projectOptions: string[];
    budgetOptions: string[];
  };
  theme: {
    purple: string;
    cyan: string;
    mint: string;
    bg: string;
    animations: "on" | "soft" | "off";
    fontScale: number;
    cursorGlow: boolean;
  };
}

export const DEFAULT_CONTENT: SiteContent = {
  version: 4,
  brand: {
    first: "SMART",
    second: "DESH",
    pageTitle: "SMARTDESH® | رسول بابایی — وب‌سایتی که مشتری میاره",
    metaDescription:
      "SMARTDESH — رسول بابایی، مهندس IT. طراحی وب‌سایت، فروشگاه اینترنتی و لندینگ پیج با نمونه‌کارهای واقعی و زنده.",
    loaderText: "SMARTDESH · در حال آماده‌سازی...",
  },
  contact: {
    name: "رسول بابایی",
    role: "مهندس IT · طراح و توسعه‌دهنده وب",
    phoneDisplay: "0914 821 8790",
    phoneRaw: "+989148218790",
    whatsapp: "989352665972",
    whatsappLabel: "گفتگو در واتساپ",
  },
  nav: [
    { label: "خدمات", href: "#services" },
    { label: "فروشگاه", href: "#shop" },
    { label: "نمونه‌کارها", href: "#work" },
    { label: "پشتیبانی", href: "#support" },
    { label: "تعرفه", href: "#pricing" },
    { label: "قرارداد", href: "#terms" },
    { label: "سوالات", href: "#faq" },
  ],
  navCta: "شروع پروژه 🚀",
  hero: {
    badge: "رسول بابایی · مهندس IT · طراح و توسعه‌دهنده وب",
    line1: "وب‌سایتی که",
    line2: "مشتری میاره،",
    line3: "نه فقط بازدید.",
    sub: "سایت‌های واقعی، زنده و سریع می‌سازم — هر ۳ نمونه‌کار پایین همین الان روی اینترنت بالا هستن؛ بزن توشون بچرخ و خودت قضاوت کن.",
    primaryBtn: "دیدن نمونه‌کارهای زنده ↓",
    whatsappBtn: "گفتگو در واتساپ",
    whatsappMsg: "سلام! از سایت SMARTDESH اومدم و درباره سفارش سایت سوال دارم 🙋",
    stats: [
      { value: 3, suffix: "+", label: "پروژه‌ی زنده" },
      { value: 100, suffix: "٪", label: "طراحی واکنش‌گرا" },
      { value: 6, suffix: "", label: "خدمت تخصصی" },
    ],
    liveLabel: "منتشر شده و قابل مشاهده — بزن و ببین:",
    chipLive: "LIVE · ۳ پروژه",
    chipEn: "REACT · UI/UX",
    chipFa: "ساخته‌ی رسول بابایی",
  },
  marquee: ["DIAMOJEWELS.VERCEL.APP", "VEILPDF.VERCEL.APP", "MEHDIBARBER21.VERCEL.APP", "SMARTDESH®"],
  headings: {
    services: {
      eyebrow: "خدمات",
      en: "SERVICES",
      before: "هرچی برای",
      highlight: "دیده‌شدن",
      after: "لازم داری.",
      sub: "از ایده تا انتشار، همه‌چیز با یک نفر — مستقیم با خود سازنده در ارتباطی، نه با واسطه.",
    },
    work: {
      eyebrow: "نمونه‌کارهای زنده",
      en: "LIVE WORK",
      before: "حرف نمی‌زنم،",
      highlight: "لینک می‌دم.",
      after: "",
      sub: "هر سه پروژه واقعی و روی اینترنت بالا هستن. روشون بزن، توشون بچرخ، سرعت و حسشون رو امتحان کن.",
    },
    about: {
      eyebrow: "سازنده",
      en: "ABOUT",
      before: "پشت این کار،",
      highlight: "یه آدم واقعیه.",
      after: "",
      sub: "",
    },
    process: {
      eyebrow: "روش کار",
      en: "PROCESS",
      before: "از «سلام» تا «سایت بالا» در",
      highlight: "۴ قدم.",
      after: "",
      sub: "فرایند شفاف و ساده؛ همیشه می‌دونی پروژه‌ت دقیقاً کجاست.",
    },
    pricing: {
      eyebrow: "تعرفه",
      en: "PRICING",
      before: "قیمت شفاف،",
      highlight: "بدون هزینه پنهان.",
      after: "",
      sub: "این‌ها شروع قیمت‌ان؛ بعد از یه گفتگوی کوتاه، قیمت دقیق و نهایی رو اعلام می‌کنم.",
    },
    faq: {
      eyebrow: "سوالات پرتکرار",
      en: "FAQ",
      before: "سوالی داری؟",
      highlight: "جوابش اینجاست.",
      after: "",
      sub: "",
    },
    products: {
      eyebrow: "فروشگاه محصولات دیجیتال",
      en: "DIGITAL SHOP",
      before: "آماده، تست‌شده،",
      highlight: "همین امروز تحویل.",
      after: "",
      sub: "قالب‌ها و ابزارهایی که روی پروژه‌های واقعی اجرا شدن. بخر، تحویل بگیر، شروع کن — نصب و راه‌اندازی هم با من.",
    },
    support: {
      eyebrow: "پشتیبانی و تولید محتوا",
      en: "SUPPORT & CONTENT",
      before: "سایت داشتن کافی نیست؛",
      highlight: "باید دیده بشه.",
      after: "",
      sub: "ثبت حرفه‌ای محصولات، عکس‌های سینمایی، محتوای سئوشده و پشتیبانی وردپرس — تا سایتت توی گوگل بالا بیاد و بفروشه.",
    },
    terms: {
      eyebrow: "قرارداد و شرایط همکاری",
      en: "AGREEMENT",
      before: "شفاف، منصفانه،",
      highlight: "سه قسط.",
      after: "",
      sub: "هیچ مبلغی پیش از دیدن نتیجه‌ی واقعی گرفته نمی‌شه. این شرایط برای هر دو طرف الزام‌آوره.",
    },
  },
  productCategories: [
    { id: "template", name: "قالب سایت", icon: "🧩" },
    { id: "wordpress", name: "قالب وردپرس", icon: "🅦" },
    { id: "plugin", name: "افزونه", icon: "🔌" },
    { id: "ui", name: "UI Kit و طراحی", icon: "🎨" },
  ],
  products: [
    {
      id: "p-diamo",
      title: "قالب فروشگاه جواهرات Diamo",
      en: "DIAMO STORE TEMPLATE",
      category: "template",
      price: 18000000,
      discountPercent: 25,
      offerEnds: "",
      featured: true,
      badge: "پرفروش",
      image: "https://images.pexels.com/photos/24815712/pexels-photo-24815712.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      description: "همون قالب لوکس و تیره‌ی diamojewels.vercel.app؛ آماده برای هر فروشگاه جواهرات، ساعت یا اکسسوری. با React ساخته شده، سریع و واکنش‌گرا.",
      features: ["صفحه اصلی، دسته‌بندی و محصول", "سبد خرید و فرم سفارش", "طراحی لوکس تیره + حالت روشن", "واکنش‌گرای کامل موبایل", "نصب و شخصی‌سازی رایگان"],
      deliverables: "سورس کامل + راهنمای نصب + ۱ ماه پشتیبانی",
      demoUrl: "https://diamojewels.vercel.app",
    },
    {
      id: "p-veil",
      title: "قالب پلتفرم محتوای دیجیتال VeilPDF",
      en: "VEILPDF PLATFORM",
      category: "template",
      price: 22000000,
      discountPercent: 0,
      offerEnds: "",
      featured: false,
      badge: "دوزبانه",
      image: "https://images.pexels.com/photos/844734/pexels-photo-844734.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      description: "قالب نمایش و فروش فایل‌های دیجیتال (PDF، دوره، کتاب)؛ فارسی/انگلیسی، راست‌چین کامل و آماده‌ی اتصال به درگاه.",
      features: ["دوزبانه FA / EN", "صفحه محصول دیجیتال با پیش‌نمایش", "ساختار آماده‌ی فروش فایل", "سئوی فنی انجام‌شده"],
      deliverables: "سورس کامل + راهنمای نصب + ۱ ماه پشتیبانی",
      demoUrl: "https://veilpdf.vercel.app/fa",
    },
    {
      id: "p-barber",
      title: "قالب رزرو نوبت آرایشگاه و سالن",
      en: "BOOKING TEMPLATE",
      category: "template",
      price: 15000000,
      discountPercent: 20,
      offerEnds: "",
      featured: false,
      badge: "رزرو آنلاین",
      image: "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      description: "قالب فارسی mehdibarber21.vercel.app؛ مناسب آرایشگاه، کلینیک، مشاور و هر کسب‌وکار نوبتی. انتخاب خدمت، روز و ساعت با خلاصه زنده.",
      features: ["رزرو با انتخاب روز و ساعت", "منوی خدمات و قیمت", "پکیج‌های ویژه", "ارسال نوبت به واتساپ"],
      deliverables: "سورس کامل + راهنمای نصب + ۱ ماه پشتیبانی",
      demoUrl: "https://mehdibarber21.vercel.app",
    },
    {
      id: "p-wp",
      title: "قالب وردپرس شرکتی SmartDesh",
      en: "SMARTDESH WP THEME",
      category: "wordpress",
      price: 12000000,
      discountPercent: 0,
      offerEnds: "",
      featured: false,
      badge: "به‌زودی",
      image: "",
      description: "قالب وردپرس سبک و سریع با المنتور؛ مخصوص شرکت‌ها و فریلنسرها. در حال آماده‌سازی — پیش‌خرید با تخفیف ویژه.",
      features: ["سازگار با المنتور", "سرعت بالا و سئوی فنی", "راست‌چین و فونت فارسی", "پنل تنظیمات ساده"],
      deliverables: "فایل قالب + دمو ایمپورت + آموزش ویدیویی",
      demoUrl: "",
    },
  ],
  shopNote: "پرداخت امن کارت‌به‌کارت یا طبق قرارداد سه‌قسطی. بعد از پرداخت، فایل‌ها و راهنمای نصب حداکثر تا ۲۴ ساعت تحویل داده می‌شه.",
  support: [
    { icon: "camera", en: "PHOTOGRAPHY", title: "عکاسی سینمایی محصول", desc: "عکس‌های باکیفیت با زاویه و نورپردازی حرفه‌ای که محصولت رو لوکس نشون می‌ده و فروش رو بالا می‌بره.", price: "از ۳ میلیون / ۱۰ محصول" },
    { icon: "pen", en: "CONTENT", title: "تولید محتوای فروش‌محور", desc: "توضیحات محصول، مقاله و متن صفحات؛ نوشته‌شده برای آدم‌ها و بهینه‌شده برای گوگل.", price: "از ۱٫۵ میلیون / ۱۰ محتوا" },
    { icon: "chart", en: "ADVANCED SEO", title: "سئوی پیشرفته", desc: "تحقیق کلمه کلیدی، سئوی فنی، سرعت، اسکیما، لینک‌سازی داخلی و گزارش ماهانه رشد.", price: "از ۸ میلیون / ماه" },
    { icon: "bag", en: "PRODUCT ENTRY", title: "ثبت حرفه‌ای محصولات", desc: "وارد کردن محصولات با عکس، ویژگی، قیمت و دسته‌بندی درست — تمیز و قابل جستجو.", price: "از ۲ میلیون / ۵۰ محصول" },
    { icon: "shield", en: "WP SUPPORT", title: "پشتیبانی وردپرس و سایت", desc: "بروزرسانی، بکاپ، امنیت، رفع خطا و پایش ۲۴/۷ — خیالت از سایت راحت باشه.", price: "از ۴ میلیون / ماه" },
    { icon: "rocket", en: "GROWTH PACK", title: "پکیج رشد کامل", desc: "عکاسی + محتوا + سئو + پشتیبانی در یک قرارداد ماهانه با تخفیف ویژه.", price: "توافقی" },
  ],
  terms: {
    intro: "این قرارداد بین «کارفرما» و «رسول بابایی (SMARTDESH)» برای طراحی و اجرای پروژه‌ی دیجیتال منعقد می‌شود. مبلغ کل پس از گفتگو و مشخص‌شدن دقیق امکانات، کتباً (واتساپ/ایمیل) توافق و در سه قسط مساوی پرداخت می‌شود:",
    steps: [
      { title: "پیش‌پرداخت — شروع کار", percent: "۱/۳", desc: "پس از توافق نهایی و ثبت سفارش، یک‌سوم مبلغ پرداخت و کار همان روز آغاز می‌شود." },
      { title: "تحویل دموی واقعی (HTML)", percent: "۱/۳", desc: "با اتمام طراحی و توسعه، نسخه‌ی کامل و قابل مشاهده (فقط HTML، بدون انتشار) روی لینک موقت نمایش داده می‌شود. پس از تأیید کارفرما، قسط دوم پرداخت می‌شود." },
      { title: "انتشار نهایی روی وب‌سایت", percent: "۱/۳", desc: "پس از ثبت دامنه، استقرار روی هاست و اجرای کامل سایت، قسط آخر دریافت و سورس و دسترسی‌ها تحویل داده می‌شود." },
    ],
    clauses: [
      "زمان تحویل در ابتدای کار مشخص و کتباً اعلام می‌شود؛ تأخیر ناشی از دیرکرد محتوا یا بازخورد کارفرما، به زمان پروژه اضافه می‌شود.",
      "تا دو مرحله بازبینی و اصلاح در هر فاز رایگان است. تغییرات خارج از توافق اولیه، جداگانه برآورد می‌شود.",
      "هزینه‌ی دامنه، هاست و سرویس‌های جانبی (درگاه، پیامک و…) بر عهده‌ی کارفرماست مگر خلاف آن توافق شود.",
      "تا پرداخت کامل، مالکیت سورس نزد مجری است؛ پس از تسویه، تمام فایل‌ها و دسترسی‌ها به کارفرما منتقل می‌شود.",
      "پشتیبانی رایگان طبق پلن انتخابی (۱ تا ۶ ماه) پس از انتشار آغاز می‌شود.",
      "اطلاعات و داده‌های کارفرما محرمانه است و بدون اجازه در جایی استفاده یا منتشر نمی‌شود.",
    ],
    cardNumber: "",
    cardOwner: "رسول بابایی",
    note: "با ارسال فرم سفارش یا پرداخت پیش‌قسط، کارفرما این شرایط را مطالعه کرده و پذیرفته است.",
  },
  payment: {
    enabled: false,
    merchantId: "",
    requestEndpoint: "/api/zarinpal/request",
    sandbox: false,
    fallbackEnabled: true,
    fallbackNote: "اگر پرداخت آنلاین در دسترس نبود، سفارش از واتساپ ثبت می‌شود و پرداخت کارت‌به‌کارت هماهنگ خواهد شد.",
  },
  sales: {
    enabled: true,
    fabLabel: "مشاوره رایگان",
    windowTitle: "دستیار فروش SMARTDESH",
    tone: "حرفه‌ای و صمیمی",
    greeting:
      "سلام! من دستیار فروش استودیوی SMARTDESH هستم، همکار رسول بابایی. در ۲ دقیقه کمکت می‌کنم بهترین مسیر رو برای سایت، فروشگاه یا رزرو آنلاین کسب‌وکارت پیدا کنی. از کجا شروع کنیم؟",
    openingOffer: "بگو کسب‌وکارت چیه تا در ۳۰ ثانیه یه پیشنهاد مشخص بدم.",
    valueProps: [
      "طراحی اختصاصی با React و ابزارهای مدرن — بدون قالب آماده، هیچ سایتی شبیه کار شما نیست.",
      "نمونه‌کارهای واقعی و زنده: diamojewels، veilpdf و mehdibarber21 روی اینترنت بالا هستن، می‌تونی توشون بچرخی و قضاوت کنی.",
      "قرارداد سه‌قسطی منصفانه: ۱/۳ پیش‌پرداخت، ۱/۳ بعد از دموی واقعی (HTML)، ۱/۳ بعد از انتشار نهایی.",
      "سرعت بالا، سئوی پایه، سازگاری کامل موبایل، تحویل با فایل و آموزش — همه در همه‌ی پلن‌ها.",
      "ارتباط مستقیم با سازنده، نه واسطه؛ مشاوره اولیه و بررسی نیاز رایگان است.",
    ],
    discoveryQuestions: [
      "کسب‌وکارت الان چه محصول یا خدمتی داره و مشتری اصلیت کیه؟",
      "سایت فعلی داری یا از صفر شروع می‌کنی؟ اگه داری، چه چیزی دوست نداری؟",
      "هدف اصلی‌ات از سایت چیه؟ فروش آنلاین، رزرو نوبت، یا فقط دیده‌شدن و اعتمادسازی؟",
      "بودجه‌ی تقریبی‌ات چقدره؟ اگه دقیق نمی‌دونی اشکالی نداره، یه بازه بگو.",
      "کِی باید آماده باشه؟ تاریخ یا بازه‌ی زمانی خاصی داری؟",
    ],
    objectionHandlers: [
      {
        objection: "گرون",
        response:
          "قیمت‌ها با بازار امروز هماهنگه و مهم‌تر اینکه سایت یه ابزار فروشه نه هزینه. سایت ضعیف مشتری رو فراری می‌ده. ضمناً قرارداد سه‌قسطی داریم و هیچ مبلغی پیش از دیدن نتیجه‌ی واقعی پرداخت نمی‌شه.",
      },
      {
        objection: "بعداً فکر می‌کنم",
        response:
          "کاملاً حق داری. فقط یادت باشه دیر تصمیم گرفتن یعنی از دست دادن مشتری‌هایی که الان دارن سرچ می‌کنن. اگه بخوای یه جلسه کوتاه ۱۵ دقیقه‌ای بذاریم، بدون هزینه، کمکت می‌کنم اولویت‌هات رو روشن‌تر کنی.",
      },
      {
        objection: "می‌ترسم نتیجه نگیرم",
        response:
          "حق طبیعیه. دقیقاً به همین خاطر قرارداد سه‌قسطی داریم: قسط دوم وقتی پرداخت می‌شه که دموی واقعی HTML رو ببینی و راضی باشی. تا اون مرحله ریسک با ماست نه با تو.",
      },
      {
        objection: "نمونه‌کار نداری",
        response:
          "این دقیقاً دلیلیه که سایت زنده گذاشتم. الان diamojewels.vercel.app، veilpdf.vercel.app و mehdibarber21.vercel.app بالا هستن؛ هر کدوم رو باز کن، توش بچرخ و کیفیت کار رو قضاوت کن. اگه خواستی سایتی شبیه یکی از این‌ها بسازم، بگو تا دقیقاً برنامه‌اش رو بگم.",
      },
      {
        objection: "زمانم کمه",
        response:
          "خودم همه‌چیز رو انجام می‌دم. تو فقط ۱۰ دقیقه برای توضیح نیازت وقت بذار و بقیه‌اش با منه. حتی اگه هفته‌ای ۱۵ دقیقه وقت داری کافیه.",
      },
    ],
    closingLine:
      "اگه آماده‌ای، همین الان فرم سفارش پایین رو پر کن یا توی واتساپ پیام بده. قول می‌دم تا ۲ ساعت آینده جوابت رو بدم و یه پیشنهاد شفاف برای سایتت بنویسم.",
    followUpAfter24h:
      "سلام دوباره! دیروز پیامت رو دیدم و منتظر جوابت بودم. اگه سؤالی داری یا نیاز به اطلاعات بیشتر هست، فقط بگو. اگه الان وقت نداری اشکالی نداره، اما فرصت‌های بازار هر روز از دست می‌ره. 🙋",
    coldLeadNurture:
      "هر وقت کسب‌وکارت به مرحله‌ای رسید که سایت لازم شد، من اینجام. موفق باشی! ✨",
    afterSaleCare:
      "خوشحالم که سایتت آماده شد. اگه سؤالی درباره استفاده از پنل، اضافه کردن محصول جدید یا تغییر متن داشتی، بگو. پشتیبانی رایگان پلن هنوز ادامه داره.",
    upsell:
      "سایتت الان آماده‌ست؛ آیا به عکاسی محصول، سئوی حرفه‌ای یا تولید محتوا هم نیاز داری؟ هر کدوم رو اضافه کنیم، تخفیف پکیج رشد رو می‌گیری.",
    objectives: [
      {
        id: "site-from-scratch",
        title: "سایت از صفر می‌خوام",
        triggers: ["صفر", "از اول", "تازه", "شروع", "ندارم", "سایت جدید", "نمونه کار ندارم", "هیچ"],
        response:
          "پس نقطه‌ی صفر هستی، بهترین جا! ۳ قدم ساده داریم: ۱) نیازتو دقیق بفهمیم، ۲) طرح اختصاصی ببینی، ۳) دموی واقعی تحویل بگیری. هیچ هزینه‌ای پیش از دمو پرداخت نمی‌کنی.",
        nextAction: "form",
        followups: [
          "نگران قیمت نباش، الان فقط داریم نیازتو می‌فهمیم. فرم زیر رو پر کن تا تماس بگیرم.",
          "اگه ۱۰ دقیقه وقت داشته باشی، توی واتساپ پیام بده و سایت آماده‌ت رو تو ذهنم توصیف کن تا سریع‌تر شروع کنیم.",
        ],
      },
      {
        id: "redesign",
        title: "بازطراحی یا ارتقای سایت فعلی",
        triggers: ["بازطراحی", "ارتقا", "عوض کنم", "قبلاً", "فعلی", "سئو", "سرعت", "کند", "ضعیف"],
        response:
          "سایت فعلی‌ات چه مشکلی داره؟ کنده، مشتری نمی‌گیره، یا فقط قدیمی شده؟ اگه آدرسش رو بفرستی یه بررسی رایگان می‌دم و می‌گم چی می‌شه بهترش کرد.",
        nextAction: "samples",
        followups: [
          "آدرس سایتتو بفرست تا بررسی رایگان کنم.",
          "می‌تونی یه اسکرین‌شات از صفحه‌ی اصلی بفرستی؟ سریع‌تر راهنماییت می‌کنم.",
        ],
      },
      {
        id: "ecommerce",
        title: "فروشگاه اینترنتی / محصول دارم",
        triggers: ["فروشگاه", "محصول", "فروش", "خرید", "سبد", "پرداخت", "درگاه", "ارسال"],
        response:
          "برای فروش آنلاین، فقط ظاهر قشنگ کافی نیست. درگاه پرداخت، سبد خرید، ثبت سفارش، پنل مدیریت محصولات و اتصال به پست یا پیک باید دقیق کار کنه. Diamo Jewels نمونه‌ی زنده‌ی ماست؛ بازش کن ببین.",
        nextAction: "live",
        followups: [
          "چند محصول داری؟ چه نوع محصولی؟ لباس، دیجیتال، خوراکی؟",
          "ارسال محصولات چطور انجام می‌شه؟ پست، پیک، یا دانلودی؟",
        ],
      },
      {
        id: "booking",
        title: "سامانه رزرو نوبت / خدمات",
        triggers: ["رزرو", "نوبت", "آرایشگاه", "کلینیک", "مشاوره", "سالن", "پزشک"],
        response:
          "رزرو آنلاین مثل سیستم نوبت‌دهی آرایشگاه مهدی (mehdibarber21.vercel.app) کار می‌کنه. مشتری خدمت و ساعت رو انتخاب می‌کنه، خلاصه نوبت نشون داده می‌شه و اطلاعات بهت می‌رسه.",
        nextAction: "live",
        followups: ["چند خدمت داری؟", "مشتری‌ها از چند طریق نوبت می‌گیرن؟"],
      },
      {
        id: "price",
        title: "سؤال درباره قیمت / هزینه",
        triggers: ["قیمت", "هزینه", "چقدر", "تومان", "میلیون", "ارزون", "تخفیف"],
        response:
          "قیمت‌ها به امکانات بستگی داره. شروع لندینگ از ۶۵ میلیون، سایت شرکتی از ۱۲۰ میلیون و فروشگاهی از ۱۸۰ میلیون. هر چه بیشتر نیازتو روشن بگی، دقیق‌تر قیمت می‌دم. مشاوره اولیه رایگانه.",
        nextAction: "form",
        followups: [
          "اگه بودجه‌ت محدوده، می‌تونیم با یه لندینگ ساده شروع کنیم و بعداً ارتقا بدیم.",
          "فرم زیر رو با بودجه‌ی تقریبی پر کن تا پلن دقیق‌تر بدم.",
        ],
      },
      {
        id: "time",
        title: "زمان تحویل / فوری",
        triggers: ["کی", "زمان", "فوری", "عجله", "چند روز", "سریع", "دیر"],
        response:
          "لندینگ ۷ تا ۱۰ روز، سایت شرکتی ۳ تا ۴ هفته و فروشگاهی ۴ تا ۶ هفته. اگه عجله داری بگو تا واقع‌بینانه بررسی کنیم.",
        nextAction: "form",
        followups: ["تاریخ دقیق رونمایی یا شروع پروژه‌ات رو بگو."],
      },
      {
        id: "sample",
        title: "نمونه‌کار / دمو می‌خوام ببینم",
        triggers: ["نمونه", "دمو", "کار کردی", "قبلی", "نشون", "مثال", "پورتفولیو"],
        response:
          "۳ پروژه‌ی زنده دارم که الان روی اینترنت بالاست: Diamo Jewels (فروشگاه جواهرات)، VeilPDF (پلتفرم کتاب دیجیتال) و Mehdi Barber 21 (رزرو نوبت آرایشگاه). هر کدوم رو باز کن، توش بچرخ و بعد بگو کدوم مدل برات جذاب‌تره.",
        nextAction: "live",
        followups: [
          "اگه سایتی شبیه یکی از این‌ها می‌خوای، بگو تا دقیقاً برنامه و قیمت رو بگم.",
        ],
      },
      {
        id: "compare",
        title: "چرا شما نه بقیه؟ / مقایسه",
        triggers: ["چرا", "چطور", "مقایسه", "رقیب", "بهتر", "فرق", "ویژه"],
        response:
          "دو تفاوت اصلی: ۱) طراحی کاملاً اختصاصی با React، نه قالب آماده. ۲) قرارداد سه‌قسطی — هیچ هزینه‌ای پیش از دیدن نتیجه‌ی واقعی پرداخت نمی‌کنی. این یعنی ریسک پروژه با ماست، نه با تو.",
        nextAction: "whatsapp",
        followups: [
          "نمونه‌کارهای زنده رو ببین، بعد بگو کدوم مدل می‌خوای.",
        ],
      },
      {
        id: "support",
        title: "پشتیبانی / بروزرسانی",
        triggers: ["پشتیبانی", "بروز", "آپدیت", "تغییر", "مشکل", "خراب", "کمک"],
        response:
          "هر سایتی که ساختم، ۱ تا ۶ ماه پشتیبانی رایگان داره. بعدش هم با هزینه‌ی مناسب کنارت هستم. سایت‌های فعلی‌ات رو هم می‌تونم بگیرم و نگه دارم.",
        nextAction: "whatsapp",
        followups: [
          "اگه سایت قبلی داری، بگو ببینم چه کمکی ازم بر میاد.",
        ],
      },
      {
        id: "ready",
        title: "آماده‌ام شروع کنم",
        triggers: ["شروع", "بزن بریم", "اوکی", "موافقم", "آماده", "ثبت", "سفارش", "قبول"],
        response:
          "عالی! 🎉 لطفاً فرم سفارش پایین رو پر کن یا توی واتساپ پیام بده. قول می‌دم تا ۲ ساعت آینده جوابت رو بدم. ضمناً یادت نره: هیچ هزینه‌ای پیش از دیدن دموی واقعی پرداخت نمی‌کنی.",
        nextAction: "form",
        followups: [
          "فرم فقط ۲ دقیقه وقت می‌گیره؛ اسم، شماره و توضیح کوتاه لازمه.",
        ],
      },
    ],
    liveWork: [
      {
        title: "Diamo Jewels",
        url: "https://diamojewels.vercel.app",
        what: "فروشگاه جواهرات انگلیسی‌زبان، طراحی لوکس تیره، صفحات محصول کامل.",
      },
      {
        title: "VeilPDF",
        url: "https://veilpdf.vercel.app/fa",
        what: "پلتفرم نمایش و فروش PDFهای کلکسیونی، دوزبانه فارسی و انگلیسی، ساختار آماده‌ی فروش.",
      },
      {
        title: "Mehdi Barber 21",
        url: "https://mehdibarber21.vercel.app",
        what: "سامانه رزرو نوبت آرایشگاه، انتخاب خدمت و ساعت، خلاصه زنده، راست‌چین کامل.",
      },
    ],
    socialProof: [
      { text: "نمونه‌کارهای زنده، قابل بازدید و تست، نه اسکرین‌شات." },
      { text: "طراحی اختصاصی با React، سرعت بالا و سئوی پایه در همه پلن‌ها." },
      { text: "قرارداد سه‌قسطی منصفانه با بندهای شفاف برای هر دو طرف." },
      { text: "ارتباط مستقیم با سازنده، بدون واسطه و تیم بازاریابی." },
    ],
    pricingPitches: [
      {
        budget: "کمتر از ۸۰ میلیون",
        pitch:
          "لندینگ پیج ساده، یا فروشگاهی با محصولات محدود. در این بودجه سایت شخصی یا معرفی‌ای تمیز می‌سازم که بتواند مشتری جذب کند.",
      },
      {
        budget: "۸۰ تا ۱۵۰ میلیون",
        pitch:
          "سایت شرکتی کامل با چند صفحه، فرم، سئوی بهتر، وبلاگ، و سیستم مدیریت محتوا. مناسب کسب‌وکارهایی که جدی هستند.",
      },
      {
        budget: "۱۵۰ تا ۲۵۰ میلیون",
        pitch:
          "فروشگاه اینترنتی با درگاه پرداخت، پنل مدیریت سفارش، یا سامانه رزرو نوبت. همراه با آموزش کامل کار با سیستم.",
      },
      {
        budget: "بالای ۲۵۰ میلیون",
        pitch:
          "پروژه‌ی اختصاصی با قابلیت‌های سفارشی، اتصال به سرویس‌های خارجی، داشبورد حرفه‌ای، یا اپلیکیشن. قبل از شروع، نیازتو دقیق مستند می‌کنیم.",
      },
    ],
    signatureServices: [
      "طراحی و توسعه‌ی وب‌سایت شرکتی، فروشگاهی، رزرو نوبت و لندینگ پیج",
      "تولید محتوای فروش‌محور و عکاسی سینمایی محصول",
      "سئوی پیشرفته و افزایش سرعت سایت",
      "پشتیبانی، امنیت و بروزرسانی ماهانه",
    ],
    faq: [
      {
        q: "آیا قیمت‌ها شامل هاست و دامنه است؟",
        a: "هاست و دامنه برای سال اول رایگان راه‌اندازی می‌کنم. از سال دوم هزینه‌ی واقعی دامنه (سالی حدود ۱۰۰ هزار تومان) و هاست (بسته به ترافیک بین ۳۰۰ تا ۸۰۰ هزار تومان) را شما پرداخت می‌کنید. اگر هاست قبلی دارید، با همان ادامه می‌دهیم.",
      },
      {
        q: "اگر وسط کار منصرف شوم، چه می‌شود؟",
        a: "طبق قرارداد، پیش‌پرداخت برای کارهای انجام‌شده است و قابل بازگشت نیست، اما قسط دوم (پس از دمو) هنوز پرداخت نشده. یعنی تا قبل از دیدن نتیجه، فقط پیش‌پرداخت را از دست می‌دهید.",
      },
      {
        q: "آیا محتوای اولیه را هم تولید می‌کنید؟",
        a: "در پلن پایه، متن‌ها و عکس‌های اولیه از سمت شما تأمین می‌شود. در پلن‌های بالاتر، تولید محتوای فروش‌محور، عکاسی محصول و سئوی پیشرفته به‌صورت پکیج جداگانه ارائه می‌شود.",
      },
      {
        q: "آیا بعد از تحویل می‌توانم خودم سایت را ویرایش کنم؟",
        a: "بله، همراه سایت یک پنل مدیریت اختصاصی به شما تحویل می‌شود که بتوانید محتوا، قیمت، محصول و حتی رنگ‌بندی را تغییر دهید، بدون نیاز به دانش برنامه‌نویسی. آموزش ویدیویی هم ارائه می‌شود.",
      },
      {
        q: "چه تفاوتی با بقیه فریلنسرها دارید؟",
        a: "تفاوت اصلی سه چیز است: ۱) طراحی کاملاً اختصاصی با React، ۲) قرارداد سه‌قسطی بدون ریسک، ۳) ارتباط مستقیم با سازنده بدون واسطه. ضمناً نمونه‌کارهای زنده قابل بازدید هستند.",
      },
    ],
    upsellTriggers: [
      {
        signal: "محتوا",
        suggestion: "پکیج تولید محتوا و عکاسی محصول می‌تواند فروش سایت را ۲ تا ۳ برابر کند.",
      },
      {
        signal: "سئو",
        suggestion: "سئوی پیشرفته با گزارش ماهانه؛ سایت شما را به صفحه‌ی اول گوگل می‌رساند.",
      },
      {
        signal: "پشتیبانی",
        suggestion: "پشتیبانی ماهانه شامل بروزرسانی، امنیت و گزارش عملکرد سایت.",
      },
      {
        signal: "محصول جدید",
        suggestion: "هر محصول جدیدی که اضافه کنید، به‌صورت جداگانه قابل سفارش است. تخفیف پکیج ۵ محصول یا بیشتر.",
      },
    ],
  },
  services: [
    {
      icon: "globe",
      en: "WEBSITES",
      title: "وب‌سایت اختصاصی",
      description: "سایت شرکتی و شخصی با React؛ سریع، امن و کاملاً اختصاصی — بدون قالب آماده.",
      preset: "وب‌سایت شرکتی",
    },
    {
      icon: "bag",
      en: "E-COMMERCE",
      title: "فروشگاه اینترنتی",
      description: "مثل Diamo Jewels؛ محصولات، سبد خرید و تسویه‌حساب روان که مشتری رو نگه می‌داره.",
      preset: "فروشگاه اینترنتی",
    },
    {
      icon: "rocket",
      en: "LANDING",
      title: "لندینگ پیج",
      description: "تک‌صفحه‌ای که بازدیدکننده رو به مشتری تبدیل می‌کنه؛ تمرکز کامل روی فروش.",
      preset: "لندینگ پیج",
    },
    {
      icon: "calendar",
      en: "BOOKING",
      title: "رزرو و نوبت‌دهی",
      description: "مثل Mehdi Barber؛ نوبت‌دهی آنلاین، خدمات و قیمت — بدون دردسر تلفنی.",
      preset: "رزرو و نوبت‌دهی",
    },
    {
      icon: "chart",
      en: "SEO & SPEED",
      title: "سئو و افزایش سرعت",
      description: "بهینه‌سازی برای گوگل و لود زیر ۳ ثانیه؛ چون هر ثانیه یعنی مشتری.",
      preset: "سئو و بهینه‌سازی",
    },
    {
      icon: "shield",
      en: "SUPPORT",
      title: "پشتیبانی و توسعه",
      description: "بروزرسانی، امنیت و اضافه‌کردن امکانات جدید — همیشه کنارت هستم.",
      preset: "پشتیبانی و توسعه",
    },
  ],
  projects: [
    {
      id: "diamo",
      enTitle: "DIAMO JEWELS",
      faTitle: "دیامو جولز",
      category: "فروشگاه جواهرات لوکس",
      url: "https://diamojewels.vercel.app",
      urlLabel: "diamojewels.vercel.app",
      year: "۲۰۲۶",
      lang: "English",
      description:
        "فروشگاه انگلیسی‌زبان جواهرات با حس و حال یه بوتیک واقعی؛ گرید محصولات، جزئیات کامل هر قطعه و تجربه خریدی که برق طلا رو حس می‌کنی.",
      features: ["طراحی لوکس تیره مخصوص جواهرات", "صفحات محصول با جزئیات کامل", "تجربه خرید روان و سریع", "نسخه انگلیسی بین‌المللی"],
      tags: ["E-Commerce", "English", "Luxury UI"],
      image:
        "https://images.pexels.com/photos/24815712/pexels-photo-24815712.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      imageAlt: "گردنبند طلای لوکس روی پس‌زمینه تیره",
      accent: "gold",
    },
    {
      id: "veil",
      enTitle: "VEIL PDF",
      faTitle: "ویل‌پی‌دی‌اف",
      category: "پلتفرم PDFهای کلکسیونی",
      url: "https://veilpdf.vercel.app/fa",
      urlLabel: "veilpdf.vercel.app/fa",
      year: "۲۰۲۶",
      lang: "فارسی · English",
      description:
        "پلتفرم نمایش و عرضه PDFهای کلکسیونی کمیاب؛ با نسخه فارسی کاملاً راست‌چین و تجربه مرور کالکشن مثل ورق‌زدن یه آلبوم خاص و کمیاب.",
      features: ["رابط دوزبانه فارسی و انگلیسی", "نسخه فارسی کاملاً راست‌چین", "نمایش کالکشن دیجیتال", "ساختار آماده توسعه فروش"],
      tags: ["Platform", "FA / EN", "RTL"],
      image:
        "https://images.pexels.com/photos/844734/pexels-photo-844734.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      imageAlt: "کتاب‌خوان دیجیتال در دست",
      accent: "violet",
    },
    {
      id: "barber",
      enTitle: "MEHDI BARBER 21",
      faTitle: "مهدی باربر",
      category: "رزرو آنلاین آرایشگاه",
      url: "https://mehdibarber21.vercel.app",
      urlLabel: "mehdibarber21.vercel.app",
      year: "۲۰۲۶",
      lang: "فارسی",
      description:
        "وب‌سایت فارسی آرایشگاه با رزرو آنلاین نوبت؛ انتخاب خدمت، روز و ساعت با خلاصه زنده — مشتری بدون حتی یه تماس، نوبتش رو می‌گیره.",
      features: ["رزرو آنلاین با انتخاب روز و ساعت", "منوی خدمات و قیمت‌ها", "پکیج ویژه داماد", "خلاصه زنده نوبت"],
      tags: ["Booking", "Persian", "Business"],
      image:
        "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      imageAlt: "آرایشگر در حال اصلاح موی مشتری",
      accent: "amber",
    },
  ],
  workNote: "پروژه‌های بالا واقعی و زنده‌ان؛ روی هر کدوم بزن و از نزدیک ببین.",
  about: {
    avatar: "RB",
    bio: "من رسولم؛ مهندس IT و عاشق وب. سایت‌هایی می‌سازم که هم قشنگن هم می‌فروشن — با تکنولوژی روز (React و ابزارهای مدرن)، سرعت بالا و طراحی اختصاصی. وقتی با من کار می‌کنی، مستقیم با خود سازنده حرف می‌زنی: سریع‌تر، شفاف‌تر و بدون واسطه.",
    skills: ["React", "TypeScript", "UI / UX", "SEO", "Responsive", "E-Commerce", "Booking Systems"],
    points: [
      { t: "ارتباط مستقیم با سازنده", d: "نه منشی، نه واسطه — از اول تا آخر با خودم طرفی." },
      { t: "کد تمیز و سرعت بالا", d: "تکنولوژی مدرن، لود سریع و امتیاز عالی در تست سرعت." },
      { t: "طراحی اختصاصی، نه قالب", d: "سایت تو شبیه هیچ‌کس نیست؛ مخصوص کسب‌وکار تو طراحی می‌شه." },
      { t: "پشتیبانی واقعی", d: "بعد از تحویل غیب نمی‌شم؛ آموزش و پشتیبانی ادامه‌دار داری." },
    ],
    whatsappMsg: "سلام رسول! درباره سفارش سایت می‌خوام صحبت کنیم 🙋",
  },
  steps: [
    { n: "۰۱", en: "DISCOVER", title: "گفتگو و شناخت", desc: "با تماس یا واتساپ حرف می‌زنیم؛ نیازت رو می‌فهمم و بهترین مسیر رو پیشنهاد می‌دم. مشاوره رایگانه." },
    { n: "۰۲", en: "DESIGN", title: "طراحی اختصاصی", desc: "طرح اولیه مخصوص کسب‌وکارت رو می‌بینی؛ نظر می‌دی و تا رضایت کامل اصلاح می‌کنم." },
    { n: "۰۳", en: "BUILD", title: "توسعه و تست", desc: "کدنویسی تمیز، سرعت بالا و تست کامل روی موبایل و دسکتاپ — بدون باگ، بدون استرس." },
    { n: "۰۴", en: "LAUNCH", title: "انتشار و پشتیبانی", desc: "اتصال دامنه، انتشار نهایی، آموزش کار با سایت و پشتیبانی ادامه‌دار بعد از تحویل." },
  ],
  plans: [
    {
      name: "لندینگ ویژه",
      en: "LANDING",
      price: "۶۵ میلیون",
      unit: "شروع از · تحویل ۷ تا ۱۰ روزه",
      desc: "تک‌صفحه‌ای حرفه‌ای برای معرفی و فروش یک محصول یا خدمت.",
      features: ["طراحی کاملاً اختصاصی", "فرم تماس + دکمه واتساپ", "سئوی پایه گوگل", "سرعت لود بالا", "۱ ماه پشتیبانی رایگان"],
      featured: false,
      preset: "لندینگ پیج",
    },
    {
      name: "وب‌سایت شرکتی",
      en: "BUSINESS",
      price: "۱۲۰ میلیون",
      unit: "شروع از · تحویل ۳ تا ۴ هفته",
      desc: "وب‌سایت چندصفحه‌ای کامل برای کسب‌وکارهایی که جدی‌ان.",
      features: ["همه امکانات پلن لندینگ", "صفحات خدمات، نمونه‌کار و بلاگ", "فرم پیشرفته + اتصال واتساپ", "سئوی کامل و نقشه سایت", "۳ ماه پشتیبانی رایگان"],
      featured: true,
      preset: "وب‌سایت شرکتی",
    },
    {
      name: "فروشگاهی / اختصاصی",
      en: "CUSTOM",
      price: "۱۸۰ میلیون",
      unit: "شروع از · بر اساس امکانات",
      desc: "فروشگاه کامل یا پلتفرم خاص — مثل Diamo و VeilPDF.",
      features: ["سبد خرید و درگاه پرداخت", "پنل مدیریت سفارش‌ها", "رزرو آنلاین و امکانات خاص", "آموزش کامل کار با سایت", "۶ ماه پشتیبانی ویژه"],
      featured: false,
      preset: "فروشگاه اینترنتی",
    },
  ],
  faqs: [
    { q: "این نمونه‌کارها واقعاً کار شماست و زنده‌ان؟", a: "آره، صددرصد! هر سه لینک واقعی‌ان و همین الان روی اینترنت بالا هستن. روشون بزن، توشون بچرخ و خودت کیفیت کار رو قضاوت کن — نیازی به حرف من نیست." },
    { q: "ساخت سایت چقدر طول می‌کشه؟", a: "لندینگ حدود ۷ تا ۱۰ روز، وب‌سایت شرکتی ۳ تا ۴ هفته و فروشگاهی یا اختصاصی ۴ تا ۶ هفته. زمان دقیق رو همون اول با هم توافق می‌کنیم و بهش پایبند می‌مونم." },
    { q: "هزینه‌ها چطور مشخص می‌شه؟", a: "بعد از یه گفتگوی کوتاه و مشخص‌شدن امکانات، قیمت دقیق و شفاف اعلام می‌کنم — بدون هزینه پنهان. شروع قیمت‌ها رو هم توی بخش تعرفه گذاشتم." },
    { q: "دامنه و هاست رو خودم باید بگیرم؟", a: "نه اصلاً! همه مراحل فنی — خرید و اتصال دامنه، هاست، انتشار و تنظیمات — با منه. تو فقط نتیجه نهایی رو تحویل می‌گیری." },
    { q: "بعد از تحویل، پشتیبانی هم دارم؟", a: "حتماً. بسته به پلن، ۱ تا ۶ ماه پشتیبانی رایگان داری و بعدش هم با هزینه مناسب کنارت هستم. قرار نیست بعد از تحویل غیب بشم!" },
    { q: "می‌خوام دقیقاً سایتی مثل یکی از نمونه‌ها داشته باشم!", a: "عالیه! زیر هر نمونه‌کار یه دکمه «می‌خوام مثل این داشته باشم» هست — بزنش، فرمو پر کن و توی واتساپ ادامه می‌دیم. می‌تونیم دقیقاً همون مدل یا بهترش رو برای تو بسازیم." },
  ],
  final: {
    eyebrow: "READY WHEN YOU ARE / بزن بریم",
    before: "ایده‌ت رو به یه سایت",
    highlight: "واقعی و زنده",
    after: "تبدیل کن 🚀",
    sub: "یه پیام بده، بقیه‌ش با من. مشاوره اولیه رایگانه و همین امروز می‌تونیم شروع کنیم.",
    whatsappBtn: "شروع در واتساپ",
    formBtn: "پر کردن فرم سفارش",
    whatsappMsg: "سلام! می‌خوام سایتم رو سفارش بدم 🚀",
  },
  footer: {
    about: "استودیوی طراحی وب رسول بابایی — سایت‌هایی که مشتری میارن، نه فقط بازدید.",
    quickTitle: "دسترسی سریع",
    worksTitle: "نمونه‌کارهای زنده",
    contactTitle: "تماس مستقیم",
    copyright: "© ۲۰۲۶ رسول بابایی · SMARTDESH® — تمام حقوق محفوظ است.",
    made: "طراحی و توسعه با ❤️ توسط رسول بابایی",
  },
  form: {
    projectOptions: ["وب‌سایت شرکتی", "فروشگاه اینترنتی", "لندینگ پیج", "رزرو و نوبت‌دهی", "سئو و بهینه‌سازی", "سایتی مشابه نمونه‌کارها", "پشتیبانی و توسعه", "ایده‌ای دیگر"],
    budgetOptions: ["زیر ۸۰ میلیون", "۸۰ تا ۱۵۰ میلیون", "۱۵۰ تا ۲۵۰ میلیون", "بالای ۲۵۰ میلیون", "مشاوره می‌خوام"],
  },
  theme: {
    purple: "#a855f7",
    cyan: "#22d3ee",
    mint: "#5eead4",
    bg: "#050309",
    animations: "on",
    fontScale: 1,
    cursorGlow: true,
  },
};

/* ---------------- ابزارهای عمومی ---------------- */

export function faNum(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function waLink(number: string, text?: string): string {
  const base = `https://wa.me/${number.replace(/[^0-9]/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telHref(raw: string): string {
  return `tel:${raw.replace(/[^+0-9]/g, "")}`;
}

/* ---------------- قیمت و تخفیف ---------------- */

export function formatToman(n: number): string {
  if (!n || n <= 0) return "رایگان";
  return faNum(Math.round(n).toLocaleString("en-US")).replace(/,/g, "٬") + " تومان";
}

export function isOfferActive(p: Product, now = Date.now()): boolean {
  if (p.discountPercent <= 0) return false;
  if (!p.offerEnds) return true;
  const t = new Date(p.offerEnds).getTime();
  return Number.isFinite(t) ? t > now : true;
}

export function finalPrice(p: Product, now = Date.now()): number {
  return isOfferActive(p, now) ? Math.round(p.price * (1 - p.discountPercent / 100)) : p.price;
}

export function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function isValidPhone(value: string): boolean {
  const p = toEnglishDigits(value.trim()).replace(/[\s().-]/g, "");
  return /^(\+?98|0)?9\d{9}$/.test(p) || /^\+?\d{10,15}$/.test(p);
}

/* ---------------- بارگذاری / ذخیره ---------------- */

const DRAFT_KEY = "smartdesh-draft-v1";
const PASS_KEY = "smartdesh-admin-pass";
const SESSION_KEY = "smartdesh-admin-session";
export const DEFAULT_PASSWORD = "1234";

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeOldBrand(value: unknown): unknown {
  if (typeof value === "string") {
    const legacyName = [83, 77, 65, 82, 84, 68, 65, 83, 72]
      .map((code) => String.fromCharCode(code))
      .join("");
    return value.replace(new RegExp(legacyName, "gi"), "SMARTDESH");
  }
  if (Array.isArray(value)) return value.map(normalizeOldBrand);
  if (isObj(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeOldBrand(entry)]));
  }
  return value;
}

export function mergeContent(base: SiteContent, patch: unknown): SiteContent {
  if (!isObj(patch)) return base;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base) as (keyof SiteContent)[]) {
    const b = base[key];
    const p = (patch as Record<string, unknown>)[key];
    if (p === undefined) continue;
    if (isObj(b) && isObj(p)) {
      out[key] = { ...(b as Record<string, unknown>), ...p };
    } else {
      out[key] = p;
    }
  }
  return normalizeOldBrand(out) as SiteContent;
}

export function readEmbedded(): SiteContent | null {
  const el = document.getElementById("sd-content");
  if (!el?.textContent) return null;
  try {
    return mergeContent(DEFAULT_CONTENT, JSON.parse(el.textContent));
  } catch {
    return null;
  }
}

export function readDraft(): SiteContent | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? mergeContent(DEFAULT_CONTENT, JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveDraft(content: SiteContent) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function hasDraft(): boolean {
  return localStorage.getItem(DRAFT_KEY) !== null;
}

export async function fetchContentJson(): Promise<SiteContent | null> {
  try {
    const res = await fetch("./content.json", { cache: "no-store" });
    if (!res.ok) return null;
    return migrate(mergeContent(DEFAULT_CONTENT, await res.json()));
  } catch {
    return null;
  }
}

export const CONTENT_VERSION = 4;

/** پیش‌نویس‌های نسخه‌ی قدیمی: منو و بخش‌های جدید را از پیش‌فرض می‌گیرند */
function migrate(c: SiteContent): SiteContent {
  if ((c.version ?? 1) >= CONTENT_VERSION) return c;
  return {
    ...c,
    version: CONTENT_VERSION,
    nav: DEFAULT_CONTENT.nav,
    headings: { ...DEFAULT_CONTENT.headings, ...c.headings },
  };
}

export function loadInitialContent(): { content: SiteContent; isDraft: boolean } {
  const draft = readDraft();
  if (draft) return { content: migrate(draft), isDraft: true };
  const embedded = readEmbedded();
  if (embedded) return { content: migrate(embedded), isDraft: false };
  return { content: DEFAULT_CONTENT, isDraft: false };
}

/* ---------------- رمز پنل ---------------- */

export function getPassword(): string {
  return localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;
}
export function setPassword(p: string) {
  localStorage.setItem(PASS_KEY, p);
}
export function isLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
export function setLoggedIn(v: boolean) {
  if (v) sessionStorage.setItem(SESSION_KEY, "1");
  else sessionStorage.removeItem(SESSION_KEY);
}

/* ---------------- انتشار ---------------- */

declare global {
  interface Window {
    __SD_RAW_HTML__?: string;
  }
}

export function download(name: string, data: string, type: string) {
  const blob = new Blob([data], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

export function exportJson(content: SiteContent) {
  download("content.json", JSON.stringify(content, null, 2), "application/json");
}

/*
  ساخت index.html نهایی با پارسر استاندارد مرورگر (DOMParser).
  هیچ جستجوی متنی روی HTML انجام نمی‌شود؛ بنابراین کد برنامه هرگز آسیب نمی‌بیند
  و بازنشر چندباره همیشه همان یک تگ داده را به‌روز می‌کند.
*/
export function buildPublishedHtml(content: SiteContent): string {
  const raw = window.__SD_RAW_HTML__;
  if (!raw) throw new Error("نسخه‌ی خام صفحه در دسترس نیست. صفحه را رفرش کن و دوباره امتحان کن.");

  const doc = new DOMParser().parseFromString(raw, "text/html");
  const head = doc.head;

  let dataEl = doc.getElementById("sd-content");
  if (!dataEl) {
    dataEl = doc.createElement("script");
    dataEl.id = "sd-content";
    dataEl.setAttribute("type", "application/json");
    head.insertBefore(dataEl, head.firstChild);
  }
  // «<» را escape می‌کنیم تا هیچ‌وقت تگ بسته‌شدن اسکریپت داخل داده ایجاد نشود
  dataEl.textContent = JSON.stringify(content).replace(/</g, "\\u003c");

  let title = head.querySelector("title");
  if (!title) {
    title = doc.createElement("title");
    head.appendChild(title);
  }
  title.textContent = content.brand.pageTitle;

  const metaPairs: [string, string, string][] = [
    ["name", "description", content.brand.metaDescription],
    ["property", "og:title", content.brand.pageTitle],
    ["property", "og:description", content.brand.metaDescription],
  ];
  for (const [attr, key, value] of metaPairs) {
    let meta = head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!meta) {
      meta = doc.createElement("meta");
      meta.setAttribute(attr, key);
      head.appendChild(meta);
    }
    meta.setAttribute("content", value);
  }

  return "<!doctype html>\n" + doc.documentElement.outerHTML;
}

export function exportHtml(content: SiteContent) {
  download("index.html", buildPublishedHtml(content), "text/html;charset=utf-8");
}

/* ---------------- ظاهر ---------------- */

export function applyTheme(theme: SiteContent["theme"]) {
  const r = document.documentElement;
  r.style.setProperty("--purple", theme.purple);
  r.style.setProperty("--cyan", theme.cyan);
  r.style.setProperty("--mint", theme.mint);
  r.style.setProperty("--void", theme.bg);
  r.style.setProperty("--font-scale", String(theme.fontScale));
  document.body.dataset.anim = theme.animations;
  document.body.dataset.glow = theme.cursorGlow ? "on" : "off";
}

/* ---------------- تصویر ---------------- */

export function fileToDataUrl(file: File, maxSide = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("فایل تصویر معتبر نیست"));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}
