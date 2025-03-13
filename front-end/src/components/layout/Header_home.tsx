'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header_home() {

    return (
        <header className='fixed top-0 left-0 right-0 z-50'>
            <nav className="flex justify-between items-center px-10 bg-black/80 " >
                <div>
                    <Link href="/" className="flex items-center">
                        <Image src="/logo_horse.png" alt="logo" width={60} height={60} />
                        {/* <Image src="/creepyAI.webp" alt="logo" width={60} height={60} /> */}
                        <div className='text-cyan-100'>LAST BET</div>
                    </Link>
                </div>
            </nav>
        </header>
    );
}