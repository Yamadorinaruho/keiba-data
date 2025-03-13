'use client';

import HorseTable from '@/components/HorseTable';
import Head from 'next/head';
import Header_game from '@/components/layout/Header_game';
import { useEffect, useState } from 'react';

export default function Game() {
  const [scanlineEffect, setScanlineEffect] = useState(true);
  const [glitchActive, setGlitchActive] = useState(false);
  const [systemMessage, setSystemMessage] = useState('システム接続中...');

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
        'システム接続中...',
        'データベース同期完了',
        '監視プロトコル実行中',
        'バイオメトリック認証済み',
        '暗号化通信確立',
        '個体追跡システム作動中',
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
  const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (
    <>
      <Head>
        <title>競走馬予測ターミナル | セクター7</title>
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </Head>

      <main className={`min-h-screen p-4 bg-black text-green-500 font-mono relative ${glitchActive ? 'animate-glitch' : ''}`}>
        {/* スキャンライン効果 */}
        {scanlineEffect && (
          <div className="scanlines fixed inset-0 pointer-events-none z-10"></div>
        )}

        {/* グリッド背景 */}
        <div className="grid-background fixed inset-0 opacity-5 z-0"></div>

        {/* システム情報表示 */}
        <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-green-900 text-xs text-green-500 py-1 px-4 flex justify-between items-center z-20">
          <div>ID: USR-{Math.floor(Math.random() * 1000000).toString(16).padStart(6, '0')}</div>
          <div className="animate-pulse">{systemMessage}</div>
          <div>{formattedDate} | {formattedTime}</div>
        </div>

        <div className="pt-8">
          <Header_game />
          
          {/* 警告メッセージ */}
          <div className="mb-6 p-3 border border-red-900 bg-red-900 bg-opacity-20 text-red-500 rounded">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse mr-2"></div>
              <h2 className="text-lg font-bold">警告: アクセス記録は全て保存されています</h2>
            </div>
            <p className="mt-2 text-sm">
              このターミナルでの取引は全て中央監視システムによって監視されています。
              不適切な行動は罰則の対象となります。政府承認済みの予測モデルのみ使用してください。
            </p>
          </div>
          
          <HorseTable />

          {/* フッター情報 */}
          <div className="mt-6 border-t border-green-900 pt-4 text-xs text-gray-600 flex justify-between">
            <div>© 2084 統合政府管理委員会</div>
            <div>バージョン 2.4.7 | セクター7認可</div>
          </div>
        </div>
      </main>

      {/* カスタムCSS */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Share Tech Mono', monospace;
          background: #000;
          color: #3f9;
          overflow-x: hidden;
        }

        /* スキャンライン効果 */
        .scanlines {
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0.3) 50%
          );
          background-size: 100% 4px;
          z-index: 999;
        }

        /* グリッド背景 */
        .grid-background {
          background-image: 
            linear-gradient(rgba(0, 255, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* グリッチアニメーション */
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        .animate-glitch {
          animation: glitch 0.2s linear infinite;
        }

        /* CRTモニター風の効果 */
        main::after {
          content: " ";
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: rgba(18, 16, 16, 0.1);
          opacity: 0.15;
          z-index: 2;
          pointer-events: none;
        }

        /* CRTオフ効果のアニメーション */
        @keyframes flicker {
          0% {
            opacity: 0.27861;
          }
          5% {
            opacity: 0.34769;
          }
          10% {
            opacity: 0.23604;
          }
          15% {
            opacity: 0.90626;
          }
          20% {
            opacity: 0.18128;
          }
          25% {
            opacity: 0.83891;
          }
          30% {
            opacity: 0.65583;
          }
          35% {
            opacity: 0.67807;
          }
          40% {
            opacity: 0.26559;
          }
          45% {
            opacity: 0.84693;
          }
          50% {
            opacity: 0.96019;
          }
          55% {
            opacity: 0.08594;
          }
          60% {
            opacity: 0.20313;
          }
          65% {
            opacity: 0.71988;
          }
          70% {
            opacity: 0.53455;
          }
          75% {
            opacity: 0.37288;
          }
          80% {
            opacity: 0.71428;
          }
          85% {
            opacity: 0.70419;
          }
          90% {
            opacity: 0.7003;
          }
          95% {
            opacity: 0.36108;
          }
          100% {
            opacity: 0.24387;
          }
        }

        main::before {
          content: " ";
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
          animation: flicker 0.15s infinite;
        }
      `}</style>
    </>
  );
}