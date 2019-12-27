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

### Contributing
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