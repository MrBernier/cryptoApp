// app.js

const dataCollection = require('./dataCollection');
const dataAnalysis = require('./dataAnalysis');

// Collect data every 5 minutes (intervalInMilliseconds should match the interval used in dataCollection.js)
const intervalInMilliseconds = 5 * 60 * 1000;
setInterval(dataCollection.collectData, intervalInMilliseconds);  // Changed here

// Analyze data after collecting sufficient historical data
// Assuming you have an array called 'historicalData' with historical prices collected over time
const historicalData = dataCollection.collectedData; // Replace this with the actual historical data

// Calculate moving averages for different time periods (e.g., 7-day, 30-day)
const movingAverageTimePeriods = [7, 30];
const movingAverages = dataAnalysis.calculateMovingAverages(historicalData, movingAverageTimePeriods);
console.log('Moving Averages:', movingAverages);

// Calculate price volatility measures
const volatilityMeasures = dataAnalysis.calculateVolatility(historicalData);
console.log('Volatility Measures:', volatilityMeasures);

// Analyze correlation between cryptocurrencies' prices
const correlationValues = dataAnalysis.analyzeCorrelation(historicalData);
console.log('Correlation Values:', correlationValues);

// Calculate technical indicators (RSI, MACD, Bollinger Bands)
const technicalIndicators = dataAnalysis.calculateTechnicalIndicators(historicalData);
console.log('Technical Indicators:', technicalIndicators);