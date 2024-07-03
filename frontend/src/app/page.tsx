import React from 'react';
import Link from 'next/link';
import MyCard from '../components/price_cards';
import TimeseriesChart from '../components/price_series_chart';

const HomePage: React.FC = () => {
  const date = new Date().toLocaleDateString();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Mangalore Jewellery Works</h1>
          <div className="flex items-center gap-2">
            <Link href="#" className="hover:underline" prefetch={false}>
              Contact
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background text-foreground py-6 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <MyCard title="22kt Gold Price" price={6750} date={date} />
          <MyCard title="24kt Gold Price" price={62.2} date={date} />
        </div>
        <div className="container mx-auto mt-6">
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Gold Price Trends</h2>
            <div className="w-full h-[300px]">
              <TimeseriesChart width={200} height={200} />
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-muted text-muted-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-xs">&copy; 2024 Mangalore Jewellery Works</p>
          <div className="flex items-center gap-2">
            <Link href="#" className="hover:underline" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;