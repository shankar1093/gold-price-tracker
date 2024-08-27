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
      <Card className="flex-1 min-w-[300px] m-2 h-[180px]"> 
        <CardHeader className="text-2xl font-bold">{title}</CardHeader>
        <CardBody>
          <div className="text-5xl font-bold mb-2">
            ₹<span className="text-primary">{displayPrice}</span>
          </div>
          <p className="text-muted-foreground text-xl">As of {date}</p>
        </CardBody>
      </Card>
    // </div>
  );
};

export default PriceCard;