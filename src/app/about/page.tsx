import Link from "next/link";

const navy = "#1B3A6B";
const gold  = "#C9A84C";
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

export default function AboutPage() {
  return (
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
          en={
            <>
              <p>
                Abu Rayhan al-Biruni (973–1048 CE) was one of history's greatest minds — a Persian scholar who
                mastered astronomy, mathematics, geography and anthropology at a time when the world was still
                largely unmapped. He travelled far, learned languages, and dedicated his life to understanding
                and documenting the diversity of human civilisation.
              </p>
              <p>
                His curiosity, his respect for every culture he encountered, and his belief that knowledge
                belongs to everyone — these are the values that inspired us to build BiruniMap: a living,
                growing map of the Iranian diaspora, connecting people, businesses and communities across the globe.
              </p>
            </>
          }
          fa={
            <>
              <p>
                ابوریحان بیرونی (۳۵۰–۴۲۷ هجری شمسی) یکی از بزرگ‌ترین اندیشمندان تاریخ بود — دانشمند ایرانی‌ای که
                در ستاره‌شناسی، ریاضیات، جغرافیا و مردم‌شناسی سرآمد روزگار خود بود. او به سرزمین‌های دور سفر کرد،
                زبان‌های بیگانه آموخت و عمرش را وقف شناخت و ثبت تنوع تمدن‌های بشری کرد.
              </p>
              <p>
                کنجکاوی او، احترامش به هر فرهنگی که با آن روبرو می‌شد، و ایمانش به اینکه دانش متعلق به همه است —
                این ارزش‌ها ما را برانگیخت تا بیرونی‌مپ را بسازیم: نقشه‌ای زنده و رو به رشد از ایرانیان جهان
                که مردم، کسب‌وکارها و جوامع را در سراسر دنیا به هم پیوند می‌دهد.
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
                BiruniMap began in Zurich, Switzerland — born out of a small group of Iranian students who were
                trying to help each other settle into life abroad. Finding a store that sold saffron and dried limes,
                a doctor who spoke Farsi, a lawyer who understood where you came from — things that sound simple,
                but make an enormous difference when you are far from home.
              </p>
              <p>
                That need became a mission. We started mapping Iranian-owned businesses across Switzerland, then
                expanded to Europe, and we will keep growing — city by city, country by country — until every
                Iranian living abroad can find their community, no matter where in the world they are.
              </p>
            </>
          }
          fa={
            <>
              <p>
                بیرونی‌مپ در زوریخ سوئیس متولد شد — از دل یک گروه کوچک از دانشجویان ایرانی که سعی می‌کردند
                به یکدیگر در سازگاری با زندگی در خارج کمک کنند. پیدا کردن مغازه‌ای که زعفران و لیمو عمانی بفروشد،
                دکتری که فارسی بداند، وکیلی که بفهمد از کجا آمده‌ای — چیزهایی که ساده به نظر می‌رسند،
                اما وقتی دور از خانه‌ای تفاوت بزرگی می‌سازند.
              </p>
              <p>
                آن نیاز به یک مأموریت تبدیل شد. ما شروع به نقشه‌برداری از کسب‌وکارهای ایرانی در سراسر سوئیس کردیم،
                سپس به اروپا گسترش یافتیم، و به رشد ادامه خواهیم داد — شهر به شهر، کشور به کشور —
                تا هر ایرانی مقیم خارج بتواند جامعه خود را، هر کجای دنیا که باشد، بیابد.
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
              <p>
                A world where every Iranian abroad feels seen, connected and supported — and where Iranian
                culture, entrepreneurship and talent thrive in every corner of the globe.
              </p>
              <p className="font-semibold mt-5" style={{ color: navy }}>Mission</p>
              <ul className="space-y-3 mt-1">
                <li className="flex gap-3">
                  <span className="shrink-0 font-bold" style={{ color: gold }}>①</span>
                  <span>Make Iranian businesses visible — so they can be found, supported and celebrated by the global Iranian community.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 font-bold" style={{ color: gold }}>②</span>
                  <span>Bring the community to life through events — encouraging Iranians to meet, celebrate and stay connected wherever they live.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 font-bold" style={{ color: gold }}>③</span>
                  <span>Help newcomers land on their feet — by gathering local knowledge, useful services and community information in one place.</span>
                </li>
              </ul>
            </>
          }
          fa={
            <>
              <p className="font-semibold" style={{ color: navy }}>چشم‌انداز</p>
              <p>
                دنیایی که در آن هر ایرانی مقیم خارج احساس کند دیده می‌شود، در ارتباط است و پشتیبانی دارد —
                و فرهنگ، کارآفرینی و استعداد ایرانی در هر گوشه‌ای از جهان بالنده است.
              </p>
              <p className="font-semibold mt-5" style={{ color: navy }}>مأموریت</p>
              <ul className="space-y-3 mt-1">
                <li className="flex gap-3">
                  <span className="shrink-0 font-bold" style={{ color: gold }}>①</span>
                  <span>دیده‌شدن کسب‌وکارهای ایرانی — تا جامعه جهانی ایرانیان بتواند آن‌ها را پیدا، حمایت و تحسین کند.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 font-bold" style={{ color: gold }}>②</span>
                  <span>زنده نگه داشتن جامعه از طریق رویدادها — تشویق ایرانیان به دیدار، جشن و ارتباط، هر جا که زندگی می‌کنند.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 font-bold" style={{ color: gold }}>③</span>
                  <span>کمک به تازه‌واردها برای شروعی آسان‌تر — با جمع‌آوری اطلاعات محلی، خدمات مفید و دانش جامعه در یک مکان.</span>
                </li>
              </ul>
            </>
          }
        />
      </Section>

      {/* Founder message */}
      <section className="rounded-3xl p-8 mb-6 text-white" style={{ background: `linear-gradient(135deg, ${dark} 0%, ${navy} 100%)` }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest mb-4 opacity-50">Founder's Message</p>
            <blockquote className="text-blue-100 leading-relaxed text-sm italic mb-5">
              "I started this platform with love for Iran and for every Iranian who carries that same love with them — wherever life has taken them."
            </blockquote>
            <p className="text-white font-semibold text-sm">— Afshin Khosroshahi</p>
          </div>
          <div dir="rtl">
            <p className="text-xs uppercase tracking-widest mb-4 opacity-50">پیام بنیان‌گذار</p>
            <blockquote className="text-blue-100 leading-relaxed text-sm mb-5">
              «این پلتفرم را با عشق به ایران ساختم — و برای هر ایرانی که همین عشق را با خود حمل می‌کند،
              هر کجا که زندگی او را برده باشد.»
            </blockquote>
            <p className="text-white font-semibold text-sm">— افشین خسروشاهی</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <Section>
        <h2 className="text-lg font-bold mb-6" style={{ color: navy }}>The Team / تیم</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

          <a href="https://afshin.ch" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 hover:border-[#1B3A6B] hover:shadow-sm transition-all group">
            <img src="/team/afshin.jpg" alt="Afshin Khosroshahi"
              className="w-14 h-14 rounded-full object-cover mb-3"
              style={{ filter: "grayscale(100%)" }} />
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1B3A6B]">Afshin Khosroshahi</p>
            <p className="text-xs text-gray-400 mt-0.5">afshin.ch ↗</p>
          </a>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3"
              style={{ backgroundColor: "#5B7FA6" }}>AT</div>
            <p className="text-sm font-semibold text-gray-900">Atefeh</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 bg-gray-50 text-gray-300">+</div>
            <p className="text-sm text-gray-300">Coming soon</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 bg-gray-50 text-gray-300">+</div>
            <p className="text-sm text-gray-300">Coming soon</p>
          </div>

          <div className="col-span-2 sm:col-span-3 md:col-span-4 flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 mt-2">
            <div className="flex -space-x-2 shrink-0">
              {["#8B1A1A","#1B3A6B","#C9A84C","#5B7FA6","#2D6A4F"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white"
                  style={{ backgroundColor: c }}>♥</div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">+1,000 Volunteers</p>
              <p className="text-xs text-gray-500">Iranians around the world who contribute, share and keep this community alive.</p>
            </div>
          </div>

        </div>
      </Section>

      {/* Join us */}
      <section className="rounded-3xl p-8 mb-6 text-center" style={{ background: `linear-gradient(135deg, ${dark} 0%, ${navy} 100%)` }}>
        <h2 className="text-xl font-bold text-white mb-2">Want to help build BiruniMap?</h2>
        <p className="text-blue-200 text-sm mb-8 max-w-lg mx-auto">
          Every contribution — big or small — makes this community stronger. Pick what fits you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link href="/contact"
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-5 transition-all group">
            <span className="text-2xl">🤝</span>
            <p className="text-white font-bold text-sm">Join Us</p>
            <p className="text-blue-200 text-xs">Help us grow the platform as a volunteer or contributor</p>
          </Link>
          <Link href="/get-listed"
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-5 transition-all group">
            <span className="text-2xl">🗺️</span>
            <p className="text-white font-bold text-sm">Add to Map</p>
            <p className="text-blue-200 text-xs">Own or know an Iranian business? Put it on the map</p>
          </Link>
          <Link href="/events/submit"
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-5 transition-all group">
            <span className="text-2xl">📅</span>
            <p className="text-white font-bold text-sm">Submit Event</p>
            <p className="text-blue-200 text-xs">Organising an event? Share it and get more people to show up</p>
          </Link>
        </div>
      </section>

    </main>
  );
}
