// dataAnalysis.js

// Function to calculate moving averages for different time periods
function calculateMovingAverages(data, timePeriods) {
  const movingAverages = {};
  timePeriods.forEach((period) => {
    movingAverages[period] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      const average = sum / period;
      movingAverages[period].push(average);
    }
  });
  return movingAverages;
}

// Function to calculate price volatility measures (e.g., standard deviation)
function calculateVolatility(data) {
  const prices = data.map((item) => item.price);
  const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
  const differencesSquared = prices.map((price) => (price - mean) ** 2);
  const variance = differencesSquared.reduce((acc, diff) => acc + diff, 0) / differencesSquared.length;
  const volatility = Math.sqrt(variance);
  return volatility;
}

// Function to analyze correlation between cryptocurrencies' prices
function analyzeCorrelation(data) {
  const prices = data.map((item) => item.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const correlation = (maxPrice - minPrice) / (maxPrice + minPrice);
  return correlation;
}

// Function to implement technical indicators (RSI, MACD, Bollinger Bands)
function calculateTechnicalIndicators(data) {
  // Calculate RSI
  const rsiPeriod = 14;
  const rsiValues = calculateRSI(data.map((item) => item.price), rsiPeriod);

  // Calculate MACD
  const macdShortPeriod = 12;
  const macdLongPeriod = 26;
  const signalPeriod = 9;
  const macdValues = calculateMACD(data.map((item) => item.price), macdShortPeriod, macdLongPeriod, signalPeriod);

  // Calculate Bollinger Bands
  const bbPeriod = 20;
  const bbValues = calculateBollingerBands(data.map((item) => item.price), bbPeriod);

  return {
    rsi: rsiValues,
    macd: macdValues,
    bollingerBands: bbValues,
  };
}

// Function to calculate Relative Strength Index (RSI)
function calculateRSI(prices, period) {
  const rsi = [];
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i++) {
    const priceDiff = prices[i] - prices[i - 1];
    if (priceDiff >= 0) {
      gainSum += priceDiff;
    } else {
      lossSum -= priceDiff;
    }
  }

  let prevAvgGain = gainSum / period;
  let prevAvgLoss = lossSum / period;
  let rs = prevAvgGain / prevAvgLoss;
  rsi.push(100 - 100 / (1 + rs));

  for (let i = period + 1; i < prices.length; i++) {
    const priceDiff = prices[i] - prices[i - 1];
    let avgGain, avgLoss;

    if (priceDiff >= 0) {
      avgGain = (prevAvgGain * (period - 1) + priceDiff) / period;
      avgLoss = (prevAvgLoss * (period - 1)) / period;
    } else {
      avgLoss = (prevAvgLoss * (period - 1) - priceDiff) / period;
      avgGain = (prevAvgGain * (period - 1)) / period;
    }

    prevAvgGain = avgGain;
    prevAvgLoss = avgLoss;
    rs = avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}

// Function to calculate Moving Average Convergence Divergence (MACD)
function calculateMACD(prices, shortPeriod, longPeriod, signalPeriod) {
  const shortEMA = calculateEMA(prices, shortPeriod);
  const longEMA = calculateEMA(prices, longPeriod);
  const macdLine = shortEMA.map((shortEMAValue, index) => shortEMAValue - longEMA[index]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((macdValue, index) => macdValue - signalLine[index]);

  return {
    macdLine,
    signalLine,
    histogram,
  };
}

// Function to calculate Exponential Moving Average (EMA)
function calculateEMA(prices, period) {
  const ema = [];
  const smoothingFactor = 2 / (period + 1);
  ema.push(prices.slice(0, period).reduce((acc, val) => acc + val, 0) / period);

  for (let i = period; i < prices.length; i++) {
    const emaValue = (prices[i] - ema[i - period]) * smoothingFactor + ema[i - period];
    ema.push(emaValue);
  }

  return ema;
}

// Function to calculate Bollinger Bands
function calculateBollingerBands(prices, period) {
  const middleBand = calculateSMA(prices, period);
  const stdDev = calculateStandardDeviation(prices, period);
  const upperBand = middleBand.map((middleValue, index) => middleValue + 2 * stdDev[index]);
  const lowerBand = middleBand.map((middleValue, index) => middleValue - 2 * stdDev[index]);

  return {
    middle: middleBand,
    upper: upperBand,
    lower: lowerBand,
  };
}

// Function to calculate Simple Moving Average (SMA)
function calculateSMA(prices, period) {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    const average = sum / period;
    sma.push(average);
  }
  return sma;
}

// Function to calculate Standard Deviation
function calculateStandardDeviation(prices, period) {
  const sma = calculateSMA(prices, period);
  const differencesSquared = sma.map((smaValue, index) =>
    prices.slice(index - period + 1, index + 1).reduce((acc, val) => acc + (val - smaValue) ** 2, 0) / period
  );
  const stdDev = differencesSquared.map((difference) => Math.sqrt(difference));
  return stdDev;
}

module.exports = {
  calculateMovingAverages,
  calculateVolatility,
  analyzeCorrelation,
  calculateTechnicalIndicators
};