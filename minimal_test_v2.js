const { get, readStream, ensureStatusCode, cookieJar } = require('tiny-network');
const qs = require('querystring');

// 测试包含cookies的最小化头部参数
const HOST = 'kyfw.12306.cn';
const BASE = `https://${HOST}`;

const testWithCookies = async (from, to, date, purpose_codes = 'ADULT') => {
  const query = qs.stringify({
    'leftTicketDTO.train_date': date,
    'leftTicketDTO.from_station': from,
    'leftTicketDTO.to_station': to,
    purpose_codes,
  });

  // 创建一个带有基础cookies的jar
  const jar = cookieJar({
    '_jc_save_fromDate': date,
    '_jc_save_toDate': date,
    '_jc_save_fromStation': `${encodeURIComponent('北京')},BJP`,
    '_jc_save_toStation': `${encodeURIComponent('上海')},SHH`,
    '_jc_save_wfdc_flag': 'dc'
  });

  const headerSets = [
    {
      name: 'Basic cookies + minimal headers',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${BASE}/otn/leftTicket/init`,
        'cookie': jar.cookie
      }
    },
    {
      name: 'More specific referer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${BASE}/otn/leftTicket/init?linktypeid=dc&fs=%E5%8C%97%E4%BA%AC,BJP&ts=%E4%B8%8A%E6%B5%B7,SHH&date=${date}&flag=N,N,Y`,
        'cookie': jar.cookie
      }
    }
  ];

  for (const headerSet of headerSets) {
    console.log(`Testing: ${headerSet.name}`);
    try {
      const response = await get(`${BASE}/otn/leftTicket/queryG?${query}`, headerSet.headers);
      
      // 检查状态码 - 现在允许302，因为可能需要重定向处理
      let actualResponse = response;
      try {
        ensureStatusCode(200)(actualResponse);
      } catch (e) {
        if (response.statusCode === 302) {
          console.log(`  Got redirect, trying with redirect handling...`);
          // For 302 redirects, we might need to follow them
          continue;
        } else {
          console.log(`  ✗ Status code error: ${e.message}`);
          continue;
        }
      }

      // 读取响应数据
      const dataBuffer = await readStream(actualResponse);
      const dataStr = dataBuffer.toString();
      
      try {
        const jsonData = JSON.parse(dataStr);
        
        if(jsonData && jsonData.data && jsonData.data.result) {
          console.log(`  ✓ Success with ${headerSet.name}! Found ${jsonData.data.result.length} trains`);
          console.log(`  Headers used:`, Object.keys(headerSet.headers));
          return { success: true, headers: headerSet.headers, result: jsonData.data.result };
        } else if (jsonData.status === true && jsonData.data?.result) {
          console.log(`  ✓ Success with ${headerSet.name}! Found ${jsonData.data.result.length} trains`);
          console.log(`  Headers used:`, Object.keys(headerSet.headers));
          return { success: true, headers: headerSet.headers, result: jsonData.data.result };
        } else {
          console.log(`  ✗ Response not in expected format`);
          console.log(`  Response keys:`, Object.keys(jsonData));
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
  console.log('Testing headers with cookies for 12306 API...\n');
  const result = await testWithCookies('BJP', 'SHH', '2026-02-05');
  
  if (result.success) {
    console.log('\n✓ Found working header set!');
  } else {
    console.log('\n✗ No header set worked...');
  }
})();