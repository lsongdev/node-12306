const T12306 = require('..');

(async () => {
  const train = T12306();
  const list = await train.query('BJP', 'SHH');
  console.log(list);
})();
