import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Mangalore Jewellery Works</h1>
            <p className="text-xs tracking-widest uppercase opacity-70 mt-0.5">
              Est. Since 1978 &nbsp;·&nbsp; Pure Gold &amp; Silver
            </p>
          </div>
          <Link
            href="#"
            className="text-sm sm:text-base tracking-wide opacity-80 hover:opacity-100 hover:underline transition-opacity"
            prefetch={false}
          >
            Contact
          </Link>
        </div>
      </div>
      {/* Gold shimmer accent line */}
      <div
        className="h-[2px] w-full"
        style={{ background: 'linear-gradient(to right, transparent, hsl(42,77%,55%), hsl(44,85%,65%), hsl(42,77%,55%), transparent)' }}
      />
    </header>
  );
};

export default Header;
