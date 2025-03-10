'use client';

import { useEffect, useState } from 'react';
import { Horse } from '@/types';

export default function HorseTable() {
  const [horses, setHorses] = useState<Horse[]>([]); // 馬データ
  const [loading, setLoading] = useState(true); // ローディング中かどうか
  const [error, setError] = useState<string | null>(null); // エラーが発生したかどうか
  const [currentRaceIndex, setCurrentRaceIndex] = useState(0); // 現在のレースインデックス
  const [betAmounts, setBetAmounts] = useState<{[key: string]: number}>({}); // 掛金
  const [userBalance, setUserBalance] = useState(20000); // ユーザーの所持金
  const [aiBalance, setAiBalance] = useState(18000); // AIの所持金
  const [totalBet, setTotalBet] = useState(0); // 合計掛金

  useEffect(() => { // レースデータを取得
    async function fetchHorses() { // APIリクエスト
      try {
        const response = await fetch('/api/races');
        if (!response.ok) throw new Error('APIエラー');
        const data = await response.json();
        setHorses(data);
        
        // 初期の掛金を0に設定
        const initialBets: {[key: string]: number} = {};
        data.forEach((horse: Horse) => {
          initialBets[horse.horse_id] = 0;
        });
        setBetAmounts(initialBets);
      } catch (err) {
        setError('データ取得失敗');
      } finally {
        setLoading(false);
      }
    }

    fetchHorses();
  }, []);

  useEffect(() => {
    // 合計掛金を計算
    const total = Object.values(betAmounts).reduce((sum, amount) => sum + amount, 0);
    setTotalBet(total);
  }, [betAmounts]);

  if (loading) return <div className="text-center p-4">読み込み中...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (horses.length === 0) return <div className="text-center p-4">データなし</div>;

  // レースIDごとにデータをグループ化
  const raceGroups: { [key: string]: Horse[] } = {};
  horses.forEach(horse => {
    if (!raceGroups[horse.race_id]) {
      raceGroups[horse.race_id] = [];
    }
    raceGroups[horse.race_id].push(horse);
  });

  // レースIDの配列
  const raceIds = Object.keys(raceGroups);
  
  // 次のレースへ
  const goToNextRace = () => {
    if (currentRaceIndex < raceIds.length - 1) {
      setCurrentRaceIndex(currentRaceIndex + 1);
    }
  };
  
  // 前のレースへ
  const goToPreviousRace = () => {
    if (currentRaceIndex > 0) {
      setCurrentRaceIndex(currentRaceIndex - 1);
    }
  };

  // 現在のレースIDとそのレースの馬リスト
  const currentRaceId = raceIds[currentRaceIndex];
  const currentRaceHorses = raceGroups[currentRaceId];
  const raceInfo = currentRaceHorses[0];

  // 掛金を変更する関数
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>, horseId: string) => {
    const amount = parseInt(e.target.value) || 0;
    if (amount >= 0) {
      setBetAmounts({
        ...betAmounts,
        [horseId]: amount
      });
    }
  };

  // 馬券を購入する関数
  const placeBets = () => {
    // 所持金のチェック
    if (totalBet > userBalance) {
      alert('所持金が足りません');
      return;
    }
    
    // 掛金が0の場合は購入しない
    if (totalBet === 0) {
      alert('掛金を入力してください');
      return;
    }

    // 馬券購入の処理（実際はAPIリクエストなど）
    const betsInfo = Object.entries(betAmounts)
      .filter(([_, amount]) => amount > 0)
      .map(([horseId, amount]) => {
        const horse = horses.find(h => h.horse_id === horseId);
        return `${horse?.馬名}: ${amount}円`;
      })
      .join('\n');

    // 所持金の更新
    setUserBalance(userBalance - totalBet);
    
    // 掛金をリセット
    const resetBets: {[key: string]: number} = {};
    Object.keys(betAmounts).forEach(key => {
      resetBets[key] = 0;
    });
    setBetAmounts(resetBets);
    
    // 購入確認のアラート
    alert(`馬券を購入しました！\n\n${betsInfo}\n\n合計: ${totalBet}円`);
    
    // アラートが閉じられた後に次のレースへ移動
    // 最後のレースでなければ次のレースに移動
    if (currentRaceIndex < raceIds.length - 1) {
      // 直接ステートを更新（goToNextRaceを使わない）
      setCurrentRaceIndex(currentRaceIndex + 1);
    } else {
      alert('最後のレースです。これ以上先に進めません。');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 rounded-md">
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
      
      <div className="text-sm mb-4 px-2">
        {raceInfo.距離} {raceInfo.天気}-{raceInfo.馬場}
      </div>
      
      <table className="w-full mb-4 bg-white rounded-md overflow-hidden border border-gray-200">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-2 text-left">枠</th>
            <th className="py-2 px-2 text-left">番</th>
            <th className="py-2 px-2 text-left">馬名</th>
            <th className="py-2 px-2 text-left">騎手</th>
            <th className="py-2 px-2 text-center">斤量</th>
            <th className="py-2 px-2 text-center">前走着順</th>
            <th className="py-2 px-2 text-center">オッズ</th>
            <th className="py-2 px-2 text-center">人気</th>
            <th className="py-2 px-2 text-center">掛金</th>
          </tr>
        </thead>
        <tbody>
          {currentRaceHorses.map((horse) => {
            return (
              <tr key={horse.horse_id} className="border-b border-gray-100">
                <td className="py-2 px-2">
                    {horse.枠番}
                </td>
                <td className="py-2 px-2">{horse.馬番}</td>
                <td className="py-2 px-2 font-bold">{horse.馬名}</td>
                <td className="py-2 px-2">{horse.騎手}</td>
                <td className="py-2 px-2 text-center">{horse.斤量}</td>
                <td className="py-2 px-2 text-center">{horse.前走着順}</td>
                <td className="py-2 px-2 text-center font-medium">{horse.オッズ}</td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {horse.人気}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={betAmounts[horse.horse_id] || 0}
                    onChange={(e) => handleBetAmountChange(e, horse.horse_id)}
                    className="w-16 px-1 py-1 border border-gray-300 text-right rounded"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="flex justify-end mb-4 bg-gray-200 p-2 rounded">
        <div className="text-lg">
          合計掛金 <span className="font-bold">{totalBet.toLocaleString()}円</span>
        </div>
      </div>
      
      <div className="flex justify-center mb-4">
        <button 
          onClick={placeBets}
          className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-2 rounded"
        >
          賭ける
        </button>
      </div>
    </div>
  );
}