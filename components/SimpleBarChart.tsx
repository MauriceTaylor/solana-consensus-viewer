
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartDataPoint } from '../types';

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  barKey: string;
  xAxisKey: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  barKey, 
  xAxisKey, 
  height = 300, 
  showLegend = true, 
  showTooltip = true,
  layout = 'horizontal'
}) => {
  if (!RechartsBarChart) { // Check if Recharts is loaded
    return <div className="text-red-500">Recharts library not loaded. Chart cannot be displayed.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} layout={layout} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(55 65 81)" />
        {layout === 'horizontal' ? (
          <>
            <XAxis dataKey={xAxisKey} tick={{ fill: '#cbd5e1' }} />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} tick={{ fill: '#cbd5e1' }} />
          </>
        ) : (
          <>
            <XAxis type="number" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} tick={{ fill: '#cbd5e1' }} />
            <YAxis dataKey={xAxisKey} type="category" tick={{ fill: '#cbd5e1' }} />
          </>
        )}
        {showTooltip && <Tooltip 
            contentStyle={{ backgroundColor: 'rgb(31 41 55)', border: '1px solid rgb(55 65 81)', borderRadius: '0.25rem' }} 
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#e5e7eb' }}
            formatter={(value: number) => [`${value.toLocaleString()} SOL`, 'Stake']}
        />}
        {showLegend && <Legend wrapperStyle={{ color: '#e5e7eb' }} />}
        <Bar dataKey={barKey} name="Stake" /> 
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default SimpleBarChart;
    