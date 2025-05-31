import React from 'react';
import Link from 'next/link';
import MainContent from './MainContent';
import Footer from '../components/footer';
import Header from '../components/header';

const HomePage = async () => {
  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto">
          <MainContent gold18kt={0} gold22kt={0} gold24kt={0} date={new Date().toLocaleDateString("en-IN")} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;