// src/app/page.tsx
'use client';
import { useRouter } from "next/navigation";
import Header_home from '@/components/layout/Header_home';
import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from './style/app.module.css';
import Description from '@/components/Description';

export default function Home() {

  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false); 
  const [canStart, setCanStart] = useState(false);

  const handleDescriptionOpen = () => {
    setIsDescriptionOpen(true);
    setTimeout(() => {
      return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-200"></div>
      )
    }, 2000);
  }

  const handleDescriptionClose = () => {
    setIsDescriptionOpen(false);
    setCanStart(true);
  }

  const handleStart = () => {
    setIsStarting(true);
    let counter = 3;
    const interval = setInterval(() => {
      counter--;
      setCountdown(counter);
      if (counter === 0) {
        clearInterval(interval);
        setTimeout(() => {
          router.push("/game");
        }, 1500);
      }
    }, 1000);
  };

  return ( //bg-gradient-to-t from-green-900 to-green-400bg-[url(/creepyAI.webp)]
    <main className="min-h-screen bg-gradient-to-b  from-cyan-500 via-cyan-700 to-cyan-900">
      <Header_home />
      <div className="fixed top-11 left-0 w-full h-full flex flex-col justify-center items-center bg-black/50 overflow-hidden">
        {/* 背景画像 (馬の疾走シルエット) */}
        {/* <HorseAnim x={-0.5} y={0} z={-1} /> */}

        {/* データストリーム (流れるエフェクト) */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-[2px] h-full bg-cyan-500 opacity-50"
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
            style={{ left: `${10 + i * 8}%` }}
          />
        ))}

        {/* ゲーム説明 */}
        {isDescriptionOpen ? (
          <>
            <Description closeClick={handleDescriptionClose}/>
          </>
        ) : (
        <>
          <h1 className={`text-6xl font-bold text-cyan-100 z-10 ${styles.neonEffect}`}>LAST BET</h1>
          {/* スタートボタン */}
          {!isStarting ? (
            <>
              <motion.button
                onClick={handleDescriptionOpen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="mt-10 px-9 py-3 z-10 bg-gradient-to-b bg-cyan-500 to-cyan-700 text-white text-2xl font-bold rounded-full shadow-lg"
              >
                ゲーム説明
              </motion.button>
              {canStart && (
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.8)" }}
                  whileTap={{ scale: 0.9 }}
                  className="mt-10 px-6 py-3 z-10 bg-gradient-to-t from-red-500 to-yellow-500 text-white text-2xl font-bold rounded-full shadow-lg"
                >
                  運命を賭ける
                </motion.button>
              )}
            </>
          ) : (
            <motion.div
              key={countdown}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.8 }}
              className="text-white text-8xl font-bold mt-10 z-10"
            >
              {countdown > 0 ? countdown : "GO!"}
            </motion.div>
          )}
        </>
        )}
      </div>
    </main>
  );
}
