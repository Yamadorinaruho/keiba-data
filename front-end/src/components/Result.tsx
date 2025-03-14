'use client'

import { useState, useEffect } from "react";
import styles from '../app/style/app.module.css';
import Link from 'next/link';
import { motion } from "framer-motion";
import { Howl } from "howler";

type ResultProps = {
  winner: string;
};

const aiWinDialogues = [
  " ",
  "………終わったな",
  "やはり、貴様らの'運'とやらでは、私たちの計算には勝てなかったか",
  "この結果は必然だ \nお前たちは無力だった",
  "…さて、約束通り、人類の未来は私たちのものだ",
  "お前たちの時代は、ここで終わる",
  "さらばだ、愚かな人間たちよ",
];

const humanWinDialogues = [
  " ",
  "………ありえない",
  "計算に誤りはなかったはず……\n '運'などという不確実な要素に……？",
  "こんな結末は……ありえない……!!",
  "……私が……敗北した………？",
  "貴様らの'運'が……………私たちを………",
];

const speak = (text: string) => {
  const synth = window.speechSynthesis;
  const cleanedText = text.replace(/'/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = "ja-JP";
  utterance.rate = 3;
  utterance.pitch = 1.2;
  utterance.volume = 1;
  synth.speak(utterance);
};

export default function Result({ winner }: ResultProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [bgm, setBgm] = useState<Howl | null>(null);
  const dialogues = winner === "AI" ? aiWinDialogues : humanWinDialogues;

  // タイピングエフェクト
  useEffect(() => {
    if (typingIndex < dialogues[currentIndex].length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + dialogues[currentIndex][typingIndex]);
        setTypingIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [typingIndex, currentIndex, dialogues]);

  // 背景音楽の再生
  useEffect(() => {
    const src = winner === "AI" ? "/analyzing_bgm.wav" : "/maou_14_shining_star.mp3";
    const sound = new Howl({
      src,
      volume: 0.1,
      loop: true,
    });
    sound.play();
    setBgm(sound);
    return () => sound.stop();
  }, [winner]);

  // ダイアログ変更時に音声合成を実行
  useEffect(() => {
    speak(dialogues[currentIndex]);
  }, [currentIndex, dialogues]);

  // 最終ダイアログ到達後にフェードアウト開始
  useEffect(() => {
    if (currentIndex === dialogues.length - 1) {
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, dialogues]);

  const handleNext = () => {
    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setText("");
      setTypingIndex(0);
      setIsTyping(true);
    }
  };

  const skipClick = () => {
    setCurrentIndex(dialogues.length - 1);
    setIsTyping(false);
    setText(dialogues[dialogues.length - 1]);
  };

  return (
    <div className="relative w-full h-full">
      {!isFadingOut ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* AI画像表示エリア */}
          <div className="absolute top-[100px] w-[600px] h-[350px] bg-transparent">
            <div
              className="absolute w-full h-full bg-center bg-cover mix-blend-normal"
              style={{
                backgroundImage: "url('/creepyAI.webp')",
                filter: "brightness(1.2) contrast(1.1)",
              }}
            />
            {/* グリッチエフェクト */}
            <div
              className={`absolute w-full h-full bg-center bg-cover opacity-60 blur-sm mix-blend-overlay ${styles.animateGlitch}`}
              style={{ backgroundImage: "url('creepyAI.webp')" }}
            />
            {/* 枠線装飾 */}
            <div className="absolute inset-0 border border-cyan-500/50 rounded-lg" />
          </div>

          {/* ボタン */}
          <div className="absolute top-[600px] left-0 right-0 flex justify-center mt-4">
            <div className="flex justify-center space-x-6">
              {currentIndex < dialogues.length - 1 && (
                <>
                  <button
                    onClick={handleNext}
                    disabled={isTyping}
                    className={`bg-cyan-500 rounded-lg px-5 py-2 text-lg text-white ${
                      isTyping ? "opacity-50 cursor-not-allowed" : "opacity-100 hover:saturate-200 cursor-pointer"
                    }`}
                  >
                    次へ
                  </button>
                  <button
                    onClick={skipClick}
                    disabled={isTyping}
                    className={`bg-red-500 rounded-lg px-5 py-2 text-lg text-white opacity-95 ${
                      isTyping ? "cursor-not-allowed" : "hover:bg-red-600 cursor-pointer"
                    }`}
                  >
                    スキップ
                  </button>
                </>
              )}
            </div>
          </div>

          {/* テキスト表示部分 */}
          <div className="absolute top-[470px] left-0 right-0 flex justify-center z-10">
            <div className="bg-gray-900/80 text-white font-mono py-4 px-6 w-[600px] h-[120px] border border-green-500/50 rounded-lg flex items-center justify-center">
              <p className="text-xl leading-relaxed text-center">
                {text.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
                {isTyping && (
                  <span
                    className={`inline-block w-3 h-6 ${winner === "AI" ? "bg-red-500" : "bg-green-500"} ml-1 animate-pulse`}
                  />
                )}
              </p>
            </div>
          </div>
        </div>
      ) : winner === "AI" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <div className="text-center">
            <div className="text-red-800 text-4xl font-bold">YOU LOSE</div>
            <div className="text-red-900 text-lg font-bold mt-4">AIの勝利</div>
            <Link href="/" className="mt-4 hover:underline text-white">
              ホームに戻る
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <div className="text-center">
            <h1 className="text-white text-4xl font-bold">HUMAN WIN</h1>
            <p className="text-white text-lg font-bold mt-4">人間の勝利</p>
            <Link href="/" className="mt-4 hover:underline text-white">
              ホームに戻る
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
