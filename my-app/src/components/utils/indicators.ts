import { CandlestickData, Time } from 'lightweight-charts';

export const sampleData: CandlestickData[] = [
  { time: '2024-07-01', open: 100, high: 110, low: 90, close: 105 },
  { time: '2024-07-02', open: 105, high: 115, low: 95, close: 110 },
  { time: '2024-07-03', open: 110, high: 120, low: 100, close: 115 },
  { time: '2024-07-04', open: 115, high: 125, low: 105, close: 120 },
  { time: '2024-07-05', open: 105, high: 90, low: 80, close: 91 },
  { time: '2024-07-06', open: 125, high: 135, low: 115, close: 130 },
];

const times = sampleData.map(d => d.time as Time);

export function calcSeriesData(values: number[], output: number[]) {
  const offset = values.length - output.length;
  return output.map((v, i) => ({
    time: times[i + offset],
    value: v,
  }));
}

export function linearRegression(values: number[]): number[] {
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return values.map((_, i) => intercept + slope * i);
}
