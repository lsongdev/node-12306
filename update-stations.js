#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

const STATIONS_URL = 'https://kyfw.12306.cn/otn/resources/js/framework/station_name.js';

async function downloadStations() {
  return new Promise((resolve, reject) => {
    https.get(STATIONS_URL, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function updateStationsFile() {
  try {
    console.log('正在下载最新的车站数据...');
    const data = await downloadStations();
    
    // Extract the station data from the JavaScript file
    const match = data.match(/'([^']+)'/);
    let stationData = '';
    
    if (match) {
      stationData = match[1]; // Get the content inside the quotes
    } else {
      // If no quoted content found, use the whole content
      stationData = data.replace(/module\.exports\s*=\s*/, '').trim();
    }
    
    // Create the new stations.js file content
    const newContent = `/**\n * source code: ${STATIONS_URL}\n */\nmodule.exports = '${stationData}';\n`;
    
    // Write to stations.js
    fs.writeFileSync('./stations.js', newContent);
    
    console.log('车站数据已更新！');
    
    // Count stations
    const stationCount = stationData.split('@').length - 1;
    console.log(`共 ${stationCount} 个车站`);
    
  } catch (error) {
    console.error('更新车站数据时出错:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateStationsFile();
}

module.exports = updateStationsFile;