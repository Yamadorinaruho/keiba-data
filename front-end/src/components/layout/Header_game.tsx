'use client';

import { useRouter } from "next/navigation";
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';

export default function Header_game() {
    const [isModalOpen, setIsModalOpen] = useState(false); // ダイアログの表示状態
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleGameIntterrupt = () => {
        
        setIsModalOpen(prevState => !prevState);
    };
    // 「はい」を押したときの処理   
    const handleConfirm = () => {
        setIsLoading(true); // ローディング状態をON
        setIsModalOpen(false);
        router.replace("/"); // 
    }
    // 「いいえ」を押したときの処理
    const handleCancel = () => {
        setIsModalOpen(false);
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50"> 
            <nav className="flex justify-between items-center px-10 " style={{ backgroundColor: "#FFD700" }}>
                <div className="flex items-center">
                        <Image src="/logo_horse.png" alt="logo" width={60} height={60} />
                        <div>競馬レース</div>
                </div>
                <div>
                    <Button className="bg-orange-700 hover:opacity-80 text-white  px-3 h-8 font-bold rounded-full shadow-lg" onClick={handleGameIntterrupt} children="中断" />
                </div>
            </nav>
            
            {/* ダイアログ */}
            {isLoading && (
            <div className="fixed top-0 left-0 w-full h-full bg-white flex justify-center items-center">
                <p>ロード中...</p>
            </div>
            )}
            { isModalOpen && (
                <div className='fixed top-0 left-0 right-0 bottom-0 bg-gray-200 bg-opacity-30 flex justify-center items-center'>
                    <div className='bg-white p-6 rounded-md text-center'>
                        <h3>本当に中断しますか?</h3>
                        <p className='mb-4'>レースはリセットされ、ゲーム説明画面に戻ります</p>
                        <div className="flex justify-between mx-10">
                            <Button className='bg-red-500 hover:opacity-50 w-15 h-10 rounded-2xl cursor-pointer'children='はい' onClick={handleConfirm} />
                            <Button className='bg-gray-300 hover:opacity-50 w-15 h-10 rounded-2xl cursor-pointer' children='いいえ' onClick={handleCancel} />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}