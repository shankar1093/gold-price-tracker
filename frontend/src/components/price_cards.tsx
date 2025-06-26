'use client';
import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/react';

interface PriceCardProps {
  title: string;
  price: undefined | number;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price }) => {
  const displayPrice = isNaN(Number(price)) ? 'N/A' : Math.floor(price || 0);

  return (
<Card className="w-full h-auto transform transition-transform hover:scale-105 p-4 md:p-[22px] xl:p-8">
  <CardHeader className="flex justify-between items-center text-base sm:text-lg md:text-xl lg:text-2xl font-semibold px-2">
    <span>{title}</span>
    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
      ₹{displayPrice}
    </span>
  </CardHeader>
</Card>
  );
};

export default PriceCard;