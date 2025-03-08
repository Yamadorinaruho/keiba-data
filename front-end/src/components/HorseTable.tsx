'use client';

import { useEffect, useState } from 'react';
import { Horse } from '@/types';

export default function HorseTable() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRaceIndex, setCurrentRaceIndex] = useState(0); // 現在のレースインデックス(0から始まる)

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
    if (currentRaceIndex < raceIds.length - 1) { // 最後のレースでない場合(currentRaceIndexは0から始まる)
      setCurrentRaceIndex(currentRaceIndex + 1); // 次のレースへ
    }
  };
  
  // 前のレースへ
  const goToPreviousRace = () => {
    if (currentRaceIndex > 0) { // 最初のレースでない場合
      setCurrentRaceIndex(currentRaceIndex - 1); // 前のレースへ
    }
  };

  // 現在のレースIDとそのレースの馬リスト
  const currentRaceId = raceIds[currentRaceIndex]; // 現在のレースID
  const currentRaceHorses = raceGroups[currentRaceId]; // 現在のレースの馬リスト
  const raceInfo = currentRaceHorses[0]; // レース情報は各馬のデータに含まれている

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded">
        <button 
          onClick={goToPreviousRace} 
          disabled={currentRaceIndex === 0} // 最初のレースの場合は無効
          className={`px-4 py-2 rounded ${currentRaceIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          前のレース
        </button>
        
        <div className="text-center">
          <span className="font-bold">レース {currentRaceIndex + 1} / {raceIds.length}</span>
        </div>
        
        <button 
          onClick={goToNextRace} 
          disabled={currentRaceIndex === raceIds.length - 1}
          className={`px-4 py-2 rounded ${currentRaceIndex === raceIds.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          次のレース
        </button>
      </div>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="bg-blue-50 p-4 border-b">
          <h2 className="text-xl font-bold">{raceInfo.レース名}</h2>
          <div className="text-sm text-gray-600 mt-1">
            {raceInfo.日付} {raceInfo.開催} {raceInfo.R}R {raceInfo.距離} {raceInfo.馬場}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">枠番</th>
                <th className="px-4 py-2 text-left">馬番</th>
                <th className="px-4 py-2 text-left">馬名</th>
                <th className="px-4 py-2 text-left">騎手</th>
                <th className="px-4 py-2 text-right">馬体重</th>
                <th className="px-4 py-2 text-right">前走成績</th>
                <th className="px-4 py-2 text-right">前々走成績</th>
                <th className="px-4 py-2 text-right">オッズ</th>
                <th className="px-4 py-2 text-right">人気</th>
              </tr>
            </thead>
            <tbody>
              {currentRaceHorses.map((horse) => (
                <tr key={horse.horse_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{horse.枠番}</td>
                  <td className="px-4 py-2">{horse.馬番}</td>
                  <td className="px-4 py-2 font-medium">{horse.馬名}</td>
                  <td className="px-4 py-2">{horse.騎手}</td>
                  <td className="px-4 py-2 text-right">{horse.馬体重}</td>
                  <td className="px-4 py-2 text-right">{horse.前走着順}</td>
                  <td className="px-4 py-2 text-right">{horse.前々走着順}</td>
                  <td className="px-4 py-2 text-right">{horse.オッズ}</td>
                  <td className="px-4 py-2 text-right">{horse.人気}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}