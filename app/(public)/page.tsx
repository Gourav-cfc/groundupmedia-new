"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ConceptSection from "../components/ConceptSection";

// Utility hook: intersection observer
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Animated counter
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// Floating particles background
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242,101,34,${p.alpha})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(242,101,34,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// Magnetic cursor dot
function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rx = 0, ry = 0, mx = 0, my = 0;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", move);
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      }
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(id); };
  }, []);
  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 bg-[#f26522] rounded-full z-[9999] pointer-events-none mix-blend-multiply" style={{ transition: "none" }} />
      <div ref={ringRef} className="fixed top-0 left-0 w-10 h-10 border border-[#f26522]/60 rounded-full z-[9998] pointer-events-none" style={{ transition: "none" }} />
    </>
  );
}

// Marquee ticker
function Marquee() {
  const items = ["Brand Strategy", "Digital Marketing", "Social Media", "Content Creation", "Performance Ads", "SEO & SEM", "Video Production", "Influencer Marketing"];
  return (
    <div className="overflow-hidden bg-[#f26522] py-3 relative">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-white font-mono text-sm tracking-widest uppercase flex items-center gap-4">
            {item} <span className="text-white/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Stats strip
function StatsStrip() {
  const { ref, inView } = useInView();
  const stats = [
    { value: 250, suffix: "+", label: "Brands Transformed" },
    { value: 98, suffix: "%", label: "Client Retention" },
    { value: 12, suffix: "x", label: "Avg. ROI Delivered" },
    { value: 7, suffix: "yr", label: "Industry Experience" },
  ];
  return (
    <div ref={ref} className={`grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-300 border-t border-b border-gray-300 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {stats.map((s, i) => (
        <div key={i} className="bg-white flex flex-col items-center justify-center py-8 px-6 group hover:bg-[#f26522] transition-colors duration-300">
          <span className="text-4xl font-black text-gray-900 group-hover:text-white transition-colors duration-300 font-mono">
            {inView ? <Counter to={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
          </span>
          <span className="text-xs text-gray-500 group-hover:text-white/80 mt-1 uppercase tracking-widest transition-colors duration-300">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// Services section
function ServicesSection() {
  const { ref, inView } = useInView();
  const services = [
    { icon: "⚡", title: "Performance Marketing", desc: "Data-driven campaigns that convert at scale. From paid search to programmatic display.", color: "from-orange-500/10" },
    { icon: "🎯", title: "Brand Strategy", desc: "Positioning frameworks and identity systems that carve unassailable market niches.", color: "from-rose-500/10" },
    { icon: "📱", title: "Social Domination", desc: "Organic + paid strategies that transform followers into fervent brand advocates.", color: "from-amber-500/10" },
    { icon: "🎬", title: "Video & Content", desc: "Cinematic storytelling and editorial content that stops the scroll and drives action.", color: "from-emerald-500/10" },
    { icon: "📊", title: "Analytics & Insights", desc: "Deep data intelligence that illuminates opportunities invisible to competitors.", color: "from-blue-500/10" },
    { icon: "🔍", title: "SEO & Authority", desc: "Technical precision and content authority that dominates search engine results.", color: "from-violet-500/10" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-8 py-24">
      <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-[#f26522] font-mono text-xs tracking-[0.3em] uppercase mb-3">What We Do</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              Full-spectrum<br />brand warfare
            </h2>
          </div>
          <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
            Every touchpoint, every channel, every moment — engineered for maximum market impact.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white p-8 group hover:bg-gray-900 transition-all duration-500 cursor-pointer relative overflow-hidden"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <span className="text-3xl mb-6 block transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">{s.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-3 transition-colors duration-300">{s.title}</h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-300 leading-relaxed transition-colors duration-300">{s.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-[#f26522] group-hover:text-orange-400 text-sm font-semibold transition-colors duration-300 translate-x-0 group-hover:translate-x-1">
                  Explore <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Process section
function ProcessSection() {
  const { ref, inView } = useInView();
  const steps = [
    { n: "01", title: "Discover", desc: "Deep-dive audits, competitive intelligence, and audience mapping." },
    { n: "02", title: "Strategize", desc: "Custom roadmaps built on data, not assumptions." },
    { n: "03", title: "Execute", desc: "Flawless multi-channel campaign deployment at velocity." },
    { n: "04", title: "Dominate", desc: "Continuous optimization until you own your category." },
  ];
  return (
    <section className="bg-gray-900 py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="text-[#f26522] font-mono text-xs tracking-[0.3em] uppercase mb-3">How We Work</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-16 leading-tight">
            A process built<br /><em className="text-[#f26522] not-italic">for winners</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f26522]/40 to-transparent" />
            {steps.map((s, i) => (
              <div
                key={i}
                className="relative pt-16 px-6 group"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="absolute top-0 left-6 w-16 h-16 border border-[#f26522]/30 group-hover:border-[#f26522] rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-[#f26522]/10">
                  <span className="text-[#f26522] font-mono text-sm font-bold">{s.n}</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-3 group-hover:text-[#f26522] transition-colors duration-300">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                <div className="mt-6 w-8 h-px bg-[#f26522]/30 group-hover:w-full transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonial section
function TestimonialSection() {
  const [active, setActive] = useState(0);
  const testimonials = [
    { quote: "APEX transformed our digital presence entirely. Revenue up 340% in six months.", author: "Sarah Chen", role: "CMO, NovaTech", initials: "SC" },
    { quote: "The most strategic agency we've ever worked with. They don't just execute — they think.", author: "Marcus Webb", role: "CEO, Elevate Brands", initials: "MW" },
    { quote: "Our social following grew 12x and conversions tripled. Exceptional work.", author: "Priya Sharma", role: "Head of Growth, Flux Co.", initials: "PS" },
  ];
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);
  const { ref, inView } = useInView();
  return (
    <section className="max-w-7xl mx-auto px-8 py-24">
      <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <p className="text-[#f26522] font-mono text-xs tracking-[0.3em] uppercase mb-3 text-center">Client Wins</p>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-16 text-center">Results that speak</h2>
        <div className="relative max-w-3xl mx-auto min-h-[220px]">
          {testimonials.map((t, i) => (
            <div key={i} className={`absolute inset-0 flex flex-col items-center text-center transition-all duration-700 ${i === active ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}>
              <p className="text-2xl md:text-3xl font-serif text-gray-800 leading-relaxed mb-8 italic">&quot;{t.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f26522] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{t.initials}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{t.author}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className={`h-1 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-[#f26522]" : "w-2 bg-gray-300 hover:bg-gray-400"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA section
function CTASection() {
  const { ref, inView } = useInView();
  return (
    <section className="relative overflow-hidden bg-[#f26522] py-28">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/10 animate-expand-ring"
            style={{
              width: `${(i + 1) * 180}px`,
              height: `${(i + 1) * 180}px`,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.4}s`,
              animationDuration: "6s",
            }}
          />
        ))}
      </div>
      <div ref={ref} className={`max-w-4xl mx-auto px-8 text-center relative z-10 transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <p className="text-white/70 font-mono text-xs tracking-[0.3em] uppercase mb-4">Ready to Dominate?</p>
        <h2 className="text-5xl md:text-7xl font-serif font-black text-white leading-tight mb-6">
          Your brand&apos;s<br />era starts now.
        </h2>
        <p className="text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
          Stop blending in. We build brands that own the conversation, own the feed, and own the market.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#" className="bg-white text-[#f26522] font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 text-sm tracking-wide">
            Start a Project →
          </a>
          <a href="#" className="border-2 border-white/50 text-white font-semibold px-10 py-4 rounded-full hover:border-white hover:bg-white/10 transition-all duration-300 text-sm tracking-wide">
            View Our Work
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [heroTextIdx, setHeroTextIdx] = useState(0);
  const heroWords = ["feed to fields", "clicks to crowds", "brands to legends"];
  
  useEffect(() => {
    // Use a ref to track if component is mounted
    let mounted = true;
    
    // Set loaded state after mount
    if (mounted) {
      setLoaded(true);
    }
    
    const t = setInterval(() => {
      if (mounted) {
        setHeroTextIdx(i => (i + 1) % heroWords.length);
      }
    }, 2800);
    
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  // Extract YouTube video ID from the URL
  const youtubeVideoId = "qx5LXAU-LQE";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;900&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3 { font-family: 'DM Serif Display', serif; }
        .font-mono { font-family: 'DM Mono', monospace !important; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee { animation: marquee 28s linear infinite; }

        @keyframes float-rocket {
          0%, 100% { transform: translateY(0px) rotate(-8deg); }
          50% { transform: translateY(-18px) rotate(-5deg); }
        }
        .animate-float { animation: float-rocket 3.5s ease-in-out infinite; }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }

        @keyframes hero-line {
          0% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes expand-ring {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        .animate-expand-ring { animation: expand-ring 6s ease-out infinite; }

        @keyframes slide-up {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        @keyframes text-cycle-in {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0%); opacity: 1; }
        }
        @keyframes text-cycle-out {
          0% { transform: translateY(0%); opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }

        @keyframes badge-pop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-badge-pop { animation: badge-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s both; }

        @keyframes tv-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(242,101,34,0.2); }
          50% { box-shadow: 0 0 60px rgba(242,101,34,0.4); }
        }
        .animate-tv-glow { animation: tv-glow 3s ease-in-out infinite; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          30% { transform: translate(1%, 2%); }
          50% { transform: translate(-1%, 1%); }
          70% { transform: translate(2%, -1%); }
          90% { transform: translate(-1%, 2%); }
        }
      `}</style>

      <MagneticCursor />

      <div className="min-h-screen bg-[#ebebeb] overflow-x-hidden">

        {/* ── HERO SECTION ── */}
        <section className="relative min-h-screen flex flex-col overflow-hidden">
          {/* Particle canvas bg */}
          <div className="absolute inset-0">
            <ParticlesCanvas />
          </div>

          {/* Decorative rotating circle */}
          <div className="absolute top-20 right-[-80px] w-[500px] h-[500px] border border-[#f26522]/10 rounded-full animate-spin-slow pointer-events-none" />
          <div className="absolute top-32 right-[-50px] w-[360px] h-[360px] border border-[#f26522]/15 rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "14s" }} />

          <div className="max-w-7xl mx-auto px-8 pt-32 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12 flex-1 w-full relative z-10">

            {/* Left */}
            <div className="flex-1 max-w-xl">
              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-8 shadow-sm animate-badge-pop"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600 font-mono tracking-wide">Available for new projects</span>
              </div>

              {/* Heading */}
              <h1 className={`text-5xl md:text-6xl lg:text-7xl leading-[1.05] transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <span className="text-gray-800 block" style={{ transitionDelay: "100ms" }}>Helping</span>
                <span className="text-gray-800 block" style={{ transitionDelay: "200ms" }}>Brands dominate</span>
                <span className="block overflow-hidden h-[1.2em] relative mt-1">
                  {heroWords.map((word, i) => (
                    <span
                      key={word}
                      className="absolute left-0 w-full text-[#f26522] font-bold italic"
                      style={{
                        animation: i === heroTextIdx
                          ? "text-cycle-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards"
                          : (i === (heroTextIdx - 1 + heroWords.length) % heroWords.length)
                          ? "text-cycle-out 0.5s ease-in forwards"
                          : "none",
                        opacity: i === heroTextIdx ? 1 : 0,
                        transform: i === heroTextIdx ? "translateY(0)" : "translateY(100%)",
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </h1>

              {/* Subtext */}
              <p className={`mt-6 text-gray-500 leading-relaxed max-w-sm transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                We architect brand experiences that transcend the ordinary — fusing strategic intelligence with creative audacity.
              </p>

              {/* CTAs */}
              <div className={`mt-8 flex flex-wrap gap-4 transition-all duration-1000 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <a href="#" className="group relative overflow-hidden bg-gray-900 text-white font-semibold px-8 py-4 rounded-full text-sm hover:shadow-xl hover:shadow-gray-900/20 transition-all duration-300 hover:scale-105 active:scale-95">
                  <span className="relative z-10">Start a Project</span>
                  <span className="absolute inset-0 bg-[#f26522] translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-full" />
                  <span className="relative z-10 ml-2">→</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-gray-700 font-semibold text-sm hover:text-[#f26522] transition-colors duration-200 group">
                  <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-[#f26522] group-hover:border-[#f26522] group-hover:text-white transition-all duration-300">▶</span>
                  Watch Showreel
                </a>
              </div>

              {/* Social proof */}
              <div className={`mt-10 flex items-center gap-4 transition-all duration-1000 delay-900 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex -space-x-2">
                  {["#f26522", "#1a1a2e", "#e63946", "#2ec4b6"].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold" style={{ backgroundColor: c }}>{String.fromCharCode(65 + i)}</div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 text-yellow-400 text-xs">★★★★★</div>
                  <p className="text-xs text-gray-500">Trusted by 250+ brands</p>
                </div>
              </div>
            </div>

            {/* Rocket in middle */}
            <div className="hidden lg:flex flex-col items-center justify-center px-4 animate-float">
              <Image src="/assets/rocket.gif" alt="Rocket" width={180} height={180} unoptimized className="drop-shadow-2xl" />
              <div className="mt-3 text-center">
                <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Launching brands</span>
              </div>
            </div>

            {/* TV Right */}
            <div className={`flex-1 flex justify-end z-20 transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-x-0" : "opacity-100 translate-x-12"}`}>
              <div className="relative w-full max-w-[520px]">
                {/* Glow halo */}
                <div className="absolute inset-8 bg-[#f26522]/20 blur-3xl rounded-full animate-tv-glow" />

                <Image
                  src="/assets/tv-frame.png"
                  alt="TV Frame"
                  width={520}
                  height={420}
                  className="relative z-30 w-full h-auto pointer-events-none drop-shadow-2xl"
                />

                <div className="absolute top-[30.5%] left-[9%] w-[66%] h-[53.5%] z-20 bg-black overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&controls=1`}
                    title="Agency Video"
                    allowFullScreen
                  />
                </div>

                {/* Floating badges on TV */}
                <div className="absolute -bottom-4 -left-8 z-40 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 animate-badge-pop">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Campaign Live</p>
                      <p className="text-[10px] text-green-500">+234% reach today</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 z-40 bg-[#f26522] text-white rounded-2xl px-4 py-3 shadow-xl" style={{ animation: "badge-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.8s both" }}>
                  <p className="text-xs font-bold">ROI Delivered</p>
                  <p className="text-2xl font-black font-mono">12x</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ground Lines */}
          <div className="absolute bottom-0 left-0 w-1/2 opacity-20 pointer-events-none">
            <Image src="/assets/lines.png" alt="Lines" width={800} height={200} className="w-full h-auto object-bottom" />
          </div>

          {/* Scroll indicator */}
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-1000 ${loaded ? "opacity-100" : "opacity-0"}`}>
            <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-[#f26522] to-transparent animate-pulse" />
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <Marquee />

        {/* ── STATS ── */}
        <StatsStrip />

        {/* ── CONCEPT SECTION ── */}
        <ConceptSection />

        {/* ── SERVICES ── */}
        <ServicesSection />

        {/* ── PROCESS ── */}
        <ProcessSection />

        {/* ── TESTIMONIALS ── */}
        <TestimonialSection />

        {/* ── CTA ── */}
        <CTASection />
      </div>
    </>
  );
}