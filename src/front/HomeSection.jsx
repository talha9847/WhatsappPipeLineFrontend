import React from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Video,
  MapPin,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function HomeSection() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24"
      >
        <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <Sparkles size={14} />
            <span>Automotive & Ride-Sharing Community</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Where Drivers, Car Owners & Users <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Connect & Ride Together
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-400 sm:text-lg">
            Share posts like Twitter, post short drive reels like Instagram, and
            broadcast live trip locations like Snapchat. SmartRide connects
            automotive community feeds with instant car bookings.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signin"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-300 sm:w-auto shadow-[0_0_25px_rgba(34,211,238,0.25)]"
            >
              Join the Community
              <ChevronRight size={18} />
            </Link>
            <Link
              to="/messages"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111822] px-6 py-3.5 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-[#0B0F14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-[#111822] p-6 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                <MessageSquare size={24} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                Driver Feeds & Posts
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Share route updates, vehicle news, and trip posts instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#111822] p-6 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                <Video size={24} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                Car & Drive Reels
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Showcase vehicles, scenic routes, and interior clips.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#111822] p-6 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                <MapPin size={24} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                Snap Location
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Broadcast live trip positions on a map for passenger safety.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
