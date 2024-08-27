import React from 'react';
import Link from 'next/link';
import MainContent from './MainContent';
import Footer from '../components/footer';
import Header from '../components/header';

const HomePage = async () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto">
          <MainContent gold22kt={0} gold24kt={0} date={new Date().toLocaleDateString("en-IN")} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;