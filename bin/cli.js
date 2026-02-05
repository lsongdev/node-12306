#!/usr/bin/env node

const Train = require('../index.js');
const fs = require('fs');
const path = require('path');

// Command line arguments
const args = process.argv.slice(2);

function showHelp() {
  console.log(`
12306 Train Query CLI

Usage:
  node bin/cli.js [options]

Options:
  --from <station_code>    Departure station code (default: BJQ for Beijing)
  --to <station_code>      Arrival station code (default: SHH for Shanghai)  
  --date <date>            Travel date (YYYY-MM-DD, default: tomorrow)
  --help                   Show this help message

Examples:
  node bin/cli.js --from BJQ --to SHH --date 2026-02-06
  node bin/cli.js --from QIP --to OKP --date 2026-02-06
  `);
}

// Parse arguments
const argv = {};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--help') {
    showHelp();
    process.exit(0);
  } else if (arg.startsWith('--')) {
    const key = arg.substring(2);
    if (args[i + 1] && !args[i + 1].startsWith('--')) {
      argv[key] = args[i + 1];
      i++;
    } else {
      argv[key] = true;
    }
  }
}

async function run() {
  try {
    // Initialize train client
    const Train = require('../index.js');
    const train = Train();

    // Set defaults
    let fromStation = argv.from || 'BJQ'; // Beijing
    let toStation = argv.to || 'SHH';     // Shanghai
    
    let targetDate;
    if (argv.date) {
      targetDate = new Date(argv.date);
    } else {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = tomorrow;
    }

    // Format date as YYYY-MM-DD
    const formattedDate = targetDate.toISOString().split('T')[0];

    console.log(`Querying train schedule:`);
    console.log(`  From: ${fromStation}`);
    console.log(`  To: ${toStation}`);  
    console.log(`  Date: ${formattedDate}`);
    console.log('');

    // Perform the actual query
    console.log('Querying 12306 for available trains...');
    const result = await train.query(fromStation, toStation, formattedDate);
    
    if (result && result.length > 0) {
      console.log(`\nFound ${result.length} trains:`);
      console.log('------------------------------------------------------------');
      result.forEach(train => {
        console.log(`${train['车次']} | ${train['出发站']}-${train['目的地']} | ${train['出发时间']}-${train['到达时间']} | ${train['消耗时间']}`);
        console.log(`  座位: 一等座(${train['一等座']}) 二等座(${train['二等座']}) 软卧(${train['软卧']}) 硬卧(${train['硬卧']}) 硬座(${train['硬座']}) 无座(${train['无座']})`);
        console.log('');
      });
    } else {
      console.log('No trains found for the given route and date.');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the CLI
run();