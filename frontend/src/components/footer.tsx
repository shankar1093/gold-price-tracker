import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      {/* Gold top accent line */}
      <div
        className="h-[2px] w-full"
        style={{ background: 'linear-gradient(to right, transparent, hsl(42,77%,55%), hsl(44,85%,65%), hsl(42,77%,55%), transparent)' }}
      />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-80">
          <span className="tracking-wide">© {new Date().getFullYear()} Mangalore Jewellery Works</span>
          <Link href="#" className="hover:opacity-100 hover:underline transition-opacity" prefetch={false}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
