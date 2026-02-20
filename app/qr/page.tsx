"use client";

import Image from "next/image";

export default function QRPage() {
  return (
    <div className="min-h-screen bg-[#8CBFA3] flex items-center justify-center p-4 mt-14">


      {/* White Bottom Sheet */}
      <div className="w-full max-w-sm bg-white rounded-3xl px-6 pt-16 pb-8 relative shadow-2xl">

        {/* Logo Circle */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white w-28 h-28 rounded-full flex items-center justify-center shadow-md">
          <Image
            src="/images/gum logo png.png"
            alt="GroundUpMedia"
            width={120}
            height={120}
          />
        </div>

        {/* Header */}
        <div className="text-center mt-4">
          <h1 className="text-xl text-black font-semibold">GroundUpMedia</h1>
          <p className="text-gray-500 text-sm mt-1">
            Helping brand from feed to fields
          </p>
        </div>

        {/* Section Title */}
        <div className="mt-8 mb-4">
          <p className="text-gray-500 text-sm font-medium">
            Find me on
          </p>
        </div>

        {/* Links */}
        <div className="space-y-3">

          {/* Location */}
          <a
            href="https://www.google.com/maps/place/19%C2%B051'41.0%22N+75%C2%B020'51.0%22E/@19.8613889,75.3449251,17z/data=!3m1!4b1!4m4!3m3!8m2!3d19.8613889!4d75.3475!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/assets/google-location-icon-16.png"
                alt="Location"
                width={30}
                height={30}
              />
                <div>
                <span className="font-medium block leading-none">
                  Location
                </span>
                <span className="text-gray-500 text-xs">
                  Get Office Location
                </span>
              </div>
            </div>
            <span className="text-gray-400 text-lg">›</span>
          </a>

          {/* Web */}
          <a
            href="https://groundupmedia.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/assets/web.png"
                alt="Web"
                width={30}
                height={30}
              />
              <div>
                <span className="font-medium block leading-none">
                  Web
                </span>
                <span className="text-gray-500 text-xs">
                  Checkout our site
                </span>
              </div>
            </div>
            <span className="text-gray-400 text-lg">›</span>
          </a>

        

          {/* WhatsApp */}
          <a
            href="https://wa.me/919552917731"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/assets/whatsapp.png"
                alt="WhatsApp"
                width={30}
                height={30}
              />
              <div>
                <span className="font-medium block leading-none">
                  WhatsApp
                </span>
                <span className="text-gray-500 text-xs">
                  Chat us
                </span>
              </div>
            </div>
            <span className="text-gray-400 text-lg">›</span>
          </a>

            {/* Instagram */}
          <a
            href="https://www.instagram.com/groundupmedia.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/assets/Instagram.png"
                alt="Instagram"
                width={30}
                height={30}
              />
              <div>
                <span className="font-medium block leading-none">
                  Instagram
                </span>
                <span className="text-gray-500 text-xs">
                  follow us
                </span>
              </div>
            </div>
            <span className="text-gray-400 text-lg">›</span>
          </a>

        </div>
      </div>
    </div>
  );
}
