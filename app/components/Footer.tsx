"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0E1C2A] text-gray-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">

        {/* ─────────────────────────────
           Top Section
        ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14">

          {/* Brand Column */}
          <div className="space-y-6">
            {/* Brand Column */}
<div className="space-y-6">
  <Image
    src="/images/logo.png"
    alt="GroundupMedia Logo"
    width={220}
    height={60}
    className="object-contain"
    priority
  />

  <p className="text-sm leading-relaxed max-w-xs text-gray-400">
    We build performance-driven marketing systems that scale brands
    across digital and real-world ecosystems.
  </p>
</div>


            <p className="text-sm leading-relaxed max-w-xs">
              We build performance-driven marketing systems that scale brands
              across digital and real-world ecosystems.
            </p>

            <div className="flex space-x-4 pt-2">
              {["Facebook", "Instagram", "LinkedIn", "Twitter"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-xs uppercase tracking-wider hover:text-white transition-colors duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">
              Services
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                "Digital Marketing",
                "Brand Strategy",
                "Rural Marketing",
                "Performance Ads",
                "Web Development",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {["About Us", "Portfolio", "Careers", "Blog"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">
              Contact
            </h4>

            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                2nd Floor Saurabh Gas Agency,<br />
                Sutgirni Road, Chh. Sambhajinagar,<br />
                Maharashtra, 431001
              </p>

              <div className="space-y-1">
                <p>
                  <a
                    href="tel:+919552917731"
                    className="hover:text-white transition-colors duration-300"
                  >
                    +91 95529 17731
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:marketing@groundupmedia.in"
                    className="hover:text-white transition-colors duration-300"
                  >
                    marketing@groundupmedia.in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────
           Divider
        ───────────────────────────── */}
        <div className="border-t border-white/5 my-14" />

        {/* ─────────────────────────────
           Bottom Bar
        ───────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} GroundupMedia Pvt Ltd. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors duration-300"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
