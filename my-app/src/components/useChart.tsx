import { RefObject, useEffect } from 'react';
import {
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type CandlestickData,
} from 'lightweight-charts';
import { RSI, MACD, SMA } from 'technicalindicators';

interface PolygonAPIResponse {
  results: {
    t: number; // timestamp in milliseconds
    o: number; // open price
    h: number; // high price
    l: number; // low price
    c: number; // close price
  }[];
}

interface LSTMResponse {
  symbol: string;
  predictions: {
    date: string;
    price: number;
  }[];
}

const useChart = (
  chartContainerRef: RefObject<HTMLDivElement | null>,
  setSeries: React.Dispatch<
    React.SetStateAction<{
      rsi?: ISeriesApi<'Line'>;
      macd?: ISeriesApi<'Line'>;
      sma?: ISeriesApi<'Line'>;
      lstmPrediction?: ISeriesApi<'Line'>;
    }>
  >,
  symbol: string = 'AAPL',
  fromDate: string = '2024-01-01',
  toDate: string = new Date().toISOString().split('T')[0]
) => {
  const calcSeriesData = (
    times: Time[],
    indicatorOutput: number[]
  ): { time: Time; value: number }[] => {
    const offset = times.length - indicatorOutput.length;
    return indicatorOutput.map((v, i) => ({
      time: times[i + offset],
      value: v,
    }));
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#141414' },
        textColor: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins, sans-serif',
      },
      crosshair: { mode: CrosshairMode.Normal },
      grid: {
        vertLines: { color: '#444', visible: true },
        horzLines: { color: '#444', visible: true },
      },
      rightPriceScale: { borderColor: '#444' },
      leftPriceScale: { borderColor: '#444' },
      timeScale: {
        borderColor: '#444',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#FFD700',
      borderUpColor: '#FFD700',
      wickUpColor: '#FFD700',
      downColor: '#FFD700',
      borderDownColor: '#E91E63',
      wickDownColor: '#E91E63',
    });

    const API_KEY = 'H3xfoMar4Xum2M4sHZDpHX3M_jRMWWNX';
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then((data: PolygonAPIResponse) => {
        const candlestickData: CandlestickData[] = data.results.map(item => ({
          time: (item.t / 1000) as Time,
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
        }));

        const closePrices = candlestickData.map(d => d.close);
        const times = candlestickData.map(d => d.time);

        candleSeries.setData(candlestickData);

        // RSI
        const rsiSeries = chart.addLineSeries({ color: '#FF9800', lineWidth: 2 });
        rsiSeries.setData(
          calcSeriesData(times, RSI.calculate({ period: 14, values: closePrices }))
        );

        // SMA
        const smaSeries = chart.addLineSeries({ color: '#2196F3', lineWidth: 2 });
        smaSeries.setData(
          calcSeriesData(times, SMA.calculate({ period: 14, values: closePrices }))
        );

        // MACD
        const macdData = MACD.calculate({
          values: closePrices,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false,
        }).map(d => d.MACD);

        const filteredMacdData = macdData.filter((v): v is number => v !== undefined);
        const macdSeries = chart.addLineSeries({ color: '#8BC34A', lineWidth: 2 });
        macdSeries.setData(calcSeriesData(times, filteredMacdData));

        // LSTM predictions
        fetch(`http://127.0.0.1:8000/predict?symbol=${symbol}`)
          .then(res => res.json())
          .then((lstmData: LSTMResponse) => {
            if (!Array.isArray(lstmData.predictions))
              throw new Error('Invalid LSTM prediction response');

            const lstmPredictionSeries = chart.addLineSeries({
              color: '#FF5722',
              lineWidth: 2,
            });

            const predictionPoints = lstmData.predictions.map(p => ({
              time: (new Date(p.date).getTime() / 1000) as Time,
              value: p.price,
            }));

            lstmPredictionSeries.setData(predictionPoints);

            setSeries(prev => ({
              ...prev,
              lstmPrediction: lstmPredictionSeries,
            }));
          })
          .catch(err => console.error('Error fetching LSTM prediction:', err));

        setSeries(prev => ({
          ...prev,
          rsi: rsiSeries,
          macd: macdSeries,
          sma: smaSeries,
        }));
      })
      .catch(err => console.error('Error fetching chart data:', err));

    return () => chart.remove();
  }, [chartContainerRef, setSeries, symbol, fromDate, toDate]);
};

export default useChart;
