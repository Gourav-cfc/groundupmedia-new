"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  LayoutDashboard, Users, MapPin, Package,
  Clock, FileText, MessageSquare, Bell,
  TrendingUp, TrendingDown, Search, ChevronRight,
  Target, Zap, Award, AlertTriangle, RefreshCw,
  Gift, Sparkles, Heart, Calendar, Menu, X,
} from "lucide-react";

/* ──────────────────────────────────────────────
   THEME & RESPONSIVE BREAKPOINTS
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

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
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


function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.lg);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
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
  return <span className="font-mono text-[10px] sm:text-xs tabular-nums tracking-widest" style={{ color: T.primary }}>{t}</span>;
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
   SPARKLINE (responsive)
────────────────────────────────────────────── */
function Sparkline({ data, color, active }: { data: number[]; color: string; active: boolean }) {
  const max = Math.max(...data), min = Math.min(...data);
  const W = 80, H = 30; // Smaller for mobile
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / (max - min || 1)) * (H - 4) - 2,
  }));
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const area = `${d} L ${W} ${H} L 0 ${H} Z`;
  const gId = `sg-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-8 sm:h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5"
        strokeDasharray="300" strokeDashoffset={active ? "0" : "300"}
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)" }}
        strokeLinecap="round" />
      {pts[pts.length - 1] && (
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2"
          fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────
   CANVAS SIDEBAR BG (optimized for mobile)
────────────────────────────────────────────── */
function SidebarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pts: any[] = [];
    
    const resize = () => { 
      c.width = c.offsetWidth; 
      c.height = c.offsetHeight;
      
      // Reduce particle count on mobile for performance
      const particleCount = window.innerWidth < 768 ? 8 : 18;
      pts = Array.from({ length: particleCount }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      }));
    };
    
    resize(); 
    window.addEventListener("resize", resize);
    
    const draw = () => {
      if (!ctx || !c) return;
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p, i) => {
        pts.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(81,145,131,${0.1 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        });
        ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(81,145,131,0.25)"; ctx.fill();
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
   DONUT GAUGE (responsive)
────────────────────────────────────────────── */
function Gauge({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const responsiveSize = typeof window !== 'undefined' && window.innerWidth < 640 ? size * 0.8 : size;
  const r = responsiveSize / 2 - 6, circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDash(pct / 100 * circ), 400); return () => clearTimeout(t); }, [pct, circ]);
  return (
    <svg width={responsiveSize} height={responsiveSize} viewBox={`0 0 ${responsiveSize} ${responsiveSize}`}>
      <circle cx={responsiveSize / 2} cy={responsiveSize / 2} r={r} fill="none" stroke="rgba(81,145,131,0.1)" strokeWidth="4" />
      <circle cx={responsiveSize / 2} cy={responsiveSize / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ - dash}
        strokeLinecap="round" transform={`rotate(-90 ${responsiveSize / 2} ${responsiveSize / 2})`}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s", filter: `drop-shadow(0 0 3px ${color})` }} />
      <text x={responsiveSize / 2} y={responsiveSize / 2 + 3} textAnchor="middle" fill={color}
        fontSize="8" fontWeight="700" fontFamily="'DM Mono', monospace">{pct}%</text>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   SIDEBAR ITEM (with touch optimization)
────────────────────────────────────────────── */
function SidebarItem({ icon, label, active, badge, delay = 0, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean;
  badge?: number; delay?: number; onClick?: () => void;
}) {
  const [touched, setTouched] = useState(false);
  
  return (
    <div 
      onClick={onClick}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTouched(false)}
      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl cursor-pointer group relative overflow-hidden active:scale-95 transition-transform touch-manipulation"
      style={{
        background: active || touched ? `linear-gradient(135deg, rgba(81,145,131,0.2), rgba(81,145,131,0.06))` : "transparent",
        borderLeft: active ? `2px solid ${T.primary}` : "2px solid transparent",
        transition: "background 0.2s, border-color 0.2s",
        animation: `slide-in-left 0.42s ease ${delay}ms both`,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {active && <div className="absolute inset-0 rounded-xl" style={{ background: `radial-gradient(circle at 15% 50%, rgba(81,145,131,0.15) 0%, transparent 70%)` }} />}
      <span className="relative z-10 transition-transform duration-200 group-hover:scale-110"
        style={{ color: active ? T.primary : "rgba(255,255,255,0.45)" }}>
        {icon}
      </span>
      {label && (
        <span className="relative z-10 text-xs sm:text-sm flex-1 transition-colors duration-200 truncate"
          style={{ color: active ? "white" : "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: active ? 600 : 400 }}>
          {label}
        </span>
      )}
      {badge && label && (
        <span className="relative z-10 text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full text-white shrink-0"
          style={{ background: T.primary, fontFamily: "'DM Mono', monospace", animation: "pulse-badge 2.2s ease-in-out infinite" }}>
          {badge}
        </span>
      )}
      {active && label && <ChevronRight size={12} className="relative z-10 shrink-0 hidden sm:block" style={{ color: T.primary }} />}
    </div>
  );
}

/* ──────────────────────────────────────────────
   METRIC CARD (responsive)
────────────────────────────────────────────── */
function MetricCard({ title, rawValue, prefix, suffix, sub, positive, icon, sparkData, delay, color }: {
  title: string; rawValue: number; prefix?: string; suffix?: string;
  sub: string; positive: boolean; icon: React.ReactNode;
  sparkData: number[]; delay: number; color: string;
}) {
  const { ref, inView } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  
  return (
    <div ref={ref}
      className="relative overflow-hidden rounded-xl sm:rounded-2xl border cursor-default touch-manipulation"
      style={{
        background: "white",
        borderColor: "rgba(81,145,131,0.12)",
        boxShadow: hovered ? `0 8px 20px rgba(81,145,131,0.15)` : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 0.3s, transform 0.3s",
        animation: `fade-up 0.6s ease ${delay}ms both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full blur-2xl pointer-events-none opacity-15"
        style={{ background: color }} />
      {hovered && (
        <div className="absolute inset-0 pointer-events-none rounded-xl sm:rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${color}07, transparent, ${color}05)` }} />
      )}
      <div className="relative z-10 p-3 sm:p-5">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate" 
               style={{ fontFamily: "'DM Mono', monospace" }}>{title}</p>
            <p className="text-lg sm:text-2xl font-black truncate" style={{ fontFamily: "'Outfit', sans-serif", color: T.navy }}>
              {inView ? <AnimNum raw={rawValue} prefix={prefix} suffix={suffix} /> : `${prefix ?? ""}0${suffix ?? ""}`}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ml-2"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
            {icon}
          </div>
        </div>
        <Sparkline data={sparkData} color={color} active={inView} />
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-2">
          {positive ? <TrendingUp size={10} color="#22c55e" /> : <TrendingDown size={10} color="#ef4444" />}
          <span className="text-[8px] sm:text-[10px] font-semibold truncate" 
            style={{ color: positive ? "#22c55e" : "#ef4444", fontFamily: "'DM Mono', monospace" }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   LOCATION BAR (responsive)
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
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-[10px] font-black flex items-center justify-center text-white shrink-0"
            style={{ background: T.primary, fontFamily: "'DM Mono', monospace" }}>{rank}</span>
          <span className="text-[11px] sm:text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors truncate" 
            style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</span>
        </div>
        <span className="text-[11px] sm:text-xs font-bold shrink-0 ml-2" 
          style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>{value}</span>
      </div>
      <div className="h-1 sm:h-1.5 rounded-full overflow-hidden" style={{ background: T.primaryPale }}>
        <div className="h-full rounded-full relative overflow-hidden"
          style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${T.primaryDark}, ${T.primaryLight})`, transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }}>
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ALERT ITEM (responsive)
────────────────────────────────────────────── */
function AlertItem({ name, status, pct, delay }: {
  name: string; status: string; pct: number; delay: number;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3.5 rounded-xl border group hover:shadow-md transition-all duration-200 touch-manipulation"
      style={{ background: "rgba(239,68,68,0.03)", borderColor: "rgba(239,68,68,0.15)", animation: `fade-up 0.5s ease ${delay}ms both` }}>
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.18)" }}>
        <AlertTriangle size={14} color="#ef4444" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</p>
        <p className="text-[9px] sm:text-[10px] text-red-500 mt-0.5 truncate" style={{ fontFamily: "'DM Mono', monospace" }}>{status}</p>
      </div>
      <Gauge pct={pct} color="#ef4444" size={40} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   ATTENDANCE ROW (responsive)
────────────────────────────────────────────── */
function AttRow({ name, inT, outT, status, delay }: {
  name: string; inT: string; outT: string;
  status: "present" | "late" | "absent"; delay: number;
}) {
  const sc = status === "present" ? T.primary : status === "late" ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 px-1.5 rounded-lg transition-colors duration-150 touch-manipulation"
      style={{ animation: `fade-up 0.4s ease ${delay}ms both` }}>
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white"
        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})` }}>
        {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-xs font-semibold text-gray-700 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</p>
        <p className="text-[8px] sm:text-[9px] text-gray-400 font-mono mt-0.5">{inT} → {outT}</p>
      </div>
      <span className="text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full capitalize shrink-0"
        style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}25`, fontFamily: "'DM Mono', monospace" }}>
        {status}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PROGRESS BAR (responsive)
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] sm:text-xs font-semibold text-gray-600" style={{ fontFamily: "'Outfit', sans-serif" }}>{label}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>{curr}{unit} / {target}{unit}</span>
      </div>
      <div className="h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
        <div className="h-full rounded-full relative overflow-hidden"
          style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}bb, ${color})`, boxShadow: `0 0 8px ${color}40`, transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }}>
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>
      <p className="text-[8px] sm:text-[9px] text-right mt-0.5" style={{ color, fontFamily: "'DM Mono', monospace" }}>{pct.toFixed(0)}%</p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   GIFTING ITEM CARD (responsive)
────────────────────────────────────────────── */
function GiftItem({ promoter, gift, date, status, points, delay }: {
  promoter: string; gift: string; date: string; status: "delivered" | "pending" | "processing"; points: number; delay: number;
}) {
  const statusColors = {
    delivered: { bg: `${T.primary}15`, text: T.primary, border: `${T.primary}25` },
    pending: { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b25" },
    processing: { bg: "#3b82f615", text: "#3b82f6", border: "#3b82f625" },
  };
  const sc = statusColors[status];
  
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-all duration-200 touch-manipulation"
      style={{ animation: `fade-up 0.4s ease ${delay}ms both` }}>
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: `${T.primary}10`, border: `1px solid ${T.primary}20` }}>
        <Gift size={14} style={{ color: T.primary }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{promoter}</p>
          <span className="text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full capitalize shrink-0"
            style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontFamily: "'DM Mono', monospace" }}>
            {status}
          </span>
        </div>
        <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 truncate">{gift} · {date}</p>
        <p className="text-[8px] sm:text-[9px] font-mono mt-1" style={{ color: T.primary }}>{points} points</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   INVENTORY ITEM (responsive)
────────────────────────────────────────────── */
function InventoryItem({ name, stock, threshold, color, delay }: {
  name: string; stock: number; threshold: number; color: string; delay: number;
}) {
  const isLow = stock <= threshold;
  
  return (
    <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-gray-100 last:border-0"
      style={{ animation: `fade-up 0.3s ease ${delay}ms both` }}>
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0" style={{ background: isLow ? "#ef4444" : color }} />
        <span className="text-[11px] sm:text-xs text-gray-700 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
        <span className="text-[9px] sm:text-[10px] font-mono" style={{ color: isLow ? "#ef4444" : "inherit" }}>{stock} units</span>
        {isLow && <AlertTriangle size={8} color="#ef4444" />}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   GIFTING PAGE COMPONENT (responsive)
────────────────────────────────────────────── */
function GiftingPage() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Gifting Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Gifts Redeemed" rawValue={1248}
          sub="+18.2% vs last month" positive
          icon={<Gift size={14} />}
          sparkData={[820,890,950,1020,1080,1120,1180,1210,1230,1240,1245,1248]}
          delay={140} color="#e83e8c"
        />
        <MetricCard
          title="Active Promoters" rawValue={342}
          sub="+12 this week" positive
          icon={<Users size={14} />}
          sparkData={[300,310,315,320,325,330,335,338,340,341,342,342]}
          delay={210} color="#3b82f6"
        />
        <MetricCard
          title="Points Earned" rawValue={45800} prefix=""
          sub="+5,200 this month" positive
          icon={<Sparkles size={14} />}
          sparkData={[32000,35000,37500,39000,41000,42500,43800,44500,45200,45500,45700,45800]}
          delay={280} color="#f59e0b"
        />
        <MetricCard
          title="Gift Inventory" rawValue={847}
          sub="23 items low stock" positive={false}
          icon={<Package size={14} />}
          sparkData={[920,905,895,885,875,870,865,860,855,850,848,847]}
          delay={350} color="#ef4444"
        />
      </div>

      {/* Gift Categories & Recent Redemptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gift Categories */}
        <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white lg:col-span-1"
          style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 400ms both" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-black text-gray-800 text-sm sm:text-base" style={{ fontFamily: "'Fraunces', serif" }}>Gift Categories</h3>
            <span className="text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded-full"
              style={{ background: `${T.primary}12`, color: T.primary, fontFamily: "'DM Mono', monospace" }}>
              8 active
            </span>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[
              { name: "Electronics", value: 45, color: "#3b82f6" },
              { name: "Gift Vouchers", value: 82, color: "#e83e8c" },
              { name: "Brand Merch", value: 68, color: T.primary },
              { name: "Experience Days", value: 31, color: "#f59e0b" },
              { name: "Premium Items", value: 24, color: "#a855f7" },
            ].map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] sm:text-xs text-gray-600" style={{ fontFamily: "'Outfit', sans-serif" }}>{cat.name}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono" style={{ color: cat.color }}>{cat.value}%</span>
                </div>
                <div className="h-1 sm:h-1.5 rounded-full overflow-hidden" style={{ background: `${cat.color}15` }}>
                  <div className="h-full rounded-full" style={{ width: `${cat.value}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-[9px] sm:text-[10px] font-semibold py-2 sm:py-2.5 rounded-lg border transition-all hover:shadow-sm text-center touch-manipulation"
            style={{ color: T.primary, borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
            Manage Categories →
          </button>
        </div>

        {/* Recent Redemptions */}
        <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white lg:col-span-2"
          style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 460ms both" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Recent Gift Redemptions</h3>
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>Last 7 days activity</p>
            </div>
            <button className="text-[9px] sm:text-[10px] font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all hover:shadow-sm shrink-0 ml-2 touch-manipulation"
              style={{ color: T.primary, borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
              View All →
            </button>
          </div>
          <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1">
            <GiftItem promoter="Meera Joshi" gift="Apple AirPods" date="Today, 10:30 AM" status="delivered" points={2500} delay={490} />
            <GiftItem promoter="Rahul Sharma" gift="Amazon Voucher ₹2000" date="Yesterday" status="pending" points={2000} delay={530} />
            <GiftItem promoter="Ananya Mehta" gift="Branded Jacket" date="2 days ago" status="delivered" points={1800} delay={570} />
            <GiftItem promoter="Vikram Nair" gift="Smart Watch" date="3 days ago" status="processing" points={3200} delay={610} />
            <GiftItem promoter="Priya Kapoor" gift="Spa Voucher" date="4 days ago" status="delivered" points={1500} delay={650} />
            <GiftItem promoter="Arjun Singh" gift="Bluetooth Speaker" date="5 days ago" status="delivered" points={1200} delay={690} />
            <GiftItem promoter="Neha Gupta" gift="Dining Experience" date="6 days ago" status="processing" points={2800} delay={730} />
          </div>
        </div>
      </div>

      {/* Inventory & Points Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Status */}
        <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
          style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 540ms both" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Gift Inventory Status</h3>
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>Low stock alerts</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-600"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                3 low
              </span>
              <RefreshCw size={10} style={{ color: T.primary }} />
            </div>
          </div>
          <div className="space-y-1">
            <InventoryItem name="Apple AirPods" stock={4} threshold={10} color={T.primary} delay={570} />
            <InventoryItem name="Amazon Vouchers" stock={23} threshold={20} color={T.primary} delay={600} />
            <InventoryItem name="Branded T-Shirts" stock={8} threshold={15} color={T.primary} delay={630} />
            <InventoryItem name="Smart Watches" stock={6} threshold={10} color={T.primary} delay={660} />
            <InventoryItem name="Spa Vouchers" stock={15} threshold={15} color={T.primary} delay={690} />
            <InventoryItem name="Bluetooth Speakers" stock={3} threshold={12} color={T.primary} delay={720} />
          </div>
          <button className="w-full mt-4 text-[9px] sm:text-[10px] font-semibold py-2 sm:py-2.5 rounded-lg border transition-all hover:shadow-sm touch-manipulation"
            style={{ color: T.primary, borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
            Restock Request →
          </button>
        </div>

        {/* Points Leaderboard */}
        <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
          style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 590ms both" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Top Promoters by Points</h3>
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>This quarter</p>
            </div>
            <Heart size={12} className="shrink-0 ml-2" style={{ color: T.primary }} />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {[
              { name: "Meera Joshi", points: 12500, rank: 1, change: "+2" },
              { name: "Ananya Mehta", points: 10800, rank: 2, change: "0" },
              { name: "Priya Kapoor", points: 9500, rank: 3, change: "+1" },
              { name: "Vikram Nair", points: 8200, rank: 4, change: "-1" },
              { name: "Arjun Singh", points: 7800, rank: 5, change: "+3" },
            ].map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 border-b border-gray-100 last:border-0"
                style={{ animation: `fade-up 0.3s ease ${620 + i * 40}ms both` }}>
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[8px] sm:text-[9px] font-black flex items-center justify-center text-white shrink-0"
                  style={{ background: p.rank === 1 ? "#e83e8c" : T.primary, opacity: p.rank === 1 ? 1 : 0.8 }}>
                  {p.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{p.name}</p>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                    <span className="text-[8px] sm:text-[9px] font-mono" style={{ color: T.primary }}>{p.points.toLocaleString()} pts</span>
                    <span className="text-[7px] sm:text-[8px] text-green-600">{p.change}</span>
                  </div>
                </div>
                <Award size={12} className="shrink-0" style={{ color: p.rank === 1 ? "#e83e8c" : T.primary, opacity: p.rank === 1 ? 1 : 0.5 }} />
              </div>
            ))}
          </div>
          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t flex justify-between items-center"
            style={{ borderColor: "rgba(81,145,131,0.1)" }}>
            <span className="text-[8px] sm:text-[9px] text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>Next rewards: 15,000 pts</span>
            <button className="text-[8px] sm:text-[9px] font-semibold touch-manipulation" style={{ color: T.primary }}>View All →</button>
          </div>
        </div>
      </div>

      {/* Upcoming Gift Events */}
      <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
        style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 640ms both" }}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <Calendar size={14} className="shrink-0" style={{ color: T.primary }} />
            <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Upcoming Gifting Campaigns</h3>
          </div>
          <button className="text-[8px] sm:text-[9px] font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all hover:shadow-sm shrink-0 ml-2 touch-manipulation"
            style={{ color: T.primary, borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
            Create Campaign
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[
            { name: "Festive Special", date: "Oct 15 - Nov 15", gifts: "12 items", budget: "₹85,000" },
            { name: "Year-End Rewards", date: "Dec 1 - Dec 31", gifts: "24 items", budget: "₹1,50,000" },
            { name: "Promoter Appreciation", date: "Jan 5, 2024", gifts: "8 items", budget: "₹45,000" },
          ].map((camp, i) => (
            <div key={camp.name} className="p-3 sm:p-4 rounded-xl border group hover:shadow-md transition-all cursor-pointer touch-manipulation"
              style={{ borderColor: `${T.primary}15`, animation: `fade-up 0.4s ease ${680 + i * 50}ms both` }}>
              <p className="text-[11px] sm:text-xs font-bold text-gray-800 group-hover:text-gray-900 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{camp.name}</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 mt-1 font-mono truncate">{camp.date}</p>
              <div className="flex items-center justify-between mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[9px]" style={{ color: T.primary }}>{camp.gifts}</span>
                <span className="text-[8px] sm:text-[9px] font-bold">{camp.budget}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN DASHBOARD (fully responsive)
────────────────────────────────────────────── */
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [, setSparkReady] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [refreshSpin, setRefreshSpin] = useState(false);

  const isMobile = useMobileDetect();

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 80);
    const t2 = setTimeout(() => setSparkReady(true), 900);
    
    // Close mobile sidebar when navigating
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
    
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [activeNav, isMobile]);

  useEffect(() => {
    // Auto-close sidebar on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleRefresh = useCallback(() => {
    setRefreshSpin(true);
    setTimeout(() => {
      setRefreshSpin(false);
      setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  const navSections = [
    {
      heading: "Main Menu",
      items: [
        { id: "dashboard", icon: <LayoutDashboard size={14} />, label: "Executive Dashboard", badge: undefined as number | undefined },
      ],
    },
    {
      heading: "Promoter Management",
      items: [
        { id: "promoters", icon: <Users size={14} />, label: "All Promoters", badge: 12 as number | undefined },
        { id: "gifting", icon: <Gift size={14} />, label: "Branding & Gifting", badge: 5 as number | undefined },
      ],
    },
    {
      heading: "Filters & Views",
      items: [
        { id: "location",  icon: <MapPin size={14} />, label: "By Location",  badge: undefined as number | undefined },
        { id: "product",   icon: <Package size={14} />, label: "By Product",   badge: undefined as number | undefined },
      ],
    },
    {
      heading: "Operations",
      items: [
        { id: "attendance", icon: <Clock size={14} />,        label: "Attendance",        badge: 3 as number | undefined },
        { id: "reports",    icon: <FileText size={14} />,     label: "Reports & Exports", badge: undefined as number | undefined },
        { id: "support",    icon: <MessageSquare size={14} />, label: "Support & Feedback",badge: 2 as number | undefined },
      ],
    },
  ];

  let navDelay = 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          -webkit-tap-highlight-color: transparent;
        }

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
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(81,145,131,0.3); border-radius: 2px; }
        
        .mobile-sidebar {
          animation: slide-in-right 0.3s ease-out;
        }
        
        @media (max-width: 1023px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
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
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="fixed top-3 left-3 z-30 w-10 h-10 rounded-xl border flex items-center justify-center"
            style={{ 
              background: "white", 
              borderColor: `${T.primary}28`,
              boxShadow: `0 2px 8px ${T.primaryGlow}`,
            }}
          >
            <Menu size={18} style={{ color: T.primary }} />
          </button>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside
          className={`
            fixed top-0 left-0 h-screen flex flex-col overflow-hidden z-50
            ${isMobile ? (mobileSidebarOpen ? 'mobile-sidebar' : 'hidden') : ''}
          `}
          style={{
            width: isMobile ? 260 : (sidebarOpen ? 244 : 64),
            transition: isMobile ? 'none' : "width 0.38s cubic-bezier(0.22,1,0.36,1)",
            background: `linear-gradient(170deg, ${T.navy} 0%, ${T.navyMid} 65%, #122836 100%)`,
          }}
        >
          <SidebarCanvas />

          {/* Mobile Close Button */}
          {isMobile && mobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full border flex items-center justify-center"
              style={{ background: T.navyMid, borderColor: `rgba(81,145,131,0.28)`, color: T.primaryLight }}
            >
              <X size={14} />
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5 border-b relative z-10 shrink-0"
            style={{ borderColor: "rgba(255, 255, 255, 0.18)" }}>
            <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, boxShadow: `0 0 14px ${T.primaryGlow}` }}>
              <Image src="/favicon.ico" alt="logo" width={22} height={22} className="rounded" />
            </div>
            {(sidebarOpen || isMobile) && (
              <div style={{ animation: "fade-in 0.3s ease both" }} className="min-w-0 flex-1">
                <p className="font-black text-white text-[11px] sm:text-[13px] leading-none truncate" style={{ fontFamily: "'Fraunces', serif" }}>GroundUpMedia</p>
                <p className="text-[8px] sm:text-[9px] mt-1 tracking-widest uppercase truncate" style={{ color: T.primaryLight, fontFamily: "'DM Mono', monospace" }}>Sales Promoter Module</p>
              </div>
            )}
          </div>

          {/* Collapse toggle - Desktop only */}
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="absolute top-[22px] -right-3 z-30 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all duration-200 hover:scale-110"
              style={{ background: T.navyMid, borderColor: `rgba(81,145,131,0.28)`, color: T.primaryLight }}
            >
              {sidebarOpen ? "‹" : "›"}
            </button>
          )}

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto relative z-10 space-y-0.5">
            {navSections.map((sec) => (
              <div key={sec.heading} className="mb-3">
                {(sidebarOpen || isMobile) && (
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] px-3 py-2 font-semibold"
                    style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>{sec.heading}</p>
                )}
                {sec.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={(sidebarOpen || isMobile) ? item.label : ""}
                    active={activeNav === item.id}
                    badge={item.badge}
                    delay={navDelay += 40}
                    onClick={() => handleNavClick(item.id)}
                  />
                ))}
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="relative z-10 p-4 border-t shrink-0" style={{ borderColor: "rgba(81,145,131,0.14)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] sm:text-[11px] font-black text-white"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, boxShadow: `0 0 10px ${T.primaryGlow}` }}>
                JD
              </div>
              {(sidebarOpen || isMobile) && (
                <div style={{ animation: "fade-in 0.3s ease both" }} className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">Atish Rahangdale</p>
                  <p className="text-[8px] sm:text-[9px] truncate" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>Regional Manager</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <div 
          className="flex-1 flex flex-col overflow-hidden main-content"
          style={{
            marginLeft: !isMobile ? (sidebarOpen ? 244 : 64) : 0,
            transition: "margin-left 0.38s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* TOP BAR */}
          <header
            className="shrink-0 flex items-center justify-between px-3 sm:px-6 py-3 border-b z-10 sticky top-0"
            style={{
              background: "rgba(240,244,243,0.88)",
              backdropFilter: "blur(18px)",
              borderColor: "rgba(81,145,131,0.12)",
            }}
          >
            <div className="min-w-0 flex-1 ml-8 sm:ml-0">
              <h1 className="text-xs sm:text-sm font-black text-gray-800 truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                {activeNav === "dashboard" && "Executive Dashboard"}
                {activeNav === "gifting" && "Branding & Promoters Gifting"}
                {activeNav === "promoters" && "Promoter Management"}
                {activeNav === "location" && "Location Performance"}
                {activeNav === "product" && "Product Analytics"}
                {activeNav === "attendance" && "Attendance Tracking"}
                {activeNav === "reports" && "Reports & Exports"}
                {activeNav === "support" && "Support & Feedback"}
              </h1>
              <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: T.primary, animation: "pulse-dot 1.6s ease-in-out infinite" }} />
                <LiveClock />
                <span className="text-[8px] sm:text-[10px] text-gray-400 hidden xs:inline" style={{ fontFamily: "'DM Mono', monospace" }}>· {lastRefresh}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search - Hidden on very small screens */}
              <div
                className="hidden sm:flex items-center gap-2 rounded-xl border px-2 sm:px-3 py-1.5 sm:py-2"
                style={{
                  width: searchFocus ? "180px" : "120px",
                  borderColor: searchFocus ? T.primary : "rgba(81,145,131,0.2)",
                  background: searchFocus ? "white" : "rgba(81,145,131,0.05)",
                  boxShadow: searchFocus ? `0 0 0 3px ${T.primaryGlow}` : "none",
                  transition: "width 0.3s ease, border-color 0.2s, box-shadow 0.2s",
                }}
              >
                <Search size={10} color={T.primary} />
                <input
                  className="bg-transparent outline-none text-[10px] sm:text-xs text-gray-600 placeholder-gray-400 w-full"
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
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation"
                style={{ borderColor: "rgba(81,145,131,0.2)", background: "rgba(81,145,131,0.05)", color: T.primary }}
              >
                <RefreshCw size={11} style={{ animation: refreshSpin ? "spin 0.9s linear" : "none" }} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center relative transition-all duration-200 hover:shadow-md touch-manipulation"
                  style={{ borderColor: "rgba(81,145,131,0.2)", background: "rgba(81,145,131,0.05)", color: T.primary }}
                >
                  <Bell size={11} />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full text-[7px] sm:text-[8px] font-bold text-white flex items-center justify-center"
                    style={{ background: "#ef4444", fontFamily: "'DM Mono', monospace", animation: "pulse-badge 2s ease-in-out infinite" }}>5</span>
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-10 sm:top-11 w-64 sm:w-72 rounded-xl sm:rounded-2xl border shadow-2xl overflow-hidden z-50"
                    style={{ background: "white", borderColor: "rgba(81,145,131,0.15)", animation: "notif-drop 0.18s ease both" }}>
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b" style={{ borderColor: "rgba(81,145,131,0.1)" }}>
                      <p className="text-xs sm:text-sm font-black text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>Notifications</p>
                      <button className="text-[8px] sm:text-[9px] font-semibold touch-manipulation" style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>Mark all read</button>
                    </div>
                    {[
                      { msg: "Rahul Sharma missed daily target by 45%", t: "2m ago", c: "#ef4444" },
                      { msg: "New lead added — Phoenix Mall Mumbai", t: "18m ago", c: T.primary },
                      { msg: "Q3 report is ready for download", t: "1h ago", c: "#f59e0b" },
                      { msg: "City Center KPI breach — 30% below", t: "3h ago", c: "#ef4444" },
                      { msg: "Ananya Mehta submitted field report", t: "5h ago", c: T.primary },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer touch-manipulation"
                        style={{ borderColor: "rgba(81,145,131,0.06)" }}>
                        <div className="w-1 h-1 rounded-full mt-1.5 sm:mt-2 shrink-0" style={{ background: n.c }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-gray-700 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{n.msg}</p>
                          <p className="text-[8px] sm:text-[9px] text-gray-400 font-mono mt-0.5">{n.t}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[9px] sm:text-[11px] font-black text-white cursor-pointer hover:scale-105 transition-transform duration-200 touch-manipulation"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, boxShadow: `0 4px 10px ${T.primaryGlow}` }}>
                YS
              </div>
            </div>
          </header>

          {/* TICKER STRIP */}
          <div className="shrink-0 overflow-hidden py-1.5 sm:py-2 border-b"
            style={{ background: `${T.primary}08`, borderColor: `${T.primary}18` }}>
            <div className="flex gap-6 sm:gap-10 whitespace-nowrap" style={{ animation: "ticker 36s linear infinite" }}>
              {[...Array(2)].map((_, rep) =>
                [
                  "📍 Phoenix Mall: ₹1,24,500",
                  "🎯 97% achieved",
                  "👥 847 total leads",
                  "📈 34.2% conversion",
                  "🏆 Meera Joshi",
                  "⚠️ 2 flagged",
                  "🎁 1,248 redemptions",
                  "✨ 45.8K points",
                ].map((item, i) => (
                  <span key={`${rep}-${i}`} className="text-[8px] sm:text-[10px] text-gray-500 flex items-center gap-4 sm:gap-8"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    {item} <span style={{ color: `${T.primary}45` }}>✦</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
            {activeNav === "dashboard" && (
              <>
                {/* Greeting */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ animation: "fade-up 0.5s ease 80ms both" }}>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
                      Good morning, John!{" "}
                      <em className="not-italic block sm:inline text-sm sm:text-lg" style={{ color: T.primary }}>Here&apos;s your overview.</em>
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                      {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border shrink-0 self-start"
                    style={{ borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
                    <Target size={12} style={{ color: T.primary }} />
                    <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>Q4 · Week 3</span>
                  </div>
                </div>

                {/* ── METRIC CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <MetricCard
                    title="Achieved Target" rawValue={485000} prefix="₹"
                    sub="+12.5% vs yesterday" positive
                    icon={<Award size={14} />}
                    sparkData={[60,72,65,80,75,88,82,92,89,96,93,97]}
                    delay={140} color={T.primary}
                  />
                  <MetricCard
                    title="Daily Target" rawValue={500000} prefix="₹"
                    sub="97% Progress" positive
                    icon={<Target size={14} />}
                    sparkData={[100,100,100,100,100,100,100,100,100,100,100,100]}
                    delay={210} color="#3b82f6"
                  />
                  <MetricCard
                    title="Total Leads" rawValue={847}
                    sub="+23 today" positive
                    icon={<Users size={14} />}
                    sparkData={[600,640,660,700,710,740,770,790,810,825,838,847]}
                    delay={280} color="#a855f7"
                  />
                  <MetricCard
                    title="Avg Conversion" rawValue={34} suffix="%"
                    sub="+2.1% this week" positive
                    icon={<Zap size={14} />}
                    sparkData={[28,30,29,31,32,30,33,32,34,33,35,34]}
                    delay={350} color="#f59e0b"
                  />
                </div>

                {/* ── ROW 2: LOCATIONS + ALERTS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Top Locations */}
                  <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
                    style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 400ms both" }}>
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Top Performing Locations</h3>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>Revenue today</p>
                      </div>
                      <button className="text-[8px] sm:text-[9px] font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all hover:shadow-sm shrink-0 ml-2 touch-manipulation"
                        style={{ color: T.primary, borderColor: `${T.primary}28`, background: `${T.primary}07` }}>
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <LocationBar name="Phoenix Mall, Mumbai" value="₹1,24,500" pct={100} rank={1} delay={430} />
                      <LocationBar name="Select Citywalk, Delhi" value="₹1,08,200" pct={87} rank={2} delay={490} />
                      <LocationBar name="Forum Mall, Bangalore" value="₹95,400" pct={77} rank={3} delay={550} />
                      <LocationBar name="Nexus Elante, Chandigarh" value="₹82,100" pct={66} rank={4} delay={610} />
                      <LocationBar name="VR Mall, Chennai" value="₹71,900" pct={58} rank={5} delay={670} />
                    </div>
                  </div>

                  {/* Underperformer Alerts */}
                  <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
                    style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 460ms both" }}>
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Underperformer Alerts</h3>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>Needs immediate attention</p>
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-1 rounded-full shrink-0 ml-2"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'DM Mono', monospace" }}>
                        2 flagged
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <AlertItem name="Rahul Sharma (EMP-1042)" status="45% below target" pct={55} delay={490} />
                      <AlertItem name="City Center, Hyderabad" status="28% below location KPI" pct={72} delay={550} />
                    </div>

                    {/* Gauges */}
                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t" style={{ borderColor: "rgba(81,145,131,0.1)" }}>
                      <p className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Team Score Gauges</p>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: "Sales", pct: 97, color: T.primary },
                          { label: "Leads", pct: 84, color: "#3b82f6" },
                          { label: "Conv.", pct: 72, color: "#a855f7" },
                          { label: "Attend.", pct: 91, color: "#f59e0b" },
                        ].map(({ label, pct, color }) => (
                          <div key={label} className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <Gauge pct={pct} color={color} size={40} />
                            <span className="text-[7px] sm:text-[8px] text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── ROW 3: ATTENDANCE + QUICK ACTIONS + TARGETS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Attendance */}
                  <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
                    style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 540ms both" }}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Today&apos;s Attendance</h3>
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: T.primary, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                        <span className="text-[7px] sm:text-[8px] font-bold" style={{ color: T.primary, fontFamily: "'DM Mono', monospace" }}>Live</span>
                      </div>
                    </div>
                    <div>
                      <AttRow name="Meera Joshi" inT="09:02" outT="Ongoing" status="present" delay={570} />
                      <AttRow name="Rahul Sharma" inT="09:48" outT="Ongoing" status="late" delay={610} />
                      <AttRow name="Ananya Mehta" inT="08:57" outT="18:05" status="present" delay={650} />
                      <AttRow name="Vikram Nair" inT="—" outT="—" status="absent" delay={690} />
                      <AttRow name="Priya Kapoor" inT="09:10" outT="Ongoing" status="present" delay={730} />
                    </div>
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t flex gap-2 sm:gap-4 text-[7px] sm:text-[8px]"
                      style={{ borderColor: "rgba(81,145,131,0.1)", fontFamily: "'DM Mono', monospace" }}>
                      <span style={{ color: T.primary }}>✓ 3 present</span>
                      <span style={{ color: "#f59e0b" }}>⏰ 1 late</span>
                      <span style={{ color: "#ef4444" }}>✗ 1 absent</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
                    style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 590ms both" }}>
                    <h3 className="font-black text-gray-800 text-sm sm:text-base mb-3 sm:mb-4 truncate" style={{ fontFamily: "'Fraunces', serif" }}>Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      {[
                        { label: "Add Lead", icon: "➕", color: T.primary },
                        { label: "Assign Target", icon: "🎯", color: "#3b82f6" },
                        { label: "Run Report", icon: "📊", color: "#a855f7" },
                        { label: "Send Alert", icon: "🔔", color: "#ef4444" },
                        { label: "Schedule Visit", icon: "📅", color: "#f59e0b" },
                        { label: "Export Data", icon: "📤", color: "#22c55e" },
                      ].map(({ label, icon, color }, i) => (
                        <button
                          key={label}
                          className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl border text-left group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 touch-manipulation"
                          style={{
                            borderColor: `${color}22`,
                            background: `${color}07`,
                            animation: `fade-up 0.4s ease ${630 + i * 45}ms both`,
                          }}
                        >
                          <span className="text-base sm:text-lg transition-transform duration-200 group-hover:scale-125">{icon}</span>
                          <span className="text-[8px] sm:text-[9px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors truncate"
                            style={{ fontFamily: "'Outfit', sans-serif" }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Targets */}
                  <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 bg-white"
                    style={{ borderColor: "rgba(81,145,131,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fade-up 0.5s ease 640ms both" }}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="font-black text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Fraunces', serif" }}>Monthly Targets</h3>
                      <span className="text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 ml-2"
                        style={{ background: `${T.primary}12`, color: T.primary, border: `1px solid ${T.primary}25`, fontFamily: "'DM Mono', monospace" }}>
                        On Track ✓
                      </span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <TargetBar label="Revenue" curr={48.6} target={60} unit="L" color={T.primary} delay={0} />
                      <TargetBar label="Leads" curr={847} target={1000} unit="" color="#3b82f6" delay={120} />
                      <TargetBar label="Conversion" curr={34} target={40} unit="%" color="#a855f7" delay={240} />
                      <TargetBar label="Footfall" curr={12.4} target={15} unit="K" color="#f59e0b" delay={360} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeNav === "gifting" && <GiftingPage />}

            {/* Placeholder for other pages */}
            {activeNav !== "dashboard" && activeNav !== "gifting" && (
              <div className="flex items-center justify-center h-48 sm:h-64 rounded-xl sm:rounded-2xl border bg-white"
                style={{ borderColor: "rgba(81,145,131,0.12)" }}>
                <p className="text-xs sm:text-sm text-gray-400 px-4 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} page coming soon...
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}