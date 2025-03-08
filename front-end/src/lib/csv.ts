import fs from 'fs';
import path from 'path';
import { Horse } from '@/types';

export async function getHorsesData(): Promise<Horse[]> {
  try {
    const filePath = path.join(process.cwd(), 'public/data/races.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split('\t');
    const dataRows = lines.slice(1);
    
    const horses = dataRows.map(row => {
      const values = row.split('\t');
      const horse: any = {};
      
      headers.forEach((header, index) => {
        horse[header] = values[index];
      });
      
      return horse as Horse;
    });
    
    return horses;
  } catch (error) {
    console.error('データ読み込みエラー:', error);
    return [];
  }
}