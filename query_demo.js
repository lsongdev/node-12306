const T12306 = require('./index.js');

async function testQueries() {
  const train = T12306();
  
  const queries = [
    { from: 'BJP', to: 'SHH', desc: '北京->上海' },
    { from: 'GZQ', to: 'SZQ', desc: '广州->深圳' },
    { from: 'BJP', to: 'GZQ', desc: '北京->广州' },
    { from: 'CDW', to: 'CTW', desc: '成都->重庆' }
  ];
  
  for (const query of queries) {
    console.log(`\n查询 ${query.desc} (${query.from} -> ${query.to}):`);
    try {
      const result = await train.query(query.from, query.to, '2026-02-05');
      console.log(`  找到 ${result.length} 趟列车`);
      
      if (result.length > 0) {
        // 显示前两趟列车的详细信息
        result.slice(0, 2).forEach(train => {
          console.log(`  - ${train['车次']}: ${train['出发时间']}-${train['到达时间']} (${train['消耗时间']})`);
          console.log(`    座位: 一等座-${train['一等座']}, 二等座-${train['二等座']}, 无座-${train['无座']}`);
        });
      }
    } catch (error) {
      console.log(`  查询失败: ${error.message}`);
    }
  }
}

testQueries().catch(console.error);