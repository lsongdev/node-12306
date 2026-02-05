## 12306 [![t12306](https://img.shields.io/npm/v/t12306.svg)](https://npmjs.org/t12306)

> 12306 javascript client

### Installation

```bash
$ npm install t12306
```

### Example

```js
const T12306 = require('t12306');

const train = T12306();

(async () => {
  
  const list = await train.query('BJP', 'SHH', '2019-12-28');
  const img = await train.captcha_image();
  const pos = await train.captcha_recognize(img);
  const res = await train.captcha_check(pos);
  const uamtk = await train.login('admin', 'admin', pos);
  const newapptk = await train.auth_uamtk(uamtk);
  const { username, apptk } = await train.uamauthclient(newapptk);
  const passengers = await train.getPassengerDTOs();

})();
```

### Examples

Check out the [example](./example) directory for practical usage examples:

- `friday-evening-trains.js` - Query evening trains from Qinghe (QIP) to Xiayuanbei (OKP) after 18:00
- `find-available-trains.js` - Search for available seats in the next 14 days

Run examples:
```bash
# Query evening trains on a specific date
node example/friday-evening-trains.js 2026-02-05

# Find available trains after 19:00 from Qinghe to Xiayuanbei
node example/find-available-trains.js QIP OKP 19
```

## Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

This work is licensed under the [MIT license](./LICENSE).

---