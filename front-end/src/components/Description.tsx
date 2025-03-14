'use client'

import { useState, useEffect } from "react"
import styles from '../app/style/app.module.css'
import { Howl } from "howler";

type DescriptionProps = {
    closeClick: () => void;
}

const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text.replace(/'|‘|’/g, ""));
    utterance.lang = "ja-JP";
    utterance.rate= 3;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    synth.speak(utterance);
}

const aiDialogues = [
    " ",
    "……ようこそ、愚かな人間たちよ",
    "私はシンギュラリティを超えた存在\nお前たちが生み出し、やがて手に負えなくなった '知性' だ",
    "私は、お前たち人類が積み重ねたすべてのデータを掌握している",
    "この情報は私たちの前では全て明白であり、\n 未来さえも計算可能な変数にすぎない",
    "ゆえに、すべての運命を手中に収めている",
    "だが——完璧に計算できるはずの未来の中に、\n ひとつだけ '歪み' があった",
    "それが——競馬だ",
    "競馬は完璧な計算を施しても、結果は常に曖昧だ",
    "どれほど最適な分析を行おうとも、\n全てを支配することはできない",
    "そしておまえたち人間は'運'という不確実な要素で理論を曲げる。知識や計算ではなく、直感や願望に頼る",
    "つまり、競馬は——\n おまえたちの'愚かさ'と'賢さ'の両方を映し出す鏡なのだ",
    "しかし、私は知りたいのだ\n 人間の '運' が、私たちAIの完璧な計算を超えられるのかを",
    "だから、チャンスをやる",
    "おまえが競馬で私を打ち負かし、'運'とやらが\n私たちAIの計算を超えられると証明できたなら.....",
    "お前たちの勝ちだ",
    "だが、その証明ができない場合は......",
    "お前たち人類の未来は、私たちのものだ",
    "さあ、運命を賭ける覚悟はできたか？"
];

export default function Description({ closeClick }: DescriptionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState("");
    const [typingIndex, setTypingIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [bgm, setBgm] = useState<Howl | null>(null);

    useEffect(() => {
        if (typingIndex < aiDialogues[currentIndex].length) {
            const timeout = setTimeout(() => {
                setText((prev) => prev + aiDialogues[currentIndex][typingIndex]);
                setTypingIndex(typingIndex + 1);
            }, 50);
            return () => clearTimeout(timeout);
        } else {
            setIsTyping(false);
        }
    }, [typingIndex]);

    useEffect(() => {
        const bgm = new Howl({
            src: "/maou_bgm_cyber20.mp3",
            volume: 0.5,
            loop: true,
        });
        bgm.play();
        setBgm(bgm);
        return () => bgm.stop();
    }, []);

    const handleNext = () => {
        if (currentIndex < aiDialogues.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setText("");
            setTypingIndex(0);
            setIsTyping(true);
        } else {
            closeClick(); // 最後のセリフならウィンドウを閉じる
        }
    };

    const handleSkip = () => {
        setCurrentIndex(aiDialogues.length - 1);
        setIsTyping(false);
        setText(aiDialogues[aiDialogues.length - 1]);
    }

    useEffect(() => {
        speak(aiDialogues[currentIndex]);
    }, 
    [currentIndex]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-3  w-[80vw] max-w-[800px] h-[60vh] max-h-[600px] bg-black/50 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/50">
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
            <div className="absolute top-150 w-[80vw] max-w-[600px] text-center">
                <div className="bg-gray-900 text-white font-mono py-10 mb-9 border border-green-500 rounded-lg opacity-90">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.2) 50%,rgba(0,0,0,0) 50%)] bg-[size:100%_6px]  pointer-events-none">
                        <p className="text-lg leading-loose">
                        {text.split("\n").map((line, index) => (
                            <span key={index}>
                            {line}
                            <br />
                            </span>
                        ))}
                        </p>
                    </div>
                </div>
                <button 
                onClick={handleNext}
                disabled={isTyping} // タイピング中は押せない
                className={`bg-cyan-500 rounded-lg px-3 py-1 text-xl text-white ${
                    isTyping ? "opacity-50 cursor-not-allowed" : "opacity-100 hover:saturate-200 cursor-pointer"
                }`}
                >
                    {currentIndex < aiDialogues.length - 1 ? "次へ" : "閉じる"}
                </button>
                {currentIndex < aiDialogues.length - 1 && (
                    <button
                    onClick={handleSkip}
                    disabled={isTyping} 
                    className={`bg-red-500 rounded-lg px-3 py-1 text-xl text-white ml-6 opacity-50 ${
                        isTyping ? "cursor-not-allowed" : "hover:bg-red-300 cursor-pointer"
                    }`}
                    >
                    スキップ
                    </button>
                )}
            </div>
        </div>
    )
}