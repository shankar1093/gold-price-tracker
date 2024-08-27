import React from 'react';
import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-2">
                    <h1 className="text-2xl font-bold">Mangalore Jewellery Works</h1>
                    <Link href="#" className="hover:underline text-2xl" prefetch={false}>
                        Contact
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;