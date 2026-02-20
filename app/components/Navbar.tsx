"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon?: string;
  subItems?: { label: string; href: string; description?: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { 
    label: "Services", 
    href: "/services",
    icon: "🚀",
    
  },
  { 
    label: "Portfolio", 
    href: "/portfolio",
    icon: "🎨",
   
  },
  { 
    label: "Blogs", 
    href: "/blog",
    icon: "📝",
   
  },
  { 
    label: "Carrier", 
    href: "/carrier",
    icon: "💼",
    
  },
  { 
    label: "Contact", 
    href: "/contact",
    icon: "📞",
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle dropdown hover with delay
  const handleMouseEnter = (label: string) => {
    setHoveredItem(label);
    setTimeout(() => {
      if (hoveredItem === label) {
        setActiveDropdown(label);
      }
    }, 200);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setTimeout(() => {
      if (!hoveredItem) {
        setActiveDropdown(null);
      }
    }, 300);
  };

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Gradient background that appears on scroll */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(180deg, rgba(244,246,248,0.95) 0%, rgba(244,246,248,0.98) 100%)",
          backdropFilter: "blur(8px)",
        }}
      />
      
      <nav 
        ref={navRef}
        className={`relative transition-all duration-300 ${
          scrolled 
            ? "py-2 shadow-lg shadow-black/5" 
            : "py-0"
        }`}
        style={{
          backgroundColor: scrolled ? "transparent" : "#F4F6F8",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6">
          {/* Logo with hover animation */}
          <Link 
            href="/" 
            className="py-3 flex items-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#4F8A78]/0 via-[#4F8A78]/10 to-[#4F8A78]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Image
              src="/images/logo.png"
              alt="GroundupMedia Logo"
              width={140}
              height={40}
              priority
              className="h-10 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Menu with enhanced animations */}
          <ul className="hidden md:flex items-center h-16">
            {NAV_ITEMS.map((item) => (
              <li 
                key={item.label} 
                className="relative h-full"
                onMouseEnter={() => item.subItems && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`
                    relative px-5 h-full flex items-center gap-2
                    text-xs font-semibold tracking-widest
                    transition-all duration-300 group
                    ${pathname === item.href 
                      ? "text-[#4F8A78]" 
                      : "text-gray-700 hover:text-[#4F8A78]"
                    }
                  `}
                >
                  {/* Icon with animation */}
                  {item.icon && (
                    <span className="text-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {item.icon}
                    </span>
                  )}
                  
                  {/* Label with underline animation */}
                  <span className="relative">
                    {item.label}
                    <span 
                      className={`
                        absolute -bottom-1 left-0 w-full h-0.5 
                        bg-gradient-to-r from-[#4F8A78] to-[#6B7C92]
                        transform origin-left transition-transform duration-300
                        ${pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                      `}
                    />
                  </span>

                  {/* Dropdown indicator */}
                  {item.subItems && (
                    <svg 
                      className={`
                        w-3 h-3 ml-1 transition-all duration-300
                        ${activeDropdown === item.label ? "rotate-180" : ""}
                      `}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown Menu with animations */}
                {item.subItems && activeDropdown === item.label && (
                  <div 
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-300"
                  >
                    {/* Decorative gradient bar */}
                    <div className="h-1 bg-gradient-to-r from-[#4F8A78] to-[#6B7C92]" />
                    
                    <div className="p-2">
                      {item.subItems.map((subItem, index) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animation: "slideIn 0.3s ease-out forwards",
                            opacity: 0,
                            transform: "translateY(-10px)",
                          }}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 group-hover:text-[#4F8A78] transition-colors">
                              {subItem.label}
                            </div>
                            {subItem.description && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {subItem.description}
                              </div>
                            )}
                          </div>
                          <svg 
                            className="w-4 h-4 text-gray-400 group-hover:text-[#4F8A78] group-hover:translate-x-1 transition-all" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Right side action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search button with animation */}
            <button 
              className="p-2 text-gray-600 hover:text-[#4F8A78] transition-all duration-300 hover:scale-110 relative group"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="absolute inset-0 rounded-full bg-[#4F8A78]/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
            </button>

            {/* Get Started button */}
            <Link
              href="/qr"
              className="relative overflow-hidden bg-gradient-to-r from-[#4F8A78] to-[#6B7C92] text-white px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-[#4F8A78]/30 hover:scale-105 active:scale-95 group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg 
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
            {/* Login Button */}
<Link
  href="/admin/login"
  className="px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide
             border border-[#4F8A78] text-[#4F8A78]
             hover:bg-[#4F8A78] hover:text-white
             transition-all duration-300 hover:shadow-md"
>
  Login
</Link>


          {/* Mobile Toggle with enhanced animation */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-10 h-10 flex items-center justify-center group"
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 bg-[#4F8A78]/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
              <div className="relative space-y-1.5">
                <span 
                  className={`block h-0.5 bg-[#4F8A78] transition-all duration-300 ${
                    menuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'
                  }`} 
                />
                <span 
                  className={`block h-0.5 bg-[#4F8A78] transition-all duration-300 ${
                    menuOpen ? 'opacity-0 w-0' : 'w-6'
                  }`} 
                />
                <span 
                  className={`block h-0.5 bg-[#4F8A78] transition-all duration-300 ${
                    menuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-6'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown with animations */}
        <div 
          className={`
            md:hidden absolute top-full left-0 w-full bg-white shadow-2xl
            transition-all duration-500 overflow-hidden
            ${menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          {/* Decorative top bar */}
          <div className="h-1 bg-gradient-to-r from-[#4F8A78] to-[#6B7C92]" />
          
          <div className="py-4">
            {NAV_ITEMS.map((item, index) => (
              <div 
                key={item.label}
                className="px-4"
                style={{
                  animation: menuOpen ? `slideIn 0.3s ease-out ${index * 50}ms forwards` : 'none',
                  opacity: 0,
                  transform: 'translateY(-10px)',
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${pathname === item.href 
                      ? "bg-[#4F8A78]/10 text-[#4F8A78]" 
                      : "hover:bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  {item.icon && (
                    <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-sm font-semibold tracking-widest">{item.label}</span>
                  
                  {/* Sub-items indicator */}
                  {item.subItems && (
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>

                {/* Mobile sub-items */}
                {item.subItems && (
                  <div className="ml-11 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-gray-600 hover:text-[#4F8A78] hover:bg-gray-50 rounded-lg transition-all"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile action buttons */}
            <div className="px-8 mt-6 space-y-3">
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="block w-full bg-gradient-to-r from-[#4F8A78] to-[#6B7C92] text-white text-center px-6 py-3 rounded-full text-sm font-semibold tracking-wide hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-in {
          animation: slideIn 0.3s ease-out forwards;
        }

        .slide-in-from-top-2 {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </header>
  );
}