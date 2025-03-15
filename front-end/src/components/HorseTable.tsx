"use client";

import React, { use, useEffect, useState } from "react";
import Result from "./Result";
import { Howl } from "howler";
// APIから取得する馬の型定義
export interface Horse {
  race_id: string;
  horse_id: string;
  SF馬名: string;
  pred: number;
  オッズ: string;
  馬番: string;
  SF騎手: string;
  人気: string;
  前走着順: string;
  前々走着順: string;
  着順: string;
}

// 最終勝者の型定義
type FinalWinner = "human" | "AI" | "draw";

const HorseRaceGame: React.FC = () => {
  // 状態管理
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRaceIndex, setCurrentRaceIndex] = useState<number>(0);

  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [userBalance, setUserBalance] = useState<number>(10000);
  const [aiBalance, setAiBalance] = useState<number>(10000);

  const [raceFinished, setRaceFinished] = useState<boolean>(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [aiSelectedHorse, setAiSelectedHorse] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  const [message, setMessage] = useState<string>("シンギュラリティを超えた世界での試練を開始");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [finalWinner, setFinalWinner] = useState<FinalWinner | null>(null);
  const [bgm, setBgm] = useState<Howl | null>(null);

  // ヘッダー用のランダムID（クライアントでのみ生成）
  const [randomId, setRandomId] = useState<string>("");
  useEffect(() => {
    setRandomId(
      Math.floor(Math.random() * 1000000)
        .toString(16)
        .padStart(6, "0")
    );
  }, []);

  const AI_BET_AMOUNT = 1000; // AIの賭け金

  // APIから馬データ取得
  useEffect(() => {
    async function fetchHorses() {
      try {
        const response = await fetch("/api/races");
        if (!response.ok) throw new Error("APIエラー");
        const data = await response.json();
        setHorses(data);
      } catch (err: any) {
        console.error(err);
        setError("量子データ障害：予測アルゴリズム崩壊");
      } finally {
        setLoading(false);
      }
    }
    fetchHorses();
  }, []);

  // タイマー処理
  useEffect(() => {
    if (loading || raceFinished || !timerActive) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 10 && !aiSelectedHorse) {
          try {
            handleAiBet();
          } catch (err) {
            console.error("AI演算エラー:", err);
          }
        }
        if (prev <= 1) {
          clearInterval(timer);
          if (!raceFinished) {
            if (!aiSelectedHorse) {
              try {
                handleAiBet();
              } catch (err) {
                console.error("AI演算エラー:", err);
              }
            }
            try {
              runRace();
            } catch (err) {
              console.error("量子レース崩壊:", err);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, raceFinished, timerActive, aiSelectedHorse]);

  useEffect(() => {
    const bgm = new Howl({
        src: "/maou_bgm_cyber01.mp3",
        volume: 0.1,
        loop: true,
    });
    bgm.play();
    setBgm(bgm);
    return () => bgm.stop();
  }, []);

  useEffect(() => {
    if (finalWinner) {
      bgm.stop();
    }
  }, [finalWinner]);

  if (loading) return <div className="text-center p-4 text-green-300">知性起動中...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (horses.length === 0) return <div className="text-center p-4 text-red-500">存在データ消失：虚無へ</div>;

  // レースごとにグループ化
  const raceGroups: Record<string, Horse[]> = {};
  horses.forEach(horse => {
    if (!raceGroups[horse.race_id]) {
      raceGroups[horse.race_id] = [];
    }
    raceGroups[horse.race_id].push(horse);
  });
  const raceIds = Object.keys(raceGroups);
  const currentRaceHorses: Horse[] = raceGroups[raceIds[currentRaceIndex]] || [];
  const raceInfo: Horse | {} = currentRaceHorses[0] || {};
  const timerPercentage = (timeLeft / 30) * 100;

  // AIの馬選択を計算するヘルパー
  function computeAiBet(): string {
    if (currentRaceHorses.length === 0) throw new Error("量子確率場の崩壊");
    let availableHorses = currentRaceHorses.filter(horse => horse.horse_id !== selectedHorse);
    if (availableHorses.length === 0) {
      availableHorses = [...currentRaceHorses];
    }
    let bestHorse = availableHorses[0];
    availableHorses.forEach(horse => {
      if (horse.pred > bestHorse.pred) {
        bestHorse = horse;
      }
    });
    return bestHorse.horse_id;
  }

  // AIの馬選択処理（通常は state 更新で行う）
  function handleAiBet(): void {
    if (raceFinished || aiSelectedHorse) return;
    const chosenAiHorse = computeAiBet();
    console.log("AIが計算した最適解:", chosenAiHorse);
    setAiSelectedHorse(chosenAiHorse);
    const chosenHorseObj = currentRaceHorses.find(horse => horse.horse_id === chosenAiHorse);
    if (chosenHorseObj) {
      setMessage(prev => prev + ` / AI: 「${chosenHorseObj.馬名}」が最適解と演算完了`);
    }
  }

  // ユーザーの馬選択処理
  function selectHorse(horseId: string): void {
    if (raceFinished || !timerActive) return;
    if (selectedHorse === horseId) {
      setSelectedHorse(null);
      setBetAmount(100);
      setMessage("選択解除：運命の糸を手放す");
    } else {
      setSelectedHorse(horseId);
      const horse = horses.find(h => h.horse_id === horseId);
      if (horse) {
        setMessage(`あなたは「${horse.馬名}」に運命を託す：計算を超えた直感`);
      }
    }
  }

  // 掛金変更処理
  function handleBetAmountChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const amount = parseInt(e.target.value) || 0;
    if (amount >= 0) setBetAmount(amount);
  }

  // ユーザーとAIの賭け実行（手動実行時はタイマー停止し、AIの賭けも即時計算）
  function placeBet(): void {
    if (!selectedHorse) {
      setMessage("警告: 量子座標を選択してください");
      return;
    }
    if (betAmount > userBalance) {
      setMessage("警告: 人類の資源枯渇");
      return;
    }
    if (AI_BET_AMOUNT > aiBalance) {
      setMessage("警告: AI演算リソース不足");
      return;
    }
    if (betAmount === 0) {
      setMessage("警告: 運命の賭注が無効");
      return;
    }
    console.log("運命の糸が交差する：賭けの成立");
    // 手動実行時はタイマー処理を停止
    setTimerActive(false);
    // ユーザー・AIの残高から賭け金を即時差し引く
    setUserBalance(prev => prev - betAmount);
    setAiBalance(prev => prev - AI_BET_AMOUNT);
    // AIの馬選択が未設定なら、手動で計算して state に反映
    let manualAiHorse: string | null = aiSelectedHorse;
    if (!manualAiHorse) {
      manualAiHorse = computeAiBet();
      setAiSelectedHorse(manualAiHorse);
      const chosenHorseObj = currentRaceHorses.find(horse => horse.horse_id === manualAiHorse);
      if (chosenHorseObj) {
        setMessage(prev => prev + ` / AI: 「${chosenHorseObj.馬名}」が最適解と演算完了`);
      }
    }
    // 少し待ってからレース実行
    setTimeout(() => {
      try {
        runRace(manualAiHorse);
      } catch (err) {
        console.error("量子レース崩壊:", err);
      }
    }, 200);
  }

  // レース実行＆結果処理。手動実行時は引数 manualAiHorseId を優先して使う
  function runRace(manualAiHorseId?: string): void {
    setTimerActive(false);
    try {
      if (currentRaceHorses.length === 0) throw new Error("量子確率場の崩壊");
      const processedHorses = currentRaceHorses.map(horse => ({
        ...horse,
        着順数値: Number(horse.着順),
      }));
      let actualWinner = processedHorses.find(horse => horse.着順数値 === 1);
      if (!actualWinner) {
        actualWinner = processedHorses.sort((a, b) => a.着順数値 - b.着順数値)[0];
      }
      if (!actualWinner) throw new Error("勝者なし：収束失敗");
      const winningHorseId = actualWinner.horse_id;
      setWinner(actualWinner);
      const winnerOdds = parseFloat(actualWinner.オッズ);
      if (isNaN(winnerOdds)) throw new Error("量子変換エラー");
      console.log("勝利馬オッズ:", winnerOdds);
      console.log("人類の選択:", selectedHorse);
      console.log("AIの選択:", manualAiHorseId ?? aiSelectedHorse);
      console.log("勝者ID:", winningHorseId);

      const userWin = selectedHorse === winningHorseId;
      if (userWin) {
        const userPayout = betAmount * winnerOdds;
        console.log("人類への還元:", userPayout);
        setUserBalance(prev => {
          const newBalance = prev + userPayout;
          console.log(`人類知性の資源: ${prev} → ${newBalance}`);
          return newBalance;
        });
      }
      const aiWin = (manualAiHorseId ?? aiSelectedHorse) === winningHorseId;
      console.log("AI演算結果:", aiWin);
      if (aiWin) {
        const aiPayout = AI_BET_AMOUNT * winnerOdds;
        console.log("AI利得計算:", aiPayout);
        setAiBalance(prev => {
          const newBalance = prev + aiPayout;
          console.log(`AI資源状態: ${prev} → ${newBalance}`);
          return newBalance;
        });
      }
      if (userWin && aiWin) {
        setMessage("二つの運命が交差する：人類とAIが共に同じ未来を見た");
      } else if (userWin) {
        setMessage("人類の光明：あなたの直感が計算を超えた。しかし、これは序章に過ぎない");
      } else if (aiWin) {
        setMessage("AIの勝利：計算の果てに未来を見据える。人類の選択は誤りであった");
      } else {
        setMessage("予測の迷宮：人類とAIにはまだ予測できない未来があった");
      }
      setRaceFinished(true);
    } catch (err) {
      console.error(err);
      setMessage("システム崩壊：量子波動の乱れが現実を歪める。次元転移を開始");
      setRaceFinished(true);
    }
  }

  // 次のレースへ進む処理
  function nextRace(): void {
    if (currentRaceIndex < raceIds.length - 1) {
      setCurrentRaceIndex(prev => prev + 1);
      setRaceFinished(false);
      setWinner(null);
      setSelectedHorse(null);
      setBetAmount(100);
      setTimeLeft(30);
      setTimerActive(true);
      setAiSelectedHorse(null);
      setMessage(`試練${currentRaceIndex + 2}へ進む：運命へのカウントダウン`);
    } else {
      if (userBalance > aiBalance) {
        setFinalWinner("human");
      } else if (aiBalance > userBalance) {
        setFinalWinner("AI");
      } else {
        setFinalWinner("draw");
      }
      setGameOver(true);
    }
  }

  // ゲーム終了時は Result コンポーネントに最終勝者を渡す
  if (gameOver && finalWinner !== null) return <Result winner={finalWinner} />;

  const rank1Horse = currentRaceHorses.find(horse => Number(horse.着順) === 1);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-black text-green-300 rounded-md relative shadow-2xl">
      <div className="max-w-6xl mx-auto p-4 rounded-md shadow-2xl relative z-30"></div>
      {/* ヘッダー：SSR時はプレースホルダー、クライアント側でrandomIdがセットされる */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-green-700 text-xs text-green-400 py-1 px-4 flex justify-between items-center z-20">
        <div>個体識別子: HMN-{randomId || "loading"}</div>
      </div>

      <div className="scanlines absolute inset-0 z-10 pointer-events-none opacity-20"></div>
      <div className="grid-background absolute inset-0 opacity-10 z-0 pointer-events-none"></div>

      {/* メッセージ表示 */}
      <div className="mb-4 p-3 border border-green-700 text-center bg-gray-900 rounded">
        <p>{message}</p>
      </div>

      <div className="border border-green-700 bg-gray-900 rounded">
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center p-3 border-b border-green-700">
          <div className="text-xl font-mono">
            <span>[試練 {"R" in raceInfo ? (raceInfo as any).R : "-"}]</span>{" "}
            {"SFレース名" in raceInfo ? (raceInfo as any).SFレース名 : "座標未定義"}
          </div>
          <div className="text-right flex space-x-6">
            <div className="text-sm">
              <span className="text-xs text-green-500">人類の残高</span>
              <div className="text-lg text-green-400">{userBalance.toLocaleString()}¥</div>
            </div>
            <div className="text-sm">
              <span className="text-xs text-green-500">AIの残高</span>
              <div className="text-lg text-red-400">{aiBalance.toLocaleString()}¥</div>
            </div>
          </div>
        </div>

        {/* 進行状況 */}
        <div className="p-2">
          <div className="flex justify-between text-xs mb-1 text-green-500">
            <span>運命へのカウントダウン</span>

            <span>
              {currentRaceIndex + 1}/{raceIds.length}
            </span>
          </div>
          <div className="w-full bg-green-900 h-1 rounded">
            <div
              className="h-1 bg-green-500 rounded"
              style={{ width: `${((currentRaceIndex + 1) / raceIds.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* カウントダウン */}
        {!raceFinished && timerActive && (
          <div className="p-2 border-y border-green-700 my-2">
            <div className="flex justify-between mb-1">
              <span>タイムリミット: {timeLeft}秒</span>
              <span>{aiSelectedHorse ? "AI演算完了" : "AI演算中..."}</span>
            </div>
            <div className="w-full bg-green-900 h-2 rounded">
              <div
                className={`h-2 rounded ${
                  timeLeft <= 10 ? "bg-red-700" : "bg-green-500"
                } transition-all duration-200`}
                style={{ width: `${timerPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* レース情報 */}
        <div className="p-2 text-xs text-green-500">
          <span>[パラメータ]</span> {"距離" in raceInfo ? (raceInfo as any).距離 : "-"} |{" "}
          {"天気" in raceInfo ? (raceInfo as any).天気 : "-"}-{" "}
          {"馬場" in raceInfo ? (raceInfo as any).馬場 : "-"}
        </div>

        {/* レース結果 */}
        {raceFinished && winner && (
          <div className="p-3 border border-green-700 mx-2 mb-2 bg-gray-900 rounded">
            <h3 className="font-bold text-lg mb-2 pb-1 border-b border-green-700">結果</h3>
            <p>
              1着: <span className="font-bold text-yellow-500">{winner.馬名}</span> (オッズ:{" "}
              {winner.オッズ})
            </p>
            <div className="flex mt-2">
              {/* ユーザーの投資 */}
              <div className="w-1/2 pr-2">
                <p className="font-bold pb-1 border-b border-green-700">人類の命運:</p>
                {selectedHorse ? (
                  <div
                    className={
                      winner.horse_id === selectedHorse
                        ? "text-green-400 font-bold"
                        : "text-green-700"
                    }
                  >
                    {horses.find(h => h.horse_id === selectedHorse)?.馬名}:{" "}
                    {betAmount.toLocaleString()}¥
                    {winner.horse_id === selectedHorse &&
                      ` → 払戻額: ${(betAmount * (parseFloat(winner.オッズ))).toLocaleString()}¥`}
                  </div>
                ) : (
                  <p className="text-green-700">運命放棄</p>
                )}
              </div>
              {/* AIの投資 */}
              <div className="w-1/2 pl-2 border-l border-green-700">
                
                <p className="font-bold pb-1 border-b border-green-700">AIの選択:</p>
                {aiSelectedHorse ? (
                  <div
                    className={
                      winner.horse_id === aiSelectedHorse
                        ? "text-red-400 font-bold"
                        : "text-green-700"
                    }
                  >
                    {horses.find(h => h.horse_id === aiSelectedHorse)?.馬名}:{" "}
                    {AI_BET_AMOUNT.toLocaleString()}¥
                    {winner.horse_id === aiSelectedHorse &&
                      ` → 払戻額: ${(
                        AI_BET_AMOUNT *
                        (parseFloat(winner.オッズ) )
                      ).toLocaleString()}¥`}
                  </div>
                ) : (
                  <p className="text-green-700">演算中断</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 馬一覧テーブル */}
        <div className="mb-3 mx-2">
          <div className="overflow-x-auto overflow-y-auto max-h-64 border border-green-700 rounded">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-black">
                <tr>
                  <th className="p-2 text-left border-b border-green-700">馬番</th>
                  <th className="p-2 text-left border-b border-green-700">個体名</th>
                  <th className="p-2 text-left border-b border-green-700">操縦者</th>
                  <th className="p-2 text-center border-b border-green-700">オッズ</th>
                  <th className="p-2 text-center border-b border-green-700">人気</th>
                  <th className="p-2 text-center border-b border-green-700">前走着順</th>
                  <th className="p-2 text-center border-b border-green-700">前々走着順</th>
                  <th className="p-2 text-center border-b border-green-700">現状</th>
                </tr>
              </thead>
              <tbody>
                {currentRaceHorses.map((horse: Horse, index: number) => {
                  const isAiBet = aiSelectedHorse === horse.horse_id;
                  const isSelected = selectedHorse === horse.horse_id;
                  const isWinner = raceFinished && winner?.horse_id === horse.horse_id;
                  return (
                    <tr
                      key={`${horse.horse_id}-${index}`}
                      className={`border-b border-green-700 ${
                        isWinner
                          ? "bg-yellow-800 bg-opacity-30"
                          : isAiBet && !raceFinished
                          ? "bg-red-900 bg-opacity-30"
                          : isSelected
                          ? "bg-blue-900 bg-opacity-30"
                          : "hover:bg-gray-800"
                      }`}
                      onClick={() => !raceFinished && selectHorse(horse.horse_id)}
                      style={{ cursor: raceFinished ? "not-allowed" : "pointer" }}
                    >
                      <td className="p-2 text-green-500">{horse.馬番}</td>
                      <td className="p-2 font-bold whitespace-nowrap">
                        {isSelected && ">"} {horse.馬名} {isSelected && "<"}
                      </td>
                      <td className="p-2 text-green-500 whitespace-nowrap">{horse.騎手}</td>
                      <td className="p-2 text-center font-medium text-yellow-500">
                        {horse.オッズ}
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-block w-6 h-6 rounded-full border border-green-700 flex items-center justify-center text-sm font-bold">
                          {horse.人気}
                        </span>
                      </td>
                      <td className="p-2 text-center">{horse.前走着順}</td>
                      <td className="p-2 text-center">{horse.前々走着順}</td>
                      <td className="p-2 text-center whitespace-nowrap">
                        {!raceFinished && isSelected && (
                          <span className="inline-block px-2 py-1 bg-blue-900 text-blue-300 text-xs font-medium rounded">
                            人類選択
                          </span>
                        )}
                        {!raceFinished && isAiBet && (
                          <span className="inline-block px-2 py-1 bg-red-900 text-red-300 text-xs font-medium rounded">
                            AI解析
                          </span>
                        )}
                        {raceFinished && isSelected && (
                          <span className="inline-block px-2 py-1 bg-blue-900 text-blue-300 text-xs font-medium rounded">
                            人類
                          </span>
                        )}
                        {raceFinished && isAiBet && (
                          <span className="inline-block px-2 py-1 bg-red-900 text-red-300 text-xs font-medium rounded">
                            AI
                          </span>
                        )}
                        {raceFinished && isWinner && (
                          <span className="inline-block px-2 py-1 bg-yellow-800 text-yellow-300 text-xs font-medium rounded ml-1">
                            1着
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 操作ボタン群 */}
        {!raceFinished ? (
          <>
            <div className="flex justify-end mb-4 bg-gray-800 p-2 rounded mx-2">
              <div className="flex items-center">
                <span className="mr-2">運命賭注額:</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  disabled={!selectedHorse}
                  className="w-24 px-2 py-1 bg-gray-900 border border-green-700 text-right rounded mr-2 focus:outline-none focus:ring-1 focus:ring-green-600"
                />
                <span className="font-bold">¥</span>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <button
                onClick={placeBet}
                disabled={!selectedHorse || betAmount <= 0 || betAmount > userBalance}
                className={`px-8 py-2 rounded ${
                  !selectedHorse || betAmount <= 0 || betAmount > userBalance
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-600 text-white"
                } transition-all duration-200`}
              >
                運命確定
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-center mb-4">
            <button
              onClick={nextRace}
              className="bg-red-700 hover:bg-red-600 text-white px-8 py-2 rounded transition-all duration-200"
            >
              {currentRaceIndex < raceIds.length - 1 ? "次なる試練へ" : "最終判定へ"}
            </button>
          </div>
        )}

        {/* フッター */}
        <div className="text-xs text-green-500 mt-4 border-t border-green-700 pt-2 flex justify-between p-2">
          <div>量子馬実験 v2.5 - シンギュラリティ収束計画</div>
          <div>
            {currentRaceIndex + 1}/{raceIds.length} 次元
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorseRaceGame;