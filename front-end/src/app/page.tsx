// src/app/page.tsx
import HorseTable from '@/components/HorseTable';
import Head from 'next/head';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <Header />
      <HorseTable />
    </main>
  );
}
