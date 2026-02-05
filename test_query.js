const T12306 = require('./index.js');

// 创建实例并尝试查询
const train = T12306();

// 测试查询
console.log('Querying trains for:', '2026-02-05');
train.query('BJP', 'SHH', '2026-02-05')
  .then(data => {
    console.log('Success:', data);
  })
  .catch(err => {
    console.error('Error details:');
    console.error('Message:', err.message);
    if (err.response) {
      console.error('Response object:', err.response);
    }
    console.error('Stack:', err.stack);
  });