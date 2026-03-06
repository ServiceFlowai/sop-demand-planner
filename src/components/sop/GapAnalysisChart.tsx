import React from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, Legend } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface MonthlyData {
  month: string;
  demand: number;
  supply: number;
  gap?: number; // Optional, can be calculated or provided
}

interface GapAnalysisChartProps {
  data: MonthlyData[];
  title?: string;
}

const GapAnalysisChart: React.FC<GapAnalysisChartProps> = ({ data, title = 'Demand vs. Supply Gap Analysis' }) => {
  // Calculate gap if not already present
  const processedData = data.map(item => ({ ...item, gap: item.demand - item.supply }));

  // Calculate combined Y-axis domain to ensure both demand and supply are visible, with padding
  const allValues = processedData.flatMap(item => [item.demand, item.supply]);
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const padding = (maxY - minY) * 0.1; // 10% padding
  const domainMin = Math.floor((minY - padding) / 1000) * 1000; // Round down to nearest thousand
  const domainMax = Math.ceil((maxY + padding) / 1000) * 1000; // Round up to nearest thousand

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', height: 450 }}>
      <Typography variant="h6" gutterBottom align="center">{title}</Typography>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[domainMin, domainMax]} />
          <Tooltip />
          <Legend />
          {/* Demand Area */}
          <Area
            type="monotone"
            dataKey="demand"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
            name="Demand (Units)"
          />
          {/* Supply Area */}
          <Area
            type="monotone"
            dataKey="supply"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
            name="Supply (Units)"
          />
          {/* Gap highlighting - This is a trick: create a transparent area and then a conditional fill for the 'gap' */}
          <Area
            type="monotone"
            dataKey="supply"
            stackId="1"
            stroke="none"
            fill="transparent"
            name="_supply_fill_base"
          />
          <Area
            type="monotone"
            dataKey="demand"
            stackId="1"
            stroke="none"
            name="_demand_fill_base"
            fill="transparent"
            isAnimationActive={false} // Disable animation for this overlay layer
            // Custom fill based on gap: red for deficit (demand > supply), green for surplus (supply > demand)
            fillRender={({ x, y, width, height, value, index, dataKey, points }) => {
              const currentItem = processedData[index];
              if (!currentItem) return null;

              const deficit = currentItem.demand > currentItem.supply;
              const surplus = currentItem.supply > currentItem.demand;

              // Only draw if there's a significant gap
              if (Math.abs(currentItem.gap || 0) > 0.01) { // Threshold for considering a gap
                const pointsForArea = [
                  { x: points[0].x, y: points[0].y }, // demand point 0
                  { x: points[1].x, y: points[1].y }, // demand point 1
                ];

                // Find corresponding supply points for the same X values
                const supplyPoint0 = processedData.find(d => d.month === currentItem.month);
                if (supplyPoint0) {
                  const supplyY0 = points.find(p => p.x === pointsForArea[0].x && p.dataKey === 'supply')?.y;
                  const supplyY1 = points.find(p => p.x === pointsForArea[1].x && p.dataKey === 'supply')?.y;

                  if(supplyY0 !== undefined && supplyY1 !== undefined) {
                    pointsForArea.push({x: pointsForArea[1].x, y: supplyY1}); // supply point 1
                    pointsForArea.push({x: pointsForArea[0].x, y: supplyY0}); // supply point 0

                    // Create SVG path string
                    const pathData = pointsForArea.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

                    return (
                      <path
                        d={pathData}
                        fill={deficit ? 'rgba(255, 0, 0, 0.3)' : surplus ? 'rgba(0, 128, 0, 0.3)' : 'transparent'}
                        stroke="none"
                      />
                    );
                  }
                }
              }
              return null;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default GapAnalysisChart;
export type { MonthlyData };
