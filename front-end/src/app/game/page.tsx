// src/app/page.tsx
import HorseTable from '@/components/HorseTable';
import Head from 'next/head';
import Header_game from '@/components/layout/Header_game';

export default function Game() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <Header_game />
      <HorseTable />
    </main>
  );
}
