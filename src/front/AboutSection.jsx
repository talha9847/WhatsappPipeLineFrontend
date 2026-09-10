import React from "react";
import { Car, Users, ShieldCheck } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 border-t border-white/5 bg-[#0B0F14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl">
            About Smart<span className="text-cyan-400">Ride</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            SmartRide bridges the gap between social media engagement and daily
            mobility needs.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#111822] p-8 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Car size={24} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">
              For Car Owners
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              List vehicles, build driver networks, and track live fleet
              activities with transparent monitoring tools.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#111822] p-8 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users size={24} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">For Drivers</h3>
            <p className="mt-2 text-sm text-gray-400">
              Share updates, gain followers, post short video reels of your
              rides, and receive direct booking inquiries.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#111822] p-8 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">
              For Passengers
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Find verified driver options, follow live trip map routes, and
              book rides confidently within your local network.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
