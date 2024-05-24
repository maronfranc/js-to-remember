export interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function generateCandlesticks(size: number = 50): CandlestickData[] {
  const initialValue = Number((Math.random() * 1_000).toFixed(2));
  const initialCandle: CandlestickData = {
    date: new Date(0),
    open: initialValue,
    high: generateGreaterValue(initialValue),
    low: generateGreaterValue(initialValue),
    close: generateValue(initialValue),
    volume: parseInt(String(Math.random() * 100), 10),
  }

  let previousCandle: CandlestickData = initialCandle;
  const candlesticks: CandlestickData[] = [];
  for (let i = 0; i < size; i++) {
    const candle = generateNextCandle(previousCandle);
    candlesticks.push(candle);
    previousCandle = candle;
  }

  return candlesticks;
}

function generateNextCandle(previousCandle: CandlestickData): CandlestickData {
  const open = previousCandle.close;
  return {
    date: generateNextDay(previousCandle.date),
    open,
    high: generateGreaterValue(open),
    low: generateLowerValue(open),
    close: generateValue(open),
    volume: parseInt(String(Math.random() * 100), 10),
  }
}

function generateGreaterValue(value: number): number {
  const valueToSum = Number(Math.random() * 10);
  return toDecimals(value + valueToSum);
}

function generateLowerValue(value: number): number {
  const valueToSubtract = Number(Math.random() * 10);
  return toDecimals(value - valueToSubtract);
}

function generateValue(value: number): number {
  const valueToChange = Number((Math.random() * 10));
  const rngTen = Math.random() * 10;
  if (rngTen < 5) return toDecimals(value - valueToChange);
  else return toDecimals(value + valueToChange);
}

function generateNextDay(date: Date): Date {
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  return new Date(date.getTime() + DAY_IN_MS);
}

function toDecimals(value: number): number {
  return Number(value.toFixed(2));
}
