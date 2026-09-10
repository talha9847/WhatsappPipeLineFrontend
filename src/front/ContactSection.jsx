import React from "react";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function ContactSection() {
  // Google Maps embed URL targeting Zakhera, Gujarat 394421
  const mapEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14878.148118080927!2d73.040000!3d21.400000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be05f5f4b5f5f5f%3A0x0!2sZakhera%2C%20Gujarat%20394421!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

  return (
    <section
      id="contact"
      className="py-16 border-t border-white/5 bg-[#0B0F14]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl">
            Contact <span className="text-cyan-400">Us</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Have questions, partnership offers, or want to list your fleet?
            Reach out directly or visit our location.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Direct Contact Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-[#111822] p-8 shadow-lg">
            <div>
              <h3 className="text-xl font-bold text-white">Founder Details</h3>

              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Us</p>
                    <a
                      href="mailto:mtmalek47@gmail.com"
                      className="text-sm font-medium text-white transition hover:text-cyan-400"
                    >
                      mtmalek47@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone / WhatsApp</p>
                    <a
                      href="tel:+919106704675"
                      className="text-sm font-medium text-white transition hover:text-cyan-400"
                    >
                      +91 9106704675
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Location Code & Address
                    </p>
                    <p className="text-sm font-medium text-white">
                      C4CR+HHJ, Zakhera, Gujarat 394421
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <a
                href="https://maps.google.com/?q=C4CR%2BHHJ,+Zakhera,+Gujarat+394421"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400/10 border border-cyan-400/30 py-3 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400 hover:text-black"
              >
                <ExternalLink size={16} />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Embedded Live Map Window */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#111822] p-2 shadow-lg min-h-[350px] lg:min-h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={16} className="text-cyan-400" /> Live Location Map
              </span>
              <span className="text-xs text-gray-400">Zakhera, Gujarat</span>
            </div>
            <div className="relative w-full flex-1 min-h-[300px] overflow-hidden rounded-xl">
              <iframe
                title="Zakhera Gujarat Location Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale contrast-125 opacity-85 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
