'use client';
import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/react';

interface PriceCardProps {
  title: string;
  price: undefined | number;
  date: string | undefined;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price, date }) => {
  const displayPrice = isNaN(Number(price)) ? 'N/A' : Math.floor(price || 0);

  return (
<Card className="w-full h-auto transform transition-transform hover:scale-105 p-3 md:p-4">
  <CardHeader className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold px-2">
    {title}
  </CardHeader>
  <CardBody className="px-2">
    <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
      ₹<span className="text-primary">{displayPrice}</span>
    </div>
    <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
      As of {date}
    </p>
  </CardBody>
</Card>
  );
};

export default PriceCard;