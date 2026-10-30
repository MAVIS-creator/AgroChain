import React from "react";
import heroImg from "../assets/landing_hero.jpg";

export default function LandingPage({ onConnectWallet }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#15543B] p-8 text-white">
      <img
        src={heroImg}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 mix-blend-luminosity"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#15543B]/30 via-transparent to-[#0d3f2c]/80" />
      <div className="z-10 max-w-4xl space-y-7 text-center">
        <img
          src="/brand/agrochain-full-colour.png"
          alt="AgroChain"
          className="mx-auto w-[min(520px,82vw)] object-contain brightness-0 invert"
        />
        <p className="text-lg opacity-90 md:text-xl">
          Blockchain-powered smart agriculture platform for cassava &amp; maize value chains.
        </p>
        <button
          type="button"
          onClick={onConnectWallet}
          className="mt-4 rounded-xl bg-[#D6A637] px-7 py-3.5 font-bold text-[#15543B] shadow-lg transition hover:bg-[#e1b84f]"
        >
          Connect Wallet &amp; Explore
        </button>
      </div>
    </section>
  );
}
