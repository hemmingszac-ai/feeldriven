"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedSphere } from "./animated-sphere";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-foreground transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0,0,0,0.15), transparent 40%)`
            }}
          />
          
          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left content */}
              <div className="flex-1">
                <h2 className="mb-8 text-4xl font-semibold tracking-tight leading-[0.95] lg:text-7xl">
                  Build the right team
                  <br />
                  <span className="italic">instantly.</span>
                </h2>

                <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-xl">
                  Already have an account? Log straight into the platform and start building your team.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group h-14 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90",
                    )}
                  >
                    Log in
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                      "h-14 rounded-full border-foreground/30 bg-transparent px-8 text-base text-foreground hover:bg-foreground/10 hover:text-foreground",
                    )}
                  >
                    Sign up
                  </Link>
                </div>
              </div>

              {/* Right animation */}
              <div className="hidden lg:flex items-center justify-center w-[400px] h-[400px] opacity-30 -mr-16">
                <AnimatedSphere />
              </div>
            </div>
          </div>

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-foreground/10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-t border-r border-foreground/10" />
        </div>
      </div>
    </section>
  );
}
