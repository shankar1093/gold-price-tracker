'use client';
import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/react';

interface PriceCardProps {
  title: string;
  price: undefined | number;
  date: string | undefined;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price, date }) => {
  const displayPrice = isNaN(Number(price)) ? 'N/A' : Math.floor(price ?? 0);

  return (
    //     <div className="bg-card rounded-lg shadow-xl p-8">
    //   <h2 className="text-2xl font-bold mb-4">{title}</h2>
    //   <div className="text-5xl font-bold mb-2">
    //   ₹<span className="text-primary">{displayPrice}</span>
    //   </div>
    //   <p className="text-muted-foreground text-sm">As of {date}</p>
    // </div>
    // <div className="grid grid-cols-1 md:grid-cols-2">
      <Card className="flex-1 min-w-[300px] m-2">
        <CardHeader>22kt price</CardHeader>
        <CardBody>
          <div className="text-5xl font-bold mb-2">
            ₹<span className="text-primary">{displayPrice}</span>
          </div>
          <p className="text-muted-foreground text-sm">As of {date}</p>
        </CardBody>
      </Card>
    // </div>
  );
};

export default PriceCard;