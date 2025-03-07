"use client"


import KeibaTable from "@/components/keiba_table";
import UserBet from "@/components/Userbet";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
       <KeibaTable/>
       <UserBet race={undefined} playerMoney={0} takenHorses={[]} onPlaceBet={function (horseId: number, amount: number, betType: string): void {
          throw new Error("Function not implemented.");
        } } getFrameColor={function (frameNumber: string): string {
          throw new Error("Function not implemented.");
        } }/>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
