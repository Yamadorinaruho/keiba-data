'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header_home() {

    return (
        <header>
            <nav className="flex justify-between items-center px-10 " style={{ backgroundColor: "#FFD700" }}>
                <div>
                    <Link href="/" className="flex items-center">
                        <Image src="/logo_horse.png" alt="logo" width={60} height={60} />
                        <div>競馬レース</div>
                    </Link>
                </div>
            </nav>
        </header>
    );
}