"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   HOOK: scroll-triggered visibility
───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─────────────────────────────────────────────
   HOOK: count-up on entry (optimized with RAF)
───────────────────────────────────────────── */
function useCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutExpo
      const eased = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setVal(Math.floor(eased * target));
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setVal(target);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [active, target, duration]);
  return val;
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER BADGE
───────────────────────────────────────────── */
function CountBadge({ to, suffix, active }: { to: number; suffix: string; active: boolean }) {
  const val = useCounter(to, active);
  return (
    <span className="tabular-nums">
      {val}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   ORBITING DOTS (decorative globe companion)
───────────────────────────────────────────── */
function OrbitRings() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[80, 110, 145].map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#f26522]/15"
          style={{ width: r * 2, height: r * 2 }}
        >
          {/* travelling dot */}
          <div
            className="absolute w-2 h-2 rounded-full bg-[#f26522]/70 shadow-[0_0_6px_#f26522]"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 120}deg) translateX(${r}px)`,
              animation: `orbit ${4 + i * 1.5}s linear infinite`,
              animationDelay: `${i * -1.1}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD — individual
───────────────────────────────────────────── */
interface StatCardProps {
  icon: string;
  iconAlt: string;
  iconW?: number;
  iconH?: number;
  label: string | React.ReactNode;
  sublabel?: string;
  delay?: number;
  inView: boolean;
  isGif?: boolean;
  isSvg?: boolean;
  isCounter?: boolean;
  counterTo?: number;
  counterSuffix?: string;
  accent?: boolean;
  unoptimized?: boolean;
}

function StatCard({
  icon, iconAlt, iconW = 64, iconH = 64,
  label, sublabel, delay = 0, inView,
  isCounter, counterTo, counterSuffix = "",
  accent, unoptimized,
}: StatCardProps) {
  return (
    <div
      className="group relative bg-white rounded-3xl p-8 overflow-hidden cursor-default
                 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#f26522]/10
                 transition-all duration-500 hover:-translate-y-2"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, box-shadow 0.3s ease, translate 0.3s ease`,
      }}
    >
      {/* hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f26522]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

      {/* top-right accent dot */}
      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${accent ? "bg-[#f26522]" : "bg-gray-200"} group-hover:bg-[#f26522] transition-colors duration-300`} />

      {/* icon wrapper with float */}
      <div className="mb-5 relative inline-block" style={{ animation: inView ? `float 3s ease-in-out ${delay}ms infinite` : "none" }}>
        <div className="absolute inset-0 bg-[#f26522]/10 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Image
          src={icon}
          alt={iconAlt}
          width={iconW}
          height={iconH}
          className="relative z-10 transition-transform duration-500 group-hover:scale-110"
          unoptimized={unoptimized}
        />
      </div>

      {/* main label */}
      <div className={`text-[#f26522] leading-tight mb-2 font-display ${isCounter ? "text-5xl font-black" : "text-3xl font-bold"}`}>
        {isCounter && counterTo !== undefined
          ? <CountBadge to={counterTo} suffix={counterSuffix} active={inView} />
          : label}
      </div>

      {/* sublabel */}
      {sublabel && (
        <p className="text-gray-500 text-sm leading-relaxed font-body">{sublabel}</p>
      )}

      {/* bottom bar reveal */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#f26522] to-[#ff9a5c] w-0 group-hover:w-full transition-all duration-500 rounded-b-3xl" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function MediaStrengthSection() {
  const heroBlock = useInView(0.1);
  const statsBlock = useInView(0.1);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useRef(true);

  // parallax on mouse move
  useEffect(() => {
    mounted.current = true;
    
    const onMove = (e: MouseEvent) => {
      if (!mounted.current) return;
      const el = sectionRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - left) / width,
        y: (e.clientY - top) / height,
      });
    };
    
    window.addEventListener("mousemove", onMove);
    return () => {
      mounted.current = false;
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const px = (mousePos.x - 0.5) * 18;
  const py = (mousePos.y - 0.5) * 14;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .font-display { font-family: 'Fraunces', serif; }
        .font-body    { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono    { font-family: 'DM Mono', monospace; }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(var(--r, 80px)); }
          to   { transform: rotate(360deg) translateX(var(--r, 80px)); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-7px); }
        }

        @keyframes heading-reveal {
          from { clip-path: inset(0 100% 0 0); opacity: 0; }
          to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
        }

        @keyframes shimmer-line {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        @keyframes badge-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0;   }
        }

        @keyframes device-float {
          0%, 100% { transform: translateY(0px) rotate(-1deg);  }
          50%       { transform: translateY(-14px) rotate(1deg); }
        }
        .animate-device-float { animation: device-float 5s ease-in-out infinite; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes globe-rotate {
          from { transform: rotate(-4deg); }
          to   { transform: rotate(4deg); }
        }
        .animate-globe { animation: globe-rotate 3s ease-in-out infinite alternate; }

        .stat-card-grid > * {
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, translate 0.3s;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full bg-[#f5f0eb] overflow-hidden font-body"
      >
        {/* ── DECORATIVE BG MESH ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* large blurred circles */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#f26522]/6 blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-[#f26522]/5 blur-[80px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-400/6 blur-[70px]" />

          {/* dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="#f26522" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-8 lg:px-10 py-28 space-y-28 relative z-10">

          {/* ═══════════════════════════════════════
              TOP ROW
          ═══════════════════════════════════════ */}
          <div
            ref={heroBlock.ref}
            className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24"
          >

            {/* LEFT: Globe + Text */}
            <div className="flex flex-col sm:flex-row items-start gap-10">

              {/* Globe with orbits */}
              <div
                className="relative flex-shrink-0 w-[150px] h-[150px]"
                style={{
                  transform: heroBlock.inView ? `translate(${px * 0.6}px, ${py * 0.6}px)` : "none",
                  transition: "transform 0.12s ease-out",
                }}
              >
                <OrbitRings />
                {/* pulse rings */}
                {[0, 0.5, 1].map((d, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-[#f26522]/30"
                    style={{ animation: `pulse-ring 2.4s ease-out ${d}s infinite` }}
                  />
                ))}
                <Image
                  src="/assets/globe.png"
                  alt="Globe"
                  width={140}
                  height={140}
                  className="relative z-10 animate-globe opacity-95"
                />
              </div>

              {/* Text block */}
              <div
                style={{
                  opacity: heroBlock.inView ? 1 : 0,
                  transform: heroBlock.inView ? "translateX(0)" : "translateX(-30px)",
                  transition: "opacity 0.9s ease 200ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) 200ms",
                }}
              >
                {/* eyebrow */}
                <div className="inline-flex items-center gap-2 bg-white border border-[#f26522]/20 rounded-full px-4 py-1.5 mb-5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f26522] animate-pulse" />
                  <span className="text-[11px] font-mono text-gray-500 tracking-widest uppercase">Pan India Presence</span>
                </div>

                <p className="text-base text-gray-500 font-body mb-2 tracking-wide">
                  One of the Largest Growing
                </p>

                <h2
                  className="font-display text-4xl md:text-5xl lg:text-6xl text-[#f26522] leading-[1.08] font-bold italic"
                  style={{
                    animation: heroBlock.inView ? "heading-reveal 1.1s cubic-bezier(0.22,1,0.36,1) 400ms both" : "none",
                  }}
                >
                  PAN India<br />
                  <span className="not-italic font-black text-gray-900">Marketing</span> &amp;<br />
                  Branding Solutions
                </h2>

                {/* shimmer underline */}
                <div className="relative mt-5 h-[3px] w-48 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-[#f26522] to-transparent rounded"
                    style={{ animation: heroBlock.inView ? "shimmer-line 2.2s ease-in-out 800ms infinite" : "none" }}
                  />
                </div>

                {/* mini trust badges */}
                <div className="flex flex-wrap gap-3 mt-7">
                  {["ISO Certified", "Award Winning", "500+ Clients"].map((b, i) => (
                    <span
                      key={b}
                      className="text-[11px] font-mono uppercase tracking-widest bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full shadow-sm hover:border-[#f26522]/40 hover:text-[#f26522] transition-colors duration-300"
                      style={{
                        opacity: heroBlock.inView ? 1 : 0,
                        transition: `opacity 0.5s ease ${800 + i * 120}ms`,
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Device Mockup */}
            <div
              className="flex justify-center lg:justify-end"
              style={{
                transform: heroBlock.inView
                  ? `translate(${px * -0.8}px, ${py * -0.5}px)`
                  : "translateX(40px)",
                opacity: heroBlock.inView ? 1 : 0,
                transition: heroBlock.inView
                  ? "transform 0.12s ease-out, opacity 0.9s ease 300ms"
                  : "opacity 0.9s ease 300ms",
              }}
            >
              <div className="relative">
                {/* glow halo */}
                <div className="absolute inset-10 bg-[#f26522]/15 blur-3xl rounded-full" />

                {/* decorative rotating badge */}
                <div className="absolute -top-6 -right-6 z-20">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 80 80" style={{ animation: "badge-spin 12s linear infinite" }}>
                      <path id="badge-circle" d="M 40,40 m -28,0 a 28,28 0 1,1 56,0 a 28,28 0 1,1 -56,0" fill="none" />
                      <text fontSize="7.5" fill="#f26522" letterSpacing="2.5" fontFamily="'DM Mono', monospace">
                        <textPath href="#badge-circle">INDIA&apos;S BEST · INDIA&apos;S BEST · </textPath>
                      </text>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl">🏆</span>
                    </div>
                  </div>
                </div>

                <Image
                  src="/assets/phone-tab.png"
                  alt="Devices"
                  width={540}
                  height={360}
                  className="object-contain relative z-10 animate-device-float drop-shadow-2xl"
                />

                {/* floating data pill */}
                <div className="absolute bottom-6 -left-6 z-20 bg-white rounded-2xl px-5 py-3 shadow-xl border border-gray-100"
                     style={{ animation: heroBlock.inView ? "fade-up 0.7s ease 900ms both" : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-base">📈</div>
                    <div>
                      <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">Campaign Reach</p>
                      <p className="text-lg font-black text-gray-900 font-display">10M+ <span className="text-green-500 text-xs font-mono">↑ 42%</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              DIVIDER
          ═══════════════════════════════════════ */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#f26522]/30 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#f26522]/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#f26522]/30 to-transparent" />
          </div>

          {/* ═══════════════════════════════════════
              STATS ROW
          ═══════════════════════════════════════ */}
          <div ref={statsBlock.ref} className="stat-card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* 1 — Rural Marketing */}
            <StatCard
              icon="/assets/kite.png"
              iconAlt="Rural Marketing"
              iconW={60} iconH={60}
              label={<>Largest<br />Rural Marketing</>}
              sublabel="Agencies in India — unrivalled rural network"
              delay={0}
              inView={statsBlock.inView}
              accent
            />

            {/* 2 — 100+ Minds */}
            <StatCard
              icon="/assets/brain.png"
              iconAlt="Dynamic Minds"
              iconW={64} iconH={64}
              label="100+"
              sublabel="Dynamic minds driving creative excellence"
              delay={120}
              inView={statsBlock.inView}
              isCounter
              counterTo={100}
              counterSuffix="+"
              accent
            />

            {/* 3 — Awards */}
            <div
              className="group relative bg-gray-900 rounded-3xl p-8 overflow-hidden cursor-default border border-gray-800
                         shadow-sm hover:shadow-2xl hover:shadow-[#f26522]/20 transition-all duration-500 hover:-translate-y-2"
              style={{
                opacity: statsBlock.inView ? 1 : 0,
                transform: statsBlock.inView ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
                transition: "opacity 0.7s ease 240ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) 240ms, box-shadow 0.3s ease, translate 0.3s ease",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#f26522]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#f26522] animate-pulse" />

              <div className="mb-5 relative inline-block" style={{ animation: statsBlock.inView ? "float 3s ease-in-out 240ms infinite" : "none" }}>
                <div className="absolute inset-0 bg-[#f26522]/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image src="/assets/winner.gif" alt="Awards" width={80} height={80} className="relative z-10" unoptimized />
              </div>

              <div className="text-[#f26522] text-3xl font-display font-bold leading-tight mb-2">
                Award<br />Winning
              </div>
              <p className="text-gray-400 text-sm font-body leading-relaxed">
                Winner of several coveted awards over the years
              </p>

              {/* stars */}
              <div className="flex gap-1 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-[#f26522] text-base"
                    style={{
                      opacity: statsBlock.inView ? 1 : 0,
                      transition: `opacity 0.3s ease ${400 + i * 80}ms`,
                      animation: statsBlock.inView ? `float ${2 + i * 0.2}s ease-in-out ${i * 0.15}s infinite` : "none",
                      display: "inline-block",
                    }}
                  >★</span>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#f26522] to-[#ff9a5c] w-0 group-hover:w-full transition-all duration-500 rounded-b-3xl" />
            </div>

            {/* 4 — Google Partner */}
            <div
              className="group relative bg-white rounded-3xl p-8 overflow-hidden cursor-default border border-gray-100
                         shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2
                         flex flex-col items-start justify-between"
              style={{
                opacity: statsBlock.inView ? 1 : 0,
                transform: statsBlock.inView ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
                transition: "opacity 0.7s ease 360ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) 360ms, box-shadow 0.3s ease, translate 0.3s ease",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

              <div
                className="relative z-10 transition-transform duration-500 group-hover:scale-105"
                style={{ animation: statsBlock.inView ? "float 3.5s ease-in-out 360ms infinite" : "none" }}
              >
                <Image src="/assets/PartnerBadgeClickable.svg" alt="Google Partner" width={130} height={130} />
              </div>

              <div className="relative z-10 mt-5">
                <p className="text-sm font-semibold text-gray-800 font-body">Certified Google Partner</p>
                <p className="text-xs text-gray-400 font-body mt-1">Trusted by Google for expertise in digital advertising</p>
              </div>

              {/* google color dots */}
              <div className="flex gap-1.5 mt-4 relative z-10">
                {["#4285F4","#EA4335","#FBBC05","#34A853"].map((c) => (
                  <div key={c} className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-125" style={{ backgroundColor: c }} />
                ))}
              </div>

              <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] w-0 group-hover:w-full transition-all duration-500 rounded-b-3xl" />
            </div>
          </div>

          {/* ═══════════════════════════════════════
              BOTTOM TRUST STRIP
          ═══════════════════════════════════════ */}
          <div
            style={{
              opacity: statsBlock.inView ? 1 : 0,
              transform: statsBlock.inView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s ease 600ms, transform 0.8s ease 600ms",
            }}
          >
            <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              {/* shimmer sweep */}
              <div
                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#f26522]/5 to-transparent"
                style={{ animation: statsBlock.inView ? "shimmer-line 4s ease-in-out 1s infinite" : "none" }}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                {[
                  { icon: "🌐", stat: "28", unit: "States", desc: "Covered across India" },
                  { icon: "📣", stat: "500", unit: "Campaigns", desc: "Successfully delivered" },
                  { icon: "🤝", stat: "95", unit: "%", desc: "Client retention rate" },
                  { icon: "⚡", stat: "15", unit: "Yrs", desc: "Of industry excellence" },
                ].map(({ icon, stat, unit, desc }, i) => (
                  <div key={i} className="flex flex-col items-center justify-center py-8 px-6 group hover:bg-[#fdf6f2] transition-colors duration-300">
                    <span className="text-2xl mb-3 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6 inline-block">{icon}</span>
                    <div className="font-display font-black text-3xl text-gray-900 group-hover:text-[#f26522] transition-colors duration-300">
                      {statsBlock.inView
                        ? <CountBadge to={parseInt(stat)} suffix={unit} active={statsBlock.inView} />
                        : `0${unit}`}
                    </div>
                    <p className="text-xs text-gray-400 font-body mt-1 text-center">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}