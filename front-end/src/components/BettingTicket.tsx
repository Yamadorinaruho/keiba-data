'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface BettingTicketProps {
  horses: Array<{id: number, name: string, number: string}>;
  playerMoney: number;
  onPlaceBet: (horseId: number, amount: number, betType: string) => void;
}

export default function BettingTicket({ horses, playerMoney, onPlaceBet }: BettingTicketProps) {
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  // 単位（万円、千円、百円、十円）
  const units = ['万', '千', '百', '十'];
  // 金額オプション（上段）
  const mainAmounts = [30, 20, 10, 5];
  // 金額オプション（下段）
  const subAmounts = [4, 3, 2, 1];
  
  // 賭け金の計算
  const calculateAmount = () => {
    if (!selectedAmount) return 0;
    
    // 単位に基づいて実際の金額を計算
    if (selectedAmount >= 30) return 300000; // 30万円
    if (selectedAmount >= 20) return 200000; // 20万円
    if (selectedAmount >= 10) return 100000; // 10万円
    if (selectedAmount >= 5) return 50000;   // 5万円
    if (selectedAmount >= 4) return 40000;   // 4万円
    if (selectedAmount >= 3) return 30000;   // 3万円
    if (selectedAmount >= 2) return 20000;   // 2万円
    return 10000;  // 1万円
  };
  
  // 賭け実行
  const placeBet = () => {
    if (selectedHorse !== null && selectedAmount !== null) {
      const amount = calculateAmount();
      if (amount <= playerMoney) {
        onPlaceBet(selectedHorse, amount, '単勝');
      } else {
        alert('所持金が足りません');
      }
    } else {
      alert('馬と金額を選択してください');
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">馬券購入</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-bold mb-2">馬を選択</h3>
          <div className="grid grid-cols-2 gap-2">
            {horses.map(horse => (
              <button
                key={horse.id}
                className={`border p-2 rounded ${selectedHorse === horse.id ? 'bg-yellow-200 border-yellow-500' : 'bg-white'}`}
                onClick={() => setSelectedHorse(horse.id)}
              >
                <span className="font-bold">{horse.number}番</span> {horse.name}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">金額を選択</h3>
          <div className="bg-yellow-100 border-4 border-yellow-300 rounded-lg p-4">
            {/* 馬券風デザイン */}
            <div className="flex justify-between items-center mb-2">
              <div className="bg-black text-white text-center px-4 py-1 rounded">金額</div>
              <div className="bg-black text-white text-center px-4 py-1 rounded">単位</div>
              <div className="bg-black text-white text-center px-2 py-1 rounded text-xs">取消</div>
            </div>
            
            <div className="grid grid-cols-9 gap-1">
              {/* 金額上段 */}
              {mainAmounts.map((amount, index) => (
                <div 
                  key={`main-${amount}`}
                  className={`text-center p-1 ${selectedAmount === amount ? 'bg-yellow-500 text-white' : 'bg-white'} 
                             border border-gray-300 rounded cursor-pointer font-bold text-orange-500`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  {amount}
                </div>
              ))}
              
              {/* 単位 */}
              {units.map(unit => (
                <div key={unit} className="text-center p-1 bg-white border border-gray-300 rounded">
                  {unit}
                </div>
              ))}
              
              {/* 取消ボタン */}
              <div className="text-center p-1 bg-white border border-gray-300 rounded">
                0
              </div>
              
              {/* 金額下段 */}
              {subAmounts.map((amount, index) => (
                <div 
                  key={`sub-${amount}`}
                  className={`text-center p-1 ${selectedAmount === amount ? 'bg-yellow-500 text-white' : 'bg-white'} 
                             border border-gray-300 rounded cursor-pointer font-bold text-orange-500`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  {amount}
                </div>
              ))}
              
              {/* 単位 */}
              {units.map(unit => (
                <div key={`sub-${unit}`} className="text-center p-1 bg-white border border-gray-300 rounded">
                  {unit}
                </div>
              ))}
              
              {/* 取消ボタン */}
              <div className="text-center p-1 bg-white border border-gray-300 rounded">
                0
              </div>
            </div>
            
            {/* 選択した金額の表示 */}
            <div className="mt-4 p-2 bg-white border border-gray-400 rounded text-right font-bold">
              {selectedAmount ? `${calculateAmount().toLocaleString()}円` : '0円'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
        <div>
          <p>所持金: <span className="font-bold">{playerMoney.toLocaleString()}円</span></p>
          {selectedHorse !== null && selectedAmount !== null && (
            <p>
              選択: <span className="font-bold">{horses.find(h => h.id === selectedHorse)?.name ?? ''}</span>
              <span className="mx-2">-</span>
              <span className="font-bold">{calculateAmount().toLocaleString()}円</span>
            </p>
          )}
        </div>
        
        <Button
          onClick={placeBet}
          disabled={selectedHorse === null || selectedAmount === null || calculateAmount() > playerMoney}
          className="bg-green-600 hover:bg-green-700"
        >
          購入する
        </Button>
      </div>
      
      {/* バーコード風装飾 */}
      <div className="mt-4 flex justify-end">
        <div className="flex space-x-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1 h-16 bg-black"></div>
          ))}
        </div>
      </div>
    </div>
  );
}