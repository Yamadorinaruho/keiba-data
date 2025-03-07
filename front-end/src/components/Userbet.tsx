'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import BettingTicket from './BettingTicket';

// 型定義
interface HorseData {
  id: number;
  waku: string;
  umaban: string;
  name: string;
  jockey: string;
  weight: string;
  odds: number;
  popularity: string;
  prevResult: string;
  allResults: string;
}

interface RaceData {
  id: number;
  name: string;
  weather: string;
  distance: string;
  ground: string;
  horses: HorseData[];
}

// 掛け金オプションの型定義
type BetOption = {
  value: number;
  label: string;
};

interface UserBetProps {
  race?: RaceData; // オプショナルにする
  playerMoney: number;
  takenHorses: number[];
  onPlaceBet: (horseId: number, amount: number, betType: string) => void;
  getFrameColor: (frameNumber: string) => string;
}

export default function UserBet({ race, playerMoney, takenHorses, onPlaceBet, getFrameColor }: UserBetProps) {
  const [selectedHorse, setSelectedHorse] = useState<HorseData | null>(null);
  const [betAmount, setBetAmount] = useState<number | 'custom'>(100); // 最小賭け金額
  const [betType, setBetType] = useState<string>('単勝'); // デフォルトの賭け方
  const [showTraditionalUI, setShowTraditionalUI] = useState<boolean>(false);
  
  // raceが未定義の場合のエラー処理
  if (!race) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">レース情報が読み込めません</h2>
        <p>レースデータが見つかりませんでした。再読み込みをお試しください。</p>
      </div>
    );
  }
  
  // 掛け金オプション
  const betOptions: BetOption[] = [
    { value: 0, label: "なし" },
    { value: 100, label: "100円" },
    { value: 500, label: "500円" },
    { value: 1000, label: "1,000円" },
    { value: 5000, label: "5,000円" },
    { value: 10000, label: "10,000円" },
  ];

  // 利用可能な馬（既に賭けられていない馬）
  const availableHorses = race.horses.filter(horse => !takenHorses.includes(horse.id));
  const takenHorsesData = race.horses.filter(horse => takenHorses.includes(horse.id));
  
  // UIタイプを切り替え
  const toggleUI = () => {
    setShowTraditionalUI(!showTraditionalUI);
  };
  
  // 馬券用のデータ整形
  const ticketHorses = availableHorses.map(horse => ({
    id: horse.id,
    name: horse.name,
    number: horse.umaban
  }));

  // 賭け金の変更処理
  const handleAmountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'custom') {
      setBetAmount('custom');
    } else {
      const amount = parseInt(e.target.value);
      if (!isNaN(amount) && amount >= 0 && amount <= playerMoney) {
        setBetAmount(amount);
      }
    }
  };

  // カスタム賭け金入力処理
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(e.target.value);
    if (!isNaN(amount) && amount >= 0 && amount <= playerMoney) {
      setBetAmount(amount); // 数値に変換して設定
    }
  };

  // 賭け実行処理
  const placeBet = () => {
    if (selectedHorse && typeof betAmount === 'number' && betAmount > 0 && betAmount <= playerMoney) {
      onPlaceBet(selectedHorse.id, betAmount, betType);
    } else {
      alert('有効な賭けを選択してください');
    }
  };

  // 予想収益の計算
  const calculatePotentialReturn = () => {
    if (selectedHorse && typeof betAmount === 'number') {
      return betAmount * selectedHorse.odds;
    }
    return 0;
  };

  // 馬を選択する処理
  const selectHorse = (horse: HorseData) => {
    setSelectedHorse(horse);
    // 最初に馬を選んだ時は最低賭け金を設定
    if (!selectedHorse) {
      setBetAmount(100);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">あなたの賭け - {race.name}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleUI}
        >
          {showTraditionalUI ? "馬券スタイルに切替" : "標準表示に切替"}
        </Button>
      </div>
      
      <div className="mb-4 flex justify-between">
        <p>所持金: <span className="font-bold">{playerMoney.toLocaleString()}円</span></p>
        <p>
          <span className="mr-2">天気: {race.weather}</span>
          <span className="mr-2">コース: {race.ground}</span>
          <span>距離: {race.distance}</span>
        </p>
      </div>
      
      {/* 馬券スタイルのUI */}
      {!showTraditionalUI && (
        <BettingTicket 
          horses={ticketHorses}
          playerMoney={playerMoney}
          onPlaceBet={onPlaceBet}
        />
      )}
      
      {/* 従来のUI */}
      {showTraditionalUI && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">出馬表</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-1 py-2 text-center w-10">枠</th>
                    <th className="border border-gray-300 px-1 py-2 text-center w-10">馬番</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">馬名</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">騎手</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">馬体重</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">オッズ</th>
                    <th className="border border-gray-300 px-1 py-2 text-center w-12">人気</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">前走</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {availableHorses.map((horse, index) => (
                    <tr 
                      key={horse.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${selectedHorse?.id === horse.id ? 'bg-blue-100' : ''} cursor-pointer hover:bg-blue-50`}
                      onClick={() => selectHorse(horse)}
                    >
                      <td 
                        className="border border-gray-300 px-1 py-2 text-center font-bold" 
                        style={{ backgroundColor: getFrameColor(horse.waku) }}
                      >
                        {horse.waku}
                      </td>
                      <td className="border border-gray-300 px-1 py-2 text-center">{horse.umaban}</td>
                      <td className="border border-gray-300 px-2 py-2 font-bold">{horse.name}</td>
                      <td className="border border-gray-300 px-2 py-2">{horse.jockey}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{horse.weight}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center font-bold text-red-600">{horse.odds.toFixed(1)}</td>
                      <td className="border border-gray-300 px-1 py-2 text-center">{horse.popularity}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{horse.prevResult}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className={selectedHorse?.id === horse.id ? "bg-blue-500 text-white" : ""}
                        >
                          選択する
                        </Button>
                      </td>
                    </tr>
                  ))}
                  
                  {takenHorsesData.map((horse, index) => (
                    <tr key={horse.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} opacity-50`}>
                      <td 
                        className="border border-gray-300 px-1 py-2 text-center font-bold" 
                        style={{ backgroundColor: getFrameColor(horse.waku) }}
                      >
                        {horse.waku}
                      </td>
                      <td className="border border-gray-300 px-1 py-2 text-center">{horse.umaban}</td>
                      <td className="border border-gray-300 px-2 py-2 font-bold">{horse.name}</td>
                      <td className="border border-gray-300 px-2 py-2">{horse.jockey}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{horse.weight}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{horse.odds.toFixed(1)}</td>
                      <td className="border border-gray-300 px-1 py-2 text-center">{horse.popularity}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{horse.prevResult}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <span className="text-gray-500">AIが選択済</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">賭け方</h3>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="betType" 
                    value="単勝" 
                    checked={betType === '単勝'} 
                    onChange={() => setBetType('単勝')}
                    className="mr-2"
                  />
                  単勝
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="betType" 
                    value="複勝" 
                    checked={betType === '複勝'} 
                    onChange={() => setBetType('複勝')}
                    className="mr-2"
                    disabled
                  />
                  複勝 (準備中)
                </label>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">賭け金</h3>
              <div className="flex flex-col space-y-4">
                <select 
                  value={betAmount === 'custom' ? 'custom' : betAmount} 
                  onChange={handleAmountChange} 
                  className="w-full p-2 border rounded"
                >
                  {betOptions.map((option) => (
                    <option key={option.value.toString()} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  <option value="custom">カスタム金額...</option>
                </select>
                
                {betAmount === 'custom' && (
                  <input
                    type="number"
                    defaultValue={100}
                    onChange={handleCustomAmountChange}
                    min="100"
                    max={playerMoney}
                    step="100"
                    className="w-full p-2 border rounded"
                    placeholder="賭け金を入力 (最低100円)"
                  />
                )}
                
                <div className="flex space-x-2 flex-wrap gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(100)}
                  >
                    100円
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(500)}
                  >
                    500円
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(1000)}
                  >
                    1,000円
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(Math.min(playerMoney, Math.floor(playerMoney * 0.1)))}
                  >
                    10%
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(Math.min(playerMoney, Math.floor(playerMoney * 0.5)))}
                  >
                    50%
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(playerMoney)}
                  >
                    MAX
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">賭け内容確認</h3>
              
              {selectedHorse ? (
                <>
                  <div className="mb-4">
                    <p className="font-medium">選択した馬:</p>
                    <p className="text-xl font-bold">{selectedHorse.name}</p>
                    <p>騎手: {selectedHorse.jockey}</p>
                    <p>オッズ: <span className="font-bold text-red-600">{selectedHorse.odds.toFixed(1)}</span></p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-medium">賭け方: <span className="font-bold">{betType}</span></p>
                    <p className="font-medium">賭け金: <span className="font-bold">{typeof betAmount === 'number' ? betAmount.toLocaleString() : 0}円</span></p>
                    <p className="font-medium mt-2">
                      予想払戻金: <span className="font-bold text-green-600">{calculatePotentialReturn().toLocaleString()}円</span>
                      <span className="text-sm ml-2">(オッズ {selectedHorse.odds.toFixed(1)}倍)</span>
                    </p>
                  </div>
                  
                  <Button 
                    onClick={placeBet}
                    disabled={!selectedHorse || typeof betAmount !== 'number' || betAmount <= 0 || betAmount > playerMoney}
                    className="w-full mt-4"
                    size="lg"
                  >
                    確定
                  </Button>
                </>
              ) : (
                <p className="text-gray-500 italic">馬を選択してください</p>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-4">
            <p>※ 一度賭けを確定すると変更できません。賭け金と選択馬をよく確認してください。</p>
            <p>※ AIが選択した馬には賭けることができません。</p>
          </div>
        </>
      )}
    </div>
  );
}