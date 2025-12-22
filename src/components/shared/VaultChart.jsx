import { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';

const transformDataToCandles = data => {
  if (!data || data.s !== 'ok' || !data.t || !data.o || !data.h || !data.l || !data.c) {
    return [];
  }

  const { t, o, h, l, c } = data;
  const length = Math.min(t.length, o.length, h.length, l.length, c.length);

  return Array.from({ length }, (_, i) => ({
    time: t[i],
    open: +o[i],
    high: +h[i],
    low: +l[i],
    close: +c[i],
  }));
};

const VaultChart = ({ data }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!data || data.s !== 'ok') {
      return;
    }

    let chart;
    const candles = transformDataToCandles(data);

    if (candles.length === 0) {
      return;
    }

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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-[400px] min-h-[300px] md:min-h-[400px]" />;
};

export default VaultChart;
