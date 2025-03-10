'use client';

import { useEffect, useState } from 'react';
import { Horse } from '@/types';

export default function HorseTable() {
  // 基本的な状態
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRaceIndex, setCurrentRaceIndex] = useState(0);
  const [betAmounts, setBetAmounts] = useState<{[key: string]: number}>({});
  const [userBalance, setUserBalance] = useState(20000);
  const [aiBalance, setAiBalance] = useState(18000);
  const [totalBet, setTotalBet] = useState(0);
  const [raceFinished, setRaceFinished] = useState(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [aiBets, setAiBets] = useState<{[key: string]: string}>({}); // AIが各レースでどの馬に賭けるか
  const [aiResults, setAiResults] = useState<{[key: string]: number}>({}); // AIの各レースでの結果（払い戻し）

  // 馬データを取得
  useEffect(() => {
    async function fetchHorses() {
      try {
        const response = await fetch('/api/races');
        if (!response.ok) throw new Error('APIエラー');
        const data = await response.json();
        setHorses(data);
        
        // 初期の掛金を設定
        const initialBets: {[key: string]: number} = {};
        data.forEach((horse: Horse) => {
          initialBets[horse.horse_id] = 0;
        });
        setBetAmounts(initialBets);
        
        // レースIDごとにデータをグループ化してAIの賭けを設定
        const aiRaceBets: {[key: string]: string} = {};
        const tempRaceGroups: { [key: string]: Horse[] } = {};
        
        data.forEach(horse => {
          if (!tempRaceGroups[horse.race_id]) {
            tempRaceGroups[horse.race_id] = [];
          }
          tempRaceGroups[horse.race_id].push(horse);
        });
        
        // 各レースごとにAIが賭ける馬（predが最高の馬）を決定
        Object.keys(tempRaceGroups).forEach(raceId => {
          const raceHorses = tempRaceGroups[raceId];
          // predが最も高い馬を見つける
          let bestHorse = raceHorses[0];
          raceHorses.forEach(horse => {
            if (horse.pred > bestHorse.pred) {
              bestHorse = horse;
            }
          });
          // AIの賭け記録
          aiRaceBets[raceId] = bestHorse.horse_id;
        });
        
        // AIの賭けを設定
        setAiBets(aiRaceBets);
      } catch (err) {
        setError('データ取得失敗');
      } finally {
        setLoading(false);
      }
    }

    fetchHorses();
  }, []);

  // 合計掛金を計算
  useEffect(() => {
    const total = Object.values(betAmounts).reduce((sum, amount) => sum + amount, 0);
    setTotalBet(total);
  }, [betAmounts]);

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

  // 掛金を変更する関数
  function handleBetAmountChange(e: React.ChangeEvent<HTMLInputElement>, horseId: string) {
    const amount = parseInt(e.target.value) || 0;
    if (amount >= 0) {
      setBetAmounts({
        ...betAmounts,
        [horseId]: amount
      });
    }
  }

  // 馬券を購入する関数
  function placeBets() {
    // 所持金チェック
    if (totalBet > userBalance) {
      alert('所持金が足りません');
      return;
    }
    
    // 掛金チェック
    if (totalBet === 0) {
      alert('掛金を入力してください');
      return;
    }

    // 所持金を減らす
    setUserBalance(userBalance - totalBet);
    
    // 購入確認アラート
    const betsInfo = Object.entries(betAmounts)
      .filter(([_, amount]) => amount > 0)
      .map(([horseId, amount]) => {
        const horse = horses.find(h => h.horse_id === horseId);
        return `${horse?.馬名}: ${amount}円`;
      })
      .join('\n');
    
    alert(`馬券を購入しました！\n\n${betsInfo}\n\n合計: ${totalBet}円`);
    
    // 勝ち馬を決定（着順=1の馬）
    const winningHorse = currentRaceHorses.find(horse => horse.着順 === 1) || currentRaceHorses[0];
    setWinner(winningHorse);
    
    // プレイヤーの払い戻し計算
    const winningHorseId = winningHorse.horse_id;
    const betAmount = betAmounts[winningHorseId] || 0;
    const payout = betAmount * winningHorse.オッズ;
    
    // AIの払い戻し計算
    const AI_BET_AMOUNT = 1000; // AIの賭け金額
    const aiHorseId = aiBets[currentRaceId]; // AIが賭けた馬のID
    const aiWin = aiHorseId === winningHorseId; // AIが勝ったかどうか
    const aiPayout = aiWin ? AI_BET_AMOUNT * winningHorse.オッズ : 0; // AIの払い戻し
    
    // AIの結果を保存
    setAiResults({
      ...aiResults,
      [currentRaceId]: aiPayout
    });
    
    // AIの所持金更新
    setAiBalance(prevBalance => prevBalance - AI_BET_AMOUNT + aiPayout);
    
    // プレイヤーの払い戻しがある場合は所持金に追加
    if (payout > 0) {
      setUserBalance(userBalance - totalBet + payout);
      setTimeout(() => {
        alert(`おめでとうございます！\n\n1着: ${winningHorse.馬名}\n\n払い戻し: ${payout}円`);
      }, 300);
    } else {
      setTimeout(() => {
        alert(`残念！\n\n1着: ${winningHorse.馬名}\n\n的中なし`);
      }, 300);
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
      
      // 掛金をリセット
      const resetBets: {[key: string]: number} = {};
      Object.keys(betAmounts).forEach(key => {
        resetBets[key] = 0;
      });
      setBetAmounts(resetBets);
    } else {
      alert('最後のレースです。これ以上先に進めません。');
    }
  }

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
              {Object.entries(betAmounts).some(([_, amount]) => amount > 0) ? (
                <ul>
                  {Object.entries(betAmounts)
                    .filter(([_, amount]) => amount > 0)
                    .map(([horseId, amount]) => {
                      const horse = horses.find(h => h.horse_id === horseId);
                      const isWinner = winner.horse_id === horseId;
                      return (
                        <li key={horseId} className={isWinner ? "text-green-600 font-bold" : ""}>
                          {horse?.馬名}: {amount.toLocaleString()}円
                          {isWinner && ` → 払戻: ${(amount * (horse?.オッズ || 0)).toLocaleString()}円`}
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="text-gray-500">賭けなし</p>
              )}
            </div>
            
            {/* AIの賭けと払い戻し */}
            <div className="w-1/2 pl-2 border-l border-yellow-300">
              <p className="font-bold">AIの馬券:</p>
              {aiBets[currentRaceId] && (
                <ul>
                  <li className={winner.horse_id === aiBets[currentRaceId] ? "text-green-600 font-bold" : ""}>
                    {horses.find(h => h.horse_id === aiBets[currentRaceId])?.馬名}: 1,000円
                    {winner.horse_id === aiBets[currentRaceId] && 
                      ` → 払戻: ${(1000 * winner.オッズ).toLocaleString()}円`}
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 馬一覧テーブル */}
      <table className="w-full mb-4 bg-white rounded-md overflow-hidden border border-gray-200">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-2 text-left">枠</th>
            <th className="py-2 px-2 text-left">番</th>
            <th className="py-2 px-2 text-left">馬名</th>
            <th className="py-2 px-2 text-left">騎手</th>
            <th className="py-2 px-2 text-center">斤量</th>
            <th className="py-2 px-2 text-center">前走着順</th>
            <th className="py-2 px-2 text-center">前々走着順</th>
            <th className="py-2 px-2 text-center">オッズ</th>
            <th className="py-2 px-2 text-center">人気</th>
            <th className="py-2 px-2 text-center">掛金</th>
            <th className="py-2 px-2 text-center">AI予想</th>
            <th className="py-2 px-2 text-center">AI賭け</th>
          </tr>
        </thead>
        <tbody>
          {currentRaceHorses.map((horse) => {
            const isAiBet = aiBets[currentRaceId] === horse.horse_id;
            
            return (
              <tr 
                key={horse.horse_id} 
                className={
                  raceFinished && winner?.horse_id === horse.horse_id 
                    ? "border-b border-gray-100 bg-yellow-100" 
                    : "border-b border-gray-100"
                }
              >
                <td className="py-2 px-2">{horse.枠番}</td>
                <td className="py-2 px-2">{horse.馬番}</td>
                <td className="py-2 px-2 font-bold">{horse.馬名}</td>
                <td className="py-2 px-2">{horse.騎手}</td>
                <td className="py-2 px-2 text-center">{horse.斤量}</td>
                <td className="py-2 px-2 text-center">{horse.前走着順}</td>
                <td className="py-2 px-2 text-center">{horse.前々走着順}</td>
                <td className="py-2 px-2 text-center font-medium">{horse.オッズ}</td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {horse.人気}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  {raceFinished ? (
                    betAmounts[horse.horse_id] ? 
                    betAmounts[horse.horse_id].toLocaleString() + '円' : 
                    '0円'
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={betAmounts[horse.horse_id] || 0}
                      onChange={(e) => handleBetAmountChange(e, horse.horse_id)}
                      className="w-16 px-1 py-1 border border-gray-300 text-right rounded"
                    />
                  )}
                </td>
                <td className="py-2 px-2 text-center">{horse.pred}</td>
                <td className="py-2 px-2 text-center">
                  {isAiBet ? (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      1,000円
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* 掛金合計と賭けるボタン / 次のレースボタン */}
      {!raceFinished ? (
        <>
          <div className="flex justify-end mb-4 bg-gray-200 p-2 rounded">
            <div className="text-lg">
              合計掛金 <span className="font-bold">{totalBet.toLocaleString()}円</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <button 
              onClick={placeBets}
              disabled={totalBet === 0}
              className={`px-8 py-2 rounded ${totalBet === 0 ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
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