import React, { useMemo } from "react";

type MonthlyProjection = {
  month: string;
  projectedDemand: number;
};

type SupplyDemandRecord = {
  month: string;
  projectedDemand: number;
  availableSupply: number;
};

type DemandForecastChartProps = {
  data: MonthlyProjection[];
  height?: number;
  width?: number;
};

const DemandForecastChart: React.FC<DemandForecastChartProps> = ({
  data,
  height = 260,
  width = 600,
}) => {
  const chartPadding = { top: 24, right: 32, bottom: 48, left: 48 };

  const { points, yAxisTicks, xLabels } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], yAxisTicks: [], xLabels: [] };
    }

    const values = data.map((item) => item.projectedDemand);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const valueRange = maxVal === minVal ? 1 : maxVal - minVal;

    const usableHeight = height - chartPadding.top - chartPadding.bottom;
    const usableWidth = width - chartPadding.left - chartPadding.right;

    const pointsMapped = data.map((item, index) => {
      const x = chartPadding.left + (usableWidth / Math.max(data.length - 1, 1)) * index;
      const y =
        chartPadding.top +
        usableHeight -
        ((item.projectedDemand - minVal) / valueRange) * usableHeight;
      return { ...item, x, y };
    });

    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount + 1 }, (_, idx) => {
      const ratio = idx / tickCount;
      const value = maxVal - ratio * valueRange;
      const y = chartPadding.top + ratio * usableHeight;
      return { value: Math.round(value), y };
    });

    return {
      points: pointsMapped,
      yAxisTicks: yTicks,
      xLabels: data.map((item, idx) => ({ label: item.month, idx })),
    };
  }, [data, height, width]);

  if (points.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <p>No demand forecast data available.</p>
      </div>
    );
  }

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${
    points[points.length - 1].x
  } ${height - chartPadding.bottom} L ${points[0].x} ${height - chartPadding.bottom} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Demand forecast line chart"
    >
      <title>Demand Forecast</title>
      <rect
        x={chartPadding.left}
        y={chartPadding.top}
        width={width - chartPadding.left - chartPadding.right}
        height={height - chartPadding.top - chartPadding.bottom}
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth={1}
      />

      {yAxisTicks.map((tick, idx) => (
        <g key={`y-tick-${idx}`}>
          <line
            x1={chartPadding.left}
            x2={width - chartPadding.right}
            y1={tick.y}
            y2={tick.y}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <text
            x={chartPadding.left - 12}
            y={tick.y + 4}
            textAnchor="end"
            fontSize={12}
            fill="#64748b"
          >
            {tick.value}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="rgba(37, 99, 235, 0.1)" />
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth={2} />

      {points.map((point, idx) => (
        <g key={`point-${point.month}`}>
          <circle cx={point.x} cy={point.y} r={4} fill="#2563eb" />
          <text
            x={point.x}
            y={point.y - 8}
            textAnchor="middle"
            fontSize={12}
            fill="#1e293b"
          >
            {point.projectedDemand}
          </text>
        </g>
      ))}

      {xLabels.map(({ label, idx }) => {
        const point = points[idx];
        return (
          <text
            key={`x-label-${label}`}
            x={point.x}
            y={height - chartPadding.bottom + 24}
            textAnchor="middle"
            fontSize={12}
            fill="#64748b"
          >
            {label}
          </text>
        );
      })}

      <text
        x={chartPadding.left + (width - chartPadding.left - chartPadding.right) / 2}
        y={height - 8}
        textAnchor="middle"
        fontSize={13}
        fill="#475569"
        fontWeight={500}
      >
        Month
      </text>
      <text
        x={16}
        y={chartPadding.top + (height - chartPadding.top - chartPadding.bottom) / 2}
        textAnchor="middle"
        fontSize={13}
        fill="#475569"
        fontWeight={500}
        transform={`rotate(-90 16 ${
          chartPadding.top + (height - chartPadding.top - chartPadding.bottom) / 2
        })`}
      >
        Projected Demand
      </text>
    </svg>
  );
};

const demandForecast: MonthlyProjection[] = [
  { month: "Jan", projectedDemand: 420 },
  { month: "Feb", projectedDemand: 450 },
  { month: "Mar", projectedDemand: 470 },
  { month: "Apr", projectedDemand: 490 },
  { month: "May", projectedDemand: 520 },
  { month: "Jun", projectedDemand: 560 },
  { month: "Jul", projectedDemand: 600 },
  { month: "Aug", projectedDemand: 630 },
  { month: "Sep", projectedDemand: 610 },
  { month: "Oct", projectedDemand: 590 },
  { month: "Nov", projectedDemand: 570 },
  { month: "Dec", projectedDemand: 550 },
];

const supplyDemand: SupplyDemandRecord[] = [
  { month: "Jan", projectedDemand: 420, availableSupply: 400 },
  { month: "Feb", projectedDemand: 450, availableSupply: 430 },
  { month: "Mar", projectedDemand: 470, availableSupply: 460 },
  { month: "Apr", projectedDemand: 490, availableSupply: 500 },
  { month: "May", projectedDemand: 520, availableSupply: 510 },
  { month: "Jun", projectedDemand: 560, availableSupply: 550 },
  { month: "Jul", projectedDemand: 600, availableSupply: 610 },
  { month: "Aug", projectedDemand: 630, availableSupply: 620 },
  { month: "Sep", projectedDemand: 610, availableSupply: 600 },
  { month: "Oct", projectedDemand: 590, availableSupply: 580 },
  { month: "Nov", projectedDemand: 570, availableSupply: 590 },
  { month: "Dec", projectedDemand: 550, availableSupply: 560 },
];

const SOPDashboard: React.FC = () => {
  return (
    <section
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "minmax(0, 1fr)",
        padding: 24,
        backgroundColor: "#f1f5f9",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#0f172a",
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>S&OP Dashboard</h1>
        <p style={{ margin: "8px 0 0", color: "#475569" }}>
          Monitor demand forecasts alongside supply capacity to keep plans aligned.
        </p>
      </header>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 10px 25px -20px rgba(15, 23, 42, 0.35)",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600 }}>Demand Forecast</h2>
        <DemandForecastChart data={demandForecast} />
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 10px 25px -20px rgba(15, 23, 42, 0.35)",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600 }}>
          Supply vs Demand Comparison
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 13,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                >
                  Month
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 16px",
                    fontSize: 13,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                >
                  Projected Demand
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 16px",
                    fontSize: 13,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                >
                  Available Supply
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 16px",
                    fontSize: 13,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                >
                  Gap
                </th>
              </tr>
            </thead>
            <tbody>
              {supplyDemand.map((record, index) => {
                const gap = record.availableSupply - record.projectedDemand;
                const isSupplyShort = gap < 0;
                return (
                  <tr key={record.month} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px" }}>{record.month}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>{record.projectedDemand}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>{record.availableSupply}</td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        color: isSupplyShort ? "#dc2626" : "#16a34a",
                        fontWeight: 600,
                      }}
                    >
                      {gap > 0 ? `+${gap}` : gap}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SOPDashboard;
