const assert = require('assert');
const test = require('./test');
const t12306 = require('..');

(async () => {

  const train = t12306();

  await test('12306#query', async () => {
    const list = await train.query('BJP', 'SHH', '2021-10-06');
    assert.ok(Array.isArray(list));
  });

  var img, pos;

  await test('12306#captcha_image', async () => {
    img = await train.captcha_image();
  });

  await test('12306#captcha_recognize', async () => {
    pos = await train.captcha_recognize(img);
    assert.ok(Array.isArray(pos));
  });

  // await test('12306#captcha_check', async () => {
  //   await train.captcha_check(pos);
  // });

  // await test('12306#login', async () => {
  //   const uamtk = await train.login('song940', 'lsong940', pos);
  //   const newapptk = await train.auth_uamtk(uamtk);
  //   const { username, apptk } = await train.uamauthclient(newapptk);
  //   console.log(username);
  // });

  // await test('12306#passengers', async () => {
  //   const passengers = await train.getPassengerDTOs();
  //   assert.ok(Array.isArray(passengers));
  // });

})();