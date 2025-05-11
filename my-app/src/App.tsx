import React, { useState } from 'react';
import ChartWithIndicators from './components/ChartWithIndicators';

function App() {
  const [stock, setStock] = useState('AAPL');

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStock(e.target.value);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#121212',
      color: 'white',
      minHeight: '100vh',
      padding: '30px',
      boxSizing: 'border-box',
      fontFamily: 'Segoe UI, sans-serif',
    }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>

      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{
          flex: '2',
          backgroundColor: '#1e1e1e',
          borderRadius: '10px',
          padding: '0px',
          minWidth: '60%',
          boxShadow: '0 0 10px rgba(0,0,0,0.4)',
        }}>

          <h2 style={{
            textAlign: 'left',
            marginLeft: '20px', marginBottom: '20px', color: '#f0f0f0'
          }}>{stock} Chart</h2>
          <ChartWithIndicators />
        </div>

        {/* Description  */}
        <div style={{
          flex: '1',
          backgroundColor: '#1a1a1a',
          borderRadius: '10px',
          padding: '20px',
          minWidth: '35%',
          boxShadow: '0 0 10px rgba(0,0,0,0.4)',
        }}>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>Market Overview</h3>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.5' }}>
            Explore historical trends, resistance levels, and indicator insights
            for <strong>{stock}</strong>. Use the filters above to visualize
            custom time ranges and compare performance over time.
          </p>
        </div>
      </div>
    </div>
  );
}

const dropdownStyle: React.CSSProperties = {
  backgroundColor: '#2c2c2c',
  color: 'white',
  border: '1px solid #444',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '14px',
  outline: 'none',
};

export default App;
