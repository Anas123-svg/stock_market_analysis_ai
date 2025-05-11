import React from 'react';
import { buttonStyle } from './styles/buttonStyle';

interface Props {
  visible: Record<string, boolean>;
  toggle: (key: 'rsi' | 'macd' | 'sma' | 'lstmPrediction') => void;
}

const ChartControls: React.FC<Props> = ({ toggle }) => (
  <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
    <button onClick={() => toggle('rsi')} style={buttonStyle('#FF9800')}>Toggle RSI</button>
    <button onClick={() => toggle('macd')} style={buttonStyle('#8BC34A')}>Toggle MACD</button>
    <button onClick={() => toggle('sma')} style={buttonStyle('#2196F3')}>Toggle SMA</button>
    <button onClick={() => toggle('lstmPrediction')} style={buttonStyle('#9C27B0')}>Toggle LSTM Prediction</button>
  </div>
);

export default ChartControls;
