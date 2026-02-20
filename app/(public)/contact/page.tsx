"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle, AlertCircle, Link } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef, JSX } from "react";

// Types
interface ContactInfo {
  icon: JSX.Element;
  title: string;
  value: string;
  details?: string;
  link?: string;
  availability?: string;
}

interface FormStatus {
  type: "success" | "error" | null;
  message: string;
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

// Map Component (simplified - in production use Google Maps or Mapbox)
function MapPlaceholder() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#519183]/20 to-[#3f7366]/20 group cursor-pointer">
      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="map-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#519183" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>
      </div>

      {/* Animated pins */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut" 
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative">
          <MapPin size={48} className="text-[#519183] drop-shadow-2xl" />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-[#519183]/20 rounded-full blur-xl"
          />
        </div>
      </motion.div>

      {/* Location label */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <p className="text-sm font-medium text-gray-800">📍 Maharashtra, India</p>
      </div>

      {/* Hover effect */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="absolute inset-0 bg-[#519183]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
    </div>
  );
}

// Main Component
export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({ type: null, message: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState("bangalore");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormStatus({ type: null, message: "" });

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFormStatus({
        type: "success",
        message: "Thank you for reaching out! We'll get back to you within 24 hours."
      });
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch {
      setFormStatus({
        type: "error",
        message: "Something went wrong. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  // Contact information
  const contactInfo: ContactInfo[] = [
    {
      icon: <Mail size={24} />,
      title: "Email Us",
      value: "contact@groundupmedia.in",
      details: "For general inquiries and support",
      link: "mailto:contact@groundupmedia.in",
      availability: "24/7",
    },
    {
      icon: <Phone size={24} />,
      title: "Call Us",
      value: "+91 95529 17731",
      details: "Mon - Fri, 9:00 AM - 6:00 PM IST",
      link: "tel:+919552917731",
      availability: "Business Hours",
    },
    {
      icon: <MapPin size={24} />,
      title: "Head Office",
      value: "Bangalore, India",
      details: "GroundupMedia, 2nd Floor Saurabh Gas Agency, Sutgirni Road, Chh. Sambhajinagar, Maharashtra, 431001",
      availability: "Visit by appointment",
    },
  ];

  // Office locations
  const offices = [
    { id: "bangalore", name: "Bangalore HQ", address: "2nd Floor Saurabh Gas Agency, Sutgirni Road, Chh. Sambhajinagar", phone: "+91 95529 17731" },
    { id: "mumbai", name: "Mumbai Office", address: "Andheri East, Mumbai - 400093", phone: "+91 73850 93161" },
    { id: "pune", name: "Pune Office", address: "Kothrud, Pune - 411038", phone: "+91 98810 01449" },
  ];

  // Stats
  const stats = [
    { label: "Happy Clients", value: 250, suffix: "+", icon: "😊" },
    { label: "Projects Delivered", value: 500, suffix: "+", icon: "🚀" },
    { label: "Team Members", value: 50, suffix: "+", icon: "👥" },
    { label: "Response Time", value: 2, suffix: "hrs", icon: "⚡" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#ebebeb] overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-[500px] h-[500px] bg-[#519183]/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"
        />
        
        {/* Animated Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="contact-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#519183" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-grid)" />
        </svg>

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
            animate={{ 
              y: [null, "-100%"],
              x: [null, (Math.random() - 0.5) * 100 + "%"],
            }}
            transition={{ 
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-[#519183]/30 rounded-full"
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-28 z-10">

        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Logo with animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-[#519183]/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-700" />
              <Image
                src="/images/logo.png"
                alt="GroundupMedia Logo"
                width={460}
                height={60}
                priority
                className="object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-white border border-[#519183]/20 rounded-full px-5 py-2 mb-6 shadow-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 bg-[#519183] rounded-full"
            />
            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">Get in Touch</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6"
          >
            <span className="text-gray-800">Let&apos;s </span>
            <span className="text-[#519183] italic relative inline-block">
              Connect
              <motion.svg 
                className="absolute -bottom-2 left-0 w-full" 
                height="8" 
                viewBox="0 0 200 8" 
                preserveAspectRatio="none"
                initial={{ strokeDashoffset: 200 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, delay: 1 }}
              >
                <path d="M0,5 Q50,0 100,5 T200,5" stroke="#519183" strokeWidth="2" fill="none" strokeDasharray="200" />
              </motion.svg>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Have a project in mind? We&apos;d love to hear about it. 
            Reach out and let&apos;s create something extraordinary together.
          </motion.p>
        </motion.section>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 group"
            >
              <div className="text-3xl mb-3 animate-float-slow group-hover:scale-110 transition-transform">{stat.icon}</div>
              <StatsCounter end={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Contact Grid */}
        <div className="grid lg:grid-cols-2 gap-16">

          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {contactInfo.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#519183]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                <div className="relative z-10 flex items-start gap-6">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="p-4 bg-[#519183]/10 rounded-xl text-[#519183] group-hover:bg-[#519183] group-hover:text-white transition-all duration-500"
                  >
                    {item.icon}
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#519183] transition-colors duration-300">
                      {item.title}
                    </h3>
                    
                    {item.link ? (
                      <a 
                        href={item.link}
                        className="text-lg text-[#519183] hover:underline font-medium block mb-1"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-lg text-gray-800 font-medium mb-1">{item.value}</p>
                    )}
                    
                    <p className="text-sm text-gray-500 mb-2">{item.details}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={14} />
                      <span>{item.availability}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#519183]/20 rounded-tr-2xl" />
              </motion.div>
            ))}

            {/* Office Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Our Offices</h3>
              
              <div className="flex gap-3 mb-6">
                {offices.map((office) => (
                  <button
                    key={office.id}
                    onClick={() => setSelectedOffice(office.id)}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedOffice === office.id
                        ? "bg-[#519183] text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {office.name}
                    {selectedOffice === office.id && (
                      <motion.span
                        layoutId="officeIndicator"
                        className="absolute inset-0 rounded-full bg-[#519183]"
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedOffice}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <p className="text-gray-600">
                    {offices.find(o => o.id === selectedOffice)?.address}
                  </p>
                  <p className="text-[#519183] font-medium">
                    {offices.find(o => o.id === selectedOffice)?.phone}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Map */}
            <MapPlaceholder />
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Form Card */}
            <div className="sticky top-28 bg-white border border-gray-200 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              <h2 className="text-3xl font-serif text-gray-800 mb-2">Send a Message</h2>
              <p className="text-gray-500 mb-8">We&apos;ll get back to you within 24 hours</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <motion.div
                  animate={activeField === "name" ? { scale: 1.02 } : { scale: 1 }}
                  className="relative group"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setActiveField("name")}
                    onBlur={() => setActiveField(null)}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#519183] focus:ring-2 focus:ring-[#519183]/20 transition-all duration-300 group-hover:border-[#519183]/50"
                    placeholder="John Doe"
                  />
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-[#519183]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ zIndex: -1 }}
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div
                  animate={activeField === "email" ? { scale: 1.02 } : { scale: 1 }}
                  className="relative group"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setActiveField("email")}
                    onBlur={() => setActiveField(null)}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#519183] focus:ring-2 focus:ring-[#519183]/20 transition-all duration-300 group-hover:border-[#519183]/50"
                    placeholder="john@example.com"
                  />
                </motion.div>

                {/* Phone Field */}
                <motion.div
                  animate={activeField === "phone" ? { scale: 1.02 } : { scale: 1 }}
                  className="relative group"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setActiveField("phone")}
                    onBlur={() => setActiveField(null)}
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#519183] focus:ring-2 focus:ring-[#519183]/20 transition-all duration-300 group-hover:border-[#519183]/50"
                    placeholder="+91 98765 43210"
                  />
                </motion.div>

                {/* Company Field */}
                <motion.div
                  animate={activeField === "company" ? { scale: 1.02 } : { scale: 1 }}
                  className="relative group"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onFocus={() => setActiveField("company")}
                    onBlur={() => setActiveField(null)}
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#519183] focus:ring-2 focus:ring-[#519183]/20 transition-all duration-300 group-hover:border-[#519183]/50"
                    placeholder="Your Company Name"
                  />
                </motion.div>

                {/* Message Field */}
                <motion.div
                  animate={activeField === "message" ? { scale: 1.02 } : { scale: 1 }}
                  className="relative group"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setActiveField("message")}
                    onBlur={() => setActiveField(null)}
                    rows={5}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#519183] focus:ring-2 focus:ring-[#519183]/20 transition-all duration-300 group-hover:border-[#519183]/50 resize-none"
                    placeholder="Tell us about your project..."
                  />
                </motion.div>

                {/* Form Status */}
                <AnimatePresence>
                  {formStatus.type && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl flex items-center gap-3 ${
                        formStatus.type === "success" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {formStatus.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      <span className="text-sm">{formStatus.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="relative w-full py-5 bg-gradient-to-r from-[#519183] to-[#3f7366] text-white rounded-xl font-semibold overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Send size={18} />
                        </motion.div>
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Privacy Note */}
                <p className="text-xs text-center text-gray-400 mt-4">
                  By submitting this form, you agree to our 
                  <a href="/privacy" className="text-[#519183] hover:underline ml-1">Privacy Policy</a>
                </p>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
            <MessageSquare size={40} className="mx-auto mb-4 text-[#519183]" />
            <h2 className="text-2xl font-serif text-gray-800 mb-3">Quick Questions?</h2>
            <p className="text-gray-600 mb-6">Check our FAQ section for instant answers</p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-[#519183] font-semibold hover:gap-3 transition-all duration-300 group"
            >
              <span>Visit FAQ</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </Link>
          </div>
        </motion.div>

        {/* Social Connect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center gap-4"
        >
          
          
        </motion.div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}