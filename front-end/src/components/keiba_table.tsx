'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// 馬のデータの型定義
interface HorseData {
  waku: string;        // 枠
  umaban: string;      // 馬番
  bamei: string;       // 馬名
  jockey: string;      // 騎手
  weight: string;      // 馬体重
  odds: string;        // オッズ
  popularity: string;  // 人気
  prevResult: string;  // 前走成績
  allResults: string;  // 前々走戦績
  betAmount: string;   // 掛け金
}

// 掛け金オプションの型定義
type BetOption = {
  value: string;
  label: string;
};

const KeibaTable: React.FC = () => {
  const [horseData, setHorseData] = useState<HorseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 掛け金オプション
  const betOptions: BetOption[] = [
    { value: "0", label: "なし" },
    { value: "100", label: "100円" },
    { value: "500", label: "500円" },
    { value: "1000", label: "1,000円" },
    { value: "5000", label: "5,000円" },
    { value: "10000", label: "10,000円" },
  ];

  // 掛け金の変更ハンドラー
  const handleBetChange = (index: number, value: string) => {
    const updatedData = [...horseData];
    updatedData[index].betAmount = value;
    setHorseData(updatedData);
  };

  // CSVファイルからデータを読み込む
  useEffect(() => {
    const fetchData = async () => {
      try {
        // CSVファイルのパスを指定（public/dataフォルダ内にあると仮定）
        const response = await fetch('/data/next_df.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // 結果を馬データの配列に変換
            const parsedData = results.data.map((row: any) => ({
              waku: row.waku || '',
              umaban: row.umaban || '',
              bamei: row.bamei || '',
              jockey: row.jockey || '',
              weight: row.weight || '',
              odds: row.odds || '',
              popularity: row.popularity || '',
              prevResult: row.prevResult || '',
              allResults: row.allResults || '',
              betAmount: '0'  // 初期値は「なし」
            }));
            
            setHorseData(parsedData);
            setIsLoading(false);
          },
          error: (error: { message: any; }) => {
            setError(`CSVパース中にエラーが発生しました: ${error.message}`);
            setIsLoading(false);
          }
        });
      } catch (error) {
        setError('データの読み込み中にエラーが発生しました');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 枠番に応じた背景色を返す関数
  const getFrameColor = (frameNumber: string): string => {
    const frameNum = parseInt(frameNumber, 10);
    const colors = [
      '#ffffff', // 0（エラー用）
      '#ff9999', // 1: 赤
      '#ffffff', // 2: 白
      '#ff9900', // 3: オレンジ
      '#0066ff', // 4: 青
      '#ffff00', // 5: 黄
      '#009900', // 6: 緑
      '#ff33cc', // 7: ピンク
      '#993300'  // 8: 茶
    ];
    
    return frameNum >= 1 && frameNum <= 8 ? colors[frameNum] : '#cccccc';
  };

  if (isLoading) return <div className="text-center my-8">データを読み込み中...</div>;
  if (error) return <div className="text-red-500 text-center my-8">エラー: {error}</div>;

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h2 className="text-2xl font-bold mb-4">出馬表</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-1 py-2 text-center w-10">枠</th>
              <th className="border border-gray-800 px-1 py-2 text-center w-10">馬番</th>
              <th className="border border-gray-800 px-2 py-2 text-left">馬名</th>
              <th className="border border-gray-800 px-2 py-2 text-left">騎手</th>
              <th className="border border-gray-800 px-2 py-2 text-center">馬体重</th>
              <th className="border border-gray-800 px-2 py-2 text-center">オッズ</th>
              <th className="border border-gray-800 px-1 py-2 text-center w-12">人気</th>
              <th className="border border-gray-800 px-2 py-2 text-center">前走成績</th>
              <th className="border border-gray-800 px-2 py-2 text-center">前々走戦績</th>
              <th className="border border-gray-800 px-2 py-2 text-center">掛け金</th>
            </tr>
          </thead>
          <tbody>
            {horseData.map((horse, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td 
                  className="border border-gray-800 px-1 py-2 text-center font-bold" 
                  style={{ backgroundColor: getFrameColor(horse.waku) }}
                >
                  {horse.waku}
                </td>
                <td className="border border-gray-800 px-1 py-2 text-center">{horse.umaban}</td>
                <td className="border border-gray-800 px-2 py-2 font-bold">{horse.bamei}</td>
                <td className="border border-gray-800 px-2 py-2">{horse.jockey}</td>
                <td className="border border-gray-800 px-2 py-2 text-center">{horse.weight}</td>
                <td className="border border-gray-800 px-2 py-2 text-center">{horse.odds}</td>
                <td className="border border-gray-800 px-1 py-2 text-center">{horse.popularity}</td>
                <td className="border border-gray-800 px-2 py-2 text-center">{horse.prevResult}</td>
                <td className="border border-gray-800 px-2 py-2 text-center">{horse.allResults}</td>
                <td className="border border-gray-800 px-2 py-2 text-center">
                  <select
                    className="w-full py-1 px-2 border rounded"
                    value={horse.betAmount}
                    onChange={(e) => handleBetChange(index, e.target.value)}
                  >
                    {betOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 合計掛け金表示 */}
      <div className="mt-4 text-right">
        <p className="font-bold">
          合計掛け金: 
          {new Intl.NumberFormat('ja-JP').format(
            horseData.reduce((sum, horse) => sum + parseInt(horse.betAmount || '0', 10), 0)
          )}円
        </p>
      </div>
    </div>
  );
};

export default KeibaTable;