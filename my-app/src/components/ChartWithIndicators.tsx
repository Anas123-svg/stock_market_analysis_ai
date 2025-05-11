import React, { useRef, useState } from 'react';
import { ISeriesApi } from 'lightweight-charts';
import ChartControls from './ChartControls';
import useChart from './useChart';

const ChartWithIndicators: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartKey, setChartKey] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [series, setSeries] = useState<{
    rsi?: ISeriesApi<'Line'>;
    macd?: ISeriesApi<'Line'>;
    sma?: ISeriesApi<'Line'>;
    lstmPrediction?: ISeriesApi<'Line'>;
  }>({});

  const [visible, setVisible] = useState({
    rsi: true,
    macd: true,
    sma: true,
    lstmPrediction: true,
  });

  const [symbol, setSymbol] = useState('AAPL');
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
const fetchAIAnalysis = async (rsi: number[], macd: number[], sma: number[]) => {
  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // replace with your actual key
  const prompt = `
Analyze the stock ticker ${symbol} from ${fromDate} to ${toDate}.
Here are the indicator values:
- RSI: ${rsi.slice(-5).join(', ')}
- MACD: ${macd.slice(-5).join(', ')}
- SMA: ${sma.slice(-5).join(', ')}

Provide a concise analysis of the market condition.
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    }),
  });

  const json = await res.json();
  const content = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available.';
  setAiAnalysis(content);
};

  // ⏬ Hook will run each time chartKey changes
  useChart(chartContainerRef, setSeries, symbol, fromDate, toDate);

  const toggle = (key: keyof typeof visible) => {
    const isVisible = !visible[key];
    setVisible(prev => ({ ...prev, [key]: isVisible }));
    const s = series[key];
    if (s) s.applyOptions({ visible: isVisible });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🔁 trigger useEffect cleanup and re-fetch
    setChartKey(prev => prev + 1);
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', padding: '10px' }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="AAPL">Apple (AAPL)</option>
          <option value="MSFT">Microsoft (MSFT)</option>
          <option value="GOOGL">Alphabet (GOOGL)</option>
          <option value="AMZN">Amazon (AMZN)</option>
          <option value="META">Meta (META)</option>
          <option value="TSLA">Tesla (TSLA)</option>
          <option value="NVDA">NVIDIA (NVDA)</option>
          <option value="BRK.A">Berkshire Hathaway (BRK.A)</option>
          <option value="JNJ">Johnson & Johnson (JNJ)</option>
          <option value="V">Visa (V)</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
      </form>

      {/* Chart Controls now toggles visibility of lstmPrediction box */}
      <ChartControls visible={visible} toggle={toggle} />
      <div key={chartKey} ref={chartContainerRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );

  
};

export default ChartWithIndicators;
