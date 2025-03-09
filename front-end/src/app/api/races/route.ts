import { NextResponse } from 'next/server';
import { getHorsesData } from '@/lib/csv';

export async function GET() {
  try {
    const horses = await getHorsesData();
    return NextResponse.json(horses);
  } catch (error) {
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}