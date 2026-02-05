/**
 * Example: Find available trains in the next 14 days
 * Particularly useful for finding seats on busy routes like Friday evenings
 */

const T12306 = require('../index.js');

/**
 * Search for available seats in the next 14 days
 * @param {string} from - Starting station code
 * @param {string} to - Destination station code
 * @param {number} hoursThreshold - Minimum hour for filtering (e.g., 18 for evening trains)
 */
async function findAvailableTrains(from = 'QIP', to = 'OKP', hoursThreshold = 18) {
  const train = T12306();
  
  console.log(`Searching for trains from ${from} to ${to} in the next 14 days with departures after ${hoursThreshold}:00...`);
  
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      const allTrains = await train.query(from, to, dateStr);
      
      // Filter for trains departing after specified hour with available seats
      const trainsWithSeats = allTrains.filter(train => {
        const [hours] = train['出发时间'].split(':').map(Number);
        const hasSeats = train['二等座'] !== '无' || 
                        train['一等座'] !== '无' || 
                        (train['无座'] !== '无' && train['无座'] !== '');
        return hours >= hoursThreshold && hasSeats;
      });
      
      if (trainsWithSeats.length > 0) {
        console.log(`\n🎉 Found ${trainsWithSeats.length} train(s) on ${dateStr} (${date.toLocaleDateString('zh-CN', {weekday: 'long'})}):`);
        
        trainsWithSeats.forEach(train => {
          console.log(`   🚄 ${train['车次']} ${train['出发时间']}-${train['到达时间']} | 1st-${train['一等座']}, 2nd-${train['二等座']}, Standing-${train['无座']}`);
        });
      }
    } catch (error) {
      console.error(`Error querying ${dateStr}:`, error.message);
    }
  }
  
  console.log('\nSearch completed.');
}

// If run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const from = args[0] || 'QIP';  // Qinghe
  const to = args[1] || 'OKP';    // Xiahuayuanbei
  const hour = args[2] ? parseInt(args[2]) : 18;  // After 18:00
  
  findAvailableTrains(from, to, hour).catch(console.error);
}

module.exports = findAvailableTrains;