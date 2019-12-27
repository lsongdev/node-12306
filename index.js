const {
  get, post,
  cookieJar,
  readStream,
  ensureStatusCode,
} = require('tiny-network');
const assert = require('assert');
const qs = require('querystring');
const ocr = require('./ocr');
const pkg = require('./package');
const stations = require('./stations').split('@');

const ensureResultCode = code => {
  return res => {
    const { result_code, result_message } = res;
    assert.equal(result_code, code, result_message);
    return res;
  };
};

const handleResponse = res => {
  const err = new Error(res.message);
  err.response = res;
  assert.ok(res.status, err);
  assert.equal(res.httpstatus, 200, err);
  return res.data;
};

const getStationCode = stationKey => {
  var arr;
  for (var i = 1, l = stations.length; i < l; i++) {
    arr = stations[i].split('|');
    if (arr.indexOf(stationKey) > -1) {
      return [arr[1], arr[2]];
    }
  }
  return null;
};

const HOST = 'kyfw.12306.cn';
const BASE = `https://${HOST}`

const T12306 = options => {
  const ua = `${pkg.name}/${pkg.version}`;
  const jar = cookieJar({
    BIGipServerpool_passport: '250413578.50215.0000',
    RAIL_EXPIRATION: 1577751973325,
    RAIL_DEVICEID: 'E98oskrK3jsqAvM0NiP8sHxTBm8pX9Cuz86Ur44EeXIrtYiZEXC2b7qzHQ2OtXk1leKUAT3CQZVC7NK_rXyUFpagCrfmIVJArwxvQczD_sxy6zSuGwr6846j8zf1Sz0FhuXtKTgfpZhr-MqB2JKXwaTgttze1WwP',
  });
  const useHeaders = headers => {
    return Object.assign({
      'cookie': jar.cookie,
      'user-agent': ua,
      'content-type': 'application/x-www-form-urlencoded',
    }, headers);
  };
  return {
    /**
     * query
     * @param {*} from 
     * @param {*} to 
     * @param {*} date 
     * @param {*} purpose_codes 
     */
    query(from, to, date, purpose_codes = 'ADULT') {
      const define = {
        '车次': 3,
        '出发站': 6,
        '目的地': 7,
        '出发时间': 8,
        '到达时间': 9,
        '消耗时间': 10,
        '一等座': 31,
        '二等座': 30,
        '软卧': 23,
        '硬卧': 28,
        '硬座': 29,
        '无座': 26
      };
      const parse = line => {
        const a = line.split('|');
        const c = decodeURIComponent(a[0]);
        const d = c.replace('\n', '');
        const e = Buffer.from(d, 'base64');
        return Object.keys(define).reduce((obj, name) => {
          const index = define[name];
          obj[name] = a[index];
          return obj;
        }, {});
      };
      const query = qs.stringify({
        'leftTicketDTO.train_date': date,
        'leftTicketDTO.from_station': from,
        'leftTicketDTO.to_station': to,
        purpose_codes,
      });
      const headers = ({
        'user-agent': ua,
        'cookie': `_jc_save_fromDate=;`
      });
      return Promise
        .resolve()
        .then(() => get(`${BASE}/otn/leftTicket/queryZ?${query}`, headers))
        .then(ensureStatusCode(200))
        .then(readStream)
        .then(JSON.parse)
        .then(handleResponse)
        .then(res => {
          const { map, result } = res;
          return result.map(parse)
        })
    },
    /**
     * captcha_image
     */
    captcha_image() {
      const headers = useHeaders();
      const url = `${BASE}/passport/captcha/captcha-image64?login_site=E&module=login&rand=sjrand&_=` + Date.now();
      return Promise
        .resolve()
        .then(() => get(url, headers))
        .then(ensureStatusCode(200))
        .then(jar.saveCookie)
        .then(readStream)
        .then(JSON.parse)
        .then(ensureResultCode(0))
        .then(res => res.image)
    },
    /**
     * captcha_check
     * @param {*} answer 
     */
    captcha_check(answer) {
      const headers = useHeaders();
      const url = `${BASE}/passport/captcha/captcha-check?answer=${answer}&rand=sjrand&login_site=E&_=` + Date.now();
      return Promise
        .resolve()
        .then(() => get(url, headers))
        .then(ensureStatusCode(200))
        .then(readStream)
        .then(JSON.parse)
        .then(ensureResultCode(4))
    },
    /**
     * captcha_recognize
     * @param {*} img 
     */
    captcha_recognize(img) {
      const index2point = {
        1: [45, 50],
        2: [115, 50],
        3: [187, 50],
        4: [264, 50],
        5: [41, 115],
        6: [118, 113],
        7: [196, 115],
        8: [255, 115],
      };
      return Promise
        .resolve()
        .then(() => ocr(img))
        .then(pos => pos.reduce((result, index) => result.concat(index2point[index]), []));
    },
    /**
     * login
     * @param {*} username 
     * @param {*} password 
     * @param {*} answer 
     */
    login(username, password, answer) {
      const headers = useHeaders();
      const payload = qs.stringify({
        username,
        password,
        answer,
        appid: 'otn'
      });

      return Promise
        .resolve()
        .then(() => post(`${BASE}/passport/web/login`, payload, headers))
        .then(ensureStatusCode(200))
        .then(jar.saveCookie)
        .then(readStream)
        .then(JSON.parse)
        .then(ensureResultCode(0))
        .then(res => res.uamtk)
    },
    logdevice() {
      const url = `https://kyfw.12306.cn/otn/HttpZF/logdevice`;
      // https://kyfw.12306.cn/otn/HttpZF/logdevice?
      // algID=iN8cl0mHxH
      // hashCode=4PbYREhjsrYtIAohPxC7F4PUpoaNqBWSvN66pXU00po
      // FMQw=0
      // q4f3=en-US
      // VPIf=1
      // custID=133
      // VEek=unknown
      // dzuS=0
      // yD16=0
      // EOQP=c227b88b01f5c513710d4b9f16a5ce52
      // lEnu=3232236206
      // jp76=52d67b2a5aa5e031084733d5006cc664
      // hAqN=MacIntel
      // platform=WEB
      // ks0Q=d22ca0b81584fbea62237b14bd04c866
      // TeRS=864x1920
      // tOHY=24xx1080x1920
      // Fvje=i1l1o1s1
      // q5aJ=-8
      // wNLf=99115dfb07133750ba677d055874de87
      // 0aew=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.6900.0 Safari/537.36
      // E3gR=f4e3b7b14cc647e30a6267028ad54c56
      // timestamp=1577356332179
      const headers = useHeaders();
      return Promise
        .resolve()
        .then(() => get(url, headers))
        .then(ensureStatusCode(200))
        .then(readStream)
        .then(res => res.toString())
        .then(str => str.slice(18, -2))
        .then(JSON.parse)
    },
    /**
     * auth_uamtk
     */
    auth_uamtk() {
      const payload = qs.stringify({ appid: 'otn' });
      const headers = useHeaders({
        'Origin': 'https://kyfw.12306.cn',
        'Referer': 'https://kyfw.12306.cn/otn/passport?redirect=/otn/login/userLogin',
      });
      return Promise
        .resolve()
        .then(() => post(`${BASE}/passport/web/auth/uamtk`, payload, headers))
        .then(ensureStatusCode(200))
        .then(jar.saveCookie)
        .then(readStream)
        .then(JSON.parse)
        .then(ensureResultCode(0))
        .then(res => res.newapptk)
    },
    /**
     * uamauthclient
     * @param {*} tk 
     */
    uamauthclient(tk) {
      const headers = useHeaders();
      const payload = qs.stringify({ tk });
      return Promise
        .resolve()
        .then(() => post(`${BASE}/otn/uamauthclient`, payload, headers))
        .then(ensureStatusCode(200))
        .then(jar.saveCookie)
        .then(readStream)
        .then(JSON.parse)
        .then(ensureResultCode(0))
    },
    /**
     * getPassengerDTOs
     */
    getPassengerDTOs() {
      const headers = useHeaders();
      const payload = qs.stringify({});
      return Promise
        .resolve()
        .then(() => post(`${BASE}/otn/confirmPassenger/getPassengerDTOs`, payload, headers))
        .then(ensureStatusCode(200))
        .then(readStream)
        .then(JSON.parse)
        .then(handleResponse)
        .then(res => res.normal_passengers)
    },
    /**
     * submitOrderRequest
     */
    submitOrderRequest({ from, to }, { date, backDate }) {
      const headers = useHeaders();
      const payload = qs.stringify({
        secretStr: '',
        train_date: date, // 出发时间
        back_train_date: backDate, // 返程时间
        tour_flag: 'dc', // 旅途类型
        purpose_codes: 'ADULT', // 成人 | 学生
        query_from_station_name: from,
        query_to_station_name: to,
      });
      return Promise
        .resolve()
        .then(() => post(`${BASE}/otn/leftTicket/submitOrderRequest`, payload, headers))
        .then(ensureStatusCode(200))
        .then(readStream)
        .then(JSON.parse)
        .then(ensureResultCode(0))
    },
    checkOrderInfo() {
      return `${BASE}/otn/confirmPassenger/checkOrderInfo`;
    },
    getQueueCount() {
      return `${BASE}/otn/confirmPassenger/getQueueCount`;
    },
    confirmSingleForQueue() {
      return `${BASE}/otn/confirmPassenger/confirmSingleForQueue`;
    },
    queryOrderWaitTime() {
      return `${BASE}/otn/confirmPassenger/queryOrderWaitTime`;
    }
  };
};

module.exports = T12306;