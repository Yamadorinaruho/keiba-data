'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';

export default function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false); // ダイアログの表示状態

    const handleGameIntterrupt = () => {
        
        setIsModalOpen(prevState => !prevState);
    };
    // 「はい」を押したときの処理   
    const handleConfirm = () => {
        alert("ゲームが中断されました。ゲーム説明画面に戻ります。");
        setIsModalOpen(false);
    }
    // 「いいえ」を押したときの処理
    const handleCancel = () => {
        setIsModalOpen(false);
    }




    return (
        <header>
        <nav className="flex justify-between items-center px-10 " style={{ backgroundColor: "#FFD700" }}>
            <div>
                <Link href="/">
                    <Image src="/logo_horse.png" alt="logo" width={100} height={100} />
                </Link>
            </div>
            <div>
                <Button className="bg-red-500" onClick={handleGameIntterrupt} children="ゲームを中断する" />
            </div>
        </nav>
        
        {/* ダイアログ */}
        { isModalOpen && (
            <div className='fixed top-0 left-0 right-0 bottom-0 bg-gray-200 bg-opacity-30 flex justify-center items-center'>
                <div className='bg-white p-6 rounded-md text-center'>
                    <h3>本当に中断しますか?</h3>
                    <p className='mb-4'>レースはリセットされ、ゲーム説明画面に戻ります</p>
                    <div>
                        <Button className='bg-red-500 mx-4'children='はい' onClick={handleConfirm} />
                        <Button className='bg-gray-500 'children='いいえ' onClick={handleCancel} />
                    </div>
                </div>
            </div>
        )}

        </header>
    );
}