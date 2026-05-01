"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const generateParticles = () =>
  Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: getRandom(1, 4),
    left: getRandom(0, 100),
    top: getRandom(0, 100),
    delay: getRandom(0, 0.3),
    duration: getRandom(10, 30),
  }));

const BackgroundEffects = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(
    () => (mounted ? generateParticles() : []),
    [mounted],
  );

  return (
    <div
      data-testid="background-effects"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      suppressHydrationWarning
    >
      <div data-testid="background-effects-base" className="absolute inset-0 bg-white" />

      <div
        data-testid="background-effects-glow-top"
        className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(234, 111, 8, 0.4) 0%, rgba(234, 111, 8, 0.15) 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      <motion.div
        data-testid="background-effects-orb-top-left"
        className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-[0.10]"
        animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, rgba(234, 111, 8, 0.3) 0%, rgba(234, 111, 8, 0.12) 50%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        data-testid="background-effects-orb-bottom-right"
        className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full opacity-[0.08]"
        animate={{ y: [0, 40, 0], x: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          background:
            "radial-gradient(circle, rgba(234, 111, 8, 0.25) 0%, rgba(234, 111, 8, 0.1) 50%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          data-testid={`background-effects-particle-${particle.id}`}
          className="absolute rounded-full bg-orange-400/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundEffects;
