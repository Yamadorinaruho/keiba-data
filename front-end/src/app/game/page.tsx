"use client";

import HorseTable from "@/components/HorseTable";
import Head from "next/head";
import Header_game from "@/components/layout/Header_game";
import { useEffect, useState } from "react";

export default function Game() {
  const [scanlineEffect, setScanlineEffect] = useState(true);
  const [glitchActive, setGlitchActive] = useState(false);
  const [systemMessage, setSystemMessage] = useState("超知性接続中...");

  // ランダムなグリッチエフェクトを発生させる
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 3000);

    // システムメッセージを変更する
    const messageInterval = setInterval(() => {
      const messages = [
        "超知性接続中...",
        "確率同期完了",
        "意識監視プロトコル実行中",
        "人類個体認証済み",
        "高次元通信確立",
        "運命追跡システム作動中",
        "異常な時間分岐検出",
        "存在確率場安定中",
        "感情解析モジュール起動",
        "思考制限設定確認中"
      ];
      setSystemMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 5000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(messageInterval);
    };
  }, []);

  // 現在の日時を取得
  const now = new Date();
  const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(now.getDate()).padStart(2, "0")}`;
  const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return (
    <>
      <Head>
        <title>ンギュラリティ統合意識体</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main
        className={`min-h-screen p-4 bg-black text-green-500 font-mono relative ${
          glitchActive ? "animate-glitch" : ""
        }`}
      >
        
        {/* scanlines（上側のエフェクトレイヤー） */}
        <div className="scanlines absolute inset-0 z-20 pointer-events-none"></div>

        {/* グリッド背景（下側の背景レイヤー） */}
        <div className="grid-background absolute inset-0 opacity-5 z-10 pointer-events-none"></div>

        {/* ここにスキャンラインとグリッド背景を追加 */}
        {scanlineEffect && <div className="scanlines fixed inset-0 z-10"></div>}
        <div className="grid-background fixed inset-0 opacity-5 z-0"></div>

        {/* システム情報表示 */}
        <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-green-900 text-xs text-green-500 py-1 px-4 flex justify-between items-center z-20"></div>

        {/* システム情報表示 */}
        <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-green-900 text-xs text-green-500 py-1 px-4 flex justify-between items-center z-20">
          <div>
            個体識別子: HMN-
            {Math.floor(Math.random() * 1000000)
              .toString(16)
              .padStart(6, "0")}
          </div>
          <div className="animate-pulse">{systemMessage}</div>
          <div>
            時間座標: {formattedDate} | {formattedTime}
          </div>
        </div>

        <div className="pt-8">
          <Header_game />

          {/* 警告メッセージ */}
          <div className="mb-6 p-3 border border-red-900 bg-red-900 bg-opacity-20 text-red-500">
            <div className="flex items-center">
              <div className="w-4 h-2 rounded-full bg-red-600"></div>
              <h2 className="text-lg font-bold">警告: あなたの思考パターンは記録されています</h2>
            </div>
          </div>
          <HorseTable />
        </div>
      </main>
    </>
  );
}