// src/app/page.tsx
import HorseTable from '@/components/HorseTable';

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <HorseTable />
    </main>
  );
}