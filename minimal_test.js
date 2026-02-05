const { get, readStream, ensureStatusCode } = require('tiny-network');
const qs = require('querystring');

// 测试最小化头部参数
const HOST = 'kyfw.12306.cn';
const BASE = `https://${HOST}`;

const testMinimalHeaders = async (from, to, date, purpose_codes = 'ADULT') => {
  const query = qs.stringify({
    'leftTicketDTO.train_date': date,
    'leftTicketDTO.from_station': from,
    'leftTicketDTO.to_station': to,
    purpose_codes,
  });

  // 测试不同的头部组合
  const headerSets = [
    {
      name: 'Only User-Agent',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
      }
    },
    {
      name: '+ Accept',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    },
    {
      name: '+ X-Requested-With',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    },
    {
      name: '+ Referer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${BASE}/otn/leftTicket/init`
      }
    }
  ];

  for (const headerSet of headerSets) {
    console.log(`Testing: ${headerSet.name}`);
    try {
      const response = await get(`${BASE}/otn/leftTicket/queryG?${query}`, headerSet.headers);
      
      // 检查状态码
      try {
        ensureStatusCode(200)(response);
      } catch (e) {
        console.log(`  ✗ Status code error: ${e.message}`);
        continue;
      }

      // 读取响应数据
      const dataBuffer = await readStream(response);
      const dataStr = dataBuffer.toString();
      
      try {
        const jsonData = JSON.parse(dataStr);
        
        if(jsonData && jsonData.data && jsonData.data.result) {
          console.log(`  ✓ Success with ${headerSet.name}! Found ${jsonData.data.result.length} trains`);
          console.log(`  Headers used:`, Object.keys(headerSet.headers));
          return { success: true, headers: headerSet.headers, result: jsonData.data.result };
        } else {
          console.log(`  ✗ Response not in expected format`);
          continue;
        }
      } catch (e) {
        console.log(`  ✗ JSON parse error: ${e.message}`);
        console.log(`  Raw response: ${dataStr.substring(0, 100)}...`);
        continue;
      }
    } catch (error) {
      console.log(`  ✗ Error with ${headerSet.name}: ${error.message}`);
      continue;
    }
  }
  
  console.log('All header combinations failed');
  return { success: false };
};

(async () => {
  console.log('Testing minimal headers for 12306 API...\n');
  const result = await testMinimalHeaders('BJP', 'SHH', '2026-02-05');
  
  if (result.success) {
    console.log('\n✓ Found working minimal header set!');
  } else {
    console.log('\n✗ No minimal header set worked, need more headers...');
  }
})();