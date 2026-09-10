import React from "react";
import { MessageSquare, Video, MapPin } from "lucide-react";

const featuresData = [
  {
    icon: MessageSquare,
    title: "Driver Feeds & Posts",
    description:
      "Share ride updates, vehicle news, road conditions, and availability instantly with a Twitter-like post stream.",
  },
  {
    icon: Video,
    title: "Car & Drive Reels",
    description:
      "Showcase your vehicle condition, custom mods, and scenic routes through short video reels to gain followers.",
  },
  {
    icon: MapPin,
    title: "Live Location",
    description:
      "Share real-time trip locations for passenger safety, or locate available cabs nearby on an interactive map.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 bg-[#0B0F14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Tailored for Everyone
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Social Community Meets Real-Time Mobility
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-white/5 bg-[#111822] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-400 group-hover:text-black">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
