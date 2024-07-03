'use client';
import React from 'react';

interface PriceCardProps {
    title: string;
    price: number;
    date: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price, date }) => {
    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="text-5xl font-bold mb-2">
      ₹<span className="text-primary">{price.toFixed(2)}</span>
      </div>
      <p className="text-muted-foreground text-sm">As of {date}</p>
    </div>
  );
};

export default PriceCard;