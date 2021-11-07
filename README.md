# fastify-overview

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Get a complete overview of your fastify application!
It gives you a tree structure to understand all the relations between your routes and plugins.

It tracks:

- Server decorators
- ALL the instance hooks

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

```js
const fastify = require('fastify')

async function run() {
  const app = fastify()

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

  // read your application structure
  app.addHook('onReady', function showStructure (done) {
    const appStructure = app.overview()
    console.log(JSON.stringify(appStructure, null, 2))
    done(null)
  })

  await app.listen(3000)
}
run()
```

To use this plugin there are 3 things to know:

1. It starts tracking your application after the `await register()` of the plugin:
  - what happens before, it is **not** tracked.
  - it the `register` is not awaited, the structure will be **not** tracked.
1. The application structure can be accessed **after** the Fastify instance is `ready`. If you try to get it before the `ready` status, you will get an error.
1. The structure tracks hooks' name and decorators' name. If you use arrow functions the structure will be useless/unreadable.

### Structure

The JSON structure returned by the `overview` method is like the following:

```js
{
  "name": "pluginName", // the name of the plugin | app.register(function pluginName (){})
  "children": [ // the children of the fastify instance | instance.register(function subPlugin (){})
    // it contains the same structure we are describing
  ], 
  "decorators": { // all the instance decorators | app.decorate('foo-bar', 42)
    "decorate": [ "foo-bar" ] // the decorators' name
  },
  "hooks": { // all the instance hooks
    "onRequest": [ "hook1" ], // app.addHook('onRequest', function hook1 (){})
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
  }
}
```

Notice that an hook that appears in the parent node, is inherited by the children but it is not listed in the 
children's hooks node.

For example, the previous code returns:

```json
{
  "name": "fastify-overview",
  "children": [
    {
      "name": "register1",
      "children": [
        {
          "name": "register2",
          "children": [],
          "decorators": {
            "decorate": []
          },
          "hooks": {
            "onRequest": [
              "function hook2 () {}"
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
          }
        }
      ],
      "decorators": {
        "decorate": []
      },
      "hooks": {
        "onRequest": [
          "function hook1 () {}"
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
      }
    }
  ],
  "decorators": {
    "decorate": []
  },
  "hooks": {
    "onRequest": [],
    "preParsing": [],
    "preValidation": [],
    "preHandler": [],
    "preSerialization": [],
    "onError": [],
    "onSend": [ "hookRoot" ],
    "onResponse": [],
    "onTimeout": [],
    "onReady": [],
    "onClose": [],
    "onRoute": [],
    "onRegister": []
  }
}
```

## Roadmap

What this plugin should track that is missing:

- [ ] routes
- [ ] errorHandler
- [ ] 404 handler


## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).
