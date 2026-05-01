"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { ChevronDown } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const navy = "#1B3A6B";
const gold  = "#C9A84C";
const dark  = "#0D1B2E";

interface AboutContent {
  about_biruni_en: string;
  about_biruni_fa: string;
  about_story_en: string;
  about_story_fa: string;
  about_vision_en: string;
  about_vision_fa: string;
  about_mission_en: string;
  about_mission_fa: string;
  about_founder_quote_en: string;
  about_founder_quote_fa: string;
  about_founder_name: string;
  about_founder_name_fa: string;
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6 ${className}`}>
      {children}
    </section>
  );
}

function BilingualBlock({
  en, fa, enTitle, faTitle,
}: { en: React.ReactNode; fa: React.ReactNode; enTitle: string; faTitle: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10">
      <div>
        <h2 className="text-lg font-bold mb-3" style={{ color: navy }}>{enTitle}</h2>
        <div className="text-gray-600 leading-relaxed text-sm space-y-3">{en}</div>
      </div>
      <div className="border-t border-gray-100 mt-6 pt-6 md:border-t-0 md:mt-0 md:pt-0 md:border-l md:pl-10" dir="rtl">
        <h2 className="text-lg font-bold mb-3" style={{ color: navy }}>{faTitle}</h2>
        <div className="text-gray-600 leading-relaxed text-sm space-y-3">{fa}</div>
      </div>
    </div>
  );
}

function FaqBlock({ title, items, lang }: { title: string; items: { q: string; a: string }[]; lang: "en" | "fa" }) {
  const [open, setOpen] = useState<number | null>(null);
  const isRtl = lang === "fa";
  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={isRtl ? { fontFamily: "'Vazirmatn', sans-serif" } : {}}>
      <h2 className="text-lg font-bold mb-5" style={{ color: "#1B3A6B" }}>{title}</h2>
      <div className="space-y-2">
        {items.map(({ q, a }, i) => (
          <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-800 pr-4">{q}</span>
              <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HtmlContent({ html, dir }: { html: string; dir?: "rtl" | "ltr" }) {
  return (
    <div
      className="blog-content text-gray-600 text-sm leading-relaxed"
      dir={dir}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    fetch(`${API}/about.php`)
      .then((r) => r.json())
      .then(setContent)
      .catch(() => {});
  }, []);

  if (!content) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="skeleton h-5 w-40 rounded-xl mb-4" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-4/6 rounded" />
            </div>
          </div>
        ))}
      </main>
    );
  }

  const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is BiruniMap?", "acceptedAnswer": { "@type": "Answer", "text": "BiruniMap is a community platform for the Iranian diaspora — a map of Iranian-owned businesses worldwide, a calendar of Iranian community events, and a blog sharing stories and information from across the community." } },
      { "@type": "Question", "name": "Which countries are covered?", "acceptedAnswer": { "@type": "Answer", "text": "BiruniMap covers businesses across Europe, North America, Australia and beyond. We are continuously expanding our coverage as our community grows." } },
      { "@type": "Question", "name": "How do I add my business?", "acceptedAnswer": { "@type": "Answer", "text": "Fill in the submission form on our Get Listed page. Our team reviews every submission and publishes approved listings within a few days." } },
      { "@type": "Question", "name": "Is BiruniMap free to use?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Discovering and listing businesses on BiruniMap is completely free for the Iranian community." } },
      { "@type": "Question", "name": "Who runs BiruniMap?", "acceptedAnswer": { "@type": "Answer", "text": "BiruniMap is run by a small team of Iranians abroad, supported by a network of +10 volunteer admins across different countries. It was founded by Afshin Khosroshahi." } },
      { "@type": "Question", "name": "Can I manage my own business listing?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. When you submit your business, check the owner option and create a BiruniMap account. Once approved, you can update your listing directly from your profile." } },
    ],
  });

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-up">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">
          <span style={{ color: navy }}>Biruni</span><span style={{ color: gold }}>Map</span>
        </h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase">Inspired by Al-Biruni · Est. 973 CE</p>
      </div>

      {/* Al-Biruni */}
      <Section>
        <BilingualBlock
          enTitle="Inspired by Al-Biruni"
          faTitle="الهام از ابوریحان بیرونی"
          en={<HtmlContent html={content.about_biruni_en} />}
          fa={<HtmlContent html={content.about_biruni_fa} dir="rtl" />}
        />
      </Section>

      {/* Our Story */}
      <Section>
        <BilingualBlock
          enTitle="Our Story"
          faTitle="داستان ما"
          en={<HtmlContent html={content.about_story_en} />}
          fa={<HtmlContent html={content.about_story_fa} dir="rtl" />}
        />
      </Section>

      {/* Vision & Mission */}
      <Section>
        <BilingualBlock
          enTitle="Our Vision & Mission"
          faTitle="چشم‌انداز و مأموریت ما"
          en={
            <>
              <p className="font-semibold" style={{ color: navy }}>Vision</p>
              <HtmlContent html={content.about_vision_en} />
              <p className="font-semibold mt-5" style={{ color: navy }}>Mission</p>
              <HtmlContent html={content.about_mission_en} />
            </>
          }
          fa={
            <>
              <p className="font-semibold" style={{ color: navy }}>چشم‌انداز</p>
              <HtmlContent html={content.about_vision_fa} dir="rtl" />
              <p className="font-semibold mt-5" style={{ color: navy }}>مأموریت</p>
              <HtmlContent html={content.about_mission_fa} dir="rtl" />
            </>
          }
        />
      </Section>

      {/* Founder message */}
      <section className="rounded-3xl p-8 mb-6 text-white" style={{ background: `linear-gradient(135deg, ${dark} 0%, ${navy} 100%)` }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest mb-4 opacity-50">Founder&apos;s Message</p>
            <blockquote className="text-blue-100 leading-relaxed text-sm italic mb-5">
              &ldquo;{content.about_founder_quote_en}&rdquo;
            </blockquote>
            <p className="text-white font-semibold text-sm">— {content.about_founder_name}</p>
          </div>
          <div dir="rtl">
            <p className="text-xs uppercase tracking-widest mb-4 opacity-50">پیام بنیان‌گذار</p>
            <blockquote className="text-blue-100 leading-relaxed text-sm mb-5">
              «{content.about_founder_quote_fa}»
            </blockquote>
            <p className="text-white font-semibold text-sm">— {content.about_founder_name_fa}</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <Section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-bold" style={{ color: navy }}>The Team</h2>
          <span className="text-lg font-bold" dir="rtl" style={{ color: navy, fontFamily: "'Vazirmatn', sans-serif" }}>/ تیم ما</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

          <a href="https://afshin.ch" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 hover:border-[#1B3A6B] hover:shadow-sm transition-all group">
            <Image src="/team/afshin.jpg" alt="Afshin Khosroshahi"
              width={56} height={56}
              className="w-14 h-14 rounded-full object-cover mb-3"
              style={{ filter: "grayscale(100%)" }} />
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1B3A6B]">Afshin Khosroshahi</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: gold }}>Founder</p>
            <p className="text-xs text-gray-400 mt-0.5">afshin.ch ↗</p>
          </a>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100">
            <Image src="/team/Atefeh Mohammadi.png" alt="Atefeh Mohammadi"
              width={56} height={56}
              className="w-14 h-14 rounded-full object-cover mb-3"
              style={{ filter: "grayscale(100%)" }} />
            <p className="text-sm font-semibold text-gray-900">Atefeh Mohammadi</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: gold }}>UI/UX Manager</p>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-2 flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex -space-x-2 shrink-0">
              {["#8B1A1A","#1B3A6B","#C9A84C","#5B7FA6","#2D6A4F"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white"
                  style={{ backgroundColor: c }}>♥</div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">+10 Active Admins</p>
              <p className="text-xs text-gray-500">Iranians around the world who manage, curate and grow this community.</p>
            </div>
          </div>

        </div>
      </Section>

      {/* FAQ — bilingual accordion */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10">
          {/* English FAQ */}
          <FaqBlock lang="en" title="Frequently Asked Questions" items={[
            { q: "What is BiruniMap?", a: "BiruniMap is a community platform for the Iranian diaspora — a map of Iranian-owned businesses worldwide, a calendar of Iranian community events, and a blog sharing stories and information from across the community." },
            { q: "Which countries are covered?", a: "BiruniMap covers businesses across Europe, North America, Australia and beyond. We are continuously expanding our coverage as our community grows." },
            { q: "How do I add my business?", a: "Fill in the submission form on our Get Listed page. Our team reviews every submission and publishes approved listings within a few days." },
            { q: "Is BiruniMap free to use?", a: "Yes. Discovering and listing businesses on BiruniMap is completely free for the Iranian community." },
            { q: "Who runs BiruniMap?", a: "BiruniMap is run by a small team of Iranians abroad, supported by a network of +10 volunteer admins across different countries. It was founded by Afshin Khosroshahi." },
            { q: "Can I manage my own business listing?", a: "Yes. When you submit your business, check the owner option and create a BiruniMap account. Once approved, you can update your listing directly from your profile." },
          ]} />
          {/* Farsi FAQ */}
          <div className="border-t border-gray-100 mt-8 pt-8 md:border-t-0 md:mt-0 md:pt-0 md:border-l md:pl-10">
            <FaqBlock lang="fa" title="سوالات متداول" items={[
              { q: "بیرونی‌مپ چیست؟", a: "بیرونی‌مپ یک پلتفرم اجتماعی برای ایرانیان خارج از کشور است — نقشه‌ای از کسب‌وکارهای ایرانی در سراسر جهان، تقویمی از رویدادهای اجتماعی ایرانیان و یک وبلاگ برای اشتراک‌گذاری داستان‌ها و اطلاعات." },
              { q: "کدام کشورها پوشش داده می‌شوند؟", a: "بیرونی‌مپ کسب‌وکارهایی در اروپا، آمریکای شمالی، استرالیا و فراتر از آن را پوشش می‌دهد. ما به‌طور مستمر در حال گسترش هستیم." },
              { q: "چگونه کسب‌وکارم را اضافه کنم؟", a: "فرم ثبت‌نام را در صفحه «ثبت کسب‌وکار» پر کنید. تیم ما هر درخواست را بررسی می‌کند و فهرست‌های تأیید شده را ظرف چند روز منتشر می‌کند." },
              { q: "آیا بیرونی‌مپ رایگان است؟", a: "بله. کشف و ثبت کسب‌وکارها در بیرونی‌مپ برای جامعه ایرانی کاملاً رایگان است." },
              { q: "چه کسی بیرونی‌مپ را اداره می‌کند؟", a: "بیرونی‌مپ توسط یک تیم کوچک از ایرانیان خارج از کشور، با پشتیبانی شبکه‌ای از بیش از ۱۰ مدیر داوطلب اداره می‌شود. این پروژه توسط افشین خسروشاهی تأسیس شده است." },
              { q: "آیا می‌توانم فهرست کسب‌وکارم را مدیریت کنم؟", a: "بله. هنگام ثبت کسب‌وکارتان، گزینه مالکیت را انتخاب کنید. پس از تأیید، می‌توانید فهرست خود را مستقیماً از پروفایلتان به‌روزرسانی کنید." },
            ]} />
          </div>
        </div>
      </Section>

      {/* Join us */}
      <section className="rounded-3xl p-8 mb-6" style={{ background: `linear-gradient(135deg, ${dark} 0%, ${navy} 100%)` }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* English side */}
          <div>
            <h2 className="text-lg font-bold text-white mb-5">Want to help build BiruniMap?</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all text-white font-semibold text-sm">
                🤝 Join Us
              </Link>
              <Link href="/get-listed"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all text-white font-semibold text-sm">
                🗺️ Add Business
              </Link>
              <Link href="/events/submit"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all text-white font-semibold text-sm">
                📅 Add Event
              </Link>
            </div>
          </div>

          {/* Persian side */}
          <div dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            <h2 className="text-lg font-bold text-white mb-5">می‌خواهی در ساخت بیرونی‌مپ کمک کنی؟</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all text-white font-semibold text-sm">
                🤝 به ما بپیوند
              </Link>
              <Link href="/get-listed"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all text-white font-semibold text-sm">
                🗺️ اضافه کردن کسب‌وکار
              </Link>
              <Link href="/events/submit"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all text-white font-semibold text-sm">
                📅 اضافه کردن رویداد
              </Link>
            </div>
          </div>

        </div>
      </section>

    </main>
    </>
  );
}
