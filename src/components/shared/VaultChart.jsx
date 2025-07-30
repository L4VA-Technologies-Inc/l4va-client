import { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';

const fetchCandles = async () => {
  const url = 'https://api.binance.com/api/v3/klines?symbol=ADAUSDT&interval=1d&limit=150';
  const res = await fetch(url);
  const data = await res.json();

  return data.map(([time, open, high, low, close]) => ({
    time: Math.floor(time / 1000), // seconds
    open: +open,
    high: +high,
    low: +low,
    close: +close,
  }));
};

const VaultChart = ({ vaultName }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    let chart;

    const setupChart = async () => {
      const candles = await fetchCandles();

      chart = createChart(chartContainerRef.current, {
        autoSize: true,
        layout: { background: { color: 'transparent' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
        timeScale: { timeVisible: true, secondsVisible: false },
        rightPriceScale: { borderColor: '#1e293b', textColor: '#94a3b8' },
        width: chartContainerRef.current?.clientWidth || 600,
        height: 400,
      });

      // This is the v5 way to add a candlestick series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      candleSeries.setData(candles);
      chart.timeScale().fitContent();

      // Handle resize
      const handleResize = () => {
        if (chart && chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    setupChart();

    return () => {
      if (chart) chart.remove();
    };
  }, [vaultName]);

  return <div ref={chartContainerRef} className="w-full h-[400px] min-h-[300px] md:min-h-[400px]" />;
};

export default VaultChart;
