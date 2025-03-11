// src/app/page.tsx
'use client';
import { useRouter } from "next/navigation";
import Header_home from '@/components/layout/Header_home';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Suspense } from "react";


type PositionProps = {
  x: number;
  y: number;
  z: number;
}

function HorseModel( { x, y, z } : PositionProps) {
  const { scene, animations } = useGLTF("/the_horse.glb")
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions[names[0]]) {
      actions[names[0]]?.play();
    }
  }, [actions, names]);
  return <primitive object={scene} scale={1.5} position={[x, y, z]} rotation={[1, -1.5, 0.2]}/>;
}

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
    <main className="min-h-screen bg-gradient-to-t from-green-900 to-green-400">
      <Header_home />
      <div className="fixed top-11 left-0 w-full h-full flex flex-col justify-center items-center bg-black/50 overflow-hidden">
        {/* 背景画像 (馬の疾走シルエット) */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 2.5, ease: "linear" }}
          className="absolute w-full h-full opacity-70"
        >
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Suspense fallback={null}>
              <HorseModel x={0.5} y={0} z={-1} /> 
            </Suspense>
            {/* <OrbitControls /> */}
          </Canvas>
        </motion.div>
        
        {/* タイトル */}
        <h1 className="text-6xl font-bold text-yellow-400 z-10 drop-shadow-lg">ULTIMATE HORSE RACING</h1>
        
        {/* スタートボタン */}
        {!isStarting ? (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="mt-10 px-9 py-3 z-10 bg-gray-600 text-white text-2xl font-bold rounded-full shadow-lg"
            >
              ゲーム説明
            </motion.button>
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="mt-10 px-6 py-3 z-10 bg-gradient-to-r from-yellow-400 to-red-500 text-white text-2xl font-bold rounded-full shadow-lg"
            >
              レース開始！
            </motion.button>
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
      </div>
    </main>
  );
}
