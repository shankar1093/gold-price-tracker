import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">

          {/* Logo + wordmark */}
          <div className="flex items-center gap-3">
            {/* Logo badge — light bg so maroon logo is visible on dark header */}
            <div className="bg-[#F1ECEC] rounded p-1.5 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Mangalore Jewellery Works logo"
                width={40}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wide leading-tight">
                Mangalore Jewellery Works
              </h1>
              <p className="text-xs tracking-widest uppercase opacity-70 mt-0.5">
                Est. Since 1978 &nbsp;·&nbsp; Pure Gold &amp; Silver
              </p>
            </div>
          </div>

          <Link
            href="#"
            className="text-sm tracking-wide opacity-80 hover:opacity-100 hover:underline transition-opacity"
            prefetch={false}
          >
            Contact
          </Link>
        </div>
      </div>

      {/* Brand gold shimmer line */}
      <div
        className="h-[2px] w-full"
        style={{ background: 'linear-gradient(to right, transparent, #D1B000, #e8ca30, #D1B000, transparent)' }}
      />
    </header>
  );
};

export default Header;
