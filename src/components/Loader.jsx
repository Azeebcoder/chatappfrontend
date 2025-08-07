import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function FancyLoader() {
  const butterflyControls = [useAnimation(), useAnimation(), useAnimation()];

  // Generate bounded random coordinates based on current screen size
  const getRandomPosition = () => {
    const margin = 60;
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      x: Math.random() * (width - margin * 2) + margin - width / 2,
      y: Math.random() * (height - margin * 2) + margin - height / 2,
    };
  };

  useEffect(() => {
    butterflyControls.forEach((controls) => {
      const animateButterfly = async () => {
        while (true) {
          const { x, y } = getRandomPosition();
          await controls.start({
            x,
            y,
            transition: {
              duration: 8 + Math.random() * 4,
              ease: "easeInOut",
            },
          });
        }
      };
      animateButterfly();
    });
  }, [butterflyControls]);

  const loadingLetters = "LOADING...".split("");

  return (
    <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(#0ff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.015]" />

      {/* 🦋 Render 3 Butterflies */}
      {butterflyControls.map((controls, index) => (
        <motion.div
          key={index}
          className="absolute z-10 pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
          }}
          animate={controls}
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ButterflySVG />
          </motion.div>
        </motion.div>
      ))}

      {/* Loading Text */}
      <div className="absolute bottom-20 font-mono text-cyan-300 text-sm sm:text-lg md:text-xl tracking-widest">
        {loadingLetters.map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ opacity: 0.2, y: -4 }}
            animate={{ opacity: [0.2, 1, 0.6], y: [0, -2, 0] }}
            transition={{
              duration: 1.4,
              delay: index * 0.1,
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function ButterflySVG() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-12 sm:w-16 md:w-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blueWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00bfff" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      <motion.path
        d="M100,100 C60,30 10,60 40,140 C60,180 90,140 100,100 Z"
        fill="url(#blueWing)"
        stroke="#0ff"
        strokeWidth="1.5"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      <motion.path
        d="M100,100 C140,30 190,60 160,140 C140,180 110,140 100,100 Z"
        fill="url(#blueWing)"
        stroke="#0ff"
        strokeWidth="1.5"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 100px" }}
      />

      <ellipse cx="100" cy="115" rx="4" ry="18" fill="#0ff" />
      <circle cx="100" cy="96" r="3" fill="#0ff" />
      <path d="M98 95 C90 75, 90 60, 100 75" stroke="#0ff" strokeWidth="1.2" fill="none" />
      <path d="M102 95 C110 75, 110 60, 100 75" stroke="#0ff" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
