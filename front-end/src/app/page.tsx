// src/app/page.tsx
'use client';
import { useRouter } from "next/navigation";
import Header_home from '@/components/layout/Header_home';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from './style/app.module.css';
import Description from '@/components/Description';

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false); 
  const [canStart, setCanStart] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  // グリッチエフェクトをランダムに適用
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 5000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  const handleDescriptionOpen = () => {
    setIsDescriptionOpen(true);
    setTimeout(() => {
      return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-900"></div>
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

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* スタティックノイズのオーバーレイ */}
      <div className="absolute inset-0 bg-[url(/noise.png)] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      <Header_home />
      
      <div className="fixed top-11 left-0 w-full h-full flex flex-col justify-center items-center bg-black/80 overflow-hidden">
        {/* 破壊された都市のシルエット - 下部に配置 */}
        <div className="absolute bottom-0 w-full h-32 bg-[url(/ruined-city.png)] bg-repeat-x bg-bottom opacity-30"></div>

        {/* グリッドライン */}
        <div className="absolute inset-0 bg-[url(/grid.png)] bg-repeat opacity-10"></div>

        {/* データストリーム (流れるエフェクト) - より暗く、赤系統に */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute top-0 w-[1px] h-full bg-red-800 opacity-${20 + (i % 3) * 10}`}
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 2 + (i % 4), repeat: Infinity, ease: "linear", delay: i * 0.15 }}
            style={{ left: `${5 + i * 6}%` }}
          />
        ))}
        
        {/* 断続的に点滅する警告灯のような効果 */}
        <div className={`absolute inset-0 bg-red-900 opacity-0 transition-opacity duration-300 ${glitchEffect ? 'opacity-5' : ''}`}></div>

        {/* ゲーム説明 */}
        {isDescriptionOpen ? (
          <>
            <Description closeClick={handleDescriptionClose}/>
          </>
        ) : (
        <>
          <motion.h1 
            className={`text-6xl font-bold text-red-600 z-10 ${styles.glitchEffect} tracking-wider`}
            animate={{ 
              textShadow: glitchEffect 
                ? '2px 0 #ff0000, -2px 0 #0000ff' 
                : '0 0 8px rgba(220, 38, 38, 0.8), 0 0 12px rgba(220, 38, 38, 0.5)' 
            }}
          >
            LAST BET
          </motion.h1>
          
          {/* スタートボタン */}
          {!isStarting ? (
            <>
              <motion.button
                onClick={handleDescriptionOpen}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(185, 28, 28, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="mt-10 px-9 py-3 z-10 bg-gray-900 border border-red-800 text-gray-300 text-2xl font-mono rounded-sm shadow-lg transition-all duration-300"
              >
                システム説明
              </motion.button>
              
              {canStart && (
                <motion.button
                  onClick={handleStart}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 0 20px rgba(220, 38, 38, 0.8)",
                    backgroundColor: "rgba(127, 29, 29, 0.9)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-10 px-6 py-3 z-10 bg-red-900 text-white text-2xl font-mono rounded-sm shadow-inner shadow-red-700/50 border border-red-700"
                >
                  最期の賭け
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
              className={`text-red-600 text-8xl font-mono mt-10 z-10 ${glitchEffect ? 'translate-x-1' : ''}`}
              style={{ 
                textShadow: "0 0 10px rgba(220, 38, 38, 0.8)",
                fontFamily: "'Courier New', monospace"
              }}
            >
              {countdown > 0 ? countdown : "EXECUTE"}
            </motion.div>
          )}

          {/* 点滅するお知らせや警告メッセージ */}
          <motion.div
            className="absolute bottom-20 text-red-600 opacity-60 font-mono text-sm"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            警告: このシステムへのアクセスは監視されています
          </motion.div>
        </>
        )}
      </div>
    </main>
  );
}