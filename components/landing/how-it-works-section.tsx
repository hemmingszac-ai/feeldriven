"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "I",
    title: "A project lands",
    description: "A new job, client request, or internal initiative comes in. The manager asks: who should actually work on this?",
    visibleCards: 0,
  },
  {
    number: "II",
    title: "AI scans the org",
    description: "teamhuddl cross-references every employee's strength profile, team role, and collaboration history in seconds.",
    visibleCards: 2,
  },
  {
    number: "III",
    title: "Review the scorecard",
    description: "See the recommended team, why each person was picked, and available alternatives. Add or remove people instantly.",
    visibleCards: 4,
  },
  {
    number: "IV",
    title: "Send the Huddle",
    description: "One click creates the kickoff email thread with everyone included — AI-written brief, project title, role expectations.",
    visibleCards: 4,
  },
];

const selectedMembers = [
  { name: "Krishna Sridhar", rank: 1, attrs: ["Leading teams", "Product strategy", "Active listening"] },
  { name: "Steve Jobs", rank: 2, attrs: ["People-facing work", "Active listening", "Agile delivery"] },
];

const benchMembers = [
  { name: "Bill Gates", attrs: ["Leading teams", "Mentoring others", "Delegation"] },
  { name: "David Brockbank", attrs: ["Hands-on execution", "Leading teams", "People-facing work"] },
];

function SelectedCard({ member, delay, visible }: { member: typeof selectedMembers[0]; delay: number; visible: boolean }) {
  return (
    <div
      className="w-44 shrink-0 rounded-xl bg-white p-3 flex flex-col gap-3 transition-all duration-500 relative"
      style={{
        border: "1.5px solid #ff6333",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: visible ? `${delay}ms` : "0ms",
        backgroundColor: "#fff9f7",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
          #{member.rank}
        </span>
        <span className="text-gray-400 text-xs leading-none cursor-pointer">✕</span>
      </div>
      <p className="text-sm font-bold leading-tight" style={{ color: "#ff6333" }}>{member.name}</p>
      <div className="flex flex-col gap-1.5">
        {member.attrs.map((a) => (
          <div key={a} className="flex items-center gap-1.5">
            <span className="text-green-500 text-[10px]">✓</span>
            <span className="text-[11px] text-gray-600">{a}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-gray-300 text-xs">⠿</span>
      </div>
    </div>
  );
}

function BenchCard({ member, delay, visible }: { member: typeof benchMembers[0]; delay: number; visible: boolean }) {
  return (
    <div
      className="w-44 shrink-0 rounded-xl bg-white p-3 flex flex-col gap-3 transition-all duration-500"
      style={{
        border: "1.5px solid #e5e7eb",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      <div className="flex justify-end">
        <span className="text-gray-400 text-xs leading-none cursor-pointer">+</span>
      </div>
      <p className="text-sm font-bold leading-tight" style={{ color: "#ff6333" }}>{member.name}</p>
      <div className="flex flex-col gap-1.5">
        {member.attrs.map((a) => (
          <div key={a} className="flex items-center gap-1.5">
            <span className="text-green-500 text-[10px]">✓</span>
            <span className="text-[11px] text-gray-600">{a}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-gray-300 text-xs">⠿</span>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [resetInterval]);

  const visibleCount = steps[activeStep].visibleCards;

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden bg-white"
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <h2
            className={`text-5xl font-semibold tracking-tight text-gray-900 transition-all duration-700 lg:text-7xl ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            From brief to team
            <br />
            <span className="italic" style={{ color: "#ff6333" }}>in minutes.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => { setActiveStep(index); resetInterval(); }}
                className={`w-full text-left py-8 border-b border-gray-100 transition-all duration-500 group ${
                  activeStep === index ? "opacity-100" : "opacity-30 hover:opacity-60"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="text-3xl font-semibold text-gray-200">{step.number}</span>
                  <div className="flex-1">
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight text-gray-900 transition-transform duration-300 group-hover:translate-x-2 lg:text-3xl">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">{step.description}</p>
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-gray-100 overflow-hidden">
                        <div
                          key={activeStep}
                          className="h-full w-0"
                          style={{ animation: "howProgress 1.95s linear forwards", backgroundColor: "#ff6333" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* App UI mockup */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-gray-50">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-5 rounded bg-gray-100 text-[10px] font-mono text-gray-400 flex items-center px-3">
                    teamhuddl.app / team-builder
                  </div>
                </div>
              </div>

              {/* App content */}
              <div className="p-5 space-y-4" style={{ backgroundColor: "#fdf8f6" }}>
                <p className="text-sm font-semibold text-gray-800">Your Dream Team</p>

                {/* Selected lineup */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Selected lineup</p>
                    <p className="mt-1 min-h-4 text-xs leading-4 text-gray-400">
                      {visibleCount < 2 ? "No players selected yet." : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 overflow-hidden pb-1">
                    {selectedMembers.map((m, i) => (
                      <SelectedCard key={m.name} member={m} delay={i * 150} visible={visibleCount >= 2} />
                    ))}
                  </div>
                </div>

                {/* Bench */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Bench (available to swap in)</p>
                    <p className="mt-1 min-h-4 text-xs leading-4 text-gray-400">
                      {visibleCount < 4
                        ? visibleCount === 0
                          ? "Paste a brief to get started."
                          : "Scanning for candidates..."
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 overflow-hidden pb-1">
                    {benchMembers.map((m, i) => (
                      <BenchCard key={m.name} member={m} delay={i * 150 + 300} visible={visibleCount >= 4} />
                    ))}
                  </div>
                </div>

                {/* Start Huddle button */}
                <div
                  className="flex justify-center transition-all duration-500"
                  style={{
                    opacity: activeStep === 3 ? 1 : 0,
                    transform: activeStep === 3 ? "translateY(0)" : "translateY(8px)",
                    pointerEvents: activeStep === 3 ? "auto" : "none",
                  }}
                >
                  <div className="huddl-btn px-6 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg cursor-default select-none">
                    ✉ Start Huddle
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes howProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes huddlColor {
          0%   { background-color: #ff6333; }
          50%  { background-color: #5d8497; }
          100% { background-color: #ff6333; }
        }
        @keyframes huddlPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 99, 51, 0.55); }
          60%       { box-shadow: 0 0 0 10px rgba(255, 99, 51, 0); }
        }
        .huddl-btn {
          animation: huddlColor 2.5s ease-in-out infinite, huddlPulse 1.6s ease-out infinite;
        }
      `}</style>
    </section>
  );
}
