const assert = require('assert');
const qs = require('querystring');
const { post, ensureStatusCode, readStream } = require('tiny-network');

module.exports = img => {
  const payload = qs.stringify({ img });
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;',
  };
  const url = `http://localhost:8082/check/`;
  // const url = `https://12306-ocr.pjialin.com/check/`;
  return Promise
    .resolve()
    .then(() => post(url, payload, headers))
    .then(ensureStatusCode(200))
    .then(readStream)
    .then(JSON.parse)
    .then(res => {
      const { code = 200 } = res;
      assert.equal(code, 200, res.msg);
      assert.ok(Array.isArray(res.result), res.msg);
      return res.result;
    });
};