/* eslint-disable react-hooks/purity */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";

// Types
interface Project {
  title: string;
  category: string;
  image: string;
  description?: string;
  year?: string;
  client?: string;
}

interface FilterTab {
  id: string;
  label: string;
  count: number;
}

// Project Card Component with animations
function ProjectCard({ project, index, inView }: { project: Project; index: number; inView: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
        transition: `opacity 0.7s ease ${index * 100}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#519183]/90 via-[#519183]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

      {/* Image with zoom effect */}
      <div className="relative w-full h-[300px] overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-all duration-700"
          style={{
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        />
        
        {/* Shimmer overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          style={{
            transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
          }}
        />
      </div>

      {/* Floating category badge */}
      <div 
        className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-mono text-[#519183] font-semibold transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          animation: inView ? `float-slow 3s ease-in-out ${index * 0.1}s infinite` : "none",
        }}
      >
        {project.category}
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
        <h3 className="text-white text-xl font-bold mb-2 transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          {project.title}
        </h3>
        
        <p className="text-white/80 text-sm mb-4 transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-200">
          {project.description || "Award-winning digital excellence"}
        </p>

        <Link
          href={`/portfolio/${project.title.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-flex items-center gap-2 text-white bg-[#519183] px-5 py-2.5 rounded-lg text-sm font-medium w-fit transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-300 hover:bg-[#3f7366] hover:scale-105"
        >
          <span>View Case Study</span>
          <span className="text-lg transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#519183] via-[#6ba89a] to-[#519183] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left z-30" />

      {/* Floating particles on hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none z-40">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float-particle ${1 + i * 0.5}s ease-out forwards`,
              }}
            />
          ))}
        </div>
      )}
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
export default function PortfolioPage() {
  const [inView, setInView] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const headerRef = useRef<HTMLDivElement>(null);

  // Enhanced projects data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const projects: Project[] = [
    {
      title: "Urban Fuel – Brand Campaign",
      category: "Marketing",
      image: "/assets/portfolio1.jpg",
      description: "A complete brand overhaul that increased engagement by 250%",
      year: "2024",
      client: "Urban Fuel",
    },
    {
      title: "Nova Studio – Website Design",
      category: "Web",
      image: "/assets/portfolio2.jpg",
      description: "Modern, responsive website with 3D interactions",
      year: "2024",
      client: "Nova Studio",
    },
    {
      title: "FitX – Social Media Launch",
      category: "Social",
      image: "/assets/portfolio3.jpg",
      description: "Viral campaign reaching 5M+ users in first month",
      year: "2023",
      client: "FitX",
    },
    {
      title: "TechSphere – Video Production",
      category: "Video",
      image: "/assets/portfolio4.jpg",
      description: "Cinematic product launch video with 2M+ views",
      year: "2024",
      client: "TechSphere",
    },
    {
      title: "Trendify – E-commerce Build",
      category: "Web",
      image: "/assets/portfolio5.jpg",
      description: "Scalable e-commerce platform with 150% ROI",
      year: "2023",
      client: "Trendify",
    },
    {
      title: "BoostUp – Creative Ad Campaign",
      category: "Marketing",
      image: "/assets/portfolio6.jpg",
      description: "Multi-channel campaign driving 300K+ conversions",
      year: "2024",
      client: "BoostUp",
    },
    {
      title: "EcoLife – Brand Identity",
      category: "Marketing",
      image: "/assets/portfolio7.jpg",
      description: "Sustainable brand identity with zero-waste messaging",
      year: "2023",
      client: "EcoLife",
    },
    {
      title: "FinLeap – Mobile App",
      category: "Web",
      image: "/assets/portfolio8.jpg",
      description: "Fintech app with 100K+ downloads",
      year: "2024",
      client: "FinLeap",
    },
    {
      title: "ArtSpace – Exhibition Campaign",
      category: "Social",
      image: "/assets/portfolio9.jpg",
      description: "Digital art exhibition with global reach",
      year: "2023",
      client: "ArtSpace",
    },
  ];

  // Filter categories with counts
  const categories: FilterTab[] = useMemo(() => {
    const counts = projects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: "all", label: "All Projects", count: projects.length },
      { id: "Web", label: "Web", count: counts["Web"] || 0 },
      { id: "Marketing", label: "Marketing", count: counts["Marketing"] || 0 },
      { id: "Social", label: "Social", count: counts["Social"] || 0 },
      { id: "Video", label: "Video", count: counts["Video"] || 0 },
    ];
  }, [projects]);

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  // Success stats
  const stats = [
    { label: "Projects Completed", value: 150, suffix: "+", icon: "🚀" },
    { label: "Happy Clients", value: 85, suffix: "+", icon: "😊" },
    { label: "Awards Won", value: 25, suffix: "+", icon: "🏆" },
    { label: "Years Experience", value: 12, suffix: "", icon: "⭐" },
  ];

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

  // Generate stable random particles
  const particles = useMemo(() => {
    return [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
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
            <pattern id="portfolio-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#519183" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#portfolio-grid)" />
        </svg>

        {/* Floating Particles */}
        {particles.map((particle, i) => (
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

        {/* Hero Section with Animations */}
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
            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">Our Work</span>
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
              Portfolio
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
            A selection of work that reflects our strategy-driven,
            creative-first approach to brand growth.
          </p>
        </div>

        {/* Stats Section */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 400ms",
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group"
              style={{
                animation: inView ? `fade-in-up 0.5s ease-out ${400 + index * 100}ms forwards` : "none",
              }}
            >
              <div className="text-3xl mb-3 animate-float-slow group-hover:scale-110 transition-transform">{stat.icon}</div>
              <StatsCounter end={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs with Animations */}
        <div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease 600ms",
          }}
        >
          {categories.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeFilter === tab.id
                  ? "bg-[#519183] text-white shadow-lg shadow-[#519183]/30"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-[#519183] shadow-md"
              }`}
              style={{
                animation: inView ? `slide-in-up 0.5s ease-out ${600 + index * 100}ms forwards` : "none",
                opacity: 0,
              }}
            >
              <span className="flex items-center gap-2">
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeFilter === tab.id ? "bg-white/20" : "bg-gray-200"
                }`}>
                  {tab.count}
                </span>
              </span>
              {activeFilter === tab.id && (
                <span className="absolute inset-0 rounded-full bg-[#519183] animate-ping opacity-20" />
              )}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* Featured Work Banner */}
        <div 
          className="relative mt-20 bg-gradient-to-r from-[#519183] to-[#6ba89a] rounded-3xl overflow-hidden"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 800ms",
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 opacity-30">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${i * 10}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float-particle ${5 + i}s linear infinite`,
                }}
              />
            ))}
          </div>
          
          <div className="relative p-12 text-center">
            <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-white text-sm font-mono mb-4">
              FEATURED WORK
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
              Ready to create your <span className="font-black">masterpiece?</span>
            </h2>
            <p className="text-white/90 max-w-xl mx-auto mb-8">
              Join these amazing brands and let&apos;s build something extraordinary together.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#519183] px-8 py-4 rounded-full font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <span>Start Your Project</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className="relative mt-20 text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 1000ms",
          }}
        >
          {/* Background with gradient and blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#519183]/10 to-[#6ba89a]/10 rounded-3xl blur-3xl" />
          
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-white/20">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-6">
              Want your brand to be <span className="text-[#519183] italic">featured here?</span>
            </h2>
            
            <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">
              Let&apos;s create something remarkable together. Get in touch for a free consultation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="relative overflow-hidden bg-[#519183] hover:bg-[#3f7366] text-white px-10 py-4 text-sm font-medium rounded-full transform hover:scale-105 hover:shadow-2xl hover:shadow-[#519183]/30 transition-all duration-300 group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start a Project
                  <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </Link>

              <Link
                href="/services"
                className="bg-white border-2 border-[#519183] text-[#519183] hover:bg-[#519183] hover:text-white px-10 py-4 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Explore Services
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

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
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

        @keyframes slide-in-up {
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