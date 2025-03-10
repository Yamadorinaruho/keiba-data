// src/app/page.tsx
'use client';
import { useRouter } from "next/navigation";
import Head from 'next/head';
import Header_home from '@/components/layout/Header_home';
import Button from '@/components/Button';

export default function Home() {

  const router = useRouter();
  const startGame = () => {
    router.push('/game');
  }
  

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <Header_home />
      <div className='bg-green-200/50 flex flex-col justify-center items-center'>
        <div className="">
          ここにゲームの説明を書く
        </div>
        <Button className='bg-blue-500 text-white w-40 h-15 text-2xl my-10 ' onClick={startGame} children='ゲームを始める' />
      </div>
    </main>
  );
}
