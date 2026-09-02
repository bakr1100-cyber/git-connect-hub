import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HeartPulse, Play, Sparkles, Star, Users } from "lucide-react";

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
  rtl?: boolean;
  headline: string;
  target: string;
  targetIcon?: boolean;
  badgePrimary: string;
  badgeSecondary: string;
};

const APPLICANTS: Applicant[] = [
  {
    id: "a1",
    name: "Lukas Berger",
    role: "Fachkraft IT",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80",
    paper: "bg-white",
    ink: "text-emerald-900",
    rule: "bg-emerald-800",
    bar: "bg-emerald-900/15",
    headline: "Lebenslauf",
    target: "Systemadministrator (m/w/d)",
    badgePrimary: "ATS-GEPRÜFT (94%)",
    badgeSecondary: "Fachkraft IT",
  },
  {
    id: "a2",
    name: "Yasmine Haddad",
    role: "Projektmanagement",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&q=80",
    paper: "bg-[#fdf3ef]",
    ink: "text-rose-900",
    rule: "bg-rose-400",
    bar: "bg-rose-900/12",
    rtl: true,
    headline: "السيرة الذاتية",
    target: "إدارة المشاريع",
    badgePrimary: "٩٢ / ١٠٠",
    badgeSecondary: "Projektmanagement",
  },
  {
    id: "a3",
    name: "Lena Hoffmann",
    role: "Marketing Manager",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=640&q=80",
    paper: "bg-white",
    ink: "text-blue-900",
    rule: "bg-blue-700",
    bar: "bg-blue-900/12",
    headline: "Lebenslauf",
    target: "Marketing Manager (m/w/d)",
    badgePrimary: "Perfektes Match",
    badgeSecondary: "Marketing Manager",
  },
  {
    id: "a4",
    name: "Youssef El Amrani",
    role: "Pflegefachmann",
    photo:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=640&q=80",
    paper: "bg-[#f0f9f6]",
    ink: "text-teal-900",
    rule: "bg-teal-600",
    bar: "bg-sky-900/12",
    headline: "Lebenslauf",
    target: "Ausbildung zum Pflegefachmann",
    targetIcon: true,
    badgePrimary: "Visum & Dokumente bereit",
    badgeSecondary: "Deutsch B2 zertifiziert",
  },
];

const CYCLE_MS = 4000;

function ResumeMockup({ applicant, active }: { applicant: Applicant; active: boolean }) {
  return (
    <div
      className={[
        "absolute inset-0 transition-all duration-1000 ease-out",
        active ? "opacity-100 scale-100 translate-y-0" : "pointer-events-none opacity-0 scale-95 translate-y-4",
      ].join(" ")}
      aria-hidden={!active}
    >
      {/* Background layer: tilted 3D resume document */}
      <div
        className={[
          "absolute left-[6%] top-[4%] h-[86%] w-[76%] overflow-hidden rounded-2xl border border-white/60 p-5 shadow-2xl",
          applicant.paper,
        ].join(" ")}
        style={{ transform: "perspective(1200px) rotateY(-15deg) rotateX(10deg)" }}
        dir={applicant.rtl ? "rtl" : "ltr"}
      >
        <div className={["text-[11px] font-bold uppercase tracking-[0.2em]", applicant.ink].join(" ")}>
          {applicant.headline}
        </div>
        <div className={["mt-1 text-lg font-bold tracking-tight sm:text-xl", applicant.ink].join(" ")}>
          {applicant.name}
        </div>
        <div className={["mt-2 h-[3px] w-16 rounded", applicant.rule].join(" ")} />

        <div className="mt-4 flex items-center gap-1.5">
          {applicant.targetIcon && <HeartPulse className={["h-3.5 w-3.5 shrink-0", applicant.ink].join(" ")} />}
          <span className={["text-[11px] font-semibold sm:text-xs", applicant.ink].join(" ")}>
            {applicant.target}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {[0, 1, 2].map((block) => (
            <div key={block} className="space-y-1.5">
              <div className={["h-[5px] w-[38%] rounded", applicant.rule, "opacity-70"].join(" ")} />
              <div className={["h-[4px] w-full rounded", applicant.bar].join(" ")} />
              <div className={["h-[4px] w-[88%] rounded", applicant.bar].join(" ")} />
              <div className={["h-[4px] w-[64%] rounded", applicant.bar].join(" ")} />
            </div>
          ))}
        </div>
      </div>

      {/* Foreground layer: applicant portrait */}
      <img
        src={applicant.photo}
        alt={`${applicant.name} — ${applicant.role}`}
        loading={active ? "eager" : "lazy"}
        className="absolute bottom-[6%] right-[4%] z-10 h-[62%] w-[46%] rounded-[1.75rem] border-4 border-white/80 object-cover shadow-2xl"
      />

      {/* UI badge layer */}
      <div className="absolute -left-2 -top-3 z-20 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200 shadow-xl backdrop-blur-md sm:text-[11px]">
        <span className="mr-1.5 inline-flex align-middle">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
        {applicant.badgePrimary}
      </div>
      <div className="absolute bottom-[2%] left-[8%] z-20 rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2 text-[11px] font-semibold text-slate-100 shadow-2xl backdrop-blur-md">
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
                  className="h-9 w-9 rounded-full border-2 border-slate-900 object-cover"
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
            className="relative mx-auto aspect-[4/5] w-full max-w-[520px]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {APPLICANTS.map((applicant, i) => (
              <ResumeMockup key={applicant.id} applicant={applicant} active={i === index} />
            ))}
          </div>

          {/* Step indicators */}
          <div className="mt-6 flex items-center justify-center gap-3">
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
