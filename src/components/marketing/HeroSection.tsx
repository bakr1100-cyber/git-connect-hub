import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HeartPulse, Play, Sparkles, Star, Users } from "lucide-react";
import applicant1 from "@/assets/applicant-lukas-cutout.png";
import applicant2 from "@/assets/applicant-elena-cutout.png";
import applicant3 from "@/assets/applicant-amara-cutout.png";
import applicant4 from "@/assets/applicant-youssef-cutout.png";

type ExperienceItem = { role: string; company: string; period: string; bullets: string[] };
type EducationItem = { degree: string; school: string; period: string };

type Applicant = {
  id: string;
  name: string;
  role: string;
  photo: string;
  /** Card background + accent classes for the floating resume mockup. */
  paper: string;
  ink: string;
  rule: string;
  bar: string;
  headline: string;
  target: string;
  targetIcon?: boolean;
  badgePrimary: string;
  badgeSecondary: string;
  contact: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  labels: { profile: string; experience: string; education: string; skills: string };
  localeTag: string;
  documentDir?: "ltr" | "rtl";
  showTarget?: boolean;
};

const DE_LABELS = {
  profile: "Profil",
  experience: "Berufserfahrung",
  education: "Ausbildung",
  skills: "Kenntnisse",
};

const PL_LABELS = { profile: "Profil zawodowy", experience: "Doświadczenie", education: "Wykształcenie", skills: "Umiejętności" };
const EN_LABELS = { profile: "Profile", experience: "Work experience", education: "Education", skills: "Skills" };

const APPLICANTS: Applicant[] = [
  {
    id: "a1",
    name: "Lukas Berger",
    role: "Fachkraft IT",
    photo: applicant1,
    paper: "bg-white",
    ink: "text-emerald-900",
    rule: "bg-emerald-800",
    bar: "bg-emerald-900/15",
    headline: "Lebenslauf",
    target: "Systemadministrator (m/w/d)",
    badgePrimary: "ATS-GEPRÜFT (94%)",
    badgeSecondary: "Fachkraft IT",
    contact: "Wien, AT · lukas.berger@mail.com · +43 660 112 233",
    summary:
      "IT-Fachkraft mit 6 Jahren Erfahrung in Linux-Administration, Netzwerksicherheit und Automatisierung.",
    experience: [
      {
        role: "Systemadministrator",
        company: "NordCloud GmbH",
        period: "2021 – heute",
        bullets: ["Betrieb von 120+ Linux-Servern", "Ausfallzeit um 38 % reduziert"],
      },
      {
        role: "IT-Support Specialist",
        company: "Alpen Systems",
        period: "2018 – 2021",
        bullets: ["2nd-Level-Support für 400 Nutzer"],
      },
    ],
    education: [
      { degree: "B.Sc. Informatik", school: "TU Wien", period: "2014 – 2018" },
    ],
    skills: ["Linux", "Kubernetes", "Bash", "Zabbix", "Deutsch C1", "Englisch B2"],
    labels: DE_LABELS,
    localeTag: "DEUTSCH",
  },
  {
    id: "a2",
    name: "Elena Nowak",
    role: "Projektmanagement",
    photo: applicant2,
    paper: "bg-[#fdf3ef]",
    ink: "text-rose-900",
    rule: "bg-rose-400",
    bar: "bg-rose-900/12",
    headline: "Życiorys",
    target: "Kierowniczka projektu",
    badgePrimary: "92 / 100 MATCH",
    badgeSecondary: "Projektmanagement",
    contact: "Kraków, PL · elena.nowak@mail.com · +48 512 884 190",
    summary:
      "Zertifizierte Projektmanagerin (PMP) mit Schwerpunkt auf agilen Transformationen in internationalen Teams.",
    experience: [
      {
        role: "Senior Project Manager",
        company: "Vistula Consulting",
        period: "2020 – heute",
        bullets: ["Budgetverantwortung 2,4 Mio. €", "14 Projekte termingerecht geliefert"],
      },
      {
        role: "Junior Projektmanagerin",
        company: "Baltic Retail Group",
        period: "2017 – 2020",
        bullets: ["Rollout in 5 Ländern koordiniert"],
      },
    ],
    education: [
      { degree: "M.A. Management", school: "Uniwersytet Jagielloński", period: "2012 – 2017" },
    ],
    skills: ["Scrum", "PMP", "Jira", "Stakeholder-Mgmt", "Deutsch B2", "Englisch C1"],
    labels: PL_LABELS,
    localeTag: "POLSKI",
  },
  {
    id: "a3",
    name: "Amara Okafor",
    role: "Marketing Manager",
    photo: applicant3,
    paper: "bg-white",
    ink: "text-blue-900",
    rule: "bg-blue-700",
    bar: "bg-blue-900/12",
    headline: "Curriculum Vitae",
    target: "Marketing Manager",
    badgePrimary: "Perfektes Match",
    badgeSecondary: "Marketing Manager",
    contact: "London, UK · amara.okafor@mail.com · +44 7700 900 214",
    summary:
      "Marketing Managerin mit Fokus auf Performance-Kampagnen, Content-Strategie und Employer Branding.",
    experience: [
      {
        role: "Marketing Manager",
        company: "Elbe Digital AG",
        period: "2021 – heute",
        bullets: ["Leads um 61 % gesteigert", "Team von 4 Personen geführt"],
      },
      {
        role: "Campaign Specialist",
        company: "Nordlicht Media",
        period: "2018 – 2021",
        bullets: ["SEA-Budget von 600 T€ verantwortet"],
      },
    ],
    education: [
      { degree: "B.A. Kommunikation", school: "Universität Hamburg", period: "2015 – 2018" },
    ],
    skills: ["SEO/SEA", "HubSpot", "Analytics", "Copywriting", "Deutsch C2", "Englisch C1"],
    labels: EN_LABELS,
    localeTag: "ENGLISH",
  },
  {
    id: "a4",
    name: "Youssef El Amrani",
    role: "Pflegefachmann",
    photo: applicant4,
    paper: "bg-[#f0f9f6]",
    ink: "text-teal-900",
    rule: "bg-teal-600",
    bar: "bg-sky-900/12",
    headline: "Lebenslauf",
    target: "Ausbildung zum Pflegefachmann",
    targetIcon: true,
    badgePrimary: "Visum & Dokumente bereit",
    badgeSecondary: "Deutsch B2 zertifiziert",
    contact: "Casablanca, MA · y.elamrani@mail.com · +212 661 004 512",
    summary:
      "Pflegekraft mit 4 Jahren Klinikerfahrung, anerkennungsbereite Dokumente und Sprachzertifikat B2.",
    experience: [
      {
        role: "Pflegekraft Innere Medizin",
        company: "CHU Ibn Rochd",
        period: "2020 – heute",
        bullets: ["Betreuung von 18 Patienten pro Schicht", "Einarbeitung neuer Kolleg:innen"],
      },
      {
        role: "Praktikum Intensivstation",
        company: "Clinique Al Madina",
        period: "2019 – 2020",
        bullets: ["Monitoring & Dokumentation"],
      },
    ],
    education: [
      { degree: "Diplom Krankenpflege", school: "ISPITS Casablanca", period: "2016 – 2019" },
    ],
    skills: ["Grundpflege", "Monitoring", "Dokumentation", "Deutsch B2", "Französisch C1"],
    labels: DE_LABELS,
    localeTag: "DEUTSCH",
    showTarget: true,
  },
];

const CYCLE_MS = 4000;

function ResumeMockup({ applicant, active }: { applicant: Applicant; active: boolean }) {
  const { labels } = applicant;
  return (
    <div
      className={[
        "absolute inset-0 transition-all duration-1000 ease-out",
        active ? "opacity-100 scale-100 translate-y-0" : "pointer-events-none opacity-0 scale-95 translate-y-4",
      ].join(" ")}
      aria-hidden={!active}
    >
      {/* Background layer: tilted 3D resume document, full sections */}
      <div
        className={[
          "absolute bottom-[4%] right-[1%] top-[2%] w-[84%] overflow-hidden rounded-2xl border border-white/60 px-5 py-4 shadow-2xl",
          applicant.paper,
        ].join(" ")}
        style={{ transform: "perspective(1400px) rotateY(-11deg) rotateX(6deg)" }}
        dir={applicant.documentDir ?? "ltr"}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={["text-[9px] font-bold uppercase tracking-[0.2em] opacity-70", applicant.ink].join(" ")}>
              {applicant.headline}
            </div>
            <div className={["mt-1 inline-flex rounded-full border border-current/15 px-2 py-0.5 text-[7px] font-bold", applicant.ink].join(" ")}>
              {applicant.localeTag}
            </div>
            <div className={["mt-1 text-lg font-bold tracking-tight sm:text-xl", applicant.ink].join(" ")}>
              {applicant.name}
            </div>
            <div className="select-none blur-[3px]" aria-hidden="true">
              <div className={["mt-1 truncate text-[8px] opacity-70 sm:text-[9px]", applicant.ink].join(" ")}>
                {applicant.contact}
              </div>
            </div>
            <div className={["mt-1.5 flex items-center gap-1.5", applicant.showTarget ? "" : "select-none blur-[3px]"].join(" ")} aria-hidden={!applicant.showTarget}>
              {applicant.targetIcon && <HeartPulse className={["h-3 w-3 shrink-0", applicant.ink].join(" ")} />}
              <span className={["text-[10px] font-semibold sm:text-[11px]", applicant.ink].join(" ")}>
                {applicant.target}
              </span>
            </div>
          </div>
          {/* Bewerbungsfoto im Lebenslauf */}
          <img
            src={applicant.photo}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1024}
            height={1024}
            className="h-16 w-[3.3rem] shrink-0 rounded-md border border-black/10 bg-white object-cover object-top shadow-sm sm:h-20 sm:w-16"
          />
        </div>


        <div className={["mt-2 h-[3px] w-full rounded", applicant.rule].join(" ")} />

        {/* Profile */}
        <div className="mt-2.5">
          <div className={["text-[8px] font-bold uppercase tracking-[0.16em]", applicant.ink].join(" ")}>
            {labels.profile}
          </div>
          <p aria-hidden="true" className={["mt-1 select-none text-[8.5px] leading-snug opacity-70 blur-[2.5px] sm:text-[9.5px]", applicant.ink].join(" ")}>
            {applicant.summary}
          </p>
        </div>

        {/* Experience */}
        <div className="mt-2.5">
          <div className={["text-[8px] font-bold uppercase tracking-[0.16em]", applicant.ink].join(" ")}>
            {labels.experience}
          </div>
          <div className={["mt-0.5 h-[2px] w-8 rounded", applicant.rule].join(" ")} />
          <div aria-hidden="true" className="mt-1.5 select-none space-y-1.5 opacity-75 blur-[2.5px]">
            {applicant.experience.map((item) => (
              <div key={`${item.company}-${item.period}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className={["text-[9px] font-bold sm:text-[10px]", applicant.ink].join(" ")}>
                    {item.role}
                  </span>
                  <span className={["shrink-0 text-[8px] opacity-70", applicant.ink].join(" ")}>{item.period}</span>
                </div>
                <div className={["text-[8.5px] italic opacity-75", applicant.ink].join(" ")}>{item.company}</div>
                <ul className="mt-0.5 space-y-0.5">
                  {item.bullets.map((b) => (
                    <li
                      key={b}
                      className={["flex gap-1 text-[8px] leading-snug opacity-80 sm:text-[9px]", applicant.ink].join(" ")}
                    >
                      <span className="opacity-60">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mt-2.5">
          <div className={["text-[8px] font-bold uppercase tracking-[0.16em]", applicant.ink].join(" ")}>
            {labels.education}
          </div>
          <div className={["mt-0.5 h-[2px] w-8 rounded", applicant.rule].join(" ")} />
          <div aria-hidden="true" className="select-none opacity-75 blur-[2.5px]">
          {applicant.education.map((edu) => (
            <div key={edu.school} className="mt-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className={["text-[9px] font-bold sm:text-[10px]", applicant.ink].join(" ")}>{edu.degree}</span>
                <span className={["shrink-0 text-[8px] opacity-70", applicant.ink].join(" ")}>{edu.period}</span>
              </div>
              <div className={["text-[8.5px] italic opacity-75", applicant.ink].join(" ")}>{edu.school}</div>
            </div>
          ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mt-2.5">
          <div className={["text-[8px] font-bold uppercase tracking-[0.16em]", applicant.ink].join(" ")}>
            {labels.skills}
          </div>
          <div aria-hidden="true" className="mt-1.5 flex select-none flex-wrap gap-1 opacity-70 blur-[2px]">
            {applicant.skills.map((skill) => (
              <span
                key={skill}
                className={[
                  "rounded-full px-1.5 py-0.5 text-[7.5px] font-semibold sm:text-[8.5px]",
                  applicant.bar,
                  applicant.ink,
                ].join(" ")}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <img
        src={applicant.photo}
        alt={`${applicant.name} — ${applicant.role}`}
        loading={active ? "eager" : "lazy"}
        width={1024}
        height={1408}
        className="pointer-events-none absolute -left-[6%] top-[4%] z-10 h-[118%] w-auto max-w-none object-contain object-top drop-shadow-2xl sm:-left-[10%] sm:h-[124%]"
      />


      {/* UI badge layer */}
      <div className="absolute right-[3%] top-[5%] z-20 rounded-full border border-emerald-400/40 bg-slate-800/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200 shadow-xl backdrop-blur-md sm:text-[11px]">
        <span className="mr-1.5 inline-flex align-middle">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
        {applicant.badgePrimary}
      </div>
      <div className="absolute bottom-[4%] right-0 z-20 rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2 text-[11px] font-semibold text-slate-100 shadow-2xl backdrop-blur-md">
        {applicant.badgeSecondary}
      </div>
    </div>
  );
}

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % APPLICANTS.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused, index]);

  const select = useCallback((i: number) => setIndex(i), []);

  const avatars = useMemo(() => APPLICANTS.map((a) => a.photo), []);

  return (
    <section className="relative overflow-hidden bg-slate-900 px-4 pb-16 pt-14 md:pb-24 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        {/* Left column */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> AI Talent Matching
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find the{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Perfect Match
            </span>
            , Globally and{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Automatically
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Our AI scores every resume across seven languages, translates it into recruiter-ready German or
            English, and matches each applicant against local qualification requirements — automatically.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-slate-900 shadow-2xl shadow-emerald-500/25 transition-transform duration-300 hover:scale-[1.03] hover:from-emerald-400 hover:to-cyan-400"
            >
              <Link to="/editor">
                <span className="absolute inset-0 -z-10 animate-pulse bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                Start Free Trial
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 font-semibold text-white transition-colors hover:bg-white/10 hover:text-white"
            >
              <a href="#funktionen">
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </a>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="h-9 w-9 rounded-full border-2 border-slate-900 bg-slate-800 object-contain object-top"
                  style={{ zIndex: avatars.length - i }}
                />
              ))}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-white/10 text-slate-200">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-amber-300">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-0.5 text-sm font-medium text-slate-300">Trusted by 500+ HR teams worldwide</p>
            </div>
          </div>
        </div>

        {/* Right column: automated applicant showcase */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="relative mx-auto aspect-[3/4] w-full max-w-[460px]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {APPLICANTS.map((applicant, i) => (
              <ResumeMockup key={applicant.id} applicant={applicant} active={i === index} />
            ))}
          </div>

          {/* Step indicators */}
          <div className="mt-8 flex items-center justify-center gap-3">
            {APPLICANTS.map((applicant, i) => (
              <button
                key={applicant.id}
                type="button"
                onClick={() => select(i)}
                aria-label={`${applicant.name} — ${applicant.role}`}
                aria-current={i === index}
                className={[
                  "h-1.5 rounded-full transition-all duration-500",
                  i === index
                    ? "w-10 bg-gradient-to-r from-emerald-400 to-cyan-400"
                    : "w-4 bg-white/25 hover:bg-white/50",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
