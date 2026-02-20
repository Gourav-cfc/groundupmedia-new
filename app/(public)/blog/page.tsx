/* eslint-disable react-hooks/purity */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";

// Types
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorAvatar?: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured?: boolean;
  likes?: number;
  comments?: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
}

// Blog Card Component with animations
function BlogCard({ post, index, inView }: { post: BlogPost; index: number; inView: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer"
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

      {/* Image Container */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-all duration-700"
          style={{
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-mono text-[#519183] font-semibold shadow-lg">
            {post.category}
          </span>
        </div>

        {/* Featured Badge */}
        {post.featured && (
          <div className="absolute top-4 right-4 z-20">
            <span className="px-4 py-2 bg-[#519183] text-white rounded-full text-xs font-mono font-semibold shadow-lg animate-pulse">
              ⭐ Featured
            </span>
          </div>
        )}

        {/* Shimmer overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          style={{
            transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <span className="text-[#519183]">📅</span> {post.date}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#519183]">⏱️</span> {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white transition-colors duration-300 line-clamp-2">
          {post.title}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#519183] group-hover:w-full transition-all duration-500" />
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-100 transition-colors duration-300 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Author and Interactions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#519183]/10">
              {post.authorAvatar ? (
                <Image src={post.authorAvatar} alt={post.author} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#519183] font-bold">
                  {post.author.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-white transition-colors duration-300">
              {post.author}
            </span>
          </div>

          {/* Interaction Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#519183] transition-colors duration-300 group-hover:text-white"
            >
              <span className={`transform transition-transform duration-300 ${isLiked ? 'scale-125' : ''}`}>
                {isLiked ? '❤️' : '🤍'}
              </span>
              <span>{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
            </button>
            <span className="flex items-center gap-1 text-sm text-gray-500 group-hover:text-white transition-colors duration-300">
              <span>💬</span>
              <span>{post.comments}</span>
            </span>
          </div>
        </div>

        {/* Read More Link */}
        <Link
          href={`/blog/${post.id}`}
          className="inline-flex items-center gap-2 text-[#519183] font-medium mt-4 group-hover:text-white transition-colors duration-300"
        >
          <span>Read Article</span>
          <span className="text-lg transform group-hover:translate-x-2 transition-transform duration-300">→</span>
        </Link>
      </div>

      {/* Bottom gradient bar */}
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

// Featured Blog Card Component
function FeaturedBlogCard({ post, inView }: { post: BlogPost; inView: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-gradient-to-br from-[#519183] to-[#3f7366] rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(30px) scale(0.98)",
        transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 300ms",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center">
          <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-white text-xs font-mono mb-4 w-fit">
            📌 FEATURED POST
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {post.title}
          </h2>
          
          <p className="text-white/80 text-lg mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden">
                {post.authorAvatar ? (
                  <Image src={post.authorAvatar} alt={post.author} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {post.author.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{post.author}</p>
                <p className="text-white/60 text-sm">{post.date} · {post.readTime}</p>
              </div>
            </div>
          </div>

          <Link
            href={`/blog/${post.id}`}
            className="inline-flex items-center gap-3 bg-white text-[#519183] px-6 py-3 rounded-full font-semibold w-fit hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
          >
            <span>Read Full Article</span>
            <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>

        {/* Image */}
        <div className="relative h-64 md:h-auto rounded-2xl overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#519183]/50 to-transparent" />
          
          {/* Floating tags */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-[#519183] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
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

// Newsletter Section
function NewsletterSection({ inView }: { inView: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div 
      className="relative bg-gradient-to-r from-[#519183] to-[#3f7366] rounded-3xl overflow-hidden"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
        transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 800ms",
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${5 + i}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative p-12 text-center">
        <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-white text-sm font-mono mb-6">
          📬 STAY UPDATED
        </span>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Never miss an insight
        </h2>
        
        <p className="text-white/80 max-w-xl mx-auto mb-8">
          Subscribe to our newsletter and get the latest industry insights, trends, and case studies delivered straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-300"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-[#519183] font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <span className="flex items-center gap-2">
                Subscribe
                <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </button>
          </div>
        </form>

        {status === "success" && (
          <div className="mt-4 text-white bg-white/20 rounded-lg p-3 animate-slide-in">
            ✓ Thanks for subscribing! Check your inbox for confirmation.
          </div>
        )}

        <p className="text-white/60 text-sm mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}

// Main Component
export default function BlogPage() {
  const [inView, setInView] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const headerRef = useRef<HTMLDivElement>(null);

  // Blog posts data
  const posts: BlogPost[] = [
    {
      id: "future-of-digital-marketing-2024",
      title: "The Future of Digital Marketing: 2024 Trends",
      excerpt: "Explore the emerging trends that will shape digital marketing strategies in the coming year, from AI to personalization.",
      author: "Sarah Johnson",
      date: "Mar 15, 2024",
      readTime: "5 min read",
      category: "Marketing",
      tags: ["digital-marketing", "trends", "AI"],
      image: "/assets/blog1.jpg",
      featured: true,
      likes: 234,
      comments: 42,
    },
    {
      id: "brand-building-in-digital-age",
      title: "Brand Building in the Digital Age: A Comprehensive Guide",
      excerpt: "Learn how to build a memorable brand that resonates with your audience across all digital touchpoints.",
      author: "Michael Chen",
      date: "Mar 12, 2024",
      readTime: "8 min read",
      category: "Branding",
      tags: ["branding", "strategy", "digital"],
      image: "/assets/blog2.jpg",
      likes: 189,
      comments: 31,
    },
    {
      id: "seo-strategies-2024",
      title: "Advanced SEO Strategies That Actually Work in 2024",
      excerpt: "Discover proven SEO techniques that drive organic traffic and improve search rankings in today's competitive landscape.",
      author: "Emily Rodriguez",
      date: "Mar 10, 2024",
      readTime: "6 min read",
      category: "SEO",
      tags: ["SEO", "organic-traffic", "ranking"],
      image: "/assets/blog3.jpg",
      likes: 156,
      comments: 28,
    },
    {
      id: "social-media-algorithm-hacks",
      title: "Social Media Algorithm Hacks for Maximum Reach",
      excerpt: "Understand how social media algorithms work and learn strategies to boost your content's visibility.",
      author: "David Kim",
      date: "Mar 8, 2024",
      readTime: "7 min read",
      category: "Social Media",
      tags: ["social-media", "algorithms", "reach"],
      image: "/assets/blog4.jpg",
      likes: 312,
      comments: 56,
    },
    {
      id: "content-marketing-roi",
      title: "Measuring Content Marketing ROI: Metrics That Matter",
      excerpt: "Learn how to track and measure the real impact of your content marketing efforts on business growth.",
      author: "Lisa Thompson",
      date: "Mar 5, 2024",
      readTime: "6 min read",
      category: "Content",
      tags: ["content-marketing", "ROI", "analytics"],
      image: "/assets/blog5.jpg",
      likes: 145,
      comments: 23,
    },
    {
      id: "video-marketing-trends",
      title: "Video Marketing Trends That Will Dominate 2024",
      excerpt: "From short-form content to live streaming, discover the video trends you need to leverage this year.",
      author: "James Wilson",
      date: "Mar 3, 2024",
      readTime: "5 min read",
      category: "Video",
      tags: ["video-marketing", "trends", "content"],
      image: "/assets/blog6.jpg",
      featured: true,
      likes: 278,
      comments: 45,
    },
    {
      id: "email-marketing-personalization",
      title: "Email Marketing Personalization: Beyond First Name",
      excerpt: "Take your email marketing to the next level with advanced personalization strategies that drive engagement.",
      author: "Anna Martinez",
      date: "Feb 28, 2024",
      readTime: "4 min read",
      category: "Email",
      tags: ["email-marketing", "personalization", "engagement"],
      image: "/assets/blog7.jpg",
      likes: 167,
      comments: 29,
    },
    {
      id: "ai-in-advertising",
      title: "How AI is Revolutionizing Digital Advertising",
      excerpt: "Explore the ways artificial intelligence is transforming ad targeting, creative, and optimization.",
      author: "Robert Taylor",
      date: "Feb 25, 2024",
      readTime: "7 min read",
      category: "AI",
      tags: ["AI", "advertising", "technology"],
      image: "/assets/blog8.jpg",
      likes: 423,
      comments: 67,
    },
    {
      id: "ux-design-principles",
      title: "UX Design Principles That Drive Conversions",
      excerpt: "Learn how thoughtful UX design can improve user experience and boost conversion rates.",
      author: "Sophie Anderson",
      date: "Feb 22, 2024",
      readTime: "6 min read",
      category: "Design",
      tags: ["UX", "design", "conversion"],
      image: "/assets/blog9.jpg",
      likes: 198,
      comments: 34,
    },
  ];

  // Categories with counts
  const categories: Category[] = useMemo(() => {
    const counts = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: "all", name: "All Posts", count: posts.length, icon: "📚" },
      ...Object.entries(counts).map(([name, count]) => ({
        id: name.toLowerCase(),
        name,
        count,
        icon: getCategoryIcon(name),
      })),
    ];
  }, []);

  // Helper function for category icons
  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      "Marketing": "📊",
      "Branding": "🎯",
      "SEO": "🔍",
      "Social Media": "📱",
      "Content": "📝",
      "Video": "🎬",
      "Email": "✉️",
      "AI": "🤖",
      "Design": "🎨",
    };
    return icons[category] || "📄";
  }

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(post => 
        post.category.toLowerCase() === activeCategory
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (sortBy === "latest") {
      filtered = filtered.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortBy === "popular") {
      filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return filtered;
  }, [posts, activeCategory, searchQuery, sortBy]);

  // Featured post
  const featuredPost = posts.find(post => post.featured);

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
  const backgroundParticles = useMemo(() => {
    return [...Array(30)].map(() => ({
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
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="blog-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#519183" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blog-grid)" />
        </svg>

        {/* Floating Particles */}
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

        {/* Header Section */}
        <div 
          ref={headerRef}
          className="text-center mb-16"
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
            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">Insights & Updates</span>
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
              Blog
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
            Insights, strategies, and stories from the intersection of creativity and technology.
          </p>
        </div>

        {/* Stats Section */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 400ms",
          }}
        >
          {[
            { label: "Articles Published", value: 150, suffix: "+", icon: "📝" },
            { label: "Monthly Readers", value: 50, suffix: "K+", icon: "👥" },
            { label: "Expert Authors", value: 25, suffix: "+", icon: "✍️" },
            { label: "Topics Covered", value: 12, suffix: "", icon: "🎯" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group"
            >
              <div className="text-3xl mb-3 animate-float-slow">{stat.icon}</div>
              <StatsCounter end={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div 
          className="flex flex-col md:flex-row gap-4 mb-12"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease 500ms",
          }}
        >
          {/* Search */}
          <div className="flex-1 relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-6 py-4 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#519183]/20 transition-all duration-300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 group-focus-within:text-[#519183] transition-colors">
              🔍
            </span>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
            className="px-6 py-4 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#519183]/20 transition-all duration-300 cursor-pointer"
          >
            <option value="latest">📅 Latest First</option>
            <option value="popular">🔥 Most Popular</option>
          </select>
        </div>

        {/* Category Filters */}
        <div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease 600ms",
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeCategory === category.id
                  ? "bg-[#519183] text-white shadow-lg shadow-[#519183]/30"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-[#519183] shadow-md"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === category.id ? "bg-white/20" : "bg-gray-200"
                }`}>
                  {category.count}
                </span>
              </span>
              {activeCategory === category.id && (
                <span className="absolute inset-0 rounded-full bg-[#519183] animate-ping opacity-20" />
              )}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <FeaturedBlogCard post={featuredPost} inView={inView} />
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts
            .filter(post => !post.featured)
            .map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                index={index}
                inView={inView}
              />
            ))}
        </div>

        {/* Newsletter Section */}
        <NewsletterSection inView={inView} />

        {/* Load More Button */}
        <div 
          className="text-center mt-12"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease 1000ms",
          }}
        >
          <button
            className="inline-flex items-center gap-3 bg-white border-2 border-[#519183] text-[#519183] px-8 py-4 rounded-full font-semibold hover:bg-[#519183] hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
          >
            <span>Load More Articles</span>
            <span className="text-xl group-hover:translate-x-2 transition-transform">↓</span>
          </button>
        </div>

        {/* Topics Cloud */}
        <div 
          className="mt-20 text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease 1100ms",
          }}
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Popular Topics</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Digital Marketing", "SEO", "Branding", "Social Media", "AI", "UX Design", "Content Strategy", "Video Marketing", "Analytics"].map((topic, index) => (
              <button
                key={topic}
                className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm text-gray-600 hover:text-[#519183] hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-md"
                style={{
                  animation: inView ? `float-slow ${3 + index * 0.3}s ease-in-out infinite` : "none",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                #{topic}
              </button>
            ))}
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

        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}