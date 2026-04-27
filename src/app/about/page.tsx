import Link from "next/link";

const navy  = "#1B3A6B";
const gold  = "#C9A84C";
const red   = "#8B1A1A";
const dark  = "#0D1B2E";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
      {/* English — left */}
      <div>
        <h2 className="text-lg font-bold mb-3" style={{ color: navy }}>{enTitle}</h2>
        <div className="text-gray-600 leading-relaxed text-sm space-y-3">{en}</div>
      </div>
      {/* Persian — right */}
      <div className="border-t border-gray-100 mt-6 pt-6 md:border-t-0 md:mt-0 md:pt-0 md:border-l md:pl-8" dir="rtl">
        <h2 className="text-lg font-bold mb-3" style={{ color: navy }}>{faTitle}</h2>
        <div className="text-gray-600 leading-relaxed text-sm space-y-3">{fa}</div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-up">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">
          <span style={{ color: navy }}>Biruni</span><span style={{ color: gold }}>Map</span>
        </h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase">Inspired by Al-Biruni · Est. 973 CE</p>
      </div>

      {/* Al-Biruni Introduction */}
      <Section>
        <BilingualBlock
          enTitle="Inspired by Al-Biruni"
          faTitle="الهام از ابوریحان بیرونی"
          en={
            <>
              <p>
                Abu Rayhan al-Biruni (973–1048 CE) was one of the greatest scholars of the medieval Islamic world —
                a polymath who studied astronomy, mathematics, geography, history and anthropology.
                He spent his life mapping the world, documenting cultures, and connecting knowledge across civilisations.
              </p>
              <p>
                His spirit of curiosity, openness and community inspired us to build BiruniMap:
                a living map of the Iranian diaspora that connects people, businesses and cultures across the globe.
              </p>
            </>
          }
          fa={
            <>
              <p>
                ابوریحان بیرونی (۳۶۲–۴۴۰ هجری قمری) یکی از بزرگ‌ترین دانشمندان جهان اسلام بود —
                دانشمندی که ستاره‌شناسی، ریاضیات، جغرافیا، تاریخ و مردم‌شناسی را بررسی کرد
                و عمرش را صرف نقشه‌برداری از جهان و مستندسازی فرهنگ‌ها کرد.
              </p>
              <p>
                روح کنجکاوی، گشاده‌نظری و همبستگی او ما را برانگیخت تا بیرونی‌مپ را بسازیم:
                نقشه‌ای زنده از ایرانیان جهان که مردم، کسب‌وکارها و فرهنگ‌ها را به هم پیوند می‌دهد.
              </p>
            </>
          }
        />
      </Section>

      {/* Our Story */}
      <Section>
        <BilingualBlock
          enTitle="Our Story"
          faTitle="داستان ما"
          en={
            <>
              <p>
                BiruniMap started in Zurich, Switzerland — in a small student group of Iranians who wanted to help
                each other navigate life in a new country: finding a Persian grocery, a Farsi-speaking doctor,
                or just a familiar face.
              </p>
              <p>
                That simple idea grew into a platform. We began mapping Iranian businesses across Switzerland,
                then Europe, and we plan to keep growing — city by city, country by country —
                until every Iranian abroad can find their community wherever they are in the world.
              </p>
            </>
          }
          fa={
            <>
              <p>
                بیرونی‌مپ در زوریخ سوئیس آغاز شد — در یک گروه کوچک دانشجویی از ایرانیانی که می‌خواستند
                به یکدیگر در زندگی در کشور جدید کمک کنند: پیدا کردن یک سوپرمارکت ایرانی،
                یک دکتر فارسی‌زبان، یا فقط یک چهره آشنا.
              </p>
              <p>
                آن ایده ساده به یک پلتفرم تبدیل شد. ما شروع به نقشه‌برداری از کسب‌وکارهای ایرانی
                در سراسر سوئیس و سپس اروپا کردیم، و برنامه داریم به رشد ادامه دهیم —
                شهر به شهر، کشور به کشور — تا هر ایرانی در خارج بتواند جامعه خود را بیابد.
              </p>
            </>
          }
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
              <p>Empower Iranian communities around the world to stay connected, visible and thriving.</p>
              <p className="font-semibold mt-4" style={{ color: navy }}>Mission</p>
              <ul className="space-y-2">
                <li className="flex gap-2"><span style={{ color: gold }}>①</span><span>Support Iranian businesses by presenting them and making them more visible to the global community.</span></li>
                <li className="flex gap-2"><span style={{ color: gold }}>②</span><span>Promote events and encourage people to organise more, keeping the community dynamic and alive.</span></li>
                <li className="flex gap-2"><span style={{ color: gold }}>③</span><span>Gather and present information about cities and services to help newcomers get onboarded faster.</span></li>
              </ul>
            </>
          }
          fa={
            <>
              <p className="font-semibold" style={{ color: navy }}>چشم‌انداز</p>
              <p>توانمندسازی جوامع ایرانی در سراسر جهان برای ماندن در ارتباط، دیده شدن و شکوفایی.</p>
              <p className="font-semibold mt-4" style={{ color: navy }}>مأموریت</p>
              <ul className="space-y-2">
                <li className="flex gap-2 flex-row-reverse text-right"><span style={{ color: gold }}>①</span><span>حمایت از کسب‌وکارهای ایرانی با معرفی آن‌ها و افزایش دیده‌شدنشان در جامعه جهانی.</span></li>
                <li className="flex gap-2 flex-row-reverse text-right"><span style={{ color: gold }}>②</span><span>ترویج رویدادها و تشویق مردم به برگزاری بیشتر آن‌ها تا جامعه پویا و زنده بماند.</span></li>
                <li className="flex gap-2 flex-row-reverse text-right"><span style={{ color: gold }}>③</span><span>جمع‌آوری و ارائه اطلاعات درباره شهرها و خدمات برای کمک به تازه‌واردها در آشنایی سریع‌تر.</span></li>
              </ul>
            </>
          }
        />
      </Section>

      {/* Founder message */}
      <section className="rounded-3xl p-8 mb-6 text-white" style={{ background: `linear-gradient(135deg, ${dark} 0%, ${navy} 100%)` }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest mb-4 opacity-60">Founder's Message</p>
            <blockquote className="text-blue-100 leading-relaxed text-sm italic mb-4">
              "I started this platform with love for Iran and for fellow Iranians who share the same love."
            </blockquote>
            <p className="text-white font-semibold text-sm">— Afshin Khosroshahi</p>
          </div>
          <div dir="rtl">
            <p className="text-xs uppercase tracking-widest mb-4 opacity-60">پیام بنیان‌گذار</p>
            <blockquote className="text-blue-100 leading-relaxed text-sm italic mb-4">
              "این پلتفرم را با عشق به ایران و به ایرانیانی که همین عشق را دارند ساختم."
            </blockquote>
            <p className="text-white font-semibold text-sm">— افشین خسروشاهی</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <Section>
        <h2 className="text-lg font-bold mb-6" style={{ color: navy }}>The Team / تیم</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

          {/* Afshin */}
          <a href="https://afshin.ch" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 hover:border-[#1B3A6B] hover:shadow-sm transition-all group">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 font-bold text-white"
              style={{ backgroundColor: navy }}>A</div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1B3A6B]">Afshin Khosroshahi</p>
            <p className="text-xs text-gray-400 mt-0.5">Founder · afshin.ch ↗</p>
          </a>

          {/* Atefeh */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 font-bold text-white"
              style={{ backgroundColor: "#5B7FA6" }}>A</div>
            <p className="text-sm font-semibold text-gray-900">Atefeh</p>
            <p className="text-xs text-gray-400 mt-0.5">Co-founder</p>
          </div>

          {/* Empty slot 1 */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 bg-gray-50 text-gray-300">+</div>
            <p className="text-sm text-gray-300">Coming soon</p>
          </div>

          {/* Empty slot 2 */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 bg-gray-50 text-gray-300">+</div>
            <p className="text-sm text-gray-300">Coming soon</p>
          </div>

          {/* Volunteers */}
          <div className="col-span-2 sm:col-span-3 md:col-span-4 flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 mt-2">
            <div className="flex -space-x-2 shrink-0">
              {["#8B1A1A","#1B3A6B","#C9A84C","#5B7FA6","#2D6A4F"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                  style={{ backgroundColor: c }}>♥</div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">+1,000 Volunteers</p>
              <p className="text-xs text-gray-500">Iranians around the world who contribute, share and support.</p>
            </div>
          </div>

        </div>
      </Section>

      {/* Accuracy note */}
      <section className="bg-amber-50 border border-amber-100 rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-start gap-4">
        <span className="text-2xl shrink-0">📌</span>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1 text-sm">A Note on Our Listings</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Many listings were discovered with the help of AI and may occasionally be outdated.
            If you spot an error, please let us know — it takes two minutes and helps everyone.
          </p>
          <Link href="/contact" className="inline-block mt-3 text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ backgroundColor: navy }}>
            Report an Issue →
          </Link>
        </div>
      </section>

    </main>
  );
}
