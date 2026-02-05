/**
 * Example: Query Friday evening trains from Qinghe (QIP) to Xiayuanbei (OKP)
 * Useful for weekly commute from Lichengqiao area to lower garden area
 */

const T12306 = require('../index.js');

async function queryFridayEveningTrains(date = new Date().toISOString().split('T')[0]) {
  const train = T12306();
  
  console.log(`Querying trains from Qinghe (QIP) to Xiayuanbei (OKP) on ${date}:`);
  
  try {
    const allTrains = await train.query('QIP', 'OKP', date);
    
    // Filter for trains departing after 18:00
    const eveningTrains = allTrains.filter(train => {
      const [hours, minutes] = train['出发时间'].split(':').map(Number);
      return hours >= 18;
    });
    
    console.log(`Found ${allTrains.length} total trains, ${eveningTrains.length} after 18:00:`);
    
    if (eveningTrains.length > 0) {
      // Sort by departure time
      eveningTrains.sort((a, b) => {
        const [aHour, aMin] = a['出发时间'].split(':').map(Number);
        const [bHour, bMin] = b['出发时间'].split(':').map(Number);
        return (aHour * 60 + aMin) - (bHour * 60 + bMin);
      });
      
      eveningTrains.forEach((train, index) => {
        const hasSeats = train['二等座'] !== '无' || train['一等座'] !== '无' || train['无座'] !== '无' && train['无座'] !== '';
        const seatStatus = hasSeats ? '🟢' : '🔴';
        
        console.log(`${seatStatus} ${index + 1}. ${train['车次']} | ${train['出发时间']}-${train['到达时间']} | ${train['消耗时间']}`);
        console.log(`     Seats: 1st class-${train['一等座']}, 2nd class-${train['二等座']}, Standing-${train['无座']}`);
        console.log('');
      });
    } else {
      console.log('No evening trains found after 18:00');
    }
    
    return eveningTrains;
  } catch (error) {
    console.error('Query failed:', error.message);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const date = args[0] || new Date().toISOString().split('T')[0];
  queryFridayEveningTrains(date).catch(console.error);
}

module.exports = queryFridayEveningTrains;