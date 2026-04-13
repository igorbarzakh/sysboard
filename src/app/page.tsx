"use client";

import { useState } from "react";
import { AuthModal } from "@/features/auth-modal";
import { RootHeader } from "@/widgets/root-header/RootHeader";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-base bg-[radial-gradient(circle,var(--border-default)_1px,transparent_1px)] bg-size-[24px_24px]">
        <RootHeader onSignInClick={() => setModalOpen(true)} />
        <div
          aria-hidden="true"
          className="absolute top-[10%] left-[15%] w-125 h-125 rounded-full bg-accent-glow blur-[80px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[15%] right-[10%] w-100 h-100 rounded-full bg-[rgba(121,80,242,0.05)] blur-[80px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-[40%] right-[25%] w-75 h-75 rounded-full bg-accent-glow blur-[60px] pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-200">
          <h1 className="text-[clamp(48px,8vw,80px)] font-bold text-text-primary leading-tight mb-4">
            Design systems
            <br />
            <span className="relative inline-block">
              <span className="text-accent relative z-10">together</span>

              <span className="absolute inset-[-0_-12px_-8px_-12px] bg-accent/10 border border-accent/40 rounded-[4px] pointer-events-none" />

              <span className="absolute -bottom-7 -right-14 flex flex-col items-start gap-0.5 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 1l9 5.5-4.5 1.4L5 13z"
                    fill="#2EC98A"
                    stroke="white"
                    strokeWidth="0.8"
                  />
                </svg>
                <span className="text-[10px] font-semibold text-white bg-[#2EC98A] px-1.5 py-0.5 rounded ml-2.5 whitespace-nowrap">
                  Alex
                </span>
              </span>
            </span>
          </h1>

          <p className="text-lg text-text-secondary leading-relaxed max-w-140 mt-8">
            A&nbsp;shared canvas for software architects. Draw, connect, and&nbsp;collaborate
            in&nbsp;real&nbsp;time.
          </p>

          <div className="flex flex-col items-center gap-3 mt-8">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-accent text-white font-semibold text-lg px-10 py-4 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-[#1C1C1E]">
              Get started
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
