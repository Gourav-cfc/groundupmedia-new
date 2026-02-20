/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";

// Types
interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  features: string[];
  gradient: string;
  delay: number;
  inView: boolean;
}

// Service Card Component with animations
function ServiceCard({ title, description, icon, features, gradient, delay, inView }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate stable random positions for particles using useMemo
  const particles = useMemo(() => {
    return [...Array(5)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div
      ref={cardRef}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
        style={{
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.7s ease",
        }}
      />

      {/* Decorative floating particles with stable positions */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((pos, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#519183]/30 rounded-full"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animation: `float-particle ${3 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8">
        {/* Icon with animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#519183]/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <span 
            className="relative block text-5xl transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500"
            style={{
              animation: inView ? `float-icon 3s ease-in-out ${delay}ms infinite` : "none",
            }}
          >
            {icon}
          </span>
        </div>

        {/* Title with animated underline */}
        <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-white transition-colors duration-300">
          {title}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#519183] group-hover:w-full transition-all duration-500" />
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6 group-hover:text-gray-100 transition-colors duration-300">
          {description}
        </p>

        {/* Features with animated bullets */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-300"
              style={{
                animation: inView && isHovered ? `slide-in-right 0.3s ease-out ${idx * 0.1}s forwards` : "none",
                opacity: 0,
              }}
            >
              <span className="w-1.5 h-1.5 bg-[#519183] rounded-full mr-2 group-hover:bg-white transition-colors duration-300" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Learn more link */}
        <Link
          href={`/services/${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-flex items-center text-[#519183] font-medium group-hover:text-white transition-colors duration-300"
        >
          <span>Learn More</span>
          <span className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
        </Link>
      </div>

      {/* Bottom gradient bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#519183] via-[#6ba89a] to-[#519183] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
    </div>
  );
}

// Stats Counter Component
function StatsCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return (
    <div ref={counterRef} className="text-3xl font-black text-[#519183] font-display">
      {count}{suffix}
    </div>
  );
}

// Main Component
export default function ServicesPage() {
  const [inView, setInView] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Generate stable random values for background particles
  const backgroundParticles = useMemo(() => {
    return [...Array(30)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  // Services data with enhanced details
  const services = [
    {
      title: "Brand Strategy",
      description: 'Positioning, messaging, and identity systems designed to differentiate your brand and build long-term impact.',
      icon: "🎯",
      features: ["Brand Positioning", "Identity Design", "Messaging Framework", "Market Research"],
      gradient: "from-purple-500/20 to-pink-500/20",
      category: "strategy",
    },
    {
      title: "Digital Marketing",
      description: 'Performance marketing, paid ads, SEO, and content marketing focused on measurable growth and ROI.',
      icon: "📱",
      features: ["PPC Advertising", "SEO Optimization", "Content Marketing", "Email Marketing"],
      gradient: "from-blue-500/20 to-cyan-500/20",
      category: "marketing",
    },
    {
      title: "Video Production",
      description: 'High-quality video content crafted to engage audiences and communicate your brand story effectively.',
      icon: "🎬",
      features: ["Corporate Videos", "Commercials", "Motion Graphics", "Product Demos"],
      gradient: "from-red-500/20 to-orange-500/20",
      category: "production",
    },
    {
      title: "Web Development",
      description: 'Modern, responsive, high-performance websites built with scalable architecture and clean UI.',
      icon: "💻",
      features: ["Custom Development", "E-commerce", "CMS Integration", "Performance Optimization"],
      gradient: "from-green-500/20 to-emerald-500/20",
      category: "development",
    },
    {
      title: "Social Media Management",
      description: 'Creative campaigns, daily content, and community growth strategies that build loyal audiences.',
      icon: "📊",
      features: ["Content Calendar", "Community Management", "Influencer Marketing", "Analytics"],
      gradient: "from-yellow-500/20 to-amber-500/20",
      category: "marketing",
    },
    {
      title: "Creative Campaigns",
      description: 'Integrated campaigns combining storytelling, visuals, and performance strategy to dominate your niche.',
      icon: "✨",
      features: ["Campaign Strategy", "Creative Direction", "Multi-channel Execution", "Performance Tracking"],
      gradient: "from-indigo-500/20 to-violet-500/20",
      category: "strategy",
    },
    {
      title: "SEO & SEM",
      description: 'Data-driven search engine optimization and marketing to increase visibility and drive qualified traffic.',
      icon: "🔍",
      features: ["Keyword Research", "On-page SEO", "Link Building", "Search Advertising"],
      gradient: "from-teal-500/20 to-cyan-500/20",
      category: "marketing",
    },
    {
      title: "Content Marketing",
      description: 'Strategic content creation that educates, engages, and converts your target audience.',
      icon: "📝",
      features: ["Blog Writing", "Whitepapers", "Case Studies", "Newsletter Creation"],
      gradient: "from-orange-500/20 to-red-500/20",
      category: "content",
    },
    {
      title: "Analytics & Insights",
      description: 'Deep data analysis and reporting to optimize campaigns and maximize ROI.',
      icon: "📈",
      features: ["Data Analysis", "Reporting Dashboards", "Conversion Tracking", "ROI Analysis"],
      gradient: "from-blue-500/20 to-purple-500/20",
      category: "analytics",
    },
  ];

  // Filter categories
  const categories = [
    { id: "all", label: "All Services", icon: "🔮" },
    { id: "strategy", label: "Strategy", icon: "🎯" },
    { id: "marketing", label: "Marketing", icon: "📱" },
    { id: "production", label: "Production", icon: "🎬" },
    { id: "development", label: "Development", icon: "💻" },
    { id: "content", label: "Content", icon: "📝" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  const filteredServices = activeFilter === 'all' 
    ? services 
    : services.filter(service => service.category === activeFilter);

  // Intersection Observer for header animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#ebebeb] overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-[#519183]/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slower" />
        
        {/* Animated Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="service-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#519183" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#service-grid)" />
        </svg>

        {/* Floating Particles with stable positions */}
        {backgroundParticles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#519183]/30 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float-particle ${particle.duration}s linear infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-28 z-10">

        {/* Page Header with Animations */}
        <div 
          ref={headerRef}
          className="text-center mb-20"
        >
          {/* Animated badge */}
          <div 
            className="inline-flex items-center gap-2 bg-white border border-[#519183]/20 rounded-full px-5 py-2 mb-6 shadow-sm"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
              transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 100ms",
            }}
          >
            <span className="w-2 h-2 bg-[#519183] rounded-full animate-pulse" />
            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">What We Do Best</span>
          </div>

          {/* Main Heading */}
          <h1 
            className="text-5xl md:text-7xl font-serif font-bold mb-6"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s ease 200ms",
            }}
          >
            <span className="text-gray-800">Our </span>
            <span className="text-[#519183] italic relative inline-block">
              Services
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,5 Q50,0 100,5 T200,5" stroke="#519183" strokeWidth="2" fill="none" 
                      strokeDasharray="200" strokeDashoffset="200"
                      style={{
                        animation: inView ? "draw-line 1.5s ease forwards 500ms" : "none",
                      }}
                />
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p 
            className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s ease 300ms",
            }}
          >
            We help brands grow with strategy-driven digital solutions,
            creative storytelling, and performance-focused execution.
          </p>
        </div>

        {/* Stats Section */}
        <div 
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {[
            { label: "Projects Completed", value: 500, suffix: "+", icon: "🚀" },
            { label: "Happy Clients", value: 250, suffix: "+", icon: "😊" },
            { label: "Team Members", value: 50, suffix: "+", icon: "👥" },
            { label: "Years Experience", value: 12, suffix: "+", icon: "⭐" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.5s ease ${400 + index * 100}ms`,
              }}
            >
              <div className="text-3xl mb-3 animate-float-slow">{stat.icon}</div>
              <StatsCounter end={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category Filters */}
        <div 
          className="flex flex-wrap justify-center gap-3 mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease 600ms",
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeFilter === category.id
                  ? "bg-[#519183] text-white shadow-lg shadow-[#519183]/30"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-[#519183] shadow-md"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </span>
              {activeFilter === category.id && (
                <span className="absolute inset-0 rounded-full bg-[#519183] animate-ping opacity-20" />
              )}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              features={service.features}
              gradient={service.gradient}
              delay={800 + index * 100}
              inView={inView}
            />
          ))}
        </div>

        {/* Process Section */}
        <div 
          className="mt-32 text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 1000ms",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
            How We <span className="text-[#519183] italic">Work</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Our proven methodology ensures exceptional results for every client
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: 'Deep dive into your business goals and challenges', icon: "🔍" },
              { step: "02", title: "Strategy", desc: 'Data-driven planning and creative concept development', icon: "📊" },
              { step: "03", title: "Execution", desc: 'Flawless implementation across all channels', icon: "⚡" },
              { step: "04", title: "Optimization", desc: 'Continuous improvement based on performance data', icon: "📈" },
            ].map((process, index) => (
              <div
                key={index}
                className="relative group"
                style={{
                  animation: inView ? `fade-in-up 0.5s ease-out ${1100 + index * 150}ms forwards` : "none",
                  opacity: 0,
                }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#519183] to-[#6ba89a] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                <div className="relative bg-white p-6 rounded-2xl">
                  <span className="text-4xl mb-4 block animate-float">{process.icon}</span>
                  <span className="text-sm font-mono text-[#519183]">{process.step}</span>
                  <h3 className="text-lg font-bold text-gray-800 mt-2 mb-2">{process.title}</h3>
                  <p className="text-sm text-gray-600">{process.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div 
          className="relative mt-32 text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 1200ms",
          }}
        >
          {/* Background with gradient and blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#519183]/10 to-[#6ba89a]/10 rounded-3xl blur-3xl" />
          
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-white/20">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-6">
              Ready to transform your <span className="text-[#519183] italic">brand?</span>
            </h2>
            
            <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">
              Let&apos;s create something extraordinary together. Get in touch for a free consultation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="relative overflow-hidden bg-[#519183] hover:bg-[#3f7366] text-white px-10 py-4 text-sm font-medium rounded-full transform hover:scale-105 hover:shadow-2xl hover:shadow-[#519183]/30 transition-all duration-300 group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Your Project
                  <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </Link>

              <Link
                href="/portfolio"
                className="bg-white border-2 border-[#519183] text-[#519183] hover:bg-[#519183] hover:text-white px-10 py-4 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105"
              >
                View Our Work
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {[
                { icon: "🏆", text: "Award Winning" },
                { icon: "⭐", text: "5 Star Rating" },
                { icon: "🔒", text: "100% Secure" },
                { icon: "🚀", text: "Fast Delivery" },
              ].map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full"
                  style={{
                    animation: `float-slow ${3 + index}s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-xs font-mono text-gray-600">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.1);
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.2);
          }
        }

        @keyframes float-icon {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        .animate-float {
          animation: float-slow 3s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}