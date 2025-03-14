'use client'

import { useState, useEffect } from "react"
import styles from '../app/style/app.module.css'
import { Howl } from "howler";

type DescriptionProps = {
    closeClick: () => void;
}

const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text.replace(/'|'|'/g, ""));
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
    }, [typingIndex, currentIndex]);

    useEffect(() => {
        const bgm = new Howl({
            src: "/maou_bgm_cyber20.mp3",
            volume: 0.1,
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
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/40">
            {/* 背景コンテナ - 改良したサイズと位置 */}
            <div className="absolute top-8 w-[90vw] max-w-[900px] h-[68vh] max-h-[680px] bg-black/60 rounded-lg overflow-hidden shadow-xl shadow-cyan-600/50 border border-cyan-700/40">
                {/* AI背景画像 - より鮮明に */}
                <div
                    className="absolute w-full h-full bg-center bg-cover opacity-70 mix-blend-screen"
                    style={{
                        backgroundImage: "url('/creepyAI.webp')",
                        filter: "brightness(1.3) contrast(1.2) saturate(1.1)",
                    }}
                ></div>
                
                {/* スキャンラインエフェクト - よりはっきりと */}
                <div className={`absolute w-full h-full opacity-50 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] ${styles.animateGlitch}`}></div>
                
                {/* グリッチエフェクト - 適度な強さに */}
                <div
                    className={`absolute w-full h-full bg-center bg-cover opacity-60 blur-sm mix-blend-overlay ${styles.animateGlitch}`}
                    style={{
                        backgroundImage: "url('creepyAI.webp')",
                    }}
                ></div>
                
                {/* サイバーパンク風の光の効果 */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10 opacity-60"></div>
                
                {/* 角にサイバーパンク風の装飾を追加 */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400/80 rounded-br-lg"></div>
            </div>
            
            {/* テキスト表示部分 - 位置を下に移動して顔と重ならないように・高さを固定 */}
            <div className="absolute bottom-24 w-[80vw] max-w-[750px] text-center z-10">
                {/* テキストボックス - 高さを固定 */}
                <div className="bg-gray-900/85 text-white font-mono py-6 px-6 mb-4 border-l-2 border-r-2 border-t border-b-2 border-green-500/70 rounded-lg shadow-lg shadow-green-500/30 h-[150px] flex items-center justify-center">
                    {/* スキャンライン効果 */}
                    <div className="relative h-full w-full">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_6px] pointer-events-none"></div>
                        {/* テキスト - サイバーパンク風のシャドウ効果 */}
                        <p className="text-xl leading-loose relative">
                            {text.split("\n").map((line, index) => (
                                <span key={index} className="text-shadow-cyan relative z-10">
                                    {line}
                                    <br />
                                </span>
                            ))}
                            {/* タイピング中のカーソル効果 */}
                            {isTyping && <span className="inline-block w-3 h-6 bg-green-500 ml-1 animate-pulse"></span>}
                        </p>
                    </div>
                </div>
                
                {/* ボタン - サイバーパンク風にデザイン改良 */}
                <div className="flex justify-center space-x-6">
                    <button 
                        onClick={handleNext}
                        disabled={isTyping}
                        className={`bg-cyan-600 rounded-md px-6 py-2 text-xl text-white border border-cyan-400/50 shadow-md shadow-cyan-500/30 transition-all ${
                            isTyping ? "opacity-50 cursor-not-allowed" : "opacity-100 hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-400/50 cursor-pointer"
                        }`}
                    >
                        {currentIndex < aiDialogues.length - 1 ? "次へ" : "閉じる"}
                    </button>
                    
                    {currentIndex < aiDialogues.length - 1 && (
                        <button
                            onClick={handleSkip}
                            disabled={isTyping} 
                            className={`bg-red-600 rounded-md px-6 py-2 text-xl text-white border border-red-400/50 shadow-md shadow-red-500/30 transition-all ${
                                isTyping ? "opacity-50 cursor-not-allowed" : "opacity-100 hover:bg-red-500 hover:shadow-lg hover:shadow-red-400/50 cursor-pointer"
                            }`}
                        >
                            スキップ
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}