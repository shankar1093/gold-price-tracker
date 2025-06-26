'use client';
import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/react';

interface DateCardProps {
  title: string;
  date: undefined | string;
}

const DateCard: React.FC<DateCardProps> = ({ title, date }) => {


  return (
<Card className="w-full min-h-34 h-auto transform transition-transform hover:scale-105 p-3 md:p-4">
  <CardHeader className="flex justify-between items-center text-base sm:text-lg md:text-xl lg:text-2xl font-semibold px-2">
    <span>{title}</span>
    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
      {date}
    </span>
  </CardHeader>
</Card>
  );
};

export default DateCard;