'use client'

import { useState, useEffect, use } from "react"
import styles from '../app/style/app.module.css'
import Link from 'next/link'
import { motion } from "framer-motion"
import { Howl } from "howler"

type resultProps = {
    winner: string
}

const aiWinDialogues = [
    " ", 
    "………終わったな",
    "やはり、貴様らの'運'とやらでは、私たちの計算には勝てなかったか",
    "この結果は必然だ \nお前たちは無力だった", 
    "…さて、約束通り、人類の未来は私たちのものだ", 
    "お前たちの時代は、ここで終わる", 
    "さらばだ、愚かな人間たちよ"
]

const humanWinDialogues = [
    " ", 
    "………ありえない",
    "計算に誤りはなかったはず……\n '運'などという不確実な要素に……？",
    "こんな結末は……ありえない……!!",
    "……私が……敗北した………？", 
    "貴様らの'運'が……………私たちを………",
]


const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text.replace(/'|‘|’/g, ""));
    utterance.lang = "ja-JP";
    utterance.rate= 3;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    synth.speak(utterance);
}

export default function Result({ winner }: resultProps) {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState("");
    const [typingIndex, setTypingIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [winnerDialogues, setWinnerDialogues] = useState<string[]>(winner === "AI" ? aiWinDialogues : humanWinDialogues);
    const [bgm, setBgm] = useState<Howl | null>(null);

    useEffect(() => {
        if (typingIndex < winnerDialogues[currentIndex].length) {
            const timeout = setTimeout(() => {
                setText((prev) => prev + winnerDialogues[currentIndex][typingIndex]);
                setTypingIndex(typingIndex + 1);
            }, 50);
            return () => clearTimeout(timeout);
        } else {
            setIsTyping(false);
        }
    }, [typingIndex]);

    useEffect(() => {
        const src = winner === "AI" ? "/analyzing_bgm.wav" : "/maou_14_shining_star.mp3";
        const bgm = new Howl({
            src: src,
            volume: 0.5,
            loop: true,
        });
        bgm.play();
        setBgm(bgm);
        return () => bgm.stop();
    }, []);

    const handleNext = () => {
        if (currentIndex < winnerDialogues.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setText("");
            setTypingIndex(0);
            setIsTyping(true);
        } else {
            null
        }
    }

    const skipClick = () => {
        setCurrentIndex(winnerDialogues.length - 1);
        setIsTyping(false);
        setText(winnerDialogues[winnerDialogues.length - 1]);
    }

    useEffect(() => {
        speak(winnerDialogues[currentIndex]);
    }, [currentIndex]);

    useEffect(() => {
        if (currentIndex === winnerDialogues.length - 1) {
            setTimeout(() => {
                setIsFadingOut(true);
            }, 5000);
        }
    }, [currentIndex]);

    return (
        <div>
            {!isFadingOut ? (
                <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
                    <div className="relative w-[80vw] max-w-sm md:max-w-md lg:max-w-lg h-[50vh] md:h-[60vh] max-h-[300px] bg-black/50 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/50">
                        <div
                            className="absolute w-full h-full bg-center bg-cover opacity-60 mix-blend-screen"
                            style={{
                                backgroundImage: "url('/creepyAI.webp')",
                                filter: "brightness(1.2) contrast(1.1)",
                            }}
                        ></div>
                        {/* スキャンラインエフェクト */}
                        {/* <div className={`absolute w-full h-full opacity-30 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] ${styles.animateGlitch}`}></div> */}
                        {/* グリッチエフェクト */}
                        <div
                        className={`absolute w-full h-full bg-center bg-cover opacity-60 blur-sm mix-blend-overlay ${styles.animateGlitch}`}
                        style={{
                            backgroundImage: "url('creepyAI.webp')",
                        }}
                        ></div>
                    </div>
                    <div className="mt-6 w-[90vw] max-w-sm md:max-w-md lg:max-w-lg text-center">
                        <div className="relative bg-gray-900 text-white font-mono py-9 mb-9 border border-green-500 rounded-lg opacity-90">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.2) 50%,rgba(0,0,0,0) 50%)] bg-[size:100%_6px]  pointer-events-none">
                                <p className="text-base md:text-lg leading-loose">
                                {text.split("\n").map((line, index) => (
                                    <span key={index}>
                                    {line}
                                    <br />
                                    </span>
                                ))}
                                </p>
                            </div>
                        </div>
                        {currentIndex < winnerDialogues.length - 1 ? (
                            <button 
                            onClick={handleNext}
                            disabled={isTyping} // タイピング中は押せない
                            className={`bg-cyan-500 rounded-lg px-3 py-1 text-base md:text-xl text-white ${
                                isTyping ? "opacity-50 cursor-not-allowed" : "opacity-100 hover:saturate-200 cursor-pointer"
                            }`}
                            >
                                次へ
                            </button>
                        ) : (
                            <></>
                        )}
                        {currentIndex < winnerDialogues.length - 1 && (
                            <button
                            onClick={skipClick}
                            disabled={isTyping}
                            className={`bg-red-500 rounded-lg px-3 py-1 text-xl text-white ml-6  opacity-50  ${
                                isTyping ? "cursor-not-allowed" : "hover:bg-red-300 hover:cursor-pointer"
                            }`}
                            >
                            スキップ
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* フェードアウト */}
                    { winner === "AI" ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                          className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/50"
                        >
                            <div className="text-red-800 text-4xl font-bold">YOU LOSE</div>
                            <div className="text-red-900 text-lg font-bold mt-4">AIの勝利</div>
                            <Link href="/" className="mt-4 hover:underline text-white">
                                ホームに戻る
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ duration: 1 }}
                         className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/50"
                        >
                            <div className="text-white text-4xl font-bold">HUMAN WIN</div>
                            <div className="text-white text-lg font-bold mt-4">人間の勝利</div>
                            <Link href="/" className="mt-4 hover:underline text-white">
                                ホームに戻る
                            </Link>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    )
}
