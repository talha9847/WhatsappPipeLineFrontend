import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomeSection from "./HomeSection";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";
import Features from "./Features";
import Audience from "./Audience";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white selection:bg-cyan-500 selection:text-black flex flex-col">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Page Sections */}
      <main className="flex-1">
        <HomeSection />
        <AboutSection />
        <Features />
        <Audience />
        <ContactSection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
