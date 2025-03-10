// src/app/page.tsx
'use client';
import { useRouter } from "next/navigation";
import Header_home from '@/components/layout/Header_home';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";


export default function Home() {

  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);

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
        }, 2000);
      }
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-green-800">
      <Header_home />
      <div className="fixed top-11 left-0 w-full h-full flex flex-col justify-center items-center bg-black/50 overflow-hidden">
        {/* 背景画像 (馬の疾走シルエット) */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          className="absolute w-full h-full opacity-30"
        >
          <Image src="/logo_horse.png" alt="Racing Horses" layout="fill" objectFit="cover" color="red"/>
        </motion.div>
        
        {/* タイトル */}
        <h1 className="text-6xl font-bold text-yellow-400 z-10 drop-shadow-lg">ULTIMATE HORSE RACING</h1>
        
        {/* スタートボタン */}
        {!isStarting ? (
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mt-10 px-6 py-3 bg-gradient-to-r from-yellow-400 to-red-500 text-white text-2xl font-bold rounded-full shadow-lg"
          >
            レース開始！
          </motion.button>
        ) : (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8 }}
            className="text-white text-8xl font-bold mt-10"
          >
            {countdown > 0 ? countdown : "GO!"}
          </motion.div>
        )}
      </div>
    </main>
  );
}
