'use client'

import { useState } from "react"
import styles from '../app/style/app.module.css'

type DescriptionProps = {
    closeClick: () => void;
}

export default function Description({ closeClick }: DescriptionProps) {
    const [canClose, setCanClose] = useState(false);
    const handleClose = () => {
        setCanClose(true);
    }
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-3  w-[80vw] max-w-[500px] h-[60vh] max-h-[300px] bg-black/50 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/50">
                <div
                    className="absolute w-full h-full bg-center bg-cover opacity-60"
                    style={{
                        backgroundImage: "url('/creepyAI.webp')",
                        filter: "brightness(1.2) contrast(1.1)",
                        mixBlendMode: "screen",
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
            <div className="absolute top-80 w-[80vw] max-w-[500px] text-center">
                <div className="bg-white py-3 mb-9 rounded-lg opacity-90">
                    ここにゲーム説明を書く
                </div>
                {canClose ? (
                    <button onClick={closeClick} className="bg-cyan-500 rounded-lg px-3 py-1 text-xl text-white">閉じる</button>
                ): (
                    <button 
                    onClick={handleClose}
                    className="bg-cyan-500 rounded-lg px-3 py-1 text-xl text-white"
                    >
                        臨むところだ
                    </button>
                )}
            </div>
        </div>
    )
}