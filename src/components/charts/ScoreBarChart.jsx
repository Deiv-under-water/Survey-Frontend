import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const ScoreBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data-placeholder">Sin datos de puntuaciones disponibles</div>;
  }

  // Format data for chart
  const formattedData = data.map(item => ({
    ...item,
    puntuacion: item.total_score || item.averageScore || item.averagePercentage || 0,
    nombre: item.company?.nombre_empresa || item.company || item.name || ''
  }));
  // Sort data by score descending for better visual ranking
  const sortedData = formattedData.sort((a, b) => b.puntuacion - a.puntuacion);

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="nombre" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            stroke="var(--border-color)"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            stroke="var(--border-color)"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)'
            }}
            formatter={(value) => `${value}%`}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }} />
          <Bar 
            name="Puntuación General %" 
            dataKey="puntuacion" 
            fill="var(--secondary-color)" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreBarChart;
