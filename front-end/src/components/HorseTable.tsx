'use client';

import { useEffect, useState } from 'react';
import { Horse } from '@/types';

export default function HorseTable() {
  // 基本的な状態
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRaceIndex, setCurrentRaceIndex] = useState(0);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [userBalance, setUserBalance] = useState(20000);
  const [aiBalance, setAiBalance] = useState(18000);
  const [raceFinished, setRaceFinished] = useState(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  
  // タイマー関連
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  
  // AIの賭け状態
  const [aiSelectedHorse, setAiSelectedHorse] = useState<string | null>(null);

  // 馬データを取得
  useEffect(() => {
    async function fetchHorses() {
      try {
        const response = await fetch('/api/races');
        if (!response.ok) throw new Error('APIエラー');
        const data = await response.json();
        setHorses(data);
      } catch (err) {
        setError('データ取得失敗');
      } finally {
        setLoading(false);
      }
    }

    fetchHorses();
  }, []);

  // タイマー機能
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

  // ローディング状態とエラー処理
  if (loading) return <div className="text-center p-4">読み込み中...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (horses.length === 0) return <div className="text-center p-4">データなし</div>;

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
      alert('馬を選択してください');
      return;
    }
    
    // 所持金チェック
    if (betAmount > userBalance) {
      alert('所持金が足りません');
      return;
    }
    
    // 掛金チェック
    if (betAmount === 0) {
      alert('掛金を入力してください');
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
      alert('最後のレースです。これ以上先に進めません。');
    }
  }

  // タイマーの表示形式を整える（プログレスバー風）
  const timerPercentage = (timeLeft / 30) * 100;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-100 rounded-md">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center mb-2 bg-gray-800 text-white p-3 rounded">
        <div className="text-xl font-bold">
          {raceInfo.R}R {raceInfo.レース名}
        </div>
        <div className="text-right">
          <div className="text-sm">
            自分の所持金 <span className="text-lg font-bold">{userBalance.toLocaleString()}円</span>
          </div>
          <div className="text-sm">
            AIの所持金 <span className="text-lg font-bold">{aiBalance.toLocaleString()}円</span>
          </div>
        </div>
      </div>
      
      {/* タイマー表示（プログレスバー） */}
      {!raceFinished && timerActive && (
        <div className="mb-4 p-3 rounded bg-white border border-gray-300">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold">残り時間: {timeLeft}秒</span>
            <span className={`font-bold ${aiSelectedHorse ? 'text-red-600' : 'text-gray-500'}`}>
              AIの状態: {aiSelectedHorse ? `「${horses.find(h => h.horse_id === aiSelectedHorse)?.馬名}」に賭け済み` : 'まだ賭けていません'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${timerPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* レース情報 */}
      <div className="text-sm mb-4 px-2">
        {raceInfo.距離} {raceInfo.天気}-{raceInfo.馬場}
      </div>
      
      {/* レース結果表示 */}
      {raceFinished && winner && (
        <div className="mb-4 bg-yellow-100 p-3 rounded border border-yellow-300">
          <h3 className="font-bold text-lg mb-2">レース結果</h3>
          <p>1着: <span className="font-bold">{winner.馬名}</span> (オッズ: {winner.オッズ})</p>
          
          <div className="flex mt-2">
            {/* プレイヤーの賭けと払い戻し */}
            <div className="w-1/2 pr-2">
              <p className="font-bold">あなたの馬券:</p>
              {selectedHorse ? (
                <ul>
                  <li className={winner.horse_id === selectedHorse ? "text-green-600 font-bold" : ""}>
                    {horses.find(h => h.horse_id === selectedHorse)?.馬名}: {betAmount.toLocaleString()}円
                    {winner.horse_id === selectedHorse && 
                      ` → 払戻: ${(betAmount * winner.オッズ).toLocaleString()}円`}
                  </li>
                </ul>
              ) : (
                <p className="text-gray-500">賭けなし</p>
              )}
            </div>
            
            {/* AIの賭けと払い戻し */}
            <div className="w-1/2 pl-2 border-l border-yellow-300">
              <p className="font-bold">AIの馬券:</p>
              {aiSelectedHorse ? (
                <ul>
                  <li className={winner.horse_id === aiSelectedHorse ? "text-green-600 font-bold" : ""}>
                    {horses.find(h => h.horse_id === aiSelectedHorse)?.馬名}: 1,000円
                    {winner.horse_id === aiSelectedHorse && 
                      ` → 払戻: ${(1000 * winner.オッズ).toLocaleString()}円`}
                  </li>
                </ul>
              ) : (
                <p className="text-gray-500">賭けなし</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 馬一覧テーブル */}
      <table className="w-full mb-4 bg-white rounded-md overflow-hidden border border-gray-200">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-2 text-left">番</th>
            <th className="py-2 px-2 text-left">馬名</th>
            <th className="py-2 px-2 text-left">騎手</th>
            <th className="py-2 px-2 text-center">オッズ</th>
            <th className="py-2 px-2 text-center">人気</th>
            <th className="py-2 px-2 text-center">状態</th>
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
                    ? "border-b border-gray-100 bg-yellow-100" 
                    : isAiBet && !raceFinished
                    ? "border-b border-gray-100 bg-red-50"
                    : isSelected
                    ? "border-b border-gray-100 bg-blue-50"
                    : "border-b border-gray-100"
                }
                onClick={() => !raceFinished && !isAiBet && selectHorse(horse.horse_id)}
                style={{ cursor: (raceFinished || isAiBet) ? 'not-allowed' : 'pointer' }}
              >
                <td className="py-2 px-2">{horse.馬番}</td>
                <td className="py-2 px-2 font-bold">{horse.馬名}</td>
                <td className="py-2 px-2">{horse.騎手}</td>
                <td className="py-2 px-2 text-center font-medium">{horse.オッズ}</td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {horse.人気}
                  </span>
                </td>
                <td className="py-2 px-2 text-center">
                  {!raceFinished && isSelected && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      選択中
                    </span>
                  )}
                  {!raceFinished && isAiBet && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                      AI賭け済み
                    </span>
                  )}
                  {raceFinished && isSelected && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      ユーザー
                    </span>
                  )}
                  {raceFinished && isAiBet && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                      AI
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* 掛金入力と賭けるボタン / 次のレースボタン */}
      {!raceFinished ? (
        <>
          <div className="flex justify-end mb-4 bg-gray-200 p-2 rounded">
            <div className="flex items-center">
              <span className="mr-2">掛金:</span>
              <input
                type="number"
                min="0"
                step="100"
                value={betAmount}
                onChange={handleBetAmountChange}
                disabled={!selectedHorse}
                className="w-24 px-2 py-1 border border-gray-300 text-right rounded mr-2"
              />
              <span className="font-bold">円</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <button 
              onClick={placeBets}
              disabled={!selectedHorse || betAmount === 0}
              className={`px-8 py-2 rounded ${!selectedHorse || betAmount === 0 ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
            >
              賭ける
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center mb-4">
          <button 
            onClick={moveToNextRace}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded"
          >
            {currentRaceIndex < raceIds.length - 1 ? '次のレースへ' : 'レース終了'}
          </button>
        </div>
      )}
    </div>
  );
}