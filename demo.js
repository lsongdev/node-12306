const T12306 = require('./index.js');

(async () => {
  console.log('12306 API Demo');
  console.log('=============');

  const train = T12306();

  try {
    // 查询北京到上海的列车
    console.log('\n查询北京(北京站)到上海(上海虹桥)的列车:');
    const trains = await train.query('BJP', 'AOH', '2026-02-05');
    
    console.log(`找到 ${trains.length} 趟列车:\n`);
    
    // 显示前几趟列车的信息
    trains.slice(0, 5).forEach(train => {
      console.log(`车次: ${train['车次']}`);
      console.log(`  出发站: ${train['出发站']} -> 目的地: ${train['目的地']}`);
      console.log(`  出发时间: ${train['出发时间']} -> 到达时间: ${train['到达时间']}`);
      console.log(`  行程时间: ${train['消耗时间']}`);
      console.log(`  座位情况: 一等座-${train['一等座']}, 二等座-${train['二等座']}, 硬座-${train['硬座']}, 无座-${train['无座']}`);
      console.log('');
    });
  } catch (error) {
    console.error('查询失败:', error.message);
  }
})();