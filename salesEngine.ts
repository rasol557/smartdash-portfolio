/* ============================================================================
   موتور گفتگوی فروش SMARTDESH
   ----------------------------------------------------------------------------
   این یک سیستم قانون‌مند (rule-based) است؛ یعنی:
   - بدون اتصال به اینترنت
   - بدون مدل هوش مصنوعی خارجی
   - پاسخ‌هایش بر اساس کلیدواژه‌ها، حالت گفتگو و قوانین تعریف‌شده توسط خودت
   - در عین حال مثل یک فروشنده‌ی واقعی رفتار می‌کند:
     1) نیاز مشتری را تشخیص می‌دهد
     2) مزیت مرتبط را مطرح می‌کند
     3) سؤال کشف می‌پرسد
     4) به اعتراض‌ها جواب می‌دهد
     5) پیگیری می‌کند (سمج ولی مؤدب)
     6) در زمان مناسب دعوت به اقدام می‌کند
   ============================================================================ */

import { waLink, type SiteContent } from "./content";
import type { SalesPlaybook } from "./content";

export type SalesIntent =
  | "site-from-scratch"
  | "redesign"
  | "ecommerce"
  | "booking"
  | "price"
  | "time"
  | "sample"
  | "compare"
  | "support"
  | "ready"
  | "greeting"
  | "smalltalk"
  | "objection"
  | "confused"
  | "goodbye"
  | "fallback";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  intent?: SalesIntent;
  suggestions?: string[];
  actions?: SalesAction[];
  ts: number;
}

export type SalesAction =
  | { kind: "open-form"; preset: string }
  | { kind: "open-whatsapp"; text: string }
  | { kind: "open-phone" }
  | { kind: "open-link"; url: string; label: string }
  | { kind: "select-budget"; budget: string }
  | { kind: "request-phone" }
  | { kind: "schedule-followup" };

interface EngineState {
  stage: "intro" | "discovery" | "objection" | "pitch" | "close" | "followup" | "after-sale";
  askedCount: number;
  lastObjection?: string;
  wantsBudget?: string;
  wantsService?: string;
  inComparison: boolean;
  turns: number;
  lastActivityTs: number;
  detectedBudget?: string;
  collectedPhone: boolean;
  hasShownLiveWork: boolean;
  hasShownPricing: boolean;
  hasShownUpsell: boolean;
}

const SESSION_KEY = "smartdesh-sales-session-v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6 ساعت

function normalizeFa(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)])
    .replace(/[٠-٩]/g, (d) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
    .replace(/[\s\u200c]+/g, " ")
    .toLowerCase()
    .trim();
}

function includesAny(text: string, words: string[]): boolean {
  return words.some((w) => {
    if (w.length < 3) {
      // کلمه‌ی کوتاه مثل «نه» فقط وقتی به‌صورت کلمه‌ی کامل باشد
      const re = new RegExp(`(^|\\s)${escapeRegExp(w)}(?=\\s|$|[،.!؟])`, "u");
      return re.test(text);
    }
    return text.includes(w);
  });
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const OBJECTION_TERMS = [
  { id: "price", words: ["گرون", "گران", "قیمت بالا", "هزینه زیاد", "نمی‌رسه", "بودجه ندارم", "نمی‌کشم", "کمه بودجه"] },
  { id: "later", words: ["بعداً", "فکر کنم", "الان وقت نیست", "عجله ندارم", "باشه بعد", "بعد میام", "فعلاً نه"] },
  { id: "trust", words: ["مطمئن نیستم", "اعتماد", "تردید", "شک", "نمی‌شناسم", "ناشناس", "می‌ترسم", "ریسک", "نتیجه نمیگیرم"] },
  { id: "portfolio", words: ["نمونه کار نداری", "کار نکردی", "سابقه نداری", "تجربه نداری", "اثبات کن", "نمونه نداری"] },
  { id: "time", words: ["وقت ندارم", "مشغله", "سرم شلوغه", "فرصت نمیکنم", "عجله ندارم"] },
];

const POSITIVE_TERMS = ["بله", "آره", "موافقم", "بزن بریم", "اوکی", "ok", "آماده", "شروع کن", "قبول", "عالی", "خوبه", "باشه", "ادامه بده", "خب", "بیا"];

const NEGATIVE_TERMS = ["نه", "نمیخوام", "نمی‌خوام", "خسته شدم", "بسه", "کافیه", "تموم کن", "برو"];

const PRICE_TERMS = ["قیمت", "هزینه", "چقدر", "تومان", "میلیون", "تعرفه", "نرخ", "پول"];

const TIME_TERMS = ["چند روز", "کِی", "کی", "چند وقت", "زمان", "تاریخ", "سریع", "فوری", "عجله", "دیر", "چقدر طول", "چه مدت"];

const SUPPORT_TERMS = ["پشتیبانی", "بروز", "بروزرسانی", "آپدیت", "تغییر", "مشکل", "خراب", "کمک", "سابق"];

const COMPARE_TERMS = ["چرا", "چطور", "مقایسه", "فرق", "بهتر", "ویژه", "چه فرقی", "چرا شما", "چرا تو", "چرا سایت شما"];

const READY_TERMS = ["ثبت", "سفارش", "بزن بریم", "شروع کن", "ادامه بده", "بیا شروع", "قبول", "آماده"];

const REDESIGN_TERMS = ["بازطراحی", "ارتقا", "عوض", "تغییر", "فعلی", "قبلی", "سئو", "سرعت", "کند", "ضعیف", "بهبود", "آپدیت سایت"];

const ECOM_TERMS = ["فروشگاه", "محصول", "سبد", "پرداخت", "درگاه", "ارسال", "پست", "پیک", "دانلود", "فروش آنلاین", "خرید", "قیمت محصول"];

const BOOKING_TERMS = ["رزرو", "نوبت", "آرایشگاه", "کلینیک", "سالن", "پزشک", "مشاوره", "وقت"];

const SAMPLE_TERMS = ["نمونه", "دمو", "کار کردی", "قبلی", "نشون", "مثال", "پورتفولیو", "نمونه کار"];

const FROM_SCRATCH_TERMS = ["صفر", "از اول", "تازه", "شروع", "ندارم", "سایت جدید", "هیچ سایتی", "ندیدم", "نمونه کار ندارم"];

const SAMPLE_QUESTION_TERMS = ["میتونم ببینم", "نشونم بده", "لینک بده", "آدرس سایت", "کجا ببینم"];

const PHONE_TERMS = ["شماره", "تلفن", "زنگ", "تماس", "موبایل", "تلفنی"];

const GREETING_TERMS = ["سلام", "درود", "خسته نباشی", "وقت بخیر", "hi", "hello", "هلو", "چطوری", "چه خبر", "خوبی"];

const THANKS_TERMS = ["ممنون", "مرسی", "تشکر", "سپاس", "دستت درد نکنه", "متشکرم", "مرسی از وقتت"];

const GOODBYE_TERMS = ["خداحافظ", "خدافظ", "بدرود", "میرم", "فعلاً", "بعدا میام", "مرسی فعلاً"];

const CONFUSED_TERMS = ["نفهمیدم", "گیج شدم", "چی گفتی", "یعنی چی", "میشه واضح تر", "میشه دوباره", "؟", "??", "!!!"];

const PURE_GREETING_REGEX = /^(سلام|درود|خسته نباشی|وقت بخیر|hi|hello|هلو|چطوری|چه خبر|خوبی|سلام صبح بخیر|سلام شب بخیر)[\s\!\.\؟]*$/;

const DIGIT_REGEX = /[0-9\u06F0-\u06F9]/;

function detectObjection(text: string): string | undefined {
  for (const item of OBJECTION_TERMS) if (includesAny(text, item.words)) return item.id;
  return undefined;
}

function detectIntent(text: string, state: EngineState): SalesIntent {
  if (PURE_GREETING_REGEX.test(text.trim())) return "greeting";
  if (includesAny(text, GOODBYE_TERMS)) return "goodbye";
  if (includesAny(text, NEGATIVE_TERMS) && text.length < 12) return "goodbye";
  if (includesAny(text, THANKS_TERMS) && text.length < 30) return "smalltalk";
  if (includesAny(text, POSITIVE_TERMS) && state.stage === "close") return "ready";
  if (includesAny(text, READY_TERMS)) return "ready";
  if (includesAny(text, PRICE_TERMS)) return "price";
  if (includesAny(text, TIME_TERMS)) return "time";
  if (includesAny(text, SUPPORT_TERMS)) return "support";
  if (includesAny(text, COMPARE_TERMS)) return "compare";
  if (includesAny(text, SAMPLE_QUESTION_TERMS) || includesAny(text, SAMPLE_TERMS)) return "sample";
  if (includesAny(text, REDESIGN_TERMS)) return "redesign";
  if (includesAny(text, ECOM_TERMS)) return "ecommerce";
  if (includesAny(text, BOOKING_TERMS)) return "booking";
  if (includesAny(text, FROM_SCRATCH_TERMS)) return "site-from-scratch";
  if (includesAny(text, PHONE_TERMS)) return "compare";
  if (includesAny(text, GREETING_TERMS) && text.length < 20) return "greeting";
  if (includesAny(text, CONFUSED_TERMS)) return "confused";
  if (text.length < 4) return "smalltalk";
  // اعداد به‌تنهایی یعنی احتمالاً اعلام بودجه
  if (DIGIT_REGEX.test(text) && text.replace(/\D/g, "").length <= 3) return "price";
  return "fallback";
}

function extractBudget(text: string): string | undefined {
  const t = normalizeFa(text);
  // اعداد فارسی
  const fa = t.match(/(\d{1,3}(?:[٬,\.]\d{3})+|\d+)\s*(تومان|میلیون|م|ت)?/);
  if (fa) {
    const num = Number(fa[1].replace(/[٬,\.]/g, ""));
    if (!Number.isFinite(num) || num <= 0) return undefined;
    if (fa[2] && (fa[2].includes("میلیون") || fa[2] === "م")) {
      if (num < 80) return "کمتر از ۸۰ میلیون";
      if (num < 150) return "۸۰ تا ۱۵۰ میلیون";
      if (num < 250) return "۱۵۰ تا ۲۵۰ میلیون";
      return "بالای ۲۵۰ میلیون";
    }
    if (fa[2] && fa[2].includes("تومان")) {
      const toman = num;
      if (toman < 80_000_000) return "کمتر از ۸۰ میلیون";
      if (toman < 150_000_000) return "۸۰ تا ۱۵۰ میلیون";
      if (toman < 250_000_000) return "۱۵۰ تا ۲۵۰ میلیون";
      return "بالای ۲۵۰ میلیون";
    }
    return `بودجه‌ی تقریبی ${num.toLocaleString("fa-IR")}`;
  }
  // کلمات
  if (/(کم|اندک|کوچک|پایین)/.test(t) && /بودجه/.test(t)) return "کمتر از ۸۰ میلیون";
  if (/(زیاد|بالا|خوب|مناسب|کافی)/.test(t) && /بودجه/.test(t)) return "۱۵۰ تا ۲۵۰ میلیون";
  return undefined;
}

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function objectId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildAction(
  p: SalesPlaybook["objectives"][number]["nextAction"],
  content: SiteContent,
  intent: SalesIntent,
  budget?: string,
) {
  if (intent === "ready" || p === "form") {
    return { kind: "open-form", preset: "وب‌سایت شرکتی" } as SalesAction;
  }
  if (p === "live") {
    const w = content.sales.liveWork[0];
    return { kind: "open-link", url: w?.url ?? "#work", label: "دیدن نمونه‌کارهای زنده" } as SalesAction;
  }
  if (p === "shop") {
    return { kind: "open-link", url: "#shop", label: "دیدن فروشگاه محصولات" } as SalesAction;
  }
  if (p === "samples") {
    return { kind: "open-link", url: "#work", label: "نمونه‌کارها" } as SalesAction;
  }
  if (p === "phone") {
    return { kind: "open-phone" } as SalesAction;
  }
  const preset = budget ? `بودجه ${budget}` : intent;
  return {
    kind: "open-whatsapp",
    text: `سلام رسول! می‌خوام درباره ${preset} صحبت کنم.`,
  } as SalesAction;
}

function makeAssistant(text: string, opts: Partial<Pick<Message, "suggestions" | "actions" | "intent">> = {}): Message {
  return {
    id: objectId(),
    role: "assistant",
    text,
    suggestions: opts.suggestions,
    actions: opts.actions,
    intent: opts.intent,
    ts: Date.now(),
  };
}

function makeUser(text: string): Message {
  return { id: objectId(), role: "user", text, ts: Date.now() };
}

function openingMessage(content: SiteContent, _state: EngineState): Message {
  const suggestions = content.sales.objectives.slice(0, 4).map((o) => o.title);
  return makeAssistant(content.sales.greeting, {
    intent: "greeting",
    suggestions,
  });
}

function handleByObjective(
  objective: SalesPlaybook["objectives"][number],
  content: SiteContent,
  state: EngineState,
): Message {
  const followup = randomPick(objective.followups);
  const suggestions: string[] = [];
  if (objective.nextAction === "form") {
    suggestions.push("پر کردن فرم سفارش", "ادامه گفتگو", "نمونه‌کار ببینم");
  } else if (objective.nextAction === "live") {
    suggestions.push("دیدن نمونه‌ی زنده", "نمونه‌ی شبیه به کارم می‌خوام", "ادامه گفتگو");
  } else if (objective.nextAction === "samples") {
    suggestions.push("آدرس سایتم رو می‌فرستم", "ادامه گفتگو");
  } else if (objective.nextAction === "whatsapp") {
    suggestions.push("پیام در واتساپ", "ادامه گفتگو", "نمونه‌کار ببینم");
  } else if (objective.nextAction === "phone") {
    suggestions.push("شماره‌ت رو بگو تا زنگ بزنم", "ادامه گفتگو");
  } else {
    suggestions.push("ادامه گفتگو", "نمونه‌کار ببینم");
  }
  const action = buildAction(objective.nextAction, content, objective.id === "ready" ? "ready" : "fallback", state.wantsBudget);
  return makeAssistant(`${objective.response}\n\n${followup}`, {
    intent: objective.id as SalesIntent,
    suggestions,
    actions: [action],
  });
}

function handleObjection(objectionId: string, content: SiteContent, state: EngineState): Message { void content;
  const handler = content.sales.objectionHandlers.find((h) => h.objection.includes(objectionId));
  if (!handler) {
    return makeAssistant("نگرانی‌ات رو می‌فهمم. بگو دقیقاً چه چیزی ذهنت رو درگیر کرده تا دقیق‌تر جواب بدم.", {
      suggestions: ["نگران قیمت هستم", "نگران کیفیت هستم", "نگران زمان هستم", "نمونه‌کار بیشتر می‌خوام"],
    });
  }
  const suggestions = ["ادامه گفتگو", "نمونه‌کار ببینم", "پر کردن فرم", "پیام در واتساپ"];
  return makeAssistant(handler.response, {
    intent: "objection",
    suggestions,
    actions: [buildAction("form", content, "fallback", state.wantsBudget)],
  });
}

function handleGreeting(content: SiteContent, state: EngineState): Message {
  if (state.stage === "intro") {
    state.stage = "discovery";
    return makeAssistant(
      `${content.sales.openingOffer}\n\nاگه بخوای در ۳۰ ثانیه مسیرت روشن بشه، یکی از این گزینه‌ها رو انتخاب کن.`,
      {
        suggestions: content.sales.objectives.slice(0, 4).map((o) => o.title),
        actions: [buildAction("live", content, "sample")],
      },
    );
  }
  return makeAssistant(
    "سلام دوباره! 😊 خوشحالم که برگشتی. از کجا ادامه بدیم؟",
    { suggestions: ["نمونه‌کار ببینم", "قیمت‌ها چقدره؟", "می‌خوام شروع کنم"] },
  );
}

function handleGoodbye(_content: SiteContent, _state: EngineState): Message {
  return makeAssistant(
    "مرسی از وقتت! هر وقت آماده شدی من اینجام. موفق باشی ✨",
    { suggestions: ["صبر کن، یه سؤال دیگه دارم", "نمونه‌کار ببینم"] },
  );
}

function handleSmalltalk(content: SiteContent, state: EngineState): Message { void content;
  if (state.stage === "intro") {
    state.stage = "discovery";
    return makeAssistant(
      "خواهش می‌کنم! 😊 یه سؤال ساده: الان چی ذهنت رو درگیر کرده؟",
      { suggestions: ["نمونه‌کار ببینم", "قیمت‌ها", "زمان تحویل"] },
    );
  }
  return makeAssistant("خوشحالم که کمک کرد. سؤال دیگه‌ای هست؟", {
    suggestions: ["قیمت چقدره؟", "نمونه‌کار", "زمان تحویل", "می‌خوام شروع کنم"],
  });
}

function handleConfused(_content: SiteContent, _state: EngineState): Message {
  return makeAssistant(
    "ببخشید، منظورت رو دقیق نفهمیدم. اگه سؤال یا نیاز خاصی داری، یکی از گزینه‌های زیر رو بزن یا خودت کوتاه توضیح بده.",
    {
      suggestions: ["نمونه‌کار ببینم", "قیمت چقدره؟", "زمان تحویل", "سایت می‌خوام", "می‌خوام شروع کنم"],
    },
  );
}

function handleFallback(content: SiteContent, state: EngineState, userText: string): Message {
  // استخراج احتمالی بودجه
  const budget = extractBudget(userText);
  if (budget) state.wantsBudget = budget;
  const firstValue = content.sales.valueProps[state.turns % content.sales.valueProps.length] ?? content.sales.valueProps[0];
  const question = content.sales.discoveryQuestions[state.askedCount % content.sales.discoveryQuestions.length];
  state.askedCount++;
  const suggestions = ["نمونه‌کار ببینم", "قیمت چقدره؟", "زمان تحویل چند روزه؟", "می‌خوام شروع کنم"];
  return makeAssistant(
    `${firstValue}\n\n${question}`,
    { suggestions, actions: [buildAction("form", content, "fallback", state.wantsBudget)] },
  );
}

function discoverQuestion(content: SiteContent, state: EngineState): Message {
  const q = content.sales.discoveryQuestions[state.askedCount % content.sales.discoveryQuestions.length];
  state.askedCount++;
  return makeAssistant(q, { suggestions: content.sales.valueProps.map((_, i) => ["نمونه‌کار ببینم", "قیمت چقدره؟", "ادامه بده", "می‌خوام شروع کنم"][i % 4]) });
}

function pitchLive(content: SiteContent, state: EngineState): Message {
  if (state.hasShownLiveWork) {
    return makeAssistant("نمونه‌کارها رو دیدی. حالا کدوم مدل برات جذاب‌تره؟", {
      suggestions: content.sales.objectives.filter((o) => ["site-from-scratch", "ecommerce", "booking", "ready"].includes(o.id)).map((o) => o.title),
    });
  }
  state.hasShownLiveWork = true;
  const lines = content.sales.liveWork.map((w) => `• ${w.title} — ${w.what} (${w.url})`);
  return makeAssistant(
    `این ۳ پروژه الان زنده هستن، می‌تونی بازشون کنی و از نزدیک ببینی:\n${lines.join("\n")}\n\nکدوم مدل به کار شما نزدیک‌تره؟`,
    {
      intent: "sample",
      suggestions: ["Diamo Jewels", "VeilPDF", "Mehdi Barber", "مدل متفاوت می‌خوام"],
      actions: content.sales.liveWork.map((w) => ({ kind: "open-link", url: w.url, label: w.title } as SalesAction)),
    },
  );
}

function pitchPricing(content: SiteContent, state: EngineState): Message {
  if (state.hasShownPricing) {
    return makeAssistant("کدوم پلن به نیازت نزدیک‌تره؟ یا اگه سؤالی درباره پرداخت سه‌قسطی داری بگو.", {
      suggestions: ["همین پلن رو می‌خوام", "بودجه‌ی من فرق داره", "می‌خوام با هم صحبت کنیم"],
    });
  }
  state.hasShownPricing = true;
  const bullets = content.sales.pricingPitches.map((p) => `• ${p.budget}: ${p.pitch}`).join("\n\n");
  return makeAssistant(
    `قیمت‌ها بر اساس امکانات تعیین می‌شه. این یه راهنماست:\n\n${bullets}\n\nضمناً قرارداد سه‌قسطی داریم: ۱/۳ پیش‌پرداخت، ۱/۳ پس از دموی واقعی، ۱/۳ پس از انتشار نهایی. هیچ هزینه‌ای پیش از دیدن نتیجه پرداخت نمی‌کنی.\n\nبودجه‌ی تقریبی‌ات چقدره؟`,
    {
      intent: "price",
      suggestions: content.sales.pricingPitches.map((p) => p.budget).concat(["می‌خوام مشاوره‌ی دقیق‌تر"]),
    },
  );
}

function pitchSocialProof(content: SiteContent, _state: EngineState): Message {
  const lines = content.sales.socialProof.map((s) => `✓ ${s.text}`).join("\n");
  return makeAssistant(`چند نکته که شاید کمکت کنه تصمیم بگیری:\n\n${lines}\n\nکدوم نکته برات مهم‌تره؟`, {
    suggestions: ["نمونه‌کار زنده", "قرارداد سه‌قسطی", "ارتباط مستقیم", "قیمت"],
  });
}

function pitchFaq(content: SiteContent, _state: EngineState): Message {
  const lines = content.sales.faq.map((f) => `• ${f.q}`).join("\n");
  return makeAssistant(`سؤالات رایجی که مشتری‌ها می‌پرسن:\n\n${lines}\n\nاگه سؤال مشخصی داری بپرس، یا یکی از این عناوین رو انتخاب کن تا توضیح کامل بدم.`, {
    suggestions: ["قیمت شامل چیه؟", "اگه منصرف شوم؟", "محتوای اولیه؟", "چه فرقی دارید؟"],
  });
}

function handleClose(content: SiteContent, state: EngineState): Message {
  const lines = [
    "🎉 عالی! منتظرت هستم.",
    `📝 ${content.sales.closingLine}`,
    "یا اگه سؤالی داری، اینجا بپرس. هر وقت آماده باشی، فرم پایین رو پر کن.",
  ];
  return makeAssistant(lines.join("\n\n"), {
    intent: "ready",
    suggestions: ["پر کردن فرم", "نمونه‌کار زنده", "بازگشت به سایت"],
    actions: [{ kind: "open-form", preset: state.wantsService ?? "وب‌سایت شرکتی" } as SalesAction],
  });
}

// unused for now, kept for future expansion
void ({} as { fn?: () => unknown }).fn;

export class SalesConversation {
  state: EngineState;
  history: Message[];
  private content: SiteContent;

  constructor(content: SiteContent, initial?: { history?: Message[]; state?: Partial<EngineState> }) {
    this.content = content;
    this.state = {
      stage: "intro",
      askedCount: 0,
      turns: 0,
      lastActivityTs: Date.now(),
      inComparison: false,
      collectedPhone: false,
      hasShownLiveWork: false,
      hasShownPricing: false,
      hasShownUpsell: false,
      ...(initial?.state ?? {}),
    };
    this.history = initial?.history ?? [];
  }

  reset() {
    this.state = {
      stage: "intro",
      askedCount: 0,
      turns: 0,
      lastActivityTs: Date.now(),
      inComparison: false,
      collectedPhone: false,
      hasShownLiveWork: false,
      hasShownPricing: false,
      hasShownUpsell: false,
    };
    this.history = [];
  }

  greeting(): Message {
    const m = openingMessage(this.content, this.state);
    this.history.push(m);
    this.state.lastActivityTs = Date.now();
    return m;
  }

  step(userText: string): Message {
    if (!this.content.sales.enabled) {
      const m = makeAssistant("دستیار فروش فعلاً خاموش است.", { suggestions: [] });
      this.history.push(makeUser(userText));
      this.history.push(m);
      return m;
    }
    this.state.turns += 1;
    this.state.lastActivityTs = Date.now();
    const user = makeUser(userText);
    this.history.push(user);

    const normalized = normalizeFa(userText);
    const objection = detectObjection(normalized);
    if (objection && this.state.stage !== "intro" && Math.random() > 0.25) {
      const m = handleObjection(objection, this.content, this.state);
      this.history.push(m);
      return m;
    }

    const intent = detectIntent(normalized, this.state);

    if (intent === "greeting") {
      const m = handleGreeting(this.content, this.state);
      this.history.push(m);
      return m;
    }
    if (intent === "goodbye") {
      const m = handleGoodbye(this.content, this.state);
      this.history.push(m);
      this.state.stage = "followup";
      return m;
    }
    if (intent === "smalltalk") {
      const m = handleSmalltalk(this.content, this.state);
      this.history.push(m);
      return m;
    }
    if (intent === "confused") {
      const m = handleConfused(this.content, this.state);
      this.history.push(m);
      return m;
    }

    if (intent === "sample" || intent === "compare") {
      this.state.stage = "pitch";
      const m = pitchLive(this.content, this.state);
      this.history.push(m);
      return m;
    }

    if (intent === "price") {
      this.state.stage = "pitch";
      const budget = extractBudget(userText);
      if (budget) this.state.wantsBudget = budget;
      const m = pitchPricing(this.content, this.state);
      this.history.push(m);
      return m;
    }

    if (intent === "time") {
      const response = `⏱ زمان تحویل به امکانات بستگی داره:\n• لندینگ: ۷ تا ۱۰ روز\n• سایت شرکتی: ۳ تا ۴ هفته\n• فروشگاهی/اختصاصی: ۴ تا ۶ هفته\n\nاگه عجله داری بگو تا واقع‌بینانه بررسی کنیم.`;
      const m = makeAssistant(response, {
        intent: "time",
        suggestions: ["خیلی فوریه", "۲ هفته وقت دارم", "زیاد عجله ندارم", "نمونه‌کار ببینم"],
        actions: [buildAction("form", this.content, "fallback")],
      });
      this.history.push(m);
      return m;
    }

    if (intent === "support") {
      const m = makeAssistant(
        `پشتیبانی برای سایت‌های فعلی هم ارائه می‌دم.\n\n${this.content.sales.signatureServices.find((s) => s.includes("پشتیبانی")) ?? "پشتیبانی ماهانه"}.\n\n${this.content.sales.afterSaleCare}`,
        {
          intent: "support",
          suggestions: ["سایت قبلی دارم", "می‌خوام پشتیبانی ماهانه", "نمونه‌کار ببینم"],
        },
      );
      this.history.push(m);
      return m;
    }

    if (intent === "ready") {
      this.state.stage = "close";
      const m = handleClose(this.content, this.state);
      this.history.push(m);
      return m;
    }

    // سایر اهداف مشخص
    const objective = this.content.sales.objectives.find((o) => o.id === intent);
    if (objective) {
      this.state.wantsService = objective.id;
      if (intent === "ecommerce" || intent === "booking") {
        this.state.stage = "pitch";
        const a = handleByObjective(objective, this.content, this.state);
        this.history.push(a);
        return a;
      }
      if (intent === "site-from-scratch" || intent === "redesign") {
        this.state.stage = "discovery";
        const a = handleByObjective(objective, this.content, this.state);
        this.history.push(a);
        return a;
      }
      const a = handleByObjective(objective, this.content, this.state);
      this.history.push(a);
      return a;
    }

    // نیت نامشخص - اگر در حال فروش نیست، سؤال کشف بپرس
    if (this.state.stage === "intro" || this.state.askedCount < 2) {
      this.state.stage = "discovery";
      const budget = extractBudget(userText);
      if (budget) this.state.wantsBudget = budget;
      const m = discoverQuestion(this.content, this.state);
      this.history.push(m);
      return m;
    }

    // اگر مدتی است گفتگو می‌کنیم و هنوز اقدام نکرده، شواهد اجتماعی یا FAQ پیشنهاد بده
    if (this.state.askedCount >= 2 && this.state.turns >= 3 && Math.random() > 0.5) {
      const m = pitchSocialProof(this.content, this.state);
      this.history.push(m);
      return m;
    }
    if (this.state.askedCount >= 4) {
      const m = pitchFaq(this.content, this.state);
      this.history.push(m);
      return m;
    }

    const m = handleFallback(this.content, this.state, userText);
    this.history.push(m);
    return m;
  }

  exportSnapshot() {
    return { history: this.history, state: this.state };
  }

  static load(content: SiteContent): SalesConversation {
    if (typeof localStorage === "undefined") return new SalesConversation(content);
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return new SalesConversation(content);
      const parsed = JSON.parse(raw) as { history: Message[]; state: EngineState; savedAt: number };
      if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
        localStorage.removeItem(SESSION_KEY);
        return new SalesConversation(content);
      }
      return new SalesConversation(content, { history: parsed.history, state: parsed.state });
    } catch {
      return new SalesConversation(content);
    }
  }

  save() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ history: this.history, state: this.state, savedAt: Date.now() }),
      );
    } catch {
      /* ignore quota */
    }
  }

  static clearStored() {
    if (typeof localStorage !== "undefined") localStorage.removeItem(SESSION_KEY);
  }
}

export function buildWhatsAppLink(content: SiteContent, intent: string, budget?: string): string {
  const lines = [`سلام رسول!`, `از دستیار فروش سایت پیام میدم.`, `نیاز من: ${intent}.`];
  if (budget) lines.push(`بودجه‌ی تقریبی: ${budget}.`);
  lines.push("لطفاً راهنمایی کن.");
  return waLink(content.contact.whatsapp, lines.join("\n"));
}
