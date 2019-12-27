const T12306 = require('..');

(async () => {

  const train = T12306();
  const res = await train.logdevice();
  console.log(res);

})();