"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  LayoutDashboard, Users, MapPin, Package,
  Clock, FileText, MessageSquare, Bell,
  TrendingUp, TrendingDown, Search, ChevronRight,
  Target, Zap, Award, AlertTriangle, RefreshCw,
} from "lucide-react";

/* ──────────────────────────────────────────────
   THEME
────────────────────────────────────────────── */
const T = {
  primary:     "#519183",
  primaryDark: "#3d6e63",
  primaryLight:"#6aab9c",
  primaryPale: "#e8f3f1",
  primaryGlow: "rgba(81,145,131,0.25)",
  bg:          "#f0f4f3",
  navy:        "#0f2027",
  navyMid:     "#1a3040",
};

/* ──────────────────────────────────────────────
   HOOKS
────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const s = performance.now();
    const tick = (n: number) => {
      const p = Math.min((n - s) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick); else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

/* ──────────────────────────────────────────────
   LIVE CLOCK
────────────────────────────────────────────── */
function LiveClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs tabular-nums tracking-widest" style={{ color: T.primary }}>{t}</span>;
}

/* ──────────────────────────────────────────────
   ANIMATED NUMBER
────────────────────────────────────────────── */
function AnimNum({ raw, prefix = "", suffix = "" }: { raw: number; prefix?: string; suffix?: string }) {
  const { ref, inView } = useInView(0.4);
  const val = useCounter(raw, inView);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

/* ──────────────────────────────────────────────
   SPARKLINE
────────────────────────────────────────────── */
function Sparkline({ data, color, active }: { data: number[]; color: string; active: boolean }) {
  const max = Math.max(...data), min = Math.min(...data);
  const W = 120, H = 40;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / (max - min || 1)) * (H - 6) - 3,
  }));
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const area = `${d} L ${W} ${H} L 0 ${H} Z`;
  const gId = `sg-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2"
        strokeDasharray="300" strokeDashoffset={active ? "0" : "300"}
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)" }}
        strokeLinecap="round" />
      {pts[pts.length - 1] && (
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3"
          fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────
   CANVAS SIDEBAR BG
────────────────────────────────────────────── */
function SidebarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf: number;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 18 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p, i) => {
        pts.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(81,145,131,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        });
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(81,145,131,0.3)"; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ──────────────────────────────────────────────
   DONUT GAUGE
────────────────────────────────────────────── */
function Gauge({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 7, circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDash(pct / 100 * circ), 400); return () => clearTimeout(t); }, [pct, circ]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(81,145,131,0.1)" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ - dash}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s", filter: `drop-shadow(0 0 3px ${color})` }} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill={color}
        fontSize="10" fontWeight="700" fontFamily="'DM Mono', monospace">{pct}%</text>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   SIDEBAR ITEM
────────────────────────────────────────────── */
function SidebarItem({ icon, label, active, badge, delay = 0, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean;
  badge?: number; delay?: number; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group relative overflow-hidden"
      style={{
        background: active ? `linear-gradient(135deg, rgba(81,145,131,0.2), rgba(81,145,131,0.06))` : "transparent",
        borderLeft: active ? `2px solid ${T.primary}` : "2px solid transparent",
        transition: "background 0.2s, border-color 0.2s",
        animation: `slide-in-left 0.42s ease ${delay}ms both`,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {active && <div className="absolute inset-0 rounded-xl" style={{ background: `radial-gradient(circle at 15% 50%, rgba(81,145,131,0.15) 0%, transparent 70%)` }} />}
      <span className="relative z-10 transition-transform duration-200 group-hover:scale-110"
        style={{ color: active ? T.primary : "rgba(255,255,255,0.45)" }}>
        {icon}
      </span>
      {label && (
        <span className="relative z-10 text-sm flex-1 transition-colors duration-200"
          style={{ color: active ? "white" : "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: active ? 600 : 400 }}>
          {label}
        </span>
      )}
      {badge && label && (
        <span className="relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ background: T.primary, fontFamily: "'DM Mono', monospace", animation: "pulse-badge 2.2s ease-in-out infinite" }}>
          {badge}
        </span>
      )}
      {active && label && <ChevronRight size={13} className="relative z-10 shrink-0" style={{ color: T.primary }} />}
    </div>
  );
}

/* ──────────────────────────────────────────────
   METRIC CARD
────────────────────────────────────────────── */
function MetricCard({ title, rawValue, prefix, suffix, sub, positive, icon, sparkData, delay, color }: {
  title: string; rawValue: number; prefix?: string; suffix?: string;
  sub: string; positive: boolean; icon: React.ReactNode;
  sparkData: number[]; delay: number; color: string;
}) {
  const { ref, inView } = useInView(0.2);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref}
      className="relative overflow-hidden rounded-2xl border cursor-default"
      style={{
        background: "white",
        borderColor: "rgba(81,145,131,0.12)",
        boxShadow: hovered ? `0 16px 40px rgba(81,145,131,0.15)` : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.3s, transform 0.3s",
        animation: `fade-up 0.6s ease ${delay}ms both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-15"
        style={{ background: color }} />
      {hovered && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${color}07, transparent, ${color}05)` }} />
      )}
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>{title}</p>
            <p className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: T.navy }}>
              {inView ? <AnimNum raw={rawValue} prefix={prefix} suffix={suffix} /> : `${prefix ?? ""}0${suffix ?? ""}`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
            {icon}
          </div>
        </div>
        <Sparkline data={sparkData} color={color} active={inView} />
        <div className="flex items-center gap-1.5 mt-2">
          {positive ? <TrendingUp size={11} color="#22c55e" /> : <TrendingDown size={11} color="#ef4444" />}
          <span className="text-[10px] font-semibold" style={{ color: positive ? "#22c55e" : "#ef4444", fontFamily: "'DM Mono', monospace" }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   LOCATION BAR
────────────────────────────────────────────── */
function LocationBar({ name, value, pct, rank, delay }: {
  name: string; value: string; pct: number; rank: number; delay: number;
}) {
  const { ref, inView } = useInView(0.2);
  const [barW, setBarW] = useState(0);
  useEffect(() => {
    if (inView) { const t = setTimeout(() => setBarW(pct), 200 + delay * 0.3); return () => clearTimeout(t); }
  }, [inView, pct, delay]);
  return (
    <div ref={ref} className="group" style={{ animation: `fade-up 0.5s ease ${delay}ms both` }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white shrink-0"
            style={{ background: T.primary, fontFamily: "'DM Mono', monospace" }}>{rank}</span>
          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</span>
        </div>
        <span className="text-xs font-bold shrink-0" style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.primaryPale }}>
        <div className="h-full rounded-full relative overflow-hidden"
          style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${T.primaryDark}, ${T.primaryLight})`, transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }}>
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ALERT ITEM
────────────────────────────────────────────── */
function AlertItem({ name, status, pct, delay }: {
  name: string; status: string; pct: number; delay: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border group hover:shadow-md transition-all duration-200"
      style={{ background: "rgba(239,68,68,0.03)", borderColor: "rgba(239,68,68,0.15)", animation: `fade-up 0.5s ease ${delay}ms both` }}>
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.18)" }}>
        <AlertTriangle size={16} color="#ef4444" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</p>
        <p className="text-[10px] text-red-500 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{status}</p>
      </div>
      <Gauge pct={pct} color="#ef4444" size={46} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   ATTENDANCE ROW
────────────────────────────────────────────── */
function AttRow({ name, inT, outT, status, delay }: {
  name: string; inT: string; outT: string;
  status: "present" | "late" | "absent"; delay: number;
}) {
  const sc = status === "present" ? T.primary : status === "late" ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 px-1.5 rounded-lg transition-colors duration-150"
      style={{ animation: `fade-up 0.4s ease ${delay}ms both` }}>
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white"
        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})` }}>
        {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</p>
        <p className="text-[9px] text-gray-400 font-mono mt-0.5">{inT} → {outT}</p>
      </div>
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
        style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}25`, fontFamily: "'DM Mono', monospace" }}>
        {status}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PROGRESS BAR (used in Monthly Targets)
────────────────────────────────────────────── */
function TargetBar({ label, curr, target, unit, color, delay }: {
  label: string; curr: number; target: number; unit: string; color: string; delay: number;
}) {
  const { ref, inView } = useInView(0.2);
  const [w, setW] = useState(0);
  const pct = Math.min((curr / target) * 100, 100);
  useEffect(() => {
    if (inView) { const t = setTimeout(() => setW(pct), 300 + delay); return () => clearTimeout(t); }
  }, [inView, pct, delay]);
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600" style={{ fontFamily: "'Outfit', sans-serif" }}>{label}</span>
        <span className="text-[10px] text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>{curr}{unit} / {target}{unit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
        <div className="h-full rounded-full relative overflow-hidden"
          style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}bb, ${color})`, boxShadow: `0 0 8px ${color}40`, transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }}>
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>
      <p className="text-[9px] text-right mt-0.5" style={{ color, fontFamily: "'DM Mono', monospace" }}>{pct.toFixed(0)}%</p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN DASHBOARD
────────────────────────────────────────────── */
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [, setSparkReady] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [refreshSpin, setRefreshSpin] = useState(false);

  useEffect(() => {
    // Check auth (token must exist in localStorage)
    if (typeof window !== "undefined") {
      // Uncomment to enforce auth:
      // const token = localStorage.getItem("token");
      // if (!token) { router.push("/admin/login"); return; }
    }
    const t1 = setTimeout(() => setLoaded(true), 80);
    const t2 = setTimeout(() => setSparkReady(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshSpin(true);
    setTimeout(() => {
      setRefreshSpin(false);
      setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
  }, []);

  const navSections = [
    {
      heading: "Main Menu",
      items: [{ id: "dashboard", icon: <LayoutDashboard size={15} />, label: "Executive Dashboard", badge: undefined as number | undefined }],
    },
    {
      heading: "Filters & Views",
      items: [
        { id: "promoters", icon: <Users size={15} />, label: "By Promoter", badge: 12 as number | undefined },
        { id: "location",  icon: <MapPin size={15} />, label: "By Location",  badge: undefined as number | undefined },
        { id: "product",   icon: <Package size={15} />, label: "By Product",   badge: undefined as number | undefined },
      ],
    },
    {
      heading: "Operations",
      items: [
        { id: "attendance", icon: <Clock size={15} />,        label: "Attendance",        badge: 3 as number | undefined },
        { id: "reports",    icon: <FileText size={15} />,     label: "Reports & Exports", badge: undefined as number | undefined },
        { id: "support",    icon: <MessageSquare size={15} />, label: "Support & Feedback",badge: 2 as number | undefined },
      ],
    },
  ];

  let navDelay = 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse-badge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(81,145,131,0.5); }
          50%       { box-shadow: 0 0 0 4px rgba(81,145,131,0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.65); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-bar {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2.6s ease-in-out infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes notif-drop {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(81,145,131,0.3); border-radius: 2px; }
      `}</style>

      <div
        className="min-h-screen flex"
        style={{
          background: T.bg,
          fontFamily: "'Outfit', sans-serif",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* ═══════════════ FIXED SIDEBAR ═══════════════ */}
        <aside
          className="fixed top-0 left-0 h-screen flex flex-col overflow-hidden z-20"
          style={{
            width: sidebarOpen ? 244 : 64,
            transition: "width 0.38s cubic-bezier(0.22,1,0.36,1)",
            background: `linear-gradient(170deg, ${T.navy} 0%, ${T.navyMid} 65%, #122836 100%)`,
          }}
        >
          <SidebarCanvas />

          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5 border-b relative z-10 shrink-0"
            style={{ borderColor: "rgba(255, 255, 255, 0.18)" }}>
            <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, boxShadow: `0 0 14px ${T.primaryGlow}` }}>
              <Image src="/favicon.ico" alt="logo" width={22} height={22} className="rounded" />
            </div>
            {sidebarOpen && (
              <div style={{ animation: "fade-in 0.3s ease both" }}>
                <p className="font-black text-white text-[13px] leading-none" style={{ fontFamily: "'Fraunces', serif" }}>GroundUpMedia</p>
                <p className="text-[9px] mt-1 tracking-widest uppercase" style={{ color: T.primaryLight, fontFamily: "'DM Mono', monospace" }}>Sales Promoter Module</p>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="absolute top-[22px] -right-3 z-30 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all duration-200 hover:scale-110"
            style={{ background: T.navyMid, borderColor: `rgba(81,145,131,0.28)`, color: T.primaryLight }}
          >
            {sidebarOpen ? "‹" : "›"}
          </button>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto relative z-10 space-y-0.5">
            {navSections.map((sec) => (
              <div key={sec.heading} className="mb-3">
                {sidebarOpen && (
                  <p className="text-[9px] uppercase tracking-[0.2em] px-3 py-2 font-semibold"
                    style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>{sec.heading}</p>
                )}
                {sec.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={sidebarOpen ? item.label : ""}
                    active={activeNav === item.id}
                    badge={item.badge}
                    delay={navDelay += 40}
                    onClick={() => setActiveNav(item.id)}
                  />
                ))}
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="relative z-10 p-4 border-t shrink-0" style={{ borderColor: "rgba(81,145,131,0.14)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-black text-white"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, boxShadow: `0 0 10px ${T.primaryGlow}` }}>
                JD
              </div>
              {sidebarOpen && (
                <div style={{ animation: "fade-in 0.3s ease both" }}>
                  <p className="text-xs font-semibold text-white">Yesh sapkal</p>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>Regional Manager</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ═══════════════ MAIN CONTENT WITH MARGIN FOR SIDEBAR ═══════════════ */}
        <div 
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            marginLeft: sidebarOpen ? 244 : 64,
            transition: "margin-left 0.38s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* TOP BAR */}
          <header
            className="shrink-0 flex items-center justify-between px-6 py-3 border-b z-10 sticky top-0"
            style={{
              background: "rgba(240,244,243,0.88)",
              backdropFilter: "blur(18px)",
              borderColor: "rgba(81,145,131,0.12)",
            }}
          >
            <div>
              <h1 className="text-sm font-black text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
                Executive Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.primary, animation: "pulse-dot 1.6s ease-in-out infinite" }} />
                <LiveClock />
                <span className="text-[10px] text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>· {lastRefresh}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{
                  width: searchFocus ? "220px" : "140px",
                  borderColor: searchFocus ? T.primary : "rgba(81,145,131,0.2)",
                  background: searchFocus ? "white" : "rgba(81,145,131,0.05)",
                  boxShadow: searchFocus ? `0 0 0 3px ${T.primaryGlow}` : "none",
                  transition: "width 0.3s ease, border-color 0.2s, box-shadow 0.2s",
                }}
              >
                <Search size={12} color={T.primary} />
                <input
                  className="bg-transparent outline-none text-xs text-gray-600 placeholder-gray-400 w-full"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  placeholder="Search..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                />
              </div>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95"
                style={{ borderColor: "rgba(81,145,131,0.2)", background: "rgba(81,145,131,0.05)", color: T.primary }}
              >
                <RefreshCw size={13} style={{ animation: refreshSpin ? "spin 0.9s linear" : "none" }} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center relative transition-all duration-200 hover:shadow-md"
                  style={{ borderColor: "rgba(81,145,131,0.2)", background: "rgba(81,145,131,0.05)", color: T.primary }}
                >
                  <Bell size={13} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: "#ef4444", fontFamily: "'DM Mono', monospace", animation: "pulse-badge 2s ease-in-out infinite" }}>5</span>
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-11 w-72 rounded-2xl border shadow-2xl overflow-hidden z-50"
                    style={{ background: "white", borderColor: "rgba(81,145,131,0.15)", animation: "notif-drop 0.18s ease both" }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(81,145,131,0.1)" }}>
                      <p className="text-sm font-black text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>Notifications</p>
                      <button className="text-[10px] font-semibold" style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>Mark all read</button>
                    </div>
                    {[
                      { msg: "Rahul Sharma missed daily target by 45%", t: "2m ago", c: "#ef4444" },
                      { msg: "New lead added — Phoenix Mall Mumbai", t: "18m ago", c: T.primary },
                      { msg: "Q3 report is ready for download", t: "1h ago", c: "#f59e0b" },
                      { msg: "City Center KPI breach — 30% below", t: "3h ago", c: "#ef4444" },
                      { msg: "Ananya Mehta submitted field report", t: "5h ago", c: T.primary },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-3 px-4 py-2.5 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderColor: "rgba(81,145,131,0.06)" }}>
                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: n.c }} />
                        <div>
                          <p className="text-xs text-gray-700" style={{ fontFamily: "'Outfit', sans-serif" }}>{n.msg}</p>
                          <p className="text-[9px] text-gray-400 font-mono mt-0.5">{n.t}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white cursor-pointer hover:scale-105 transition-transform duration-200"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, boxShadow: `0 4px 10px ${T.primaryGlow}` }}>
                YS
              </div>
            </div>
          </header>

          {/* TICKER STRIP */}
          <div className="shrink-0 overflow-hidden py-2 border-b"
            style={{ background: `${T.primary}08`, borderColor: `${T.primary}18` }}>
            <div className="flex gap-10 whitespace-nowrap" style={{ animation: "ticker 36s linear infinite" }}>
              {[...Array(2)].map((_, rep) =>
                [
                  "📍 Phoenix Mall: ₹1,24,500 today",
                  "🎯 Daily target: 97% achieved",
                  "👥 847 total leads this month",
                  "📈 Conversion: 34.2% (+2.1%)",
                  "🏆 Top promoter: Meera Joshi (EMP-1018)",
                  "⚠️ 2 underperformers flagged",
                ].map((item, i) => (
                  <span key={`${rep}-${i}`} className="text-[10px] text-gray-500 flex items-center gap-8"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    {item} <span style={{ color: `${T.primary}45` }}>✦</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Greeting */}
            <div className="flex items-center justify-between" style={{ animation: "fade-up 0.5s ease 80ms both" }}>
              <div>
                <h2 className="text-lg font-black text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
                  Good morning, John!{" "}
                  <em className="not-italic" style={{ color: T.primary }}>Here&apos;s your performance overview.</em>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border shrink-0"
                style={{ borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
                <Target size={13} style={{ color: T.primary }} />
                <span className="text-[10px] font-bold" style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>Q4 · Week 3</span>
              </div>
            </div>

            {/* ── METRIC CARDS ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricCard
                title="Achieved Target" rawValue={485000} prefix="₹"
                sub="+12.5% vs yesterday" positive
                icon={<Award size={16} />}
                sparkData={[60,72,65,80,75,88,82,92,89,96,93,97]}
                delay={140} color={T.primary}
              />
              <MetricCard
                title="Daily Target" rawValue={500000} prefix="₹"
                sub="97% Progress" positive
                icon={<Target size={16} />}
                sparkData={[100,100,100,100,100,100,100,100,100,100,100,100]}
                delay={210} color="#3b82f6"
              />
              <MetricCard
                title="Total Leads" rawValue={847}
                sub="+23 today" positive
                icon={<Users size={16} />}
                sparkData={[600,640,660,700,710,740,770,790,810,825,838,847]}
                delay={280} color="#a855f7"
              />
              <MetricCard
                title="Avg Conversion" rawValue={34} suffix="%"
                sub="+2.1% this week" positive
                icon={<Zap size={16} />}
                sparkData={[28,30,29,31,32,30,33,32,34,33,35,34]}
                delay={350} color="#f59e0b"
              />
            </div>

            {/* ── ROW 2: LOCATIONS + ALERTS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Top Locations */}
              <div className="rounded-2xl border p-5 bg-white"
                style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 400ms both" }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-black text-gray-800 text-sm" style={{ fontFamily: "'Fraunces', serif" }}>Top Performing Locations</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>Revenue today</p>
                  </div>
                  <button className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 hover:shadow-sm"
                    style={{ color: T.primary, borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  <LocationBar name="Phoenix Mall, Mumbai"       value="₹1,24,500" pct={100} rank={1} delay={430} />
                  <LocationBar name="Select Citywalk, Delhi"     value="₹1,08,200" pct={87}  rank={2} delay={490} />
                  <LocationBar name="Forum Mall, Bangalore"      value="₹95,400"   pct={77}  rank={3} delay={550} />
                  <LocationBar name="Nexus Elante, Chandigarh"   value="₹82,100"   pct={66}  rank={4} delay={610} />
                  <LocationBar name="VR Mall, Chennai"           value="₹71,900"   pct={58}  rank={5} delay={670} />
                </div>
              </div>

              {/* Underperformer Alerts */}
              <div className="rounded-2xl border p-5 bg-white"
                style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 460ms both" }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-black text-gray-800 text-sm" style={{ fontFamily: "'Fraunces', serif" }}>Underperformer Alerts</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>Needs immediate attention</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'DM Mono', monospace" }}>
                    2 flagged
                  </span>
                </div>
                <div className="space-y-3">
                  <AlertItem name="Rahul Sharma (EMP-1042)"    status="45% below daily target" pct={55} delay={490} />
                  <AlertItem name="City Center, Hyderabad"     status="28% below location KPI"  pct={72} delay={550} />
                </div>

                {/* Gauges */}
                <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(81,145,131,0.1)" }}>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Team Score Gauges</p>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: "Sales",   pct: 97, color: T.primary },
                      { label: "Leads",   pct: 84, color: "#3b82f6" },
                      { label: "Conv.",   pct: 72, color: "#a855f7" },
                      { label: "Attend.", pct: 91, color: "#f59e0b" },
                    ].map(({ label, pct, color }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <Gauge pct={pct} color={color} size={50} />
                        <span className="text-[9px] text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 3: ATTENDANCE + QUICK ACTIONS + TARGETS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Attendance */}
              <div className="rounded-2xl border p-5 bg-white"
                style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 540ms both" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-800 text-sm" style={{ fontFamily: "'Fraunces', serif" }}>Today&apos;s Attendance</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.primary, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                    <span className="text-[9px] font-bold" style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>Live</span>
                  </div>
                </div>
                <div>
                  <AttRow name="Meera Joshi"  inT="09:02" outT="Ongoing" status="present" delay={570} />
                  <AttRow name="Rahul Sharma" inT="09:48" outT="Ongoing" status="late"    delay={610} />
                  <AttRow name="Ananya Mehta" inT="08:57" outT="18:05"   status="present" delay={650} />
                  <AttRow name="Vikram Nair"  inT="—"     outT="—"       status="absent"  delay={690} />
                  <AttRow name="Priya Kapoor" inT="09:10" outT="Ongoing" status="present" delay={730} />
                </div>
                <div className="mt-3 pt-3 border-t flex gap-4 text-[9px]"
                  style={{ borderColor: "rgba(81,145,131,0.1)", fontFamily: "'DM Mono', monospace" }}>
                  <span style={{ color: T.primary }}>✓ 3 present</span>
                  <span style={{ color: "#f59e0b" }}>⏰ 1 late</span>
                  <span style={{ color: "#ef4444" }}>✗ 1 absent</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border p-5 bg-white"
                style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 590ms both" }}>
                <h3 className="font-black text-gray-800 text-sm mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Add Lead",       icon: "➕", color: T.primary },
                    { label: "Assign Target",  icon: "🎯", color: "#3b82f6" },
                    { label: "Run Report",     icon: "📊", color: "#a855f7" },
                    { label: "Send Alert",     icon: "🔔", color: "#ef4444" },
                    { label: "Schedule Visit", icon: "📅", color: "#f59e0b" },
                    { label: "Export Data",    icon: "📤", color: "#22c55e" },
                  ].map(({ label, icon, color }, i) => (
                    <button
                      key={label}
                      className="flex items-center gap-2 p-3 rounded-xl border text-left group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                      style={{
                        borderColor: `${color}22`,
                        background: `${color}07`,
                        animation: `fade-up 0.4s ease ${630 + i * 45}ms both`,
                      }}
                    >
                      <span className="text-sm transition-transform duration-200 group-hover:scale-125">{icon}</span>
                      <span className="text-[10px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors"
                        style={{ fontFamily: "'Outfit', sans-serif" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Targets */}
              <div className="rounded-2xl border p-5 bg-white"
                style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 640ms both" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-800 text-sm" style={{ fontFamily: "'Fraunces', serif" }}>Monthly Targets</h3>
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `${T.primary}12`, color: T.primary, border: `1px solid ${T.primary}25`, fontFamily: "'DM Mono', monospace" }}>
                    On Track ✓
                  </span>
                </div>
                <div className="space-y-4">
                  <TargetBar label="Revenue"    curr={48.6} target={60}   unit="L"  color={T.primary} delay={0}   />
                  <TargetBar label="Leads"      curr={847}  target={1000} unit=""   color="#3b82f6"   delay={120} />
                  <TargetBar label="Conversion" curr={34}   target={40}   unit="%"  color="#a855f7"   delay={240} />
                  <TargetBar label="Footfall"   curr={12.4} target={15}   unit="K"  color="#f59e0b"   delay={360} />
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}