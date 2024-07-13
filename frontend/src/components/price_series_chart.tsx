'use client';
import React from 'react';
import { ResponsiveLine } from '@nivo/line';

const TimeseriesChart: React.FC<{ className: string }> = (props) => {
  return (
    <div className={props.className} style={{ width: '100%', height: '100%' }}>
      <ResponsiveLine
        data={[
          {
            id: 'Desktop',
            data: [
              { x: '2024-07-02', y: 7375 },
              { x: '2024-06-03', y: 7228 },
              { x: '2024-05-04', y: 7276 },
              { x: '2024-04-05', y: 7260 },
              { x: '2024-03-06', y: 6845 },
              { x: '2024-02-07', y: 6283 },
              { x: '2024-01-08', y: 5447 },
            ],
          },
        ]}
        margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          useUTC: false,
          precision: 'month',
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: 'linear',
          min: 4000,
          max: 'auto',
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
          format: '%d',
          tickValues: 'every 1 month',
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
        }}
        colors={['#2563eb', '#e11d48']}
        pointSize={6}
        useMesh={true}
        gridYValues={6}
        theme={{
          tooltip: {
            chip: {
              borderRadius: '9999px',
            },
            container: {
              fontSize: '12px',
              textTransform: 'capitalize',
              borderRadius: '6px',
            },
          },
          grid: {
            line: {
              stroke: '#f3f4f6',
            },
          },
        }}
        role="application"
      />
    </div>
  );
};

export default TimeseriesChart;