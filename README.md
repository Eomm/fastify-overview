# fastify-overview

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![ci](https://github.com/Eomm/fastify-overview/actions/workflows/ci.yml/badge.svg)](https://github.com/Eomm/fastify-overview/actions/workflows/ci.yml)
[![runkit](https://img.shields.io/badge/try%20on-runkit-blue)](https://runkit.com/eomm/fastify-overview-readme)

Get a complete overview of your fastify application!  
It gives you a tree structure to understand all the relations between your routes and plugins.

It tracks:

- 🛣 **ALL** the Fastify routes
- 🍱 **ALL** the Fastify plugins
- 🎨 **ALL** the Fastify decorators
- 🪝 **ALL** the Fastify hooks

Doing so you will get a complete overview of your application and you can:

- optimize your code
- optimize your application structure
- find out the application structure (expecially if you have joined a new team)
- automate some documentation tasks

This plugin is intended to be run only for _development_ purposes.

## Install

```
npm install fastify-overview
```


## Usage

This plugin is super simple, just add it to your fastify instance and you will get a `overview()` method that will return a tree structure of your application.

There are 3 things to know:

1. It starts tracking your application after the `await register()` of the plugin:
    - what happens before, it is **not** tracked. So **this plugin must be the first one** to be registered.
    - it the `register` is not awaited, the structure will **not** be tracked.
2. The application structure can be accessed **after** the Fastify instance is `ready`. If you try to get it before the `ready` status, you will get an error.
3. The structure tracks hooks' name and decorators' name. If you use arrow functions the structure will be useless/unreadable.

Here the code:

```js
const fastify = require('fastify')

async function run() {
  const app = fastify()

  // await the plugin registration!
  await app.register(require('fastify-overview'))

  // create your application as usual
  app.addHook('onSend', function hookRoot () {})
  app.register(function register1 (instance, opts, next) {
    instance.addHook('onRequest', function hook1 () {})
    instance.register(function register2 (sub, opts, next) {
      sub.addHook('onRequest', function hook2 () {})
      next()
    })
    next()
  })

  // read your application structure when fastify is ready
  app.addHook('onReady', function showStructure (done) {
    const appStructure = app.overview()
    console.log(JSON.stringify(appStructure, null, 2))
    done(null)
  })

  await app.listen(3000)
}
run()
```

### Structure

The JSON structure returned by the `overview` method is like the following:

```js
{
  "id": 0.331, // an internal id number. You can use it to identify the node
  "name": "pluginName", // the name of the plugin | app.register(function pluginName (){})
  "children": [ // the children of the fastify instance | instance.register(function subPlugin (){})
    // it contains the same structure we are describing
  ], 
  "decorators": { // all the instance decorators | app.decorate('foo-bar', 42)
    "decorate": [ { "name": "foo-bar" } ], // the decorators' name
    "decorateRequest": [], // app.decorateRequest('foo-bar', 42)
    "decorateReply": [] // app.decorateReply('foo-bar', 42)
  },
  "hooks": { // all the instance hooks
    "onRequest": [
      {
        "name": "hook1" // the function name: app.addHook('onRequest', function hook1 (){})
        "hash": "92b002434cd5d8481e7e5562b51df679e2f8d586" // the function hash. Useful to identify optimizations
      }
    ],
    "preParsing": [],
    "preValidation": [],
    "preHandler": [],
    "preSerialization": [],
    "onError": [],
    "onSend": [],
    "onResponse": [],
    "onTimeout": [],
    "onReady": [],
    "onClose": [],
    "onRoute": [],
    "onRegister": []
  },
  "routes": [ // an array within all the routes in that fastify context
    {
      "method": "GET",
      "url": "/prefix/hello", // the complete route's url
      "prefix": "/prefix", // the plugin prefix
      "hooks": { // the hooks that are registered in that single route using the route's options
        "onRequest": [],
        "preParsing": [],
        "preValidation": [
          {
            "name": "Anonymous function",
            "hash": "ade00501a7c8607ba74bf5e13d751da2139c4e60"
          }
        ],
        "preHandler": [
          {
            "name": "hook1",
            "hash": "9398f5df01879094095221d86a544179e62cee12"
          }
        ],
        "preSerialization": [],
        "onError": [],
        "onSend": [],
        "onResponse": [],
        "onTimeout": []
      }
    }
  ]
}
```

Notice that an hook that appears in the parent node, is inherited by the children but it is not listed in the 
children's hooks node.

You can see the previous code output running it on RunKit: [![runkit](https://img.shields.io/badge/try%20on-runkit-blue)](https://runkit.com/eomm/fastify-overview-readme)


## Options

You can pass the following options to the plugin:

```js
app.register(require('fastify-overview'), {
  addSource: true, // default: false
  exposeRoute: true, // default: false
  exposeRouteOptions: {
    method: 'POST', // default: 'GET'
    url: '/customUrl', // default: '/json-overview'
  }
})
```

### addSource

Optionally the plugin adds a `source` property to each node of the tree.
Here an example of the structure with the `addSource` option:

```json
{
  "name": "hook1",
  "hash": "31d31d981f412085927efb5e9f36be8ba905516a",
  "source": {
    "stackIndex": 0,
    "fileName": "test/sources/app.js",
    "lineNumber": 34,
    "columnNumber": 11,
    "functionName": "register3",
    "typeName": null,
    "methodName": null
  }
}
```

### exposeRoute

Optionally, you can expose a route that will return the JSON structure.
This parameter accepts a boolean value.
By default the route is exposed at `GET /json-overview`.

### exposeRouteOptions

You can customize the route's options when `exposeRoute` is set to `true`.
You can provide all the [fastify route's options](https://www.fastify.io/docs/latest/Reference/Routes/#routes-options) except the `handler`.

## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).
