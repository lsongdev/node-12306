const T12306 = require('..');

(async () => {
  const train = T12306();
  const list = await train.query('BJP', 'SHH', '2021-10-07');
  console.log(list);
})();