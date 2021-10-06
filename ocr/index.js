const assert = require('assert');
const qs = require('querystring');
const { post, ensureStatusCode, readStream } = require('tiny-network');

const { T12306_OCR_API = `https://12306-ocr.pjialin.com/check/` } = process.env;

module.exports = img => {
  const payload = qs.stringify({ img });
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;',
  };
  return Promise
    .resolve()
    .then(() => post(T12306_OCR_API, payload, headers))
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