import { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';

const transformDataToCandles = ohlcvData => {
  if (!ohlcvData || !Array.isArray(ohlcvData) || ohlcvData.length === 0) {
    return [];
  }

  return ohlcvData.map(point => ({
    time: point.time,
    open: +point.open,
    high: +point.high,
    low: +point.low,
    close: +point.close,
  }));
};

const ChartSkeleton = () => (
  <div className="w-full min-h-[260px] md:min-h-[320px] rounded-lg border border-steel-800/50 bg-steel-900/40">
    <div className="h-[260px] md:h-[320px] w-full animate-pulse bg-gradient-to-r from-steel-800/60 via-steel-900/60 to-steel-800/60" />
  </div>
);

const VaultChart = ({ ohlcvData, isLoading, isNotFound }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!ohlcvData || !Array.isArray(ohlcvData) || ohlcvData.length === 0) {
      return;
    }

    let chart;
    const candles = transformDataToCandles(ohlcvData);

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
  }, [ohlcvData]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isNotFound || !ohlcvData || !Array.isArray(ohlcvData) || ohlcvData.length === 0) {
    return (
      <div className="w-full min-h-[260px] md:min-h-[320px] rounded-lg border border-steel-800/50 bg-steel-900/40 flex items-center justify-center text-dark-100 text-sm">
        No chart data available for this vault yet
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-steel-800/50 bg-steel-900/40">
      <div ref={chartContainerRef} className="w-full min-h-[260px] md:min-h-[320px]" />
    </div>
  );
};

export default VaultChart;
