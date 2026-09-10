import React from "react";
import { Car, Users, ShieldCheck } from "lucide-react";

export default function Audience() {
  return (
    <section
      id="community"
      className="py-16 border-t border-b border-white/5 bg-[#0E141D]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Ecosystem
            </span>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Built for Drivers, Owners & Passengers
            </h2>
            <p className="mt-4 text-gray-400">
              Whether you own a fleet, drive for a living, or need a reliable
              cab booking platform, SmartRide provides a dedicated environment
              for all automotive requirements.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                  <Car size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Car Owners</h4>
                  <p className="text-sm text-gray-400">
                    List vehicles for rent or dispatch and track driver progress
                    live.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    Professional Drivers
                  </h4>
                  <p className="text-sm text-gray-400">
                    Build your profile, post trip offers, and grow a loyal
                    client base.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Cab Seekers</h4>
                  <p className="text-sm text-gray-400">
                    Find verified nearby cabs, check driver posts, and book
                    directly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111822] p-8 shadow-2xl">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="h-12 w-12 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold">
                SR
              </div>
              <div>
                <h4 className="font-semibold text-white">SmartRide Network</h4>
                <p className="text-xs text-gray-400">Gujarat Dispatch Hub</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-white/5 bg-[#1A2330] p-4 text-xs text-gray-300">
                <p className="font-semibold text-cyan-400">@zakhera_driver</p>
                <p className="mt-1 text-white">
                  Heading from Zakhera to Surat. 3 seats open in Sedan. DM for
                  instant booking!
                </p>
                <div className="mt-2 flex items-center gap-3 text-gray-500">
                  <span>10 mins ago</span>
                  <span>·</span>
                  <span>Live Location Active</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#1A2330] p-4 text-xs text-gray-300">
                <p className="font-semibold text-cyan-400">@gujarat_cabs</p>
                <p className="mt-1 text-white">
                  New Luxury SUV added to fleet. Check out the latest reel on
                  our profile.
                </p>
                <div className="mt-2 flex items-center gap-3 text-gray-500">
                  <span>1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
