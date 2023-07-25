// dataCollection.js

// Import the axios library
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const collectedData = []; // This array will store the collected data

// Connect to the database (if the file doesn't exist, it will be created)
const db = new sqlite3.Database('crypto_prices.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the database.');
    // Create a table to store the cryptocurrency price data
    createTable();
  }
});

// Inside the createTable function
function createTable() {
  console.log('Creating or checking the crypto_prices table...');

  // List of columns to be added
  const columnsToAdd = [
    "fully_diluted_valuation REAL",
    "high_24h REAL",
    "low_24h REAL",
    "price_change_24h REAL",
    "price_change_percentage_24h REAL",
    "market_cap_change_24h REAL",
    "market_cap_change_percentage_24h REAL",
    "circulating_supply REAL",
    "total_supply REAL",
    "max_supply REAL",
    "ath REAL",
    "ath_change_percentage REAL",
    "ath_date TEXT",
    "atl REAL",
    "atl_change_percentage REAL",
    "atl_date TEXT",
    "roi_times REAL",
    "roi_currency TEXT",
    "roi_percentage REAL",
    "last_updated TEXT",
  ];

  // Fetch the table's schema to check if the columns exist
  db.all("PRAGMA table_info(crypto_prices);", (err, rows) => {
    if (err) {
      console.error('Error fetching table schema:', err.message);
      return;
    }

    // Get the names of existing columns
    const existingColumns = rows.map((row) => row.name);

    // Iterate through each column and add it if it doesn't already exist
    columnsToAdd.forEach((column) => {
      const columnName = column.split(" ")[0];
      if (!existingColumns.includes(columnName)) {
        const addColumnQuery = `ALTER TABLE crypto_prices ADD COLUMN ${column};`;
        db.exec(addColumnQuery, (err) => {
          if (err) {
            console.error('Error altering table:', err.message);
          } else {
            console.log(`Column '${columnName}' added successfully.`);
          }
        });
      } else {
        console.log(`Column '${columnName}' already exists.`);
      }
    });
  });
}

function fetchDataAndInsert() {
  const symbols = 'bitcoin,ethereum,ethereum-2,ethereum-classic,litecoin,cardano,solana,stellar,storj,loopring,shiba-inu,dai,monero,usd-coin,dogecoin,polkadot,zcash,ankr,bittorrent,filecoin,internet-computer';
  const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbols}`;

  axios.get(apiUrl)
    .then(response => {
      // Handle the successful response
      const data = response.data;
      console.log(data);
      // Insert the data into the database
      insertData(data);
    })
    .catch(error => {
      // Handle any errors
      console.error(`An error occurred while fetching data: ${error}`);
    });
}

// Define the function to insert data into the database
function insertData(data) {
  const insertQuery = `
    INSERT INTO crypto_prices (name, symbol, price, market_cap, volume, timestamp,
      fully_diluted_valuation, high_24h, low_24h, price_change_24h, price_change_percentage_24h,
      market_cap_change_24h, market_cap_change_percentage_24h, circulating_supply, total_supply, max_supply,
      ath, ath_change_percentage, ath_date, atl, atl_change_percentage, atl_date, roi_times, roi_currency,
      roi_percentage, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  data.forEach(crypto => {
    const { name, symbol, current_price, market_cap, total_volume, last_updated,
      fully_diluted_valuation, high_24h, low_24h, price_change_24h, price_change_percentage_24h,
      market_cap_change_24h, market_cap_change_percentage_24h, circulating_supply, total_supply, max_supply,
      ath, ath_change_percentage, ath_date, atl, atl_change_percentage, atl_date, roi } = crypto;
    
    console.log(`Inserting data for ${name} (${symbol})`);

    db.run(insertQuery, [name, symbol, current_price, market_cap, total_volume, last_updated,
      fully_diluted_valuation, high_24h, low_24h, price_change_24h, price_change_percentage_24h,
      market_cap_change_24h, market_cap_change_percentage_24h, circulating_supply, total_supply, max_supply,
      ath, ath_change_percentage, ath_date, atl, atl_change_percentage, atl_date,
      roi ? roi.times : null, roi ? roi.currency : null, roi ? roi.percentage : null], (err) => {
        if (err) {
          console.error('Error inserting data:', err.message);
        } else {
          console.log(`Data for ${name} (${symbol}) inserted successfully.`);
        }
      });
  });
  
  // Store the data in the collectedData array
  collectedData.push(data);
}

// Set the interval to fetch and insert data every 5 minutes (300,000 milliseconds)
const intervalInMilliseconds = 5 * 60 * 1000;
setInterval(fetchDataAndInsert, intervalInMilliseconds);

// Close the database connection when finished
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = {
  collectedData,
  collectData: fetchDataAndInsert // Export fetchDataAndInsert as collectData
};