<div align="center">
  <br />
  <p>
    <a href="https://updevs-db.js.org"><img src="https://user-images.githubusercontent.com/77716705/131206307-0840de3c-a3f7-48e8-9076-f97d163055c3.png" width="546" alt="up-devs.db" /></a>
  </p>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/up-devs.db"><img src="https://img.shields.io/npm/v/up-devs.db.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/up-devs.db"><img src="https://img.shields.io/npm/dt/up-devs.db.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://github.com/Up-Devs/up-devs.db/issues"><img src="https://img.shields.io/github/issues/Up-Devs/up-devs.db" alt="Github issues"></a>
    <a href="https://github.com/Up-Devs/up-devs.db/pulls"><img src="https://img.shields.io/github/issues-pr/Up-Devs/up-devs.db" alt="Github pull requests" /></a>
    <a href="https://github.com/Up-Devs/up-devs.db/actions"><img src="https://img.shields.io/github/workflow/status/Up-Devs/up-devs.db/Node.js Package" alt="Github build status" /></a>
    <a href="https://github.com/Up-Devs/up-devs.db/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Up-Devs/up-devs.db" alt="Github license" /></a>
    <a href="https://www.codefactor.io/repository/github/Up-Devs/up-devs.db/overview"><img src="https://www.codefactor.io/repository/github/Up-Devs/up-devs.db/badge" alt="CodeFactor rating"></a>
  </p>
</div>

Up-Devs.DB is an useful data-base for your projects. Save your datas in JSON files and MongoDB!

* Easy to use!
* Has extra methods/properties!
* Similar to [Quick.DB](https://www.npmjs.com/package/quick.db)!

## Get Started

* Install the package
```sh-session
npm i up-devs.db
```

* Read our [docs](https://updevs-db.js.org/docs)
* Take a look in our [guide](https://updevs-db.js.org/guide)

## Example

```js
const { MongoDB, JsonDB } = require('up-devs.db');
const db = new MongoDB('mongodb+srv://up-devs/updevs.db', { name: 'up-devs.db', consoleEvents: true })
// or
const db = new JsonDB('updevs-db')

// Setting an object to this database.
db.set('countries', { list: ['Turkey'] }) // 'countries' data: { list: 'Turkey' }

// Pushing an element to this data.
db.push('countries.list', 'USA') // 'countries' data: { list: ['Turkey', 'USA'] }

// Adding to a number to an object.
db.add('countries.count', 206) // 'countries' data: { list: ['Turkey', 'USA'], count: 206  }

// Fetching those datas.
db.fetch('countries.list') // 'countries' data: ['Turkey', 'USA']
db.get('countries.count') // 'countries' data: 206
```

## Support
You can get support for this module in our [<img src="https://user-images.githubusercontent.com/77716705/130312581-8e3406be-0552-43ce-b550-0b444462e15e.png" height="15" width="20" alt="Discord logo"> Discord server](https://discord.gg/PhW2XJa2yy)

<div align="center">
Made by <a href="https://github.com/Up-Devs"><img src="https://user-images.githubusercontent.com/77716705/131206350-6c6e7c66-8fde-43a7-aff7-217d5736d887.png" height="17" width="17" alt="Up Devs"> Up Devs™</a>
</div>
