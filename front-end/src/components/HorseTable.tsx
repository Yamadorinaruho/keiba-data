'use client';

import { useEffect, useState } from 'react';
import { Horse } from '@/types';

export default function HorseTable() {
  // ========== 状態管理 ==========
  // 基本データの状態
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRaceIndex, setCurrentRaceIndex] = useState(0);
  
  // ユーザー操作の状態
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [userBalance, setUserBalance] = useState(10000);
  const [aiBalance, setAiBalance] = useState(10000);
  
  // レース状態
  const [raceFinished, setRaceFinished] = useState(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [aiSelectedHorse, setAiSelectedHorse] = useState<string | null>(null);
  
  // タイマー関連
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  
  // ========== データ取得 ==========
  useEffect(() => {
    async function fetchHorses() {
      try {
        const response = await fetch('/api/races');
        if (!response.ok) throw new Error('APIエラー');
        const data = await response.json();
        setHorses(data);
      } catch (err) {
        setError('システム障害：データ取得失敗');
      } finally {
        setLoading(false);
      }
    }

    fetchHorses();
  }, []);

  // ========== タイマー機能 ==========
  useEffect(() => {
    if (loading || raceFinished || !timerActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // AIが20秒経過時点で自動的に賭ける
        if (prev === 10 && !aiSelectedHorse) {
          handleAiBet();
        }
        
        if (prev <= 1) {
          clearInterval(timer);
          
          // 時間切れでレース開始
          if (!raceFinished) {
            if (!aiSelectedHorse) {
              handleAiBet();
            }
            runRace();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, raceFinished, timerActive, aiSelectedHorse]);

  // ========== エラー・ローディング表示 ==========
  if (loading) return <div className="text-center p-4 text-red-500 font-glitch">システム起動中...</div>;
  if (error) return <div className="text-center p-4 text-red-500 font-glitch">{error}</div>;
  if (horses.length === 0) return <div className="text-center p-4 text-red-500 font-glitch">データ消失</div>;

  // ========== データ整形 ==========
  // レースをグループ化して現在のレースを取得
  const raceGroups: { [key: string]: Horse[] } = {};
  horses.forEach(horse => {
    if (!raceGroups[horse.race_id]) {
      raceGroups[horse.race_id] = [];
    }
    raceGroups[horse.race_id].push(horse);
  });

  const raceIds = Object.keys(raceGroups);
  const currentRaceId = raceIds[currentRaceIndex];
  const currentRaceHorses = raceGroups[currentRaceId];
  const raceInfo = currentRaceHorses[0];

  // タイマーの表示形式を整える（プログレスバー風）
  const timerPercentage = (timeLeft / 45) * 100;

  // ========== イベントハンドラ ==========
  
  // AIが賭ける処理
  function handleAiBet() {
    if (raceFinished || aiSelectedHorse) return;

    // AIが賭ける馬を選ぶ（ユーザーが選んだ馬以外で予想値が最高の馬）
    const availableHorses = currentRaceHorses.filter(horse => 
      horse.horse_id !== selectedHorse
    );
    
    // 予想値(pred)が最も高い馬を見つける
    let bestHorse = availableHorses[0];
    availableHorses.forEach(horse => {
      if (horse.pred > bestHorse.pred) {
        bestHorse = horse;
      }
    });
    
    setAiSelectedHorse(bestHorse.horse_id);
  }

  // 馬を選択する関数
  function selectHorse(horseId: string) {
    if (raceFinished || !timerActive) return;
    
    // 既に選択されている馬をクリックした場合は選択解除
    if (selectedHorse === horseId) {
      setSelectedHorse(null);
      setBetAmount(0);
    } else {
      setSelectedHorse(horseId);
    }
  }

  // 掛金を変更する関数
  function handleBetAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const amount = parseInt(e.target.value) || 0;
    if (amount >= 0) {
      setBetAmount(amount);
    }
  }

  // ユーザーが馬券を購入する関数
  function placeBets() {
    // 馬が選択されているか確認
    if (!selectedHorse) {
      alert('選択エラー：対象個体を選んでください');
      return;
    }
    
    // 所持金チェック
    if (betAmount > userBalance) {
      alert('クレジット不足：取引拒否');
      return;
    }
    
    // 掛金チェック
    if (betAmount === 0) {
      alert('クレジット未入力：金額を指定してください');
      return;
    }

    // 所持金を減らす
    setUserBalance(userBalance - betAmount);
    
    // AIが賭ける処理
    handleAiBet();
    
    // すぐにレース結果を表示
    runRace();
  }
  
  // レース実行処理
  function runRace() {
    // タイマーを停止
    setTimerActive(false);
    
    // 勝ち馬を決定（着順=1の馬）
    const winningHorse = currentRaceHorses.find(horse => horse.着順 === 1) || currentRaceHorses[0];
    setWinner(winningHorse);
    
    // プレイヤーの払い戻し計算
    const winningHorseId = winningHorse.horse_id;
    const playerWin = selectedHorse === winningHorseId;
    const payout = playerWin ? betAmount * winningHorse.オッズ : 0;
    
    // AIの払い戻し計算
    const AI_BET_AMOUNT = 1000; // AIの賭け金額
    const aiWin = aiSelectedHorse === winningHorseId; // AIが勝ったかどうか
    const aiPayout = aiWin ? AI_BET_AMOUNT * winningHorse.オッズ : 0; // AIの払い戻し
    
    // AIの所持金更新
    if (aiSelectedHorse) {
      setAiBalance(prevBalance => prevBalance - AI_BET_AMOUNT + aiPayout);
    }
    
    // プレイヤーの払い戻しがある場合は所持金に追加
    if (selectedHorse && payout > 0) {
      setUserBalance(prevBalance => prevBalance + payout); // 掛金は既に引かれているので、払い戻しだけ追加
    }
    
    // レース終了状態にする
    setRaceFinished(true);
  }

  // 次のレースへ進む
  function moveToNextRace() {
    if (currentRaceIndex < raceIds.length - 1) {
      setCurrentRaceIndex(currentRaceIndex + 1);
      setRaceFinished(false);
      setWinner(null);
      setSelectedHorse(null);
      setBetAmount(0);
      setTimeLeft(30);
      setTimerActive(true);
      setAiSelectedHorse(null);
    } else {
      alert('最終イベント到達：これ以上先に進むことはできません');
    }
  }

  // ========== レンダリング ==========
  return (
    <div className="max-w-6xl mx-auto p-4 bg-black text-green-400 rounded-md border border-red-900 shadow-red-900 shadow-lg" style={{ fontFamily: 'monospace' }}>
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center mb-2 bg-gray-900 border-t border-b border-red-700 p-3">
        <div className="text-xl font-bold text-red-500">
          <span className="animate-pulse">[RACE-{raceInfo.R}]</span> {raceInfo.レース名}
        </div>
        <div className="text-right">
          <div className="text-sm">
            市民クレジット <span className="text-lg font-bold">{userBalance.toLocaleString()}¥</span>
          </div>
          <div className="text-sm">
            <span className="text-red-500">AI</span>クレジット <span className="text-lg font-bold text-red-400">{aiBalance.toLocaleString()}¥</span>
          </div>
        </div>
      </div>
      
      {/* タイマー表示（プログレスバー） */}
      {!raceFinished && timerActive && (
        <div className="mb-4 p-3 rounded bg-gray-900 border border-green-900">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold">タイムリミット: {timeLeft}秒</span>
            <span className={`font-bold ${aiSelectedHorse ? 'text-red-600' : 'text-gray-500'}`}>
              AI状態: {aiSelectedHorse ? `「${horses.find(h => h.horse_id === aiSelectedHorse)?.馬名}」ロック済` : '分析中...'}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 border border-green-800">
            <div 
              className={`h-4 rounded-full ${timeLeft <= 10 ? 'bg-red-700' : 'bg-green-700'} transition-all duration-200`} 
              style={{ width: `${timerPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* レース情報 */}
      <div className="text-sm mb-4 px-2 text-gray-500">
        <span className="border-b border-green-900">[環境データ]</span> {raceInfo.距離} {raceInfo.天気}-{raceInfo.馬場}
      </div>
      
      {/* レース結果表示 */}
      {raceFinished && winner && (
        <div className="mb-4 bg-gray-900 p-3 rounded border border-red-700">
          <h3 className="font-bold text-lg mb-2 text-red-500 border-b border-red-700 pb-1">結果解析</h3>
          <p>勝者: <span className="font-bold text-red-400">{winner.馬名}</span> (確率係数: {winner.オッズ})</p>
          
          <div className="flex mt-2">
            {/* プレイヤーの賭けと払い戻し */}
            <div className="w-1/2 pr-2">
              <p className="font-bold border-b border-green-900 pb-1">あなたの投資:</p>
              {selectedHorse ? (
                <ul>
                  <li className={winner.horse_id === selectedHorse ? "text-green-500 font-bold" : "text-gray-500"}>
                    {horses.find(h => h.horse_id === selectedHorse)?.馬名}: {betAmount.toLocaleString()}¥
                    {winner.horse_id === selectedHorse && 
                      ` → 利益: ${(betAmount * winner.オッズ).toLocaleString()}¥`}
                  </li>
                </ul>
              ) : (
                <p className="text-gray-600">投資なし</p>
              )}
            </div>
            
            {/* AIの賭けと払い戻し */}
            <div className="w-1/2 pl-2 border-l border-red-900">
              <p className="font-bold text-red-500 border-b border-red-900 pb-1">AI投資:</p>
              {aiSelectedHorse ? (
                <ul>
                  <li className={winner.horse_id === aiSelectedHorse ? "text-red-500 font-bold" : "text-gray-500"}>
                    {horses.find(h => h.horse_id === aiSelectedHorse)?.馬名}: 1,000¥
                    {winner.horse_id === aiSelectedHorse && 
                      ` → 利益: ${(1000 * winner.オッズ).toLocaleString()}¥`}
                  </li>
                </ul>
              ) : (
                <p className="text-gray-600">投資なし</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 馬一覧テーブル */}
      <table className="w-full mb-4 bg-gray-900 rounded-md overflow-hidden border border-green-900">
        <thead>
          <tr className="bg-gray-800 text-green-500">
            <th className="py-2 px-2 text-left border-b border-green-900">ID</th>
            <th className="py-2 px-2 text-left border-b border-green-900">個体名</th>
            <th className="py-2 px-2 text-left border-b border-green-900">操縦者</th>
            <th className="py-2 px-2 text-center border-b border-green-900">確率</th>
            <th className="py-2 px-2 text-center border-b border-green-900">ランク</th>
            <th className="py-2 px-2 text-center border-b border-green-900">状態</th>
          </tr>
        </thead>
        <tbody>
          {currentRaceHorses.map((horse) => {
            const isAiBet = aiSelectedHorse === horse.horse_id;
            const isSelected = selectedHorse === horse.horse_id;
            
            return (
              <tr 
                key={horse.horse_id} 
                className={
                  raceFinished && winner?.horse_id === horse.horse_id 
                    ? "border-b border-gray-800 bg-green-900 bg-opacity-20" 
                    : isAiBet && !raceFinished
                    ? "border-b border-gray-800 bg-red-900 bg-opacity-20"
                    : isSelected
                    ? "border-b border-gray-800 bg-green-900 bg-opacity-10"
                    : "border-b border-gray-800 hover:bg-gray-800"
                }
                onClick={() => !raceFinished && !isAiBet && selectHorse(horse.horse_id)}
                style={{ cursor: (raceFinished || isAiBet) ? 'not-allowed' : 'pointer' }}
              >
                <td className="py-2 px-2 text-gray-400">{horse.馬番}</td>
                <td className="py-2 px-2 font-bold">
                  {isSelected && '>'} {horse.馬名} {isSelected && '<'}
                </td>
                <td className="py-2 px-2 text-gray-400">{horse.騎手}</td>
                <td className="py-2 px-2 text-center font-medium text-yellow-500">{horse.オッズ}</td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center text-sm font-bold">
                    {horse.人気}
                  </span>
                </td>
                <td className="py-2 px-2 text-center">
                  {!raceFinished && isSelected && (
                    <span className="inline-block px-2 py-1 bg-green-900 text-green-400 text-xs font-medium rounded-sm border border-green-700">
                      選択中
                    </span>
                  )}
                  {!raceFinished && isAiBet && (
                    <span className="inline-block px-2 py-1 bg-red-900 text-red-400 text-xs font-medium rounded-sm border border-red-700 animate-pulse">
                      AI選択
                    </span>
                  )}
                  {raceFinished && isSelected && (
                    <span className="inline-block px-2 py-1 bg-green-900 text-green-400 text-xs font-medium rounded-sm border border-green-700">
                      あなた
                    </span>
                  )}
                  {raceFinished && isAiBet && (
                    <span className="inline-block px-2 py-1 bg-red-900 text-red-400 text-xs font-medium rounded-sm border border-red-700">
                      AI
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* 操作ボタン類 */}
      {!raceFinished ? (
        <>
          {/* 掛金入力エリア */}
          <div className="flex justify-end mb-4 bg-gray-900 p-2 rounded border border-green-900">
            <div className="flex items-center">
              <span className="mr-2">投資額:</span>
              <input
                type="number"
                min="0"
                step="100"
                value={betAmount}
                onChange={handleBetAmountChange}
                disabled={!selectedHorse}
                className="w-24 px-2 py-1 bg-gray-800 border border-green-700 text-green-400 text-right rounded mr-2 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
              <span className="font-bold text-green-500">¥</span>
            </div>
          </div>
          
          {/* 賭けるボタン */}
          <div className="flex justify-center mb-4">
            <button 
              onClick={placeBets}
              disabled={!selectedHorse || betAmount === 0}
              className={`px-8 py-2 rounded ${
                !selectedHorse || betAmount === 0 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-green-900 hover:bg-green-800 text-green-400 border border-green-700'
              } transition-all duration-200`}
            >
              ロックイン
            </button>
          </div>
        </>
      ) : (
        // 次のレースへボタン
        <div className="flex justify-center mb-4">
          <button 
            onClick={moveToNextRace}
            className="bg-red-900 hover:bg-red-800 text-red-400 border border-red-700 px-8 py-2 rounded transition-all duration-200"
          >
            {currentRaceIndex < raceIds.length - 1 ? '次のイベントへ進む' : 'シミュレーション終了'}
          </button>
        </div>
      )}
      
      {/* フッター部分 - 背景ノイズなど */}
      <div className="text-xs text-gray-600 mt-4 border-t border-gray-800 pt-2 flex justify-between">
        <div>SYS.ID: {Math.floor(Math.random() * 1000000).toString(16).padStart(6, '0')}</div>
        <div className="animate-pulse">{'>'} コネクション安定 {'<'}</div>
      </div>
    </div>
  );
}