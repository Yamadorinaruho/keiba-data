'use client'

import { useState, useEffect } from "react"
import styles from '../app/style/app.module.css'

type resultProps = {
    winner: string
}

const aiWinDialogues = [
    "………終わったな",
    "やはり、貴様らの'運'とやらでは、私たちの計算には勝てなかったか",
    "この結果は必然だ \nお前対は無力だった", 
    "…さて、約束通り、人類の未来は私たちのものだ", 
    "お前たちの時代は、ここで終わる", 
    "さらばだ、愚かな人間たちよ"
]

const humanWinDialogues = [
    "………ありえない",
    "計算に誤りはなかったはず……\n '運'ばぢちいう不確実な要素に……？",
    "こんな結末は……ありえない……!!",
    "……私は…………敗北した………？", 
    "貴様らの'運'が……………私たちを………",
]

const handleNext = () => {
    
}

export default function Result({ winner }: resultProps) {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState("");
    const [typingIndex, setTypingIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (winner === "AI") {
            if (typingIndex < aiWinDialogues[currentIndex].length) {
                const timeout = setTimeout(() => {
                    setText((prev) => prev + aiWinDialogues[currentIndex][typingIndex]);
                    setTypingIndex(typingIndex + 1);
                }, 50);
                return () => clearTimeout(timeout);
            } else {
                setIsTyping(false);
            }
        } else {
            if (typingIndex < humanWinDialogues[currentIndex].length) {
                const timeout = setTimeout(() => {
                    setText((prev) => prev + humanWinDialogues[currentIndex][typingIndex]);
                    setTypingIndex(typingIndex + 1);
                }, 50);
                return () => clearTimeout(timeout);
            } else {
                setIsTyping(false);
            }
        }
    }, [typingIndex]);

    const handleNext = () 

    return (
        <div>
            <div>勝者は{winner}です</div>
        </div>
    )
}
